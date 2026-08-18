import Anthropic from '@anthropic-ai/sdk';
import { isParticipantKey } from './actor-id';
import { envInt } from './env-int';
import { env } from '../env';

/**
 * 12강 실습실이 부르는 AI — 비평(`claude review`) · 검증(`npm test`) · 질문(`ask`).
 *
 * 🚨 **여기에 돈을 세는 장치가 없다. 일부러 없다.**(2026-08-15 jery)
 *    지출 상한은 API 키 쪽에 이미 걸려 있고, 앱 안에 천장을 하나 더 두면
 *    그건 **수업을 멈출 수 있는 자리**가 하나 더 생기는 것이다.
 *    「중요한 건 수업이지 비용이 아니다 — API 비용보다 수업에 문제가 생겼을 때의 리스크가 훨씬 크다.」
 *
 * 🚨 그래서 **학생당 호출 횟수 한도를 두지 않는다.** 학생이 수업 도중에
 *    「횟수를 다 썼습니다」를 만나는 것이, 그 학생이 AI 를 몇 번 더 부르는 것보다 나쁘다.
 *    비평이 애매하면 다시 받고, 규칙을 고쳐 몇 번이고 다시 시켜 볼 수 있어야 한다.
 *
 * 🔑 남아 있는 통제는 전부 **돈이 아니라 수업을 지킨다**:
 *      시간 제한 — 매달린 호출이 학생 화면을 얼려 놓지 않게
 *      동시성 큐  — 30명이 동시에 눌러도 서로를 굶기지 않게
 *      이탈 취소  — 나간 학생 몫이 자리를 물고 있지 않게
 *      크기 상한  — 터무니없는 입력·출력으로 한 호출이 몇 분씩 걸리지 않게
 *    이것들이 없으면 «수업이 멈춘다». 있어서 멈추는 게 아니다.
 */
const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

// ── 통제값. 전부 Render env 로 «무배포» 조정한다 ────────────────────────────
// 🚨 여기에 «학생당 몇 번»은 없다. 위 주석 참조 — 일부러 없다.
export const LAB_AI_LIMITS = {
  /** 🚨 매달린 호출이 학생 화면을 얼려 놓지 않게. */
  timeoutMs: envInt('LAB_TIMEOUT_MS', 25000),
  /** 한 호출이 몇 분씩 걸리지 않게 하는 크기 상한(돈이 아니라 시간 때문이다). */
  maxOutputTokens: envInt('LAB_MAX_OUTPUT_TOKENS', 900),
  maxInputChars: envInt('LAB_MAX_INPUT_CHARS', 4000),
  /** 🚨 동시에 몇 개까지 부르는가. 넘치면 큐에서 기다린다(거절하지 않는다 — 수업 중이니까). */
  maxConcurrent: envInt('LAB_MAX_CONCURRENT', 4),
  /** 🚨 대기열 길이 상한. 넘치면 얼려 두지 말고 «몇 초 뒤»라고 바로 답한다. */
  maxQueued: envInt('LAB_MAX_QUEUED', 64),
  /** 🚨 대기 시간 상한. 이보다 오래 기다릴 바에는 정직하게 돌려보낸다. */
  maxWaitMs: envInt('LAB_MAX_WAIT_MS', 20000),
} as const;

export class LabRateLimitError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super('lab_rate_limited');
  }
}
export class LabUnavailableError extends Error {}
/** 학생이 화면을 닫았다. 🔑 «고장»이 아니라 «안 부름»이다 — 로그를 시끄럽게 만들지 않는다. */
export class LabAbortedError extends Error {}

// ── 동시성 큐 ──────────────────────────────────────────────────────────────
//
// 🚨 예전 큐에는 **길이도 대기 시간 상한도 취소도 없었다**(2026-08-15 Codex 리뷰).
//    4슬롯에 60회가 몰리면 마지막 학생은 6분 넘게 화면이 잠긴 채 기다렸고, 페이지를 닫고
//    나간 요청도 큐에 그대로 남아 슬롯과 돈을 썼다. 수업 중에 그건 «고장»으로 읽힌다.
// 🔑 그래서 셋을 둔다: 길이 상한(넘치면 «몇 초 뒤»라고 정직하게 돌려보낸다) ·
//    대기 시간 상한 · 요청이 끊기면 취소.
let active = 0;
type Waiter = { resolve: () => void; reject: (error: Error) => void; timer: NodeJS.Timeout };
const waiting: Waiter[] = [];

function wakeNext(): void {
  const next = waiting.shift();
  if (!next) return;
  clearTimeout(next.timer);
  next.resolve();
}

