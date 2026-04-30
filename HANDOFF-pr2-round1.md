# PR #2 핸드오프 — 챕터 1 "컴퓨터의 큰 그림" 4 Q&A 콘텐츠

> 4-Phase: §A T2 Generator / §B T3 Eval-Visual / §C T4 Eval-Interaction / §D 콘텐츠 정책
>
> base: main (`aff93c2` PR #8 머지 후)
> branch: `codex/pr2-chapter1`
> SDD: `/home/claude/architecture/SDD-v1.md` §2(콘텐츠 정책) §3(챕터 트리) §12(시연·퀴즈)
> 데이터 위치: `client/src/data/qa-stubs.ts`, `client/src/data/demos.ts`, `client/src/data/quizzes.ts`

---

## §A. T2 Generator

### A.1 우선 정합 (CHAPTERS)
SDD 챕터 트리는 ch1=4 Q&A이지만 현 `qa-stubs.ts:CHAPTERS`는 ch1=7로 기록됨. 본 PR은 다음 정합:

```typescript
{ id: 1, category: '컴퓨터 기초', emoji: '🧭', title: '컴퓨터의 큰 그림', qaCount: 4, firstQaId: 'ch01_q01' },
```

(다른 챕터는 후속 PR에서 SDD에 맞춰 정합. 본 PR은 ch1만 정합)

### A.2 챕터 1 Q&A 4개 콘텐츠

#### ch01_q01 — 컴퓨터는 결국 무슨 일을 하나요?
- 본문 4~6단락:
  - 컴퓨터 = "입력→저장·처리→출력" 사이클
  - 폰 노이만 구조 (CPU + 메모리 + 입출력 장치)
  - 비유: 라면 끓이기 (재료=입력 / 냄비=메모리 / 불=처리 / 라면=출력)
  - 결국 0과 1로 환원되어 전기 신호로 흐른다
- 키워드: ["입력", "처리", "출력", "폰 노이만"]
- 체크포인트: "컴퓨터의 동작을 입력·처리·출력 사이클로 한 줄로 설명할 수 있다."

#### ch01_q02 — 하드웨어와 소프트웨어의 차이는?
- 본문:
  - 하드웨어 = 물리 부품 (CPU, RAM, SSD, 키보드)
  - 소프트웨어 = 명령의 묶음 (OS, 앱, 게임)
  - 하드웨어가 "할 수 있는 것"을 정하면, 소프트웨어가 "무엇을 할지" 지시
  - 비유: 무대 + 대본
- 키워드: ["하드웨어", "소프트웨어", "물리", "명령"]
- 체크포인트: "하드웨어와 소프트웨어를 무대와 대본 비유로 구분할 수 있다."

#### ch01_q03 — 운영체제는 무슨 역할을 하나요?
- 본문:
  - 운영체제(OS) = 사용자와 하드웨어 사이의 통역자/감독
  - 자원 분배 (CPU 시간, 메모리), 파일 관리, 보안, 사용자 인터페이스
  - 비유: 식당 매니저 (자리 배치 + 주문 분배 + 결제)
  - 예: Windows, macOS, Linux, Android, iOS
- 키워드: ["운영체제", "자원", "관리", "인터페이스"]
- 체크포인트: "OS의 핵심 역할 3가지(자원 분배·파일 관리·UI)를 들 수 있다."

#### ch01_q04 — 컴퓨터 안에서 데이터는 어떻게 흐르나요?
- 본문:
  - 저장소(SSD) → 메모리(RAM) → CPU → 결과 → 메모리 → 저장소 또는 출력
  - 메모리는 빠르지만 휘발성, 저장소는 느리지만 영구
  - 비유: 책장(저장소) ↔ 책상(메모리) ↔ 펜(CPU)
  - 캐시는 책상 위 "포스트잇" — 자주 쓰는 메모만 가까이
- 키워드: ["RAM", "저장소", "캐시", "데이터 흐름"]
- 체크포인트: "데이터가 SSD→RAM→CPU 순서로 이동하는 이유를 비유로 설명할 수 있다."

### A.3 시연 HTML 4개 (`client/src/data/demos.ts` 또는 별도 디렉토리)

각 Q&A당 1 시연. 시연은 `<iframe srcdoc>` 으로 학습 화면에 임베드. 4~5 시나리오를 내부 hash로 분기.

기존 패턴 참조: `client/src/data/demos.ts` 의 `getDemoByQaId('ch06_q03')` 시연 구조 (있다면).

각 시연 명세:
- ch01_q01: "라면 끓이기" 인터랙티브 — 클릭으로 단계 진행 (재료→냄비→불→라면). 4 시나리오: 입력 / 메모리 / CPU / 출력
- ch01_q02: 무대+대본 분리 비유 — 하드웨어(무대) 클릭 시 부품 이름, 소프트웨어(대본) 클릭 시 명령 흐름. 4 시나리오
- ch01_q03: 식당 매니저 시나리오 — OS가 손님(앱) 자리 배치, 주문 분배, 결제 처리. 4 시나리오
- ch01_q04: 책상-책장-펜 비유 — 클릭으로 데이터 이동 애니메이션 (책장→책상→펜→결과). 캐시 포함. 5 시나리오

시연 HTML 제약 (§12.2):
- 단일 HTML, sandboxed
- script tag inline 가능 (no external)
- 한국어 UI
- 375px 모바일 대응
- 검수 자동: HTML lint (구조 valid)

### A.4 퀴즈 12개 (`client/src/data/quizzes.ts`)

ch1 Q&A 4개 × 3 = 12 퀴즈.

각 퀴즈 명세:
- 객관식 4지선다
- 정답 1개 + 오답 3개 (그럴듯한 분산)
- 명료한 해설 (왜 정답인지, 오답이 왜 틀렸는지)
- 객관식 보기와 본문에 직접 인용 0% (자체 표현)

기존 ch06_q03 퀴즈 패턴 참조.

### A.5 챗봇 컨텍스트 활용
- 본문은 정적 마크다운으로 저장 → ChatPanel에서 챕터 진입 시 system prompt에 포함됨 (PR #5 prompt cache 4500 tok prefix에 누적)
- 본문 글자 수 한 Q&A당 ~400~600자 권장 (4500 tok 한도 분배)

### A.6 절대 금지 (§2.1 콘텐츠 정책)
- 책 본문 직접 인용 0%
- 알렉 『기술노트』 책 내용 그대로 옮기기 금지
- 학습 화면(/library/1/ch01_q0X) 라우팅·UI 변경 (PR #4A/#4B 회귀 X)
- ChatPanel/세션/OAuth 회귀 (PR #5/#6/#7 회귀 X)

### A.7 자체 보고
- commit SHA + push + npm run build (client + server tsc)
- gh pr create --base main --title 'feat: PR #2 챕터 1 콘텐츠 4 Q&A'
- 센티넬 `/home/claude/architecture/qa/ao-logs/pr2-r1-gen.status` (한 줄 JSON)

---

## §B. T3 Eval-Visual (5건)

| ID | 항목 | 기준 |
|---|---|---|
| V1 | /library 챕터 1 카드 | qaCount=4 표시, 제목 "컴퓨터의 큰 그림" |
| V2 | 4개 Q&A 본문 렌더 | 마크다운 정상, 단락 4~6, 키워드 칩 3~5 노출 |
| V3 | 시연 HTML iframe | 4개 모두 srcdoc 로드 + 시나리오 4~5 클릭 가능 |
| V4 | 퀴즈 UI | 4개 Q&A에서 각 3문항 출제, 보기 4지, 채점 후 해설 |
| V5 | 모바일 375 가독성 | 본문 줄간격 + 시연 풀폭 (PR #6 회귀 X) |

결과 JSON: `qa-eval/pr2-eval-visual.json` + 센티넬 `/home/claude/architecture/qa/ao-logs/pr2-r1-eval-visual.status`

---

## §C. T4 Eval-Interaction (8건)

| ID | 항목 | 검증 |
|---|---|---|
| I1 | 진도 자동 mark-read | /library/1/ch01_q01 진입 5초 후 progress.read=true |
| I2 | 퀴즈 채점 + 진도 저장 | 정답 100% → quiz_score=100 architecture_progress 행 |
| I3 | 시연 4 시나리오 hash 변경 | 클릭 시 iframe contentWindow location.hash 변화 |
| I4 | ChatPanel 챗봇 응답 | ch01_q01 진입 후 챗봇에 "비유 더 들어줘" 전송, 4문장 이내 응답 |
| I5 | DB 캐시 (PR #5 회귀) | 같은 질문 두 번째 < 1s, cached:true |
| I6 | 회귀 ch06_q03 | 기존 컨텐츠 그대로 작동, 영향 X |
| I7 | 빌드 산출물 정합 | client/dist 정상, /library SPA 동작 |
| I8 | 챗봇 컨텍스트 corpus | 본문이 chat-service.ts의 corpus 또는 system prompt에 포함됨 |

결과 JSON: `qa-eval/pr2-eval-interaction.json` + 센티넬 `pr2-r1-eval-interaction.status`

---

## §D. 콘텐츠 정책 + 다음 PR 흐름

### D.1 알렉 통지 게이트
- 머지 게이트 해제 (사용자 명시적 승인) — SDD §2.3 참조
- 본문 표현은 자체 작성, 책 직접 인용 0%

### D.2 다음 PR (병렬 가능)
- PR #3 챕터 2 (4 Q&A "소프트웨어의 종류와 특징")
- PR ... 챕터 3~10 (총 67 Q&A 잔여)

### D.3 자동화
- `ao-arch-pipeline.sh 2 1` 또는 직접 spawn

---

## §E. 메타

본 PR은 콘텐츠 작성 정공법의 첫 PR. 결과 PASS 시 PR #3~#11에 동일 패턴 적용.
