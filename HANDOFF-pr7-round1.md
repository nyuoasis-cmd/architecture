# PR #7 핸드오프 — 카카오 OAuth + DEV 로그인 + 권한 게이트

> 4-Phase: §A Generator (Codex T2) / §B Eval-Visual (Codex T3) / §C Eval-Interaction (Codex T4) / §D 리스크
>
> base: main (PR #6 머지 후 시점에서 분기)
> branch: `codex/pr7-oauth` (T2가 자동 생성)
> SDD 참조: `/home/claude/architecture/SDD-v1.md` §4(라우팅) §6(DB) §8(인증) §9(PR #7)

---

## §A. T2 Generator (Codex)

### A.1 신규 라우트 + 게이트
| path | 화면 | 권한 |
|---|---|---|
| `/` (랜딩) | "교사로 시작" CTA | 공개 |
| `/login` | 카카오 OAuth 진입 | 공개 |
| `/auth/callback` | OAuth 콜백 | 공개 |
| `/dev-login` | DEV 로그인 (이미 PR #6 도입, 본 PR에서 마무리) | 공개 |
| `/forbidden` | 권한 없음 안내 | 공개 |
| `/teacher`, `/teacher/session/:id` | 인증 게이트 추가 | 카카오 또는 DEV user 필수 |

### A.2 클라이언트
- `client/src/pages/LoginPage.tsx` — Supabase Auth UI 또는 직접 카카오 OAuth 버튼 + DEV 로그인 안내
- `client/src/pages/AuthCallbackPage.tsx` — `/auth/callback#access_token=...` 파싱, Supabase session 저장, 마지막 위치 또는 `/teacher` 이동
- `client/src/pages/ForbiddenPage.tsx` — 403 안내 + 로그인/홈 CTA
- `client/src/components/auth/AuthGate.tsx` — useAuth(): Supabase user OR useDevUser. 없으면 `/login` 또는 `/forbidden` redirect
- `client/src/lib/supabase-client.ts` — createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) 단일 인스턴스
- `client/src/lib/auth.ts` — useAuth(), signInKakao(), signOut() 헬퍼

`/teacher`, `/teacher/session/:id` 에 `<AuthGate>` 래핑. 기존 `useDevUser()` 단독 의존 제거 (Supabase user 우선, fallback DEV).

### A.3 서버
- `server/src/lib/auth.ts` — getRequestUser() 강화: Authorization Bearer JWT (Supabase) 우선, x-dev-teacher-id 헤더 fallback (개발용, NODE_ENV=development만 허용)
- POST `/api/sessions`, GET `/api/sessions`, GET `/api/sessions/:id` (owner), POST `/api/sessions/:id/end` 모두 인증 필수 (PR #6에서 이미 부분 적용)
- 401 응답: `{ error: 'unauthorized' }` 일관

### A.4 환경변수
- `.env.example` 업데이트: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 명시 (이미 .env에 있음)
- 카카오는 Supabase Auth Providers로 설정 (코드 변경 X, 사용자가 Supabase Dashboard에서 활성화). 본 PR은 코드 차원에서 Supabase signInWithOAuth({provider:'kakao'}) 호출만.

### A.5 SQL
- 신규 테이블 없음. `architecture_sessions.teacher_id` 는 이미 `auth.users(id)` 참조.
- DEV 로그인 사용자도 auth.users에 있어야 RLS 통과. DEV 로그인은 `signInWithPassword({email, password})` 또는 `signUp` 후 영구 dev 계정 사용.

### A.6 제외
- 학생 인증은 PR #6의 서명 참여 토큰(쿠키) 그대로 (변경 X)
- 알림/이메일 검증 등 (P1)

### A.7 절대 금지
- chat-service.ts / progress.ts / sessions.ts 핵심 로직 변경 (PR #5/#6 회귀 방지)
- 클라이언트에서 SUPABASE_SERVICE_ROLE_KEY 사용 (절대 금지)
- 학생용 `/join` 흐름에 OAuth 도입 (스펙 위반)

### A.8 자체 보고
- commit SHA + push 완료 명시
- npm run build (client) + cd server && npx tsc --noEmit 무에러
- gh pr create --base main --title "feat: PR #7 카카오 OAuth + DEV 로그인 + 권한 게이트"
- 센티넬 `qa/ao-logs/pr7-r1-gen.status` (한 줄 JSON, qa/ao-logs/SENTINEL-SPEC.md 규약)

---

## §B. T3 Eval-Visual (6건)

| ID | 항목 | 기준 |
|---|---|---|
| V1 | LoginPage 시각 | 카카오 노란색 버튼 + DEV 로그인 secondary, 헤더 D안 정합 |
| V2 | AuthCallbackPage | 로딩 인디케이터 + 안내 텍스트, 1초 이상 머무르면 토스트 |
| V3 | ForbiddenPage | 명료한 403 안내 + 홈/로그인 CTA 좌우 |
| V4 | /teacher AuthGate | 미인증 시 즉시 /login 리다이렉트 (빈 화면 X) |
| V5 | 모바일 375 LoginPage | 카카오 버튼 풀폭, 폰트 가독성 |
| V6 | 자율학습 회귀 | /library, /library/:c/:q PR #5/#6 회귀 X |

---

## §C. T4 Eval-Interaction (10건)

`.env`: VITE_SUPABASE_URL/ANON_KEY 적용 완료. NODE_ENV=development.

| ID | 항목 | 검증 |
|---|---|---|
| I1 | 카카오 signInWithOAuth | provider 'kakao' redirect URL 정확 |
| I2 | AuthCallback 토큰 파싱 | URL fragment access_token → Supabase setSession |
| I3 | useAuth() user 상태 | 로그인 후 user.id, email 노출 |
| I4 | /teacher AuthGate | 비로그인 → /login. 로그인 → 대시보드 |
| I5 | DEV 로그인 (NODE_ENV=development) | dev user → /teacher 진입, x-dev-teacher-id 헤더 동작 |
| I6 | DEV 로그인 (production) | 거부 또는 안내 |
| I7 | signOut | localStorage 정리 + redirect /  |
| I8 | /teacher/session/:id 비owner 접근 | 403 → /forbidden |
| I9 | PR #6 회귀 | /api/sessions, /api/join, /api/progress 동작 |
| I10 | PR #5 회귀 | ChatPanel 챗봇 응답 |

---

## §D. 리스크

### D.1 Supabase Auth Provider 카카오 설정
- 코드는 `signInWithOAuth({provider:'kakao'})`만 호출
- 실제 카카오 redirect URL은 Supabase Dashboard에서 등록 (사용자 액션, 본 PR 외)
- 본 PR 머지 후 사용자가 Dashboard에서 카카오 활성화 + redirect URL `<origin>/auth/callback` 추가

### D.2 DEV 로그인 보안
- NODE_ENV=production에서는 `/dev-login` 라우트 자체 비활성화 또는 Forbidden
- DEV 헤더 `x-dev-teacher-id` 검증도 production에서 차단

### D.3 RLS 정합
- DEV 사용자도 `auth.users` 행 필요 (RLS 통과). 영구 DEV 사용자 1개를 SQL로 미리 등록 (sql/004 같은 별도 마이그 또는 사용자 manual)

### D.4 PR #6 회귀
- ChatPanel/세션 자동화 동작 그대로 유지

---

## §E. 메타

자동화: `/home/claude/scripts/ao-arch-pipeline.sh 7 1` 또는 직접 spawn (HANDOFF-pr6와 같은 패턴).
