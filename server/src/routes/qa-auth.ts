// QA test-only 인증 엔드포인트 (real-flow-qa PR1).
// POST /api/qa/auth/token — 사전 프로비저닝된 QA *teacher* 계정으로만 세션 토큰 발급.
//   architecture 학생 join 은 anon POST 라 학생 토큰 발급은 불필요 — teacher 만 발급.
//   임의 실유저 세션 발급은 코드로 불가능(요청 본문에 email/uid 필드 자체가 없음).
//
// 보안 게이트:
//   1) enablement: QA_AUTH_ENABLED==='true' 일 때만 index.ts 가 라우터를 mount(미설정=404)
//   2) 시크릿: X-QA-Secret == QA_AUTH_SECRET (timingSafeEqual + 길이 선검사 fail-closed 401)
//   3) 화이트리스트: teacher 계정 UUID 가 env 에 있을 때만
//   4) QA 마커: 발급 직전 user.app_metadata.is_qa===true 재확인(실유저 credential 오설정 차단)
//   5) 감사: 발급마다 architecture_qa_audit_log INSERT (공유 DB ref 충돌 회피 — 전용 테이블)

import { Router, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from '../lib/supabase';

type QaRole = 'teacher';

function resolveAnonClientConfig(): { url: string; anonKey: string } {
  return {
    url: (process.env.SUPABASE_URL || '').replace(/\s/g, ''),
    anonKey: (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').replace(/\s/g, ''),
  };
}

interface QaAccountEnv { email?: string; password?: string; id?: string; }

function accountForRole(_role: QaRole): QaAccountEnv {
  return {
    email: process.env.QA_ACCOUNT_TEACHER_EMAIL,
    password: process.env.QA_ACCOUNT_TEACHER_PW,
    id: process.env.QA_ACCOUNT_TEACHER_ID,
  };
}

// ── 순수 검증 헬퍼 ──────────────────────────────────────────────────

/**
 * 상수시간 시크릿 비교. 길이 불일치 시 timingSafeEqual 이 throw 하므로
 * Buffer 길이를 선검사해 불일치면 fail-closed false 반환(우발적 500 금지).
 */
export function secretMatches(provided: string): boolean {
  const secret = (process.env.QA_AUTH_SECRET || '').trim();
  if (!secret) return false; // 시크릿 미설정이면 무조건 거부
  const a = Buffer.from(String(provided ?? ''), 'utf8');
  const b = Buffer.from(secret, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function isValidRole(value: unknown): value is QaRole {
  return value === 'teacher';
}

export function isValidRunId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 128;
}

/** app_metadata.is_qa===true 인지(QA 마커). */
function hasQaMarker(appMetadata: unknown): boolean {
  return !!appMetadata && typeof appMetadata === 'object'
    && (appMetadata as { is_qa?: unknown }).is_qa === true;
}

// ── 미들웨어용: Bearer 토큰이 화이트리스트 QA teacher 계정인지 검증 ──────────
// X-QA-Run-Id 헤더는 이 검증을 통과한 인증 QA teacher 요청에서만 신뢰된다.
// 학생은 anon 이라 (A) 경로를 타지 않고 (B) 세션 스코프 상속만 사용.
export async function resolveQaAccountFromAuthHeader(
  authHeader?: string,
): Promise<{ accountId: string; role: QaRole } | null> {
  if (process.env.QA_AUTH_ENABLED !== 'true') return null;
  const supabase = getSupabaseAdminClient();
  if (!authHeader || !supabase) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  if (!hasQaMarker(user.app_metadata)) return null; // QA 마커 없으면 거부
  if (user.id === process.env.QA_ACCOUNT_TEACHER_ID) return { accountId: user.id, role: 'teacher' };
  return null;
}

// ── 라우터 ───────────────────────────────────────────────────────────
const router = Router();

router.post('/auth/token', async (req: Request, res: Response) => {
  // (2) 시크릿 — 길이불일치 포함 모든 불일치는 fail-closed 401
  const provided = req.header('X-QA-Secret') ?? '';
  if (!secretMatches(provided)) {
    res.status(401).json({ error: 'INVALID_SECRET' });
    return;
  }

  // (3) role / run_id — 임의 email/account_id 필드는 받지 않음(구조적 차단). teacher 만 허용.
  const role: unknown = req.body?.role;
  const runId: unknown = req.body?.run_id;
  if (!isValidRole(role)) {
    res.status(400).json({ error: 'INVALID_ROLE' });
    return;
  }
  if (!isValidRunId(runId)) {
    res.status(400).json({ error: 'INVALID_RUN_ID' });
    return;
  }

  const account = accountForRole(role);
  if (!account.email || !account.password || !account.id) {
    res.status(403).json({ error: 'QA_ACCOUNT_NOT_CONFIGURED' });
    return;
  }
  const { url: supabaseUrl, anonKey } = resolveAnonClientConfig();
  if (!supabaseUrl || !anonKey) {
    res.status(403).json({ error: 'QA_AUTH_NOT_CONFIGURED' });
    return;
  }

  // (4) anon client 로 signInWithPassword — service_role 로 임의 유저 세션 mint 안 함
  const anonClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anonClient.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  if (error || !data?.session || !data?.user) {
    res.status(403).json({ error: 'QA_SIGNIN_FAILED' });
    return;
  }

  // (4-재확인 ①) 반환 user.id 가 화이트리스트 UUID 와 일치(이메일↔UUID 변조 방지)
  if (data.user.id !== account.id) {
    await anonClient.auth.signOut();
    res.status(403).json({ error: 'QA_ID_MISMATCH' });
    return;
  }
  // (4-재확인 ②) app_metadata.is_qa===true — 실유저 credential 오설정 차단
  if (!hasQaMarker(data.user.app_metadata)) {
    await anonClient.auth.signOut();
    res.status(403).json({ error: 'NOT_QA_ACCOUNT' });
    return;
  }

  // (5) 감사 로그 — service_role client, 전용 테이블 architecture_qa_audit_log (sql/004 선적용 의무)
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const browserIdRaw = req.header('X-QA-Browser-Id');
    const browserId = browserIdRaw && /^[a-zA-Z0-9._-]+$/.test(browserIdRaw) && browserIdRaw.length <= 64
      ? browserIdRaw.trim()
      : null;
    await supabase.from('architecture_qa_audit_log').insert({
      run_id: runId,
      account_id: data.user.id,
      role,
      source_ip: req.ip ?? null,
      browser_id: browserId,
    });
  }

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    account_id: data.user.id,
    role,
    expires_at: data.session.expires_at ?? null,
  });
});

export default router;
