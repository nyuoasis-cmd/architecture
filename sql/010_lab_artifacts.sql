-- 010_lab_artifacts.sql — 체험 산출물 계보 (SDD 체험 재구조화 결정 15).
--
-- 🔑 계보 = 12강 규칙 → 13강 스킬 → 16강 완료 조건 → 19강 약속 문장 → 22강 넘김 쪽지 → 23강 묶음.
--    강마다 학생이 만든 «한 장»을 참여자 토큰 기준으로 저장해, 기기가 바뀌어도 다음 차시에 이어진다.
--    23강 bundle 이 다섯 kind 를 불러와 묶는다(빠진 칸 = 그 강으로 돌아가는 문).
--
-- 🚨 **덧붙이기만 한다(append-only)** — 제출물(008)과 같은 이유. 고쳐 온 과정이 가치다.
-- 🚨 12강 rules 의 정본은 여전히 architecture_lab_submissions 다(판정 포함). 여기의 rules 행은
--    계보 조회용 사본이다 — 판정 없이 «마지막 내용»만 필요할 때(23강 bundle) 읽는다.
-- 🔑 신원은 008 과 같은 XOR — 수업 참여자(participant_id) 또는 자습 브라우저(owner_token).
--
-- 적용: psql 직접 실행(글로벌 표준, Dashboard paste 금지).
--   psql "$DATABASE_URL" -f sql/010_lab_artifacts.sql
-- 🚨 prod 적용 시점은 사용자 결정 — 서버 코드는 이 테이블이 없어도 죽지 않는다(커밋 5f6ed39 선례).

create table if not exists architecture_lab_artifacts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references architecture_participants(id) on delete cascade,
  owner_token text,
  -- 계보의 여섯 칸. 새 kind 는 지도(MAP) 개정과 함께만 늘어난다.
  kind text not null check (kind in ('rules', 'skill', 'ac', 'promise', 'handoff', 'bundle')),
  content text not null check (length(content) between 1 and 8000),
  revision int not null check (revision >= 1),
  created_at timestamptz not null default now(),
  constraint lab_artifacts_owner_xor check (
    (participant_id is not null)::int + (owner_token is not null)::int = 1
  )
);

-- 같은 판 번호 중복 방지(낙관적 잠금) — 008 과 같은 컨벤션.
create unique index if not exists lab_artifacts_participant_rev_uniq
  on architecture_lab_artifacts(participant_id, kind, revision)
  where participant_id is not null;
create unique index if not exists lab_artifacts_owner_rev_uniq
  on architecture_lab_artifacts(owner_token, kind, revision)
  where owner_token is not null;

-- «이 학생의 계보 지금»을 읽는 경로(23강 bundle).
create index if not exists idx_lab_artifacts_participant
  on architecture_lab_artifacts(participant_id, kind, revision desc);

alter table architecture_lab_artifacts enable row level security;
-- service_role 전용(클라 직접 접근 없음, 서버 라우트만 read/write) — 정책 0건 = deny-all.

-- PostgREST 스키마 캐시 리로드(신규 테이블 인식)
NOTIFY pgrst, 'reload schema';
