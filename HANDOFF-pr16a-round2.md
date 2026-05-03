# HANDOFF-pr16a-round2 — ch05 라벨 raw 약자 fix 재검증 (Eval-Visual only)

> **프로젝트**: `architecture`
> **PR**: PR-16a — ch05 4 데모 인라인 변환
> **base**: `main` (`2a1adba` PR-15b 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch05-q1-q4`
> **round 1 결과**: eval-interaction PASS / eval-visual FAIL (HTML/CSS/JS raw 약자 → import 시점 validateLabel throw → 모든 ch05 라우트 + ch04 spot-check 블록)
> **Master 패치**: commit `d459e39` (`fix(ch05_q02): HTML/CSS/JS raw 약자 → 한+영 병기`) — `client/src/demos/ch05/Q02WebStack.tsx` IT 라벨 3개 수정
> **이전 round**: `HANDOFF-pr16a-round1.md`

---

## 0. 메타

| key | value |
|---|---|
| step | pr16a |
| round | 2 |
| branch | feat/preview-inline-ch05-q1-q4 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **eval-visual model override** | **codex** |

> Phase A (Generator) + Phase C (Eval-Interaction) round 2 미실행. Phase B 만 spawn.
> 이유: Master 직접 패치 (Generator 미필요). Interaction round 1 이미 PASS 하고 라벨 텍스트 변경은 I4 length 제외 다른 I check 영향 없음.

---

## 1. round 1 → round 2 변경 요약

| 항목 | round 1 (`951ed51`) | round 2 (`d459e39`) |
|---|---|---|
| `Q02WebStack.tsx` IT 라벨 | `'HTML'` / `'CSS'` / `'JS'` | `'구조 HTML'` / `'스타일 CSS'` / `'동작 JS'` |
| sub 변경 | `'구조 마크업'` / `'스타일'` / `'동작'` | `'마크업'` / `'꾸미기'` / `'인터랙션'` |
| 다른 파일 | (변경 없음) | (변경 없음) |

---

## §B. Eval-Visual (Codex)

PR-16a round 1 §B 와 동일. **viewport 1440×900 (desktop) + 393×852 (mobile) 양쪽 V1~V9**:

ch05_q01~q04 4 데모 검증 + ch04 q05~q07 회귀 spot-check 1건 (회귀 0 확인).

**중점 재검증 항목**:
- V1~V9 모두: round 1 에서 import-time exception 으로 전 routes 블록되었음. 이번 round 에서는 정상 렌더 + 측정 가능해야 PASS.
- V4 contrast: ch05 sky-600 (`#0284c7`) accent 측정 — WCAG AA 4.5:1 만족 확인
- V7 baseline: `/library/4/ch04_q04` (PR-15a 머지본) 정상 렌더 확인 (round 1 에서 ch05 import chain 으로 인해 ch04 까지 블록됨)

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch05-q1-q4`
3. `git checkout feat/preview-inline-ch05-q1-q4`
4. `git rev-parse HEAD` 가 `d459e39...` 로 시작하는지 확인 (round 2 fix)
5. `cd client && npm install --no-audit --no-fund && npm run dev`
6. **코드 수정 절대 금지**

### §B 결과물

- 평가 보고: `qa-eval/pr16a-eval-visual-round2.json`
- 센티넬: `qa/ao-logs/pr16a-r1-eval-visual.status` (덮어쓰기 X — `pr16a-r2-eval-visual.status` 신규 작성)

```json
{"status":"done","step":"pr16a","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"d459e39...","branch":"feat/preview-inline-ch05-q1-q4","fail_items":[],"revise_items":[]}
```

> ⚠️ codex 자체 브랜치 push 패턴 적용 시 `git add -f` 로 main worktree sentinel 도 직접 write.

---

## 2. Master verdict 수령 절차

PASS → PR / REVISE/FAIL → fail_items 분석 → round 3 / SHA mismatch → stale 의심.

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | round 2 작성. round 1 fail 원인 (raw 약자) 1 파일 3 라벨 직접 fix. Phase B only 재검증 |
