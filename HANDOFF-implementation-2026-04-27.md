# Architecture Academy — 구현 진입점 핸드오프 (2026-04-27)

> **다음 세션 첫 액션**: 이 파일 끝까지 읽고 → §"진입 즉시 액션" 따라 진행
> 작성: 2026-04-27 (SDD-v1.4 + preflight PASS + A/B eval 설계 완료 후)

---

## TL;DR (한 줄)

책 『기술노트(With 알렉)』 기반 IT 입문 학습 서비스 (`architecture.teachermate.co.kr`). ai-app-builder의 BuilderPage 3컬럼 + PreviewPanel 자리에 사전 작성 시연 HTML iframe. SDD-v1.4 / preflight 0 FAIL / A/B eval 설계 완료. **다음은 사용자 액션 4건 → PR #1 스캐폴드.**

---

## 진입 즉시 액션

새 세션 진입 시 마스터가 할 것:

1. `/home/claude/architecture/SDD-v1.md` (§14 다음 단계 부분만) + 본 파일 + `/home/claude/architecture/preflight-v1.4-report.md` 종합 판정만 빠르게 확인
2. **사용자에게 4건 진행 상태 질문**:
   - 알렉 작가 사전 통지 회신 받았나?
   - Anthropic API 키 발급했나?
   - GitHub teachermate org에 `architecture` 신규 레포 만들 권한 있나?
   - UptimeRobot 계정 있나? (배포 후 등록용, 지금은 OK 확인만)
3. 답변에 따라 분기:
   - **A/B eval 실행 가능** (API 키 OK) → `ab-eval/README.md` 절차 안내
   - **PR #1 시작 가능** (GitHub 권한 OK) → 아래 §PR #1 작업 범위 따라 진행
   - **알렉 통지 미회신** → 콘텐츠 PR #2~#11 머지 게이트 유지, 인프라 PR(#1, #4A, #4B, #5, #6, #7, #8)만 진행

---

## 현재 상태 (단계별)

| 단계 | 상태 | 산출물 |
|------|------|--------|
| SDD-v1 (초안) | ✅ | `/SDD-v1.md` (이 파일) |
| Codex 1차 검토 (REVISE 21) | ✅ | v1.1로 반영 |
| AI 공급자 Gemini → Claude 결정 | ✅ | v1.2 |
| Codex 2차 검토 (REVISE 16, K1 캐시 결함 등) | ✅ | v1.3로 반영 |
| Codex 3차 검토 (REVISE 9, 토큰 실측·블라인드 등) | ✅ | v1.4로 반영 |
| 학생 학습 화면 목업 v3 (3컬럼 + phone-frame + 시연 launcher 4 + 퀴즈 탭) | ✅ | `/mockups/student-learn.html` |
| Preflight (3 Agent 병렬, 17 PASS / 3 WARN / 0 FAIL) | ✅ | `/preflight-v1.4-report.md` |
| A/B eval 설계 (20문항 + 스크립트 + rubric) | ✅ | `/ab-eval/` 4 파일 |
| **사용자 액션 4건** | ⏭ | (아래 체크리스트) |
| **PR #1 스캐폴드** | ⏭ | GitHub 레포 + 프로젝트 부트 |
| A/B eval 실행 (운영자 + 비전공자 2~3 블라인드) | ⏭ | results 마크다운 + 모델 결정 |
| PR #2~#11 콘텐츠 + #4A·#4B·#5·#6·#7·#8 인프라 | ⏭ | (SDD §9 분할 표 참조) |

---

## 핵심 파일 (절대 경로)

| 파일 | 무엇 |
|------|------|
| `/home/claude/architecture/SDD-v1.md` | **단일 진입점 SDD (v1.4)**. §14 다음 단계 표가 가장 중요 |
| `/home/claude/architecture/CLAUDE.md` | 프로젝트 메타. AI = Claude Haiku 4.5 (이미 동기화) |
| `/home/claude/architecture/mockups/student-learn.html` | UI 합의 목업 v3 |
| `/home/claude/architecture/preflight-v1.4-report.md` | preflight 결과 + WARN 3건 처리 가이드 |
| `/home/claude/architecture/ab-eval/README.md` | A/B eval 실행 절차 (사용자 + 비전공자 2~3) |
| `/home/claude/architecture/ab-eval/run-eval.mjs` | Haiku vs Sonnet 호출, 블라인드 라벨 |
| `/home/claude/architecture/ab-eval/questions.md` | 20문항 (5군 × 4) |
| `/home/claude/architecture/ab-eval/rubric.md` | 평가 기준 + 통과 기준 5개 |
| `/home/claude/architecture/HANDOFF-codex-SDD-v1-review.md` | Codex 검토 프롬프트 (3차 검토용 v1.3 → v1.4 변경분 검증) |

