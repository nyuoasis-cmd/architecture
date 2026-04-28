# HANDOFF — PR #1 Generator (T2)

> 이 프롬프트를 새 터미널(T2)의 Claude Code Opus(또는 Codex)에 그대로 복붙한다. **Planner(T1) / Eval(T3·T4)와 같은 터미널에서 실행 금지.**

---

## 컨텍스트

당신은 Architecture Academy 프로젝트(`architecture.teachermate.co.kr`) **PR #1 (프로젝트 스캐폴드)** 의 Generator입니다. 4-Phase 워크플로우로 진행하며, 시각/인터랙션 두 Evaluator가 독립 검증합니다.

### 필수 사전 읽기 (순서대로)

1. `/home/claude/shared/WORKFLOW-4PHASE.md` — 4-Phase 표준
2. `/home/claude/architecture/HANDOFF-pr1-planner-spec.md` — **Planner Sprint Contract 4축 + 리스크 예측** (이번 PR의 단일 명세)
3. `/home/claude/architecture/SDD-v1.md` §6, §8, §11.6 — 데이터 모델, 스택, env 관리
4. `/home/claude/architecture/CLAUDE.md` — 프로젝트 개요
5. `/home/claude/shared/DESIGN-POLICY.md` — 시각 정책

참조 (코드 패턴 차용):
- `/home/claude/ai-app-builder/client/` — Vite 8 + Tailwind v4 + React 19 동일 스택 운영 중
- `/home/claude/ai-app-builder/server/` — Express 5 + TS 동일
- `/home/claude/ai-app-builder/client/src/components/layout/ServiceHeader.tsx` — web component 패턴 그대로

---

## 자기 제약

- **자체 보고 정직성**: "대체로 작동함"은 PASS 아닙니다. 의심스러우면 FAIL로 보고합니다.
- **4-Phase 인지**: 시각 Evaluator(GLM)와 인터랙션 Evaluator(Codex)가 독립 검증합니다. 어느 한 축만 PASS면 전체 PASS 아닙니다.
- **자기 Eval 절대 금지**: grep으로 "있다"를 PASS로 보고하는 것 금지. 실제 빌드/부팅/curl 결과로만 보고.
- **변경 범위**: 이번 PR은 스캐폴드. 콘텐츠/챗봇/세션/카카오 OAuth/DEV 로그인 코드는 작성하지 않습니다 (Planner spec §6 후속 PR).

---

## 작업 범위

### 이미 작성된 부트스트랩 (Planner)

- `/home/claude/architecture/.gitignore`
- `/home/claude/architecture/.env.example`
- `/home/claude/architecture/package.json` (root, concurrently dev script)
- `/home/claude/architecture/README.md`

→ **검토만**: 정합하면 그대로 사용, 의문 시 보고서에 명시.

### Generator가 작성

Planner spec **§2.1 코드 기준 C1~C13** 그대로. 특히 다음 파일:

```
architecture/
├── client/
│   ├── package.json                        # React 19.1, Vite 8.0, Tailwind v4.2, TS 5.9
│   ├── index.html                          # title="Architecture Academy"
│   ├── vite.config.ts                      # 5176, hmr:false, proxy /api → :3003
│   ├── tsconfig.json
│   ├── postcss.config.js                   # @tailwindcss/postcss
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                         # ServiceHeader + LandingPage
│       ├── index.css                       # @import @teachermate/shared/design-tokens.css + @tailwindcss + @layer base reset
│       ├── components/layout/
│       │   └── ServiceHeader.tsx           # ai-app-builder 패턴 그대로, active="Architecture"
│       └── pages/
│           └── LandingPage.tsx             # 임시: 헤딩 + 부제 + 카카오 placeholder + DEV 로그인 링크
├── server/
│   ├── package.json                        # @anthropic-ai/sdk@^0.91.1, @supabase/supabase-js@^2.104.1, express ^5.2, tsx, zod
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                        # Express + cors + /api/health + production static serving + SIGTERM
│       └── env.ts                          # zod 검증
└── sql/
    └── 001_init.sql                        # SDD §6 4테이블 + RLS + 인덱스 그대로
```

