-- 008_lab_submissions.sql — 12강 실습실 제출물.
--
-- 🚨 **덧붙이기만 한다(append-only).** 한 번 낸 것은 고치지 않고 새 판(revision)을 쌓는다.
--    학생이 고쳐 낼 때마다 이전 판이 사라지면, 교사는 「무엇을 어떻게 고쳐 왔는가」를 못 본다 —
--    그게 이 수업에서 실제로 볼 가치가 있는 유일한 것이다(결과가 아니라 고쳐 온 과정).
--
-- 🚨 **판정은 서버가 저장된 본문으로 다시 낸다.** 클라이언트가 보낸 판정은 저장하지 않는다 —
--    화면이 보낸 «통과했어요»는 근거가 아니다(채점 로그와 같은 이유로 위조된다).
--
-- 🔑 신원은 기존 XOR 패턴 그대로 — 수업 참여자(participant_id) 또는 자습 브라우저(owner_token).
--    로그인이 없는 화면이라 user_id 갈래는 두지 않는다.
--
-- 적용: psql 직접 실행(글로벌 표준, Dashboard paste 금지).
--   psql "$DATABASE_URL" -f sql/008_lab_submissions.sql

create table if not exists architecture_lab_submissions (
  id uuid primary key default gen_random_uuid(),
  -- 수업 참여자. 세션이 지워지면 같이 지워진다(수업 데이터는 수업과 함께 산다).
  participant_id uuid references architecture_participants(id) on delete cascade,
  -- 자습(라이브러리)에서 낸 것. 서명 없는 브라우저 토큰이라 «누구»를 증명하지 않는다.
  owner_token text,
  qa_id text not null,
  -- 🔑 1부터 올라가는 판 번호. 같은 학생의 같은 문항에서 유일하다.
  revision int not null check (revision >= 1),
  -- 학생이 쓴 규칙 문서 원문.
  rules text not null check (length(rules) between 1 and 8000),
  -- 서버가 낸 판정. { outputs: [...], rows: [...], passed: n, total: n }
  -- 🚨 이 칸은 **서버만 쓴다.** 클라이언트 판정이 여기 들어오면 저장할 이유가 없어진다.
  verdict jsonb,
  created_at timestamptz not null default now(),
  constraint lab_submissions_owner_xor check (
    (participant_id is not null)::int + (owner_token is not null)::int = 1
  )
);

-- 🚨 같은 판 번호를 두 번 쓰지 못하게. 두 탭에서 동시에 내면 뒤엣것이 여기서 튕기고,
--    화면은 «다시 눌러 주세요»가 아니라 **최신 판을 읽어 이어서** 낸다(낙관적 잠금).
create unique index if not exists lab_submissions_participant_rev_uniq
  on architecture_lab_submissions(participant_id, qa_id, revision)
  where participant_id is not null;
create unique index if not exists lab_submissions_owner_rev_uniq
  on architecture_lab_submissions(owner_token, qa_id, revision)
  where owner_token is not null;

-- 교사 화면이 «이 수업의 지금»을 읽는 경로.
create index if not exists idx_lab_submissions_participant
  on architecture_lab_submissions(participant_id, qa_id, revision desc);

alter table architecture_lab_submissions enable row level security;
-- service_role 전용(클라 직접 접근 없음, 서버 라우트만 read/write) — 정책 0건 = deny-all.
-- 기존 architecture_submissions 와 같은 컨벤션.

-- PostgREST 스키마 캐시 리로드(신규 테이블 인식)
NOTIFY pgrst, 'reload schema';
