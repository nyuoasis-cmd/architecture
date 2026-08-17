import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { getRequestUser } from '../lib/auth';
import { getParticipantTokenFromRequest, verifyParticipantToken } from '../lib/participant-token';
import { generateSessionCode } from '../lib/session-code';
import { summarizeSessionActivity, type ActivityProgressRow } from '../lib/session-activity';
import { tallyLabMissions, tallyProgressRows, type ProgressRow } from '../lib/session-progress';

/** Postgres `undefined_column`. 🔑 «칸이 아직 없다»와 «DB 가 고장났다»는 조치가 다르다. */
const UNDEFINED_COLUMN = '42703';
import { getSupabaseAdminClient } from '../lib/supabase';
import { qaTagFields } from '../lib/qa-context';
import { ALL_CHAPTER_IDS, getChapterContexts, getQaContextById } from '../data/chapter-content';

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


/** IN 목록 한 번에 넣을 id 개수. 요청 길이(URL) 가 터지지 않을 만큼만. */
const ID_CHUNK = 100;
/** PostgREST 한 응답의 행 상한. 이보다 적게 오면 그 조각은 끝난 것이다. */
const ROW_PAGE = 1000;

/**
 * id 목록을 쪼개고 페이지를 끝까지 넘겨 **전부** 가져온다.
 *
 * 🚨 이 함수가 없으면 잘림이 «에러»가 아니라 «더 작은 숫자»로 나온다 — 교사 화면이
 *    조용히 덜 센다. 200명 × 여러 수업이면 참여자만으로도 1,000행을 넘긴다.
 */
