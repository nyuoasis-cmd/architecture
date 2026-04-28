# PR #5 Round 2 핸드오프 — 챗봇 (Haiku 4.5)

> Round 1 결과: T3 REVISE 5건(V2/V3/V4/V5/V6) + T4 REVISE 다수. 마스터 분석 결과 진짜 수정 대상은 **시각 4건(V2/V3/V4/V6) + a11y 1건(T4 #4)** = 총 5건. 나머지는 마스터 직권 PASS 또는 .env 사전조건 미충족.
>
> base commit (round 1 T2 push): `2730f63dcf0474c5eadadff2f48ee552cbc9a28d`
> PR URL: https://github.com/nyuoasis-cmd/architecture/pull/5
> head branch: `codex/pr5-chatbot`

---

## 0. 마스터 직권 결정 (round 2에서는 재검증 불필요)

### V5 (인라인 hex) — 직권 PASS
- T3가 `client/src/components/learn/QuizTab.tsx`의 `#10b981`/`#dc2626`/`#b91c1c`를 PR #5 회귀로 잡았음
- 사실: **QuizTab.tsx는 PR #5 diff에 없음** (PR #4B 파일, round 7에서 이미 T3 PASS)
- ChatPanel.tsx 새 추가 hex는 `#fff` 2건만 (universal white, shared 토큰 동의어 없음)
- 근거: [feedback_token-definition-vs-usesite.md] — 정의/사용처 grep으로 동의어 없는 hex는 정공법
- **Round 2에서 V5는 검증 항목 자체에서 제외**

### Rate limit 위치 — 직권 PASS
- 명세 §2.1 C10 / §2.4 I4 는 `routes/chat.ts`에 `MIN_LIMIT`/`DAY_LIMIT`/`GLOBAL_MIN_LIMIT`로 적었음
- T2 구현 위치: `server/src/lib/chat-service.ts`의 `USER_MINUTE_LIMIT=100`/`USER_DAILY_LIMIT=1000`/`GLOBAL_MINUTE_LIMIT=1000`
- T4가 동작은 PASS 확인 (429 + `Retry-After: 60`)
- **library 분리는 구조적 정공법.** 명세 위치 강제는 부정확 → 마스터가 명세 정정.
- Round 2 검증은 **chat-service.ts** 기준으로 진행

---

## §A. T2 Generator 핸드오프 (Codex 별 세션)

### A.1 수정 목표 (5건)

| # | 위치 | 결함 | 수정 |
|---|---|---|---|
| 1 | `client/src/components/learn/ChatPanel.tsx` user bubble | 배경 `rgb(28,25,23)` (stone-900 짙은 톤) | `var(--color-accent-soft)` 또는 stone-50/stone-100 친화 톤. shared `design-tokens.css`에 `--color-accent-soft` 정의 있는지 먼저 확인 후 사용; 없으면 인라인 `background: '#eef2ff'` 등 universal soft tone 정공법 (단 ChatPanel 1군데만, 토큰 alias 강제 X) |
| 2 | `client/src/components/learn/ChatPanel.tsx` 로딩 인디케이터 | 점 3개 컨테이너에 `aria-live`/`role` 누락 | 컨테이너 `<div>`에 `role="status" aria-live="polite" aria-label="응답을 생성 중입니다"` 3속성 추가 |
| 3 | `client/src/components/learn/ChatPanel.tsx` 에러 메시지 | 컨테이너 a11y 누락 + 색상 red 계열 아님 | (a) 컨테이너에 `role="alert" aria-live="assertive"` 2속성. (b) 색상은 shared `--color-danger`/`--color-error` 토큰 우선 확인 → 없으면 인라인 `color: '#dc2626'` + `background: '#fef2f2'` (universal danger, 동의어 없음 시 정공법) |
| 4 | `client/src/components/learn/ChatPanel.tsx` 모바일 레이아웃 | 375×400 (키보드 축소) viewport에서 textarea+전송 버튼 bottom 451.625px → 입력창 viewport 밖 | ChatPanel 컨테이너 flex 구조 재배치: `display:flex; flex-direction:column; min-height:0` + 메시지 영역 `flex:1; overflow-y:auto` + 입력 영역 `flex-shrink:0`. 부모 LearnPage iframe 영역과의 layout 결합 점검. 필수: 모바일 375×400에서 textarea bottom < 400px |
| 5 | `client/src/components/learn/ChatPanel.tsx` 키보드 a11y | textarea `outline-none` + 전용 `:focus-visible` 스타일 없음 → 헤드리스 Tab으로 도달 시 visual focus indicator 없음 | (a) `outline-none` 제거 (또는 `outline-none focus-visible:outline-2`). (b) ChatPanel.module 또는 인라인 `:focus-visible` 룰 추가: textarea + Send 버튼 모두 `outline: 2px solid var(--color-accent); outline-offset: 2px` |

### A.2 동작 보존 (회귀 X)
- ChatPanel 초기 disabled 해제, 44px 전송 버튼, Enter 전송, Shift+Enter 줄바꿈
- rate limit 동작 (429 + Retry-After), DB 캐시 분기, copyright 후처리 분기, prompt cache prefix 4500 tok
- PR #4A iframe reload + sandbox, PR #4B 퀴즈/진도

### A.3 자체 보고 의무 ([feedback_generator-push-explicit-report.md])
- round 2 commit SHA 명시
- `git push` 완료 명시 (`origin/codex/pr5-chatbot` reflect)
- `npm run build` 무에러 출력 첨부
- 5건 각각 수정 위치 (file:line) 적시
- PR body Test plan 갱신 (5건 round 2 hotfix 명시)

### A.4 절대 금지
- `routes/chat.ts` 또는 `chat-service.ts`의 rate limit 상수 위치/이름 변경 (직권 PASS 결정 — round 2 scope 아님)
- `QuizTab.tsx` 수정 (PR #5 범위 아님)
- backend 로직(chat-service / corpus / sql) 수정 (시각/a11y만)

---

## §B. T3 Eval-Visual 핸드오프 (Codex 별 세션, round 2)

### B.1 검증 항목 (4건만)
- V2 — user bubble 배경이 stone-900 짙은 톤이 아닌지, 친화적 톤(soft accent or stone-50~100)으로 변경됐는지
- V3 — 로딩 점 컨테이너에 `role="status"` + `aria-live="polite"` 적용됐는지
- V4 — 에러 메시지 컨테이너에 `role="alert"` + `aria-live="assertive"` + 색상 red 계열(인라인 `#dc2626` 또는 `--color-danger` 토큰)
- V6 — 모바일 375×400 viewport에서 textarea bottom < 400px 실측

### B.2 검증 제외 (직권)
- **V1, V5, V7는 round 1 PASS / 직권 PASS — 재검증 X**

### B.3 메타
- evaluated_commit: round 2 T2 push SHA (마스터가 안내)
- 결과 JSON: `architecture/qa-eval/pr5-eval-visual-round2.json`
- 캡처: `architecture/qa-screenshots/pr5-round2/`

---

## §C. T4 Eval-Interaction 핸드오프 (Codex 별 세션, round 2)

### C.1 검증 항목

#### 코드 수정 검증 (1건)
- I6 a11y — textarea `outline-none` 제거 / `:focus-visible` 룰 적용 확인. 헤드리스 Tab으로 textarea 도달 + visual focus indicator 확인

#### 환경 사전조건 충족 후 실 검증 (5건, round 1 deferred)
- I1 — `POST /api/chat` 정상 200 + `{answer, cached:false, model:"claude-haiku-4-5-20251001"}`
- I2 — 같은 질문 재호출 시 < 1s + `cached:true`
- I3 — Network 응답 첫 호출 model / 두번째 cached 확인
- I8 — `architecture_chats` row 저장 확인 (anonymous_id, model_used, cached, blocked_count 컬럼 채워짐)
- I9 — TTL 7일 (created_at > now() - interval '7 days' 분기 확인)

#### 회귀 재확인 (필수)
- I13 PR #4A iframe reload/sandbox
- I14 PR #4B 퀴즈/진도

### C.2 검증 제외 (round 1 PASS)
- I4 (rate limit grep) — round 1에서 동작 PASS 확인. **위치는 chat-service.ts** (직권 결정).
- I5, I7, I10, I11, I15

### C.3 사전조건 (마스터가 .env 작성 후 안내)
- ANTHROPIC_API_KEY 실 키
- SUPABASE_URL 실 URL
- SUPABASE_SERVICE_ROLE_KEY 실 키
- 운영 DB `architecture_chats` 테이블 + 5컬럼 + 2인덱스 적용 완료 (round 1에서 검증됨)

### C.4 메타
- evaluated_commit: round 2 T2 push SHA
- 결과 JSON: `architecture/qa-eval/pr5-eval-interaction-round2.json`

---

## §D. 사용자 액션 (내일 첫 액션)

### D.1 paste-ready 3 키 (마스터에 보내기)

```
ANTHROPIC_API_KEY=<여기에 실 키>
SUPABASE_URL=<여기에 실 URL, 예: https://xxxxx.supabase.co>
SUPABASE_SERVICE_ROLE_KEY=<여기에 실 service_role 키>
```

> 추가로 클라이언트용도 필요할 수 있음:
> ```
> VITE_SUPABASE_URL=<위와 동일 URL>
> VITE_SUPABASE_ANON_KEY=<여기에 실 anon 키>
> ```

마스터가 `architecture/.env`에 적용 (paste-ready 받자마자 한 번에 처리).

### D.2 진행 순서

1. 위 3~5 키 paste-ready로 마스터에 전달
2. 마스터가 `.env` 정리 + T2 round 2 프롬프트 안내
3. T2 별 Codex 세션에서 round 2 5건 수정 + push + 자체 보고
4. 마스터가 T3 round 2 + T4 round 2 동시 안내 (commit SHA 포함)
5. 두 결과 회수 → PASS면 마스터 직권 머지

---

## §E. Round 2 종결 후 다음 PR

- PR #6 세션·대시보드 (교사 세션 만들기 + 6자리 코드 + QR + `/join` + `/learn/:sessionId` 세션 모드)
- PR #7 OAuth + DEV 로그인
- PR #8 랜딩 + about + 404 + 배포

PR #5 머지 후 마스터가 PR #6 Planner 산출물 작성 시작.
