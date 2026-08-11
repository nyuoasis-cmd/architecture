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
  한도는 전부 Render env 로 **무배포** 조정: 「내 차례」 `MYTURN_*`(학생 하루 12·쿨타임 5분 / 공유 분당 10·하루 200 / 전역 분당 60·하루 500, 롤백 `MYTURN_GUARD_ENABLED=0`) · 챗봇 `CHAT_*` 4층.
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
│   │   ├── learn/      # ContentPanel, ChatTab, QuizTab
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
- Claude가 Q&A 본문 작성 → repo 정적 저장 → 챗봇 컨텍스트로 사용 (🔑 문항 수는 **손으로 적지 않는다** — 데이터에서 센다. 2026-08-11 기준 17장 107문항)
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
- 콘텐츠: 17장 107문항 · 🚌 견학 **107/107** · ⚡ 사례 70 · ✋ 내 차례 6(12·13·14·15·16·17장)
- 📋 **교안 17/17장 완료**(1장=1차시). 교사 세션 화면의 «이 차시 진행» 패널.
  🚨 **교안은 시간을 말하지 않는다**(2026-08-11 jery 확정) — 칸별 `minutes`·`totalMinutes`·화면의 「N분째」를
  전면 폐기했다. 이 앱엔 「수업 시작」 기록이 없어 «몇 분째»를 정직하게 셀 수 없었기 때문이다(미리 만들어 둔
  세션에서 근사가 통째로 틀렸다). 「지금 이 칸」은 **교사가 눌러서** 정한다. 계약 ④⑤ 가 되살아남을 막는다.
  데이터 = `client/src/data/lesson-plan-chNN.ts` · 등록부 = `lesson-plans.ts`(파생, 별도 선언 없음)
  🚨 **장을 새로 만들면 교안도 같이 만들어야 배포된다**(계약 ⑯). 그리고 교안의 🚌 견학 칸은 tour 가
  있는 문항만, ✋「내 차례」 칸은 myTurn 이 있는 문항만 가리킬 수 있다(⑫·⑬) — 교안이 없는 것을
  있다고 적으면 교사가 수업 중에 헛짚는다.
- 서버 테스트 117개(`cd server && npm test`). CI = `l1-fast.yml`, `main` 보호(required check `fast`).
- 실행 런북 = `docs/RUNBOOK-polish-base-chapters.md`
  (§0 «상태 재확인»을 착수 전에 직접 돌릴 것 — 이 문서의 숫자도 적힌 순간의 관측이다.)
