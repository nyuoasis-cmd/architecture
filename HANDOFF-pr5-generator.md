# PR #5 Generator (T2) 핸드오프 — 학생 챗봇 (Claude Haiku 4.5)

> 별도 터미널·별도 세션. 모델: **Codex GPT-5**. 본 파일을 그대로 복붙해 시작.

---

## 0. 필수 컨텍스트

읽기:
1. `/home/claude/architecture/HANDOFF-pr5-planner-spec.md` — **단일 명세 (Sprint Contract 4축, 리스크 16건)**
2. `/home/claude/architecture/SDD-v1.md` §5.4 (모델·캐시·rate limit·Sonnet 승급) §6 (DB) §11.5 §11.6 §11.7 (후처리)
3. `/home/claude/architecture/sql/001_init.sql` — `architecture_chats` 기존 스키마 (제약 `chats_actor_xor`이 있어서 본 PR에서 풀어야 함)
4. `/home/claude/architecture/server/src/{env.ts,index.ts,routes/quiz.ts}` — 기존 서버 패턴 참조 (env 선언, router mount, throttle 패턴)
5. `/home/claude/architecture/client/src/components/learn/ChatPanel.tsx` — 현재 disabled placeholder
6. `/home/claude/architecture/CLAUDE.md`
7. `/home/claude/AGENTS.md` — `codex/<task-id>` 강제 ([feedback_codex-branch-prefix-precedence.md])

읽고 의문 시 코드 작성 전 보고. 명세 이탈 추정 진행 금지.

---

## 1. 환경

- 디렉토리: `/home/claude/architecture`
- main: PR #1 + #4A + #4B 머지 상태 가정. 분기 전 `git pull` 필수
- 분기: `git checkout main && git pull && git checkout -b codex/pr5-chatbot`
- ANTHROPIC_API_KEY: 사용자가 `.env`에 paste 했다고 가정 (env.ts에 이미 zod 정의). 로컬 빌드 검증은 placeholder 키로 OK이지만 A4 curl 검증은 실 키 필요 — 마스터에게 paste-ready 요청 가능

---

## 2. 작성/수정할 파일

```
sql/
└── 002_chat_ops.sql                       # 신규: chats_actor_xor DROP + 운영 컬럼 추가

server/src/
├── data/
│   ├── corpus.ts                          # 신규: 빈 corpus + paste 절차 주석
│   └── chapter-context.ts                  # 신규: 챕터별 system + context (placeholder)
├── lib/
│   ├── anthropic.ts                       # 신규: Anthropic SDK + cache_control
│   ├── copyright-index.ts                  # 신규: 부팅 시 인덱스 빌드 + checkCopyright
│   ├── chat-cache.ts                      # 신규: DB 캐시 lookup/insert (TTL 7일)
│   ├── chat-metrics.ts                     # 신규: ring buffer 200건 + Sonnet 승급
│   └── supabase-admin.ts                   # 신규 또는 기존 활용: service_role 클라이언트
├── routes/
│   └── chat.ts                            # 신규: POST /api/chat
├── env.ts                                  # 수정: CHAT_MONTHLY_BUDGET_USD (선택)
└── index.ts                                # 수정: chatRouter mount + buildCopyrightIndex()

client/src/
├── components/learn/
│   └── ChatPanel.tsx                       # 덮어쓰기: disabled placeholder → 실 채팅
└── lib/
    └── chat-client.ts                      # 신규: sendChat() + abort/timeout
```

`package.json` server deps에 `@anthropic-ai/sdk` 추가. `@supabase/supabase-js`는 PR #1에서 이미 추가됐을 가능성 — 없으면 같이 추가.

---

## 3. 핵심 구현 가이드

### 3.1 마이그 sql/002_chat_ops.sql

```sql
-- PR #5 시점: 익명 IP 기반 챗봇 enable. PR #7 OAuth 후 chats_actor_xor 재강화 예정.

alter table architecture_chats drop constraint if exists chats_actor_xor;

alter table architecture_chats add column if not exists anonymous_id text;
alter table architecture_chats add column if not exists model_used text;
alter table architecture_chats add column if not exists cached boolean default false;
alter table architecture_chats add column if not exists blocked_count int default 0;
alter table architecture_chats add column if not exists upgraded_to_sonnet boolean default false;

create index if not exists architecture_chats_qa_hash_created_idx
  on architecture_chats(qa_id, question_hash, created_at desc);

-- 향후 (PR #7 OAuth 후): 아래로 다시 강화
-- alter table architecture_chats add constraint chats_actor_xor check (
--   (participant_id is not null)::int + (user_id is not null)::int + (anonymous_id is not null)::int = 1
-- );
```

