import { randomUUID } from 'node:crypto';
import type Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdminClient } from './supabase';
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
 * 🔑 **누계는 DB(`architecture_ai_spend`)에 적는다**(2026-08-15). 그 전에는 프로세스 메모리에만 있어서
 *    서버가 다시 뜰 때마다 0 부터 다시 셌다 — Render 는 배포·유휴 복귀마다 뜨므로,
 *    「월 지출 상한」이라 부르던 것이 실제로는 「한 번 뜬 동안 폭주하면 끊는 차단기」였다.
 *
 * 🚨 **DB 가 없거나 안 되면 메모리로 떨어진다. 그리고 그 사실을 말한다** — `spendSnapshot().persisted`.
 *    조용히 떨어지면 「월 상한이 있다」고 믿는 쪽이 속는다. 못 적는 것보다 **못 적는 줄 모르는 것**이 나쁘다.
 * 🚨 DB 쓰기가 느려도 **AI 호출을 막지 않는다.** 메모리에 먼저 더하고 뒤에서 흘려 보낸다 —
 *    수업 중에 장부 때문에 학생이 기다리면 안 된다.
 * 🔑 여러 인스턴스가 동시에 더해도 어긋나지 않게 **증분**만 보낸다(`architecture_ai_spend_add`).
 *    「읽고 → 계산해서 → 덮어쓰기」를 하면 동시에 뜬 두 인스턴스가 서로의 지출을 지운다.
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

type Ledger = {
  monthKey: string;
  /** 이 달의 누계(DB 에서 읽어 온 값 + 그 뒤로 우리가 더한 값). */
  usd: number;
  warned: boolean;
  /** 아직 DB 로 못 보낸 증분. 🔑 보낸 뒤에만 0 으로 만든다 — 실패하면 다음 번에 같이 간다. */
  pendingUsd: number;
  /** 이 달 값을 DB 에서 한 번이라도 읽어 왔는가. */
  loaded: boolean;
  /** 🔑 못 보낸 증분에 붙은 연산 식별자. 재전송 때 **같은 키**로 보내야 두 번 안 세어진다. */
  pendingOpId: string | null;
};

const emptyLedger = (): Ledger => ({ monthKey: '', usd: 0, warned: false, pendingUsd: 0, loaded: false, pendingOpId: null });

const ledgers: Record<SpendBucket, Ledger> = { chat: emptyLedger(), lab: emptyLedger() };

/** DB 에 마지막으로 성공적으로 적은 시각. null 이면 «아직 한 번도 못 적었다». */
let lastPersistedAt: string | null = null;
/**
 * 🚨 **주머니별로** 센다. 공용 깃발로 두면 chat 쓰기 성공이 lab 실패 상태를 지워,
 *    lab 에 미전송 금액이 남아 있는데도 `/health` 가 `persisted:true` 라고 말한다
 *    (2026-08-15 Codex 리뷰). 장부의 정직함을 지키는 것이 이 값의 존재 이유다.
 */
const persistBroken: Record<SpendBucket, boolean> = { chat: false, lab: false };

/** 서버가 뜬 시각. 「언제부터 센 것인가」를 정직하게 말하려고 들고 있는다. */
const countingSince = new Date().toISOString();

