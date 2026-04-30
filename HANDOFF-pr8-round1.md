# PR #8 핸드오프 — 랜딩 + about + 404 + 배포

> 4-Phase: §A Generator / §B Eval-Visual / §C Eval-Interaction / §D 사용자 액션 (배포)
>
> base: main (PR #7 머지 후 분기)
> branch: `codex/pr8-landing-deploy`

---

## §A. T2 Generator (Codex)

### A.1 페이지

#### LandingPage.tsx (`/`)
- 헤로 + CTA "교사로 시작" → `/login` (또는 인증돼있으면 `/teacher`)
- 학생용 보조 CTA "수업 코드로 참여" → `/join`
- 책 소개: 알렉 『기술노트(With 알렉)』 영감, 71 Q&A 10챕터
- "어떻게 작동하나요" 3-step 설명 (교사 세션 만들기 / 학생 코드 참여 / AI 챗봇 학습)
- BUILDER-UX-POLICY §9 (히어로+CTA 집중, 보조 카드 ≤2)
- 푸터: `architecture.teachermate.co.kr` + 알렉 출처 표기

#### AboutPage.tsx (`/about`)
- 서비스 정체성, 책 출처 + 저자 표기
- AI 정책 (Claude Haiku 4.5, prompt caching, 답변 캐시, rate limit)
- 콘텐츠 정책 (책 본문 직접 인용 0%, Claude가 71 Q&A 본문 생성)
- 개인정보 처리방침 요약 (학생 닉네임만 저장, 카카오 OAuth 교사 전용)
- 문의: 운영자 이메일

#### NotFoundPage.tsx (`*`) — 이미 PR #1에 골격 있을 수 있음
- 404 + 홈 CTA + 라이브러리 CTA

### A.2 라우팅
- App.tsx 에 `/about` 라우트 추가 (이미 LandingPage 있음)

### A.3 배포 설정
- `render.yaml` 검증 (이미 PR #1에서 사용자가 직접 작성, guard hook으로 마스터 못 만짐)
- `vite.config.ts` 빌드 산출물 경로 확인
- `package.json` build/start 스크립트 정합

### A.4 환경변수 표 (PR body)
| 키 | Render 값 |
|---|---|
| `NODE_ENV` | production |
| `PORT` | 자동 |
| `ANTHROPIC_API_KEY` | sk-ant-... |
| `SUPABASE_URL` | https://xxx.supabase.co |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... |
| `VITE_SUPABASE_URL` | https://xxx.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | eyJ... |
| `KAKAO_OAUTH_REDIRECT_URI` | https://architecture.teachermate.co.kr/auth/callback |
| `HMAC_SECRET` | openssl rand -hex 32 |

### A.5 DNS
- Cloudflare DNS A/CNAME 레코드: `architecture` → Render 서비스 hostname (사용자 액션, 본 PR 외)
- HTTPS 자동 (Render + Cloudflare 양쪽)

### A.6 절대 금지
- render.yaml 마스터 직접 수정 (guard-protected-files hook)
- 운영 키 PR body에 평문 노출

### A.7 자체 보고 + 센티넬
- commit SHA + push + npm run build
- gh pr create --base main
- 센티넬 `qa/ao-logs/pr8-r1-gen.status`

---

## §B. T3 Eval-Visual (5건)

| ID | 항목 | 기준 |
|---|---|---|
| V1 | 랜딩 히어로 + CTA | BUILDER-UX §9 정합 (히어로 강조, CTA 좌우, 보조 카드 ≤2) |
| V2 | About 출처 표기 | 알렉 『기술노트』 명시, AI 정책 명시 |
| V3 | 404 페이지 | 안내 + 홈 CTA |
| V4 | 모바일 375 랜딩 | 풀폭 CTA, 폰트 가독성 |
| V5 | 회귀 | /teacher /library /learn 시각 회귀 X |

---

## §C. T4 Eval-Interaction (8건)

| ID | 항목 | 검증 |
|---|---|---|
| I1 | 랜딩 CTA 라우팅 | "교사로 시작" → /login (비로그인) 또는 /teacher (로그인) |
| I2 | 학생 CTA | "수업 코드로 참여" → /join |
| I3 | About 링크 | /about 진입 + 푸터 출처 링크 |
| I4 | 404 라우팅 | /random/404path → NotFoundPage |
| I5 | render.yaml | 빌드/시작 스크립트 정합 |
| I6 | 빌드 산출물 | dist/ 정상, server/dist/ 정상 |
| I7 | 회귀 PR #5/#6/#7 | 전체 chatbot/세션/OAuth 동작 |
| I8 | service-nav 통합 | teachermate-nav active="Architecture" 정합 |

---

## §D. 사용자 액션 (배포 — 본 PR 머지 후)

### D.1 Render 서비스 생성
- Web Service: `architecture` (개인 계정 nyuoasis-cmd)
- Repo: `nyuoasis-cmd/architecture`, branch `main`
- Build: `npm run build` (root, concurrently로 client+server)
- Start: `npm start` (server/dist/index.js)
- 위 §A.4 env 9개 paste-ready

### D.2 Supabase Auth Provider 카카오 활성화
- Supabase Dashboard → Authentication → Providers → Kakao 활성화
- Kakao Developers Console에서 redirect URI: `https://<supabase-ref>.supabase.co/auth/v1/callback`
- App에서 보내는 redirect: `https://architecture.teachermate.co.kr/auth/callback`

### D.3 Cloudflare DNS
- A/CNAME `architecture` → Render hostname

### D.4 service-nav.js Architecture 라벨
- youthschool 측 `service-nav.js` 에 Architecture 탭 추가 (별도 PR, 본 PR 범위 외)
- fallback: 미등록 시 빈 라벨 표시

---

## §E. 메타

자동화: `/home/claude/scripts/ao-arch-pipeline.sh 8 1` 또는 직접 spawn.
