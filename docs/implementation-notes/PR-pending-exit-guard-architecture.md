# 구현 노트 — architecture 뒤로가기 이탈 가드

> SDD: `docs/SDD-exit-guard-architecture-v1.md`. branch `feat/exit-guard-architecture-20260607`, base `main`(e4d8ed4).

## Decisions
- **anA(단일 라우트 1회 가드, key 미사용)**: 학생 세션 `/learn/:sessionId`(LearnPage mode='session'), 세션 내 Q&A 이동이 컴포넌트 상태(URL 고정). self 모드(`/library/:ch/:qa`)는 동일 컴포넌트지만 세션 아님 → 가드 제외.
- **`when={!isTeacherPreview}`** + session-ready return에만 배치: 가드는 `sessionStatus==='ready' && currentSession 일치`(서버검증 성공) 분기에서만 렌더. 교사 미리보기(`?role=teacher`)는 학생 아님 → 제외. 로딩·에러(410/401) 분기엔 미렌더 → 미참여/만료 Back 1회 이탈.
- **@source latent 버그 수정**: index.css가 `../../node_modules`(루트, shared 부재)를 스캔해 ConfirmModal raw Tailwind 클래스 미생성(빌드 CSS `bg-red-600` 0건 실측). shared 실위치=client/node_modules → `../node_modules`로 정정(수정 후 1건). ExitGuardModal이 ConfirmModal 재사용이라 필수 수정. self/teacher 등 기존 shared 컴포넌트 스타일도 함께 정상화되는 부수효과(개선).
- **shared reinstall**: 핀은 이미 `#main`이나 설치 dist가 useExitGuard 이전이라 reinstall로 be028aa 반영(lock 갱신).

## Changes
- `client/package-lock.json` — shared reinstall(be028aa).
- `client/src/index.css` — `@source` `../../node_modules`→`../node_modules`.
- `client/src/components/StudentExitGuard.tsx` (신규).
- `client/src/pages/LearnPage.tsx` — import + session-ready return 프래그먼트로 감싸 가드 1회.

## Tradeoffs
- self 모드(`/library`) 미가드 — 개인 열람은 이탈이 자연 동작. 세션 학습만 보호.
- @source 수정은 기존 코드 1줄 변경이나 가드 모달 렌더에 필수(스코프 내). 무관 변경 아님.

## Notes (검증 결과)
- 빌드: `npm run build`(tsc -b && vite build) exit 0.
- @source 수정 전후 빌드 CSS `bg-red-600`: 0건 → 1건(수정 효과 실측).
- Sprint Contract C3~C10 통과.
- codex review (`codex review --base main`, R1): **APPROVE** — "The changes add the exit guard only in the session-ready student path, exclude teacher preview and self-study paths, and update the shared Tailwind source path consistently with the client-local node_modules layout. I did not identify a discrete regression introduced by this patch." (결함 0)
- 실브라우저 게이트 (vite dev StrictMode + puppeteer, /usr/bin/google-chrome, /api 인터셉트 stub): **13/13 PASS**
  - session-ready 렌더 ✓ / Back→모달1·URL유지 ✓ / 연속Back 중복0·URL유지 ✓ / 취소→닫힘·잔류 ✓ / 나가기→랜딩(/) ✓ / stale 재무장 ✓ / StrictMode 경고0 ✓ / 모바일 모달 ✓ / **교사 미리보기(?role=teacher) 제외 모달0** ✓ / **세션 에러(401) off 모달0** ✓ / **self 모드(/library) 제외 모달0** ✓
  - ConfirmModal 스샷 직접 눈검증: 데스크탑(중앙·빨강 destructive)·모바일(하단 시트) 정상(@source 수정으로 클래스 정상 렌더 실증).