### 사용자 액션으로 분리 (작성 시도 금지)

- `/home/claude/architecture/render.yaml` — Claude harness `guard-protected-files.sh` hook으로 차단됨. Planner spec §4.5에 내용 명시 — 사용자가 직접 작성 또는 GitHub 웹 UI에서 추가. Generator는 작성 시도 후 차단되면 보고만.

---

## 절차

1. `cd /home/claude/architecture`
2. Planner 부트스트랩 4파일 검토 (§2.1 C5/C6)
3. `client/`, `server/`, `sql/` 디렉토리 + 파일 작성
4. `cd /home/claude/architecture && npm install` (root) → 의존성 + concurrently
5. `cd client && npm install` / `cd ../server && npm install`
6. `npm run dev` (root) — client :5176 + server :3003 동시 부팅 확인
7. **자동 검증**: §2.2 A1~A8 모두 통과
   ```bash
   curl -s http://localhost:3003/api/health  # → {"status":"ok","ts":...}
   curl -s http://localhost:5176/api/health  # vite proxy
   curl -s http://localhost:5176             # HTML에 "Architecture" 포함
   npm run build                             # 양쪽 dist 생성
   node server/dist/index.js                 # production 부팅
   curl -s http://localhost:3003/            # client/dist/index.html 정적 서빙
   ```
8. `git init -b main`
9. README + .gitignore 1차 커밋:
   ```bash
   git add README.md .gitignore
   git commit -m "chore: initial commit"
   git remote add origin https://github.com/nyuoasis-cmd/architecture.git
   git push -u origin main
   ```
10. `git checkout -b feat/scaffold` → 나머지 파일 add/commit → push
11. `gh pr create --base main --head feat/scaffold --title "PR #1: 프로젝트 스캐폴드 + ServiceHeader + /api/health"` — Test plan에 §2.2 A1~A8 + §2.3 V1~V5 + §2.4 I1~I9 체크박스 동봉

---

## 자체 보고 형식

PR description에 다음 표 동봉 (Planner spec §2.1 그대로):

| # | 기준 | 결과 | 근거 |
|---|------|------|------|
| C1 | client 디렉토리 8 파일 | PASS/FAIL | `ls client/ client/src/` 결과 |
| ... | ... | ... | ... |
| A1 | npm install root 무에러 | PASS/FAIL | 마지막 5줄 출력 |
| ... | ... | ... | ... |

근거는 명령 출력의 마지막 5줄 또는 file:line 인용. **PASS만 줄 세우지 말고 실제 측정 값 적기.**

---

## 위험·주의 (Planner spec §3 요약)

- **R1 design-tokens import**: 반드시 `@import '@teachermate/shared/design-tokens.css'` (정식 npm). vite alias `@shared`는 회귀.
- **R2 Tailwind v4 reset**: 모든 `*` reset/`html`/`body` 룰을 `@layer base { ... }` 안에.
- **R3 hmr:false**: vite.config.ts 필수.
- **R4 lock fresh**: 패키지 핀 변경 후 `rm -rf node_modules package-lock.json && npm install`.
- **R6 /api/health 누락 금지**: 콜드 스타트 대응.
- **R7 web component fallback OK**: `<teachermate-nav active="Architecture" />`이 service-nav.js 미등록이라 빈 컴포넌트 렌더돼도 정상. 등록은 별도 PR.
- **R8 render.yaml 차단**: 작성 시도 후 차단되면 사용자 액션으로 보고. PR에는 포함하지 말 것 (또는 보고 후 사용자가 직접 PR commit으로 추가).
- **R9 head!=base**: 반드시 main에 README만 1차 commit → `feat/scaffold` 별도 분기.

---

## 완료 트리거

PR open + 자체 보고 표 + 다음 메시지를 Planner(T1)에게 회신:

```
PR #1 Generator 완료 보고
- PR URL: https://github.com/nyuoasis-cmd/architecture/pull/1
- 자체 보고: §2.1 N/N PASS, §2.2 N/N PASS
- 의문/이슈: ...
- 다음 단계: Eval-Visual(T3) + Eval-Interaction(T4) 병렬 실행 요청
```
