import { Router } from 'express';
import { z } from 'zod';
import { signParticipantToken } from '../lib/participant-token';
import { getSupabaseAdminClient } from '../lib/supabase';
import { qaTagFields } from '../lib/qa-context';

const router = Router();

const joinSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6)
    .transform((value) => value.toUpperCase()),
  nickname: z
    .string()
    .trim()
    .min(1)
    .max(20),
});

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 30;

function takeJoinToken(ip: string): number | null {
  const now = Date.now();
  const key = ip || 'unknown';
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  current.count += 1;
  if (current.count > LIMIT) {
    return Math.ceil((current.resetAt - now) / 1000);
  }

  return null;
}

router.post('/', async (req, res) => {
  const retryAfter = takeJoinToken(req.ip || req.socket.remoteAddress || 'unknown');
  if (retryAfter !== null) {
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'rate_limited', retry_after: retryAfter });
    return;
  }

  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_input',
      message: '코드와 닉네임 형식을 확인해주세요.',
      details: parsed.error.flatten(),
    });
    return;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const { data: session, error: sessionError } = await supabase
    .from('architecture_sessions')
    .select('id, code, status, max_participants, mode')
    .eq('code', parsed.data.code)
    .maybeSingle();

  if (sessionError || !session) {
    res.status(404).json({ error: 'session_not_found' });
    return;
  }

  if (session.status !== 'active') {
    res.status(410).json({ error: 'session_closed' });
    return;
  }

  const { count } = await supabase
    .from('architecture_participants')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session.id);

  if ((count ?? 0) >= session.max_participants) {
    res.status(409).json({ error: 'session_full' });
    return;
  }

  const { data: participant, error: participantError } = await supabase
    .from('architecture_participants')
    .insert({
      session_id: session.id,
      nickname: parsed.data.nickname,
      ...qaTagFields(),
    })
    .select('id, session_id, nickname')
    .single();

  if (participantError || !participant) {
    res.status(500).json({ error: 'participant_create_failed' });
    return;
  }

  let token: string;
  try {
    token = signParticipantToken({
      participantId: participant.id,
      sessionId: participant.session_id,
    });
  } catch {
    res.status(503).json({ error: 'token_not_configured' });
    return;
  }

  res.cookie('arch_pt', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 43_200_000,
  });
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    session_id: participant.session_id,
    participant_id: participant.id,
    nickname: participant.nickname,
    mode: session.mode as 'learn' | 'harness',
  });
});

export default router;
