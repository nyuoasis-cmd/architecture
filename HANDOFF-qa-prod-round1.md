# Architecture Academy 운영 QA round 1

대상: `https://architecture.teachermate.co.kr` (운영 도메인, 2026-04-29 배포 완료)
범위: 인프라 8 PR + 콘텐츠 10/10 챕터 71 Q&A 전수 회귀
원칙: **검증만, 코드 수정 절대 금지.** 결함 발견 시 fail/revise items에 file:line 인용. 마스터가 별도 hotfix PR.

---

## §B. T3 (Eval-Visual) — Codex Puppeteer

### B.1 검증 항목

| ID | 항목 | 기대 |
|---|---|---|
| V1 | `/` 랜딩 | 첫 화면 200 + 헤더 7탭 + Restrained Trust palette + 푸터 "알렉 『기술노트』(2026)" 표기 |
| V2 | `/library` | 10 챕터 카드 + 71 Q&A 카드 모두 렌더 (텍스트 누락 0) |
| V3 | `/about` | 알렉 출처 + 영감 표기 |
| V4 | 챕터별 한 Q&A 진입 (ch01_q01, ch05_q01, ch10_q01) | 본문 텍스트 렌더 + 시연 iframe load 200 + 챗봇 패널 + 퀴즈 영역 |
| V5 | 시연 iframe 시나리오 버튼 클릭 (ch08_q01 IP/TCP/UDP) | 시나리오 전환 동작 |
| V6 | 모바일 viewport 375×667 — `/library` + 1개 학습 페이지 | 가로 스크롤 0, 텍스트 잘림 0, 챗봇 fab 표시 |
| V7 | 다크/라이트 토글 (있으면) | 색상 대비 PASS |
| V8 | DESIGN-POLICY §6 정합 — 버튼 라운드 + 그림자 + 간격 | 위반 0 |

### B.2 검증 제외
- 카카오 OAuth 실제 인증 (T4가 라우트 200만 확인)
- 백엔드 응답 정합 (T4 영역)
- DB sync (T4)

### B.3 산출물
- `qa-eval/qa-prod-r1-eval-visual.json` (Codex 별 세션 워크트리에서 push 가능, 실패하면 마스터 보조)
- 센티넬: `qa/ao-logs/qa-prod-r1-eval-visual.status` 한 줄 JSON
  ```json
  {"status":"done","step":"qa-prod-r1","role":"eval-visual","model":"codex","session_id":"<AO_SESSION>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","fail_items":[],"revise_items":[],"screenshots":["public-screenshot-url-or-relative-path"]}
  ```
- 스크린샷 8장 (V1, V2, V4×3, V5, V6×2)는 결과 JSON에 base64 또는 push된 repo 경로 인용

---

## §C. T4 (Eval-Interaction) — Codex API + DB

### C.1 검증 항목

| ID | 항목 | 기대 |
|---|---|---|
| I1 | `GET /api/health` | 200 + JSON ok |
| I2 | `POST /api/chat` ch01_q01 질문 1건 | 200 + 한글 응답 4문장 + cache hit 메타 (cache_creation 또는 cache_read tokens > 0) |
| I3 | 같은 ch01_q01 동일 질문 2회차 | DB 답변 캐시 적중 (응답 재사용 또는 더 빠름) |
| I4 | ch10_q07 (마지막 Q&A) 챗봇 응답 | 200 + 4문장 |
| I5 | `GET /api/quiz/ch01_q01` (또는 동등) | 4지선다 3문항 + 해설 |
| I6 | 퀴즈 정답 채점 — `POST /api/quiz/answer` 정답 idx | correct=true |
| I7 | 퀴즈 오답 채점 | correct=false + 해설 반환 |
| I8 | 챕터별 1개씩 챗봇 회귀 (ch01..ch10 각 1 Q&A) | 10건 모두 200 + 4문장 |
| I9 | DEV 로그인 → `/api/sessions` (헤더 `x-dev-teacher-id`) | 200 + 비어있어도 OK |
| I10 | 세션 생성 `POST /api/sessions` (DEV 모드) | 200 + 세션 코드 6자 반환 |
| I11 | 진도 sync `POST /api/progress` (qaId, isDone) | 200 + DB row 확인 |
| I12 | a11y: 학습 페이지 메인 영역 keyboard navigation | tab 순서 정상, focus visible |
| I13 | iframe sandbox: 시연 HTML이 부모 history/storage 침범 X | 콘솔 에러 0 |
| I14 | 카카오 OAuth 라우트 — `/auth/kakao/start` | 302 + Supabase Auth URL |

### C.2 검증 제외
- T3 시각 회귀 재검증 X
- DB schema 마이그레이션 적용 여부 (이미 운영 PASS)

### C.3 환경
- 운영 도메인: `https://architecture.teachermate.co.kr`
- DEV 로그인 헤더: `x-dev-teacher-id: <uuid>` (.env 또는 architecture/server/src/middleware 참조)
- 카카오 실제 로그인은 검증 제외 (운영자만 가능)

### C.4 산출물
- `qa-eval/qa-prod-r1-eval-interaction.json`
- 센티넬: `qa/ao-logs/qa-prod-r1-eval-interaction.status` 한 줄 JSON
  ```json
  {"status":"done","step":"qa-prod-r1","role":"eval-interaction","model":"codex","session_id":"<AO_SESSION>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","fail_items":[],"revise_items":[],"sample_responses":{"ch01_q01_chat":"<first 100 chars>","cache_meta":"<usage block>"}}
  ```

---

## §D. Verdict 통합

- 양쪽 PASS → QA 완결
- 한쪽 REVISE → 결함 fail_items로 마스터 hotfix PR
- 양쪽 FAIL → 운영 롤백 검토 (드물어야)
