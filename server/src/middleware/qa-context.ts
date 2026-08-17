// qaContextMiddleware — 요청을 QA run 컨텍스트로 감싼다.
// index.ts 는 QA_AUTH_ENABLED==='true' 일 때만 이 미들웨어를 mount(미설정=미마운트=부수효과 0).
// 포팅 원본: sprint/server/src/middleware/qa-context.ts (architecture 적응 — session-scope 2경로).
//
// runId 출처는 둘뿐, 그 외 X-QA-Run-Id 는 무시(실유저가 자기 데이터를 QA로 태깅→삭제 못하게):
//   (A) 인증 QA teacher 요청  — Bearer 가 화이트리스트 QA teacher 계정(+is_qa)일 때만 헤더 신뢰.
//   (B) QA 세션 스코프 상속(anon 학생) — 요청이 가리키는 세션이 created_by_qa 면 그 세션의 qa_run_id 사용.
//        architecture 는 세션 식별 경로가 둘: ① join body.code(6자리) ② progress arch_pt 참가자 토큰→session_id.
//
// 성능/안전: X-QA-Run-Id 헤더가 없으면 즉시 통과(실유저 트래픽은 이 헤더를 보내지 않으므로 DB 조회 0).
//   실유저가 헤더를 위조해도 자기 세션은 비-QA 라 컨텍스트 미설정 → 데이터 절대 미태깅.

import { type Request, type Response, type NextFunction } from 'express';
import { runWithQaContext } from '../lib/qa-context';
import { resolveQaAccountFromAuthHeader } from '../routes/qa-auth';
import { getSupabaseAdminClient } from '../lib/supabase';
import { getParticipantTokenFromRequest, verifyParticipantToken } from '../lib/participant-token';

interface SessionQaTag { created_by_qa: boolean; qa_run_id: string | null }

/** 세션 code(join body.code) 로 created_by_qa/qa_run_id 조회. */
async function getSessionQaTagByCode(code: string): Promise<SessionQaTag | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('architecture_sessions')
    .select('created_by_qa, qa_run_id')
    .eq('code', String(code).toUpperCase())
    .maybeSingle();
  if (error || !data) return null;
  return data as SessionQaTag;
}

/** 세션 id(participant 토큰 payload.session_id) 로 created_by_qa/qa_run_id 조회. */
async function getSessionQaTagById(sessionId: string): Promise<SessionQaTag | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('architecture_sessions')
    .select('created_by_qa, qa_run_id')
    .eq('id', sessionId)
    .maybeSingle();
  if (error || !data) return null;
  return data as SessionQaTag;
}

/** 요청에서 세션 스코프 태그 해석: join body.code → 실패 시 arch_pt 참가자 토큰 session_id. */
async function resolveSessionScopeTag(req: Request): Promise<SessionQaTag | null> {
  const bodyCode = typeof req.body?.code === 'string' ? req.body.code : undefined;
  if (bodyCode) {
    const byCode = await getSessionQaTagByCode(bodyCode);
    if (byCode) return byCode;
  }
  const token = getParticipantTokenFromRequest(req);
  if (token) {
    const payload = verifyParticipantToken(token);
    if (payload?.session_id) {
      return getSessionQaTagById(payload.session_id);
    }
  }
  return null;
}

/** X-QA-Browser-Id 정규화 (spec idx 1..30 문자열). */
function normalizeBrowserId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = String(raw).trim();
  if (!trimmed) return undefined;
  if (trimmed.length > 64) return undefined;
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return undefined;
  return trimmed;
}

export async function qaContextMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const runIdHeader = req.header('X-QA-Run-Id');
  if (!runIdHeader) {
    next();
    return;
  }

  const browserId = normalizeBrowserId(req.header('X-QA-Browser-Id'));

  // (A) 인증 QA teacher — Bearer 토큰이 화이트리스트 teacher 계정(+is_qa)일 때만 헤더 신뢰.
  const qaAccount = await resolveQaAccountFromAuthHeader(req.header('authorization'));
  if (qaAccount) {
    runWithQaContext(
      { runId: runIdHeader, source: 'auth', role: qaAccount.role, accountId: qaAccount.accountId, browserId },
      () => next(),
    );
    return;
  }

  // (B) QA 세션 스코프 상속(anon 학생). 세션이 created_by_qa 면 그 세션의 qa_run_id 로 태깅.
  //     비-QA 세션이면 컨텍스트 미설정(실유저 데이터 절대 미태깅).
  try {
    const tag = await resolveSessionScopeTag(req);
    if (tag?.created_by_qa && tag.qa_run_id) {
      runWithQaContext({ runId: tag.qa_run_id, source: 'session', browserId }, () => next());
      return;
    }
  } catch (err) {
    // QA 스코프 판정 실패는 요청을 막지 않는다(비-QA로 안전하게 통과).
    console.warn('[qaContextMiddleware] session-scope resolve failed', err);
  }

  next();
}
