# PR #8(content) — 챕터 7 "데이터베이스" 6 Q&A

base: main `7154af5`. branch: `codex/pr8-chapter7`.

## §A. T2

### A.1 정합
client + server CHAPTERS[6].count = 6.

### A.2 Q&A 6 (ch07_q01..06)
주제 후보 (자체 설계, 책 인용 0%):
1. RDBMS와 NoSQL의 차이는? (구조 vs 유연성)
2. SQL은 어떻게 쓰는가? (SELECT/INSERT/UPDATE/DELETE 4가지)
3. ACID는 무엇인가? (원자성·일관성·고립성·지속성, 비유)
4. 인덱스는 어떻게 검색을 빠르게 하나? (B-tree 색인 비유)
5. 정규화는 왜 필요한가? (중복 제거 / 1·2·3정규형)
6. 트랜잭션 격리 수준은 무엇인가? (Read Uncommitted ~ Serializable)

### A.3~A.4
- 시연 6개 (4~5 시나리오)
- 퀴즈 18개 (Q&A당 3, 4지선다 + 해설)

### A.5 절대 금지
다른 챕터 변경 X. 인프라 변경 X.

### A.6 자체 보고
- commit + push (auth 실패 시 master 보조)
- gh pr create --base main --title 'feat: PR #8 챕터 7 콘텐츠 6 Q&A'
- 센티넬 qa/ao-logs/pr8-content-r1-gen.status

## §B/§C
산출물: qa-eval/pr8-content-eval-{visual,interaction}.json + 센티넬 pr8-content-r1-eval-*.status
