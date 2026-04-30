# PR #4 핸드오프 — 챕터 3 "테스트와 배포" 7 Q&A 콘텐츠

> 패턴: PR #2/#3와 동일 (qa-stubs/demos/quizzes/chapter-content/quiz-answers)
>
> base: main (`ea25b6e` PR #3 머지 후)
> branch: `codex/pr4-chapter3`

## §A. T2

### A.1 CHAPTERS 정합
client + server 모두 ch3.count = 7 (변경 없음, 이미 7).

### A.2 Q&A 7개 (ch03_q01..07)
SDD ch3 "테스트와 배포" 주제 분배 (Codex가 본문 자체 작성, 비유 자체 설계):

1. ch03_q01 — 단위·통합·E2E 테스트는 무엇이 다른가? (피라미드 비유)
2. ch03_q02 — TDD는 어떻게 일하는 방식인가? (Red-Green-Refactor)
3. ch03_q03 — CI는 무엇이고 왜 쓰나? (자동 검증 게이트)
4. ch03_q04 — CD와 배포 환경(dev/staging/prod) 차이는? (계단형 검증)
5. ch03_q05 — 배포가 잘못되면 어떻게 되돌리나? (롤백/블루그린/카나리)
6. ch03_q06 — 운영 중인 서비스는 어떻게 감시하나? (모니터링/알림/SLI/SLO)
7. ch03_q07 — 코드 리뷰는 왜 하고 어떻게 하나? (지식 공유 + 결함 조기 발견)

각 Q&A:
- 본문 4~6단락 (자체 작성, 책 인용 0%)
- 키워드 3~5
- 체크포인트 한 줄
- summary 한 줄

### A.3 시연 HTML 7개
각 시연 4~5 시나리오, sandboxed iframe.
- ch03_q01: 테스트 피라미드 시각화 (단위→통합→E2E 비중 클릭)
- ch03_q02: TDD 사이클 애니메이션 (Red→Green→Refactor)
- ch03_q03: CI 파이프라인 흐름 (커밋→빌드→테스트→리포트)
- ch03_q04: 배포 환경 계단 (dev→staging→prod 단계 진입)
- ch03_q05: 롤백 시나리오 비교 (블루그린 vs 카나리 vs 즉시롤백)
- ch03_q06: 모니터링 대시보드 시뮬 (요청 수→에러율→알림 트리거)
- ch03_q07: 코드 리뷰 흐름 (PR→코멘트→수정→머지)

### A.4 퀴즈 21개 (Q&A당 3문항)
4지선다 + 해설. 자체 표현.

### A.5 절대 금지
- ch1/ch2/ch6 콘텐츠 변경 (회귀 X)
- 인프라 변경 (PR #5/#6/#7/#8 인프라 회귀 X)
- progress.ts/PreviewPanel/chapter-content.ts SYSTEM_PROMPT 등 인프라 정합 변경 X

### A.6 자체 보고
- commit SHA + push + 빌드 두 종류 무에러
- gh pr create --base main --title 'feat: PR #4 챕터 3 콘텐츠 7 Q&A'
- 센티넬 `qa/ao-logs/pr4-r1-gen.status`

## §B. T3 Eval-Visual (5건)
V1 ch3 카드 7 / V2 본문 단락 / V3 시연 7 / V4 퀴즈 21 / V5 모바일 + 회귀 X

## §C. T4 Eval-Interaction (8건)
I1 mark-read 동기 / I2 quiz score 저장 / I3 시나리오 src 재할당 / I4 ch3 챗봇 그라운딩 / I5 DB 캐시 / I6 회귀 / I7 빌드 / I8 chapter-content.ts 정합

산출물 위치 동일 (`qa-eval/pr4-eval-{visual,interaction}.json`, 센티넬 `qa/ao-logs/pr4-r1-eval-*.status`)
