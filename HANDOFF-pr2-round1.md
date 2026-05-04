# HANDOFF-pr2-round1 — LearnPage UI + TeacherExplainPanel + 친화 장치 7종 + V4/V5 PR-0 인계

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-2 — LearnPage PreviewPanel 헤더 5번째 토글 + TeacherExplainPanel 컴포넌트 + 친화 장치 6+1종(A1/A2/B1/D1/E1/F1 + C1 Glossary 컴포넌트 shell) + V4 ChatPanel placeholder 동적화 + V5 학습탭 summary 노출
> **base (GitHub PR)**: `ao/teacher-explain-pr1` (stacked — PR #86 후속)
> **작업 브랜치**: `ao/teacher-explain-pr2` (master 가 origin/ao/teacher-explain-pr1 HEAD `5285b71` 에서 분기)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-teacher-explain-v1.md` (v2.1)
> **에픽 위치**: teacher-explain v1 SDD 7-PR 직렬 3/7

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr2 |
| round | 1 |
| branch | ao/teacher-explain-pr2 |
| base | ao/teacher-explain-pr1 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** (대규모 UI — 컴포넌트 + 친화 장치 + ARIA + 반응형) |
| **eval-visual model override** | **codex** (12 시각 항목 V1~V12 §9.2) |
| **eval-interaction model override** | **codex** (8 인터랙션 항목 I1~I8 §9.2) |

---

## 1. PR-2 변경 범위 (잠금)

### 1.1 SDD 단일 진입점 — Generator 직접 읽기

| 섹션 | 내용 |
|------|------|
| §4.1 | TeacherExplainBlock 12 필드 (tldr/misconception/relatedQas + 9 필수 + 2 선택) |
| §4.4 | 친화 장치 7종 (A1/A2/B1/C1/D1/E1/F1) — UI 위치 + 동작 |
| §4.4.1 | Glossary 데이터 형식 (`teacher-glossary.ts` PR-3.5 에서 채움 — PR-2 는 빈 array import) |
| §4.4.1.1 | Bottom sheet 접근성 명세 — ARIA + 4종 닫힘 트리거 |
| §4.4.2 | 1분/3분 모드 노출 룰 (A2) |
| §5.1.3 | 색상 토큰 표 — 신규 토큰 :root 추가 |
| §5.2.1 | 데스크탑 LearnPage 탭바 변경 (D-1 확정) |
| §5.2.1.1 | D-3 상세 명세 (PR-2 잠금) |
| §5.2.1.2 | 모바일 라벨 단축 결정 |
| §5.2.1.3 | chapter 이동 시 previewTab 보존 분기 |
| §5.2.2 | 모바일 4탭 그대로 — 더보기 ⋯ 불필요 |
| §5.2.3 | learn-store 변경 |
| §5.3 | TeacherExplainPanel 컴포넌트 명세 |
| §5.3.1 | 모바일 393px ASCII 와이어프레임 |
| §5.3.2 | 카드 표준 스펙 |
| §5.3.3 | AdvancedSection 내부 탭 |
| §5.4 | GuidePanel/ChatPanel/PreviewPanel 변경 |
| §6.2 | 클라단 이중 차단 — fetch 가드 + sessionId 검증 |
| §6.2.1 | sessionId 누락 가드 (외부 검토 v1.3-2번) |
| §9.2 | Sprint Contract — 12 V + 11 I 검증 항목 |

### 1.2 신규/변경 파일

| 파일 | 변경 |
|------|------|
| `client/src/components/learn/TeacherExplainPanel.tsx` | **신규** — 12 필드 카드 렌더 + 친화 장치 6종 UI + ARIA |
| `client/src/components/learn/TeacherExplainPanel/`* | (선택 분리) AdvancedSection / DemoTipSection / 카드 컴포넌트 |
| `client/src/components/learn/Glossary.tsx` | **신규** — Tooltip(데스크탑) + bottom sheet(모바일) + ARIA 명세 §4.4.1.1 |
| `client/src/data/teacher-glossary.ts` | **신규 빈 shell** — `export const GLOSSARY: GlossaryEntry[] = []`. PR-3.5 가 채움 |
| `client/src/components/learn/PreviewPanel.tsx` | 헤더에 "📝 설명 노트" 토글 (teacherPanel===true) + previewTab='explain' 분기 + reload/fullscreen 툴바 숨김 |
| `client/src/components/learn/ChatPanel.tsx` | **V4 PR-0 인계** — placeholder 동적 (현재 Q&A title 참조). 예: `\`예: ${currentQa.title} 에 대해 라면 끓이기처럼 비유로 설명해줘\`` |
| `client/src/pages/LearnPage.tsx` | 학습 탭에 **V5 PR-0 인계 — summary 필드 노출** (body 위 강조 카드) + isTeacherPreview 계산 + sessionId/qaId 가드 |
| `client/src/store/learn-store.ts` | §5.2.3 변경 — `teacherChatTab` 단일 (D-3 정합) + chapter 이동 시 previewTab='explain' 보존 분기 |
| `client/src/index.css` | §5.1.3 신규 토큰 추가 (시간 라벨 색 + 오개념 카드 색) |
| `client/src/lib/teacher-explain-fetch.ts` | **신규** — `GET /api/teacher-explain/:qaId` fetch hook + 401/403/404 에러 분기 |
| (선택) `client/src/__tests__/teacher-explain-panel.test.tsx` | vitest |

### 1.3 변경 0 (절대 금지)

- 서버 코드 (PR-1 영역)
- DB schema
- 챗봇 (ai.ts)
- ar-storybook 등 다른 프로젝트
- main 직접 push

---

## §A. Generator (Codex)

### §A 시작 단계 (절대 준수)

1. `cd /home/claude/architecture`
2. `git fetch origin && git checkout ao/teacher-explain-pr2 && git pull --ff-only`
3. `git log --oneline -1` 확인 — `5285b71 feat: 교사용 설명 노트 서버 데이터 추가` 직후
4. **본 HANDOFF + SDD §4.1/§4.4/§5/§6.2/§9.2 + mockups/teacher-explain-v1.html (UI 의도) 본문 읽기** 필수
5. 모든 commit 은 본 브랜치 위에 직접
6. `git push origin ao/teacher-explain-pr2`
7. **PR 생성 안 함** — Master 가 verdict 후 일괄

### §A 작업 가이드

#### STEP 1 — 신규 토큰 (§5.1.3)

`client/src/index.css` :root 에 추가:
- `--color-time-before` (green-500 계열) / `--color-time-during` (amber-500) / `--color-time-after` (blue-500)
- `--color-misconception-bg` (#fef2f2) / `--color-misconception-border` (#fecaca) / `--color-misconception-label` (#7f1d1d)
- 인라인 hex 0건 — 모두 토큰 사용

#### STEP 2 — `Glossary.tsx` + 빈 데이터

§4.4.1 + §4.4.1.1 명세:
- 본문 스캔 — term + aliases 정확 일치 (단어 경계). 첫 등장만 점선 밑줄 (반복 평문)
- 데스크탑: hover → Tooltip
- 모바일: tap → bottom sheet 30vh 슬라이드 업 + ARIA(`role=dialog` + `aria-modal=true` + `aria-labelledby` + 4종 닫힘: backdrop·ESC·드래그 50px+·✕)
- 포커스 트랩 + open 시 첫 focusable + close 시 trigger 복귀

`client/src/data/teacher-glossary.ts` 빈 shell:
```ts
export interface GlossaryEntry { term: string; aliases?: string[]; oneline: string; category?: 'hw'|'sw'|'net'|'data'|'cloud'; }
export const GLOSSARY: GlossaryEntry[] = []; // PR-3.5 에서 30 entry 채움
```

#### STEP 3 — `TeacherExplainPanel.tsx` (대규모)

§5.3 + §4.4 + §4.4.2 명세:
- A1: tldr 패널 최상단 강조 카드 (accent border-left 4px + accent-soft bg + 14px font + 1줄)
- A2: 우상단 "⏱️ 1분 훑기 / 3분 정독" 토글 — 1분 = tldr+cue+prompts+misconception, 3분 = 전체. localStorage 마지막 선택 유지
- B1: 카드 좌측 3px 색 띠 (시간 라벨) + 라벨 옆 작은 dot
- D1: 오개념 상자 (붉은 tint 신규 토큰) — prompts 와 beforeDemo 사이
- E1: footer "👉 함께 보면 좋은 Q&A" + chip 1~3개 (relatedQas) — 클릭 시 `/learn/{sessionId}?qa={qaId}`. session.chapter_ids 안일 때만 활성, 밖이면 회색 + 호버 안내
- F1: 우상단 🖨️ 버튼 → `window.print()` + CSS `@media print` (A4 1장, 색 띠 보존, Tooltip 펼쳐 노출, 12pt)
- AdvancedSection: advanced 또는 demoTip **둘 다** 있을 때만 내부 탭. 하나만 있으면 직접 노출 (§5.3.3)
- "세션 주인 전용" 배지 (한글)
- Flow chips 4단계 (현재 학습 흐름 위치 강조 1, 나머지 3 비활성)

#### STEP 4 — `PreviewPanel.tsx` 헤더 토글

§5.4 + §6.2:
- `teacherPanel === true` 시 "📝 설명 노트" 토글 노출 (학생: 시연/퀴즈만)
- previewTab='explain' 활성 시 reload(↺)/fullscreen(⛶) 툴바 숨김
- previewTab='explain' 분기 본문 → `<TeacherExplainPanel block={data} />` 또는 fetch 진행 중 스켈레톤
- 모바일 393px 라벨 단축 (§5.2.1.2 결정 — "📝 설명" / "QR")

#### STEP 5 — `LearnPage.tsx` + V5 인계

§5.2 + §6.2 + V5 (PR-0 인계):
- `isTeacherPreview = mode==='session' && searchParams.get('role')==='teacher'`
- `sessionId = params.sessionId` (필수, UUID)
- PreviewPanel 에 `teacherPanel`/`sessionId`/`qaId` props 전달
- **V5**: 학습 탭에 currentQa.summary 강조 카드 노출 (body 위, accent-soft bg, 1~2줄)

#### STEP 6 — `ChatPanel.tsx` + V4 인계

§5.4 + V4 (PR-0 인계):
- placeholder 동적: `\`예: \${currentQa?.title || ''} 에 대해 ... 비유로 설명해줘\``
- 또는 ChatPanel props 로 currentQa 받아 동적 생성
- `라면 끓이기` hardcode 제거 — 일반화 ("일상 비유로", "예시로", 등)

#### STEP 7 — `learn-store.ts` (§5.2.3)

- `teacherChatTab` 단일 (D-3 정합)
- chapter 이동 시 previewTab='explain' 보존 (§5.2.1.3) — `resetForQa` 분기

#### STEP 8 — `teacher-explain-fetch.ts` (신규)

`GET /api/teacher-explain/:qaId?sessionId=...` fetch + 에러 분기:
- 401 → /forbidden 또는 토스트
- 403 → 인라인 "이 Q&A는 현재 세션에 포함되어 있지 않아요"
- 404 → 인라인 "준비 중" (placeholder 호환)
- 200 → 성공
- sessionId 누락 가드 (§6.2.1) — fetch 호출 0건 + 인라인 "세션 정보 없음"

### §A 절대 금지

- 서버 코드 변경 (PR-1 영역)
- 데이터 변경 (qa-stubs.ts / qa-meta.ts / 64 TS 모듈)
- DB schema
- raw hex (모두 토큰)
- main push, force push
- ~합니다 종결 신규 도입

### §A 검증 (자가)

1. `cd client && npm run build` 무에러
2. `cd server && npm run build` 무에러 (회귀)
3. `grep -nE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/components/learn/TeacherExplainPanel.tsx client/src/components/learn/Glossary.tsx` = 0건 (raw hex)
4. `grep -nE "~합니다" client/src/components/learn/TeacherExplainPanel.tsx` = 0건 신규 도입
5. dev mode 첫 진입 콘솔 에러 0건
6. **role=teacher 모바일 393px 시각 spot-check**: 헤더 3 토글 + QR 버튼 한 줄 (텍스트 잘림 0)
7. role=teacher 가 아닌 학생 모드 진입 시 "📝 설명 노트" 토글 DOM 0건

### §A 완료 시 센티넬

`qa/ao-logs/pr2-r1-gen.status`:
```json
{"status":"done","step":"pr2","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"ao/teacher-explain-pr2","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"TeacherExplainPanel + 친화 장치 6종(A1/A2/B1/D1/E1/F1) + Glossary 컴포넌트 shell + V4 동적 placeholder + V5 summary 노출 + 토큰 + ARIA + 반응형. build PASS, raw hex 0건."}
```

---

## §B. Eval-Visual (Codex) — V1~V12 (§9.2)

§9.2 시각 검증 표 그대로. 추가 V13:

| # | 항목 | 대상 |
|---|------|------|
| V1~V12 | SDD §9.2 표 | 데스크탑+모바일 |
| V13 | **V5 PR-0 인계** — 학습 탭에 currentQa.summary 강조 카드 노출 (body 위, accent-soft) | 데스크탑+모바일 |
| V14 | **V4 PR-0 인계** — ChatPanel placeholder 가 currentQa.title 참조 (라면 hardcode 제거) | 데스크탑+모바일 |

`qa/ao-logs/pr2-r1-eval-visual.status` + `qa-eval/pr2-eval-visual-round1.json`.

---

## §C. Eval-Interaction (Codex) — I1~I11 (§9.2)

§9.2 인터랙션 검증 표 그대로. role=teacher fetch sessionId 동봉, 401/403 분기, sessionId 누락 가드, qaId 정규식 검증, no-store 갱신 즉시 반영.

추가 I12: Glossary bottom sheet 모바일 4종 닫힘 (§4.4.1.1) — backdrop/ESC/드래그/✕.

`qa/ao-logs/pr2-r1-eval-interaction.status` + `qa-eval/pr2-eval-interaction-round1.json`.

---

## 2. Master verdict 수령 절차

| 시나리오 | Master 행동 |
|---------|------------|
| 3/3 PASS | `gh pr create --base ao/teacher-explain-pr1 --head ao/teacher-explain-pr2` |
| 1+ REVISE/FAIL | master 직접 fix 우선 (작은 차이) / round 2 codex (큰 변경) |

---

## 3. PR-0 + PR-1 학습 반영

| 학습 | PR-2 적용 |
|------|---------|
| HANDOFF 검증 경로 결함 (없는 라우트) | §B/§C 검증은 SDD §9.2 표 명시된 경로만 사용 (\`/learn/{sessionId}?role=teacher&qa={qaId}\`) |
| codex sentinel write hang | master 가 eval JSON 직접 읽고 sentinel 작성 가능 |
| 좁은 권한 §6.1.1 B (PR-1) | clients fetch URL 에 `?sessionId={sessionId}` 동봉 강제 |

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. 7-PR 직렬 3/7. SDD §5 광범위 참조 + V4/V5 PR-0 인계 흡수 |
