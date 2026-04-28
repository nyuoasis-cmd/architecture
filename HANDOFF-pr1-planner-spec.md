# PR #1 Planner Spec — Architecture Academy 프로젝트 스캐폴드

> **Phase 1 (Planner) 산출물.** Generator(T2) / Eval-Visual(T3) / Eval-Interaction(T4)가 모두 이 파일을 시작점으로 참조한다.
> 작성: 2026-04-27 / 단일 진입점 SDD: `/home/claude/architecture/SDD-v1.md` (v1.4) / 핸드오프: `/home/claude/architecture/HANDOFF-implementation-2026-04-27.md`

---

## 0. PR 정의

- **레포**: `https://github.com/nyuoasis-cmd/architecture` (빈 레포, Planner 생성 완료)
- **브랜치**: `feat/scaffold` (Generator가 생성)
- **base**: `main` (Generator가 README만 담은 빈 main 먼저 push 후 PR open)
- **목표**: 프로젝트 스캐폴드 + ServiceHeader + `/api/health` + Render 배포 베이스. 콘텐츠·챗봇·세션은 후속 PR.

---

## 1. 워크플로우 — 4-Phase 적용

| Phase | 역할 | 모델 | 터미널 | 입력 |
|-------|------|------|--------|------|
| 1 Planner | 명세·Sprint Contract·리스크 | Claude Opus (이 세션) | T1 | SDD-v1 §9 + 핸드오프 §PR #1 |
| 2 Generator | 구현 | Claude Code Opus | T2 | `HANDOFF-pr1-generator.md` |
| 3 Eval-Visual | 시각 검증 | GLM-5.1 | T3 | `HANDOFF-pr1-eval-visual.md` |
| 4 Eval-Interaction | 인터랙션·인프라 검증 | Codex | T4 | `HANDOFF-pr1-eval-interaction.md` |

PR #1은 인프라 위주라 Visual 검증 항목은 ServiceHeader + LandingPage 임시 한정. Interaction이 핵심.

---

## 2. Sprint Contract 4축

### 2.1 코드 기준 (Generator 자체 보고)

| # | 기준 | 검증 방법 |
|---|------|----------|
| C1 | `/home/claude/architecture/client/` 신규 생성 + `package.json`/`index.html`/`vite.config.ts`/`tsconfig.json`/`postcss.config.js`/`src/main.tsx`/`src/App.tsx`/`src/index.css` 존재 | `ls` |
| C2 | `client/src/components/layout/ServiceHeader.tsx` + `client/src/pages/LandingPage.tsx` 존재 | `ls` |
| C3 | `/home/claude/architecture/server/` 신규 생성 + `package.json`/`tsconfig.json`/`src/index.ts`/`src/env.ts` 존재 | `ls` |
| C4 | `/home/claude/architecture/sql/001_init.sql` — SDD §6의 4테이블 + RLS + 인덱스 그대로 적재 | `grep create table` 4개, `grep create policy` 2개 이상 |
| C5 | `package.json` (root) — `concurrently` dev script, `build`, `start`. Planner가 작성한 부트스트랩 그대로 사용 가능 | `cat` |
| C6 | `.env.example` — Planner 부트스트랩 그대로 / `.gitignore` — Planner 부트스트랩 그대로 / `README.md` — Planner 부트스트랩 그대로 | `diff` 없거나 정당한 사유 보고 |
| C7 | client/server `package.json` 버전: `@anthropic-ai/sdk@^0.91.1` (preflight W1), `@supabase/supabase-js@^2.104.1` (preflight W2), React 19.1 / Vite 8.0 / Tailwind v4.2 / TS 5.9 / Express 5.2 (ai-app-builder 동일 핀) | `cat` |
| C8 | `client/src/index.css`에서 `@import '@teachermate/shared/design-tokens.css';` 정식 import ([feedback_shared-tokens-import-policy.md], A안) | `grep` |
| C9 | server `index.ts`: `app.get('/api/health', (_req,res)=>res.json({status:'ok',ts:Date.now()}))` 명시 | `grep` |
| C10 | server `env.ts`: zod로 `ANTHROPIC_API_KEY`/`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`HMAC_SECRET` 검증, 누락 시 부팅 에러 | `grep z.string()` |
| C11 | client `vite.config.ts`: 포트 5176, hmr:false, proxy `/api → http://localhost:3003`, allowedHosts:true | `cat` |
| C12 | server는 `client/dist` 정적 서빙 + SPA fallback (production 모드) | `grep express.static` |
| C13 | `git init` + main 분기에 README+`.gitignore` 1차 커밋 → `feat/scaffold` 분기로 나머지 추가 + push → `gh pr create --base main` | `gh pr view` |

### 2.2 자동 검증 기준 (Puppeteer/curl/build)

