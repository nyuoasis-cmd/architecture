-- 실습실 미션 진행도를 진도 행에 담는다 (2026-08-16 신입샘 t1)
--
-- 🚨 왜 필요한가: 12강 실습 문항 안에서 90분이 흘러가는데, 교사 화면의 진행 단위는 «문항»뿐이었다.
--    25명이 전부 미션 2 에 몰려 있어도 교사 화면은 「1/7 문항」으로 똑같았다 —
--    «몇 명이 어느 미션에 몰려 있는가»는 이 수업의 유일한 조종간인데 그게 안 보였다.
--
-- 🔑 자리를 여기로 정한 이유: 실습 문항의 진도 행은 학생이 그 문항을 여는 순간 이미 생긴다.
--    새 테이블을 만들면 교사 화면이 쿼리를 하나 더 하고, 두 곳의 «누가 어디까지»가 갈라진다.
--
-- 🚨 칸을 **둘** 두는 이유: 「지금 자리」와 「스스로 도달한 자리」는 다르다. `jump` 로 건너뛴 학생을
--    한 칸으로만 적으면, 안 한 것을 한 것처럼 교사에게 보고하게 된다(학생 화면은 이미 둘을 갈라 놓았다).
--
-- 🔑 둘 다 nullable = 실습 문항이 아닌 진도 행에는 그냥 비어 있다. 기존 행은 손대지 않는다.
--    되돌리기 = 009_lab_mission_progress.down.sql (컬럼만 떨어뜨린다).

alter table architecture_progress
  add column if not exists lab_mission_index int,
  add column if not exists lab_earned_index int;

comment on column architecture_progress.lab_mission_index is
  '실습실에서 학생이 지금 서 있는 미션(0-based). 건너뛴 자리를 포함한다.';
comment on column architecture_progress.lab_earned_index is
  '실습실에서 학생이 스스로 도달한 미션(0-based). lab_mission_index 보다 작으면 건너뛴 구간이 있다.';
