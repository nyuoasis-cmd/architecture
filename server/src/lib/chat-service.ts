import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'node:crypto';
import { getChapterContext, getQaContextById } from '../data/chapter-content';
import { env } from '../env';
import { checkCopyright } from './copyright-index';
import { getSupabaseAdminClient } from './supabase';

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const SONNET_MODEL = 'claude-sonnet-4-6';
const CACHE_TTL_DAYS = 7;
const REQUEST_TIMEOUT_MS = 12_000;
const CHAT_HISTORY_LIMIT = 6;
const UPGRADE_WINDOW = 200;
const USER_MINUTE_LIMIT = 100;
const USER_DAILY_LIMIT = 1000;
const GLOBAL_MINUTE_LIMIT = 1000;
const MAX_CONCURRENT_REQUESTS = 3;
const HAIKU_INPUT_PER_MILLION_USD = 1;
const HAIKU_OUTPUT_PER_MILLION_USD = 5;
const SONNET_INPUT_PER_MILLION_USD = 3;
const SONNET_OUTPUT_PER_MILLION_USD = 15;
const CACHE_WRITE_MULTIPLIER = 1.25;
const CACHE_READ_MULTIPLIER = 0.1;

type ChatRole = 'user' | 'assistant';

export type ChatHistoryEntry = {
  role: ChatRole;
  content: string;
};

export type ChatResult = {
  answer: string;
  cached: boolean;
  model: string;
  blockedCount: number;
  upgradedToSonnet: boolean;
  fallback?: 'cache_only';
};

type ChatMetricsEntry = {
  blocked: boolean;
  reask: boolean;
};

type ChatCacheRow = {
  answer: string;
  blocked_count: number | null;
  model_used: string | null;
  upgraded_to_sonnet: boolean | null;
};

export class RateLimitError extends Error {
  retryAfter: number;

  constructor(retryAfter: number) {
    super('rate_limited');
    this.retryAfter = retryAfter;
  }
}

export class BudgetError extends Error {
  statusCode: number;
  fallback?: 'cache_only';

  constructor(code: 'budget_cache_only' | 'budget_exceeded') {
    super(code);
    this.statusCode = code === 'budget_exceeded' ? 503 : 503;
    this.fallback = code === 'budget_cache_only' ? 'cache_only' : undefined;
  }
}

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number };

const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;
const metricsWindow: ChatMetricsEntry[] = [];
const perMinuteBuckets = new Map<string, { count: number; resetAt: number }>();
const perDayBuckets = new Map<string, { count: number; resetAt: number }>();
const globalBuckets = new Map<string, { count: number; resetAt: number }>();
let activeRequests = 0;

function normalizeQuestion(question: string): string {
  return question.replace(/\s+/g, ' ').trim().toLowerCase();
}

function hashText(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function getBucket(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  windowMs: number,
): { count: number; resetAt: number } {
  const now = Date.now();
  const current = map.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 0, resetAt: now + windowMs };
    map.set(key, next);
    return next;
  }

  return current;
}

function takeRateLimitToken(actorId: string): RateLimitResult {
  const now = Date.now();
  const minuteBucket = getBucket(perMinuteBuckets, actorId, 60_000);
  const dayBucket = getBucket(perDayBuckets, actorId, 86_400_000);
  const globalBucket = getBucket(globalBuckets, String(Math.floor(now / 60_000)), 60_000);

  if (minuteBucket.count >= USER_MINUTE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((minuteBucket.resetAt - now) / 1000) };
  }
  if (dayBucket.count >= USER_DAILY_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((dayBucket.resetAt - now) / 1000) };
  }
  if (globalBucket.count >= GLOBAL_MINUTE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((globalBucket.resetAt - now) / 1000) };
  }

  minuteBucket.count += 1;
  dayBucket.count += 1;
  globalBucket.count += 1;
  return { allowed: true };
}

function extractTextFromResponse(response: Anthropic.Messages.Message): string {
  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('chat_timeout')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

async function readCachedAnswer(qaId: string, questionHash: string): Promise<ChatCacheRow | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const cutoffIso = new Date(Date.now() - CACHE_TTL_DAYS * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from('architecture_chats')
    .select('answer, blocked_count, model_used, upgraded_to_sonnet')
    .eq('qa_id', qaId)
    .eq('question_hash', questionHash)
    .gte('created_at', cutoffIso)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0] as ChatCacheRow;
}

