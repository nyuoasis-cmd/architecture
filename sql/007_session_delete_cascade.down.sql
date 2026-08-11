-- 007_session_delete_cascade.down.sql — 007 회귀(FK 를 NO ACTION 으로 되돌린다).
-- psql "$DATABASE_URL" -f sql/007_session_delete_cascade.down.sql
-- ⚠️ 되돌리면 «학생이 들어왔던 세션을 교사가 지울 수 없는» 상태로 다시 돌아간다.

ALTER TABLE architecture_chats
  DROP CONSTRAINT IF EXISTS architecture_chats_participant_id_fkey;
ALTER TABLE architecture_chats
  ADD CONSTRAINT architecture_chats_participant_id_fkey
  FOREIGN KEY (participant_id) REFERENCES architecture_participants(id);

ALTER TABLE architecture_progress
  DROP CONSTRAINT IF EXISTS architecture_progress_participant_id_fkey;
ALTER TABLE architecture_progress
  ADD CONSTRAINT architecture_progress_participant_id_fkey
  FOREIGN KEY (participant_id) REFERENCES architecture_participants(id);

ALTER TABLE architecture_participants
  DROP CONSTRAINT IF EXISTS architecture_participants_session_id_fkey;
ALTER TABLE architecture_participants
  ADD CONSTRAINT architecture_participants_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES architecture_sessions(id);

NOTIFY pgrst, 'reload schema';
