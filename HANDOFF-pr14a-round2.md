# HANDOFF-pr14a-round2 — I7 inline scenario URL hash sync

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-14a (round 2)
> **base**: `main` (`97b1eea`)
> **작업 브랜치**: `feat/preview-inline-ch03-q1-q4` (round 1 commit `698a2de` 위에 추가 커밋)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2)
> **round 1 verdict**: A=PASS / B=PASS (V1~V9 ALL) / **C=REVISE (I7 only)**

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr14a |
| round | 2 |
| branch | feat/preview-inline-ch03-q1-q4 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | **codex** |
| **eval-interaction model override** | **codex** |

---

## 1. round 1 결과 분석

| ID | round 1 verdict | round 2 처리 |
|---|---|---|
| **V1~V9 (visual)** | ALL PASS | 무수정 |
| **I1~I6, I8 (interaction static)** | ALL PASS (추정) | 무수정 |
| **I7 scenario hash 동작** | REVISE | round 2 fix: PreviewPanel.tsx 인라인 path 에 `window.history.replaceState` 추가 (iframe path 와 동등 hash 동기) |

**진단**: `client/src/components/learn/PreviewPanel.tsx::handleScenarioHash` (line 39~47) 가 iframe path 에서는 `iframe.src = ${demo.url}#${nextScenarioId}` 로 URL hash 변경. 그러나 inline path 에서는 `onScenarioChange(scenarioId)` (Zustand 만) 호출하고 URL hash 미업데이트. 핸드오프 §C I7 요구는 "칩 클릭 → URL hash 변경" 이므로 inline path 도 hash 변경 필요.

**원인**: PR-13 PreviewPanel.tsx 작성 시 inline path 의 hash sync 누락. PR-14a 가 PR-13 인프라 그대로 사용하므로 누락 상속.

**스코프 명확화**: 본 fix 는 PreviewPanel.tsx 1 파일 1~3 줄 변경. ch03 콘텐츠 파일은 무수정. PR-13 영역 침해 우려가 있으나, I7 contract 충족을 위한 최소 보강이고 ch01·ch02 동작에도 동일 효과 (URL 공유 가능).

---

## §A. Generator (Codex)

### §A 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch03-q1-q4`
3. `git checkout feat/preview-inline-ch03-q1-q4`
4. `git rev-parse HEAD` 결과가 `698a2deb742a1f528735a7747c976b72accd4698` 인지 확인
5. **별도 브랜치 생성 금지**. 직접 `feat/preview-inline-ch03-q1-q4` 위에 추가 커밋
6. **PR 생성 안 함** — Master 일괄 처리

### §A 수정 사항 (정확히 1곳)

#### 수정: `client/src/components/learn/PreviewPanel.tsx` `handleScenarioHash` 함수 (line ~39~47)

**현재**:
```tsx
const handleScenarioHash = (nextScenarioId: string) => {
  if (!inlineMeta) {
    const iframe = iframeRef.current;
    if (iframe && demo) {
      iframe.src = `${demo.url}#${nextScenarioId}`;
    }
  }
  onScenarioChange(nextScenarioId);
};
```

**변경**:
```tsx
const handleScenarioHash = (nextScenarioId: string) => {
  if (!inlineMeta) {
    const iframe = iframeRef.current;
    if (iframe && demo) {
      iframe.src = `${demo.url}#${nextScenarioId}`;
    }
  } else if (typeof window !== 'undefined') {
    // inline path: URL hash sync (iframe path 와 동등)
    window.history.replaceState(null, '', `#${nextScenarioId}`);
  }
  onScenarioChange(nextScenarioId);
};
```

**효과**:
- 인라인 데모 (ch01 / ch02 / ch03 ...) 시나리오 칩 클릭 시 URL hash 가 `#scenarioId` 로 변경
- 사용자가 URL 복사·공유·새 탭 열기 시 시나리오 상태 유지
- `replaceState` 사용 → 브라우저 history 미오염 (back 버튼이 시나리오 전환마다 추가되지 않음)
- iframe path 와의 일관성 (iframe 도 hash 사용 시 시나리오 식별)

### §A 절대 금지

- ch03 콘텐츠 파일 (q01~q04) 변경 금지
- `_shared/*` 변경 금지
- PreviewPanel.tsx 다른 곳 변경 금지 (handleScenarioHash 외)
- 다른 시나리오 처리 코드 (LearnPage, learn-store) 변경 금지
- master 브랜치 직접 push, force push, no-verify commit

### §A 검증 (자체 보고 의무)

