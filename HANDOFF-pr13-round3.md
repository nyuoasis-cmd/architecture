# HANDOFF-pr13-round3 — V8 first-viewport 단일 fix

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-13 (round 3)
> **base**: `main` (`91e11a5`)
> **작업 브랜치**: `feat/preview-inline-ch02` (round 2 commit `2c64805` 위에 추가 커밋)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §6.2)
> **round 2 verdict**: A=PASS / B=**FAIL** (V8 only) / C=PASS
> **V9 (round 1 FAIL → round 2 PASS)** — 모바일 grid stack 정상

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr13 |
| round | 3 |
| branch | feat/preview-inline-ch02 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | **codex** |
| **eval-interaction model override** | **codex** |

---

## 1. round 2 결과 분석

| ID | round 2 verdict | round 3 처리 |
|---|---|---|
| **V1~V7 (desktop)** | PASS | 무수정 |
| **V8-mobile-first-viewport** | FAIL | round 3 fix: `ScenarioPicker` 를 모바일에서만 데모 위로 이동 (flex-col-reverse) |
| **V9-mobile-grid-transform** | PASS (round 2 fix) | 무수정 |

근본 원인: `client/src/components/learn/PreviewPanel.tsx` line 128~140 에서 InlineComponent 가 먼저, ScenarioPicker 가 뒤에 렌더링됨. 모바일 viewport 852px 안에 Hero (~150) + PairBlock (~280) + State board (~400) + Log (~120) 합산이 952px 초과 → ScenarioPicker 가 첫 화면 밖. State board 압축은 lane 수 + minHeight 제약으로 한계.

해결: 모바일에서만 ScenarioPicker 를 데모 컨테이너 위로 (flex-col-reverse). 데스크탑은 기존 순서 유지 (V2 PASS 유지).

---

## §A. Generator (Codex)

본 round 3 는 단일 파일 단일 wrapper 추가. Codex 자율 판단 최소화.

### §A 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch02`
3. `git checkout feat/preview-inline-ch02`
4. `git rev-parse HEAD` 결과가 `2c6480532e242237dd63e1049351200d8c5e5288` 인지 확인 (round 2 SHA)
5. **별도 브랜치 생성 금지**. 직접 `feat/preview-inline-ch02` 위에 추가 커밋
6. **PR 생성 안 함** — Master 일괄 처리

### §A 수정 사항 (정확히 1곳)

#### 수정: `client/src/components/learn/PreviewPanel.tsx` line ~128~140

**현재**:
```tsx
{isDemo ? (
  <div className="flex flex-1 flex-col overflow-auto px-4 py-6 lg:px-8">
    {demo && InlineComponent ? (
      <>
        <div ref={inlineHostRef} className={`mx-auto w-full ${inlineMaxWidth}`}>
          <InlineComponent key={`${qaId}:${scenarioId}`} scenarioId={scenarioId} />
        </div>
        <ScenarioPicker
          demo={demo}
          scenarioId={scenarioId}
          onChange={handleScenarioHash}
          description={demo.description}
        />
      </>
    ) : demo ? (
```

**변경** (Fragment 을 div wrapper 로 변경하고 모바일 reverse):
```tsx
{isDemo ? (
  <div className="flex flex-1 flex-col overflow-auto px-4 py-6 lg:px-8">
    {demo && InlineComponent ? (
      <div className="flex flex-col-reverse gap-3 sm:flex-col sm:gap-0">
        <div ref={inlineHostRef} className={`mx-auto w-full ${inlineMaxWidth}`}>
          <InlineComponent key={`${qaId}:${scenarioId}`} scenarioId={scenarioId} />
        </div>
        <ScenarioPicker
          demo={demo}
          scenarioId={scenarioId}
          onChange={handleScenarioHash}
          description={demo.description}
        />
      </div>
    ) : demo ? (
```

**핵심 변경**:
- `<>` Fragment → `<div className="flex flex-col-reverse gap-3 sm:flex-col sm:gap-0">` wrapper
- `</>` Fragment 닫기 → `</div>`

**동작**:
- 모바일 (393px, sm 미만): `flex-col-reverse` → ScenarioPicker 가 위, 데모가 아래 → 첫 화면에 chips 보임
- 데스크탑 (1440px, sm 이상): `sm:flex-col` 으로 reverse 해제 → 데모가 위, ScenarioPicker 가 아래 (round 2 PASS 동일)
- `gap-3` 모바일 / `sm:gap-0` 데스크탑 — 모바일 chips 와 데모 사이 간격, 데스크탑은 기존 0 gap

**iframe fallback path 무영향**: `demo && InlineComponent` 분기 내부만 수정. iframe path (`else demo ?`) 는 그대로 유지 — phone-frame 데모는 수정 안 함.

