# HANDOFF-pr21b-round2 — IAM sub 길이 fix 재검증 (B + C)

> **PR**: PR-21b
> **base**: `main` (`b6e424e`)
> **브랜치**: `feat/preview-inline-ch10-q5-q7`
> **round 1**: gen done @ `66a63b4`, eval-int FAIL — `Q07AiSecurity` IAM sub `'identity & access'` 17자 > maxSubLength 16
> **Master 패치**: `6e66bb3` — sub `'identity & access'` → `'identity access'` (15)

---

## 0. 메타

| key | value |
|---|---|
| step | pr21b |
| round | 2 |
| branch | feat/preview-inline-ch10-q5-q7 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **eval-visual / eval-interaction model override** | **codex** |

> Phase A 미실행. B + C spawn (round 1 visual 도 import-time throw 로 영향 받았을 가능성).

---

## §B + §C

PR-21a 동일 패턴. SHA = `6e66bb3...` 검증.

ch10_q05~q07 + ch10_q01~q04 회귀 spot-check.

`qa-eval/pr21b-eval-{visual,interaction}-round2.json` + sentinel `qa/ao-logs/pr21b-r2-eval-{visual,interaction}.status` (`git add -f`).

---

## 변경 기록

| 2026-05-04 | round 2. IAM sub 길이 fix 후 B/C 재spawn |
