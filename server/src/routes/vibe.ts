import { Router } from 'express';
import { z } from 'zod';
import { getParticipantTokenFromRequest, verifyParticipantToken } from '../lib/participant-token';
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

/**
 * 학생 한 명을 가리키는 키.
 *
 * 🚨 IP 를 쓰면 안 된다. 학교는 교실 전체가 **하나의 공인 IP** 로 나오는 것이 보통이라,
 *    «학생당 쿨타임 5분·하루 12회» 를 IP 로 재면 그 한도를 **반 전체가 나눠 쓴다**.
 *    30명 수업이면 첫 한 명이 쓰는 순간 나머지 29명이 5분간 429 를 받는다 — 수업이 멈춘다.
 *    세션에 참여한 학생은 서명된 참여자 토큰(arch_pt)을 갖고 있으므로 그것을 신원으로 쓴다.
 *
 * 토큰이 없는 경우(라이브러리 자습 등)만 IP 로 떨어진다. 이때는 교실 공유 IP 로 뭉칠 수 있으므로
 * `ip:` 접두사를 붙여 «참여자 키가 아니다» 를 호출부에서 구분할 수 있게 남긴다.
 */
export function resolveActorId(req: Parameters<Parameters<typeof router.post>[1]>[0]): string {
  const token = getParticipantTokenFromRequest(req);
  const payload = token ? verifyParticipantToken(token) : null;
  if (payload?.participant_id) {
    return `pt:${payload.participant_id}`;
  }
  return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
}

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
