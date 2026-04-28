import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { QUIZ_ANSWERS } from '../data/quiz-answers';

const router = Router();

const gradeSchema = z.object({
  qaId: z.string().min(1),
  answers: z.array(z.number().int().min(0)).min(1).max(10),
});

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 30;

function getBucketKey(req: Request) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') ?? 'unknown';
  return `${ip}:${userAgent}`;
}

function throttle(req: Request, res: Response, next: NextFunction) {
  const key = getBucketKey(req);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  bucket.count += 1;
  if (bucket.count > LIMIT) {
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
