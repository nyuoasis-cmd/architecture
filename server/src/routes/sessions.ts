import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { getRequestUser } from '../lib/auth';
import { getParticipantTokenFromRequest, verifyParticipantToken } from '../lib/participant-token';
import { generateSessionCode } from '../lib/session-code';
import { tallyProgressRows } from '../lib/session-progress';
import { getSupabaseAdminClient } from '../lib/supabase';
import { qaTagFields } from '../lib/qa-context';
import { ALL_CHAPTER_IDS } from '../data/chapter-content';

const router = Router();

// 🔑 export 하는 이유: 테스트가 «소스를 정규식으로 읽는» 대신 스키마를 실제로 돌려 보고
//    무엇이 통과·거절되는지로 판정하게 하려는 것. 선언을 읽는 계측은 동작이 바뀌어도 초록일 수 있다.
export const createSessionSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    // 🔑 범위·개수를 손으로 적지 않는다. 등록부에서 파생시켜야 장이 늘 때 저절로 따라온다.
    //    (2026-08-11 이전에는 max(10) 이 박혀 있어 바이브코딩 11~17장이 수업에 못 담겼다.)
    // 🚨 세션은 한 종류뿐이다. 예전엔 mode('learn'|'harness')로 갈려 harness 는 챕터가 0개였고,
    //    그래서 «챕터 1개 이상»이 조건부 규칙이었다. 하네스를 철거하면서 조건이 사라졌다 —
    //    이제 **모든 세션은 장을 1개 이상 담는다**. 장 없는 세션은 학생이 열어도 볼 것이 없다.
    chapter_ids: z
      .array(z.number().int().refine((id) => ALL_CHAPTER_IDS.includes(id), { message: '없는 장입니다.' }))
      .min(1, { message: '수업에 담을 장을 1개 이상 선택해야 합니다.' })
      .max(ALL_CHAPTER_IDS.length),
    max_participants: z.union([z.literal(50), z.literal(100), z.literal(200)]).default(100),
  });

const SESSION_SELECT = 'id, code, name, teacher_id, chapter_ids, status, max_participants, created_at, ended_at';

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
    return { participants: [], qaCompletion: {} };
  }

  const { data: progressRows, error: progressError } = await supabase
    .from('architecture_progress')
    .select('participant_id, qa_id')
    .in('participant_id', participantIds);

  if (progressError) {
    throw new Error('progress_lookup_failed');
  }

  // 같은 행을 참여자별·문항별 두 축으로 센다(session-progress.ts) — 쿼리는 늘지 않는다.
  const { countsByParticipant: counts, qaCompletion } = tallyProgressRows(progressRows ?? []);

  return {
    participants: typedParticipants.map((participant) => ({
      id: participant.id,
      nickname: participant.nickname,
      joined_at: participant.joined_at,
      progress_count: counts.get(participant.id) ?? 0,
    })),
    qaCompletion,
  };
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
        ...qaTagFields(),
      })
      .select(SESSION_SELECT)
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

  res.status(200).json({ ...session, participant_count: 0 });
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
    .select(SESSION_SELECT)
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
    participantCounts.set(session.id, (await listParticipantsWithProgress(session.id)).participants.length);
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
    .select(SESSION_SELECT)
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
    // 🚨 이 경로는 학생도 부른다 — 문항별 집계(qaCompletion)는 교사 화면 전용이라 여기서 안 내보낸다.
    participants: (await listParticipantsWithProgress(session.id)).participants,
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

  const progress = await listParticipantsWithProgress(session.id);

  res.setHeader('Cache-Control', 'no-store');
  res.json({
    id: session.id,
    status: session.status,
    participants: progress.participants,
    // 교사 전용 — 문항별로 학생이 몇 명 도달했는지. 🚨 지금 이걸 그리는 화면은 없다
    //    (2026-08-12 교안 철거). 근거는 session-progress.ts 머리말.
    qa_completion: progress.qaCompletion,
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
    .select(SESSION_SELECT)
    .single();

  if (updateError || !updated) {
    res.status(500).json({ error: 'session_end_failed' });
    return;
  }

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
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

  const { error: deleteError } = await supabase
    .from('architecture_sessions')
    .delete()
    .eq('id', session.id);

  if (deleteError) {
    res.status(500).json({ error: 'session_delete_failed' });
    return;
  }

  res.status(204).end();
});

export default router;
