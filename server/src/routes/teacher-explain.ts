import { Router } from 'express';
import { z } from 'zod';
import { getQaChapterId } from '../data/qa-meta';
import { getTeacherExplainBlock } from '../data/teacher-explain';
import { getRequestUser } from '../lib/auth';
import { getSupabaseAdminClient } from '../lib/supabase';

const router = Router();

const qaIdSchema = z.string().regex(/^ch(0[1-9]|10)_q(0[1-9]|10)$/);
const sessionIdSchema = z.string().uuid();

type SessionLookupRow = {
  id: string;
  teacher_id: string;
  chapter_ids: number[];
};

router.get('/:qaId', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const parsedQaId = qaIdSchema.safeParse(req.params.qaId);
  if (!parsedQaId.success) {
    res.status(400).json({ error: 'invalid_qa_id' });
    return;
  }

  const parsedSessionId = sessionIdSchema.safeParse(req.query.sessionId);
  if (!parsedSessionId.success) {
    res.status(400).json({ error: 'invalid_session_id' });
    return;
  }

  const user = await getRequestUser(req);
  if (!user) {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const { data: session, error: sessionError } = await supabase
    .from('architecture_sessions')
    .select('id, teacher_id, chapter_ids')
    .eq('id', parsedSessionId.data)
    .maybeSingle();

  if (sessionError || !session) {
    res.status(404).json({ error: 'session_not_found' });
    return;
  }

  const typedSession = session as SessionLookupRow;
  if (typedSession.teacher_id !== user.id) {
    res.status(403).json({ error: 'not_session_teacher' });
    return;
  }

  const chapterId = getQaChapterId(parsedQaId.data);
  if (!chapterId) {
    res.status(404).json({ error: 'qa_not_found' });
    return;
  }

  if (!typedSession.chapter_ids.includes(chapterId)) {
    res.status(403).json({ error: 'qa_not_in_session' });
    return;
  }

  const block = getTeacherExplainBlock(parsedQaId.data);
  if (!block) {
    res.status(404).json({ error: 'qa_not_found' });
    return;
  }

  res.status(200).json(block);
});

export default router;
