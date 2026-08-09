import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { env } from '../env';

// «내 차례» — 학생이 쓴 부탁문을 Haiku 4.5로 실제 실행해, 다섯 칸 중
// «학생이 정한 칸 / AI가 대신 정하게 되는 칸»을 판정한다.
// 모델 = Haiku 4.5 재사용 (jery 승인 2026-08-10, 기존 챗봇과 동일 모델).
// 호출 통제: 학생(IP) 쿨타임 5분 · 학생 하루 12회 · 전체 분당 60 · 전체 하루 500.

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

const COOLDOWN_MS = 5 * 60_000;
const ACTOR_DAILY_LIMIT = 12;
const GLOBAL_MINUTE_LIMIT = 60;
const GLOBAL_DAILY_LIMIT = 500;

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
