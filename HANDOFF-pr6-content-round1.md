# PR #6(content) — 챕터 5 "프론트엔드와 백엔드" 7 Q&A

base: main `a1a3483`. branch: `codex/pr6-chapter5`.

## §A. T2

### A.1 정합
client + server CHAPTERS[4].count = 7 (이미).

### A.2 Q&A 7 (ch05_q01..07)
주제 후보 (자체 설계):
1. 프론트엔드와 백엔드는 왜 나뉘어 있나?
2. HTML/CSS/JS는 각각 무슨 일을 하나?
3. API와 REST는 무엇인가? (자원·메서드·상태)
4. SPA와 SSR의 차이는? (렌더 시점 비유)
5. 상태 관리는 왜 필요한가? (Redux/Zustand/Context)
6. 프레임워크는 왜 쓰는가? (React/Vue/Svelte 비교)
7. 빌드 도구는 무엇을 하나? (Vite/Webpack/번들링)

### A.3~A.4
- 시연 7개 (4~5 시나리오)
- 퀴즈 21개 (Q&A당 3, 4지선다 + 해설)

### A.5 절대 금지
다른 챕터 변경 X. 인프라 변경 X.

### A.6 자체 보고
- commit + push (auth 실패면 master에 'master push 필요' 명시)
- gh pr create --base main
- 센티넬 qa/ao-logs/pr6-content-r1-gen.status

## §B/§C
PR #5(content) 패턴 동일. 산출물 위치: qa-eval/pr6-content-eval-{visual,interaction}.json + 센티넬 pr6-content-r1-eval-*.status
