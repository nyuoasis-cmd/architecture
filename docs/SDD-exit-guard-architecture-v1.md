# SDD — architecture 뒤로가기 이탈 가드 (useExitGuard 복제) v1

> 레퍼런스 정본: sangkwon(anA) / data-class(anB) / kospi-1980·meta-character(anA 단일 라우트). architecture **앱별 차이 실측 반영** 복제. 에픽: 뒤로가기 가드 슬라이스1 잔여 5앱 중 3/5.

## §0 메타
| 항목 | 값 |
|------|-----|
| branch | `feat/exit-guard-architecture-20260607` |
| base | **`main`** (architecture 기본 브랜치 = main, master 아님 / origin e4d8ed4) |
| worktree | `/home/claude/.worktrees/architecture-exitguard-20260607` (격리) |
| AI/DB/API 영향 | **없음**(순수 클라 가드) |
| 고객명 literal | **없음** |

## §2 현재 상태 (실측) — 앱별 차이
- 라우터: react-router-dom v7, `BrowserRouter`+`<React.StrictMode>`(main.tsx).
- 구조: client/ + server/ 분리, **node_modules는 client/node_modules(빌드 단위)**. 루트엔 shared 없음. `@teachermate/shared` 이미 `#main` 핀(client/package.json) — 단 **설치된 dist가 useExitGuard 이전 버전**(stale)이라 reinstall 필요.
- **학생 세션 = `/learn/:sessionId`(LearnPage mode='session')**. 같은 LearnPage 컴포넌트가 `mode='self'`(`/library/:ch/:qa` 자가학습)도 담당 → **mode='session'만 가드**(self는 도서관 개인 열람, 세션 아님). 세션 내 Q&A 이동은 컴포넌트 상태(URL=/learn/:sessionId 고정) → **anA(단일 라우트 1회 가드, key 불필요)**.
- 서버 검증: `getSession(sessionId)` → `sessionStatus` 'loading'→'ready'/'error'. mode='session' return 분기: ① 410 error→Navigate(/join?closed) ② 401 error→Navigate(/join?expired or /forbidden) ③ `sessionStatus!=='ready' || !qa || ...`→로딩 화면 ④ **ready→`<LearnLayout .../>`(세션 학습 본문)**. ④에서만 가드.
- `isTeacherPreview` = mode==='session' && `?role=teacher` — 교사 미리보기. 학생 가드 제외(`when={!isTeacherPreview}`).
- **Tailwind @source 잠재 버그 발견·수정**: index.css(`client/src/`)의 `@source "../../node_modules/..."`는 루트 node_modules(shared 부재)를 가리켜 ConfirmModal raw Tailwind 클래스가 스캔되지 않음(빌드 CSS `bg-red-600` 0건 실측). shared 실위치=client/node_modules → **`../node_modules`로 정정**(수정 후 `bg-red-600` 1건 실측). ExitGuardModal=ConfirmModal 재사용이라 이 수정 없으면 모달이 무스타일.

## §3 변경 명세
1. **`client/package-lock.json`** — shared reinstall(#main, useExitGuard 포함 be028aa)로 lock 갱신.
2. **`client/src/index.css`** — `@source` 경로 `../../node_modules`→`../node_modules`(latent 버그 수정, shared dist 클래스 스캔).
3. **(신규) `client/src/components/StudentExitGuard.tsx`** — 공통 래퍼.
4. **`client/src/pages/LearnPage.tsx`** — import + mode='session' **ready 분기 return**을 프래그먼트로 감싸 `<StudentExitGuard when={!isTeacherPreview} />` **1회**. 로딩·에러·self 분기엔 미렌더.

### 단일 렌더 불변식
- 가드는 session-ready return에만 1회. 로딩/에러/self/teacher-preview엔 미무장 → 에러·미참여 Back 1회 이탈, self 자유 이동.

### Out of Scope
- `/library`·`/library/:ch/:qa`(self)·`/join`·`/`·`/teacher/*`·teacher-preview(`?role=teacher`) ❌ / 나머지 앱 ❌ / 교사 네비(슬라이스2)·복귀 링크(슬라이스3) ❌

### Sprint Contract (grep)
| ID | 명령 | 기대 |
|----|------|------|
| C3 | `grep -c 'export function StudentExitGuard' .../StudentExitGuard.tsx` | =1 |
| C4 | `grep -c 'useExitGuard(' .../StudentExitGuard.tsx` | =1 |
| C5 | `grep -c '<StudentExitGuard' client/src/pages/LearnPage.tsx` | =1 |
| C6 | `grep -rl 'useExitGuard' client/src/` | =1 且 StudentExitGuard.tsx |
| C7 | `grep -c '@source "../node_modules/@teachermate/shared/dist' client/src/index.css` | =1 |
| C8 | Join/Library/Teacher/Landing 가드 | =0 |
| C9 | `npm run build` | exit 0 |
| C10 | 빌드 CSS `bg-red-600` | 존재(수정 후) |

## §4 DB / §5 API — 해당 없음(변경 0, onConfirmExit=`navigate('/')`만).

## §6.5 Acceptance Criteria
- [ ] **Given** 세션 학습(`/learn/:sessionId`, ready)에 있을 때, **When** 뒤로가기, **Then** 앱 밖 이탈 없이 "수업에서 나가시겠어요?" 모달. 취소=잔류, 나가기=랜딩(/).
- [ ] (경계) 로딩/에러/미참여/`role=teacher`/self(`/library`) → 가드 off → Back 정상 이탈.
- [ ] (게이트) 연속Back 모달1·URL유지 / stale 재무장 / StrictMode 경고0 / ConfirmModal 데스크탑+모바일 스샷.

## §7 구현 노트 의무
`docs/implementation-notes/PR-pending-exit-guard-architecture.md`.
