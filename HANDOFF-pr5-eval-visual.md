# PR #5 Eval-Visual (T3) 핸드오프 — Codex (별 세션)

> 별도 터미널·별도 세션. 모델: **Codex GPT-5**. Generator(T2) 세션 및 T4 세션과 분리 ([feedback_4phase-eval-not-self.md] + [feedback_4phase-eval-codex-only.md]).

---

## 0. 컨텍스트

읽기:
1. `/home/claude/architecture/HANDOFF-pr5-planner-spec.md` §2.3 V1~V7 — **검증 기준**
2. `/home/claude/architecture/mockups/student-learn.html` — 챗봇 버블 시각 패턴 `.bubble-bot`
3. `/home/claude/shared/DESIGN-POLICY.md` — Restrained Trust palette, 토큰 사용 원칙
4. PR diff (`gh pr view N --json files,additions,deletions`)

PR URL은 Master 안내.

---

## 1. 역할

**시각·DOM 회귀 검증자.** ChatPanel disabled 해제 + 메시지 버블 + 로딩 인디케이터 + 에러 표시 + 모바일 가독성 + PR #4A/#4B 시각 회귀 X 확인.

코드 합리성·기능 동작은 평가 X (T4 영역).

**적대적 독립 검증자.** grep PASS 수준 X. 픽셀 단위 + DOM cascade + 색 추출.

---

## 2. 절차

### 2.1 환경
```bash
cd /home/claude/architecture
git fetch origin && git checkout codex/pr5-chatbot
npm install
# .env에 ANTHROPIC_API_KEY 등 필요 (실 키 없어도 ChatPanel 시각 검증은 가능 — 응답 에러 path만 평가)
npm run dev
```

ANTHROPIC_API_KEY가 placeholder인 경우 실 응답은 502가 나오겠지만 V1~V7은 입력·로딩·에러 시각 검증이라 무관. 실 응답 시각(V2 user/bot bubble)은 마스터에게 실 키 요청 또는 mock 응답으로 검증.

### 2.2 스크린샷 (Puppeteer 또는 chromium-headless)

| # | URL | viewport | 비고 |
|---|-----|---------|------|
| S1 | `/library/6/ch06_q03` (학습 화면) | 1280×800 | ChatPanel 초기 상태 (placeholder bubble, textarea active) |
| S2 | S1에서 textarea에 "프로세스가 뭐예요?" 입력 + Send | 1280×800 | user bubble + 로딩 인디케이터 |
| S3 | 응답 도착 후 (실 키 또는 mock) | 1280×800 | user/bot 두 buble 동시 |
| S4 | rate limit 강제 (curl로 분당 2회 호출 후 UI에서 1회 시도) 또는 강제 에러 | 1280×800 | error 메시지 표시 |
| S5 | `/library/6/ch06_q03` ChatPanel | 375×812 | 모바일 + 키보드 가정 textarea 가시성 |
| S6 | 회귀 — `/library/6/ch06_q03` 3컬럼 + 시연 iframe | 1280×800 | PR #4A/#4B 시각 회귀 X |

저장: `/home/claude/architecture/qa-screenshots/pr5/`

### 2.3 V1~V7 측정

#### V1 — ChatPanel disabled 해제
- textarea `disabled` 속성 X (`getAttribute('disabled')` null)
- cursor 스타일 `text` (cursor-not-allowed 제거됨)
- placeholder "질문해보세요" 또는 동등 (한국어 친화)
- Send 버튼 enabled (input 빈 상태에선 disabled 가능)
- 측정: `await page.$eval('textarea', e => ({ disabled: e.disabled, cursor: getComputedStyle(e).cursor, placeholder: e.placeholder }))`

#### V2 — 메시지 버블
- user bubble: `.bubble-user` 클래스 또는 동등. 우측 정렬 (`align-self: flex-end` 또는 `self-end`)
- bot bubble: `.bubble-bot` 클래스. 좌측 정렬
- user 배경색은 var(--color-accent-soft) 또는 stone-200/indigo-50 같은 친화 색 (인라인 hex 0건)
- bot 배경색은 var(--color-bg-input) 또는 stone-100
- 폰트 13px, 행간 1.5
- 측정: `getComputedStyle().backgroundColor` rgb 추출 + 클래스 grep