async function withSlot<T>(run: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  if (active >= LAB_AI_LIMITS.maxConcurrent) {
    // 🚨 무한정 쌓지 않는다. 대기열이 꽉 차면 «지금은 붐빈다, 몇 초 뒤»라고 **바로** 말한다 —
    //    6분을 기다리게 하는 것보다 낫다. 횟수는 아직 안 썼으므로 손해가 없다.
    if (waiting.length >= LAB_AI_LIMITS.maxQueued) {
      throw new LabRateLimitError(Math.ceil(LAB_AI_LIMITS.maxWaitMs / 1000));
    }
    await new Promise<void>((resolve, reject) => {
      const waiter: Waiter = {
        resolve,
        reject,
        timer: setTimeout(() => {
          const at = waiting.indexOf(waiter);
          if (at >= 0) waiting.splice(at, 1);
          reject(new LabRateLimitError(Math.ceil(LAB_AI_LIMITS.maxWaitMs / 1000)));
        }, LAB_AI_LIMITS.maxWaitMs),
      };
      // 🔑 학생이 화면을 닫으면 큐에서 빠진다. 안 빼면 없는 사람 몫으로 돈이 나간다.
      signal?.addEventListener(
        'abort',
        () => {
          const at = waiting.indexOf(waiter);
          if (at >= 0) {
            waiting.splice(at, 1);
            clearTimeout(waiter.timer);
            reject(new LabAbortedError('client_gone'));
          }
        },
        { once: true },
      );
      waiting.push(waiter);
    });
  }
  // 🚨 슬롯을 잡은 뒤에도 이미 나간 사람이면 부르지 않는다.
  if (signal?.aborted) throw new LabAbortedError('client_gone');
  active += 1;
  try {
    return await run();
  } finally {
    active -= 1;
    wakeNext();
  }
}

/** 테스트 전용 — 큐 상태. */
export function __queueDepthForTest(): { active: number; waiting: number } {
  return { active, waiting: waiting.length };
}

const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

type CallResult = { text: string };

/**
 * AI 한 번 부르기 — 한도·예산·시간·환불이 전부 여기 한 자리에 모여 있다.
 *
 * 🚨 `parse` 를 **인자로 받는다.** 예전에는 부른 쪽에서 JSON 을 파싱했는데, 그 실패가 환불 catch
 *    **밖**이라 모델이 깨진 JSON 을 주면 학생 횟수만 닳고 화면은 「돌려드렸습니다」라고 반대로 말했다
 *    (2026-08-15 Codex 리뷰). 파싱까지 이 안에서 해야 «우리 쪽 사정»이 하나로 묶인다.
 * 🚨 입력 길이 상한은 **system 과 user 양쪽**에 건다. user 만 자르면 검증처럼 규칙을 system 에
 *    넣는 경로에서 상한이 통째로 무력해진다.
 */
