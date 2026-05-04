# HANDOFF-pr17a-round3 — Q04CacheHit 모바일 grid fix 재검증 (Eval-Visual only)

> **PR**: PR-17a
> **base**: `main` (`8a8bf39` PR-16b 머지 후)
> **브랜치**: `feat/preview-inline-ch06-q1-q4`
> **round 2 결과**: V9-mobile-grid REVISE — Q04CacheHit 가 PairFlow 안 쓰고 inline `FiveStepPairFlow` 직접 작성, round 2 의 pair-block.tsx fix 적용 안 됨
> **Master 패치**: commit `2524b18` — `Q04CacheHit.tsx` line 119/125 `grid-cols-1` → `grid-cols-2` 직접 변경

---

## 0. 메타

| key | value |
|---|---|
| step | pr17a |
| round | 3 |
| branch | feat/preview-inline-ch06-q1-q4 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **eval-visual model override** | **codex** |

> Phase A/C 미실행. Phase B 만 spawn (V9 only 재검증).

---

## 1. round 2 → round 3 변경

| 항목 | round 2 (`6e6873e` + `78f99ec`) | round 3 (`2524b18`) |
|---|---|---|
| `Q04CacheHit.tsx` line 119, 125 className | `grid grid-cols-1 gap-2 sm:grid-cols-5` | `grid grid-cols-2 gap-2 sm:grid-cols-5` |
| `_shared/pair-block.tsx` 5칸 case | round 2 fix 그대로 (다른 챕터의 PairFlow 5칸 demo 대비) | (변경 없음) |

---

## §B. Eval-Visual (Codex) — V9 only 재검증

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch06-q1-q4`
3. `git checkout feat/preview-inline-ch06-q1-q4`
4. `git rev-parse HEAD` 가 `2524b18...` 로 시작하는지 확인
5. `cd client && npm install --no-audit --no-fund && npm run dev`
6. **코드 수정 절대 금지**

### §B 검증 (V9 집중)

- `/library/6/ch06_q04` 393×852 모바일 외부 시연 탭 진입 후 비유/실제 두 pair row 의 `gridTemplateColumns` 측정
- 기대: 2열 분할 (예: `155.5px 155.5px` 또는 viewport-fit 형태)
- 5번째 카드는 마지막 행 단독 또는 grid 가 자동 wrap

기타 V check 는 round 1+2 PASS — spot-check 1건만.

### §B 결과물

- 평가 보고: `qa-eval/pr17a-eval-visual-round3.json`
- 센티넬: `qa/ao-logs/pr17a-r3-eval-visual.status` (`git add -f`)

---

## 변경 기록

| 2026-05-04 | round 3 작성. Q04 inline grid-cols-1 → grid-cols-2 직접 fix 재검증 |
