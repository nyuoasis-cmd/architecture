# HANDOFF-pr12-round2 — round 1 verdict 반영 후속 fix

> **프로젝트**: `architecture`
> **PR**: PR-12 — preview inline 공용 API surface 잠금 (round 2)
> **base**: `main` (`d39599d`)
> **작업 브랜치**: `feat/preview-inline-shared-contract` (round 1 commit `7b8ba1e` 위에 추가 커밋)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2)
> **round 1 verdict**: gen=done, eval-visual=REVISE(1), eval-interaction=FAIL(3) → 2건 수정 / 1건 평가자 오판 / 1건 PR-12 스코프 외

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr12 |
| round | 2 |
| branch | feat/preview-inline-shared-contract |
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
| **V3** ch01_q01 활성 라벨 contrast 3.35:1 < 4.5:1 (`#ea580c on #fff7ed`) | REVISE | **PR-12 스코프 외** — PR #28 머지 시점부터의 결함, 토큰 hex가 PR #28 inline hex와 동일 (W3 픽셀 동등 유지). round 2에서 수정 안 함. **별도 PR 후보** (PR #28 후속 contrast cleanup) |
| **I1-C10** README heading grep 1건만 매칭 (`^## (Public API\|DO/DON'T)`, 2건 요구) | FAIL | round 2 fix: `_shared/README.md` `## DO / DON'T` → `## DO/DON'T` (공백 제거) |
| **I3-case1** `validateLabel('가전제품운영체제', 'label')` did not throw | FAIL | **평가자 오판**: spec은 `text.length > maxLabelLength=8` throw. "가전제품운영체제" 는 정확히 8자 → `8 > 8 = false` → throw 안 함이 정확. round 2 핸드오프 §C에 spec 명확화 |
| **I8** Q03Restaurant.tsx `checkout.active=3` vs q03.html 동일 키 `1` | FAIL | round 2 fix: `Q03Restaurant.tsx` checkout 시나리오 `active: 3` → `1` (오타). q03.html이 의도된 값 |

---

## §A. Generator (Codex)

### §A 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-shared-contract`
3. `git checkout feat/preview-inline-shared-contract` (이미 있으면 사용, 없으면 `git checkout -B feat/preview-inline-shared-contract origin/feat/preview-inline-shared-contract`)
4. `git rev-parse HEAD` 결과가 `7b8ba1e7314a9d36bede31974f97b9ac1acf28ca` 인지 확인
5. **별도 브랜치 생성 금지**. 직접 `feat/preview-inline-shared-contract` 위에 추가 커밋
6. **PR 생성 안 함** — Master 일괄 처리

### §A 수정 사항 (정확히 2줄)

#### 수정 1: `client/src/demos/_shared/README.md`

`## DO / DON'T` → `## DO/DON'T` (공백 2곳 제거)

검증:
```bash
grep -E "^## (Public API|DO/DON'T)" client/src/demos/_shared/README.md | wc -l
# 기대: 2
```

#### 수정 2: `client/src/demos/ch01/Q03Restaurant.tsx`

checkout 시나리오 객체의 `active` 필드:

```diff
   checkout: {
     title: '결제 확인 — 권한과 인터페이스',
     summary: '운영체제는 누가 무엇을 열 수 있는지 확인하고, 사람에게는 버튼과 창으로 결과를 보여 줍니다.',
-    active: 3,
+    active: 1,
     lanes: [
```

근거: `client/public/demos/ch01/q03.html` 의 `'#checkout'` scene 이 `active: 1`. SDD §8 "시나리오 데이터 1:1 일치" 의무. lane 인덱스는 0/1/2 (3개 배열) — 3은 활성 lane 없음 (오타 추정).

검증:
```bash
grep -A4 "checkout: {" client/src/demos/ch01/Q03Restaurant.tsx | grep "active:"
# 기대: 'active: 1,'
```

### §A 절대 금지

- V3 contrast 수정 (토큰 hex 변경) — 스코프 외
- ch02~ch10 손대기
- design-tokens.css 색상 값 변경
- `_shared/` 다른 파일 임의 수정
- README, Q03Restaurant 외 파일 수정

### §A 빌드 검증

```bash
cd /home/claude/architecture
npm run build  # client + server 무에러
```

### §A 커밋·푸시

```bash
git add client/src/demos/_shared/README.md client/src/demos/ch01/Q03Restaurant.tsx
git commit -m "fix(preview): README heading 공백 제거 + Q03 checkout active 1 (round 1 FAIL fix)"
git push origin feat/preview-inline-shared-contract
git rev-parse HEAD  # 새 commit SHA
```

### §A 완료 시 센티넬

`qa/ao-logs/pr12-r2-gen.status` (한 줄 JSON):

```json
{"status":"done","step":"pr12","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-shared-contract","commit":"<NEW SHA>","pr":"pending-master","loc":"+2 -2 (round 1 FAIL fix)","note":"I1-C10 README heading 공백 제거 + I8 Q03 checkout active 3→1. V3·I3는 round 2 처리 외."}
```

---

## §B. Eval-Visual (Codex)

### §B 시작 단계

1. `git fetch origin feat/preview-inline-shared-contract`
2. `git checkout feat/preview-inline-shared-contract`
3. `git rev-parse HEAD` = §A 새 SHA 확인 (Generator 센티넬과 일치)
4. **코드 수정 절대 금지**

### §B 검증 항목

round 1 V3 (ch01_q01 활성 라벨 contrast 3.35:1) 는 PR-12 스코프 외로 명시됨. round 2에서는:

