import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { getRequestUser } from '../lib/auth';
import { getParticipantTokenFromRequest, verifyParticipantToken } from '../lib/participant-token';
import { generateSessionCode } from '../lib/session-code';
import { getSupabaseAdminClient } from '../lib/supabase';

const router = Router();

const createSessionSchema = z.object({
  name: z.string().trim().min(1).max(60),
  chapter_ids: z.array(z.number().int().min(1).max(10)).min(1).max(10),
  max_participants: z.union([z.literal(50), z.literal(100), z.literal(200)]).default(100),
});

type SessionRow = {
  id: string;
  code: string;
  name: string;
  teacher_id: string;
  chapter_ids: number[];
  status: 'active' | 'ended';
  max_participants: number;
  created_at: string;
  ended_at: string | null;
};

type ParticipantRow = {
  id: string;
  nickname: string;
  joined_at: string;
  session_id: string;
};

async function requireTeacherId(req: Request) {
  const user = await getRequestUser(req);
  return user?.id ?? null;
}

function getSupabaseOrThrow() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('db_not_configured');
  }

  return supabase;
}

async function listParticipantsWithProgress(sessionId: string) {
  const supabase = getSupabaseOrThrow();
  const { data: participants, error: participantError } = await supabase
    .from('architecture_participants')
    .select('id, nickname, joined_at, session_id')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true });

  if (participantError) {
    throw new Error('participant_lookup_failed');
  }

  const typedParticipants = (participants ?? []) as ParticipantRow[];
  const participantIds = typedParticipants.map((participant) => participant.id);
  if (participantIds.length === 0) {
    return [];
  }

  const { data: progressRows, error: progressError } = await supabase
    .from('architecture_progress')
    .select('participant_id, qa_id')
    .in('participant_id', participantIds);

  if (progressError) {
    throw new Error('progress_lookup_failed');
  }

  const counts = new Map<string, number>();
  for (const row of progressRows ?? []) {
    const participantId = row.participant_id as string | null;
    if (!participantId) {
      continue;
    }

    counts.set(participantId, (counts.get(participantId) ?? 0) + 1);
  }

  return typedParticipants.map((participant) => ({
    id: participant.id,
    nickname: participant.nickname,
    joined_at: participant.joined_at,
    progress_count: counts.get(participant.id) ?? 0,
  }));
}

async function loadViewerProgress(participantId: string) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from('architecture_progress')
    .select('qa_id, read_at, quiz_score')
    .eq('participant_id', participantId);

  if (error) {
    throw new Error('viewer_progress_failed');
  }

  return (data ?? []).reduce<Record<string, { read: boolean; quizScore?: number }>>((acc, row) => {
    const qaId = row.qa_id as string;
    acc[qaId] = {
      read: Boolean(row.read_at),
      quizScore: typeof row.quiz_score === 'number' ? row.quiz_score : undefined,
    };
    return acc;
  }, {});
}

router.post('/', async (req, res) => {
  const teacherId = await requireTeacherId(req);
  if (!teacherId) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_input',
      details: parsed.error.flatten(),
    });
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseOrThrow();
  } catch {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const chapterIds = [...new Set(parsed.data.chapter_ids)].sort((a, b) => a - b);
  let session: SessionRow | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateSessionCode();
    const { data, error } = await supabase
      .from('architecture_sessions')
      .insert({
        code,
        name: parsed.data.name,
        teacher_id: teacherId,
        chapter_ids: chapterIds,
        max_participants: parsed.data.max_participants,
      })
      .select('id, code, name, teacher_id, chapter_ids, status, max_participants, created_at, ended_at')
      .single();

    if (!error && data) {
      session = data as SessionRow;
      break;
    }
  }

  if (!session) {
    res.status(503).json({ error: 'session_code_unavailable' });
    return;
  }

  res.status(201).json(session);
});

router.get('/', async (req, res) => {
  const teacherId = await requireTeacherId(req);
  if (!teacherId) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseOrThrow();
  } catch {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const { data, error } = await supabase
    .from('architecture_sessions')
    .select('id, code, name, teacher_id, chapter_ids, status, max_participants, created_at, ended_at')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: 'session_list_failed' });
    return;
  }

  const sessions = ((data ?? []) as SessionRow[]).sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === 'active' ? -1 : 1;
    }

    return right.created_at.localeCompare(left.created_at);
  });

  const participantCounts = new Map<string, number>();
  for (const session of sessions) {
    participantCounts.set(session.id, (await listParticipantsWithProgress(session.id)).length);
  }

  res.setHeader('Cache-Control', 'no-store');
  res.json(
    sessions.map((session) => ({
      ...session,
      participant_count: participantCounts.get(session.id) ?? 0,
    })),
  );
});

router.get('/:id', async (req, res) => {
  let supabase;
  try {
    supabase = getSupabaseOrThrow();
  } catch {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const { data: session, error } = await supabase
    .from('architecture_sessions')
    .select('id, code, name, teacher_id, chapter_ids, status, max_participants, created_at, ended_at')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error || !session) {
    res.status(404).json({ error: 'session_not_found' });
    return;
  }

  const teacherId = await requireTeacherId(req);
  let viewer:
    | {
        participant_id: string;
        nickname: string;
        progress: Record<string, { read: boolean; quizScore?: number }>;
      }
    | undefined;

  if (teacherId) {
    if (session.teacher_id !== teacherId) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
  } else {
    const token = getParticipantTokenFromRequest(req);
    const payload = token ? verifyParticipantToken(token) : null;
    if (!payload || payload.session_id !== session.id) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }

    if (session.status !== 'active') {
      res.status(410).json({ error: 'session_closed' });
      return;
    }

    const { data: participant, error: participantError } = await supabase
      .from('architecture_participants')
      .select('id, nickname, session_id')
      .eq('id', payload.participant_id)
      .eq('session_id', session.id)
      .single();

    if (participantError || !participant) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }

    viewer = {
      participant_id: participant.id as string,
      nickname: participant.nickname as string,
      progress: await loadViewerProgress(participant.id as string),
    };
  }

  res.setHeader('Cache-Control', 'no-store');
  res.json({
    ...(session as SessionRow),
    participants: await listParticipantsWithProgress(session.id),
    viewer,
  });
});

router.get('/:id/participants', async (req, res) => {
  const teacherId = await requireTeacherId(req);
  if (!teacherId) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseOrThrow();
  } catch {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const { data: session, error } = await supabase
    .from('architecture_sessions')
    .select('id, teacher_id, status')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error || !session) {
    res.status(404).json({ error: 'session_not_found' });
    return;
  }

  if (session.teacher_id !== teacherId) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');
  res.json({
    id: session.id,
    status: session.status,
    participants: await listParticipantsWithProgress(session.id),
  });
});

router.post('/:id/end', async (req, res) => {
  const teacherId = await requireTeacherId(req);
  if (!teacherId) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseOrThrow();
  } catch {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const { data: session, error } = await supabase
    .from('architecture_sessions')
    .select('id, teacher_id')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error || !session) {
    res.status(404).json({ error: 'session_not_found' });
    return;
  }

  if (session.teacher_id !== teacherId) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  const { data: updated, error: updateError } = await supabase
    .from('architecture_sessions')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString(),
    })
    .eq('id', session.id)
    .select('id, code, name, teacher_id, chapter_ids, status, max_participants, created_at, ended_at')
    .single();

  if (updateError || !updated) {
    res.status(500).json({ error: 'session_end_failed' });
    return;
  }

  res.json(updated);
});

export default router;
