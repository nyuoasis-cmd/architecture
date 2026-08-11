-- 007_session_delete_cascade.sql — 교사가 «학생이 들어왔던» 세션을 지울 수 없던 결함 수정.
--
-- 적용: psql 직접 실행(글로벌 표준, Dashboard paste 금지).
--   psql "$DATABASE_URL" -f sql/007_session_delete_cascade.sql
--
-- 무엇이 문제였나 (2026-08-11 prod 실측):
--   DELETE /api/sessions/:id 가 학생이 한 명이라도 참여한 세션에서 **항상 500**
--   (`{"error":"session_delete_failed"}`)을 냈다. 교사 화면에는 삭제 버튼이 있는데
--   실제로는 «아무도 안 들어온 세션»만 지워졌다 — 즉 수업을 한 번이라도 한 세션은
--   교사가 영원히 못 지운다. 아무 안내도 없이 그냥 실패한다.
--
-- 원인: FK 세 개가 전부 NO ACTION 이었다(pg_constraint.confdeltype='a').
--   architecture_sessions ← architecture_participants ← {architecture_progress, architecture_chats}
--   부모를 지우려면 자식을 먼저 지워야 하는데 서버는 세션 한 줄만 지운다.
--   (architecture_submissions 는 이미 'c'=CASCADE 라 손대지 않는다.)
--
-- 왜 CASCADE 인가: 세션을 지운다는 건 «그 수업을 없앤다»는 뜻이고, 그 수업의 참여자·진도·
--   대화는 세션 밖에서 아무 의미가 없다(참여자는 세션 스코프 익명 신원이다). 서버 코드에서
--   순서대로 지우는 방법도 있지만, 그러면 «지우는 순서»를 아는 곳이 서버 한 군데뿐이라
--   psql·다른 경로로 지울 때 같은 결함이 되살아난다. 제약으로 못 박는다.
--
-- 🚨 되돌리기 = sql/007_session_delete_cascade.down.sql

ALTER TABLE architecture_participants
  DROP CONSTRAINT IF EXISTS architecture_participants_session_id_fkey;
ALTER TABLE architecture_participants
  ADD CONSTRAINT architecture_participants_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES architecture_sessions(id) ON DELETE CASCADE;

ALTER TABLE architecture_progress
  DROP CONSTRAINT IF EXISTS architecture_progress_participant_id_fkey;
ALTER TABLE architecture_progress
  ADD CONSTRAINT architecture_progress_participant_id_fkey
  FOREIGN KEY (participant_id) REFERENCES architecture_participants(id) ON DELETE CASCADE;

ALTER TABLE architecture_chats
  DROP CONSTRAINT IF EXISTS architecture_chats_participant_id_fkey;
ALTER TABLE architecture_chats
  ADD CONSTRAINT architecture_chats_participant_id_fkey
  FOREIGN KEY (participant_id) REFERENCES architecture_participants(id) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
