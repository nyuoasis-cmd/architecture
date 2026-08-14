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
- **AI**: **Claude Haiku 4.5** (`@anthropic-ai/sdk`) — 1) 학생 챗봇 2) ✋「내 차례」 판정(`/api/vibe/my-turn`). prompt caching + DB 답변 캐시 + JSON 단발 응답(streaming X).
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
  현재 **131/131**(ch01~ch23) — 전체 문항에 노트가 있다. 계약 = `teacherExplainContract.test.ts`.
  🚨 교사 화면 = 학생 화면의 **상위집합**이다(§9.H-14) — 같은 화면에 탭 하나가 더 붙는 것뿐이라,
  교사 전용 탭을 미는 자리는 `ContentPanel` 의 `if (teacherPanel)` **한 곳뿐이다**(계약 learnLayoutContract ⑦).
  거기서 새면 학생이 교사 대본을 읽는다.
  🚨 **「📋 교안」(23강 164칸)은 2026-08-12 에 철거했다** — 앱이 수업 흐름을 지시하는 물건이었고,
  그건 «수업 흐름은 교사가 정한다»와 정면으로 충돌했다(jery 결정). 되살리지 말 것: `learnLayoutContract` 7) 이
  `ContentPanel` 에서 교안의 부활을 빨갛게 잡는다. 교안이 갖고 있던 실제 사고 사례·장간 연결·🚌 견학
  운영 요령은 노트(`realLife`·`note`·`demoTip`)로 옮겼다.
  근거 = `docs/HANDOFF-lesson-plan-teardown-2026-08-12.md`
  🚨 **«모든 문항에 노트가 있다»는 계약을 두지 않는다** — 교안 계약 ⑯ 이 그것이었고, 새 장을 만들 때마다
  CI 가 없는 문서를 요구하게 만들었다. 없는 것은 없는 채로 두고 **있는 것이 성한지만** 본다.
- 🎬 **시연작 = 「학생 화면 미리 보기」 그 자체다. 따로 만들 것이 없다**(2026-08-14 철거·확정).
  수업 현황 상세 → 「👀 학생 화면 미리 보기」 → `/library?sessionId=` → `/learn/:sessionId?qa=…&role=teacher`.
  교사는 학생이 보는 화면을 그대로 밟고(§9.H-14 상위집합), 그 수업이 담은 강·문항을 **학생과 똑같이** 오간다.
  참여 QR 은 수업 상세에 이미 있고, 학생은 그 수업 코드로 들어온다 — **시연 전용 QR 도 코드도 없다.**
  🚨 **밖에 또 만들지 말 것.** 2026-08-12 에 `/teacher/demo`(교사 대시보드 → 새 시연 세션 생성 + 시연 바)를
  「B형 신설」로 지었다가 2026-08-14 에 통째로 철거했다. 같은 일을 하는 입구가 **수업 안과 밖에 둘** 생겼고,
  밖의 것은 누를 때마다 참여 코드가 붙은 새 방을 만들어 수업 목록에 쌓았다(닫는 버튼을 안 누르면 영구 잔존).
  게다가 `chapterIds:[고른 강 하나]` 라 **시연 중에 다른 강으로 갈 수 없었다** — 학생은 갈 수 있는데.
  🔑 진원 = `shared/demo-screen-qr-inventory.md` 가 architecture 를 「C형 → B형 신설 필요」로 **오분류**한 것.
  이미 안에 B형이 있었다. 인벤토리는 2026-08-14 정정했다.
  🚨 시연 바의 「시연 끝내기」는 `endSession()` 을 불렀다 — 입구가 수업 안으로 들어오는 순간
  **진행 중인 수업을 종료시키는 버튼**이 된다. 되살리지 말 것.
  철거분: `TeacherDemoPage.tsx` · `/teacher/demo` 라우트 · `DemoBar` · `demo=1` 파라미터 · `demoModeContract.test.ts`.
  🚨 **앱은 수업 진행 시간을 말하지 않는다**(2026-08-11 jery 확정) — `minutes`·`totalMinutes`·「N분째」를
  전면 폐기했다. 이 앱엔 「수업 시작」 기록이 없어 «몇 분째»를 정직하게 셀 수 없기 때문이다(미리 만들어 둔
  세션에서 근사가 통째로 틀렸다). 교안 계약 ④⑤ 가 지키던 것을, 교안 철거 후에는
  **`teacherExplainContract` ⑤** 가 노트 쪽에서 승계한다.
- 서버 테스트 157개(`cd server && npm test`). CI = `l1-fast.yml`, `main` 보호(required check `fast`).
- 🧑‍🏫 **교사 화면 둘은 BUILDER-UX-POLICY §4·§4-A 정본을 따른다**(2026-08-14 정합화).
  「내 수업」 목록 = 현황 미니 대시보드(코드 뱃지 · 상태 pill · 통계 3셀 · 활동 피드 · 카드 전체 클릭),
  「수업 현황」 상세 = 900px · 22px 제목 + 같은 상태/코드 뱃지 · 통계 3열 · 표준 학생 행.
  🚨 **되돌리지 말 것 셋**: 1) 화면 문구의 「세션」 2) 확인 없는 종료·삭제 3) 진행 중 카드의 삭제 버튼.
  지키는 계약 = `sessionWordingContract`(주석 걷어낸 화면 문구) · `sessionDetailContract`(종료가 모달 뒤에서만) ·
  `sessionListContract`(구조 + 상대 시간) · `sessionActivityContract`(카드 숫자가 무엇을 세는가).
  🚨 통계 가운데 칸은 「**열어 본** 문항」이다 — 진도 행은 문항을 «여는 순간» 생긴다. 「읽은」으로 적으면
  교사가 이해도까지 봤다고 오해한다. 근거 = `docs/HANDOFF-teacher-screens-2026-08-14.md`
- 실행 런북 = `docs/RUNBOOK-polish-base-chapters.md`
  (§0 «상태 재확인»을 착수 전에 직접 돌릴 것 — 이 문서의 숫자도 적힌 순간의 관측이다.)