운영 DB 적용은 마스터 paste-ready 후 사용자 직접 실행. 본 PR에서 자동 마이그 X.

### 3.2 Anthropic SDK + cache_control

**`server/src/lib/anthropic.ts`**
```ts
import Anthropic from '@anthropic-ai/sdk';
import { env } from '../env';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export type ChatHistoryMessage = { role: 'user' | 'assistant'; content: string };
export type ChatModel = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6';

export async function chatWithClaude(args: {
  model: ChatModel;
  systemPrompt: string;
  chapterContext: string;
  history?: ChatHistoryMessage[];
  question: string;
  cachePrefixUsable: boolean; // tokenEstimate >= 4096 (Haiku) 또는 2048 (Sonnet)
}): Promise<{ answer: string; usage: { input: number; output: number; cacheReadInput?: number; cacheCreationInput?: number } }> {
  const { model, systemPrompt, chapterContext, history = [], question, cachePrefixUsable } = args;

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = cachePrefixUsable
    ? [
        { type: 'text', text: systemPrompt },
        { type: 'text', text: chapterContext, cache_control: { type: 'ephemeral' } },
      ]
    : [
        { type: 'text', text: `${systemPrompt}\n\n[챕터 컨텍스트]\n${chapterContext}` },
      ];

  const response = await client.messages.create({
    model,
    max_tokens: 400,
    system: systemBlocks,
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: question },
    ],
  });

  const answer = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  const usage = {
    input: response.usage.input_tokens,
    output: response.usage.output_tokens,
    cacheReadInput: (response.usage as any).cache_read_input_tokens,
    cacheCreationInput: (response.usage as any).cache_creation_input_tokens,
  };

  return { answer, usage };
}
```

### 3.3 챕터 컨텍스트 (placeholder)

**`server/src/data/chapter-context.ts`**
```ts
export const SYSTEM_PROMPT = `너는 비전공자에게 IT 개념을 설명하는 친절한 한국어 튜터다. 규칙:
- 답변은 4문장 이하로 짧게.
- 코드/명령어/약어 X. 일상 비유로 설명.
- 모르는 건 "잘 모르겠어요"라고 솔직히.
- 원작자(알렉)의 책 본문을 그대로 복원하지 말고, 자체 표현으로만 설명.

[모범 답변 예시]
1. Q: 프로세스가 뭐예요? → A: 디스크에 저장된 앱 파일이 컴퓨터 메모리에서 "지금 일하고 있는" 상태가 되면 프로세스라고 불러요. 카톡 아이콘은 프로그램, 카톡 켜진 화면은 프로세스에 해당해요.
... (총 5건)

[금지 사례]
- 책 본문 그대로 복원
- 4문장 초과
- 코드 예시 포함
... (총 5건)
`;

// 챕터별 컨텍스트 — PR #5 시점 placeholder. 콘텐츠 PR #2~#11 머지 후 실제 Q&A 본문으로 교체.
const CHAPTER_PLACEHOLDER: Record<number, string> = {
  6: `[6장 컴퓨터 구조와 운영체제 — placeholder]
이 챕터의 Q&A 본문이 이곳에 들어갈 예정. 콘텐츠 PR #2~#11 머지 후 실측 4096+ 토큰 prefix로 교체.`,
  // 1~10 모두 placeholder
};

export function getChapterContext(chapterId: number): {
  systemPrompt: string;
  chapterContext: string;
  tokenEstimate: number;
} {
  const chapterContext = CHAPTER_PLACEHOLDER[chapterId] ?? '';
  // tokenEstimate는 char/3 근사 — 콘텐츠 머지 후 @anthropic-ai/tokenizer로 실측 교체
  const tokenEstimate = Math.ceil((chapterContext.length + SYSTEM_PROMPT.length) / 3);
  return { systemPrompt: SYSTEM_PROMPT, chapterContext, tokenEstimate };
}
```

### 3.4 Corpus + 후처리 인덱스

**`server/src/data/corpus.ts`**
```ts
// PR #5 시점: corpus 빈 상태. 콘텐츠 PR #2~#11 머지 후 normalized 텍스트 paste.
// paste 절차:
//   1. 알렉 『기술노트(With 알렉)』 PDF에서 텍스트 추출 (228p)
//   2. normalize: 줄바꿈 단일 \n, 공백 정규화, 한글 NFC, 양 끝 trim
//   3. 본 파일 CORPUS_RAW에 백틱 문자열로 paste
//   4. 서버 재기동 → buildCopyrightIndex() 자동 재실행 → 차단 활성

