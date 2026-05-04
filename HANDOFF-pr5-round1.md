# HANDOFF-pr5-round1 — Glossary integration debug + ARIA aria-describedby + 조건부 cleanup

> **프로젝트**: `architecture`
> **PR**: PR-5 — PR-3.5 인계: Glossary 컴포넌트 매칭 동작 디버깅 (TeacherExplainPanel `.glossary-term` DOM 0개 사고) + desktop tooltip `aria-describedby` 추가 + stone variant 토큰 검토 (조건부)
> **base**: `ao/teacher-explain-pr4` (stacked — PR #93 후속)
> **작업 브랜치**: `ao/teacher-explain-pr5`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-teacher-explain-v1.md` v2.1 §4.4.1/§9.5/§9.6
> **에픽 위치**: 7-PR 직렬 7/7 (마지막)

---

## 0. 메타

| key | value |
|---|---|
| step | pr5 |
| round | 1 |
| branch | ao/teacher-explain-pr5 |
| base | ao/teacher-explain-pr4 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** (디버깅 + 컴포넌트 fix) |
| **eval-visual model override** | **codex** (Glossary 매칭 시각 회귀) |
| **eval-interaction model override** | **codex** (ARIA 4종 닫힘 + aria-describedby) |

---

## 1. PR-5 변경 범위

### 1.1 Glossary integration 디버깅 (PR-3.5 Eval-Visual FAIL 인계)

**증상** (PR-3.5 round 1 Eval-Visual 보고):
- `/learn/{sessionId}?role=teacher&qa=ch01_q02` TeacherExplainPanel 진입
- 본문에 CPU/RAM/SSD 등 단어 보이지만 `.glossary-term` DOM 0개
- 데스크탑 tooltip + 모바일 bottom sheet 모두 trigger 부재로 동작 0

**원인 분석 (Generator 직접 디버깅 필수)**:
- `client/src/components/learn/Glossary.tsx` — `useGlossaryMarkup` hook의 `findEarliestMatch` 호출 결과
- `client/src/components/learn/TeacherExplainPanel.tsx:56` `<Glossary text={paragraph} seenTerms={seenTerms} />` — text passing 정합
- `client/src/data/teacher-glossary.ts` — 31 entry 정합 import
- 가설:
  1. seenTerms Set 공유 로직 — 매 paragraph 호출 시 새 Set 생성 후 Glossary 내부에서 매칭 안 됨
  2. dev mode HMR 캐시 stale (production build에서는 정합 가능)
  3. text split 로직이 paragraph 단위인데 term이 paragraph 첫 글자에 있어 boundary 매칭 실패
  4. Glossary 컴포넌트 default export 부정합

**fix 가이드**:
- Glossary 컴포넌트 자체 매칭 로직은 line 174-209 정상 (점검 완료)
- 가능한 fix: TeacherExplainPanel 의 Glossary props 또는 wrapping 패턴 점검
- dev mode `npm run dev` 띄우고 `/learn/{eval-session-id}?role=teacher&qa=ch01_q01` 직접 진입 → DevTools Elements 탭에서 `.glossary-term` count 검증
- 매칭 발생하지 않을 시 — Glossary 내부 console.log 일시 추가 → findEarliestMatch 결과 확인 → 원인 파악 후 fix → log 제거

### 1.2 ARIA aria-describedby 추가 (PR-3.5 Eval-Interaction REVISE 인계)

`client/src/components/learn/Glossary.tsx`:
- desktop tooltip trigger button (line 191 부근 `<button className="glossary-term">`) 에 `aria-describedby="<tooltip-id>"` 추가
- tooltip span에 `id="<unique-id>"` 부여 (useId 활용 가능)
- 데스크탑 hover 시 screen reader 가 oneline 텍스트 자동 안내

### 1.3 stone variant 토큰 (조건부 — SKIP 권장)

PR-2 Eval-Visual V8 PASS — 인라인 hex 0건 + amber/teal 토큰 사용 안 됨. **현 상태 적합**. 본 PR-5에서 추가 토큰 교체 불필요.

PR description 에 "stone variant 토큰 — PR-2 토큰 정합 검증 시 amber/teal 사용 0건으로 별도 교체 불필요" 명시.

### 1.4 PR-1 PR #84 QR 회귀 spot-check 1회

`/learn/{sessionId}?role=teacher&qa=ch01_q01` 진입 → PreviewPanel 헤더 QR 버튼 + Fullscreen 모달 동작 정상 spot-check.

---

## §A. Generator (Codex)

### §A 시작 단계

1. `cd /home/claude/architecture && git fetch origin && git checkout ao/teacher-explain-pr5 && git pull --ff-only`
2. `git log --oneline -1` 확인 — `8198ef9` 또는 그 이후
3. **본 HANDOFF + Glossary.tsx + TeacherExplainPanel.tsx + teacher-glossary.ts 읽기** 필수
4. dev mode `cd client && npm run dev` 띄우고 직접 진입 디버깅

### §A 작업 단계

**STEP 1**: Glossary 매칭 디버깅
- dev mode 진입
- `/learn/eval-session-1?role=teacher&qa=ch01_q01` (또는 적절한 session)
- DevTools Elements: `.glossary-term` count 측정
- 0이면 → console.log Glossary.tsx 내부 → findEarliestMatch 결과 + GLOSSARY length + seenTerms 공유 검증
- 원인 파악 → 최소 변경 fix
- 로그 제거 후 build PASS

**STEP 2**: aria-describedby 추가
- Glossary.tsx 의 button + tooltip span에 useId 기반 id 연결
- `aria-describedby` props 적용

**STEP 3**: 빌드 + 회귀
- `cd client && npm run build` 무에러
- `cd server && npm run build` 무에러 (회귀)

### §A 절대 금지

- 데이터 변경 (qa-stubs / teacher-explain / teacher-glossary)
- 라우트 / 서버 로직 변경
- 다른 컴포넌트 (TeacherExplainPanel) 큰 리팩토링 — Glossary integration fix만
- main push, force push

### §A 검증

1. `cd client && npm run build` 무에러
2. dev mode `/learn/{sessionId}?role=teacher&qa=ch01_q01` 진입 → `.glossary-term` count > 0 (DevTools Elements 또는 Playwright)
3. desktop tooltip 노출 + aria-describedby 연결 검증 (DevTools Accessibility tree)
4. PR #84 QR 회귀 0건

### §A 완료 시 센티넬

`qa/ao-logs/pr5-r1-gen.status`:
```json
{"status":"done","step":"pr5","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"ao/teacher-explain-pr5","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"Glossary integration fix + aria-describedby. .glossary-term DOM > 0 검증, build PASS."}
```

---

## §B. Eval-Visual + §C. Eval-Interaction

### §B/§C 시작 단계 (필수 강제)

1. **`git fetch origin && git checkout ao/teacher-explain-pr5 && git pull --ff-only`** — 정확한 brench
2. Generator sentinel + commit SHA 확인 (stale 의심 0)
3. 별도 브랜치 작업

### §B Eval-Visual

| # | 항목 |
|---|------|
| V1 | TeacherExplainPanel 렌더 시 `.glossary-term` DOM count > 0 (CPU/RAM/OS 등 첫 등장 점선 밑줄) |
| V2 | desktop hover → tooltip 노출 + oneline 텍스트 |
| V3 | mobile tap → bottom sheet 30vh 슬라이드 업 |
| V4 | PR #84 QR 회귀 0건 spot-check |

### §C Eval-Interaction

| # | 항목 |
|---|------|
| I1 | client + server build PASS |
| I2 | bottom sheet 4종 닫힘 (backdrop / ESC / 드래그 / ✕) §4.4.1.1 |
| I3 | desktop tooltip `aria-describedby` 연결 — DevTools Accessibility tree 검증 |
| I4 | bottom sheet ARIA — role=dialog + aria-modal=true + aria-labelledby + 포커스 트랩 |

`qa/ao-logs/pr5-r1-eval-{visual,interaction}.status` + `qa-eval/pr5-eval-*-round1.json`.

---

## 2. Master verdict 절차

3/3 PASS → `gh pr create --base ao/teacher-explain-pr4 --head ao/teacher-explain-pr5`. SDD `archive/SDD-teacher-explain-v1-completed.md` 이동은 사용자 머지 후.

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. 7-PR 직렬 7/7 마지막. Glossary debug + ARIA + 조건부 cleanup |