| 항목 | 기대 |
|---|---|
| V1~V8 round 1 결과 재확인 (commit 갱신만 — 색상 토큰 변동 없음) | round 1 PASS 항목들 그대로 |
| V3 (활성 라벨 contrast) | **검증 제외 또는 SCOPE_OUT 라벨**. round 2 verdict에서 V3 fail/revise 처리 안 함 |
| 변경된 파일 (`_shared/README.md`, `Q03Restaurant.tsx`) 가 시각 회귀 없는지 | 디자인 영향 없음 (README는 텍스트, Q03 active만 1) |

### §B verdict 기준

- V3 외 모든 항목 round 1 통과 그대로 → **PASS**
- 새 시각 회귀 발견 → REVISE/FAIL

### §B 센티넬

`qa/ao-logs/pr12-r2-eval-visual.status`:

```json
{"status":"done","step":"pr12","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<§A NEW SHA>","branch":"feat/preview-inline-shared-contract","fail_items":[],"revise_items":[]}
```

---

## §C. Eval-Interaction (Codex)

### §C 시작 단계

1. `git fetch origin feat/preview-inline-shared-contract`
2. `git checkout --detach origin/feat/preview-inline-shared-contract` (Phase B와 worktree 충돌 회피)
3. `git rev-parse HEAD` = §A 새 SHA 확인
4. **코드 수정 절대 금지**

### §C 검증 항목 + spec 명확화

#### I1 Sprint Contract (round 1 C10 fix 재검증)

```bash
grep -E "^## (Public API|DO/DON'T)" client/src/demos/_shared/README.md | wc -l
# 기대: 2
```

#### I3 validateLabel **spec 명확화** (round 1 평가자 오판 방지)

`labels.ts` LABEL_RULES + validateLabel 정확한 spec:

```typescript
// LABEL_RULES.maxLabelLength = 8
// validateLabel: text.length > max ? throw : ok
// 즉, 8자 = 한도 내 (throw 안 함이 정확). 9자부터 throw.
```

throw 케이스 6개 정의 (round 2 검증):

| # | 입력 | 예상 결과 | 근거 |
|---|---|---|---|
| 1 | `validateLabel('a'.repeat(9), 'label')` | **throw** | 9>8 |
| 2 | `validateLabel('운영체제 OS', 'sub')` 단, 길이 ≤ 16 | throw 안 함 (sub 한도 16) | 한도 내 |
| 3 | `validateLabel('OS', 'label')` | **throw** | forbiddenPatterns "영어 raw 약자" |
| 4 | `validateLabel('합니다', 'label')` | **throw** | forbiddenPatterns "~합니다 종결" |
| 5 | `validateLabel('🚀test', 'label')` | **throw** | forbiddenPatterns "emoji 금지" |
| 6 | `validatePairSet([{label:'A'}], [{label:'A',sub:'foo'}], {layout:'wide', subPolicy:'all'})` | **throw** | subPolicy=all 위반 |

검증 방법: 임시 ts 파일 작성 → `npx tsx labels.test.ts` 실행 → 6개 모두 정확히 throw 또는 통과 확인 → 검증 후 파일 삭제 (커밋 X). 또는 정적 grep:

```bash
grep -c "throw new Error" client/src/demos/_shared/labels.ts
# 기대: ≥ 4
```

**중요**: round 1 평가자 오판인 "8자 throw" 케이스는 더 이상 검증 안 함.

#### I2, I4~I8 (round 1 결과 재확인)

- I8 (Q03 checkout) 재검증:
  ```bash
  grep -A4 "checkout: {" client/src/demos/ch01/Q03Restaurant.tsx | grep "active:"
  # 기대: 'active: 1,' (round 1 FAIL fix)
  ```
- I2, I4, I5, I6, I7 (round 1 PASS) 재검증

### §C verdict 기준

- I1, I8 fix 확인 + I2~I7 round 1 결과 + I3 새 spec 6/6 PASS → **PASS**
- I3 spec 미충족 → REVISE (코드 spec 자체 결함)

### §C 센티넬

`qa/ao-logs/pr12-r2-eval-interaction.status`:

```json
{"status":"done","step":"pr12","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<§A NEW SHA>","branch":"feat/preview-inline-shared-contract","fail_items":[],"revise_items":[]}
```

---

## 2. round 2 PASS 후 Master 행동

3 센티넬 모두 PASS:

```bash
gh pr create --base main --head feat/preview-inline-shared-contract \
  --title "feat(preview): _shared/* 공용 계약 잠금 + ch01 토큰화 (PR-12)" \
  --body "round 2 PASS 후 본문 보강 — verdict 요약 / 커밋 SHA 2개 / 스코프 외 V3는 별도 PR 등록"
```

PR 본문에 명시:
- round 1 commit `7b8ba1e` (+1376/-968): _shared 공용 계약 + ch01 4 토큰화 + showcase
- round 2 commit `<NEW SHA>` (+2/-2): I1-C10 README heading + I8 Q03 active fix
- **V3 contrast cleanup PR 후보** — PR #28부터의 결함, PR-12 스코프 외 별도 진행

---

## 변경 기록

| 라운드 | 변경 |
|---|---|
| round 1 (2026-05-02) | 초기 spawn. gen done / eval-visual REVISE 1 / eval-interaction FAIL 3 |
| round 2 (2026-05-02) | I1-C10 + I8 fix. I3 spec 명확화. V3 별도 PR 후보 |