export const CORPUS_RAW: string = '';
```

**`server/src/lib/copyright-index.ts`**
```ts
import { createHash } from 'node:crypto';
import { CORPUS_RAW } from '../data/corpus';

let CORPUS_NORMALIZED = '';
let NGRAM_8_HASH_SET: Set<string> = new Set();
let SENTENCE_SET: Set<string> = new Set();

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().normalize('NFC');
}

function tokenize(text: string): string[] {
  // 한국어 + 영어 단어 단위 단순 split (조사 분리는 본 PR 범위 외)
  return text.split(/\s+/).filter(Boolean);
}

function ngramHash(tokens: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++) {
    const h = createHash('sha256').update(tokens.slice(i, i + n).join(' ')).digest('hex');
    out.push(h);
  }
  return out;
}

export function buildCopyrightIndex(): { corpusLength: number; ngramCount: number; sentenceCount: number; durationMs: number } {
  const start = Date.now();
  CORPUS_NORMALIZED = normalize(CORPUS_RAW);
  if (CORPUS_NORMALIZED.length === 0) {
    NGRAM_8_HASH_SET = new Set();
    SENTENCE_SET = new Set();
    return { corpusLength: 0, ngramCount: 0, sentenceCount: 0, durationMs: Date.now() - start };
  }
  const tokens = tokenize(CORPUS_NORMALIZED);
  NGRAM_8_HASH_SET = new Set(ngramHash(tokens, 8));
  SENTENCE_SET = new Set(
    CORPUS_NORMALIZED.split(/[.!?]\s+/).map((s) => normalize(s)).filter((s) => s.length >= 8)
  );
  return {
    corpusLength: CORPUS_NORMALIZED.length,
    ngramCount: NGRAM_8_HASH_SET.size,
    sentenceCount: SENTENCE_SET.size,
    durationMs: Date.now() - start,
  };
}

export type CopyrightVerdict = { blocked: boolean; reason?: 'ngram' | 'substring' | 'sentence' };

export function checkCopyright(answer: string): CopyrightVerdict {
  if (CORPUS_NORMALIZED.length === 0) return { blocked: false };
  const norm = normalize(answer);

  // (c) 문장 exact match
  for (const s of norm.split(/[.!?]\s+/).map(normalize)) {
    if (s.length >= 8 && SENTENCE_SET.has(s)) return { blocked: true, reason: 'sentence' };
  }

  // (b) 80자 이상 substring
  for (let len = Math.min(norm.length, 200); len >= 80; len -= 20) {
    for (let i = 0; i + len <= norm.length; i += 40) {
      if (CORPUS_NORMALIZED.includes(norm.slice(i, i + len))) return { blocked: true, reason: 'substring' };
    }
  }

  // (a) 8-token n-gram
  const tokens = tokenize(norm);
  const hashes = ngramHash(tokens, 8);
  for (const h of hashes) {
    if (NGRAM_8_HASH_SET.has(h)) return { blocked: true, reason: 'ngram' };
  }

  return { blocked: false };
}
```

### 3.5 DB 캐시

**`server/src/lib/supabase-admin.ts`** (없으면 신규)
```ts
import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
```

**`server/src/lib/chat-cache.ts`**
```ts
import { createHash } from 'node:crypto';
import { supabaseAdmin } from './supabase-admin';

const TTL_DAYS = 7;

export function questionHash(qaId: string, question: string): string {
  const norm = question.replace(/\s+/g, ' ').trim().toLowerCase().normalize('NFC');
  return createHash('sha256').update(`${qaId}:${norm}`).digest('hex');
}

