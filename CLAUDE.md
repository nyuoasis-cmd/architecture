# Architecture Academy

책 『기술노트(With 알렉)』 기반 IT 지식 학습 서비스 — `architecture.teachermate.co.kr`

## 정책 우선 준수

- [DESIGN-POLICY.md](/home/claude/shared/DESIGN-POLICY.md) — 시각
- [BUILDER-UX-POLICY.md](/home/claude/shared/BUILDER-UX-POLICY.md) — 세션 UX 흐름
- [WORKFLOW-4PHASE.md](/home/claude/shared/WORKFLOW-4PHASE.md) — UI STEP 워크플로우

**북극성**: "비전공자도 IT 전체 그림을 30분 안에 이해한다."

## 스택

- **Client**: React 19 + Vite 8 + TypeScript + Tailwind v4
- **Server**: Express 5 + TypeScript
- **AI**: **Claude Haiku 4.5** (`@anthropic-ai/sdk`) — ① 학생 챗봇 ② ✋「내 차례」 판정(`/api/vibe/my-turn`). prompt caching + DB 답변 캐시 + JSON 단발 응답(streaming X).
  🚨 **호출 통제 켜짐**(2026-08-11). 신원은 `resolveActorId` 하나만 쓴다 — 참여자 토큰=학생 한 명, 없으면 «여럿이 뭉친 통»으로 갈라 다른 한도를 준다(IP 로 학생을 세면 교실 전체가 한 명이 된다).
  한도는 전부 Render env 로 **무배포** 조정: 「내 차례」 `MYTURN_*`(학생 분당 10·하루 300·**쿨타임 0** / 공유 분당 10·하루 1,000 / 전역 분당 120·하루 4,000, 롤백 `MYTURN_GUARD_ENABLED=0`) · 챗봇 `CHAT_*` 4층.
  🚨 **「내 차례」 지출에는 이 한도 말고 돈 천장이 없다** — `CHAT_MONTHLY_BUDGET_USD` 는 챗봇 전용이라
  이 라우트를 세지 않는다(`registerUsageCost` 가 chat-service 안에만 있다). 한도를 올리는 것이 곧 상한을 올리는 일.
- **DB**: Supabase PostgreSQL (테이블 prefix `architecture_*`)
- **Auth**: 카카오 OAuth + DEV 로그인
- **Design**: Restrained Trust (stone palette)

## 구조 (계획)

```
architecture/
├── client/src/
│   ├── pages/          # Landing, Teacher, TeacherNew, TeacherSession, Join, Learn, Library, About
│   ├── components/
│   │   ├── layout/     # ServiceHeader
│   │   ├── learn/      # ChapterNavPanel · ChatPanel · ContentPanel(읽기·시연·견학·내차례·퀴즈)
│   │   └── teacher/    # SessionCard, ParticipantList
│   ├── data/           # 장별 문항·퀴즈·부가데이터(견학/사례/내 차례)
│   └── store/          # session-store, learn-store (Zustand)
├── server/src/
│   ├── index.ts        # Express
│   ├── routes.ts       # API routes
│   ├── ai.ts           # Claude chat (Haiku 4.5 + prompt caching + 후처리 §11.7)
│   └── db.ts           # Supabase
├── sql/                # 마이그레이션
├── mockups/            # 디자인 검증용 HTML
└── docs/               # 핸드오프, 메모
```

## 콘텐츠 정책

- **책 TOC·소제목·본문 모두 차용 0%** — 모든 학생 노출 콘텐츠(챕터 title / Q&A title / summary / body / 챗봇 답변)는 fresh 자가 생성. PR-0 (2026-05-04) 정책 강화. 책 『기술노트』는 영감 출처로만 footer/about 표기
- Claude가 Q&A 본문 작성 → repo 정적 저장 → 챗봇 컨텍스트로 사용 (🔑 문항 수는 **손으로 적지 않는다** — 데이터에서 센다. 2026-08-11 기준 23강 131문항)
- 출처: 푸터/about에 알렉 『기술노트』(2026) 영감 표기

## 개발

```bash
npm run dev          # client :5176 + server :3003
npm run build
```

(포트는 다른 앱과 충돌 회피)

## 개발 방법론

