import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { env } from '../env';

// «내 차례» — 학생이 쓴 부탁문을 Haiku 4.5로 실제 실행해, 다섯 칸 중
// «학생이 정한 칸 / AI가 대신 정하게 되는 칸»을 판정한다.
// 모델 = Haiku 4.5 재사용 (jery 승인 2026-08-10, 기존 챗봇과 동일 모델).
// 호출 통제: 학생(IP) 쿨타임 5분 · 학생 하루 12회 · 전체 분당 60 · 전체 하루 500.

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

// 호출 통제 값 — 전부 Render env 로 «무배포» 조정한다(대규모 수업 전 상향 → 수업 후 원복).
// 🚨 코드 상수로만 두면 상향에 배포가 필요해서, 수업 당일 막혔을 때 손쓸 수가 없다.
//    기본값은 30명 1차시(문항 2개)를 기준으로 잡았다 — 학생당 12회는 넉넉하고,
//    전역 일일 500 은 30명 × 2문 × 재시도 여유(≈8배) 안에 든다.
// 🚨 이 값들이 바뀌면 /health 의 classCheck 선언도 같이 움직여야 한다(둘의 정합은 테스트가 지킨다).
function envInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export const MY_TURN_LIMITS = {
  cooldownSeconds: envInt('MYTURN_COOLDOWN_SEC', 300),
  actorDaily: envInt('MYTURN_ACTOR_DAILY_CAP', 12),
  globalPerMin: envInt('MYTURN_PER_MIN', 60),
  globalDaily: envInt('MYTURN_DAILY_CAP', 500),
};

/**
 * 호출 통제 스위치 — 0 이면 통제를 끈다.
 *
 * 🚨 2026-08-11 jery 결정(2차): **기본값을 «켬» 으로 되돌린다.** 「내 차례」를 한 문항 시범에서
 *    여러 문항으로 넓히기로 하면서, 상한 없이 넓히면 지출이 열려 버리기 때문이다. 숫자는 그대로
 *    두고(전역 하루 500 = 30명×2문 기준 8차시) 스위치만 켠다.
 *    🔑 되돌리는 길은 그대로다 — Render env 에 `MYTURN_GUARD_ENABLED=0` 한 줄이면 **배포 없이**
 *    꺼지고, 한도 숫자도 MYTURN_* env 로 그 자리에서 올린다(대규모 수업 전 상향 → 수업 후 원복).
 *
 * 🚨 1차 결정(2026-08-11 오전)은 «기본 끔» 이었다. 그때는 「내 차례」가 한 문항뿐이라 상한이
 *    사실상 의미가 없었다. 문항이 늘면 같은 스위치의 뜻이 달라진다 — 결정이 바뀐 게 아니라
 *    전제가 바뀐 것이다.
 *
 * 🔑 끈 상태에서 /health 는 capPolicy 를 'none' 으로 정직하게 말한다(classCheck.ts).
 *    켜 놓고 «없다» 고 말하거나 꺼 놓고 «있다» 고 말하면, 캡을 보고 여유를 계산하는 쪽이 속는다.
 * 🚨 함수로 둔 이유: 통제하는 쪽(takeToken)과 그것을 밖에 말하는 쪽(/health classCheck)이
 *    **같은 값을 읽어야** 한다. 각자 env 를 읽으면 한쪽만 고쳐졌을 때 «켜 놓고 없다고 말하는»
 *    상태가 생기고, 그건 캡을 보고 판정하는 쪽을 조용히 속인다.
 */
export function myTurnGuardEnabled(): boolean {
  return (process.env.MYTURN_GUARD_ENABLED ?? '1') !== '0';
}

const COOLDOWN_MS = MY_TURN_LIMITS.cooldownSeconds * 1000;
const ACTOR_DAILY_LIMIT = MY_TURN_LIMITS.actorDaily;
const GLOBAL_MINUTE_LIMIT = MY_TURN_LIMITS.globalPerMin;
const GLOBAL_DAILY_LIMIT = MY_TURN_LIMITS.globalDaily;

export type MyTurnSlot = {
  key: string;
  label: string;
  /** 판정 프롬프트에 주는 힌트 — 이 칸이 다루는 내용 */
  hint: string;
  /** 학생이 안 정했을 때 AI가 대신 채우는 값의 대표 예시 */
  inventedExample: string;
};

