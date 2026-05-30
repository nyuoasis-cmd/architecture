-- 004_qa_tagging.sql — real-flow-qa 데이터 태깅 + 감사 로그.
-- 모든 변경 additive (nullable 컬럼 / default false / IF NOT EXISTS) — 기존 동작 무영향.
--
-- 적용: psql 직접 실행(글로벌 표준, Dashboard paste 금지).
--   ⚠️ 선행조건 — 태깅 코드(PR1 라우트 qaTagFields spread) 배포 *전에* prod 에 먼저 적용.
--                미적용 상태로 배포 시 42703(undefined column) 폭발.
-- 회귀: 004_qa_tagging.down.sql · 정리: 004_qa_cleanup.sql
--
-- 공유 ref jblkbztpbwqidfvmmoey (ai-app-builder·sprint 등 14프로젝트 공유 DB).
-- architecture_* 전용 컬럼 + 전용 architecture_qa_audit_log → 타 프로젝트 테이블 무접촉.
-- additive 라 도미노 없음. (기존 qa_audit_log/sprint_qa_audit_log 와 명칭 분리.)

-- ── 태깅 컬럼 (QA 가 생성하는 architecture 자기 테이블 4종) ──────────────
ALTER TABLE architecture_sessions     ADD COLUMN IF NOT EXISTS qa_run_id TEXT, ADD COLUMN IF NOT EXISTS created_by_qa BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE architecture_participants ADD COLUMN IF NOT EXISTS qa_run_id TEXT, ADD COLUMN IF NOT EXISTS created_by_qa BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE architecture_progress     ADD COLUMN IF NOT EXISTS qa_run_id TEXT, ADD COLUMN IF NOT EXISTS created_by_qa BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE architecture_chats        ADD COLUMN IF NOT EXISTS qa_run_id TEXT, ADD COLUMN IF NOT EXISTS created_by_qa BOOLEAN NOT NULL DEFAULT false;

-- ── 부분 인덱스 (created_by_qa 행만 — QA run 조회·정리용) ──────────────
CREATE INDEX IF NOT EXISTS idx_arch_sess_qa  ON architecture_sessions(qa_run_id)     WHERE created_by_qa;
CREATE INDEX IF NOT EXISTS idx_arch_part_qa  ON architecture_participants(qa_run_id) WHERE created_by_qa;
CREATE INDEX IF NOT EXISTS idx_arch_prog_qa  ON architecture_progress(qa_run_id)     WHERE created_by_qa;
CREATE INDEX IF NOT EXISTS idx_arch_chat_qa  ON architecture_chats(qa_run_id)        WHERE created_by_qa;

-- ── 감사 로그 (teacher 토큰 발급마다 1행) ──────────────────────────────
-- 전용 명칭 architecture_qa_audit_log: 공유 DB 의 기존 qa_audit_log/sprint_qa_audit_log 와 혼선 회피.
CREATE TABLE IF NOT EXISTS architecture_qa_audit_log (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id     TEXT NOT NULL,
    account_id UUID,
    role       TEXT,
    source_ip  TEXT,
    browser_id TEXT,
    issued_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_arch_qa_audit_run ON architecture_qa_audit_log(run_id);

-- service_role 전용(클라 직접 접근 없음). RLS ENABLE + 정책 0 = deny-all (anon 차단, service_role 우회).
ALTER TABLE architecture_qa_audit_log ENABLE ROW LEVEL SECURITY;

-- PostgREST 스키마 캐시 리로드 (신규 컬럼·테이블 인식)
NOTIFY pgrst, 'reload schema';
