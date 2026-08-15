import Anthropic from '@anthropic-ai/sdk';
import { isParticipantKey } from './actor-id';
import { budgetVerdict, estimateCostUsd, registerUsageCost } from './ai-spend';
import { envInt } from './vibe-my-turn';
import { env } from '../env';

/**
 * 12강 실습실이 부르는 AI — 비평(`claude review`) · 검증(`npm test`) · 질문(`ask`).
 *
 * 🚨 **이 파일이 실습실의 유일한 지출 자리다.** 돈 천장(`ai-spend` 의 `lab` 주머니) 아래에 있고,
 *    그 위에 층층이 한도가 있다. 셋 중 하나라도 빠지면 사고 때 끊을 것이 없어진다:
 *      1) 돈 — LAB_MONTHLY_BUDGET_USD (전역)
 *      2) 횟수 — 학생당 미션 3회 / 질문 별도. 그리고 전역 분당·일일
 *      3) 시간·크기 — timeout · max_tokens · 입력 길이
 *
 * 🚨 **이 화면에는 로그인이 없다.** 참여 코드만 있으면 들어오고, 토큰을 다시 받으면 학생당 한도가
 *    우회된다. 그래서 학생당 한도는 «정직한 학생이 실수로 낭비하지 않게» 하는 것이고,
 *    **밖에서 두드리는 것을 막는 것은 전역 한도와 돈 천장**이다. 둘을 헷갈리면 안 된다.
 *
 * 🔑 **기술 실패는 환불한다**(§4 회의 결론). 재시도 횟수가 합격률을 좌우하면 평가 설계가 이미 틀린 것이다 —
 *    그래서 «교사가 즉석 추가 지급»은 안 만들고, 우리 잘못으로 실패한 것만 되돌려 준다.
 */

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

// ── 한도. 전부 Render env 로 «무배포» 조정한다 ────────────────────────────
export const LAB_AI_LIMITS = {
  /** 🔑 미션 호출 = 비평 1 + 검증 2 = 3. 화면의 「AI 남은 횟수 3/3」이 이 숫자다. */
  missionCalls: envInt('LAB_MISSION_CALLS', 3),
  /**
   * 🚨 질문은 **별도 한도**다. 같이 세면 「물어본다고 미션 횟수가 닳는» 꼴이 되고,
   *    그러면 학생이 모르는 채로 진행한다 — 물어보는 것이 벌이 되면 안 된다.
   */
  askCalls: envInt('LAB_ASK_CALLS', 5),
  /** 연타 방지. 돈보다 오작동을 막는 값이다. */
  actorPerMin: envInt('LAB_ACTOR_PER_MIN', 8),
  /** 🚨 참여자 토큰이 없는 «공유 통»(자습)은 여럿이 뭉쳐 있다 — 한 명 몫을 적용하면 교실이 잠긴다. */
  sharedPerMin: envInt('LAB_SHARED_PER_MIN', 12),
  sharedDaily: envInt('LAB_SHARED_DAILY_CAP', 400),
  /** 🔑 전역 = 「하루 몇 차시를 받는가」. 30명 × 3회 = 90 → 2,000 이면 하루 20차시 남짓. */
  globalPerMin: envInt('LAB_PER_MIN', 60),
  globalDaily: envInt('LAB_DAILY_CAP', 2000),
  /** 🚨 매달린 호출이 동시성 자리를 물면 30명이 동시에 누르는 수업이 통째로 멈춘다. */
  timeoutMs: envInt('LAB_TIMEOUT_MS', 25000),
  maxOutputTokens: envInt('LAB_MAX_OUTPUT_TOKENS', 900),
  /** 🚨 동시에 몇 개까지 부르는가. 넘치면 큐에서 기다린다(거절하지 않는다 — 수업 중이니까). */
  maxConcurrent: envInt('LAB_MAX_CONCURRENT', 4),
  /** 입력 길이 상한(문자). 규칙 문서 한 장이면 충분하고, 넘으면 잘라서 보낸다. */
  maxInputChars: envInt('LAB_MAX_INPUT_CHARS', 4000),
} as const;

export function labGuardEnabled(): boolean {
  return (process.env.LAB_GUARD_ENABLED ?? '1') !== '0';
}

