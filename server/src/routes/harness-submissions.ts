import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { getRequestUser } from '../lib/auth';
import { getParticipantTokenFromRequest, verifyParticipantToken } from '../lib/participant-token';
import { getSupabaseAdminClient } from '../lib/supabase';
import { qaTagFields } from '../lib/qa-context';

const router = Router();

const OWNER_TOKEN_HEADER = 'x-harness-owner-token';
const MODULE_ID_PATTERN = /^module[1-6]$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const contentSchema = z.object({
  content: z.record(z.unknown()),
});

// 3-C: 참가자 토큰(세션 참가) > 로그인 유저 > 익명 owner-token(3-B, 하위호환) 순으로 시도.
// participant_id·user_id·owner_token 중 정확히 하나만 채워지는 게 DB XOR 제약(3-way)과 대응.
type SubmissionIdentity =
  | { kind: 'participant'; participantId: string }
  | { kind: 'user'; userId: string }
  | { kind: 'owner'; ownerToken: string };

async function resolveSubmissionIdentity(req: Request): Promise<SubmissionIdentity | null> {
  const participantToken = getParticipantTokenFromRequest(req);
  if (participantToken) {
    // progress.ts의 resolveProgressIdentity와 동일 시맨틱: 참가자 쿠키가 있으면 그게 권위
    // 신원이다 — 무효/만료여도 익명 owner-token으로 조용히 폴백하지 않고 바로 실패시킨다.
    const payload = verifyParticipantToken(participantToken);
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

    return { kind: 'participant', participantId: participant.id };
  }

  const user = await getRequestUser(req);
  if (user) {
    return { kind: 'user', userId: user.id };
  }

  const token = req.get(OWNER_TOKEN_HEADER);
  if (token && UUID_PATTERN.test(token)) {
    return { kind: 'owner', ownerToken: token };
  }

  return null;
}

function identityColumn(identity: SubmissionIdentity): { column: 'participant_id' | 'user_id' | 'owner_token'; value: string } {
  if (identity.kind === 'participant') return { column: 'participant_id', value: identity.participantId };
  if (identity.kind === 'user') return { column: 'user_id', value: identity.userId };
  return { column: 'owner_token', value: identity.ownerToken };
}

router.get('/:moduleId', async (req, res) => {
  const moduleId = req.params.moduleId;
  if (!MODULE_ID_PATTERN.test(moduleId)) {
    res.status(400).json({ error: 'invalid_module_id' });
    return;
  }

  let identity: SubmissionIdentity | null;
  try {
    identity = await resolveSubmissionIdentity(req);
  } catch (error) {
    if (error instanceof Error && error.message === 'session_closed') {
      res.status(410).json({ error: 'session_closed' });
      return;
    }
    res.status(500).json({ error: 'identity_resolution_failed' });
    return;
  }

  if (!identity) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const { column, value } = identityColumn(identity);
  const { data, error } = await supabase
    .from('architecture_submissions')
    .select('content, updated_at')
    .eq(column, value)
    .eq('module_id', moduleId)
    .limit(1);

  if (error) {
    res.status(500).json({ error: 'submission_lookup_failed' });
    return;
  }

  const row = data?.[0] as { content: unknown; updated_at: string } | undefined;
  res.setHeader('Cache-Control', 'no-store');
  res.json(row ? { content: row.content, updatedAt: row.updated_at } : null);
});

router.put('/:moduleId', async (req, res) => {
  const moduleId = req.params.moduleId;
  if (!MODULE_ID_PATTERN.test(moduleId)) {
    res.status(400).json({ error: 'invalid_module_id' });
    return;
  }

  const parsed = contentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    return;
  }

  let identity: SubmissionIdentity | null;
  try {
    identity = await resolveSubmissionIdentity(req);
  } catch (error) {
    if (error instanceof Error && error.message === 'session_closed') {
      res.status(410).json({ error: 'session_closed' });
      return;
    }
    res.status(500).json({ error: 'identity_resolution_failed' });
    return;
  }

  if (!identity) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const { column, value } = identityColumn(identity);
  const findExisting = () =>
    supabase.from('architecture_submissions').select('id').eq(column, value).eq('module_id', moduleId).limit(1);

  const { data: existingRows, error: existingError } = await findExisting();
  if (existingError) {
    res.status(500).json({ error: 'submission_lookup_failed' });
    return;
  }

  const existing = existingRows?.[0] as { id: string } | undefined;
  const now = new Date().toISOString();

  if (existing) {
    const { error } = await supabase
      .from('architecture_submissions')
      .update({ content: parsed.data.content, updated_at: now })
      .eq('id', existing.id);
    if (error) {
      res.status(500).json({ error: 'submission_update_failed' });
      return;
    }
  } else {
    const { error } = await supabase.from('architecture_submissions').insert({
      module_id: moduleId,
      content: parsed.data.content,
      updated_at: now,
      [column]: value,
      ...qaTagFields(),
    });
    if (error) {
      // 23505 = unique_violation — 동시 첫 저장(TOCTOU, 예: 두 탭)으로 그 사이 다른 요청이
      // 먼저 insert했을 가능성. existing 재조회 후 update로 재시도(멱등 저장 슬롯 의미 유지).
      if (error.code !== '23505') {
        res.status(500).json({ error: 'submission_insert_failed' });
        return;
      }

      const { data: retryRows, error: retryLookupError } = await findExisting();
      const retryExisting = retryRows?.[0] as { id: string } | undefined;
      if (retryLookupError || !retryExisting) {
        res.status(500).json({ error: 'submission_insert_failed' });
        return;
      }

      const { error: retryUpdateError } = await supabase
        .from('architecture_submissions')
        .update({ content: parsed.data.content, updated_at: now })
        .eq('id', retryExisting.id);
      if (retryUpdateError) {
        res.status(500).json({ error: 'submission_update_failed' });
        return;
      }
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, updatedAt: now });
});

export default router;