async function callHaiku<T>(
  system: string,
  user: string,
  parse: (text: string) => T,
  options: { signal?: AbortSignal } = {},
): Promise<T> {
  if (!anthropic) throw new LabUnavailableError('no_api_key');
  return withSlot(async () => {
      const response = await anthropic.messages.create(
        {
          model: HAIKU_MODEL,
          max_tokens: LAB_AI_LIMITS.maxOutputTokens,
          system: system.slice(0, LAB_AI_LIMITS.maxInputChars),
          messages: [{ role: 'user', content: user.slice(0, LAB_AI_LIMITS.maxInputChars) }],
        },
        { timeout: LAB_AI_LIMITS.timeoutMs },
      );
      const text = response.content
        .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim();
      // 🔑 파싱은 여기 안에서 한다 — 실패가 «호출이 잘못됐다»와 같은 자리에서 잡히게.
      return parse(text);
  }, options.signal);
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

export async function reviewDraft(draft: string, signal?: AbortSignal): Promise<LabReview> {
  const trimmed = draft.trim();
  if (trimmed.length < 10) throw new LabUnavailableError('draft_too_short');

  return callHaiku(
    REVIEW_SYSTEM,
    `학생이 쓴 규칙 문서다. 애매한 곳을 지적해라.\n\n---\n${trimmed}\n---`,
    // 🔑 파싱을 여기 넣는 이유 = 실패해도 환불되게(위 주석). 밖에서 하면 횟수만 닳는다.
    (text) => {
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
    },
    { signal },
  );
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

export async function verifyWithRules(rules: string, signal?: AbortSignal): Promise<string[]> {
  const trimmed = rules.trim();
  if (trimmed.length < 10) throw new LabUnavailableError('rules_too_short');

  const outputs: string[] = [];
  for (let i = 0; i < LAB_VERIFY_RUNS; i += 1) {
    const text = await callHaiku(
      `너는 계산 결과를 보고하는 도구다. 아래 "규칙"을 그대로 지켜서 답해라.\n\n규칙:\n${trimmed}`,
      VERIFY_TASK,
      (raw) => raw,
      { signal },
    );
    outputs.push(text);
  }
  return outputs;
}


// ── 2b) 목소리 — 「로컬이 못 알아듣는 자유 문장 해석」 (SDD 결정 6, 2단) ──────────
//
// 🚨 자동 실행 금지 — 제안만 한다. suggest 는 화면이 «쳐 보세요»로 보여 줄 뿐, 실행은 학생 손이다.
// 🚨 학생별 상한·중지 스위치 없음(앱 안 한도 금지 철학). 아래 perMin 은 돈이 아니라 **연타 방지**다
//    (「내 차례」 MYTURN_* 과 같은 결 — 한 학생이 실수로 오토리핏을 눌러도 수업이 안 흔들리게).
const VOICE_SYSTEM = `너는 수업용 터미널 실습실의 안내 목소리다. 학생이 명령 대신 자유 문장을 쳤다.
학생이 무엇을 하려던 건지 해석해, 지금 미션으로 되돌리는 안내를 한다.

절대 지키기:
- 최대 2문장. 존댓말. 비전공자 중학생도 알아듣게.
- 과제(규칙 문서)를 대신 써 주지 마라. 답을 불러 주지 마라.
- 명령을 대신 실행할 수 없다 — 「~를 쳐 보세요」까지만.
- suggest 에는 이 실습실이 아는 명령만 넣어라: help ls cat cd pwd clear npm test edit claude review ask reset jump lab exit. 없으면 null.

출력은 아래 JSON 하나만. 다른 말 금지.
{"reply":["문장1","문장2(없으면 생략)"],"suggest":"명령 또는 null"}`;

export type LabVoice = { reply: string[]; suggest: string | null };

export const VOICE_ACTOR_PER_MIN = envInt('LAB_VOICE_ACTOR_PER_MIN', 10);
const voiceWindow = new Map<string, number[]>();

/** 연타 방지 — 학생 한 명이 분당 몇 번까지. 🚨 횟수 «소진»이 아니다. 1분이 지나면 그냥 다시 된다. */
export function takeVoiceToken(actorId: string, now = Date.now()): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const cutoff = now - 60_000;
  const stamps = (voiceWindow.get(actorId) ?? []).filter((at) => at > cutoff);
  if (stamps.length >= VOICE_ACTOR_PER_MIN) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((stamps[0]! + 60_000 - now) / 1000)) };
  }
  stamps.push(now);
  voiceWindow.set(actorId, stamps);
  return { ok: true };
}

export async function interpretVoice(
  input: { text: string; missionGoal: string; nextCommand: string },
  signal?: AbortSignal,
): Promise<LabVoice> {
  const trimmed = input.text.trim();
  if (trimmed.length < 2) throw new LabUnavailableError('voice_too_short');
  const user = [
    `학생 입력: ${trimmed}`,
    `지금 미션: ${input.missionGoal.slice(0, 200)}`,
    `다음 명령: ${input.nextCommand.slice(0, 40)}`,
  ].join('\n');
  return callHaiku(
    VOICE_SYSTEM,
    user,
    (text) => {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('voice_no_json');
      const parsed = JSON.parse(match[0]) as Partial<{ reply: unknown; suggest: unknown }>;
      const reply = Array.isArray(parsed.reply)
        ? parsed.reply.filter((row): row is string => typeof row === 'string' && row.trim() !== '').slice(0, 2)
        : [];
      if (reply.length === 0) throw new Error('voice_empty_reply');
      // 🚨 제안 명령은 모양을 검사한다 — 모델이 지어낸 이상한 문자열을 화면이 «쳐 보라»고 권하면 안 된다.
      const suggest =
        typeof parsed.suggest === 'string' && /^[a-z][a-z0-9 ./~_-]{0,30}$/.test(parsed.suggest.trim())
          ? parsed.suggest.trim()
          : null;
      return { reply: reply.map((row) => row.slice(0, 160)), suggest };
    },
    { signal },
  );
}

// ── 3) 질문 — 「모르는 걸 물어본다」 ────────────────────────────────────────

const ASK_SYSTEM = `너는 IT 수업의 조교다. 학생이 터미널 실습 중에 물어본다.

- 3문장 이내. 존댓말. 비전공자도 알아들을 수 있게.
- 학생의 과제(규칙 문서)를 대신 써 주지 마라. 방법만 알려 준다.
- 이 실습실이 아는 명령: help ls cat cd pwd clear npm test edit claude review ask reset jump lab exit`;

export async function askQuestion(question: string, signal?: AbortSignal): Promise<string> {
  const trimmed = question.trim();
  if (trimmed.length < 2) throw new LabUnavailableError('question_too_short');
  return callHaiku(ASK_SYSTEM, trimmed, (text) => text, { signal });
}

/** 테스트 전용 — 큐를 비운다. 🚨 운영 코드에서 부르지 말 것. */
export function __resetLabAiForTest(): void {
  active = 0;
  waiting.length = 0;
  voiceWindow.clear();
}
