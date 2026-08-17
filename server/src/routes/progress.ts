import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { getRequestUser } from '../lib/auth';
import { getParticipantTokenFromRequest, verifyParticipantToken } from '../lib/participant-token';
import { getSupabaseAdminClient } from '../lib/supabase';
import { qaTagFields } from '../lib/qa-context';

const router = Router();

/**
 * 🔑 실습실 미션 자리(`lab_*`)는 **실습 문항의 진도 행에만** 담긴다. 다른 문항에서는 안 온다.
 * 🚨 상한을 넉넉히(0~99) 두는 이유: 미션 개수는 콘텐츠가 정한다. 서버가 7 을 알고 있으면
 *    미션을 하나 늘리는 날 학생 진도가 조용히 400 으로 막힌다 — 수업 중에.
 */
const progressSchema = z.object({
  qa_id: z.string().trim().min(1),
  read_at: z.string().datetime().optional(),
  quiz_score: z.number().int().min(0).max(100).optional(),
  lab_mission_index: z.number().int().min(0).max(99).optional(),
  lab_earned_index: z.number().int().min(0).max(99).optional(),
});

type ProgressIdentity =
  | { participantId: string; userId?: undefined }
  | { participantId?: undefined; userId: string };

async function resolveProgressIdentity(req: Request): Promise<ProgressIdentity | null> {
  const token = getParticipantTokenFromRequest(req);
  if (token) {
    const payload = verifyParticipantToken(token);
    if (!payload) {
      return null;
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return null;
    }

    const { data: participant, error } = await supabase
      .from('architecture_participants')
      .select('id, session_id')
      .eq('id', payload.participant_id)
      .eq('session_id', payload.session_id)
      .single();

    if (error || !participant) {
      return null;
    }

    const { data: session, error: sessionError } = await supabase
      .from('architecture_sessions')
      .select('status')
      .eq('id', payload.session_id)
      .single();

    if (sessionError || !session || session.status !== 'active') {
      throw new Error('session_closed');
    }

    return { participantId: participant.id };
  }

  const user = await getRequestUser(req);
  if (!user) {
    return null;
  }

  return { userId: user.id };
}

async function writeProgress(identity: ProgressIdentity, input: z.infer<typeof progressSchema>) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('db_not_configured');
  }

  const baseQuery = identity.participantId
    ? supabase
        .from('architecture_progress')
        .select('id, read_at, quiz_score, lab_mission_index, lab_earned_index')
        .eq('participant_id', identity.participantId)
        .eq('qa_id', input.qa_id)
    : supabase
        .from('architecture_progress')
        .select('id, read_at, quiz_score, lab_mission_index, lab_earned_index')
        .eq('user_id', identity.userId)
        .eq('qa_id', input.qa_id);

  const { data: existingRows, error: existingError } = await baseQuery.limit(1);
  if (existingError) {
    throw new Error('progress_lookup_failed');
  }

  const existing = existingRows?.[0] as
    | {
        id: string
        read_at: string | null
        quiz_score: number | null
        lab_mission_index: number | null
        lab_earned_index: number | null
      }
    | undefined;
  /**
   * 🚨 미션 자리는 **뒤로 가지 않는다.** 학생이 `reset` 을 하거나 늦게 온 요청이 앞의 요청을 덮어도,
   *    교사 화면의 진행도가 뒷걸음질치면 교사는 «되돌아간 학생»을 쫓아가게 된다. 큰 값을 남긴다.
   * 🔑 실습 문항이 아닌 진도 행에는 이 칸이 아예 안 온다 — 그때는 있던 값을 그대로 둔다.
   */
  const keepMax = (next: number | undefined, before: number | null) =>
    next === undefined ? before : Math.max(next, before ?? 0);
  const payload = {
    qa_id: input.qa_id,
    read_at: input.read_at ?? existing?.read_at ?? null,
    quiz_score: input.quiz_score ?? existing?.quiz_score ?? null,
    lab_mission_index: keepMax(input.lab_mission_index, existing?.lab_mission_index ?? null),
    lab_earned_index: keepMax(input.lab_earned_index, existing?.lab_earned_index ?? null),
    updated_at: new Date().toISOString(),
    ...(identity.participantId ? { participant_id: identity.participantId } : { user_id: identity.userId }),
  };

  if (existing) {
    const { error } = await supabase
      .from('architecture_progress')
      .update(payload)
      .eq('id', existing.id);
    if (error) {
      throw new Error('progress_update_failed');
    }

    return;
  }

  const { error } = await supabase.from('architecture_progress').insert({ ...payload, ...qaTagFields() });
  if (error) {
    throw new Error('progress_insert_failed');
  }
}

router.patch('/', async (req, res) => {
  const parsed = progressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_input',
      message: 'qa_id, read_at, quiz_score 형식을 확인해주세요.',
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const identity = await resolveProgressIdentity(req);
    if (!identity) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }

    await writeProgress(identity, parsed.data);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'session_closed') {
      res.status(410).json({ error: 'session_closed' });
      return;
    }

    if (message === 'db_not_configured') {
      res.status(503).json({ error: 'db_not_configured' });
      return;
    }

    res.status(500).json({ error: 'progress_write_failed' });
  }
});

export default router;
