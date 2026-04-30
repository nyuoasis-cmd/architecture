# PR #10(content) — 챕터 9 "아키텍처와 설계" 6 Q&A

base: main `c02ce0d`. branch: `codex/pr10-chapter9`.

## §A. T2

### A.1 정합
client + server CHAPTERS[8].count = 6.

### A.2 Q&A 6 (ch09_q01..06)
주제 후보 (자체 설계, 책 인용 0%):
1. 모놀리식과 마이크로서비스의 차이는? (단일 vs 분산)
2. 레이어드 아키텍처(MVC/3-tier)는 왜 사용하나? (관심사 분리)
3. 디자인 패턴은 무엇인가? (재사용 가능한 해법, 싱글톤·옵저버·팩토리 예시)
4. 캐싱 전략의 종류는? (CDN/메모리/DB 캐시, 무효화 정책)
5. 메시지 큐(MQ)는 왜 필요한가? (비동기·분산·버퍼링)
6. 시스템 확장성(scalability)이란? (수평 확장 vs 수직 확장)

### A.3~A.4 시연 6 + 퀴즈 18

### A.5 절대 금지
다른 챕터 + 인프라 변경 X.

### A.6 자체 보고 + 센티넬 qa/ao-logs/pr10-content-r1-gen.status
- commit + push (auth 실패 시 master 보조)
- gh pr create --base main --title 'feat: PR #10 챕터 9 콘텐츠 6 Q&A'

## §B/§C
산출물 위치 동일 패턴.
