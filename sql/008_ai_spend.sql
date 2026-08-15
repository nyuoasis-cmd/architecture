-- 008_ai_spend.sql — AI 월 지출 장부.
--
-- 🚨 왜 필요한가: 지출 누계가 프로세스 메모리에만 있어서, 서버가 다시 뜰 때마다 0 부터 다시 셌다.
--    Render 는 배포·유휴 복귀마다 뜬다 — 즉 「월 지출 상한」이라 부르던 것이 실제로는
--    「한 번 뜬 동안 폭주하면 끊는 차단기」였다. 이 표가 있어야 그 이름이 참이 된다.
--
-- 🔑 한 줄 = (주머니, 달). 여러 인스턴스가 동시에 더해도 어긋나지 않게 **증분 upsert** 로만 쓴다.
--    (`usd = 기존 + 증분`. 「읽고 계산해서 덮어쓰기」를 하면 동시에 뜬 두 인스턴스가 서로를 지운다.)
--
-- 적용: psql 직접 실행(글로벌 표준, Dashboard paste 금지).
--   psql "$DATABASE_URL" -f sql/008_ai_spend.sql

CREATE TABLE IF NOT EXISTS architecture_ai_spend (
  -- 주머니. 챗봇과 실습이 서로를 막지 않게 갈라 둔다.
  bucket TEXT NOT NULL CHECK (bucket IN ('chat', 'lab')),
  -- 'YYYY-MM' (UTC). 🔑 달이 바뀌면 새 줄이 생기고, 지난달은 기록으로 남는다.
  month_key TEXT NOT NULL CHECK (month_key ~ '^\d{4}-\d{2}$'),
  -- 누적 추정 지출(USD). 🚨 추정이다 — 청구서가 아니라 우리가 센 값이다.
  usd NUMERIC(12, 6) NOT NULL DEFAULT 0 CHECK (usd >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (bucket, month_key)
);

-- 🔑 증분 더하기. 애플리케이션은 **이 함수만** 부른다 —
--    「읽고 → 더하고 → 덮어쓰기」를 코드에서 하면 인스턴스 둘이 서로의 지출을 지운다.
CREATE OR REPLACE FUNCTION architecture_ai_spend_add(
  p_bucket TEXT,
  p_month_key TEXT,
  p_delta NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  new_total NUMERIC;
BEGIN
  INSERT INTO architecture_ai_spend (bucket, month_key, usd, updated_at)
  VALUES (p_bucket, p_month_key, GREATEST(p_delta, 0), now())
  ON CONFLICT (bucket, month_key) DO UPDATE
    SET usd = architecture_ai_spend.usd + GREATEST(EXCLUDED.usd, 0),
        updated_at = now()
  RETURNING usd INTO new_total;
  RETURN new_total;
END;
$$ LANGUAGE plpgsql;
