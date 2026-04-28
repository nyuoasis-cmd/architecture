create extension if not exists pgcrypto;

create table if not exists architecture_sessions (
  id uuid primary key default gen_random_uuid(),
  code char(6) unique not null,
  name text not null,
  teacher_id uuid not null references auth.users(id),
  chapter_ids int[] not null,
  status text not null default 'active',
  max_participants int not null default 100,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists architecture_sessions_teacher_id_idx on architecture_sessions(teacher_id);

create table if not exists architecture_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references architecture_sessions(id),
  nickname text not null,
  joined_at timestamptz not null default now()
);

create index if not exists architecture_participants_session_id_idx on architecture_participants(session_id);

create table if not exists architecture_progress (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references architecture_participants(id),
  user_id uuid references auth.users(id),
  qa_id text not null,
  read_at timestamptz,
  quiz_score int,
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

create index if not exists architecture_progress_participant_id_idx on architecture_progress(participant_id);
create index if not exists architecture_progress_user_id_idx on architecture_progress(user_id);

create table if not exists architecture_chats (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references architecture_participants(id),
  user_id uuid references auth.users(id),
  qa_id text not null,
  question_hash text not null,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  constraint chats_actor_xor check (
    (participant_id is not null)::int + (user_id is not null)::int = 1
  )
);

create index if not exists architecture_chats_qa_id_question_hash_idx
  on architecture_chats(qa_id, question_hash);

create index if not exists architecture_chats_participant_id_created_at_idx
  on architecture_chats(participant_id, created_at);

create index if not exists architecture_chats_user_id_created_at_idx
  on architecture_chats(user_id, created_at);

alter table architecture_progress enable row level security;
alter table architecture_sessions enable row level security;

create policy progress_self_rw on architecture_progress
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy sessions_owner_rw on architecture_sessions
  for all
  using (teacher_id = auth.uid());
