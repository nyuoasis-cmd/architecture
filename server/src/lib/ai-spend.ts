import type Anthropic from '@anthropic-ai/sdk';
import { env } from '../env';

/**
 * AI 지출 장부 — 「얼마나 썼는가」를 세고, 천장에 닿으면 막는다.
 *
 * 🚨 왜 chat-service 밖으로 꺼냈나(2026-08-15, 에픽 2/5): 지출 계산이 챗봇 안에만 있어서
 *    「내 차례」(`/api/vibe/my-turn`)가 부르는 AI 는 **어떤 장부에도 안 잡혔다.** 즉 그 라우트에는
 *    호출 횟수 한도(MYTURN_*)만 있고 **돈 천장이 없었다** — 한도를 올리는 것이 곧 상한을 올리는 일이었다.
 *    실습실(PR4)이 같은 자리에 AI 를 더 붙이므로, 붙이기 전에 장부부터 공용으로 만든다.
 *
 * 🚨 **주머니를 나눈다**(`chat` / `lab`). 하나로 합치면 챗봇이 많이 쓴 달에 실습이 막히고,
 *    반대도 마찬가지다 — 어느 쪽이 왜 막혔는지도 알 수 없다.
 *
 * 🚨 **이 장부는 프로세스 안에만 있다.** 서버가 다시 뜨면 0 부터 다시 센다(Render 는 배포·유휴
 *    복귀 때마다 다시 뜬다). 그래서 이것은 «한 달 동안 절대 이 금액을 못 넘는다»는 보증이 아니라
 *    **«한 번 뜬 동안 폭주하면 끊는다»는 차단기**다. 진짜 월 상한은 DB 에 적어야 한다 —
 *    그건 이 PR 에서 하지 않는다(결정 대기, docs 참조).
 *    🔑 그 대신 이름이 거짓말하지 않게 `spendSnapshot()` 이 «언제부터 센 것인가»를 같이 말한다.
 * 🔑 달이 바뀌면 0 으로 되돌린다 — 예전 코드에는 이것도 없어서 「월 예산」이 **영원히 누적**됐다.
 */

export type SpendBucket = 'chat' | 'lab';

export type BudgetVerdict = 'ok' | 'cache_only' | 'blocked';

/** 예산 대비 어느 선을 넘으면 무엇을 하는가. chat-service 가 쓰던 값 그대로 옮겼다. */
const CACHE_ONLY_RATIO = 1.2;
const BLOCKED_RATIO = 1.5;
const WARN_RATIO = 0.8;

// Haiku 4.5 / Sonnet 요율(USD per 1M tokens). 🚨 모델을 바꾸면 여기도 같이 바꾼다 —
// 안 바꾸면 장부가 조용히 틀린 금액을 세고, 천장이 실제와 다른 자리에 선다.
const HAIKU_INPUT_PER_MILLION_USD = 1;
const HAIKU_OUTPUT_PER_MILLION_USD = 5;
const SONNET_INPUT_PER_MILLION_USD = 3;
const SONNET_OUTPUT_PER_MILLION_USD = 15;
const CACHE_WRITE_MULTIPLIER = 1.25;
const CACHE_READ_MULTIPLIER = 0.1;

const SONNET_PREFIX = 'claude-sonnet';

function ratesFor(model: string): { input: number; output: number } {
  return model.startsWith(SONNET_PREFIX)
    ? { input: SONNET_INPUT_PER_MILLION_USD, output: SONNET_OUTPUT_PER_MILLION_USD }
    : { input: HAIKU_INPUT_PER_MILLION_USD, output: HAIKU_OUTPUT_PER_MILLION_USD };
}

/**
 * 이번 호출이 얼마였는가(추정).
 * 🔑 캐시를 쓴 호출은 읽기가 싸고 쓰기가 비싸다 — 그걸 안 갈라 세면 캐시가 잘 들을수록
 *    장부가 실제보다 비싸게 잡혀서, 멀쩡한데 천장에 닿는다.
 */
export function estimateCostUsd(
  model: string,
  usage: Pick<
    Anthropic.Messages.Usage,
    'input_tokens' | 'output_tokens' | 'cache_creation_input_tokens' | 'cache_read_input_tokens'
  >,
  cachePrefixUsable: boolean,
): number {
  const { input: inputRate, output: outputRate } = ratesFor(model);
  const inputTokens = usage.input_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? 0;
  const outputCost = (outputTokens / 1_000_000) * outputRate;

  if (!cachePrefixUsable) {
    return (inputTokens / 1_000_000) * inputRate + outputCost;
  }

  const cacheCreationTokens = usage.cache_creation_input_tokens ?? 0;
  const cacheReadTokens = usage.cache_read_input_tokens ?? 0;
  const uncachedInputTokens = Math.max(0, inputTokens - cacheCreationTokens - cacheReadTokens);

  return (
    (cacheCreationTokens / 1_000_000) * inputRate * CACHE_WRITE_MULTIPLIER +
    (cacheReadTokens / 1_000_000) * inputRate * CACHE_READ_MULTIPLIER +
    (uncachedInputTokens / 1_000_000) * inputRate +
    outputCost
  );
}

