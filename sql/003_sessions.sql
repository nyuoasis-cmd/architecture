create table if not exists architecture_sessions (
  id uuid primary key default gen_random_uuid(),
  code char(6) unique not null,
  name text not null,
  teacher_id uuid not null references auth.users(id),
  chapter_ids int[] not null,
  status text not null default 'active' check (status in ('active', 'ended')),
  max_participants int not null default 100,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
create index if not exists idx_sessions_teacher on architecture_sessions(teacher_id);

create table if not exists architecture_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references architecture_sessions(id) on delete cascade,
  nickname text not null check (length(nickname) between 1 and 20),
  joined_at timestamptz not null default now()
);
create index if not exists idx_participants_session on architecture_participants(session_id);

create table if not exists architecture_progress (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references architecture_participants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  qa_id text not null,
  read_at timestamptz,
  quiz_score int,
  updated_at timestamptz not null default now(),
  constraint progress_mode_xor check (
    (participant_id is not null)::int + (user_id is not null)::int = 1
  )
);
create unique index if not exists progress_session_uniq
  on architecture_progress(participant_id, qa_id)
  where participant_id is not null;
create unique index if not exists progress_self_uniq
  on architecture_progress(user_id, qa_id)
  where user_id is not null;
create index if not exists idx_progress_participant on architecture_progress(participant_id);
create index if not exists idx_progress_user on architecture_progress(user_id);

alter table architecture_sessions enable row level security;
alter table architecture_participants enable row level security;
alter table architecture_progress enable row level security;

drop policy if exists sessions_owner_rw on architecture_sessions;
create policy sessions_owner_rw on architecture_sessions
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

drop policy if exists progress_self_rw on architecture_progress;
create policy progress_self_rw on architecture_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
