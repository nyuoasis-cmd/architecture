# HANDOFF-pr13-round2 — round 1 V8+V9 FAIL 후속 fix (모바일 responsive)

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-13 — ch02 4 데모 인라인 변환 (round 2)
> **base**: `main` (`91e11a5`)
> **작업 브랜치**: `feat/preview-inline-ch02` (round 1 commit `ac7331d` 위에 추가 커밋)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §6.2)
> **round 1 verdict**: A=PASS / B=**FAIL** (V8+V9 모바일 2건) / C=PASS

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr13 |
| round | 2 |
| branch | feat/preview-inline-ch02 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | **codex** |
| **eval-interaction model override** | **codex** |

---

## 1. round 1 결과 분석 (참고)

| ID | round 1 verdict | round 2 처리 |
|---|---|---|
| **V8-mobile-first-viewport** | FAIL | round 2 fix: 393×852 첫 화면에 Hero + Pair Block + 시나리오 칩 모두 보이도록 spacing 압축 + 모바일 grid stack |
| **V9-mobile-grid-transform** | FAIL | round 2 fix: `_shared/pair-block.tsx` 내 `StepRow`/`PairBinary`/`PairVertical` 에 responsive grid 분기 추가. ch02 4 데모 자동 적용 (ch01 도 동일하게 수혜) |
| **V1~V7 (desktop)** | ALL PASS | round 2 무수정 |

근본 원인: `_shared/pair-block.tsx::StepRow` 가 `gridTemplateColumns: repeat(${items.length}, 1fr)` inline style 로 4-col 고정 (Tailwind class override 불가). PairBinary 는 `grid-cols-2`, PairVertical 은 `grid-cols-[1fr_auto_1fr]` — 모두 모바일 분기 없음. ch01 도 같은 문제 있으나 round 1 Eval이 ch01 모바일 검증 생략.

---

## 2. 스코프 명확화 (PR-12 잠금 해석)

PR-12 §A 의 `_shared/*` 잠금은 **API surface (exports, props, types) 잠금** 이지 내부 레이아웃 구현 잠금이 아니다. 본 round 2 는:

✅ **허용**: `_shared/pair-block.tsx` 내부 className / inline style 수정 (responsive 분기 추가)
✅ **허용**: ch02 4 데모 파일 추가 spacing 조정
❌ **금지**: `_shared/index.ts` exports, `pair-block.tsx` props 시그너처, types.ts 변경
❌ **금지**: `_shared/icons/*`, `_shared/labels.ts`, `_shared/design-tokens.css` 변경
❌ **금지**: ch01, ch03~ch10 demo 파일 변경 (단, ch01 은 같은 컴포넌트 사용으로 자동 수혜 — 의도된 효과)

---

## §A. Generator (Codex)

**상세 명세**: 본 round 2 는 round 1 핸드오프의 §A 작업 위에 fix 만 추가. 별도 generator 명세 파일 없음 (이 §A 가 단일 소스).

### §A 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch02`
3. `git checkout feat/preview-inline-ch02` (이미 있으면 사용, 없으면 `git checkout -B feat/preview-inline-ch02 origin/feat/preview-inline-ch02`)
4. `git rev-parse HEAD` 결과가 `ac7331d8601a428eaf8aa1cef23cbd3e5186c166` 인지 확인
5. **별도 브랜치 생성 금지**. 직접 `feat/preview-inline-ch02` 위에 추가 커밋
6. **PR 생성 안 함** — Master 일괄 처리

### §A 수정 사항

#### 수정 1: `client/src/demos/_shared/pair-block.tsx` — `StepRow` 함수 (line ~61~88)

inline `gridTemplateColumns` 을 모바일/데스크탑 분기로 변경:

**현재 (line 71)**:
```tsx
<div className="grid items-stretch gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
```

**변경**:
```tsx
<div
  className="grid items-stretch gap-2"
  style={{
    gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
  }}
  data-step-row-cols={items.length}
>
```

그리고 컴포넌트 상단에 모바일 override CSS 를 동일 파일 내 `<style>` 태그 또는 `design-tokens.css` 신규 추가 대신 **inline className 분기** 로 처리. 다음 패턴 추천:

**최종 권장 (Tailwind v4 arbitrary 사용)**:
```tsx
const cols = items.length;
const gridClass =
  cols === 4 ? 'grid grid-cols-2 gap-2 sm:grid-cols-4'      // 4-cell wide → mobile 2-col
  : cols === 3 ? 'grid grid-cols-1 gap-2 sm:grid-cols-3'    // 3-cell → mobile 1-col
  : cols === 2 ? 'grid grid-cols-1 gap-2 sm:grid-cols-2'    // 2-cell → mobile 1-col
  : 'grid grid-cols-1 gap-2';

return (
  <div className={`${gridClass} items-stretch`}>
    ...
  </div>
);
```

**브레이크포인트**: Tailwind v4 default `sm: 640px`. 393px 모바일은 `sm` 미만 → 모바일 스타일 적용. 1440px 데스크탑은 `sm` 이상 → 기존 N-col 유지.

ArrowRight 커넥터는 `sm:block hidden` 이미 적용되어 있어 모바일에서 자동 숨김 (StepRow line 77 그대로).

#### 수정 2: `client/src/demos/_shared/pair-block.tsx` — `PairBinary` 함수 (line ~102~128)

**현재 (line 116, 122)**:
```tsx
<div className="grid grid-cols-2 gap-3">
```

**변경 (양쪽 모두)**:
```tsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
```

#### 수정 3: `client/src/demos/_shared/pair-block.tsx` — `PairVertical` 함수 (line ~134)

square 형태 (q04) 의 모바일은 1-col stack 이 요구.

**현재 (line 137)**:
```tsx
<div className="grid grid-cols-[1fr_auto_1fr] gap-3">
```

**변경**:
```tsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr]">
```

> ⚠️ PairVertical 의 `<div />` (line 141) connector spacer 는 모바일에서 의미 없으므로 다음 라인을 추가 변경:
> **현재 (line 141)**: `<div />`
> **변경**: `<div className="hidden sm:block" />`
>
> 그리고 pair 카드 사이 connector (line ~178~ 근처 metaphor 와 it 사이의 가운데 column) 도 `hidden sm:block` 추가. 정확한 줄은 `pairs.map` 내부에서 가운데 column 의 wrapper. Generator 자율 판단.

#### 수정 4: V8 first-viewport — ch02 4 데모 파일 spacing 압축 (선택, 효과 없으면 skip)

수정 1~3 적용 후 dev 모드에서 393×852 검증. Hero + Pair Block + 시나리오 칩 모두 보이면 OK. 보이지 않으면 ch02 4 데모 (`Q01Software.tsx`~`Q04Cloud.tsx`) 의 Hero 또는 Pair Block 외부 wrapper 의 spacing (`mb-X`, `gap-X`, `py-X`) 을 모바일에서만 줄임:

```tsx
<div className="mb-6 sm:mb-8">  // 기존 mb-8 → mb-6 sm:mb-8
```

### §A 검증 (자체 보고 의무)

1. `cd client && npm run build` 무에러
2. dev 모드에서 393×852 모바일 viewport (Chrome DevTools mobile sim) 으로 4 데모 확인:
   - q01 (Software): metaphor row 4-cell 이 2-col, IT row 도 2-col
   - q02 (License): 동일
   - q03 (Module): 동일
   - q04 (Cloud, square): metaphor + IT 가 세로 stack
3. 1440×900 데스크탑은 round 1 그대로 4-col / square 2-col 유지 확인
4. ch01 데모 4종 (orange tone) 도 동시 확인 — 자동 수혜로 모바일 2-col 정상 동작 (기능 유지 + 모바일 개선)

### §A 완료 시 센티넬 작성

파일: `qa/ao-logs/pr13-r2-gen.status`

```json
{"status":"done","step":"pr13","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch02","commit":"<round 2 SHA>","pr":"pending-master","loc":"+X -Y","note":"_shared/pair-block.tsx StepRow + PairBinary + PairVertical 모바일 grid 분기 추가. API surface 무변경."}
```

