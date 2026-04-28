# Architecture Academy

책 『기술노트(With 알렉)』 기반 IT 입문 학습 서비스 — `architecture.teachermate.co.kr`

**북극성**: 비전공자도 IT 전체 그림을 30분 안에 이해한다.

## 스택

- Client: React 19 + Vite 8 + TypeScript + Tailwind v4
- Server: Express 5 + TypeScript
- AI: Claude Haiku 4.5 (`@anthropic-ai/sdk`) + Anthropic prompt caching
- DB: Supabase PostgreSQL (테이블 prefix `architecture_*`)
- Auth: 카카오 OAuth + DEV 로그인 + HMAC 서명 학생 토큰

## 개발

```bash
npm install
cp .env.example .env  # 값 채우기
npm run dev   # client :5176 + server :3003
```

빌드:
```bash
npm run build
npm start
```

## 디렉토리

```
architecture/
├── client/   # React 19 + Vite 8
├── server/   # Express 5 + TS
├── sql/      # 마이그레이션
├── mockups/  # 디자인 검증용 HTML
└── docs/     # 핸드오프, 메모
```

## 정책

- [DESIGN-POLICY.md](https://github.com/nyuoasis-cmd/teachermate-shared) — 시각
- [BUILDER-UX-POLICY.md](https://github.com/nyuoasis-cmd/teachermate-shared) — 세션 UX 흐름
- [WORKFLOW-4PHASE.md](https://github.com/nyuoasis-cmd/teachermate-shared) — UI STEP 워크플로우
- 콘텐츠: 책 본문 직접 인용 0%, 목차·질문 제목만 차용
- 출처: 푸터/about에 알렉 『기술노트』(2026) 영감 표기

## 개발 방법론

- 3-Phase 워크플로우 (Generator/Evaluator)
- 1 마일스톤 = 1 커밋 = 1 PR
- UI 핵심 STEP은 4-Phase (Visual/Interaction 분리 검증)
