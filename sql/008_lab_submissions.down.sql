-- 008_lab_submissions.down.sql — 되돌리기.
-- 🚨 이걸 돌리면 학생이 낸 규칙 문서와 판정 이력이 사라진다. 수업 뒤에 돌리지 말 것.

drop table if exists architecture_lab_submissions;
NOTIFY pgrst, 'reload schema';