| # | 기준 | 명령 |
|---|------|------|
| A1 | `npm install` (root) → 자식 워크스페이스 의존성 + concurrently 무에러 | `cd /home/claude/architecture && npm install` |
| A2 | `cd client && npm install`, `cd server && npm install` 무에러 | 각 경로 |
| A3 | `npm run dev` — client :5176 + server :3003 동시 부팅 | 30s 대기 후 health check |
| A4 | `curl http://localhost:3003/api/health` → 200 + JSON `{"status":"ok","ts":<number>}` | curl |
| A5 | `curl http://localhost:5176/api/health` (vite proxy 경유) → 200 동일 응답 | curl |
| A6 | `curl http://localhost:5176` → 200 + HTML에 "Architecture" 텍스트 + `<teachermate-nav` 포함 | curl + grep |
| A7 | `npm run build` (root) → client `client/dist/index.html` + server `server/dist/index.js` 생성, 무에러 | ls |
| A8 | `node server/dist/index.js` (production) → 3003 부팅 + `/api/health` 200 + `/`에서 `client/dist/index.html` 정적 서빙 | curl |

### 2.3 시각 기준 (Eval-Visual / GLM)

| # | 기준 | 측정 |
|---|------|------|
| V1 | ServiceHeader: web component `<teachermate-nav active="Architecture" />` 렌더 시도 + script load | DOM inspector |
| V2 | LandingPage 임시: 헤딩 "Architecture Academy" + 부제 1줄 + 카카오 로그인 placeholder 버튼 1개 + DEV 로그인 링크 1개. 그 외 콘텐츠 없음 (PR #8에서 본 랜딩) | 스크린샷 |
| V3 | shared design-tokens 적용 확인: `getComputedStyle(document.body)`에서 `--color-stone-50`/`--color-navy` 등 CSS 변수 정의 존재 | DevTools |
| V4 | Pretendard 폰트 적용 (한글 표기에 영문 폰트 fallback X) | DevTools |
| V5 | 모바일 viewport (375×812) 깨짐 없음 — 가로 스크롤 0px | 스크린샷 |

PR #1에는 목업(`mockups/student-learn.html`)과 1:1 매칭할 화면이 없음. 본격 비교는 PR #2 `/learn` STEP에서.

### 2.4 인터랙션·인프라 기준 (Eval-Interaction / Codex)

| # | 기준 | 시나리오 |
|---|------|---------|
| I1 | `/api/health` 응답 헤더에 `Cache-Control: no-store` 또는 동등 | curl -I |
| I2 | server `env.ts` — 필수 env 누락 상태에서 부팅 시도 → 명시 에러 메시지 + non-zero exit | `unset SUPABASE_URL && npm start` |
| I3 | server SIGTERM 수신 시 graceful shutdown (Express close → process exit 0) | `kill -TERM` |
| I4 | client 빌드 산출물에 `import.meta.env.VITE_SUPABASE_URL` 누락 시 빌드 시점 경고 또는 런타임 명시 메시지 | grep |
| I5 | `render.yaml` lint — `healthCheckPath: /api/health` + `plan: starter` + envVars 8개 (sync:false) | yaml lint |
| I6 | proxy 동작: client `/api/foo` → server `/api/foo` 정상 라우팅. 미존재 endpoint는 404 JSON `{error:"..."}` | curl |
| I7 | CORS: 같은 origin에서 호출 시 preflight 없이 200. 다른 origin은 `cors()` 미들웨어로 허용 | curl Origin |
| I8 | `git remote get-url origin` = `https://github.com/nyuoasis-cmd/architecture.git` | git |
| I9 | PR open 상태 + base=main + head=feat/scaffold + Test plan 체크리스트 동봉 | gh pr view |

---

## 3. 리스크 예측 (Generator가 빠질 함정)

| # | 리스크 | 출처 메모리 | 대응 |
|---|--------|-----------|------|
| R1 | shared design-tokens를 `@shared` vite alias로 import (워크트리 밖 빌드 회귀) | `[feedback_shared-tokens-import-policy.md]` | A안: `@import '@teachermate/shared/design-tokens.css'` 정식 npm 경로만 |
| R2 | Tailwind v4 reset을 `@layer base` 바깥에 작성 → utility 무시 | `[feedback_tailwind-v4-layer-reset.md]` | `index.css` 모든 reset/`*` 룰을 `@layer base { ... }` 안 |
| R3 | Vite hmr 켠 상태로 모바일 QA 시 스크립트 깨짐 | `[reference_mobile-qa.md]` | `vite.config.ts`에 `server.hmr:false` |
| R4 | 패키지 버전 핀 변경 후 stale lock — 옛 sha dist | `[feedback_npm-lock-resync-on-pin-change.md]` | `rm -rf node_modules package-lock.json && npm install` |
| R5 | Supabase signInWithOAuth 시그니처 (PR #1엔 호출 없지만, env 자리만) | `[feedback_supabase-oauth.md]` | `flowType` 등 옵션 손대지 말 것. PR #7에서 카카오 OAuth 호출 |
| R6 | `/api/health` 누락 → Render Starter cold start 페이지 첫 진입 콜드 | preflight W3 | health endpoint + `render.yaml healthCheckPath` 양쪽 |
| R7 | `<teachermate-nav>` web component active 라벨 "Architecture"이 service-nav.js에 미등록 → fallback 표시 정상 | CLAUDE.md service-nav 정책 | service-nav.js 등록은 youthschool 측 별도 PR (PR #1 범위 외). 컴포넌트 자체는 렌더되어야 |
| R8 | `render.yaml` 파일은 Claude harness `guard-protected-files.sh` hook으로 차단됨 — Planner도 작성 실패 확인 | (이번 세션 발견) | Generator도 동일 차단 가능성 → §4.5에 사용자 액션으로 분리 |
| R9 | 첫 commit이 main에 직접 push면 PR open 불가 (head==base) | git 일반 | main에 README만 1차 커밋 → `feat/scaffold` 분기로 나머지 → `gh pr create --base main --head feat/scaffold` |
| R10 | `@teachermate/shared` GitHub 패키지 import — `npm install`이 GitHub 인증 필요할 수 있음 | ai-app-builder 운영 사례 | ai-app-builder/sprint/block-design 모두 정상 설치 — 동일 패턴 따라하면 OK. 실패 시 `--force` 또는 `npm config set //github.com/...` |

---

## 4. Generator 실행 절차 (요약, 자세한 내용 `HANDOFF-pr1-generator.md`)

1. `cd /home/claude/architecture`
2. Planner 부트스트랩 4파일 검토: `.gitignore` / `.env.example` / `package.json` / `README.md` — 정합 시 그대로 사용, 의문 시 보고
3. `client/`, `server/`, `sql/` 디렉토리 + 파일 작성 (§2.1 C1~C13)
4. `npm install` 양쪽 + `npm run dev` 부팅 검증 + `curl /api/health` 200
5. `git init -b main` → README+.gitignore 1차 커밋 → `git remote add origin https://github.com/nyuoasis-cmd/architecture.git` → `git push -u origin main`
6. `git checkout -b feat/scaffold` → 나머지 파일 add/commit → `git push -u origin feat/scaffold`
7. `gh pr create --base main --head feat/scaffold` (Test plan 체크리스트 §2.2 A1~A8 그대로 + §2.3 V1~V5 + §2.4 I1~I9 동봉)
8. 자체 보고 (§2.1 C1~C13 PASS/FAIL 표) → Planner 회신 대기

### 4.5 사용자 액션 (Generator/Eval과 병행)

- `render.yaml` 작성: Claude harness hook으로 차단되므로 사용자가 직접 다음 내용을 `/home/claude/architecture/render.yaml`에 저장. 또는 GitHub 웹 UI에서 직접 추가.

```yaml
services:
  - type: web
    name: architecture
    runtime: node
    plan: starter
    buildCommand: cd client && npm install --include=dev && npm run build && cd ../server && npm install --include=dev && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
      - key: KAKAO_OAUTH_REDIRECT_URI
        sync: false
      - key: HMAC_SECRET
        sync: false
```

- Render Web Service 생성 + GitHub 연결 + env 등록은 PR #1 머지 후 별도 액션 (사용자에게 paste-ready로 키 받아 마스터가 안내)

---

## 5. 머지 게이트

| 조건 | 상태 |
|------|------|
| Generator 자체 보고 §2.1 모든 항목 PASS | 필수 |
| Eval-Visual JSON 출력 `overall: PASS` 또는 V2/V5만 PASS + 나머지 N/A (목업 매칭 PR #2부터) | 필수 |
| Eval-Interaction JSON 출력 `overall: PASS` | 필수 |
| `npm run build` + `node server/dist/index.js` 양쪽 production 부팅 | 필수 |
| GitHub Actions CI는 PR #1에는 없음 (이후 PR에서 추가 검토) | (해당 없음) |

REVISE 발생 시 §그 결과 머지 규칙 (WORKFLOW-4PHASE.md 참조).

---

## 6. 다음 PR

- **PR #2~#11**: 콘텐츠 11개 (챕터 1~10 + 내비게이션) — 알렉 통지 게이트 (사용자 액션 #1 처리됨, 머지 가능)
- **PR #4A**: Anthropic 챗봇 + 캐시 (Haiku 4.5)
- **PR #4B**: 후처리 알고리즘 (§11.7)
- **PR #5**: 학생 학습 화면 (`/learn`) — 4-Phase 정통 첫 적용 STEP
- **PR #6**: 교사 세션 + QR + 대시보드
- **PR #7**: 카카오 OAuth + DEV 로그인 + HMAC 서명 토큰
- **PR #8**: 본 랜딩 + about + Cloudflare DNS

A/B eval은 PR #1 진행과 병렬로 가능 (사용자 API 키 paste 후 마스터가 실행 → 결과 사용자+비전공자 평가).
