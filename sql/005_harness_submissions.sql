-- 005_harness_submissions.sql — 하네스 심화 트랙(/harness/*) 학생 제출 슬롯(3-B).
-- 신규 테이블만 추가(기존 테이블 무변경) — additive, 회귀 0.
--
-- 적용: psql 직접 실행(글로벌 표준, Dashboard paste 금지).
--   psql "$DATABASE_URL" -f sql/005_harness_submissions.sql
--
-- 배경: /harness/*는 로그인·세션 참가(6자리 코드) 없는 완전 오픈 프리뷰(3-C가 그 인프라를 만들 예정).
-- 기존 architecture_progress/architecture_chats의 participant_id(FK→architecture_participants)
-- XOR 패턴을 그대로 못 씀 → owner_token(익명 브라우저 토큰, 클라 자체 생성, 서명 없음) XOR user_id.
-- 공유 ref jblkbztpbwqidfvmmoey(14프로젝트 공유 DB). architecture_* 전용 테이블 → 타 프로젝트 무접촉.

create table if not exists architecture_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_token text,
  user_id uuid references auth.users(id) on delete cascade,
  module_id text not null check (module_id ~ '^module[1-6]$'),
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  qa_run_id text,
  created_by_qa boolean not null default false,
  constraint submissions_owner_xor check (
    (owner_token is not null)::int + (user_id is not null)::int = 1
  )
);

create unique index if not exists submissions_owner_module_uniq
  on architecture_submissions(owner_token, module_id)
  where owner_token is not null;
create unique index if not exists submissions_user_module_uniq
  on architecture_submissions(user_id, module_id)
  where user_id is not null;
create index if not exists idx_arch_submissions_qa
  on architecture_submissions(qa_run_id)
  where created_by_qa;

alter table architecture_submissions enable row level security;
-- service_role 전용(클라 직접 접근 없음, 서버 라우트만 read/write) — 정책 0건 = deny-all(anon/authenticated 차단),
-- service_role은 RLS 우회. sql/004_qa_tagging.sql의 architecture_qa_audit_log와 동일 컨벤션.

-- PostgREST 스키마 캐시 리로드(신규 테이블 인식)
NOTIFY pgrst, 'reload schema';
