# PR #5 Planner Spec — 학생 챗봇 (Claude Haiku 4.5)

> **Phase 1 (Planner) 산출물.** Generator(T2) / Eval-Visual(T3) / Eval-Interaction(T4) 공통 시작점.
> 작성: 2026-04-28 / SDD: `/home/claude/architecture/SDD-v1.md` §5.4 §6 §11.5 §11.6 §11.7 / 베이스: PR #4B 머지된 main

---

## 0. PR 정의

- **레포**: `https://github.com/nyuoasis-cmd/architecture`
- **브랜치**: `codex/pr5-chatbot` (Generator가 main에서 분기, [feedback_codex-branch-prefix-precedence.md])
- **base**: `main` (PR #1 + #4A + #4B 머지된 상태)
- **목표**: ChatPanel `disabled` 해제 → 실제 학생 챗봇 동작 (Claude Haiku 4.5 + Anthropic prompt cache 4500 tok prefix + DB 답변 캐시 + 저작권 후처리 + rate limit + Sonnet 자동 승급 트리거 인프라).
- **인증 (PR #5 시점 한정)**: PR #7 OAuth 미완료 시점이라 **익명 IP 기반**으로 챗봇 enable. `architecture_chats.chats_actor_xor` 제약 풀고 `anonymous_id` 컬럼 추가. PR #7 OAuth 후 별도 PR로 `user_id` 보강 + 제약 재강화.
- **응답 형식**: JSON 단발 (streaming SSE 사용 X — SDD §5.4.8).
- **저작권 후처리 corpus**: 책 PDF 추출본은 콘텐츠 PR #2~#11 머지 후 채워짐. **PR #5에선 corpus 인프라(인덱스 빌더, 검증 hook)만 + 빈 corpus**. 콘텐츠 PR 머지 후 별도 단계에서 `server/src/data/corpus.ts`에 normalized 텍스트 paste → 차단 활성화.
- **범위 외**:
  - 세션 모드(`/learn/:sessionId`) participant_id 기반 챗봇 → **PR #6** (서명 토큰 검증 의존, 본 PR 인프라 재사용)
  - OAuth user_id 도입 → **PR #7**
  - 콘텐츠 corpus paste → **PR #2~#11 머지 후 별도 단계**
  - A/B eval Haiku vs Sonnet 비교 — `/home/claude/architecture/ab-eval/` 스크립트 (PR #1 시점 작성됨, 본 PR과 분리 운영)

---

## 1. 워크플로우 — 4-Phase, Eval은 Codex 2 세션

| Phase | 역할 | 모델 | 터미널 | 입력 |
|-------|------|------|--------|------|
| 1 Planner | 명세·Sprint Contract·리스크 | Claude Opus (이 세션) | T1 | 본 파일 |
| 2 Generator | 구현 | Codex GPT-5 | T2 | `HANDOFF-pr5-generator.md` |
| 3 Eval-Visual | 시각·DOM 검증 | **Codex** (별 세션) | T3 | `HANDOFF-pr5-eval-visual.md` |
| 4 Eval-Interaction | 인터랙션·API·a11y·보안 검증 | **Codex** (별 세션) | T4 | `HANDOFF-pr5-eval-interaction.md` |

T3·T4는 서로 분리되고 T2와도 분리되어야 함 ([feedback_4phase-eval-codex-only.md] + [feedback_4phase-eval-not-self.md]).

---

## 2. Sprint Contract 4축

### 2.1 코드 기준 (Generator 자체 보고)

| # | 기준 | 검증 방법 |
|---|------|----------|
| C1 | `package.json` server deps에 `@anthropic-ai/sdk` 추가 (^0.32 이상). 클라이언트엔 X | grep |
| C2 | `sql/002_chat_ops.sql` 신규 — `architecture_chats` 마이그: (a) `chats_actor_xor` 제약 DROP (PR #7 후 다시 추가 예정 명시 주석), (b) 컬럼 추가 `anonymous_id text`, `model_used text`, `cached boolean default false`, `blocked_count int default 0`, `upgraded_to_sonnet boolean default false`, (c) 인덱스 `(qa_id, question_hash, created_at)` (DB 캐시 lookup 가속) | grep + sql 검토 |
| C3 | `server/src/data/corpus.ts` 신규 — `export const CORPUS_RAW: string = ''` (빈 corpus). 주석에 "콘텐츠 PR 머지 후 normalized 텍스트 paste" 명시 + paste 절차 | grep |
| C4 | `server/src/lib/copyright-index.ts` 신규 — 부팅 시 1회 빌드: `NGRAM_8_HASH_SET: Set<string>`, `SENTENCE_SET: Set<string>`, `CORPUS_NORMALIZED: string`. corpus 빈 시 모두 빈 set/문자열. 검증 함수 `checkCopyright(text: string): { blocked: boolean, reason?: 'ngram'|'substring'|'sentence' }` export. 빈 corpus 시 모두 `{ blocked: false }` 반환 | grep |
| C5 | `server/src/lib/anthropic.ts` 신규 — Anthropic SDK 클라이언트 + system block 구성 + `cache_control: { type: 'ephemeral' }` 위치 (system 마지막 + chapter context). 함수 `chatWithClaude({ qaId, chapterContext, systemPrompt, history, question, model })` → `{ answer, usage, cached }` | grep |
| C6 | `server/src/data/chapter-context.ts` 신규 — 챕터별 컨텍스트 (10챕터 placeholder). `getChapterContext(chapterId): { systemPrompt: string, chapterContext: string, tokenEstimate: number }`. **PR #5 시점**: SDD §5.4.6 system prompt 본문 + 챕터별 placeholder context (실측은 콘텐츠 PR 후 갱신 — 주석으로 명시). Haiku 4096 토큰 미달 시 fallback 표시 (warn 로그) | grep |
| C7 | `server/src/lib/chat-cache.ts` 신규 — DB 캐시 lookup/insert. `lookupCache(qaId, questionHash): Promise<{answer: string, model: string} \| null>` (TTL 7일 = `created_at > now() - interval '7 days'`). `saveChat({...})` Supabase service_role 사용 | grep |
| C8 | `server/src/lib/chat-metrics.ts` 신규 — 최근 200건 응답 윈도우 (in-memory ring buffer). 재질문 패턴 탐지("다시", "이해 안", "다른 비유로" 등). `shouldUpgradeToSonnet(): boolean` (재질문율 ≥ 25% OR 차단율 ≥ 10%). 운영자 알림은 PR 범위 외 (로그만) | grep |
| C9 | `server/src/routes/chat.ts` 신규 — `POST /api/chat` (zod: `{ qaId, question, history?: [{role, content}] }`). 흐름: (1) zod parse → (2) rate limit 검사 → (3) DB 캐시 lookup (qaId + sha256(normalize(question))) → hit이면 즉시 응답 + `cached:true` → (4) `getChapterContext` → (5) Sonnet 승급 결정 → (6) `chatWithClaude` → (7) `checkCopyright(answer)` → blocked이면 max 2회 재생성 (negative example 포함) → (8) DB 저장 (anonymous_id 또는 PR #7 후 user_id) → (9) 응답 `{ answer, cached, model, blocked_count, fallback?: 'cache_only' }` | grep |
| C10 | `server/src/routes/chat.ts` rate limit — **IP당 분당 100회**, **IP당 일당 1000회** (in-memory token bucket). 초과 시 429 + `Retry-After`. 추가로 **서버 전역 분당 1000회 세마포어** (전역 비용 보호) | grep |
| C11 | `server/src/routes/chat.ts` 월 예산 ladder hook — env `CHAT_MONTHLY_BUDGET_USD` (기본 173) + in-memory 사용량 누적. 80% 경고 로그, 120% 신규 호출 차단(DB 캐시 only 응답), 150% 챗봇 전체 OFF (요청 시 503). SDD §11.6 (운영 알림 이메일은 본 PR 범위 외) | grep |
| C12 | `server/src/index.ts` — `chatRouter` mount, 부팅 시 `buildCopyrightIndex()` 1회 호출 | grep |
| C13 | `server/src/env.ts` — 추가 env (선택): `CHAT_MONTHLY_BUDGET_USD: z.coerce.number().default(173)`. 기존 `ANTHROPIC_API_KEY` 활용 | grep |
| C14 | `client/src/components/learn/ChatPanel.tsx` 덮어쓰기 — `disabled` 해제. textarea 입력 + Enter 전송 + Send 버튼. message bubble 리스트 (user/bot). 로딩 인디케이터 (점 3개 또는 spinner). 에러 토스트/메시지. rate limit 429 시 친화적 안내 ("잠시 후 다시 시도"). | grep + render |
| C15 | `client/src/lib/chat-client.ts` 신규 — `sendChat({qaId, question, history}): Promise<ChatResponse>`. abort signal + 12s timeout. 에러 분류 (rate_limited / network / server) | grep |
| C16 | `client/src/store/learn-store.ts` 또는 ChatPanel local — message history (qaId 별 분리). qaId 변경 시 history 별도 (또는 같은 qa 안에서만 누적) | grep |
| C17 | `npm run build` 무에러, `npm run dev` 무에러 | build log |
| C18 | TypeScript strict 통과 (Anthropic SDK 타입, ChatMessage 타입) | tsc |

### 2.2 자동 검증 기준

| # | 기준 | 명령 |
|---|------|------|
| A1 | `npm install` 무에러 (`@anthropic-ai/sdk` 신규) | terminal |
| A2 | `npm run build` 무에러 | build |
| A3 | `npm run dev` → :5176 + :3003 부팅 + 부팅 로그에 "copyright index built (corpus empty)" 표시 | log |
| A4 | `curl -X POST http://localhost:3003/api/chat -H "Content-Type: application/json" -d '{"qaId":"ch06_q03","question":"프로세스가 뭐예요?"}'` → 200 + `{answer, cached:false, model:"claude-haiku-4-5-20251001"}` (실 ANTHROPIC_API_KEY 필요) | curl |
| A5 | 같은 질문 다시 호출 → `cached:true` (DB hit) | curl |
| A6 | qaId 미존재 → 404 | curl |
| A7 | question 빈 문자열 → 400 (zod) | curl |
| A8 | rate limit: 같은 IP에서 분당 101회 호출 → 101번째 429 + Retry-After (간단히 분당 5회 호출 후 100→101 임계만 코드 grep으로 갈음 OK) | curl loop / grep |
| A9 | rate limit 일당 1001회: 코드 grep으로 갈음 (in-memory 한계로 실 1000+ 호출 검증 X) | grep |
| A10 | dist/assets에 `ANTHROPIC_API_KEY` 또는 corpus 텍스트 노출 0건 | grep dist |

### 2.3 시각 기준 (Eval-Visual / Codex T3)

| # | 기준 | 측정 |
|---|------|------|
| V1 | ChatPanel `disabled` 해제 — textarea cursor:text (cursor-not-allowed 제거), placeholder "질문해보세요" 또는 동등, Send 버튼 활성 | DevTools + 스크린샷 |
| V2 | 메시지 버블 — user 우측 (배경 accent 또는 동등), bot 좌측 (배경 stone-100 또는 동등). 기존 `.bubble-bot` 클래스 재사용. 폰트 13px, 행간 1.5 | 스크린샷 |
| V3 | 로딩 인디케이터 — 응답 대기 중 점 3개 애니메이션 또는 spinner. accent 색 (`--color-accent` var() 사용, 인라인 hex 0건 [feedback_token-definition-vs-usesite.md]) | 스크린샷 + DevTools |
| V4 | 에러/rate limit — 토스트 또는 메시지 (붉은 stone 또는 red-600), 8초 자동 사라짐 또는 dismiss 버튼 | 스크린샷 |
| V5 | shared design-tokens 사용처 인라인 hex 0건 — `grep -rn "#6366f1\|#10b981" client/src/components/learn` 결과 정의 라인 외 0건 | grep |
| V6 | 모바일(375×812) ChatPanel — textarea 키보드 올라온 상태 가독성, Send 버튼 터치 타겟 ≥ 44px | 스크린샷 |
| V7 | PR #4A + #4B 시각 회귀 X — `/library/6/ch06_q03` 3컬럼 + 시연 iframe + GuidePanel 진행도 점 + 퀴즈 채점 결과 PR #4B 결과와 동일 | 비교 |

### 2.4 인터랙션·API·보안 기준 (Eval-Interaction / Codex T4)

| # | 기준 | 시나리오 |
|---|------|---------|
| I1 | `/library/6/ch06_q03` → ChatPanel textarea에 "프로세스가 뭐예요?" 입력 → Enter 또는 Send → bot 응답 표시 (≤ 12s) | type + click |
| I2 | 응답 후 같은 질문 재전송 → `cached:true`, 응답 시간 < 1s (DB cache hit) | 비교 |
| I3 | server `/api/chat` Network — 첫 호출 응답에 `model: "claude-haiku-4-5-..."`, 2번째 `cached: true` | DevTools Network |
| I4 | rate limit — 코드 grep `MIN_LIMIT === 100`, `DAY_LIMIT === 1000`, `GLOBAL_MIN_LIMIT === 1000` 확인 + 인위적 LIMIT 1로 임시 변경 후 재기동 → 분당 2회째 429 + UI에 "잠시 후 다시 시도해주세요" 메시지 (silent 200 X) | grep + curl + UI |
| I5 | zod 검증 — `{qaId:"", question:""}` 등 → 400, `{qaId:"nonexistent", ...}` → 404 | curl 3건 |
| I6 | 키보드 a11y — textarea Tab 도달 + Enter 전송 + Shift+Enter 줄바꿈 + Send 버튼 Tab 순회 + visible focus ring | tab + DOM |
| I7 | `ANTHROPIC_API_KEY` 클라이언트 노출 X — `npm run build` 후 `grep -r "sk-ant-\|ANTHROPIC_API_KEY" client/dist` → 0건 | grep dist |
| I8 | DB 저장 확인 — Supabase `architecture_chats`에 row 1건 (`anonymous_id` 채워짐, `model_used`, `cached=false`, `blocked_count=0`) | psql/Supabase 쿼리 |
| I9 | DB 캐시 lookup TTL 7일 — 동일 질문이지만 `created_at < now() - 7d`로 직접 update 후 호출 → cache miss (새 호출) | sql + curl |
| I10 | 후처리 인프라 호출 — `checkCopyright(answer)` 호출 경로 코드 검증 + 빈 corpus 시 `{blocked:false}` 반환 (실 차단 없음, 콘텐츠 머지 후 활성). 인덱스 빌드 시간 측정 (부팅 로그 < 200ms) | grep + log |
| I11 | message history — qaId A에서 대화 후 qaId B로 이동하면 history 분리 (또는 명시적 정책) | DOM |
| I12 | 12s timeout — server에서 ANTHROPIC_API_KEY 잘못된 값으로 시도 → 12s 안에 명시 에러 응답 + UI 안내 | curl + 시간 |
| I13 | PR #4A reload + sandbox 회귀 X — `/library/6/ch06_q03` → 새로고침 버튼 → iframe load 정상, sandbox=`allow-scripts` 유지 | DOM |
| I14 | PR #4B 회귀 X — 퀴즈 탭 동작, 진행도 점 색, LibraryPage "X/Y" 진도 표시 모두 PR #4B round 5 PASS 상태와 동일 | 시나리오 |
| I15 | PR 메타 — `gh pr view N` baseRefName=main, headRefName=codex/pr5-chatbot, body Test plan = §2.2 (10) + §2.3 (7) + §2.4 (15) = **32건** 체크리스트 | gh CLI |

---

## 3. 리스크 예측 (Generator가 빠질 함정)

| # | 리스크 | 출처 | 대응 |
|---|--------|------|------|
| R1 | prompt cache prefix 4500 tok 미달 시 cache 무시 → 비용 폭증 (Haiku 4096 미만 시 explicit cache_control 무효) | SDD §5.4.2 P1 | PR #5 시점 콘텐츠 미존재 → 챕터 컨텍스트 placeholder가 4096 미만일 가능성. **fallback 정책**: tokenEstimate < 4096 시 cache_control 생략 (uncached 호출), 로그에 경고. 콘텐츠 PR 후 chapter-context.ts 갱신 시 재활성. Sprint Contract C6에 명시 |
| R2 | Anthropic SDK 응답 구조 — `response.content[]` 배열, `type: 'text'` block만 추출 | Anthropic 공식 | `response.content.filter(b => b.type === 'text').map(b => b.text).join('')` |
| R3 | 후처리 corpus 빈 상태 — checkCopyright이 항상 `{blocked:false}` → 차단율 0%, Sonnet 승급 트리거 미작동 | SDD §11.7 | 본 PR은 인프라만. corpus.ts 주석에 "콘텐츠 PR 머지 후 normalized 텍스트 paste 후 활성" 명시. Sprint Contract C3에 paste 절차 |
| R4 | DB 캐시 hash 충돌 — 다른 질문이 같은 hash 생성하면 잘못된 답변 반환 | 일반 보안 | `qaId + ":" + sha256(normalize(question))` 형태 사용. normalize = trim + 공백 정규화 + 소문자. 충돌 확률 무시 가능 (sha256) |
| R5 | 익명 학생 RLS — service_role 서버 프록시는 OK이지만 `chats_actor_xor` 제약 살아있으면 INSERT 실패 | SDD §6 | sql/002에서 제약 DROP (Sprint Contract C2). PR #7 OAuth 후 `(participant_id IS NOT NULL OR user_id IS NOT NULL OR anonymous_id IS NOT NULL)` 형태로 재강화 |
| R6 | Sonnet 자동 승급 in-memory 상태 — server 재기동 시 초기화. ring buffer 200건 다시 채워질 때까지 트리거 안 됨 | 일반 | 본 PR은 in-memory OK. 재기동 자주 일어나는 환경 X (Render Starter cold start 후 안정). PR 추후 Redis 전환 |
| R7 | 챗봇 rate limit IP+UA — 모바일 NAT 다수 학생 한꺼번에 차단 | SDD §11.5 | PR #5는 IP만 (단순). 학생 1명당 분당 1회로 충분히 보수적. NAT 학생들도 분당 1회씩 분산되면 OK |
| R8 | Codex 브랜치 prefix `codex/`로 처음부터 | [feedback_codex-branch-prefix-precedence.md] | `codex/pr5-chatbot` |
| R9 | Generator push 자체 보고에 commit SHA + push 완료 명시 — 누락 시 Eval이 옛 코드 측정 | [feedback_generator-push-explicit-report.md] | 자체 보고 양식 §5에 commit SHA + `git log origin/codex/pr5-chatbot -1` 결과 포함 |
| R10 | shared design-tokens 사용처 hex 0건 — accent/success/danger 모두 var() 참조 | [feedback_token-definition-vs-usesite.md] | `--color-accent`, `--color-success`, `--color-danger` var() 만 사용. 정의 라인 hex는 그대로 |
| R11 | `ANTHROPIC_API_KEY` 클라이언트 노출 X — server-only. import.meta.env로 클라이언트에서 절대 X | SDD §11.6 | 클라이언트 코드에서 `ANTHROPIC` grep 0건. server `process.env.ANTHROPIC_API_KEY` (env.ts) 만 |
| R12 | 첫 응답 latency — Haiku cache hit ~3s, miss ~8s, Sonnet ~15s. 12s timeout 초과 시 사용자 경험 손상 | SDD §5.4 | server abort signal 12s. UI 친화적 timeout 메시지. cache prefix 빈 상태(콘텐츠 미존재)에서 latency 더 클 수 있음 → 본 PR 인프라 검증은 짧은 placeholder context로 OK |
| R13 | streaming X (JSON 단발) — fetch await 단순. SSE 처리 코드 없음 | SDD §5.4.8 | client `chat-client.ts`는 fetch + json() 단순. SSE EventSource X |
| R14 | 월 예산 ladder in-memory — server 재기동 시 누적 사용량 초기화 → 80%/120%/150% 추적 손상 | SDD §11.6 | 본 PR은 in-memory OK. 정확한 추적은 PR 추후 (DB 또는 Redis) |
| R15 | client bubble 컴포넌트 재사용 — 기존 `.bubble-bot` 클래스 / 새 `.bubble-user` 추가 시 design-policy 정합 (stone palette + Restrained Trust) | SDD §7 | bubble-user는 `--color-accent-soft` 또는 stone-200 배경. 인라인 hex X |
| R16 | qaId allow-list — 클라이언트가 임의 qaId 보내면 안 됨 | 보안 | server에서 chapterContext 조회 시 allow-list 자동 (qaId 미존재 → 404) |

---

## 4. Generator 실행 절차 (요약)

자세한 내용 `HANDOFF-pr5-generator.md`. 요약:

1. `cd /home/claude/architecture && git checkout main && git pull && git checkout -b codex/pr5-chatbot`
2. `npm install @anthropic-ai/sdk@^0.32` (server workspace)
3. sql: `sql/002_chat_ops.sql` 신규 (제약 풀고 컬럼 추가). **운영 DB 적용은 사용자 paste-ready로 마스터에 전달 후 사용자가 Supabase SQL editor에서 실행** (마스터 직접 실행 X)
4. server: `data/corpus.ts`, `lib/copyright-index.ts`, `lib/anthropic.ts`, `data/chapter-context.ts`, `lib/chat-cache.ts`, `lib/chat-metrics.ts`, `routes/chat.ts`, `index.ts` mount + index build, `env.ts` budget env (선택)
5. client: `components/learn/ChatPanel.tsx` 실제 구현, `lib/chat-client.ts`, store/local message history
6. 로컬 검증: §2.2 A1~A10 (실제 ANTHROPIC_API_KEY는 사용자 paste-ready) + §2.4 I7 (build dist 키 노출 0건)
7. `git add` (R9 — 신규 디렉토리 누락 주의) → commit → push
8. `gh pr create --base main --head codex/pr5-chatbot` (Test plan = §2.2 + §2.3 + §2.4 = 32건)
9. 자체 보고 §2.1 C1~C18 + §2.2 A1~A10 PASS/FAIL 표 + commit SHA + push 완료 명시 ([feedback_generator-push-explicit-report.md]) → Master 회신

---

## 5. 머지 게이트

| 조건 | 상태 |
|------|------|
| Generator 자체 보고 §2.1 모든 PASS + commit SHA + push 완료 | 필수 |
| Eval-Visual JSON `overall: PASS` 또는 `PASS_WITH_NOTES` (REVISE 0건) | 필수 |
| Eval-Interaction JSON `overall: PASS` (REVISE 0건, BLOCK 0건) | 필수 |
| `npm run build` 무에러, dist에 ANTHROPIC_API_KEY/corpus 노출 0건 (I7) | 필수 |
| PR #4A + #4B 시각/인터랙션 회귀 0건 (V7 + I13 + I14) | 필수 |
| 사용자 paste-ready로 ANTHROPIC_API_KEY 1회 전달 + 사용자가 Render env 갱신 + sql/002 운영 DB 실행 | 사용자 액션 (PR 머지 전 or 후 운영 검증 시) |

---

## 6. 다음 PR

- **PR #6 세션·대시보드**: 교사 세션 만들기 모달 + 6자리 코드 + QR + `/join` + 서명 토큰 (HMAC) + `/learn/:sessionId` 세션 모드. **챗봇 라우트는 본 PR 인프라 재사용** — token 검증 미들웨어만 추가하면 participant_id 기반으로 받음.
- **PR #7 OAuth**: 카카오 + DEV 로그인 → user_id 채워짐. 별도 마이그 PR로 (a) localStorage 진도 → Supabase 동기화, (b) `architecture_chats` chats_actor_xor 재강화 (`participant_id ∨ user_id ∨ anonymous_id`).
- **콘텐츠 PR #2~#11 머지 후**: `server/src/data/corpus.ts`에 책 normalized 텍스트 paste → checkCopyright 활성 → Sonnet 승급 트리거 작동.