#### V3 — 로딩 인디케이터
- 응답 대기 중 점 3개 애니메이션 또는 spinner 표시
- 색은 var(--color-accent) 또는 var(--color-text-muted) (인라인 hex 0건)
- aria-live="polite" 또는 동등 (스크린리더 안내)
- 측정: 입력 후 즉시 DOM 캡처 + getComputedStyle

#### V4 — 에러/rate limit 표시
- 에러 메시지 또는 토스트 (붉은 stone 또는 red-600 계열)
- 텍스트 친화적 ("잠시 후 다시 시도해주세요" 등 한국어)
- role="status" 또는 alert
- 측정: 강제 에러 후 DOM 캡처

#### V5 — 토큰 사용처 hex 0건
- `grep -rn "#6366f1\|#10b981\|#b91c1c\|#dc2626" client/src/components/learn client/src/lib` 결과 분류:
  - `index.css` 토큰 정의 라인 (`--color-accent: #6366f1;` 등) — 허용
  - 그 외 사용처 (`style={{...}}`, `.foo { color: #6366f1 }`) 0건 — 위반 시 REVISE
- bubble-user 배경 등에 인라인 hex 사용 시 즉시 REVISE
- [feedback_token-definition-vs-usesite.md] 적용
- 측정: grep

#### V6 — 모바일 가독성
- viewport 375×812
- textarea 폭 화면 안 (가로 스크롤 0px)
- Send 버튼 터치 타겟 ≥ 44px
- 메시지 버블 max-width ~90% (양 끝 여백)
- 키보드 올라온 상태 가정 시(viewport 375×400) 입력창 가시성
- 측정: viewport + getBoundingClientRect

#### V7 — PR #4A + #4B 시각 회귀 X
- `/library/6/ch06_q03` 데스크톱 3컬럼 비율 280/320/flex-1 — PR #4A round 4 PASS 상태와 동일
- 시연 iframe 정상 노출 (PreviewPanel reload 패턴 영향 X)
- GuidePanel 진행도 점 색 — PR #4B round 5 PASS 상태와 동일 (완료 green ✓ / 현재 accent / 미완료 stone)
- LibraryPage 챕터 카드 "X/Y" 진도 표시 유지
- 퀴즈 채점 결과 (V2 옵션 보더 색, 해설 폰트, 총점 정렬) — PR #4B 결과와 동일
- 측정: 스크린샷 비교 + DOM class

---

## 3. JSON 출력

```json
{
  "pr": "#5",
  "phase": "eval-visual",
  "model": "codex-gpt-5",
  "evaluated_commit": "<sha>",
  "screenshots": ["S1", "S2", "S3", "S4", "S5", "S6"],
  "items": [
    { "id": "V1", "verdict": "PASS", "evidence": "..." },
    { "id": "V2", "verdict": "PASS", "evidence": "user.bg=rgb(...) bot.bg=rgb(...)" },
    { "id": "V5", "verdict": "PASS", "evidence": "grep #6366f1 client/src/components/learn → 0건 (정의 라인은 index.css에서 grep 결과에 미포함)" },
    { "id": "V7", "verdict": "PASS", "evidence": "PR #4B 회귀 X — 진행도 점 색, 퀴즈 채점 결과 동일" }
  ],
  "overall": "PASS",
  "summary": "...",
  "next_action": "..."
}
```

`overall`:
- 1건이라도 REVISE → REVISE
- REVISE 0, REPORT만 → PASS_WITH_NOTES
- 전부 PASS → PASS

저장: `/home/claude/architecture/qa-eval/pr5-eval-visual.json`

Master 보고:
> "PR #5 Eval-Visual 완료. overall: PASS. 결과 qa-eval/pr5-eval-visual.json. REVISE 0, REPORT N건."

---

## 4. 자기 점검

- [ ] V1~V7 모두 PASS/REVISE/REPORT 명시
- [ ] 각 항목 측정 근거 (스크린샷 ID + 좌표 또는 DevTools 출력)
- [ ] 적대적 독립 검증 — Generator 자체 보고 신뢰 X
- [ ] PR #4A + #4B 시각 회귀 V7 직접 확인 (3컬럼, iframe, 진행도 점, 퀴즈 채점 결과)
- [ ] 토큰 사용처 hex grep 직접 실행 ([feedback_token-definition-vs-usesite.md] 정의 라인 제외)
- [ ] JSON 양식 정확