type Ledger = { monthKey: string; usd: number; warned: boolean };

const ledgers: Record<SpendBucket, Ledger> = {
  chat: { monthKey: '', usd: 0, warned: false },
  lab: { monthKey: '', usd: 0, warned: false },
};

/** 서버가 뜬 시각. 「언제부터 센 것인가」를 정직하게 말하려고 들고 있는다. */
const countingSince = new Date().toISOString();

function monthKeyOf(at: Date): string {
  return `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, '0')}`;
}

function ledgerFor(bucket: SpendBucket, at: Date): Ledger {
  const ledger = ledgers[bucket];
  const key = monthKeyOf(at);
  // 🚨 달이 바뀌면 0 으로. 이게 없으면 「월 예산」이 영원히 누적돼, 언젠가 아무도 모르게 막힌다.
  if (ledger.monthKey !== key) {
    ledger.monthKey = key;
    ledger.usd = 0;
    ledger.warned = false;
  }
  return ledger;
}

export function budgetUsdFor(bucket: SpendBucket): number {
  return bucket === 'chat' ? env.CHAT_MONTHLY_BUDGET_USD : env.LAB_MONTHLY_BUDGET_USD;
}

/**
 * 지금 이 주머니로 호출해도 되는가.
 * - `ok` 그대로 부른다
 * - `cache_only` 캐시로 답할 수 있는 것만 (챗봇이 쓰던 중간 단계)
 * - `blocked` 부르지 않는다
 */
export function budgetVerdict(bucket: SpendBucket, at: Date = new Date()): BudgetVerdict {
  const ledger = ledgerFor(bucket, at);
  const budgetUsd = budgetUsdFor(bucket);
  if (ledger.usd >= budgetUsd * BLOCKED_RATIO) return 'blocked';
  if (ledger.usd >= budgetUsd * CACHE_ONLY_RATIO) return 'cache_only';
  return 'ok';
}

/** 쓴 만큼 적는다. 🚨 호출이 **성공한 뒤에** 부른다 — 실패한 호출까지 세면 천장이 헛돈다. */
export function registerUsageCost(bucket: SpendBucket, costUsd: number, at: Date = new Date()): void {
  if (!Number.isFinite(costUsd) || costUsd <= 0) return;
  const ledger = ledgerFor(bucket, at);
  ledger.usd += costUsd;

  const budgetUsd = budgetUsdFor(bucket);
  if (!ledger.warned && ledger.usd >= budgetUsd * WARN_RATIO) {
    ledger.warned = true;
    console.warn(
      `[ai-spend] ${bucket} monthly budget crossed ${WARN_RATIO * 100}%: $${ledger.usd.toFixed(2)} / $${budgetUsd.toFixed(2)}`,
    );
  }
}

/** 이 주머니로 지금까지 쓴 추정 금액(USD). 🔑 프로세스가 뜬 뒤로 센 값이다. */
export function spentUsdFor(bucket: SpendBucket, at: Date = new Date()): number {
  return ledgerFor(bucket, at).usd;
}

/**
 * 밖에 말할 때 쓰는 요약.
 * 🚨 «얼마 썼다»만 말하지 않는다. **언제부터 센 것인지**를 같이 말한다 — 프로세스가 다시 뜨면
 *    0 부터 다시 세기 때문에, 그 사실을 빼고 말하면 읽는 쪽이 «이번 달 총액»으로 오해한다.
 */
export function spendSnapshot(bucket: SpendBucket, at: Date = new Date()) {
  const ledger = ledgerFor(bucket, at);
  return {
    bucket,
    monthKey: ledger.monthKey,
    spentUsd: Number(ledger.usd.toFixed(4)),
    budgetUsd: budgetUsdFor(bucket),
    verdict: budgetVerdict(bucket, at),
    countingSince,
    /** 🚨 프로세스 안에만 있는 장부다. 이 값이 false 가 되는 날 «월 상한»이라 불러도 된다. */
    persisted: false,
  };
}

/** 테스트 전용 — 장부를 비운다. 🚨 운영 코드에서 부르지 말 것. */
export function __resetSpendForTest(): void {
  for (const bucket of Object.keys(ledgers) as SpendBucket[]) {
    ledgers[bucket] = { monthKey: '', usd: 0, warned: false };
  }
}
