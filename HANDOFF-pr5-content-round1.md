# PR #5 핸드오프 — 챕터 4 "데이터 다루기" 7 Q&A 콘텐츠

> 패턴: PR #2~#4 동일.
>
> base: main (`20532f0` PR #4 머지 후)
> branch: `codex/pr5-chapter4`

## §A. T2

### A.1 정합
client + server CHAPTERS[3].count = 7 (이미 7).

### A.2 Q&A 7개 (ch04_q01..07)
주제 후보 (자체 설계, 책 인용 0%):
1. 정형/반정형/비정형 데이터의 차이는?
2. JSON, XML, CSV는 어떻게 다른가?
3. 데이터 정규화는 왜 필요한가? (중복 제거 / 일관성)
4. 인덱스는 어떻게 검색을 빠르게 하나? (책 색인 비유)
5. 트랜잭션 ACID는 무엇인가? (원자성·일관성·고립성·지속성)
6. 백업과 복구는 어떻게 설계하나? (RPO/RTO)
7. 데이터 시각화의 기본 원칙은? (목적·축·왜곡 방지)

### A.3 시연 HTML 7개
각 4~5 시나리오. 인터랙티브.

### A.4 퀴즈 21개 (Q&A당 3)
4지선다 + 해설.

### A.5 절대 금지
ch1/ch2/ch3/ch6 변경 X. 인프라 변경 X.

### A.6 자체 보고
- commit + push (push 실패 시 master에 보고하면 master가 GH App token으로 push)
- gh pr create --base main --title 'feat: PR #5 챕터 4 콘텐츠 7 Q&A'
- 센티넬 qa/ao-logs/pr5-content-r1-gen.status

## §B/§C T3+T4 (PR #4 패턴 동일)
qa-eval/pr5-content-eval-{visual,interaction}.json + 센티넬 pr5-content-r1-eval-*.status
