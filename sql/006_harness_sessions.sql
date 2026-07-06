-- 006_harness_sessions.sql — 하네스 심화 트랙(/harness/*) 세션 연동(3-C).
-- 기존 세션/참가자 인프라(architecture_sessions/architecture_participants)를 재사용하되,
-- 챕터(1~10) 기반 /learn과 구분하기 위한 mode 컬럼만 추가한다(신규 테이블 없음).
--
-- 적용: psql 직접 실행(글로벌 표준, Dashboard paste 금지).
--   psql "$DATABASE_URL" -f sql/006_harness_sessions.sql

ALTER TABLE architecture_sessions
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'learn'
  CHECK (mode IN ('learn', 'harness'));

-- architecture_submissions: owner_token XOR user_id(3-B) → 3-way로 확장(참가자 신원 추가).
ALTER TABLE architecture_submissions
  ADD COLUMN IF NOT EXISTS participant_id UUID REFERENCES architecture_participants(id) ON DELETE CASCADE;

ALTER TABLE architecture_submissions DROP CONSTRAINT IF EXISTS submissions_owner_xor;
ALTER TABLE architecture_submissions ADD CONSTRAINT submissions_owner_xor CHECK (
  (owner_token IS NOT NULL)::int + (user_id IS NOT NULL)::int + (participant_id IS NOT NULL)::int = 1
);

CREATE UNIQUE INDEX IF NOT EXISTS submissions_participant_module_uniq
  ON architecture_submissions(participant_id, module_id)
  WHERE participant_id IS NOT NULL;

-- PostgREST 스키마 캐시 리로드(신규 컬럼 인식)
NOTIFY pgrst, 'reload schema';
