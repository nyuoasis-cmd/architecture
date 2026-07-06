-- 006_harness_sessions.down.sql — 006_harness_sessions.sql 회귀.
-- psql "$DATABASE_URL" -f sql/006_harness_sessions.down.sql
-- ⚠️ participant_id가 실제로 쓰인 행이 있으면(참가자 귀속 제출 존재) 2-way 제약 재생성이
-- 실패한다(그 행은 owner_token/user_id 둘 다 null). 롤백 전 해당 행을 먼저 정리할 것.

DROP INDEX IF EXISTS submissions_participant_module_uniq;

ALTER TABLE architecture_submissions DROP CONSTRAINT IF EXISTS submissions_owner_xor;
ALTER TABLE architecture_submissions ADD CONSTRAINT submissions_owner_xor CHECK (
  (owner_token IS NOT NULL)::int + (user_id IS NOT NULL)::int = 1
);
ALTER TABLE architecture_submissions DROP COLUMN IF EXISTS participant_id;

ALTER TABLE architecture_sessions DROP COLUMN IF EXISTS mode;

NOTIFY pgrst, 'reload schema';