export type MyTurnTask = {
  qaId: string;
  topic: string;
  slots: MyTurnSlot[];
};

/** 문항별 «내 차례» 판정 과제 — 클라이언트 vibe-ch13.ts myTurn.slots와 key·label을 맞춘다. */
export const MY_TURN_TASKS: Record<string, MyTurnTask> = {
  ch13_q01: {
    qaId: 'ch13_q01',
    topic: '우리 반 도서 대출 앱',
    slots: [
      { key: 'limit', label: '대출 권수', hint: '한 명이 몇 권까지 빌릴 수 있는지', inventedExample: '1인 최대 3권' },
      { key: 'due', label: '반납 기한', hint: '언제까지·어떤 주기로 반납하는지', inventedExample: '반납 기한 14일' },
      { key: 'overdue', label: '연체 벌칙', hint: '늦으면 어떻게 되는지(벌칙 없음도 정한 것)', inventedExample: '연체 시 30일 대출 정지' },
      { key: 'identity', label: '입장 방법', hint: '학생을 무엇으로 구분해 입장시키는지', inventedExample: '이름으로 입장 (동명이인 = 같은 사람)' },
      { key: 'retention', label: '기록 처리', hint: '대출 기록을 언제까지 보관하고 언제 지우는지', inventedExample: '대출 기록 무기한 보관' },
    ],
  },
  ch12_q06: {
    qaId: 'ch12_q06',
    topic: '만들고 싶은 앱의 «한 장 문서» (문제·사용자·기능·우선순위·성공 기준)',
    slots: [
      {
        key: 'problem',
        label: '문제 한 문장',
        hint: '앱 이름이 아니라 «누가 + 어떤 상황에서 + 무엇이 불편한지»가 적혀 있는지',
        inventedExample: '학급 관리가 불편하다 (누가·언제·무엇이 빠진 막연한 문장)',
      },
      {
        key: 'user',
        label: '주 사용자',
        hint: '누가 주로 쓰는지(학년·역할)가 정해져 있는지. 여럿이면 주인공이 정해졌는지',
        inventedExample: '일반 사용자 대상 (어른 사무용 앱의 평균)',
      },
      {
        key: 'features',
        label: '기능 목록',
        hint: '«사용자가 ~할 수 있다» 크기의 기능이 몇 개 적혀 있는지',
        inventedExample: '검색·등록·수정·삭제 (어느 앱에나 붙는 네 가지)',
      },
      {
        key: 'priority',
        label: '우선순위(안 함 포함)',
        hint: '무엇이 필수인지, 그리고 «이번엔 안 함»이 명시됐는지 — 침묵은 승낙으로 읽힌다',
        inventedExample: '적은 기능 전부 필수 — «이번엔 안 함» 칸 없음',
      },
      {
        key: 'success',
        label: '성공 기준',
        hint: '누가 읽어도 됐다/안 됐다를 똑같이 판정할 수 있는 문장인지(숫자가 들어갔는지)',
        inventedExample: '잘 동작하면 성공 (검사할 수 없는 문장)',
      },
    ],
  },
};

const verdictSchema = z.object({
  slots: z.array(
    z.object({
      key: z.string(),
      covered: z.boolean(),
      studentRule: z.string().nullable().optional(),
      inventedValue: z.string().nullable().optional(),
    }),
  ),
  coach: z.string(),
});

export type MyTurnVerdict = {
  covered: Array<{ key: string; label: string }>;
  invented: Array<{ key: string; label: string; example: string }>;
  coach: string;
};

export class MyTurnRateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super('rate_limited');
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class MyTurnUnavailableError extends Error {}

const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

const actorLastCall = new Map<string, number>();
const actorDayBuckets = new Map<string, { count: number; resetAt: number }>();
let globalMinute = { count: 0, resetAt: 0 };
let globalDay = { count: 0, resetAt: 0 };

