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
- **AI**: **Claude Haiku 4.5** (`@anthropic-ai/sdk`) — 학생 챗봇 + Anthropic prompt caching (4500 tok prefix, 5분 TTL 기본 / 1h 옵션) + DB 답변 캐시 + JSON 단발 응답 (streaming X). SDD §5.4 참조
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
│   ├── content/        # 64 Q&A Markdown (정적)
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
- Claude가 64 Q&A 본문 작성 → repo 정적 저장 → 챗봇 컨텍스트로 사용
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

## 현재 단계

- SDD-v1 작성 완료 (`SDD-v1.md`)
- 학생 학습 화면 목업 (`mockups/student-learn.html`)
- 사용자 확인 대기
