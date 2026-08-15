import { Router } from 'express';
import { z } from 'zod';
import { resolveActorId } from '../lib/actor-id';
import {
  askQuestion,
  LabBudgetError,
  LabQuotaError,
  LabRateLimitError,
  LabUnavailableError,
  remainingFor,
  reviewDraft,
  verifyWithRules,
} from '../lib/lab-ai';

/**
 * 12강 실습실의 AI 라우트 — 비평 · 검증 · 질문.
 *
 * 🚨 **막힌 이유를 뭉치지 않는다.** 「돈 천장」·「내 횟수 소진」·「너무 자주」·「고장」은 조치가 전부 다르다.
 *    하나로 뭉쳐 답하면 학생은 계속 다시 누르고, 교사는 무엇을 손봐야 할지 모른다.
 *      402 = 돈 천장(전역)  → Render 에 LAB_MONTHLY_BUDGET_USD 한 줄
 *      409 = 내 횟수 소진   → 오늘은 여기까지. 다시 눌러도 안 열린다
 *      429 = 너무 자주      → 몇 초 뒤 다시
 *      503 = 고장·미설정    → 교사에게 알린다
 *
 * 🔑 남은 횟수는 **언제나 서버가 말한다.** 화면이 자기 상한을 세면 채점 로그와 똑같이 위조된다.
 */
const router = Router();

const reviewSchema = z.object({ draft: z.string().min(1).max(8000) });
const verifySchema = z.object({ rules: z.string().min(1).max(8000) });
const askSchema = z.object({ question: z.string().min(1).max(500) });

/** 어떤 답을 주든 남은 횟수를 같이 붙인다 — 화면이 따로 물어보러 오지 않게. */
function withRemaining<T extends object>(actorId: string, payload: T) {
  return { ...payload, remaining: remainingFor(actorId) };
}

function handle(actorId: string, caught: unknown, res: import('express').Response, tag: string): void {
  if (caught instanceof LabBudgetError) {
    res.status(402).json(withRemaining(actorId, { error: 'budget_exceeded' }));
    return;
  }
  if (caught instanceof LabQuotaError) {
    res.status(409).json(withRemaining(actorId, { error: 'quota_exhausted', kind: caught.kind }));
    return;
  }
  if (caught instanceof LabRateLimitError) {
    res.status(429).json(withRemaining(actorId, { error: 'rate_limited', retryAfterSeconds: caught.retryAfterSeconds }));
    return;
  }
  if (caught instanceof LabUnavailableError) {
    res.status(503).json(withRemaining(actorId, { error: 'unavailable', reason: caught.message }));
    return;
  }
  // 🚨 여기까지 온 것은 우리 쪽 고장이다(호출은 이미 환불됐다). 원인을 로그에 남긴다 —
  //    수업 중에 이 줄이 없으면 「왜 안 되는지」를 아무도 못 본다.
  console.error(`[lab/${tag}] failed`, caught instanceof Error ? caught.message : caught);
  res.status(502).json(withRemaining(actorId, { error: 'call_failed' }));
}

/** 지금 내 남은 횟수만 묻는다. 화면이 처음 열릴 때 쓴다. */
router.get('/quota', (req, res) => {
  res.json({ remaining: remainingFor(resolveActorId(req)) });
});

// POST /api/lab/review — 내 초안의 어디가 애매한가 (초안을 대신 써 주지 않는다)
router.post('/review', async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  const actorId = resolveActorId(req);
  if (!parsed.success) {
    res.status(400).json(withRemaining(actorId, { error: 'invalid_request' }));
    return;
  }
  try {
    const review = await reviewDraft(actorId, parsed.data.draft);
    res.json(withRemaining(actorId, { review }));
  } catch (caught) {
    handle(actorId, caught, res, 'review');
  }
});

// POST /api/lab/verify — 내 규칙대로 두 번 시켜 본다
// 🔑 판정은 여기서 안 한다. 결과 문자열만 돌려주고 결정적 검사기가 판정한다.
router.post('/verify', async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  const actorId = resolveActorId(req);
  if (!parsed.success) {
    res.status(400).json(withRemaining(actorId, { error: 'invalid_request' }));
    return;
  }
  try {
    const outputs = await verifyWithRules(actorId, parsed.data.rules);
    res.json(withRemaining(actorId, { outputs }));
  } catch (caught) {
    handle(actorId, caught, res, 'verify');
  }
});

// POST /api/lab/ask — 모르는 것 물어보기 (미션 횟수와 별도)
router.post('/ask', async (req, res) => {
  const parsed = askSchema.safeParse(req.body);
  const actorId = resolveActorId(req);
  if (!parsed.success) {
    res.status(400).json(withRemaining(actorId, { error: 'invalid_request' }));
    return;
  }
  try {
    const answer = await askQuestion(actorId, parsed.data.question);
    res.json(withRemaining(actorId, { answer }));
  } catch (caught) {
    handle(actorId, caught, res, 'ask');
  }
});

export default router;