export async function lookupCache(qaId: string, hash: string): Promise<{ answer: string; model: string } | null> {
  const cutoff = new Date(Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from('architecture_chats')
    .select('answer, model_used, created_at')
    .eq('qa_id', qaId)
    .eq('question_hash', hash)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return { answer: data.answer, model: data.model_used ?? 'claude-haiku-4-5-20251001' };
}

export async function saveChat(args: {
  qaId: string;
  questionHash: string;
  question: string;
  answer: string;
  modelUsed: string;
  cached: boolean;
  blockedCount: number;
  upgradedToSonnet: boolean;
  anonymousId?: string;
}): Promise<void> {
  const { error } = await supabaseAdmin.from('architecture_chats').insert({
    qa_id: args.qaId,
    question_hash: args.questionHash,
    question: args.question,
    answer: args.answer,
    model_used: args.modelUsed,
    cached: args.cached,
    blocked_count: args.blockedCount,
    upgraded_to_sonnet: args.upgradedToSonnet,
    anonymous_id: args.anonymousId ?? null,
  });
  if (error) console.error('[chat] saveChat error', error);
}
```

### 3.6 메트릭 + Sonnet 승급

**`server/src/lib/chat-metrics.ts`**
```ts
const WINDOW = 200;
type Sample = { reaskHit: boolean; blocked: boolean };
const buffer: Sample[] = [];

const REASK_PATTERNS = [/다시\s*설명/, /이해\s*안/, /다른\s*비유/, /무슨\s*말/, /모르겠/];

export function isReask(question: string): boolean {
  return REASK_PATTERNS.some((re) => re.test(question));
}

export function recordSample(s: Sample) {
  buffer.push(s);
  if (buffer.length > WINDOW) buffer.shift();
}

export function shouldUpgradeToSonnet(): boolean {
  if (buffer.length < 50) return false; // 표본 부족
  const reaskRate = buffer.filter((s) => s.reaskHit).length / buffer.length;
  const blockedRate = buffer.filter((s) => s.blocked).length / buffer.length;
  return reaskRate >= 0.25 || blockedRate >= 0.10;
}
```

### 3.7 server route — POST /api/chat

**`server/src/routes/chat.ts`**
```ts
import { NextFunction, Request, Response, Router } from 'express';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { chatWithClaude, type ChatModel } from '../lib/anthropic';
import { lookupCache, questionHash, saveChat } from '../lib/chat-cache';
import { isReask, recordSample, shouldUpgradeToSonnet } from '../lib/chat-metrics';
import { checkCopyright } from '../lib/copyright-index';
import { getChapterContext } from '../data/chapter-context';

const router = Router();

const chatSchema = z.object({
  qaId: z.string().min(1).max(40),
  question: z.string().min(1).max(500),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).max(20).optional(),
});

// IP rate limit: 분당 100회, 일당 1000회
type Bucket = { minute: { count: number; resetAt: number }; day: { count: number; resetAt: number } };
const ipBuckets = new Map<string, Bucket>();
const MIN_LIMIT = 100;
const DAY_LIMIT = 1000;

// 서버 전역 분당 1000회 세마포어 (학교 NAT 100명 × 분당 5회 가정 + 헤드룸)
let globalMinuteCount = 0;
let globalMinuteResetAt = Date.now() + 60_000;
const GLOBAL_MIN_LIMIT = 1000;

// 월 예산 ladder (in-memory)
let monthlyUsdEstimate = 0;
let monthResetAt = nextMonthStart();
function nextMonthStart() {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + 1, 1);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