---

## 사용자 액션 4건 (마지막에 처리 — 사용자 명시 요청)

```markdown
- [ ] 1. **알렉 작가 사전 통지** — 책 활용 동의·출처 표기 협의 (콘텐츠 PR #2~#11 머지 게이트)
       - 연락처: hitouchsoft@gmail.com (책 프롤로그)
       - 통지 내용: 도메인 architecture.teachermate.co.kr / 본문 0% 인용 / 목차 차용 / 시연 자체 작성 / 출처 표기
- [ ] 2. **Anthropic API 키 발급** — https://console.anthropic.com/
       - A/B eval 실행 (~$0.10), 그 후 챗봇 운영
       - 키는 .env에만 저장, Git 커밋 X
- [ ] 3. **GitHub teachermate org에 `architecture` 신규 레포 생성 권한 확인**
       - 정책: 서브도메인 = 독립 GitHub 레포 (마스터 CLAUDE.md)
       - 레포명 후보: `architecture` 또는 `architecture-academy`
- [ ] 4. **UptimeRobot 계정 확보** — 배포 후 5분 핑 등록 (school-archive 패턴, cold start 대응)
       - URL: https://architecture.teachermate.co.kr/api/health (PR #1에서 추가)
```

---

## PR #1 작업 범위 (사용자 액션 후)

### 목표
프로젝트 스캐폴드 + ServiceHeader + Render 배포 베이스. 콘텐츠·챗봇·세션은 후속 PR.

### 디렉토리 구조 (생성)
```
architecture/
├── client/
│   ├── src/
│   │   ├── components/layout/
│   │   │   └── ServiceHeader.tsx
│   │   ├── pages/
│   │   │   └── LandingPage.tsx          # 임시 (PR #8에서 본 랜딩)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                     # @import shared/design-tokens.css + Tailwind
│   ├── index.html                        # title="Architecture"
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── postcss.config.js                 # @tailwindcss/postcss
├── server/
│   ├── src/
│   │   ├── index.ts                      # Express + /api/health + static serving
│   │   └── env.ts                        # 환경변수 검증 (zod)
│   ├── package.json
│   └── tsconfig.json
├── sql/
│   └── 001_init.sql                      # SDD §6 4테이블 + RLS + 인덱스
├── .env.example
├── .gitignore                            # node_modules, dist, .env
├── render.yaml                           # healthCheckPath: /api/health
├── package.json                          # workspaces 또는 root scripts
└── README.md
```

### 패키지 버전 (Preflight WARN 1·2 처리)
```json
// client/package.json
{
  "@anthropic-ai/sdk": "^0.91.1",       // 운영 0.90 → 최신
  "@supabase/supabase-js": "^2.104.1",  // 41버전 drift 해소 (stable 승격 후)
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "qrcode.react": "^4.2.0",
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1"
}
// devDependencies: vite ^8.0.1, tailwindcss ^4.2.2, @tailwindcss/vite ^4.2.2,
//   @tailwindcss/postcss ^4.2.2, typescript ^5.9.3
```

### `/api/health` (Preflight WARN 3 처리)
```ts
// server/src/index.ts
app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));
```

### render.yaml
```yaml
services:
  - type: web
    name: architecture
    runtime: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: ANTHROPIC_API_KEY
        sync: false  # secret
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: KAKAO_OAUTH_REDIRECT_URI
        sync: false
      - key: HMAC_SECRET
        sync: false
```

### .env.example
```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
KAKAO_OAUTH_REDIRECT_URI=https://architecture.teachermate.co.kr/auth/callback
HMAC_SECRET=  # openssl rand -hex 32 로 생성
PORT=3003
```

