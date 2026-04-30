# Architecture QA round 1 — V5 Hotfix (demos.ts 매핑 누락 13건)

## 배경
운영 QA round 1 (2026-04-30) T3 verdict=REVISE 5건 중 **V5(ch08_q01 시연 미동작)**만 진짜 결함으로 판정. 나머지 4건(V1/V2/V6/V8)은 마스터 직권 False Positive 분석 완료.

V5 근본 원인: 콘텐츠 PR #9(ch8) + PR #10(ch9) 머지 시 `client/src/data/demos.ts`에 매핑 entry 추가가 누락됨.

증거:
- 운영: GET /demos/ch08/q01.html → HTTP 200 (파일 존재)
- 운영 LearnPage ch08_q01 진입 시 fallback 메시지 "이 문항의 시연은 콘텐츠 PR에서 연결됩니다." 노출
- 코드: `GuidePanel.tsx:35` `getDemoByQaId(currentQa.demoQaId)`가 ch08_q01에 대해 undefined 반환
- `client/src/data/demos.ts`에 ch08, ch09 entry 0개 (ch07_q06 다음 ch10_q01)

## 범위 (정확히 13건 추가)
`client/src/data/demos.ts`에 다음 entry **13건 추가**:
- ch08_q01 ~ ch08_q07 (7건)
- ch09_q01 ~ ch09_q06 (6건)

ch07 = 6 Q&A (정상), ch10 = 7 Q&A (정상). ch07_q07 파일 없음 (q01~q06만 존재) — 추가 불필요.

## 위치
`demos.ts` line 547 (ch07_q06 entry 닫는 `},`) 다음, line 559 (ch10_q01) 앞에 ch08 7건 + ch09 6건 일괄 삽입.

## 패턴 (참조: 기존 ch07_q01 entry line 487~497)

```typescript
{
  qaId: 'chXX_qYY',
  title: '<q??.html <title> 그대로>',
  url: '/demos/chXX/qYY.html',
  description: '<시연 의도 한 문장 (한글, 한 문장 끝마침. ch07_q01 톤 참조)>',
  scenarios: [
    { id: '<hash 제거 key>', label: '<짧은 한글 라벨, 8자 이내>' },
    ...
  ],
},
```

### 데이터 추출 방법
각 q??.html 파일에서:
1. `<title>` 태그 → entry `title`
2. `const scenarioMap = { '#xxx': {...} }` 객체 →
   - `scenarios[].id` = key에서 `#` 제거 (예: `#ip` → `'ip'`)
   - `scenarios[].label` = 해당 scenarioMap entry의 첫 chip 또는 text 첫 단어 기반 짧은 한글 (예: `'#ip' { chips: ['주소','라우팅'], text: 'IP는...' }` → label `'IP'` 또는 `'주소'`)
3. `description`은 q??.html 본문 첫 단락 또는 scenarioMap text 종합한 한 문장

### ch07_q01 톤 참조 (description 예시)
- "RDBMS와 NoSQL이 구조, 확장, 조회 방식에서 어떻게 다른지 비교합니다."
- 한 문장 + 시연 의도 명시 + 종결어미 "비교합니다", "보여줍니다", "확인합니다" 등

## 절대 금지 항목
- ch01~ch07, ch10 entry 변경 (정렬 위치 외 절대 변경 X)
- demos.ts 외 파일 변경 (qa-stubs.ts, quizzes.ts, GuidePanel.tsx 등)
- demos/ 디렉토리 HTML 파일 수정 (콘텐츠 변경 X)
- 빌드 스크립트, package.json, vite.config.ts 등 인프라 변경
- 새 export, 새 함수, 새 type 추가 금지 (DemoMeta 타입 그대로)

## 빌드 검증 의무
워크트리에서:
```bash
cd client && npm install --include=dev --silent && npm run build
```
무에러 확인 + dist/ 산출물 정상.

## 검증 grep (자체 보고에 포함 의무)
```bash
grep -c "qaId: 'ch08" /home/claude/.worktrees/architecture/<session>/client/src/data/demos.ts
# 기대: 7

grep -c "qaId: 'ch09" /home/claude/.worktrees/architecture/<session>/client/src/data/demos.ts
# 기대: 6

# 시나리오 매핑 정합 (기존 q??.html scenarioMap key 일치)
node -e 'const fs=require("fs");const html=fs.readFileSync("client/public/demos/ch08/q01.html","utf8");const m=html.match(/scenarioMap = \{([\s\S]*?)\};/);console.log(m[1].match(/'\''#\w+'\''/g))'
# 결과를 demos.ts ch08_q01 scenarios id와 비교
```

## 산출물
- 브랜치: `codex/qa-prod-r1-hotfix-demos`
- 커밋: 1건 (squash 가능, 메시지 "hotfix: ch08·ch09 demos.ts 매핑 13건 추가 (V5 fix)")
- PR: GitHub PR 생성, body에 매핑 13건 + V5 fix 명시
- 워크트리 push: `git push -u origin codex/qa-prod-r1-hotfix-demos`

## Sentinel
위치: `/home/claude/architecture/qa/ao-logs/qa-prod-r1-hotfix-demos-gen.status`

스키마 (한 줄 JSON):
```json
{"status":"done","step":"qa-prod-r1-hotfix-demos","role":"gen","model":"codex","session_id":"<AO_SESSION>","ts":"<ISO8601>","branch":"codex/qa-prod-r1-hotfix-demos","commit":"<SHA>","pr":"<URL>","loc":"+X -Y","note":"ch08 7건 + ch09 6건 매핑 추가","verdict":"PASS"}
```

## 자체 보고 의무 (Generator 7대 의무)
1. commit SHA 명시
2. push 완료 명시 (`origin/codex/qa-prod-r1-hotfix-demos` 갱신 확인)
3. PR URL
4. 빌드 무에러 출력 인용 (npm run build 마지막 5줄)
5. grep count: ch08 = 7, ch09 = 6 (자체 grep 출력 인용)
6. 변경 파일: `client/src/data/demos.ts` (1개 파일)
7. Sentinel 작성 완료 명시

## 검증 후 머지 (마스터)
- Sentinel verdict=PASS + grep count 정합 → `--admin` 직권 머지
- 운영 빌드 (Render auto-deploy) 후 마스터가 ch08_q01 시연 fallback 사라지는지 확인
- 본 핸드오프 + architecture-qa-handoff-2026-04-29 메모리 모두 close
