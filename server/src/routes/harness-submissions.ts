import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { getRequestUser } from '../lib/auth';
import { getSupabaseAdminClient } from '../lib/supabase';
import { qaTagFields } from '../lib/qa-context';

const router = Router();

const OWNER_TOKEN_HEADER = 'x-harness-owner-token';
const MODULE_ID_PATTERN = /^module[1-6]$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const contentSchema = z.object({
  content: z.record(z.unknown()),
});

type SubmissionIdentity = { ownerToken: string; userId?: undefined } | { ownerToken?: undefined; userId: string };

async function resolveSubmissionIdentity(req: Request): Promise<SubmissionIdentity | null> {
  const user = await getRequestUser(req);
  if (user) {
    return { userId: user.id };
  }

  const token = req.get(OWNER_TOKEN_HEADER);
  if (token && UUID_PATTERN.test(token)) {
    return { ownerToken: token };
  }

  return null;
}

router.get('/:moduleId', async (req, res) => {
  const moduleId = req.params.moduleId;
  if (!MODULE_ID_PATTERN.test(moduleId)) {
    res.status(400).json({ error: 'invalid_module_id' });
    return;
  }

  const identity = await resolveSubmissionIdentity(req);
  if (!identity) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const query = identity.ownerToken
    ? supabase
        .from('architecture_submissions')
        .select('content, updated_at')
        .eq('owner_token', identity.ownerToken)
        .eq('module_id', moduleId)
    : supabase
        .from('architecture_submissions')
        .select('content, updated_at')
        .eq('user_id', identity.userId)
        .eq('module_id', moduleId);

  const { data, error } = await query.limit(1);
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

  const identity = await resolveSubmissionIdentity(req);
  if (!identity) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    res.status(503).json({ error: 'db_not_configured' });
    return;
  }

  const findExisting = () =>
    identity.ownerToken
      ? supabase
          .from('architecture_submissions')
          .select('id')
          .eq('owner_token', identity.ownerToken)
          .eq('module_id', moduleId)
          .limit(1)
      : supabase
          .from('architecture_submissions')
          .select('id')
          .eq('user_id', identity.userId)
          .eq('module_id', moduleId)
          .limit(1);

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
      ...(identity.ownerToken ? { owner_token: identity.ownerToken } : { user_id: identity.userId }),
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
