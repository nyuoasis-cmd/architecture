# PR #5 Eval-Interaction (T4) 핸드오프 — Codex (별 세션)

> 별도 터미널·별도 세션. 모델: **Codex GPT-5**. Generator(T2) 세션 및 T3 세션과 분리.

---

## 0. 컨텍스트

읽기:
1. `/home/claude/architecture/HANDOFF-pr5-planner-spec.md` §2.4 I1~I15 — **검증 기준**
2. `/home/claude/architecture/SDD-v1.md` §5.4 §11.5 §11.6 §11.7
3. `/home/claude/architecture/sql/002_chat_ops.sql` (PR diff) — 마이그 검토 (제약 DROP, anonymous_id 컬럼 추가)
4. PR diff

PR URL은 Master 안내.

ANTHROPIC_API_KEY 실 키가 `.env`에 있어야 실 응답 검증 가능. 없으면 마스터에 paste-ready 요청.

---

## 1. 역할

**인터랙션·API·a11y·보안 회귀 검증자.**
- ChatPanel 입력·전송·응답·로딩·에러 흐름
- server `/api/chat` rate limit·zod 검증·DB 캐시·후처리 인덱스·Sonnet 승급·예산 ladder
- DB 저장 정합 (anonymous_id, model_used, cached, blocked_count)
- 키보드 a11y
- ANTHROPIC_API_KEY 클라이언트 노출 X (**CRITICAL**)
- PR #4A reload + sandbox 회귀 + PR #4B 퀴즈/진도 회귀

시각·디자인은 평가 X (T3 영역).

**적대적 독립 검증.** 코드 grep이 아니라 실제 동작 시뮬레이션 + curl + Puppeteer + Supabase 쿼리.

---

## 2. 절차

### 2.1 환경
```bash
cd /home/claude/architecture
git fetch origin && git checkout codex/pr5-chatbot
npm install
# .env에 ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HMAC_SECRET 필요
# sql/002_chat_ops.sql 운영 DB 적용 여부 확인 (마스터가 안내)
npm run dev
```

부팅 로그에 다음 두 줄 표시 확인:
```
[chat] copyright index built — corpus=0ch, ngrams=0, sentences=0, Xms
[chat] corpus empty — paste server/src/data/corpus.ts after content PRs merged
```

### 2.2 I1~I15 측정

#### I1 — 첫 채팅 흐름
- Puppeteer: `/library/6/ch06_q03` → ChatPanel textarea에 "프로세스가 뭐예요?" 입력 → Enter
- user bubble 즉시 표시 → 로딩 인디케이터 → 응답 도착 (≤ 12s)
- bot bubble 텍스트 1건 추가
- 측정: `page.type` + `page.keyboard.press('Enter')` + `page.waitForSelector('.bubble-bot:nth-of-type(2)')`

#### I2 — DB 캐시 hit
- I1 직후 동일 질문 재전송 → 응답 시간 < 1.5s + Network `/api/chat` 응답 body에 `cached: true`
- 측정: `page.on('response')` body 파싱 + 응답 시간 비교

#### I3 — 응답 메타 검증
- I1 응답 body: `{ answer: string, cached: false, model: "claude-haiku-4-5-20251001", blocked_count: 0 }`
- I2 응답 body: `{ ..., cached: true }`
- 측정: Network body capture

#### I4 — IP rate limit (분당 100회 / 일당 1000회 / 전역 분당 1000회)
- 코드 grep로 임계치 확인: `server/src/routes/chat.ts`에 `MIN_LIMIT = 100`, `DAY_LIMIT = 1000`, `GLOBAL_MIN_LIMIT = 1000`
- 실 임계 검증은 비용 부담 (실 ANTHROPIC 호출 100+회) → **인위적 검증**: routes/chat.ts에서 임시로 MIN_LIMIT을 1로 바꾸고 재기동 → 분당 2회 호출 → 2번째 429 + `Retry-After` 헤더 + UI 메시지 → 검증 후 원복
- 또는 Puppeteer/curl loop로 분당 105회 호출해 105번째 429 확인 (실 키 + 비용 OK 시)
- 측정: grep + 인위적 LIMIT 변경 + curl + UI