function monthKeyOf(at: Date): string {
  return `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * DB 에서 이 달의 누계를 읽어 온다.
 * 🚨 실패해도 던지지 않는다 — 장부를 못 읽었다고 수업이 멈추면 안 된다. 대신 `persisted:false` 로 말한다.
 * 🔑 읽어 온 값에 **우리가 이미 더한 것을 다시 더하지 않는다**(`pendingUsd` 만 얹는다) —
 *    안 그러면 서버가 뜬 직후의 호출이 두 번 세어진다.
 */
async function hydrate(bucket: SpendBucket, monthKey: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    persistBroken[bucket] = true;
    return;
  }
  try {
    const { data, error } = await supabase
      .from('architecture_ai_spend')
      .select('usd')
      .eq('bucket', bucket)
      .eq('month_key', monthKey)
      .maybeSingle();
    if (error) throw error;
    const ledger = ledgers[bucket];
    if (ledger.monthKey !== monthKey) return; // 읽는 사이에 달이 바뀌었다 — 버린다.
    ledger.usd = Number(data?.usd ?? 0) + ledger.pendingUsd;
    ledger.loaded = true;
    persistBroken[bucket] = false;
  } catch (caught) {
    // 🚨 조용히 넘어가지 않는다. 이 줄이 없으면 «월 상한이 있다»고 믿는 채로 메모리로만 돈다.
    persistBroken[bucket] = true;
    console.error(`[ai-spend] hydrate failed (${bucket}/${monthKey})`, caught instanceof Error ? caught.message : caught);
  }
}

/**
 * 아직 못 보낸 증분을 DB 로 흘려 보낸다.
 * 🔑 **증분만** 보낸다 — 여러 인스턴스가 동시에 더해도 서로를 지우지 않게(SQL 의 `..._add` 함수).
 * 🔑 보내기 전에 `pendingUsd` 를 0 으로 만들고, 실패하면 **되돌려 놓는다** — 잃어버리지 않게.
 */
async function flush(bucket: SpendBucket): Promise<void> {
  const ledger = ledgers[bucket];
  const delta = ledger.pendingUsd;
  if (delta <= 0) return;
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    persistBroken[bucket] = true;
    return;
  }
  const monthKey = ledger.monthKey;
  ledger.pendingUsd = 0;
  // 🚨 연산 식별자. DB 는 커밋됐는데 응답만 유실되면 아래 catch 가 delta 를 되돌리고
  //    다음 flush 가 **같은 지출을 또** 더한다 — 멀쩡한데 예산이 조기 차단된다(2026-08-15 Codex 리뷰).
  //    같은 키를 다시 보내면 DB 쪽이 한 번만 적용한다.
  const opId = ledger.pendingOpId ?? randomUUID();
  ledger.pendingOpId = opId;
  try {
    const { error } = await supabase.rpc('architecture_ai_spend_add', {
      p_bucket: bucket,
      p_month_key: monthKey,
      p_delta: delta,
      p_op_id: opId,
    });
    if (error) throw error;
    lastPersistedAt = new Date().toISOString();
    persistBroken[bucket] = false;
    ledger.pendingOpId = null;
  } catch (caught) {
    // 🚨 못 보냈으면 되돌려 놓는다. 안 그러면 지출이 조용히 사라지고 천장이 늦게 선다.
    ledger.pendingUsd += delta;
    persistBroken[bucket] = true;
    console.error(`[ai-spend] flush failed (${bucket})`, caught instanceof Error ? caught.message : caught);
  }
}

function ledgerFor(bucket: SpendBucket, at: Date): Ledger {
  const ledger = ledgers[bucket];
  const key = monthKeyOf(at);
  // 🚨 달이 바뀌면 0 으로. 이게 없으면 「월 예산」이 영원히 누적돼, 언젠가 아무도 모르게 막힌다.
  if (ledger.monthKey !== key) {
    ledger.monthKey = key;
    ledger.usd = 0;
    ledger.warned = false;
    ledger.pendingUsd = 0;
    ledger.pendingOpId = null;
    ledger.loaded = false;
    // 🔑 달이 바뀌면 그 달의 누계를 다시 읽어 온다(다른 인스턴스가 이미 쓰고 있을 수 있다).
    void hydrate(bucket, key);
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
  ledger.pendingUsd += costUsd;
  // 🚨 기다리지 않는다. 장부 쓰기가 느리다고 학생이 기다리면 안 된다 — 뒤에서 흘려 보낸다.
  void flush(bucket);

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
    /**
     * 🚨 **이 값이 참일 때만 «월 상한»이라 부를 수 있다.**
     *    DB 에서 이 달 값을 읽어 왔고, 쓰기가 깨져 있지 않아야 참이다.
     *    거짓이면 지금 세고 있는 것은 «프로세스가 뜬 뒤로»뿐이다 — 읽는 쪽이 그걸 알아야 한다.
     */
    persisted: ledger.loaded && !persistBroken[bucket],
    /** 아직 DB 로 못 보낸 금액. 0 이 아니면 장부가 뒤처져 있다는 뜻이다. */
    pendingUsd: Number(ledger.pendingUsd.toFixed(4)),
    lastPersistedAt,
  };
}

/** 서버가 뜰 때 한 번 — 이 달 누계를 읽어 온다. 🚨 실패해도 서버는 뜬다(수업이 먼저다). */
export function initSpendLedger(at: Date = new Date()): void {
  const key = monthKeyOf(at);
  for (const bucket of Object.keys(ledgers) as SpendBucket[]) {
    ledgers[bucket].monthKey = key;
    void hydrate(bucket, key);
  }
}

/** 테스트 전용 — DB 를 안 쓰는 상태로 둔다. */
export function __markPersistBrokenForTest(broken: boolean, bucket: SpendBucket = 'lab'): void {
  persistBroken[bucket] = broken;
}

/** 테스트 전용 — 장부를 비운다. 🚨 운영 코드에서 부르지 말 것. */
export function __resetSpendForTest(): void {
  for (const bucket of Object.keys(ledgers) as SpendBucket[]) {
    ledgers[bucket] = emptyLedger();
  }
}