- 3-Phase 워크플로우 (Generator/Evaluator)
- 1 마일스톤 = 1 커밋 = 1 PR
- 4-Phase 워크플로우는 UI 핵심 STEP에서 채택 (Visual + Interaction 분리 검증)

## 현재 단계 (2026-08-11)

- **라이브** — `architecture.teachermate.co.kr`. 기본 브랜치 **`main`**(master 아님) — `main` 머지 = prod 자동배포.
- 콘텐츠: **23강 131문항** · 🚌 견학 **131/131** · ⚡ 사례 76 · ✋ 내 차례 **12강**
  🚨 **화면의 「N강」과 속 이름표(chNN)는 다르다**(2026-08-11). 실습 6강이 주제별로 섞여 들어가면서
  진열 순서가 바뀌었고, 이름표는 그대로 뒀다 — 견학·사례·퀴즈·데모·학생 진도·공유 링크가 전부
  이름표에 매달려 있기 때문. 진열 정본 = `client/src/data/chapter-order.ts`(계약이 양방향으로 지킨다).
  실습 6강 = 12강(ch18)·13강(ch19)·16강(ch20)·19강(ch21)·22강(ch22)·23강(ch23).
- 📋 **교사가 읽는 것 = 「📋 설명 노트」 하나**(문항 1개 = 노트 1개). 자리 = 학습 화면 우측 탭(교사 전용).
  현재 **64/131**(ch01~ch10) — 나머지는 순차로 들어온다. 계약 = `teacherExplainContract.test.ts`.
  🚨 교사 화면 = 학생 화면의 **상위집합**이다(§9.H-14) — 같은 화면에 탭 하나가 더 붙는 것뿐이라,
  교사 전용 탭을 미는 자리는 `ContentPanel` 의 `if (teacherPanel)` **한 곳뿐이다**(계약 learnLayoutContract ⑦).
  거기서 새면 학생이 교사 대본을 읽는다.
  🚨 **「📋 교안」(23강 164칸)은 2026-08-12 에 철거했다** — 앱이 수업 흐름을 지시하는 물건이었고,
  그건 «수업 흐름은 교사가 정한다»와 정면으로 충돌했다(jery 결정). 되살리지 말 것: `learnLayoutContract` ⑦ 이
  `ContentPanel` 에서 교안의 부활을 빨갛게 잡는다. 교안이 갖고 있던 실제 사고 사례·장간 연결·🚌 견학
  운영 요령은 노트(`realLife`·`note`·`demoTip`)로 옮겼다.
  근거 = `docs/HANDOFF-lesson-plan-teardown-2026-08-12.md`
  🚨 **«모든 문항에 노트가 있다»는 계약을 두지 않는다** — 교안 계약 ⑯ 이 그것이었고, 새 장을 만들 때마다
  CI 가 없는 문서를 요구하게 만들었다. 없는 것은 없는 채로 두고 **있는 것이 성한지만** 본다.
- 🎬 **시연작 = B형**(2026-08-12 신설). `/teacher/demo` 에서 매번 강 목록부터 고르고, 고를 때마다
  **새 시연 세션**을 만든다(기존 세션 재사용 = 지난 학생·진도 물려받기). 학습 화면 위에 시연 바가 붙고
  QR 은 **조건부로 숨기지 않는다**(미준비면 disabled). 계약 = `demoModeContract.test.ts`.
  🚨 **앱은 수업 진행 시간을 말하지 않는다**(2026-08-11 jery 확정) — `minutes`·`totalMinutes`·「N분째」를
  전면 폐기했다. 이 앱엔 「수업 시작」 기록이 없어 «몇 분째»를 정직하게 셀 수 없기 때문이다(미리 만들어 둔
  세션에서 근사가 통째로 틀렸다). 교안 계약 ④⑤ 가 지키던 것을, 교안 철거 후에는
  **`teacherExplainContract` ⑤** 가 노트 쪽에서 승계한다.
- 서버 테스트 128개(`cd server && npm test`). CI = `l1-fast.yml`, `main` 보호(required check `fast`).
- 실행 런북 = `docs/RUNBOOK-polish-base-chapters.md`
  (§0 «상태 재확인»을 착수 전에 직접 돌릴 것 — 이 문서의 숫자도 적힌 순간의 관측이다.)