```bash
# 인위적 검증 (LIMIT=1로 임시 변경 후)
curl -X POST http://localhost:3003/api/chat -H "Content-Type: application/json" -d '{"qaId":"ch06_q03","question":"첫 질문"}'
curl -X POST http://localhost:3003/api/chat -H "Content-Type: application/json" -d '{"qaId":"ch06_q03","question":"둘째 질문 다른 내용"}' -i
# 둘째 응답: HTTP/1.1 429 + Retry-After: <초>
```

#### I5 — zod 검증
- `curl -d '{"qaId":"","question":""}'` → 400
- `curl -d '{"qaId":"nonexistent","question":"테스트"}'` → 404
- `curl -d '{"qaId":"ch06_q03","question":""}'` → 400
- `curl -d '{}'` → 400
- 측정: curl 4건

#### I6 — 키보드 a11y
- textarea Tab 도달 + Enter 전송 + Shift+Enter 줄바꿈 + Send 버튼 Tab 순회
- visible focus ring (`:focus-visible` outline 또는 ring)
- 측정: `page.keyboard.press('Tab')` 반복 + `document.activeElement.tagName` 추적 + outline 측정

#### I7 — ANTHROPIC_API_KEY 클라이언트 노출 X (**CRITICAL**)
- `npm run build` → `client/dist/assets/*.js` 생성
- `grep -r "sk-ant-\|ANTHROPIC_API_KEY" client/dist` → 0건
- corpus.ts 텍스트도 dist에 0건 (corpus는 server-only)
- `grep -r "CORPUS_RAW" client/dist` → 0건
- 측정: build + grep

이 항목 FAIL 시 **CRITICAL** — 키 노출은 비용 폭주 + 보안 사고

#### I8 — DB 저장 정합
- I1 호출 후 Supabase `architecture_chats` 쿼리 (또는 마스터가 service_role psql 안내):
  ```sql
  SELECT qa_id, question_hash, anonymous_id, model_used, cached, blocked_count, upgraded_to_sonnet, created_at
  FROM architecture_chats
  ORDER BY created_at DESC LIMIT 1;
  ```
- 검증: `qa_id='ch06_q03'`, `anonymous_id` 채워짐 (16자리 hex), `model_used='claude-haiku-4-5-20251001'`, `cached=false`, `blocked_count=0`
- I2 호출은 DB INSERT가 발생 안 함 (캐시 hit이라 lookupCache만, saveChat 미호출) — row 개수 변화 없음
- 측정: SQL 쿼리 + 비교

#### I9 — DB 캐시 TTL 7일
- I1 row의 `created_at`을 `now() - interval '8 days'`로 직접 update:
  ```sql
  UPDATE architecture_chats SET created_at = now() - interval '8 days' WHERE id='<id>';
  ```
- 동일 질문 재호출 → cache miss → 새 row 생성 (`cached=false`, 신규 `created_at`)
- TTL 7일 작동 확인
- 측정: SQL update + curl + SQL select

#### I10 — 후처리 인프라
- 부팅 로그에 `corpus empty — paste server/src/data/corpus.ts after content PRs merged` 표시
- 코드 grep: `server/src/lib/copyright-index.ts`에 `NGRAM_8_HASH_SET`, `SENTENCE_SET`, `CORPUS_NORMALIZED`, `checkCopyright`, `buildCopyrightIndex` 모두 export
- corpus 빈 상태에서 `checkCopyright('아무 답변')` → `{blocked:false}` (manual test 또는 `routes/chat.ts` 흐름이 항상 첫 호출에서 통과)
- 인덱스 빌드 시간 < 200ms (부팅 로그)
- 측정: grep + log