### ServiceHeader (임시 명칭 `Architecture`)
- 로고: 네이비#1B2A4A + 민트#7EC8B5 CSS 바 2개 + "teachermate" + 구분자 + "Architecture"
- 우측: 카카오 로그인 버튼 (PR #7에서 동작) / DEV 로그인 링크
- shared/DESIGN-POLICY 정합

### 작업 명령 (참고)
```bash
cd /home/claude/architecture
git init
git remote add origin git@github.com:teachermate/architecture.git  # 사용자가 만든 레포
# ... 파일 작성 ...
git add .
git commit -m "feat: project scaffold (PR #1)"
git push -u origin main
gh pr create --title "PR #1: 프로젝트 스캐폴드" --body "..."
```

### 완료 보고 형식 (3-Phase 워크플로우)
| # | 완료 기준 | 결과 | 근거 |
|---|----------|------|------|
| 1 | `npm run dev` 양쪽 부팅 | PASS/FAIL | 포트 :5176 client + :3003 server |
| 2 | `/api/health` 200 응답 | PASS/FAIL | curl 결과 |
| 3 | ServiceHeader 렌더 + Tailwind v4 | PASS/FAIL | 스크린샷 |
| 4 | render.yaml lint | PASS/FAIL | render.com validate |
| 5 | architecture/CLAUDE.md AI 행 일치 | PASS | 이미 v1.4에 동기화 |

---

## 학습 자산 (이번 세션에서 추출, 향후 프로젝트에 일반화 가능)

이번 세션의 수렴 과정에서 얻은 것 — 마스터 메모리 후보:

1. **Anthropic prompt caching 최소 토큰**: Haiku 4.5 = 4,096 / Sonnet 4.6 = 2,048 (공식). 미달 시 캐시 자동 비활성. 새 프로젝트 캐시 설계 시 prefix를 모델별로 검증 필수.
2. **Codex N차 검토 점진 수렴 패턴**: SDD → 검토 → REVISE 반영 → 갱신 SDD → 다음 검토 (변경분 한정). 3차까지 가니 거의 결함 안 남음. 4차 이상은 한계 효용 낮음 → preflight로 전환.
3. **Preflight Agent FAIL 정정 사례**: Agent 2가 "코드 미존재"를 FAIL로 잡았으나 preflight는 "구현 가능성"이지 "이미 있는지"가 아님. 마스터가 SDD §X.X 명세 충분성 + Agent 자신의 분석으로 정정 PASS.
4. **A/B eval 블라인드 프로토콜**: 모델명 숨김 + A/B 위치 매 문항 랜덤 + rubric 2축 + 평가자 분리 (운영자=정답성 / 비전공자=이해도·비유). LLM 모델 선택 의사결정의 표준 패턴으로 일반화 가능.
5. **사용자가 "마스터 추천 반영 안 함"이라고 답할 때**: 보류로 처리하고 임시 표기 1개 고정 (Codex A3 지적). 명칭 같은 후순위 결정은 SDD에서 변경 지점 3곳만 명시하면 PR 진입에 지장 없음.

→ 새 세션에서 마스터가 위 5개 중 일반화 가치 있는 것을 master memory에 feedback_*로 추출하면 좋음.

---

## 위험·주의 (다음 세션이 빠지기 쉬운 함정)

- **셀프 평가 금지** ([feedback_4phase-eval-not-self.md]): 마스터(Claude)가 자기 코드를 grep으로 PASS 보고하면 자격 없음. 4-Phase 워크플로우는 UI STEP 한정이지만, PR #1 같은 인프라도 Codex 별도 세션에 코드 리뷰 한 번 받기 권장.
- **다른 터미널 작업 격리** ([feedback_other-terminal-work-isolation.md]): 사용자가 "다른 터미널에서 처리" 명시한 이슈는 본 세션 의사결정에서 제외.
- **자격 증명 paste-ready** ([feedback_credentials-paste-ready.md]): API 키·env 등록 요청 시 대시보드 클릭 절차 X, `.env.example`에서 직접 읽어 `Key=Value` 코드 블록으로.
- **마스터 정책 토큰 절약** (CLAUDE.md TOKEN-POLICY): 1 마일스톤 = 1 커밋 = 1 PR. 서브에이전트는 단발 호출만, 기본 Haiku.
- **알렉 통지 게이트**: 콘텐츠 PR #2~#11 어떤 것도 통지 회신 또는 사용자 명시 승인 전 머지 X. 인프라 PR은 무관.

---

## 관련 핸드오프

- (마스터 memory) `architecture-handoff-2026-04-27.md` — 본 파일의 짧은 인덱스
- (마스터 memory) `feedback_4phase-eval-not-self.md` — 검증자 분리 정책
- (마스터 memory) `feedback_credentials-paste-ready.md` — env 등록 방식
- (참조 프로젝트) `/home/claude/ai-app-builder/CLAUDE.md` — BuilderPage 3컬럼 패턴 본가
- (참조 프로젝트) `/home/claude/youthschool/` — Supabase 카카오 OAuth 패턴

---

## 변경 이력 (이 세션)

- v1: 초안 (10 PR)
- v1.1: Codex 1차 REVISE 21건 (라우팅/RLS/시연 정책/PR 분할)
- v1.2: AI Gemini → Claude
- v1.3: K1 캐시 결함 수정 (4500 tok prefix), 비용 표 3단, JSON 단발, 후처리 알고리즘
- v1.4: 토큰 실측 절차, 작은 챕터 fallback, 1h vs 5m break-even, Sonnet 학생 단위 분배, 인덱스 사전 빌드, A/B eval 블라인드 프로토콜, 층화 표본, 예산 ladder, preflight 순서 변경
