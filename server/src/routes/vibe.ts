import { Router } from 'express';
import { z } from 'zod';
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

// POST /api/vibe/my-turn — 학생 부탁문을 Haiku 4.5로 판정 (쿨타임·캡은 lib에서)
router.post('/my-turn', async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }

  const actorId = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const verdict = await judgeMyTurn({
      qaId: parsed.data.qaId,
      prompt: parsed.data.prompt,
      actorId,
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