export class LabRateLimitError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super('lab_rate_limited');
  }
}
export class LabQuotaError extends Error {
  constructor(readonly kind: 'mission' | 'ask') {
    super('lab_quota_exhausted');
  }
}
export class LabBudgetError extends Error {}
export class LabUnavailableError extends Error {}

// ── 세는 통 ────────────────────────────────────────────────────────────────
type Bucket = { count: number; resetAt: number };
const MINUTE = 60_000;
const DAY = 24 * 60 * 60_000;

const minuteBuckets = new Map<string, Bucket>();
const dayBuckets = new Map<string, Bucket>();
/** 🔑 학생별로 «미션 몇 번 · 질문 몇 번» 을 따로 센다. PR5 에서 DB 로 옮긴다. */
const usedCalls = new Map<string, { mission: number; ask: number }>();
let globalMinute: Bucket = { count: 0, resetAt: 0 };
let globalDay: Bucket = { count: 0, resetAt: 0 };

function bump(bucket: Bucket | undefined, now: number, window: number): Bucket {
  if (!bucket || bucket.resetAt <= now) return { count: 1, resetAt: now + window };
  return { count: bucket.count + 1, resetAt: bucket.resetAt };
}

function usedOf(actorId: string) {
  return usedCalls.get(actorId) ?? { mission: 0, ask: 0 };
}

export type LabCallKind = 'mission' | 'ask';

/**
 * 남은 횟수. 🚨 화면은 이 값만 믿는다 — 클라이언트가 자기 상한을 세면 채점 로그와 똑같이 위조된다.
 *
 * 🚨 **학생당 횟수는 «학생 한 명»(참여자 토큰)에게만 건다.** 참여자 토큰이 없는 공유 통(자습)은
 *    학교 공인 IP 하나에 교실 전체가 뭉쳐 있어서, 여기에 «3회»를 걸면 **첫 학생이 다 쓰는 순간
 *    반 전체가 막힌다.** (2026-08-15 실측에서 실제로 그렇게 동작하고 있었다 —
 *    분당·일일만 갈라 두고 횟수는 안 갈랐던 자리다.)
 *    공유 통은 대신 `sharedPerMin`·`sharedDaily` 와 전역 한도·돈 천장이 받는다.
 * 🔑 `Infinity` 를 돌려주지 않고 큰 정수를 쓴다 — JSON 으로 나가면 `Infinity` 는 `null` 이 되고,
 *    화면이 «확인 중»과 헷갈린다.
 */
const SHARED_UNCAPPED = 999;

export function remainingFor(actorId: string): { mission: number; ask: number } {
  const used = usedOf(actorId);
  if (!isParticipantKey(actorId)) {
    return { mission: SHARED_UNCAPPED, ask: SHARED_UNCAPPED };
  }
  return {
    mission: Math.max(0, LAB_AI_LIMITS.missionCalls - used.mission),
    ask: Math.max(0, LAB_AI_LIMITS.askCalls - used.ask),
  };
}

/** 한도를 하나 집는다. 통과하면 «썼다»고 적고, 막히면 던진다. */
function takeToken(actorId: string, kind: LabCallKind): void {
  if (!labGuardEnabled()) return;
  const now = Date.now();

  // 🚨 학생당 횟수는 «학생 한 명»에게만. 공유 통은 remainingFor 가 큰 수를 돌려주므로 여기서 안 막힌다 —
  //    막는 것은 아래의 분당·일일·전역 한도와 돈 천장이다.
  const remaining = remainingFor(actorId);
  if (remaining[kind] <= 0) throw new LabQuotaError(kind);

  const isOne = isParticipantKey(actorId);
  const minuteLimit = isOne ? LAB_AI_LIMITS.actorPerMin : LAB_AI_LIMITS.sharedPerMin;
  const minute = minuteBuckets.get(actorId);
  if (minute && minute.resetAt > now && minute.count >= minuteLimit) {
    throw new LabRateLimitError(Math.ceil((minute.resetAt - now) / 1000));
  }
  if (!isOne) {
    const day = dayBuckets.get(actorId);
    if (day && day.resetAt > now && day.count >= LAB_AI_LIMITS.sharedDaily) {
      throw new LabRateLimitError(Math.ceil((day.resetAt - now) / 1000));
    }
  }
  if (globalMinute.resetAt > now && globalMinute.count >= LAB_AI_LIMITS.globalPerMin) {
    throw new LabRateLimitError(Math.ceil((globalMinute.resetAt - now) / 1000));
  }
  if (globalDay.resetAt > now && globalDay.count >= LAB_AI_LIMITS.globalDaily) {
    throw new LabRateLimitError(Math.ceil((globalDay.resetAt - now) / 1000));
  }

  minuteBuckets.set(actorId, bump(minute, now, MINUTE));
  dayBuckets.set(actorId, bump(dayBuckets.get(actorId), now, DAY));
  globalMinute = bump(globalMinute, now, MINUTE);
  globalDay = bump(globalDay, now, DAY);

  const used = usedOf(actorId);
  usedCalls.set(actorId, { ...used, [kind]: used[kind] + 1 });
}

