# PR #7(content) — 챕터 6 "컴퓨터 구조와 운영체제" 9 Q&A 추가

> ch06_q03 (프로세스/프로그램/프로세서) **이미 존재 — 보존**. 9개 추가.
>
> base: main `d8a2482`. branch: `codex/pr7-chapter6`

## §A. T2

### A.1 정합
client + server CHAPTERS[5].count = 10 (변경 없음). ch06_q03 보존, q01/q02/q04~q10 추가.

### A.2 Q&A 9 (추가)
주제 후보 (자체 설계, 책 인용 0%):
- ch06_q01 — CPU는 어떻게 구성되어 있나? (ALU/제어부/레지스터)
- ch06_q02 — 메모리는 왜 종류가 여러 개인가? (RAM/캐시/SSD/HDD 속도-용량 트레이드오프)
- (ch06_q03 보존)
- ch06_q04 — 캐시는 어떻게 동작하나? (지역성 + 적중률)
- ch06_q05 — 인터럽트는 무엇이고 왜 필요한가? (이벤트 기반)
- ch06_q06 — 멀티태스킹은 어떻게 가능한가? (시간 분할)
- ch06_q07 — 가상 메모리는 무엇인가? (실제 RAM 부족할 때 disk 활용)
- ch06_q08 — 파일 시스템은 무엇을 정리하나? (디렉토리/inode/저널링)
- ch06_q09 — 디바이스 드라이버는 왜 필요한가? (OS와 부품 사이 통역)
- ch06_q10 — 부팅은 어떤 순서로 일어나나? (POST/BIOS/부트로더/커널)

### A.3 시연 9개 (q01/q02/q04..q10)
각 4~5 시나리오. ch06_q03 보존.

### A.4 퀴즈 27개 (Q&A당 3, 9 × 3)
ch06_q03 기존 퀴즈는 유지.

### A.5 절대 금지
- ch06_q03 변경 X (보존)
- ch1/ch2/ch3/ch4/ch5 변경 X
- 인프라 변경 X

### A.6 자체 보고
- commit + push (auth 실패 시 master 보조)
- gh pr create --base main --title 'feat: PR #7 챕터 6 콘텐츠 9 Q&A 추가'
- 센티넬 qa/ao-logs/pr7-content-r1-gen.status

## §B/§C
산출물: qa-eval/pr7-content-eval-{visual,interaction}.json + 센티넬 pr7-content-r1-eval-*.status
