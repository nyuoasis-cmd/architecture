-- 004_qa_cleanup.sql — real-flow-qa run 이 생성한 데이터만 하드 삭제.
-- created_by_qa = true 행만 대상 (실유저 데이터 절대 무접촉).
-- FK 순서: progress → chats → participants → sessions (자식 먼저).
-- 감사 로그 architecture_qa_audit_log 는 보존(증거) — 여기서 삭제하지 않음.
--
-- 적용: psql 직접 실행.
--   전체 QA 데이터 정리:  psql "$DATABASE_URL" -f sql/004_qa_cleanup.sql
--   특정 run 만 정리:      psql "$DATABASE_URL" -v run_id=rfqa-arch-... -f sql/004_qa_cleanup.sql
--                         (값에 따옴표 불필요 — :'run_id' 로 안전 인용됨)

-- run_id 미바인딩 시 빈 문자열 기본값(전체 QA 행 정리). -v 로 넘긴 값은 유지.
\if :{?run_id}
\else
  \set run_id ''
\endif

DELETE FROM architecture_progress
 WHERE created_by_qa
   AND (:'run_id' = '' OR qa_run_id = :'run_id');

DELETE FROM architecture_chats
 WHERE created_by_qa
   AND (:'run_id' = '' OR qa_run_id = :'run_id');

DELETE FROM architecture_participants
 WHERE created_by_qa
   AND (:'run_id' = '' OR qa_run_id = :'run_id');

DELETE FROM architecture_sessions
 WHERE created_by_qa
   AND (:'run_id' = '' OR qa_run_id = :'run_id');
