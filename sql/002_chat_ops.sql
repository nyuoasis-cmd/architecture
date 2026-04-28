alter table architecture_chats drop constraint if exists chats_actor_xor;
-- PR #7 OAuth 후 participant_id/user_id/anonymous_id를 포함한 새 XOR 제약으로 재강화한다.

alter table architecture_chats
  add column if not exists anonymous_id text,
  add column if not exists model_used text,
  add column if not exists cached boolean not null default false,
  add column if not exists blocked_count int not null default 0,
  add column if not exists upgraded_to_sonnet boolean not null default false;

create index if not exists architecture_chats_cache_lookup_idx
  on architecture_chats(qa_id, question_hash, created_at desc);

create index if not exists architecture_chats_anonymous_idx
  on architecture_chats(anonymous_id, created_at desc);
