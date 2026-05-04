# HANDOFF-pr17c-round3 — POST 진단 fix 재검증 (Eval-Visual only)

> **PR**: PR-17c
> **base**: `main` (`c87064e`)
> **브랜치**: `feat/preview-inline-ch06-q8-q10`
> **round 2 결과**: eval-interaction PASS @ ? / eval-visual FAIL — **arch-113 가 fix 푸시 (`07aee73`) 전 commit `1e4cc07b` 체크아웃, race condition**
> **Master 패치**: commit `07aee73` — `'POST 자가진단'` (9자) → `'POST 진단'` (7자) — maxLabelLength 8 통과

---

## 0. 메타

| key | value |
|---|---|
| step | pr17c |
| round | 3 |
| branch | feat/preview-inline-ch06-q8-q10 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **eval-visual model override** | **codex** |

> Phase A/C 미실행. Phase B 만 spawn.

---

## §B. Eval-Visual (Codex) — POST 진단 fix 재검증

### §B 시작 (commit SHA 검증 필수)

1. `cd /home/claude/architecture && git fetch origin feat/preview-inline-ch06-q8-q10`
2. `git checkout feat/preview-inline-ch06-q8-q10`
3. **🚨 `git rev-parse HEAD` 가 `07aee73...` 시작 확인** — 이전 round arch-113 처럼 `1e4cc07b` 또는 `dc4c2f6` 으로 떨어지면 stale (즉시 abort, sentinel 미작성)
4. `cd client && npm install --no-audit --no-fund && npm run dev`

### §B 검증

- ch06_q05~q10 + spot-check `/library/6/ch06_q04` 정상 렌더 확인 (round 2 의 import-time exception 해소)
- V1~V9 표준
- q10 5칸 desktop sm:grid-cols-5 / mobile grid-cols-2

### §B 결과물

`qa-eval/pr17c-eval-visual-round3.json` + `qa/ao-logs/pr17c-r3-eval-visual.status` (`git add -f`)

> **commit 필드 = `07aee73...` 검증 + verdict**

---

## 변경 기록

| 2026-05-04 | round 3. POST 진단 fix 재검증 (race 회피용 SHA 검증 강제) |