---

## §B. Eval-Visual (Codex)

**상세 명세**: round 1 의 `HANDOFF-pr13-eval-visual.md` 그대로. round 2 에서는 V8+V9 만 재검증 + 기존 V1~V7 회귀 확인.

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch02`
3. `git checkout feat/preview-inline-ch02`
4. `git rev-parse HEAD` 가 round 2 SHA 와 일치 확인
5. `cd client && npm install --no-audit --no-fund && npm run dev` — localhost:5176
6. **코드 수정 절대 금지**

### §B 검증 우선순위 (round 2)

1. **V8-mobile-first-viewport** (393×852): Hero + Pair Block + 시나리오 칩 모두 첫 화면 — 4 데모 모두 PASS 필요
2. **V9-mobile-grid-transform** (393×852):
   - ch02_q01~q03: Pair 의 metaphor row + IT row 둘 다 2-col (4-col 아님)
   - ch02_q04: metaphor + IT 가 세로 stack (1-col)
3. **V1~V7 (desktop 1440×900)**: round 1 PASS 회귀 확인 — 4-col / square 2-col 유지
4. **(선택) ch01 모바일 회귀**: 자동 수혜로 ch01 4 데모도 모바일 2-col 정상 — 기능 유지 (chapter tone 변경 없음 + grid 만 개선)

### §B 결과물

- 평가 보고: `qa-eval/pr13-eval-visual-round2.json`
- 센티넬: `qa/ao-logs/pr13-r2-eval-visual.status`

```json
{"status":"done","step":"pr13","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch02","fail_items":[],"revise_items":[]}
```

---

## §C. Eval-Interaction (Codex)

**상세 명세**: round 1 의 `HANDOFF-pr13-eval-interaction.md` 그대로. round 2 에서는 회귀 점검 + I1~I8 동일 매트릭스 재실행. round 1 ALL PASS 였으므로 round 2 도 PASS 예상이지만 `_shared/pair-block.tsx` 변경 영향 검증 필요.

### §C 시작 단계 (B 와의 worktree 충돌 회피)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch02`
3. `git checkout --detach origin/feat/preview-inline-ch02`
4. `git rev-parse HEAD` 로 SHA 확인 — 센티넬에 동일 SHA
5. `cd client && npm install --no-audit --no-fund`
6. **코드 수정 절대 금지**

### §C 회귀 검증 추가

- I1~I8 round 1 PASS 항목 재실행
- **추가**: `_shared/pair-block.tsx` 의 StepRow / PairBinary / PairVertical 가 props 시그너처 무변경 (API surface 잠금 유지) 확인
  - `git diff origin/main..HEAD -- client/src/demos/_shared/pair-block.tsx` 에서 export 함수 시그너처 변경 0건
  - `client/src/demos/_shared/index.ts` 변경 0건
- **추가**: ch01 데모 4종이 build/runtime 정상 동작 (자동 수혜 — 회귀 0건)

### §C 결과물

- 평가 보고: `qa-eval/pr13-eval-interaction-round2.json`
- 센티넬: `qa/ao-logs/pr13-r2-eval-interaction.status`

```json
{"status":"done","step":"pr13","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch02","fail_items":[],"revise_items":[]}
```

---

## 3. Master verdict 수령 절차 (round 2)

1. 3 센티넬 모두 PASS → Master 가 PR 생성: `gh pr create --base main --head feat/preview-inline-ch02 --title "feat(preview): ch02 4 데모 인라인 변환 + 36 SVG 아이콘 + 모바일 responsive (PR-13)" --body "<요약>"`
2. 1개라도 REVISE → round 3 핸드오프 갱신 → 재spawn (no-stop)
3. 1개라도 FAIL → 즉시 분석 + 사용자 보고
4. `commit` 필드 불일치 → verdict 무시 + 재spawn

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-03 | 초기 작성. round 1 V8+V9 FAIL 후속. `_shared/pair-block.tsx` 내부 responsive 분기 허용 (API surface 무변경). ch01 자동 수혜 |
