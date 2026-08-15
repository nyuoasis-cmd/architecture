-- 008_ai_spend.down.sql — 되돌리기.
-- 🚨 이걸 돌리면 지출 기록이 사라지고, 돈 천장은 다시 «프로세스가 뜬 뒤로만 세는» 차단기가 된다.
--    코드는 그 상태에서도 돈다(장부가 없으면 메모리로 떨어지게 돼 있다) — 다만 이름이 다시 거짓말을 한다.

DROP FUNCTION IF EXISTS architecture_ai_spend_add(TEXT, TEXT, NUMERIC, UUID);
DROP TABLE IF EXISTS architecture_ai_spend_ops;
DROP TABLE IF EXISTS architecture_ai_spend;
