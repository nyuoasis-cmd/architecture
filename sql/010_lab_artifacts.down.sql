-- 010 되돌리기 — 체험 산출물 계보 테이블 제거.
-- 🚨 학생 산출물이 함께 사라진다. 되돌리기 전에 백업을 직접 뜰 것.
drop table if exists architecture_lab_artifacts;
NOTIFY pgrst, 'reload schema';