### §A 검증 (자체 보고 의무)

1. `cd client && npm run build` 무에러
2. dev 모드 393×852 모바일 viewport 로 ch02_q01 확인:
   - 첫 화면 (스크롤 없이) 에 ScenarioPicker chips 4개 (`os/driver/app/middleware`) 모두 보임
   - chips 아래에 Hero → PairBlock 시작
3. dev 모드 1440×900 데스크탑 viewport 로 ch02_q01 확인:
   - InlineComponent (Hero → PairBlock → State → Log) 가 위, ScenarioPicker 가 아래 (round 2 와 동일)
4. ch01_q01 도 동일 패턴 확인 — 모바일 chips 위, 데스크탑 chips 아래 (자동 수혜)

### §A 절대 금지

- `_shared/*` 변경 금지 (PR-12 잠금)
- iframe path (line 142~171) 변경 금지
- `<ScenarioPicker>` 컴포넌트 자체 시그너처 변경 금지
- 다른 페이지 / 다른 기능 변경 금지

### §A 완료 시 센티넬

파일: `qa/ao-logs/pr13-r3-gen.status`

```json
{"status":"done","step":"pr13","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch02","commit":"<round 3 SHA>","pr":"pending-master","loc":"+X -Y","note":"PreviewPanel.tsx InlineComponent 분기에 flex-col-reverse sm:flex-col wrapper 추가. 모바일 chips 우선, 데스크탑 데모 우선."}
```

---

## §B. Eval-Visual (Codex)

**상세 명세**: round 1 의 `HANDOFF-pr13-eval-visual.md` 그대로. round 3 에서 V8 우선 + V1~V7, V9 회귀 확인.

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch02`
3. `git checkout feat/preview-inline-ch02`
4. `git rev-parse HEAD` 가 round 3 SHA 와 일치 확인
5. `cd client && npm install --no-audit --no-fund && npm run dev` — localhost:5176
6. **코드 수정 절대 금지**

### §B 검증 우선순위 (round 3)

1. **V8-mobile-first-viewport** (393×852) — 4 ch02 데모 모두:
   - ScenarioPicker chips (4개 칩) 가 첫 화면 안에 100% 보임 (스크롤 없이)
   - chips 아래에 Hero 또는 Pair Block 일부 보이면 OK (전체 보일 필요 없음)
2. **V9-mobile-grid-transform** (393×852) — round 2 PASS 회귀
3. **V1~V7 (desktop 1440×900)** — round 2 PASS 회귀:
   - 특히 V2 (3단 구조: Hero → Pair Block → State + Log) — 데스크탑은 chips 가 아래 유지

### §B 결과물

- 평가 보고: `qa-eval/pr13-eval-visual-round3.json`
- 센티넬: `qa/ao-logs/pr13-r3-eval-visual.status`

```json
{"status":"done","step":"pr13","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch02","fail_items":[],"revise_items":[]}
```

---

## §C. Eval-Interaction (Codex)

**상세 명세**: round 1 의 `HANDOFF-pr13-eval-interaction.md` 그대로. round 3 에서는 회귀 점검 + I1~I8 동일 매트릭스 재실행.

### §C 시작 단계 (B 와의 worktree 충돌 회피)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch02`
3. `git checkout --detach origin/feat/preview-inline-ch02`
4. `git rev-parse HEAD` 로 SHA 확인
5. `cd client && npm install --no-audit --no-fund`
6. **코드 수정 절대 금지**

### §C 회귀 검증 추가

- I1~I8 round 2 PASS 항목 재실행
- **추가**: PreviewPanel.tsx 변경이 InlineComponent 의 `key={qaId:scenarioId}` 동작을 깨지 않는지 — scenario 칩 클릭 시 active 동기 정상
- **추가**: iframe fallback path (phone-frame 데모) 가 영향 없는지 — ch01 외 챕터 일부 spot check

### §C 결과물

- 평가 보고: `qa-eval/pr13-eval-interaction-round3.json`
- 센티넬: `qa/ao-logs/pr13-r3-eval-interaction.status`

```json
{"status":"done","step":"pr13","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch02","fail_items":[],"revise_items":[]}
```

---

## 2. Master verdict 수령 절차 (round 3)

1. 3 센티넬 모두 PASS → Master 가 PR 생성: `gh pr create --base main --head feat/preview-inline-ch02 --title "feat(preview): ch02 4 데모 인라인 변환 + 36 SVG 아이콘 + 모바일 responsive (PR-13)" --body "<요약>"`
2. 1개라도 REVISE/FAIL → round 4 핸드오프 갱신 → 재spawn (no-stop)

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-03 | 초기 작성. round 2 V8 FAIL 후속. PreviewPanel.tsx flex-col-reverse 단일 wrapper |
