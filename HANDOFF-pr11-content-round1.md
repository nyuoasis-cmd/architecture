# PR #11(content) — 챕터 10 "클라우드와 AI" 7 Q&A

base: main `dd00dca`. branch: `codex/pr11-chapter10`.

## §A. T2

### A.1 정합
client + server CHAPTERS[9].count = 7.

### A.2 Q&A 7 (ch10_q01..07)
주제 후보 (자체 설계, 책 인용 0%):
1. IaaS / PaaS / SaaS는 어떻게 다른가? (책임 경계 비유)
2. 도커는 왜 컨테이너라고 하나? (격리 + 이미지 + 실행환경)
3. 쿠버네티스는 무엇을 자동화하나? (스케일링·복구·롤아웃)
4. AI / ML / DL의 관계는? (포함 관계 + 학습 방식)
5. LLM은 어떻게 동작하나? (다음 단어 예측 + 컨텍스트)
6. API 비용/요금 모델은? (호출당 vs 토큰당, 캐싱·배치 절감)
7. 클라우드 보안의 기본은? (IAM·암호화·네트워크 격리)

### A.3~A.4 시연 7 + 퀴즈 21

### A.5 절대 금지
다른 챕터 + 인프라 변경 X.

### A.6 자체 보고 + 센티넬 qa/ao-logs/pr11-content-r1-gen.status
- commit + push (auth 실패 시 master 보조)
- gh pr create --base main --title 'feat: PR #11 챕터 10 콘텐츠 7 Q&A'

## §B/§C
산출물 위치 동일 패턴.