function ipKey(req: Request) {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function checkRateLimits(req: Request, res: Response): { ok: true } | { ok: false; status: number; body: any; retryAfter?: number } {
  const now = Date.now();
  if (now > globalMinuteResetAt) { globalMinuteCount = 0; globalMinuteResetAt = now + 60_000; }
  if (now > monthResetAt) { monthlyUsdEstimate = 0; monthResetAt = nextMonthStart(); }

  // 월 예산 ladder
  const budgetUsd = Number(process.env.CHAT_MONTHLY_BUDGET_USD ?? 173);
  if (monthlyUsdEstimate > budgetUsd * 1.5) {
    return { ok: false, status: 503, body: { error: 'budget_exceeded', message: '월 예산 초과로 챗봇이 일시 비활성화되었습니다.' } };
  }
  if (monthlyUsdEstimate > budgetUsd * 1.2) {
    // 신규 호출 차단 — DB 캐시 only는 호출자가 처리
    return { ok: false, status: 503, body: { error: 'budget_threshold_120', message: 'DB 캐시만 응답 가능합니다.', cache_only: true } };
  }

  // 글로벌
  if (globalMinuteCount >= GLOBAL_MIN_LIMIT) {
    return { ok: false, status: 429, body: { error: 'global_rate_limit', message: '서버가 잠시 혼잡합니다.' }, retryAfter: 60 };
  }

  // IP
  const key = ipKey(req);
  const b = ipBuckets.get(key) ?? { minute: { count: 0, resetAt: now + 60_000 }, day: { count: 0, resetAt: now + 24*60*60_000 } };
  if (now > b.minute.resetAt) { b.minute = { count: 0, resetAt: now + 60_000 }; }
  if (now > b.day.resetAt) { b.day = { count: 0, resetAt: now + 24*60*60_000 }; }
  if (b.minute.count >= MIN_LIMIT) {
    return { ok: false, status: 429, body: { error: 'rate_limited', message: '잠시 후 다시 시도해주세요.' }, retryAfter: Math.ceil((b.minute.resetAt - now)/1000) };
  }
  if (b.day.count >= DAY_LIMIT) {
    return { ok: false, status: 429, body: { error: 'daily_limit', message: '오늘의 챗봇 사용량을 모두 사용했습니다.' }, retryAfter: Math.ceil((b.day.resetAt - now)/1000) };
  }
  b.minute.count += 1;
  b.day.count += 1;
  ipBuckets.set(key, b);
  globalMinuteCount += 1;
  return { ok: true };
}

function chapterIdFromQaId(qaId: string): number | null {
  const m = /^ch(\d{2})_/.exec(qaId);
  return m ? parseInt(m[1], 10) : null;
}

// 비용 추정 (cache hit 가정 평균 ~$0.0021/호출)
function estimateUsdCost(usage: { input: number; output: number; cacheReadInput?: number; cacheCreationInput?: number }, model: ChatModel): number {
  const m = model === 'claude-sonnet-4-6' ? 3 : 1;
  const inUsd = (usage.input * 1.0 + (usage.cacheReadInput ?? 0) * 0.1 + (usage.cacheCreationInput ?? 0) * 1.25) / 1_000_000;
  const outUsd = usage.output * 5.0 / 1_000_000;
  return (inUsd + outUsd) * m;
}

router.post('/', async (req: Request, res: Response) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    return;
  }
  const { qaId, question, history = [] } = parsed.data;

  const chapterId = chapterIdFromQaId(qaId);
  if (chapterId === null) { res.status(404).json({ error: 'qa_not_found', qaId }); return; }
  const ctx = getChapterContext(chapterId);
  if (!ctx.chapterContext) { res.status(404).json({ error: 'qa_not_found', qaId }); return; }

  const rl = checkRateLimits(req, res);
  if (!rl.ok) {
    if (rl.retryAfter) res.setHeader('Retry-After', String(rl.retryAfter));
    res.status(rl.status).json(rl.body);
    return;
  }

  const hash = questionHash(qaId, question);

  // DB 캐시 lookup
  const cached = await lookupCache(qaId, hash);
  if (cached) {
    res.json({ answer: cached.answer, cached: true, model: cached.model, blocked_count: 0 });
    return;
  }

  // budget 120% 시 cache-only 라면 cached 없을 때 503 cache_only 응답
  // (위 checkRateLimits에서 이미 cache_only 분기 — 여기까지 왔으면 budget 정상)

  // Sonnet 승급
  const model: ChatModel = shouldUpgradeToSonnet() ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';
  const cachePrefixUsable = ctx.tokenEstimate >= (model === 'claude-sonnet-4-6' ? 2048 : 4096);
  if (!cachePrefixUsable) console.warn(`[chat] cache prefix below threshold (qaId=${qaId}, est=${ctx.tokenEstimate})`);

  const anonymousId = createHash('sha256').update(ipKey(req) + (req.get('user-agent') ?? '')).digest('hex').slice(0, 16);

  // Claude 호출 + 후처리 (max 2회 재생성)
  let blockedCount = 0;
  let answer = '';
  let usage: any = null;
  const negativeExamples: string[] = [];
  const TIMEOUT_MS = 12_000;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const sysWithNeg = negativeExamples.length
        ? `${ctx.systemPrompt}\n\n[직전 차단된 답변 — 이 패턴 피하기]\n${negativeExamples.join('\n---\n')}`
        : ctx.systemPrompt;
      const resp = await chatWithClaude({
        model,
        systemPrompt: sysWithNeg,
        chapterContext: ctx.chapterContext,
        history,
        question,
        cachePrefixUsable,
      });
      answer = resp.answer; usage = resp.usage;
      const verdict = checkCopyright(answer);
      if (!verdict.blocked) break;
      blockedCount += 1;
      negativeExamples.push(answer);
      if (attempt === 2) {
        clearTimeout(t);
        recordSample({ reaskHit: isReask(question), blocked: true });
        await saveChat({ qaId, questionHash: hash, question, answer: '[차단됨]', modelUsed: model, cached: false, blockedCount, upgradedToSonnet: model === 'claude-sonnet-4-6', anonymousId });
        res.status(200).json({
          answer: '비슷한 다른 비유로 다시 질문해 주시겠어요? (저작권 보호로 답변이 차단되었어요)',
          cached: false, model, blocked_count: blockedCount, fallback: 'blocked',
        });
        return;
      }
    }
  } catch (err: any) {
    clearTimeout(t);
    const isAbort = err?.name === 'AbortError';
    res.status(isAbort ? 504 : 502).json({ error: isAbort ? 'timeout' : 'upstream_error', message: '잠시 후 다시 시도해주세요.' });
    return;
  }
  clearTimeout(t);

  // 비용 누적
  monthlyUsdEstimate += estimateUsdCost(usage, model);

  recordSample({ reaskHit: isReask(question), blocked: false });
  await saveChat({ qaId, questionHash: hash, question, answer, modelUsed: model, cached: false, blockedCount, upgradedToSonnet: model === 'claude-sonnet-4-6', anonymousId });
  res.json({ answer, cached: false, model, blocked_count: blockedCount });
});

