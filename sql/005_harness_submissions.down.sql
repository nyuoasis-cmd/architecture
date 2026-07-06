-- 005_harness_submissions.down.sql — 005_harness_submissions.sql 회귀.
-- psql "$DATABASE_URL" -f sql/005_harness_submissions.down.sql

drop table if exists architecture_submissions;

NOTIFY pgrst, 'reload schema';
