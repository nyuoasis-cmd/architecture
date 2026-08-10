import { Router, type Request } from 'express';
import { z } from 'zod';
import { isParticipantKey, resolveActorId } from '../lib/actor-id';
import { BudgetError, createChatReply, RateLimitError, type ChatHistoryEntry } from '../lib/chat-service';

const router = Router();

// 🚨 verify 를 인자로 받는 이유는 resolveActorId 와 같다 — 서명 비밀 없이도 «키를 어떻게 만드는가» 를
//    검사할 수 있어야 한다. 비밀은 CI 에 없고, 로컬 .env 에 기대는 테스트는 CI 에서만 빨강이 된다.
export function getChatBucketKey(req: Request, verify?: (token: string) => { participant_id: string } | null) {
  const actorId = verify ? resolveActorId(req, verify) : resolveActorId(req);
  if (isParticipantKey(actorId)) return actorId;
  // 토큰이 없는 통은 기기(User-Agent)로 한 번 더 가른다 — 자습 중인 서로 다른 기기까지 뭉치지 않게.
  const userAgent = req.get('user-agent') ?? 'unknown';
  return `${actorId}:${userAgent}`;
}

const chatSchema = z.object({
  qaId: z.string().min(1),
  question: z.string().trim().min(2).max(280),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(500),
      }),
    )
    .max(6)
    .default([]),
});

router.post('/', async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_input',
      message: 'qaId, question, history 형식을 확인해주세요.',
      details: parsed.error.flatten(),
    });
    return;
  }

  // 🚨 IP 로 재면 교실 전체가 한 명이 된다 — 학교는 반 전체가 공인 IP 하나로 나가기 때문에,
  //    첫 학생이 한도를 쓰는 순간 나머지가 전부 429 를 맞는다.
  //    (2026-08-10 채점 라우트에서 같은 결함을 고쳤고(#139), 챗봇만 남아 있었다.)
  const actorId = getChatBucketKey(req);
  const history: ChatHistoryEntry[] = parsed.data.history.map((entry) => ({
    role: entry.role,
    content: entry.content,
  }));

  try {
    const result = await createChatReply({
      qaId: parsed.data.qaId,
      question: parsed.data.question,
      history,
      actorId,
    });

    res.setHeader('Cache-Control', 'no-store');
    res.json(result);
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.setHeader('Retry-After', String(error.retryAfter));
      res.status(429).json({
        error: 'rate_limited',
        message: '질문이 너무 빠르게 들어오고 있습니다. 잠시 후 다시 시도해주세요.',
        retryAfter: error.retryAfter,
      });
      return;
    }
    if (error instanceof BudgetError) {
      res.status(error.statusCode).json({
        error: error.fallback ? 'budget_cache_only' : 'budget_exceeded',
        message: error.fallback
          ? '월 예산 보호 중이라 지금은 저장된 답변만 제공할 수 있습니다.'
          : '월 예산 초과로 챗봇이 일시 비활성화되었습니다.',
        fallback: error.fallback,
      });
      return;
    }

    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'qa_not_found') {
      res.status(404).json({ error: 'qa_not_found' });
      return;
    }
    if (message === 'anthropic_not_configured') {
      res.status(503).json({
        error: 'chat_not_configured',
        message: '서버에 ANTHROPIC_API_KEY가 아직 연결되지 않았습니다.',
      });
      return;
    }
    if (message === 'chat_busy' || message === 'chat_timeout') {
      res.status(503).json({
        error: 'chat_temporarily_unavailable',
        message: '지금 답변 준비가 조금 밀리고 있습니다. 30초 뒤 다시 시도해주세요.',
        retryAfter: 30,
      });
      return;
    }

    res.status(503).json({
      error: 'chat_temporarily_unavailable',
      message: '외부 AI 응답을 지금 가져오지 못했습니다. 잠시 후 다시 시도해주세요.',
      retryAfter: 30,
    });
  }
});

export default router;