export default router;
```

### 3.8 server/src/index.ts mount + index build

```ts
import chatRouter from './routes/chat';
import { buildCopyrightIndex } from './lib/copyright-index';

// ... 기존 ...
app.use('/api/chat', chatRouter);

// 부팅 시 후처리 인덱스 빌드 (1회)
const idx = buildCopyrightIndex();
console.log(`[chat] copyright index built — corpus=${idx.corpusLength}ch, ngrams=${idx.ngramCount}, sentences=${idx.sentenceCount}, ${idx.durationMs}ms`);
if (idx.corpusLength === 0) console.log('[chat] corpus empty — paste server/src/data/corpus.ts after content PRs merged');
```

### 3.9 client chat-client.ts

**`client/src/lib/chat-client.ts`**
```ts
export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export type ChatResponse = { answer: string; cached: boolean; model: string; blocked_count: number; fallback?: string };
export type ChatError =
  | { kind: 'rate_limited'; retryAfter?: number; message: string }
  | { kind: 'daily_limit'; message: string }
  | { kind: 'budget'; message: string }
  | { kind: 'timeout'; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'server'; message: string };

export async function sendChat(args: { qaId: string; question: string; history: ChatMessage[]; signal?: AbortSignal }): Promise<{ ok: true; data: ChatResponse } | { ok: false; error: ChatError }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qaId: args.qaId, question: args.question, history: args.history }),
      signal: args.signal ?? ctrl.signal,
    });
    if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      const isDaily = body?.error === 'daily_limit';
      return { ok: false, error: { kind: isDaily ? 'daily_limit' : 'rate_limited', message: body?.message ?? '잠시 후 다시 시도해주세요.', retryAfter: Number(res.headers.get('Retry-After') ?? 0) || undefined } };
    }
    if (res.status === 503) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: { kind: 'budget', message: body?.message ?? '챗봇이 일시 비활성화되었습니다.' } };
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: { kind: 'server', message: body?.message ?? '서버 오류' } };
    }
    const data = (await res.json()) as ChatResponse;
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: { kind: e?.name === 'AbortError' ? 'timeout' : 'network', message: e?.name === 'AbortError' ? '응답 시간 초과' : '네트워크 오류' } };
  } finally {
    clearTimeout(t);
  }
}
```

### 3.10 ChatPanel 실 구현

**`client/src/components/learn/ChatPanel.tsx`**
```tsx
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom'; // 또는 wouter — 프로젝트에 맞춰
import { sendChat, type ChatMessage } from '../../lib/chat-client';

