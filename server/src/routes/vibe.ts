import { Router } from 'express';
import { z } from 'zod';
import { resolveActorId } from '../lib/actor-id';
import {
  judgeMyTurn,
  MyTurnRateLimitError,
  MyTurnUnavailableError,
} from '../lib/vibe-my-turn';

const router = Router();

const bodySchema = z.object({
  qaId: z.string().min(1).max(32),
  prompt: z.string().min(5).max(1200),
});

// 학생 신원(pt: / ip:)은 lib/actor-id.ts 로 옮겼다 — 같은 «IP 로 재면 반 전체가 한 명» 실수를
// 다른 라우트가 반복하지 않도록 한 자리에 둔다. 기존 import 경로를 쓰던 곳을 위해 여기서도 내보낸다.
export { resolveActorId };

// POST /api/vibe/my-turn — 학생 부탁문을 Haiku 4.5로 판정 (쿨타임·캡은 lib에서)
router.post('/my-turn', async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }

  try {
    const verdict = await judgeMyTurn({
      qaId: parsed.data.qaId,
      prompt: parsed.data.prompt,
      actorId: resolveActorId(req),
    });
    res.json(verdict);
  } catch (caught) {
    if (caught instanceof MyTurnRateLimitError) {
      res.status(429).json({ error: 'rate_limited', retryAfterSeconds: caught.retryAfterSeconds });
      return;
    }
    if (caught instanceof MyTurnUnavailableError) {
      res.status(404).json({ error: 'unavailable' });
      return;
    }
    console.error('[vibe/my-turn] judge_failed', caught instanceof Error ? caught.message : caught);
    res.status(502).json({ error: 'judge_failed' });
  }
});

export default router;
