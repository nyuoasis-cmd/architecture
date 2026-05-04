# HANDOFF-pr21b-round3 — ch10 q01~q04 cherry-pick 후 재검증 (B + C)

> **PR**: PR-21b
> **base**: `main` (`b6e424e`)
> **브랜치**: `feat/preview-inline-ch10-q5-q7`
> **round 2 결과**: visual FAIL V6 — `registry.ts` 가 `ch10_q05~q07` 만 등록, `ch10_q01~q04` 미등록 (PR-21a 머지 사고: HANDOFF + sentinel 만 머지, 실제 gen 코드 chore branch `codex/pr21a` 에 잔류)
> **Master 패치**: `96d98b7` cherry-pick `baf81fe` (PR-21a gen content) → registry.ts + demos.ts + Q01~Q04 컴포넌트 추가

---

## 0. 메타

| key | value |
|---|---|
| step | pr21b |
| round | 3 |
| branch | feat/preview-inline-ch10-q5-q7 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **eval-visual / eval-interaction model override** | **codex** |

> Phase A 미실행. B + C spawn.

---

## 1. round 2 → round 3 변경

| 항목 | round 2 | round 3 |
|---|---|---|
| `registry.ts` ch10 entries | q05/q06/q07 만 (3) | **q01~q07 모두** (7) |
| `client/src/demos/ch10/` | Q05~Q07 (3 file) | **Q01~Q07 (7 file)** |
| `data/demos.ts` ch10 | q05~q07 만 | **q01~q07 모두** (PR-21a 가 추가했어야 했지만 누락) |

---

## §B + §C

PR-21a 동일 패턴. SHA = `96d98b7...` 검증.

ch10_q01~q07 7개 + ch09 회귀 spot-check. pink-700 contrast.

`qa-eval/pr21b-eval-{visual,interaction}-round3.json` + sentinel `qa/ao-logs/pr21b-r3-eval-{visual,interaction}.status` (`git add -f`).

---

## 변경 기록

| 2026-05-04 | round 3. PR-21a 머지 사고 (gen 코드 누락) 회복 후 B+C 재검증 |