export default function ChatPanel() {
  const { qaId } = useParams<{ qaId?: string }>();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMessages([]); setError(null); }, [qaId]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading]);

  async function send() {
    const q = input.trim();
    if (!q || !qaId || loading) return;
    setError(null);
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    const result = await sendChat({ qaId, question: q, history: messages });
    setLoading(false);
    if (result.ok) {
      setMessages((m) => [...m, { role: 'assistant', content: result.data.answer }]);
    } else {
      setError(result.error.message);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex-shrink-0 border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-[13px] font-medium">AI 챗봇</h2>
        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>궁금한 점을 물어보세요</p>
      </header>

      <div ref={listRef} className="scrollbar-hide flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && !loading && (
          <div className="bubble-bot max-w-[90%]">
            옆 패널의 시연을 먼저 보고, 부족한 부분은 자유롭게 질문해주세요.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'bubble-user self-end max-w-[90%]' : 'bubble-bot max-w-[90%]'}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="bubble-bot max-w-[90%]" aria-live="polite">
            <span className="dot-flash">···</span>
          </div>
        )}
        {error && (
          <div role="status" className="rounded-md bg-red-50 px-3 py-2 text-xs" style={{ color: 'var(--color-danger, #b91c1c)' }}>
            {error}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-[var(--color-border)] p-3">
        <textarea
          className="w-full resize-none rounded-[10px] bg-stone-100 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          placeholder="질문해보세요. (Enter 전송, Shift+Enter 줄바꿈)"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
          aria-label="챗봇 질문 입력"
        />
        <div className="mt-2 flex justify-end">
          <button onClick={send} disabled={loading || !input.trim()} className="btn-primary text-[12px] px-3 py-1.5" aria-label="질문 전송">
            {loading ? '응답 중...' : '전송'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

`bubble-user` 클래스 — `index.css`에 추가 (없으면):
```css
.bubble-user { background: var(--color-accent-soft, #eef2ff); color: var(--color-text); border-radius: 14px 14px 4px 14px; padding: 8px 12px; font-size: 13px; line-height: 1.5; }
```

`--color-accent-soft`가 design-tokens에 없으면 인라인 hex 대신 `--color-bg-input` 또는 stone-100 같은 기존 토큰 사용 ([feedback_token-definition-vs-usesite.md] 적용 — 신규 토큰 추가는 shared/design-tokens.css 정합).

`dot-flash` CSS 애니메이션 (loading)도 `index.css`에 추가.

---

## 4. 검증 (push 전 자체)

§2.1 C1~C18 + §2.2 A1~A10 모두 직접 확인. 특히:
- A4: 실 ANTHROPIC_API_KEY 가 `.env`에 있어야 동작. 없으면 마스터에 paste-ready 요청
- A5: 같은 질문 두 번째 호출 응답이 `cached:true`
- A8: bash loop 31회 호출
- I7: `npm run build` 후 `grep -r "sk-ant-\|ANTHROPIC_API_KEY" client/dist` → 0건

부팅 로그에 `copyright index built — corpus=0ch, ngrams=0, sentences=0, Xms` + `corpus empty — paste server/src/data/corpus.ts after content PRs merged` 두 줄 표시 확인.

---

## 5. 커밋·PR

```bash
git add client/ server/ sql/
git status   # 신규 디렉토리 누락 확인 (lib/, data/, routes/)
git commit -m "feat: 학생 챗봇 (Claude Haiku 4.5 + prompt cache + DB cache + 후처리 인프라)"
git push -u origin codex/pr5-chatbot
gh pr create --base main --head codex/pr5-chatbot --title "PR #5 학생 챗봇 (Claude Haiku 4.5)" --body "..."
```

PR body Test plan에 §2.2 A1~A10 + §2.3 V1~V7 + §2.4 I1~I15 = **32건** 체크리스트 동봉.

자체 보고 ([feedback_generator-push-explicit-report.md] 준수):
- §2.1 C1~C18 + §2.2 A1~A10 PASS/FAIL 표
- **commit SHA 명시** (`git log -1 --format=%H`)
- **push 완료 명시** (`git log origin/codex/pr5-chatbot -1` 결과 출력)
- 부팅 로그 2줄 (corpus empty 안내)
- (참고) §2.4 I7 build dist grep 결과
- 알려진 미해결 이슈 (예: corpus 빈 상태 시 후처리 PASS 자동 — 콘텐츠 머지 후 활성)

Master(T1) 회신 후 T3·T4 동시 진행.