async function selectAllPaged<T>(
  ids: readonly string[],
  query: (chunk: string[], from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T[]> {
  const out: T[] = [];

  for (let index = 0; index < ids.length; index += ID_CHUNK) {
    const chunk = ids.slice(index, index + ID_CHUNK);
    if (chunk.length === 0) {
      continue;
    }

    for (let from = 0; ; from += ROW_PAGE) {
      const { data, error } = await query(chunk, from, from + ROW_PAGE - 1);
      if (error) {
        throw new Error('paged_lookup_failed');
      }

      const rows = (data ?? []) as T[];
      out.push(...rows);
      if (rows.length < ROW_PAGE) {
        break;
      }
    }
  }

  return out;
}

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

  // 🔑 실습 미션 칸을 같은 쿼리에서 가져온다 — 교사 화면 때문에 쿼리를 늘리지 않는다(t1).
  // 🚨 **칸이 아직 없어도 화면이 죽지 않는다.** 마이그레이션(sql/009)을 안 올린 채 이 코드가 뜨면
  //    예전에는 여기가 `progress_lookup_failed` 로 터져 **교사 화면 전체가 500** 이 됐다 —
  //    배포 순서 하나가 수업을 멈추는 자리였다. 칸이 없으면 실습 표기만 접고 문항 단위로 돌아간다.
  //    (2026-08-17: 「스키마부터 올려야 머지 가능」이라는 제약을 코드에서 없앴다.)
  let progressRows: ProgressRow[] | null = null;
  const withLab = await supabase
    .from('architecture_progress')
    .select('participant_id, qa_id, lab_mission_index, lab_earned_index')
    .in('participant_id', participantIds);
  if (withLab.error && withLab.error.code === UNDEFINED_COLUMN) {
    const withoutLab = await supabase
      .from('architecture_progress')
      .select('participant_id, qa_id')
      .in('participant_id', participantIds);
    if (withoutLab.error) {
      throw new Error('progress_lookup_failed');
    }
    progressRows = withoutLab.data as ProgressRow[];
  } else if (withLab.error) {
    throw new Error('progress_lookup_failed');
  } else {
    progressRows = withLab.data as ProgressRow[];
  }

  // 같은 행을 참여자별·문항별 두 축으로 센다(session-progress.ts) — 쿼리는 늘지 않는다.
  const { countsByParticipant: counts, qaCompletion } = tallyProgressRows(progressRows ?? []);
  const labByParticipant = tallyLabMissions(progressRows ?? []);

  return {
    participants: typedParticipants.map((participant) => ({
      id: participant.id,
      nickname: participant.nickname,
      joined_at: participant.joined_at,
      progress_count: counts.get(participant.id) ?? 0,
      // 🔑 실습에 아직 안 들어온 학생에게는 아예 안 붙인다 — 「실습 0/7」은 «시작했는데 못 하고 있다»로
      //    읽히고, 그건 실습 문항을 안 연 학생에게 거짓이다.
      ...(labByParticipant.get(participant.id) ?? {}),
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

  // 🔑 수업 수만큼 쿼리를 날리지 않는다 — 참여자·진도를 통째로 모아 온다. 목록은 교사가
  //    수업 중에 가장 자주 새로고침하는 화면이라, 여기서 N+1 이면 반이 클 때 그대로 느려진다.
  //    (이전에는 수업 하나당 listParticipantsWithProgress 를 불러 2N 쿼리였다.)
  // 🚨 그런데 «한 번에 다»는 두 군데서 조용히 잘린다: PostgREST 의 행 상한(기본 1,000)과
  //    IN 목록이 길어질 때의 요청 길이. 잘리면 에러가 아니라 **더 작은 숫자**가 나와서,
  //    교사 화면이 «덜 참여한 반»처럼 보인다 — 그게 이 앱에서 가장 나쁜 종류의 거짓말이다.
  //    그래서 id 는 쪼개고(chunk) 페이지는 끝까지 넘긴다(range).
  const sessionIds = sessions.map((session) => session.id);
  const participantsBySession = new Map<string, { id: string; nickname: string }[]>();
  const progressByParticipant = new Map<string, ActivityProgressRow[]>();

  if (sessionIds.length > 0) {
    let participants: { id: string; nickname: string; session_id: string }[];
    let progressRows: ActivityProgressRow[];

    try {
      participants = await selectAllPaged<{ id: string; nickname: string; session_id: string }>(
        sessionIds,
        (chunk, from, to) =>
          supabase
            .from('architecture_participants')
            .select('id, nickname, session_id')
            .in('session_id', chunk)
            .order('id', { ascending: true })
            .range(from, to),
      );

      progressRows = await selectAllPaged<ActivityProgressRow>(
        participants.map((participant) => participant.id),
        (chunk, from, to) =>
          supabase
            .from('architecture_progress')
            .select('participant_id, qa_id, read_at, quiz_score')
            .in('participant_id', chunk)
            .order('id', { ascending: true })
            .range(from, to),
      );
    } catch {
      res.status(500).json({ error: 'session_list_failed' });
      return;
    }

    for (const participant of participants) {
      const bucket = participantsBySession.get(participant.session_id) ?? [];
      bucket.push({ id: participant.id, nickname: participant.nickname });
      participantsBySession.set(participant.session_id, bucket);
    }

    for (const row of progressRows) {
      if (!row.participant_id) {
        continue;
      }
      const bucket = progressByParticipant.get(row.participant_id) ?? [];
      bucket.push(row);
      progressByParticipant.set(row.participant_id, bucket);
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  res.json(
    sessions.map((session) => {
      const participants = participantsBySession.get(session.id) ?? [];
      const progressRows = participants.flatMap((participant) => progressByParticipant.get(participant.id) ?? []);
      const totalQas = session.chapter_ids.reduce(
        (sum, chapterId) => sum + getChapterContexts(chapterId).length,
        0,
      );
      const activity = summarizeSessionActivity({
        participants,
        progressRows,
        totalQas,
        titleOf: (qaId) => getQaContextById(qaId)?.title,
      });

      return {
        ...session,
        // 🚨 participant_count 는 기존 클라이언트가 읽는 이름이라 남긴다 — 배포 시차 동안
        //    두 이름이 같은 값을 가리킨다. student_count 가 §4 스펙의 이름이다.
        participant_count: activity.student_count,
        ...activity,
      };
    }),
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
