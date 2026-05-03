# HANDOFF-pr17a-round2 — pair-block 5칸 grid fix 재검증 (Eval-Visual only)

> **프로젝트**: `architecture`
> **PR**: PR-17a — ch06 q01~q04 인라인 변환
> **base**: `main` (`8a8bf39` PR-16b 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch06-q1-q4`
> **round 1 결과**: eval-visual REVISE (V4-contrast: SDD spec mismatch / V9-mobile-grid: 5칸 single-col fallback) / eval-interaction REVISE (I7-dev-console-favicon-404: vite default 결손, 코드 무관)
> **Master 패치**: commit `6e6873e` (`fix(pair-block): 5칸 wide layout 모바일 grid 추가`) — V9 fix
> **이전 round**: `HANDOFF-pr17a-round1.md`

---

## 0. 메타

| key | value |
|---|---|
| step | pr17a |
| round | 2 |
| branch | feat/preview-inline-ch06-q1-q4 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **eval-visual model override** | **codex** |

> Phase A (Generator) round 2 미실행 — Master 직접 패치 (pair-block.tsx 9줄 grid case 추가).
> Phase C (Eval-Interaction) round 2 미실행 — round 1 REVISE 는 favicon 404 (vite default) 단일 항목, 코드 무관, 본 PR 범위 밖. 명시적 PASS 처리.

---

## 1. round 1 REVISE 처리 결정

| 항목 | 결정 | 근거 |
|---|---|---|
| **V4-contrast** (`--demo-accent-ch06: #b91c1c` ≠ HANDOFF spec `#dc2626`) | **informational REVISE 수용** — 변경 없음 | 실측 contrast 5.91:1 ≥ WCAG AA 4.5:1, 디자인 토큰은 PR-12 의 의도적 -700 선택 (`architecture-pr12-rescue-followup-2026-05-03.md` 메모리: "V3 7챕터 contrast WCAG AA, 4.79~5.91:1"). HANDOFF round 1 의 spec 표 인용 (`#dc2626`) 이 SDD §4.0 와 동일한 outdated 명시. ch01~ch10 모든 챕터가 -700 series — PR-17a 만 변경 시 일관성 깨짐 |
| **V9-mobile-grid** (5칸 single-col fallback) | **fix `6e6873e`** | `_shared/pair-block.tsx` StepRow.gridClass 5칸 case 추가. PR-12 SDD §3.3 wide 4~5칸 spec 완성 |
| **I7-dev-console-favicon-404** | **수용 — 변경 없음** | `client/index.html` favicon 미설정 = vite 의 default 동작. 코드 무관. 본 PR 범위 밖 (cosmetic) |

---

## §B. Eval-Visual (Codex) — V9 fix 재검증

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch06-q1-q4`
3. `git checkout feat/preview-inline-ch06-q1-q4`
4. `git rev-parse HEAD` 가 `6e6873e...` 로 시작하는지 확인 (round 2 fix)
5. `cd client && npm install --no-audit --no-fund && npm run dev`
6. **코드 수정 절대 금지**

### §B 검증 (V9 집중)

- **V9 mobile grid (393×852)**: `/library/6/ch06_q04` 의 메타포 + IT pair row 모두 `gridTemplateColumns` 가 **2열** (`grid-cols-2`) 이어야 함 — round 1 의 single-col (319px 단일) → 이번에는 2열 분할
- V1, V2, V3, V5, V6, V7, V8: round 1 PASS 였음 — spot-check 1건만
- V4 contrast: round 1 의 5.91:1 측정값 그대로 PASS — `informational` 표시 (verdict 영향 X)

### §B 결과물

- 평가 보고: `qa-eval/pr17a-eval-visual-round2.json`
- 센티넬: `qa/ao-logs/pr17a-r2-eval-visual.status` (`git add -f`)

```json
{"status":"done","step":"pr17a","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"6e6873e...","branch":"feat/preview-inline-ch06-q1-q4","fail_items":[],"revise_items":[]}
```

> ⚠️ V4 contrast 가 다시 REVISE 로 올라오면 **informational 표시 + JSON `revise_items` 비워서 PASS** 처리 (Master 정책). 핸드오프 §0 절대 변경 금지 사항이 아닌 outdated spec 인용일 뿐.

---

## 2. Master verdict 수령 절차

PASS → PR / V9 만 REVISE → 추가 분석 / FAIL → round 3.

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | round 2 작성. round 1 V9 fix 재검증 + V4 contrast informational 수용 + I7 favicon 수용 |
