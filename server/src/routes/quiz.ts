import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { QUIZ_ANSWERS } from '../data/quiz-answers';
import { isParticipantKey, resolveActorId } from '../lib/actor-id';

const router = Router();

const gradeSchema = z.object({
  qaId: z.string().min(1),
  answers: z.array(z.number().int().min(0)).min(1).max(10),
});

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;

// 🚨 예전에는 키가 «IP + User-Agent» 였다. 학교는 교실 전체가 공인 IP 하나로 나가고, 학교 지급 PC 는
//    User-Agent 까지 같다 — 30명 수업이 통 하나에 뭉쳐 분당 30회를 나눠 썼다.
//    «다 같이 퀴즈 풀어» 한 번이면 한 반이 한도를 채우고, 늦게 낸 학생부터 429 로 채점을 못 받는다.
//    세션에 참여한 학생은 서명된 참여자 토큰이 있으니 그것을 신원으로 쓴다(lib/actor-id).
export const PARTICIPANT_LIMIT = 30;
// 토큰이 없는 통(라이브러리 자습 등)은 «여러 명일 수 있는 통»이라 한도를 따로, 더 넉넉히 잡는다.
// 채점은 정적 데이터 대조라 AI 호출도 DB 쓰기도 없다 — 여기서 아끼는 것은 비용이 아니라 남용 폭이다.
export const SHARED_LIMIT = 120;

// 🚨 verify 를 인자로 받는 이유는 resolveActorId 와 같다 — 서명 비밀 없이도 «키를 어떻게 만드는가» 를
//    검사할 수 있어야 한다. 비밀은 CI 에 없고, 로컬 .env 에 기대는 테스트는 CI 에서만 빨강이 된다.
export function getBucketKey(req: Request, verify?: (token: string) => { participant_id: string } | null) {
  const actorId = verify ? resolveActorId(req, verify) : resolveActorId(req);
  if (isParticipantKey(actorId)) return actorId;
  const userAgent = req.get('user-agent') ?? 'unknown';
  return `${actorId}:${userAgent}`;
}

function throttle(req: Request, res: Response, next: NextFunction) {
  const key = getBucketKey(req);
  const limit = isParticipantKey(key) ? PARTICIPANT_LIMIT : SHARED_LIMIT;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'rate_limited', retry_after: retryAfter });
    return;
  }

  next();
}

router.post('/grade', throttle, (req, res) => {
  const parsed = gradeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_input',
      message: 'qaId와 answers 배열 형식을 확인해주세요.',
      details: parsed.error.flatten(),
    });
    return;
  }

  const { qaId, answers } = parsed.data;
  const answerSet = QUIZ_ANSWERS[qaId];

  if (!answerSet) {
    res.status(404).json({ error: 'qa_not_found', qaId });
    return;
  }

  if (answers.length !== answerSet.answers.length) {
    res.status(400).json({
      error: 'answer_count_mismatch',
      expected: answerSet.answers.length,
      got: answers.length,
    });
    return;
  }

  const breakdown = answerSet.answers.map((answer, index) => ({
    questionIdx: index,
    correct: answers[index] === answer.correctIdx,
    correctIdx: answer.correctIdx,
    explanation: answer.explanation,
  }));

  const score = breakdown.filter((item) => item.correct).length;
  res.json({ score, breakdown });
});

export default router;
