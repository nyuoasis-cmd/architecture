-- 되돌리기 — 실습실 미션 진행도 칸을 떨어뜨린다.
-- 🚨 담긴 값도 함께 사라진다. 교사 화면이 「실습 N/7」을 못 그리게 되고 「N/M 문항」으로 돌아간다.
alter table architecture_progress
  drop column if exists lab_mission_index,
  drop column if exists lab_earned_index;