1. `cd client && npm run build` 무에러
2. dev 모드에서 `/library/3/ch03_q01` 접근 → 칩 4개 클릭 → URL 가 `#unit/integration/e2e/balance` (또는 정의한 scenarioId) 로 변경되는지 확인
3. `/library/2/ch02_q01` (PR-13 유산) 도 동일 hash 동작 확인 (회귀 0)
4. 다른 페이지 (`/teacher`, `/landing`) 영향 0 — handleScenarioHash 는 PreviewPanel 내부 함수

### §A 완료 시 센티넬

파일: `qa/ao-logs/pr14a-r2-gen.status`

```json
{"status":"done","step":"pr14a","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch03-q1-q4","commit":"<round 2 SHA>","pr":"pending-master","loc":"+3 -1","note":"PreviewPanel.tsx handleScenarioHash inline path window.history.replaceState 추가. URL hash sync."}
```

---

## §B. Eval-Visual (Codex)

round 2 에서 V1~V9 회귀 확인. round 1 PASS 그대로 유지 예상.

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch03-q1-q4`
3. `git checkout feat/preview-inline-ch03-q1-q4`
4. `git rev-parse HEAD` 가 round 2 SHA 와 일치 확인
5. `cd client && npm install --no-audit --no-fund && npm run dev` — localhost:5176
6. **코드 수정 절대 금지**

### §B 검증 (round 2)

- V1~V9 round 1 ALL PASS 회귀 — 4 ch03 데모 변경 0 + PreviewPanel 1 줄만 추가이므로 시각 영향 0
- 시나리오 칩 클릭 → 시각 active 동기 정상 (V3 회귀)

### §B 결과물

- 평가 보고: `qa-eval/pr14a-eval-visual-round2.json`
- 센티넬: `qa/ao-logs/pr14a-r2-eval-visual.status`

```json
{"status":"done","step":"pr14a","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch03-q1-q4","fail_items":[],"revise_items":[]}
```

---

## §C. Eval-Interaction (Codex)

### §C 시작 단계 (B 와의 worktree 충돌 회피)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch03-q1-q4`
3. `git checkout --detach origin/feat/preview-inline-ch03-q1-q4`
4. `git rev-parse HEAD` 로 SHA 확인 — 센티넬 `commit` 필드에 동일 SHA
5. `cd client && npm install --no-audit --no-fund`
6. **코드 수정 절대 금지**

### §C 검증 우선순위 (round 2)

1. **I7-redo URL hash 동기**: 시나리오 칩 클릭 → `window.location.hash` 변경 확인.
   - 검증 방법: dev 모드 (`npm run dev`) headless browser (Puppeteer/Playwright 사용 가능 시) 또는 코드 정적 검증:
     - `grep -n "window.history.replaceState\|location.hash" client/src/components/learn/PreviewPanel.tsx` 결과에 `replaceState` 나타나는지
     - `handleScenarioHash` 함수 내 `else` 분기 (inline path) 에 hash 변경 코드 존재 확인
   - 동적 검증 (Puppeteer 사용 가능 시): `/library/2/ch02_q01` 로 navigate → 칩 클릭 4회 → `window.location.hash` 가 매 클릭마다 변경 확인
2. **I1~I6, I8 회귀 확인**: round 1 PASS 그대로 유지

### §C 결과물

- 평가 보고: `qa-eval/pr14a-eval-interaction-round2.json` (커밋 + push 권장)
- 센티넬: `qa/ao-logs/pr14a-r2-eval-interaction.status`

```json
{"status":"done","step":"pr14a","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch03-q1-q4","fail_items":[],"revise_items":[]}
```

> ⚠️ **eval branch push 강제**: round 1 의 arch-70 (Eval-Interaction) 가 평가 JSON 을 별도 브랜치 `codex/pr14a-r1-eval-interaction` 에 작성했으나 push 미완료로 Master 가 회수 불가 (sentinel 만 있고 details 없음). round 2 에서는 평가 JSON 을 `feat/preview-inline-ch03-q1-q4` 직접 push 하거나, 별도 branch 작성 후 즉시 `git push origin codex/pr14a-r2-eval-interaction` 강제 push (force 금지). PR 생성은 선택.

---

## 2. Master verdict 수령 절차 (round 2)

1. 3 센티넬 모두 PASS → Master 가 PR 생성: `gh pr create --base main --head feat/preview-inline-ch03-q1-q4 --title "feat(preview): ch03 q01~q04 인라인 변환 + URL hash sync (PR-14a)"`
2. 1개라도 REVISE/FAIL → round 3 (no-stop, ALL PASS 까지)

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-03 | 초기 작성. round 1 I7 REVISE 후속. PreviewPanel.tsx 1 곳 fix |