async function persistChatRecord(input: {
  qaId: string;
  actorId: string;
  question: string;
  questionHash: string;
  answer: string;
  cached: boolean;
  blockedCount: number;
  modelUsed: string;
  upgradedToSonnet: boolean;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from('architecture_chats').insert({
    anonymous_id: input.actorId,
    qa_id: input.qaId,
    question_hash: input.questionHash,
    question: input.question,
    answer: input.answer,
    cached: input.cached,
    blocked_count: input.blockedCount,
    model_used: input.modelUsed,
    upgraded_to_sonnet: input.upgradedToSonnet,
  });

  if (error) {
    return;
  }
}

function recordMetrics(entry: ChatMetricsEntry): void {
  metricsWindow.push(entry);
  if (metricsWindow.length > UPGRADE_WINDOW) {
    metricsWindow.shift();
  }
}

function isReaskQuestion(question: string): boolean {
  const normalized = normalizeQuestion(question);
  return ['다시 설명', '이해 안', '다른 비유', '쉽게 설명', '한 번 더'].some((token) => normalized.includes(token));
}

function shouldUpgradeToSonnet(): boolean {
  if (metricsWindow.length < UPGRADE_WINDOW) {
    return false;
  }

  const blockedRate = metricsWindow.filter((item) => item.blocked).length / metricsWindow.length;
  const reaskRate = metricsWindow.filter((item) => item.reask).length / metricsWindow.length;
  return blockedRate >= 0.1 || reaskRate >= 0.25;
}

function estimateRequestCostUsd(
  model: string,
  usage: Anthropic.Messages.Usage,
  cachePrefixUsable: boolean,
): number {
  const inputRate = model === SONNET_MODEL ? SONNET_INPUT_PER_MILLION_USD : HAIKU_INPUT_PER_MILLION_USD;
  const outputRate = model === SONNET_MODEL ? SONNET_OUTPUT_PER_MILLION_USD : HAIKU_OUTPUT_PER_MILLION_USD;
  const inputTokens = usage.input_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? 0;
  const cacheCreationTokens = usage.cache_creation_input_tokens ?? 0;
  const cacheReadTokens = usage.cache_read_input_tokens ?? 0;
  const uncachedInputTokens = Math.max(0, inputTokens - cacheCreationTokens - cacheReadTokens);

  const writeCost = (cacheCreationTokens / 1_000_000) * inputRate * CACHE_WRITE_MULTIPLIER;
  const readCost = (cacheReadTokens / 1_000_000) * inputRate * CACHE_READ_MULTIPLIER;
  const inputCost = (uncachedInputTokens / 1_000_000) * inputRate;
  const outputCost = (outputTokens / 1_000_000) * outputRate;

  if (!cachePrefixUsable) {
    return ((inputTokens / 1_000_000) * inputRate) + outputCost;
  }

  return writeCost + readCost + inputCost + outputCost;
}

let monthlyUsdEstimate = 0;
let hasLoggedBudgetWarning = false;

function assertBudgetAvailable(): void {
  const budgetUsd = env.CHAT_MONTHLY_BUDGET_USD;

  if (monthlyUsdEstimate >= budgetUsd * 1.5) {
    throw new BudgetError('budget_exceeded');
  }

  if (monthlyUsdEstimate >= budgetUsd * 1.2) {
    throw new BudgetError('budget_cache_only');
  }
}

function registerUsageCost(costUsd: number): void {
  monthlyUsdEstimate += costUsd;
  const budgetUsd = env.CHAT_MONTHLY_BUDGET_USD;

  if (!hasLoggedBudgetWarning && monthlyUsdEstimate >= budgetUsd * 0.8) {
    hasLoggedBudgetWarning = true;
    console.warn(`[chat] monthly budget crossed 80%: $${monthlyUsdEstimate.toFixed(2)} / $${budgetUsd.toFixed(2)}`);
  }
}

function buildFollowupInstruction(blockedDrafts: string[]): string {
  if (blockedDrafts.length === 0) {
    return '';
  }

  return `이전에 아래 초안은 원문과 너무 비슷해서 폐기했다. 같은 표현을 반복하지 말고 완전히 다른 비유로 다시 써라.\n${blockedDrafts
    .map((draft, index) => `${index + 1}. ${draft}`)
    .join('\n')}`;
}

function toAnthropicMessages(history: ChatHistoryEntry[], question: string): Anthropic.Messages.MessageParam[] {
  const trimmedHistory = history.slice(-CHAT_HISTORY_LIMIT);
  const messages: Anthropic.Messages.MessageParam[] = trimmedHistory.map((entry) => ({
    role: entry.role,
    content: [{ type: 'text', text: entry.content }],
  }));

  messages.push({
    role: 'user',
    content: [{ type: 'text', text: question }],
  });

  return messages;
}

export async function createChatReply(input: {
  qaId: string;
  question: string;
  history: ChatHistoryEntry[];
  actorId: string;
}): Promise<ChatResult> {
  const qaContext = getQaContextById(input.qaId);
  if (!qaContext) {
    throw new Error('qa_not_found');
  }

  const normalizedQuestion = normalizeQuestion(input.question);
  const questionHash = hashText(`${input.qaId}:${normalizedQuestion}`);
  const cached = await readCachedAnswer(input.qaId, questionHash);

  if (cached) {
    recordMetrics({
      blocked: (cached.blocked_count ?? 0) > 0,
      reask: isReaskQuestion(input.question),
    });

    return {
      answer: cached.answer,
      cached: true,
      model: cached.model_used ?? 'db-cache',
      blockedCount: cached.blocked_count ?? 0,
      upgradedToSonnet: cached.upgraded_to_sonnet ?? false,
    };
  }

  const rateLimit = takeRateLimitToken(input.actorId);
  if (!rateLimit.allowed) {
    throw new RateLimitError(rateLimit.retryAfter);
  }
  assertBudgetAvailable();

  if (!anthropic) {
    throw new Error('anthropic_not_configured');
  }

  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    throw new Error('chat_busy');
  }

  const chapterContext = getChapterContext(input.qaId);
  if (!chapterContext) {
    throw new Error('qa_not_found');
  }

  activeRequests += 1;
  try {
    if (!chapterContext.cachePrefixUsable) {
      console.warn(`[chat] prompt cache skipped for ${input.qaId}: tokenEstimate=${chapterContext.tokenEstimate}`);
    }

    const upgradedToSonnet = shouldUpgradeToSonnet() && monthlyUsdEstimate < env.CHAT_MONTHLY_BUDGET_USD;
    const modelUsed = upgradedToSonnet ? SONNET_MODEL : HAIKU_MODEL;
    const blockedDrafts: string[] = [];
    let blockedCount = 0;
    let answer = '';

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const systemBlocks: Anthropic.TextBlockParam[] = chapterContext.cachePrefixUsable
        ? [
            { type: 'text', text: chapterContext.systemPrompt },
            { type: 'text', text: chapterContext.chapterContext, cache_control: { type: 'ephemeral' } },
          ]
        : [
            { type: 'text', text: chapterContext.systemPrompt },
            { type: 'text', text: chapterContext.chapterContext },
          ];

      const followupInstruction = buildFollowupInstruction(blockedDrafts);
      if (followupInstruction) {
        systemBlocks.push({ type: 'text', text: followupInstruction });
      }

      const response = await withTimeout(
        anthropic.messages.create({
          model: modelUsed,
          max_tokens: 1500,
          temperature: 0.35,
          system: systemBlocks,
          messages: toAnthropicMessages(input.history, input.question),
        }),
        REQUEST_TIMEOUT_MS,
      );

      registerUsageCost(estimateRequestCostUsd(modelUsed, response.usage, chapterContext.cachePrefixUsable));

      answer = extractTextFromResponse(response);
      const copyrightCheck = checkCopyright(answer);
      if (!copyrightCheck.blocked) {
        break;
      }

      blockedCount += 1;
      blockedDrafts.push(answer);
      if (attempt === 2) {
        answer = '지금 답변은 표현이 너무 비슷해질 수 있어서 바로 보여주지 않을게요. 같은 뜻을 더 쉬운 일상 비유로 다시 질문해 주세요.';
      }
    }

    recordMetrics({
      blocked: blockedCount > 0,
      reask: isReaskQuestion(input.question),
    });

    await persistChatRecord({
      qaId: input.qaId,
      actorId: input.actorId,
      question: input.question,
      questionHash,
      answer,
      cached: false,
      blockedCount,
      modelUsed,
      upgradedToSonnet,
    });

    return {
      answer,
      cached: false,
      model: modelUsed,
      blockedCount,
      upgradedToSonnet,
    };
  } finally {
    activeRequests -= 1;
  }
}
