# PR #3 핸드오프 — 챕터 2 "소프트웨어의 종류와 특징" 4 Q&A 콘텐츠

> 패턴 출처: PR #2 (`HANDOFF-pr2-round1.md` 동일 구조). 챕터 2 분량만 변경.
>
> base: main (`1830eda` PR #2 머지 후)
> branch: `codex/pr3-chapter2`

---

## §A. T2 Generator

### A.1 CHAPTERS 정합
qa-stubs.ts의 chapter 2 → `qaCount: 4`, title 유지 또는 SDD 정합 ("소프트웨어의 종류와 특징"). 동일 정합 server/data/chapter-content.ts CHAPTERS[1].count: 7 → 4.

### A.2 Q&A 4개 (ch02_q01..04)

#### ch02_q01 — 소프트웨어는 어떻게 분류되나요?
- 본문: 시스템 SW (OS, 드라이버) vs 응용 SW (앱, 게임). 혼합형(미들웨어). 비유: 학교 행정실(시스템) vs 교실 수업(응용)
- 키워드: ["시스템", "응용", "분류", "OS"]
- 체크포인트: "시스템 SW와 응용 SW의 역할을 한 줄로 구분할 수 있다."

#### ch02_q02 — 오픈소스와 상용 소프트웨어의 차이는?
- 본문: 오픈소스 = 소스 공개+자유 수정 (Linux, Python). 상용 = 라이선스 비용+소스 비공개 (Photoshop, MS Office). 라이선스 종류, 학생용/상업용 구분
- 키워드: ["오픈소스", "상용", "라이선스", "GPL"]
- 체크포인트: "오픈소스와 상용의 차이를 라이선스 관점에서 설명할 수 있다."

#### ch02_q03 — 패키지와 모듈은 무엇인가요?
- 본문: 모듈 = 한 가지 기능의 코드 묶음. 패키지 = 모듈들의 큰 그룹. npm, pip 같은 패키지 매니저로 가져옴. 비유: 모듈=책 한 권, 패키지=책장
- 키워드: ["모듈", "패키지", "라이브러리", "의존성"]
- 체크포인트: "모듈과 패키지의 포함 관계를 한 줄로 말할 수 있다."

#### ch02_q04 — 클라우드와 SaaS는 무엇인가요?
- 본문: 클라우드 = 인터넷 너머의 컴퓨터 자원. SaaS = 그 위에서 제공되는 소프트웨어 서비스 (구글 docs). PaaS, IaaS 간단 비교. 비유: 빌릴 수 있는 사무실 vs 들고 다닐 수 있는 가방
- 키워드: ["클라우드", "SaaS", "구독", "서비스"]
- 체크포인트: "SaaS의 핵심 특징(구독·인터넷 접근)을 들 수 있다."

### A.3 시연 HTML 4개
- ch02_q01: 시스템/응용 분류 트리 인터랙티브 (4 시나리오: OS / 드라이버 / 앱 / 미들웨어)
- ch02_q02: 라이선스 비교 카드 (4 시나리오: 오픈소스 자유, 상용 비용, GPL 강제 공개, 학생용)
- ch02_q03: 모듈→패키지 포함 다이어그램 (4 시나리오: 단일 모듈 / 패키지 / 의존성 / npm install)
- ch02_q04: 클라우드 서비스 계층 (4 시나리오: IaaS / PaaS / SaaS / 구독)

### A.4 퀴즈 12개 (Q&A당 3)
- 각 4지선다 + 해설
- client/data/quizzes.ts + server/data/quiz-answers.ts 둘 다 정합

### A.5 절대 금지
- ch1 / ch6 콘텐츠 변경 (회귀 X)
- 인프라 변경 (PR #5/#6/#7/#8 회귀 X)
- 다른 챕터 (3~10) 본문 변경 (각자 PR에서)

### A.6 자체 보고
- commit SHA + push + npm run build 둘 다
- gh pr create --base main --title 'feat: PR #3 챕터 2 콘텐츠 4 Q&A'
- 센티넬 `qa/ao-logs/pr3-r1-gen.status`

---

## §B. T3 Eval-Visual (5건)
| ID | 항목 |
|---|---|
| V1 | /library 챕터 2 카드 qaCount=4 표시 |
| V2 | 4 Q&A 본문 단락 분리 (PR #2 hotfix 패턴 회귀 X) |
| V3 | 시연 HTML 4 + 시나리오 4 |
| V4 | 퀴즈 4×3=12 채점 + 해설 |
| V5 | 모바일 풀폭 + ch1 회귀 X |

## §C. T4 Eval-Interaction (8건)
| ID | 항목 |
|---|---|
| I1 | mark-read → architecture_progress 자동 저장 |
| I2 | 퀴즈 채점 → architecture_progress quiz_score 저장 |
| I3 | 시연 시나리오 클릭 → iframe.src 재할당 (cross-origin 차단 회피) |
| I4 | 챗봇 ch02 컨텍스트 그라운딩, 4문장 이내 |
| I5 | DB 캐시 동작 |
| I6 | ch01/ch06 회귀 X |
| I7 | 빌드 산출물 |
| I8 | server/data/chapter-content.ts 챕터 2 본문 채움 (placeholder 제거) |

결과 JSON: `qa-eval/pr3-eval-{visual|interaction}.json` + 센티넬 `qa/ao-logs/pr3-r1-eval-*.status`

---

## §D. 메타
PR #2 패턴 동일. Master 직접 hotfix 시 progress.ts/PreviewPanel 등 인프라는 이미 정합됨 (회귀 X).