/**
 * 🔑 기술 실패 환불 — **우리 잘못으로 실패한 것만** 되돌린다.
 * 🚨 학생이 낸 글이 나빠서 나온 결과는 환불하지 않는다. 그건 실패가 아니라 **학습**이다.
 */
function refund(actorId: string, kind: LabCallKind): void {
  const used = usedOf(actorId);
  usedCalls.set(actorId, { ...used, [kind]: Math.max(0, used[kind] - 1) });
}

// ── 동시성 큐 ──────────────────────────────────────────────────────────────
let active = 0;
const waiting: (() => void)[] = [];

async function withSlot<T>(run: () => Promise<T>): Promise<T> {
  if (active >= LAB_AI_LIMITS.maxConcurrent) {
    // 🚨 거절하지 않고 **기다린다.** 수업 중에 «지금 붐빕니다»는 학생에게 «고장»으로 읽힌다.
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  active += 1;
  try {
    return await run();
  } finally {
    active -= 1;
    waiting.shift()?.();
  }
}

const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

type CallResult = { text: string };

/** AI 한 번 부르기 — 한도·예산·시간·환불이 전부 여기 한 자리에 모여 있다. */
async function callHaiku(
  actorId: string,
  kind: LabCallKind,
  system: string,
  user: string,
): Promise<CallResult> {
  if (!anthropic) throw new LabUnavailableError('no_api_key');
  // 🔑 돈을 먼저 본다 — 쓰고 나서 세면 천장을 넘긴 뒤에야 알게 된다.
  if (budgetVerdict('lab') !== 'ok') throw new LabBudgetError('budget_exceeded');

  takeToken(actorId, kind);

  try {
    return await withSlot(async () => {
      const response = await anthropic.messages.create(
        {
          model: HAIKU_MODEL,
          max_tokens: LAB_AI_LIMITS.maxOutputTokens,
          system,
          messages: [{ role: 'user', content: user.slice(0, LAB_AI_LIMITS.maxInputChars) }],
        },
        { timeout: LAB_AI_LIMITS.timeoutMs },
      );
      // 🚨 성공한 뒤에 적는다. 실패한 호출까지 세면 천장이 헛돈다.
      registerUsageCost('lab', estimateCostUsd(HAIKU_MODEL, response.usage, false));
      const text = response.content
        .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim();
      return { text };
    });
  } catch (caught) {
    // 🔑 여기 온 것은 «부르다 실패했다» = 우리 쪽 사정이다. 학생 횟수를 되돌려 준다.
    refund(actorId, kind);
    throw caught;
  }
}

// ── 1) 비평 — 「내 초안의 어디가 애매한가」 ─────────────────────────────────

/**
 * 🚨 **초안을 대신 써 주지 않는다**(§3-나 A안). AI 가 초안을 만들면 다듬지 않고 내도 통과할 수 있어
 *    「규칙을 쓸 줄 아는가」가 평가되지 않는다. 그리고 「AI 에게 발주하기」는 16강이 담당한다.
 * 🔑 그래도 학생이 몰래 「써 줘」 하는 것을 완전히 막지는 못한다. 달라지는 것은 **화면이 무엇을 권하는가**다.
 */
const REVIEW_SYSTEM = `너는 글쓰기 코치다. 학생이 쓴 "규칙 문서"를 읽고 **어디가 애매한지만** 지적한다.

절대 지키기:
- 고쳐 쓴 문장을 주지 마라. 예시 문장도 주지 마라. 학생이 직접 고쳐야 한다.
- 규칙을 대신 만들어 주지 마라.
- 지적은 최대 3개. 각 지적은 "어느 대목이" + "왜 애매한지" 두 조각으로만.
- 잘 쓴 대목이 있으면 1개만 짧게 짚어라.
- 존댓말로, 중학생도 읽을 수 있게. 한 지적은 두 문장 이내.

출력은 아래 JSON 하나만. 다른 말 금지.
{"good":"잘한 점 한 문장(없으면 빈 문자열)","issues":[{"where":"어느 대목","why":"왜 애매한가"}]}`;

export type LabReview = { good: string; issues: { where: string; why: string }[] };

export async function reviewDraft(actorId: string, draft: string): Promise<LabReview> {
  const trimmed = draft.trim();
  if (trimmed.length < 10) throw new LabUnavailableError('draft_too_short');

  const { text } = await callHaiku(
    actorId,
    'mission',
    REVIEW_SYSTEM,
    `학생이 쓴 규칙 문서다. 애매한 곳을 지적해라.\n\n---\n${trimmed}\n---`,
  );
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('review_no_json');
  const parsed = JSON.parse(match[0]) as Partial<LabReview>;
  return {
    good: typeof parsed.good === 'string' ? parsed.good : '',
    issues: Array.isArray(parsed.issues)
      ? parsed.issues
          .filter((issue): issue is { where: string; why: string } =>
            Boolean(issue && typeof issue.where === 'string' && typeof issue.why === 'string'),
          )
          .slice(0, 3)
      : [],
  };
}

// ── 2) 검증 — 「내 규칙대로 두 번 시켜 보기」 ───────────────────────────────

/**
 * 🚨 여기가 12강의 결말이다. 학생이 쓴 규칙을 **진짜 AI 에게 주고 두 번 시킨다.**
 *    글자가 같아져서 통과하는 게 아니라, **형식을 지켜서** 통과한다 — 그래서 두 결과가
 *    서로 달라도 파서는 둘 다 읽는다. 이게 「약속을 지킨다」의 뜻이다.
 * 🔑 판정은 여기서 하지 않는다. 결과 문자열만 돌려주고, **결정적 검사기**가 판정한다
 *    (`client/src/lib/lab-checker.ts`). LLM 이 채점하면 프롬프트 인젝션 자리가 생긴다.
 */
const VERIFY_TASK = `원가 10,000원짜리 물건을 1,000원 깎아 판다. 할인율과 최종가를 답해라.`;

export const LAB_VERIFY_RUNS = 2;

export async function verifyWithRules(actorId: string, rules: string): Promise<string[]> {
  const trimmed = rules.trim();
  if (trimmed.length < 10) throw new LabUnavailableError('rules_too_short');

  const outputs: string[] = [];
  for (let i = 0; i < LAB_VERIFY_RUNS; i += 1) {
    const { text } = await callHaiku(
      actorId,
      'mission',
      `너는 계산 결과를 보고하는 도구다. 아래 "규칙"을 그대로 지켜서 답해라.\n\n규칙:\n${trimmed}`,
      VERIFY_TASK,
    );
    outputs.push(text);
  }
  return outputs;
}

// ── 3) 질문 — 「모르는 걸 물어본다」 ────────────────────────────────────────

const ASK_SYSTEM = `너는 IT 수업의 조교다. 학생이 터미널 실습 중에 물어본다.

- 3문장 이내. 존댓말. 비전공자도 알아들을 수 있게.
- 학생의 과제(규칙 문서)를 대신 써 주지 마라. 방법만 알려 준다.
- 이 실습실이 아는 명령: help ls cat cd pwd clear npm test edit claude review ask reset jump lab exit`;

export async function askQuestion(actorId: string, question: string): Promise<string> {
  const trimmed = question.trim();
  if (trimmed.length < 2) throw new LabUnavailableError('question_too_short');
  const { text } = await callHaiku(actorId, 'ask', ASK_SYSTEM, trimmed);
  return text;
}

/** 테스트 전용 — 통을 비운다. 🚨 운영 코드에서 부르지 말 것. */
export function __resetLabAiForTest(): void {
  minuteBuckets.clear();
  dayBuckets.clear();
  usedCalls.clear();
  globalMinute = { count: 0, resetAt: 0 };
  globalDay = { count: 0, resetAt: 0 };
}

/** 테스트 전용 — 한도만 집어 본다(AI 를 안 부른다). */
export const __takeTokenForTest = takeToken;
export const __refundForTest = refund;