#### I11 — message history 분리
- qaId A에서 채팅 후 qaId B로 이동 → ChatPanel useEffect 의존 [qaId]에서 `setMessages([])` 호출 → 빈 상태
- A로 다시 돌아가면 빈 상태 (현재 PR #5는 in-memory이라 reload 시 history 손실 OK — 본 PR 범위)
- 측정: 라우트 이동 + DOM count

#### I12 — timeout / upstream error
- 잘못된 ANTHROPIC_API_KEY로 시도 (또는 mock으로 강제) → 12s 안에 502 또는 504 + UI 친화 메시지
- 측정: env 변경 + 호출 시간 + 에러 메시지

#### I13 — PR #4A reload + sandbox 회귀 X
- `/library/6/ch06_q03` → 새로고침 버튼 → iframe load 이벤트 발생 (PR #4A round 4 PASS 패턴 유지)
- iframe sandbox=`allow-scripts` 유지 (allow-same-origin 추가 X)
- 측정: DOM + iframe.getAttribute('sandbox')

#### I14 — PR #4B 회귀 X
- 퀴즈 탭 채점 동작 (PR #4B Sprint Contract C7~C9 흐름 유지)
- GuidePanel 진행도 점 색 (완료 green ✓ / 현재 accent / 미완료 stone)
- LibraryPage 챕터 카드 "X/Y" 진도 표시
- localStorage `architecture-progress-v1` 키 정상 동작
- 측정: 시나리오 + DOM

#### I15 — PR 메타
- `gh pr view N --json baseRefName,headRefName,body`
- baseRefName: `main`, headRefName: `codex/pr5-chatbot`
- body Test plan = §2.2 (10) + §2.3 (7) + §2.4 (15) = **32건** 체크리스트
- 측정: gh CLI + 카운트

---

## 3. PR #4A + #4B 회귀 빠른 확인 (추가)

PR #5가 ChatPanel 외 영향 미치는 곳:
- `server/src/index.ts` — chatRouter mount + buildCopyrightIndex 추가
- `client/src/index.css` — bubble-user, dot-flash 등 신규 클래스
- `client/src/components/learn/ChatPanel.tsx` — 전면 교체

확인 항목:
- I7 PR #4A — 새로고침 버튼 src 재할당 reload 회귀 X
- I12 PR #4A — iframe sandbox=`allow-scripts` 유지
- I3 PR #4B — 퀴즈 채점 API `/api/quiz/grade` 정상 (chat router mount가 quiz router 영향 X)
- I1 PR #4B — `/library/6/ch06_q03` 진입 시 markRead localStorage 정상

회귀 발견 시 즉시 BLOCK.

---

## 4. JSON 출력

```json
{
  "pr": "#5",
  "phase": "eval-interaction",
  "model": "codex-gpt-5",
  "evaluated_commit": "<sha>",
  "items": [
    { "id": "I1", "verdict": "PASS", "evidence": "..." },
    { "id": "I7", "verdict": "PASS", "evidence": "grep dist/assets sk-ant- 0건, ANTHROPIC_API_KEY 0건, CORPUS_RAW 0건" },
    { "id": "I8", "verdict": "PASS", "evidence": "architecture_chats row: anonymous_id=<hex>, model_used=claude-haiku-4-5..., cached=false" }
  ],
  "critical_findings": [],
  "regression_pr4a": { "reload_pattern": "PASS", "iframe_sandbox": "PASS" },
  "regression_pr4b": { "quiz_grade": "PASS", "progress_localstorage": "PASS", "guide_panel_dots": "PASS" },
  "code_review_notes": [],
  "overall": "PASS",
  "summary": "..."
}
```

`overall`:
- I7 FAIL 또는 PR #4A/#4B 회귀 발견 → BLOCK
- 그 외 1건 FAIL → REVISE
- 전부 PASS → PASS

저장: `/home/claude/architecture/qa-eval/pr5-eval-interaction.json`

Master 보고:
> "PR #5 Eval-Interaction 완료. overall: PASS. 결과 qa-eval/pr5-eval-interaction.json. FAIL N건, CRITICAL 0건, PR #4A/#4B 회귀 0건."

---

## 5. 자기 점검

- [ ] I1~I15 모두 PASS/REVISE/FAIL 명시
- [ ] I7 (ANTHROPIC_API_KEY 클라이언트 노출) **반드시 build 후 직접 grep** — CRITICAL 후보
- [ ] I4 (rate limit 분당 1회) curl loop으로 직접 측정
- [ ] I8 (DB 저장 정합) Supabase 쿼리 직접 실행 (anonymous_id, model_used, cached 컬럼)
- [ ] I9 (TTL 7일) created_at update 후 cache miss 확인
- [ ] PR #4A reload + sandbox + PR #4B 퀴즈/진도 회귀 직접 확인
- [ ] 적대적 검증 — Generator 자체 보고 신뢰 X
- [ ] JSON 양식 정확