function takeToken(actorId: string): void {
  if (!myTurnGuardEnabled()) return;
  const now = Date.now();

  const last = actorLastCall.get(actorId);
  if (last && now - last < COOLDOWN_MS) {
    throw new MyTurnRateLimitError(Math.ceil((COOLDOWN_MS - (now - last)) / 1000));
  }

  const day = actorDayBuckets.get(actorId);
  if (day && day.resetAt > now && day.count >= ACTOR_DAILY_LIMIT) {
    throw new MyTurnRateLimitError(Math.ceil((day.resetAt - now) / 1000));
  }

  if (globalMinute.resetAt > now && globalMinute.count >= GLOBAL_MINUTE_LIMIT) {
    throw new MyTurnRateLimitError(Math.ceil((globalMinute.resetAt - now) / 1000));
  }
  if (globalDay.resetAt > now && globalDay.count >= GLOBAL_DAILY_LIMIT) {
    throw new MyTurnRateLimitError(Math.ceil((globalDay.resetAt - now) / 1000));
  }

  actorLastCall.set(actorId, now);
  if (!day || day.resetAt <= now) {
    actorDayBuckets.set(actorId, { count: 1, resetAt: now + 86_400_000 });
  } else {
    day.count += 1;
  }
  if (globalMinute.resetAt <= now) {
    globalMinute = { count: 1, resetAt: now + 60_000 };
  } else {
    globalMinute.count += 1;
  }
  if (globalDay.resetAt <= now) {
    globalDay = { count: 1, resetAt: now + 86_400_000 };
  } else {
    globalDay.count += 1;
  }
}

function buildJudgePrompt(task: MyTurnTask, prompt: string): { system: string; user: string } {
  const slotLines = task.slots
    .map((slot) => `- ${slot.key}: ${slot.label} — ${slot.hint}`)
    .join('\n');

  const system = [
    `너는 «${task.topic}» 부탁문을 심사하는 판정기다.`,
    '학생의 부탁문이 아래 다섯 칸을 각각 «직접 정했는지» 판정한다.',
    slotLines,
    '',
    '판정 기준:',
    '- 그 칸의 내용을 부탁문이 명시적으로 정했으면 covered=true, studentRule에 학생이 정한 규칙을 짧게 요약.',
    '- 정하지 않았으면 covered=false, inventedValue에 네가 앱을 만든다면 대신 채웠을 그럴듯한 값을 짧게 한 줄로.',
    '- "벌칙 없음", "기록 안 남김"처럼 없음을 명시한 것도 정한 것(covered=true)이다.',
    '- coach는 판정 결과에 대한 한두 문장의 코치 멘트: 다 채웠으면 칭찬, 빈칸이 있으면 어디부터 채울지 반말로 다정하게.',
    '',
    '반드시 아래 JSON만 출력한다(설명·코드블록 금지):',
    '{"slots":[{"key":"limit","covered":true,"studentRule":"...","inventedValue":null},...5개 전부],"coach":"..."}',
  ].join('\n');

  return { system, user: `학생의 부탁문:\n${prompt}` };
}

export async function judgeMyTurn(input: {
  qaId: string;
  prompt: string;
  actorId: string;
}): Promise<MyTurnVerdict> {
  const task = MY_TURN_TASKS[input.qaId];
  if (!task) {
    throw new MyTurnUnavailableError('unknown_qa');
  }
  if (!anthropic) {
    throw new MyTurnUnavailableError('no_api_key');
  }

  takeToken(input.actorId);

  const { system, user } = buildJudgePrompt(task, input.prompt.slice(0, 1200));
  const response = await anthropic.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 800,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('judge_no_json');
  }
  const parsed = verdictSchema.parse(JSON.parse(jsonMatch[0]));
  return buildVerdict(task, parsed);
}

/** 모델 출력 → 클라이언트 계약으로 매핑. 모델이 칸을 빠뜨리면 «안 정함»으로 안전하게 처리한다. */
export function buildVerdict(task: MyTurnTask, parsed: z.infer<typeof verdictSchema>): MyTurnVerdict {
  const bySlot = new Map(parsed.slots.map((slot) => [slot.key, slot]));
  const covered: MyTurnVerdict['covered'] = [];
  const invented: MyTurnVerdict['invented'] = [];
  for (const slot of task.slots) {
    const verdict = bySlot.get(slot.key);
    if (verdict?.covered) {
      covered.push({ key: slot.key, label: slot.label });
    } else {
      invented.push({
        key: slot.key,
        label: slot.label,
        example: verdict?.inventedValue?.trim() || slot.inventedExample,
      });
    }
  }

  return { covered, invented, coach: parsed.coach };
}
