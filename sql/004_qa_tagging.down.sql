-- 004_qa_tagging.down.sql — 004_qa_tagging.sql 회귀.
-- ⚠️ created_by_qa 행이 남아있으면 먼저 004_qa_cleanup.sql 로 정리 후 실행 권장.

DROP INDEX IF EXISTS idx_arch_sess_qa;
DROP INDEX IF EXISTS idx_arch_part_qa;
DROP INDEX IF EXISTS idx_arch_prog_qa;
DROP INDEX IF EXISTS idx_arch_chat_qa;

ALTER TABLE architecture_sessions     DROP COLUMN IF EXISTS qa_run_id, DROP COLUMN IF EXISTS created_by_qa;
ALTER TABLE architecture_participants DROP COLUMN IF EXISTS qa_run_id, DROP COLUMN IF EXISTS created_by_qa;
ALTER TABLE architecture_progress     DROP COLUMN IF EXISTS qa_run_id, DROP COLUMN IF EXISTS created_by_qa;
ALTER TABLE architecture_chats        DROP COLUMN IF EXISTS qa_run_id, DROP COLUMN IF EXISTS created_by_qa;

DROP TABLE IF EXISTS architecture_qa_audit_log;

NOTIFY pgrst, 'reload schema';
