# HANDOFF-pr0-round1 — qa-stubs title fresh + 챕터 title fresh + 정책 강화 + SDD §7~§13 정합

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-0 — qa-stubs.ts 64 Q&A title+summary fresh 재작성 + CHAPTERS 10 title fresh + qaCount 정정 + CLAUDE.md 책 TOC 0% 정책 강화 + SDD §7/§8/§9/§13 PR 분할 정합 (새 PR-0 + PR-3.5 행 추가)
> **base**: `main` (`8eda2e8` PR #84 머지 후)
> **작업 브랜치**: `ao/teacher-explain-pr0` (master 가 SDD+mockup 3종 prep commit 완료, push 예정)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-teacher-explain-v1.md` (v2.1 — 본 PR 에서 §7~§13 갱신)
> **사전 승인 mockup**: `mockups/qa-titles-fresh-samples.html` (81 title fresh — 사용자 OK)
> **에픽 위치**: teacher-explain v1 SDD 7-PR 직렬 1/7

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr0 |
| round | 1 |
| branch | ao/teacher-explain-pr0 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** (사유: 데이터 + 정책 + SDD 텍스트 통합 편집, 자유서술) |
| **eval-visual model override** | **codex** (Library/LearnPage 새 title 렌더 검증 — 시각) |
| **eval-interaction model override** | **codex** (chip 클릭 라우팅 + JSON 파싱 회귀) |

---

## 1. PR-0 변경 범위 (잠금)

### 1.1 데이터 카운트 결정 (3 카운트 충돌 정합)

실측 grep 결과 (`grep -oE "id: 'ch[0-9]{2}_q[0-9]{2}'" client/src/data/qa-stubs.ts | sort -u`):

| ch | 실제 Q 수 | CHAPTERS qaCount 선언 | mockup 카운트 |
|----|----------|----------------------|--------------|
| ch01 | 4 | 4 | 4 |
| ch02 | 4 | 4 | 4 |
| ch03 | 7 | 7 | 7 |
| ch04 | 7 | 7 | 7 |
| ch05 | 7 | 7 | 7 |
| **ch06** | **9** ⚠️ | **10** ❌ | **10** ❌ |
| ch07 | 6 | 6 | 6 |
| ch08 | 7 | 7 | 7 |
| ch09 | 6 | 6 | 6 |
| ch10 | 7 | 7 | 7 |
| **합계** | **64** ✅ | 65 | 65 |

ch06_q03 = `FULL_QA_ID` 상수 참조 대상이지만 실제 entry 없음 (선존 데이터 결함).

**PR-0 결정**:
- 정합 기준 = **실측 64**. CHAPTERS `ch06: { qaCount: 10 → 9 }` 정정.
- `FULL_QA_ID = 'ch06_q03'` → `'ch06_q01'` 정정 (또는 자유 판단으로 valid id 선택).
- mockup 의 ch06_q03 row 는 PR-0 데이터에 반영하지 않음 (entry 없음). PR description 에 1줄 메모.
- SDD 본문의 모든 "71" 참조 → "64" 정정 (§4.3.1 import / §7.2 For loop / §8 71 콘텐츠 / §9.1 71 TS 모듈 / §10 71 Q&A 비용 / §13.2.2 70 placeholder = 63 placeholder).

### 1.2 변경 파일 4개

| 파일 | 변경 |
|------|------|
| `client/src/data/qa-stubs.ts` | CHAPTERS 10 title + qaCount(ch06) + FULL_QA_ID + 64 entry × (title + summary) |
| `CLAUDE.md` (architecture) | "목차·질문 제목만 차용" → "모든 콘텐츠 fresh 생성, 책 TOC 0% 차용" |
| `SDD-teacher-explain-v1.md` | §7 콘텐츠 흐름 정책 정합 + §8 STEP 분할 표 PR-0/PR-3.5 행 추가 + §9 Sprint Contract PR-0/PR-3.5 추가 + §13.1 브랜치 명 표 PR-0/PR-3.5 추가 + 모든 "71" → "64" |
| (신규 파일 0건) | - |

코드 0줄, 데이터/문서만. PR-1 부터 코드 진입.

### 1.3 acceptance — 사용자 사전 승인 7항목 (PR-0 mockup 승인 시 잠금)

1. **책 TOC 차용 0%** — 신 title 어디에도 책 차례·소제목 차용 없음 (refframing·시나리오·1인칭 학생 시점)
2. **질문형 일관성** — 71 + 10 = 81개 모두 question form (`~까요?` / `~나요?` / `~인가요?`)
3. **비전공자 친화** — 일상 앱·시나리오 hook (카카오톡·유튜브·송금·폰)
4. **분량** — title 10~30자, ≤2줄 wrap
5. **중복 회피** — ch04_q03↔ch07_q05 (정규화), ch04_q04↔ch07_q04 (인덱스), ch04_q05↔ch07_q03 (ACID) 다른 각도 변주
6. **summary 정책 일관** — title 과 같은 fresh 정책으로 1~2 문장 자가 생성 (mockup 미포함, Generator 자율)
7. **CLAUDE.md 정책 라인 갱신** — "목차·질문 제목만 차용" → "모든 콘텐츠 fresh, 책 TOC 0% 차용"

### 1.4 본 PR 비범위

- Q&A `body` / `keywords` / `checkpoint` / `demoQaId` 필드 — 변경 0 (PR-3 / PR-4 에서 갱신)
- `client/src/data/demos.ts` / `client/src/data/quizzes.ts` — 변경 0
- 컴포넌트 / 라우팅 / 서버 / SQL — 변경 0
- ch06_q03 entry 신설 — PR-1 또는 PR-3 에서 placeholder 추가

---

## §A. Generator (Codex)

### §A 시작 단계 (절대 준수)

1. `cd /home/claude/architecture`
2. `git fetch origin && git checkout ao/teacher-explain-pr0 && git pull --ff-only`
3. `git log --oneline -1` 확인 — `cf6cef0 docs(sdd): teacher-explain v1 SDD v2.1 + 사전 승인 mockup 3종` 직후
4. **본 HANDOFF + SDD-teacher-explain-v1.md §0/§3/§4/§7/§8/§9/§13 + mockups/qa-titles-fresh-samples.html 본문 읽기** 필수
5. mockup HTML 의 81 title pair (10 chapter old→new + 71 Q&A old→new) 추출 — 단, ch06_q03 row 는 entry 미존재이므로 reading 만 하고 데이터 반영하지 않음
6. 모든 commit 은 본 브랜치 위에 직접 만든다. **별도 브랜치 생성 금지**
7. `git push origin ao/teacher-explain-pr0` (force 금지)
8. **PR 생성 안 함** — Master 가 모든 verdict PASS 후 일괄 PR 생성

### §A 작업 단계

#### STEP 1 — `client/src/data/qa-stubs.ts` 4 영역 정정

**1A) CHAPTERS 배열 — 10 entry**

mockup `chapter-table` 표의 신 title 그대로 적용. emoji + category + qaCount + firstQaId 는 유지.

| ch | new title | qaCount | 비고 |
|----|----------|---------|------|
| 1 | 컴퓨터가 1초 안에 하는 일 | 4 | - |
| 2 | 프로그램, 한 종류가 아닙니다 | 4 | - |
| 3 | 코드를 세상에 내보내는 길 | 7 | - |
| 4 | 데이터를 길들이는 법 | 7 | - |
| 5 | 보이는 쪽과 안 보이는 쪽 | 7 | - |
| 6 | 컴퓨터 안을 분해해 봅니다 | **9** | **qaCount 10 → 9 정정** |
| 7 | 데이터를 보관하는 창고 | 6 | - |
| 8 | 인터넷 너머의 보이지 않는 길 | 7 | - |
| 9 | 큰 시스템의 뼈대 그리는 법 | 6 | - |
| 10 | 거대한 컴퓨터를 빌리는 시대 | 7 | - |

**1B) `FULL_QA_ID` 상수**
- 현재 `'ch06_q03'` (broken — entry 없음)
- 신 `'ch01_q01'` 또는 valid id 자율 선택 (LearnPage 기본 진입 Q&A 가 되므로 ch01 권장)

**1C) 64 Q&A entry — `title` 필드**

mockup `qa-row` 표의 `qnew` 칼럼 값 그대로 적용. id 매핑 정확 일치. 쌍따옴표/홑따옴표는 기존 파일 컨벤션 따라 (홑따옴표). 줄바꿈 0건.

ch06_q03 row 는 mockup 에 있으나 entry 미존재 → 본 PR 데이터에 반영 안 함.

**1D) 64 Q&A entry — `summary` 필드**

mockup 미포함 — Generator 자율 생성. 정책:
- 1~2 문장
- title 의 hook 을 본문 도입과 연결 (학생 입장에서 "왜 이 질문인지" 한 줄 + "이 글에서 무엇을 알게 되는지" 한 줄)
- `~합니다` 종결 0건 (명사형 종결 또는 ~합니다 외 정중체)
- 책 본문 8-gram 차용 0건 (현 summary 톤이 책에서 베껴왔는지 의심되면 전면 재작성)
- 길이 30~80자

#### STEP 2 — `CLAUDE.md` (architecture root) 정책 라인 강화

현 33~36줄 부근 "콘텐츠 정책" 섹션:
```md
- 책 본문 **직접 인용 0%**, 목차·질문 제목만 차용
```

→ 신:
```md
- **책 TOC·소제목·본문 모두 차용 0%** — 모든 학생 노출 콘텐츠(챕터 title / Q&A title / summary / body / 챗봇 답변)는 fresh 자가 생성. PR-0 (2026-05-04) 정책 강화. 책 『기술노트』는 영감 출처로만 footer/about 표기
```

푸터/about 표기 정책 라인은 유지.

#### STEP 3 — `SDD-teacher-explain-v1.md` 4 섹션 정합

**3A) §7 콘텐츠 작성 흐름 (PR-4) → 다중 PR (PR-3 + PR-4) 정합**

- §7 헤딩 변경: "콘텐츠 작성 흐름 (PR-3 + PR-4)"
- §7.2 For loop: `qaId in 71` → `qaId in 64`
- §7.2 단계 6 경로: `server/src/data/teacher-explain/{qaId}.ts` (TS 모듈, v2.1 정정 그대로)
- §7.3 가독성 검수 — "랜덤 샘플 7개(10%)" → "랜덤 샘플 6~7개 (10%, ch01 PR-3 4건 + 잔여 PR-4 60건 중 랜덤 6개)"

**3B) §8 STEP 분할 표 — PR-0 + PR-3.5 행 추가**

신 표:

| STEP / PR | 마일스톤 | 데이터 | 코드 | 시간 |
|-----------|---------|------|------|------|
| **PR-0** ← 신설 | qa-stubs.ts 64 Q&A title+summary fresh + CHAPTERS 10 title + qaCount(ch06) + FULL_QA_ID + CLAUDE.md 정책 + SDD §7~§13 정합 | qa-stubs.ts | 0 | 1.5h |
| PR-1 | (기존 그대로 — "70개 더미" → "63개 더미", "71 TS" → "64 TS") | 동일 | 동일 | 1.8h |
| PR-2 | 동일 | 동일 | 동일 | 2.5h |
| PR-3 | ch01 4 Q&A 정식 콘텐츠 | ch01 4 TS | 0 | 1.5h |
| **PR-3.5** ← 신설 | `client/src/data/teacher-glossary.ts` 30 용어 + Glossary 컴포넌트 (tooltip 데스크탑 / bottom sheet 모바일 ARIA) | teacher-glossary.ts | 1 신규 컴포넌트 | 1h |
| PR-4 | 잔여 60 Q&A 일괄 (기존 67 → 60 — ch01 4 + ch06_q03 1 = 5 차감, mockup 65 - ch01 4 = 61 → 실측 64 - ch01 4 = 60) | ch02~ch10 60 TS | 0 | 4h |
| PR-5 | (조건부) 동일 | 동일 | 동일 | 1h |

총 7 PR / ~13.3h / 64 콘텐츠.

**3C) §9 Sprint Contract — PR-0 + PR-3.5 신규**

§9 머리에 다음 두 개 신설:

```md
### 9.0 PR-0 (qa-stubs title fresh + 정책)

- [ ] CHAPTERS 10 entry title mockup 정합 (qa-titles-fresh-samples.html)
- [ ] CHAPTERS ch06 qaCount: 10 → 9
- [ ] FULL_QA_ID 'ch06_q03' → valid id ('ch01_q01' 권장)
- [ ] 64 Q&A entry title mockup 정합 (id 매핑 1:1)
- [ ] 64 Q&A entry summary fresh 재작성 (~합니다 0건, 책 8-gram 0건, 30~80자)
- [ ] CLAUDE.md 책 TOC 차용 0% 정책 강화
- [ ] SDD §7/§8/§9/§13 정합 (본 PR 자체 self-rewrite)
- [ ] `cd client && npm run build` PASS
- [ ] `cd server && npm run build` PASS (서버는 본 PR 변경 0 — 회귀 PASS)
- [ ] Library/LearnPage 시각 spot-check — 새 title 노출
- [ ] qa-stubs JSON parse 에러 0건 (TS strict 빌드 통과)
```

```md
### 9.6 PR-3.5 (teacher-glossary)

- [ ] `client/src/data/teacher-glossary.ts` 30 용어 export
- [ ] Glossary 컴포넌트 (tooltip 데스크탑 / bottom sheet 모바일)
- [ ] ARIA — `role="dialog" aria-modal="true"` (모바일) + `aria-describedby` (데스크탑)
- [ ] 4종 닫힘 (ESC / 외부 클릭 / X 버튼 / 스와이프 다운 — 모바일)
- [ ] TeacherExplainPanel 의 단어 marker → Glossary 호출 동작
- [ ] DESIGN-POLICY 토큰 정합 (인라인 hex 0건)
- [ ] `cd client && npm run build` PASS
```

기존 §9.4 PR-4 카운트 — "ch02~ch10 67 JSON" → "ch02~ch10 60 TS" 정정. 책 8-gram + ~합니다 0건 항목 유지.

**3D) §13.1 브랜치 명 규칙 표 — PR-0 + PR-3.5 행 추가**

| PR | 브랜치 명 |
|----|-----------|
| PR-0 ← 신설 | `ao/teacher-explain-pr0` |
| PR-1 | `codex/teacher-explain-server` |
| PR-2 | `codex/teacher-explain-client` |
| PR-3 | `codex/teacher-explain-content-ch01` |
| PR-3.5 ← 신설 | `codex/teacher-explain-glossary` |
| PR-4 | `codex/teacher-explain-content-rest` |
| PR-5 | `codex/teacher-explain-polish` (조건부) |

**3E) "71" 전역 검색 정정**

```bash
grep -n "71" SDD-teacher-explain-v1.md
```

발견된 모든 "71" 참조 → "64" (또는 "63 더미" "60 잔여" 등 맥락별). 사례:
- §4.3.1: `import ch01_q01 from './ch01_q01'; // ... 71 import` → `// ... 64 import`
- §7.2 For loop: `For each qaId in 71` → `For each qaId in 64`
- §8 합계: "총 5 PR / ~10.5h / 71 콘텐츠" → "총 7 PR / ~13.3h / 64 콘텐츠"
- §9.1: "71 TS 모듈" → "64 TS 모듈"
- §9.4: "ch02~ch10 67 JSON" → "ch02~ch10 60 TS"
- §10: "71 Q&A × 13 필드" → "64 Q&A × 13 필드", "71 = ~213k output" → "64 = ~192k output", "× 71 = 320k input" → "× 64 = 288k input"

비용 추정 비례 갱신은 자율.

### §A 절대 금지

- Q&A `body` / `keywords` / `checkpoint` / `demoQaId` 변경
- `demos.ts` / `quizzes.ts` 변경
- 컴포넌트 / 라우팅 / 서버 / SQL 변경
- ch06_q03 entry 신설 (PR-1 placeholder 단계로 위임)
- main 직접 push, force push
- 빌드 스크립트 / package.json 변경

### §A 검증

1. `cd client && npm run build` 무에러
2. `cd server && npm run build` 무에러 (서버 0 변경 — 회귀)
3. `grep -c "id: 'ch" client/src/data/qa-stubs.ts` = 64 (변경 없음)
4. `grep -oE "qaCount: [0-9]+" client/src/data/qa-stubs.ts | awk '{s+=$2} END {print s}'` = 64 (정정 결과)
5. `grep -n "ch06_q03" client/src/data/qa-stubs.ts` 결과 = 0건 (FULL_QA_ID 정정 후)
6. `grep -n "71" SDD-teacher-explain-v1.md` = 0건 또는 의도된 비-카운트 참조 (예: 70년대 기술 등 무관한 숫자만)
7. `grep -nE "title: '책|장|차례'" client/src/data/qa-stubs.ts` = 0건 (책 TOC 차용 의심 grep)
8. `grep -nE "title: '.*[?]$|title: '.*까요\?|title: '.*나요\?|title: '.*인가요\?'" client/src/data/qa-stubs.ts | wc -l` ≥ 60 (질문형 종결)
9. `grep -nE "summary: '[^']*~합니다'" client/src/data/qa-stubs.ts` = 0건 (summary ~합니다 종결 0건)
10. CLAUDE.md 정책 라인 grep: `grep -n "fresh 생성, 책 TOC 0%" CLAUDE.md` = 1건 발견

### §A 완료 시 센티넬

`qa/ao-logs/pr0-r1-gen.status`:
```json
{"status":"done","step":"pr0","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"ao/teacher-explain-pr0","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"qa-stubs 64 title+summary fresh + CHAPTERS 10 title + ch06 qaCount 10→9 + FULL_QA_ID 정정 + CLAUDE.md 정책 + SDD §7/§8/§9/§13 정합. 빌드 PASS, 검증 grep 10/10 PASS."}
```

---

## §B. Eval-Visual (Codex)

### §B 시작 단계

1. `cd /home/claude/architecture && git fetch origin && git checkout ao/teacher-explain-pr0 && git pull --ff-only`
2. **Generator 센티넬 확인**: `cat qa/ao-logs/pr0-r1-gen.status` — `status:done` + `commit:<SHA>` 검증
3. **별도 브랜치 작업**: `git checkout -b codex/eval-visual-pr0` (sentinel 만 push)
4. dev mode 직접 띄우기 — `cd client && npm run dev` 시작 (포트 5176, vite hmr)

### §B 검증 V1~V8

viewport: 1440×900 (데스크탑) / 393×852 (모바일)

| # | 항목 | 대상 |
|---|------|------|
| V1 | `/library` 페이지 — 10 챕터 카드에 신 title 노출 ("컴퓨터의 큰 그림" → "컴퓨터가 1초 안에 하는 일") | 데스크탑+모바일 |
| V2 | `/library/1` ch01 진입 — 4 Q&A 카드 모두 신 title 노출 | 데스크탑+모바일 |
| V3 | `/learn/ch01_q01` LearnPage — 헤더에 신 chapter title + Q&A title (구 title 흔적 0건) | 데스크탑+모바일 |
| V4 | LearnPage 챗봇 input placeholder — Q&A title 참조 시 신 title 사용 | 데스크탑+모바일 |
| V5 | LearnPage `📖 학습` 탭 — summary 신 텍스트 노출 (~합니다 종결 0건 시각 확인) | 데스크탑+모바일 |
| V6 | 관련 Q&A chip (있다면) — 신 title 라벨 | 데스크탑+모바일 |
| V7 | 텍스트 줄바꿈 — 모든 카드에서 `word-break: keep-all` 적용, title 3줄 초과 0건 (393px) | 모바일 |
| V8 | DESIGN-POLICY §9.B 토큰 — 인라인 hex 0건 (변경 0 — 회귀) | 코드 grep |

### §B 회귀 spot-check

- `/learn/ch01_q01` LearnPage `📱 시연` 탭 — PR-13~PR-21 인라인 데모 정상 동작 (회귀 0건)
- PR #84 QR 버튼 회귀 — PreviewPanel 헤더 QR 버튼 + Fullscreen 모달 (시연 모드 한정)

### §B 완료 시 센티넬

`qa/ao-logs/pr0-r1-eval-visual.status` + `qa-eval/pr0-eval-visual-round1.json`:
```json
{"status":"done","step":"pr0","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","gen_commit":"<SHA>","viewports":["1440x900","393x852"],"results":[{"id":"V1","verdict":"PASS","note":""}, ...]}
```

---

## §C. Eval-Interaction (Codex)

### §C 시작 단계

1. `cd /home/claude/architecture && git fetch origin && git checkout ao/teacher-explain-pr0 && git pull --ff-only`
2. **Generator 센티넬 확인** — `qa/ao-logs/pr0-r1-gen.status`
3. **별도 브랜치 작업**: `git checkout -b codex/eval-interaction-pr0`
4. **빌드 외 dev mode 콘솔 에러 확인 필수** (PR-16a round 1 false PASS 학습 — `feedback_architecture-validate-label-raw-acronym.md`)

### §C 검증 I1~I8

| # | 항목 |
|---|------|
| I1 | `cd client && npm run build` 무에러 + bundle size 변화 ±5% (회귀) |
| I2 | `cd server && npm run build` 무에러 (서버 0 변경) |
| I3 | dev mode 첫 진입 시 콘솔 에러/warning 0건 (raw 약자 import-time throw 회귀 — PR-16a 학습) |
| I4 | `/library` → 챕터 클릭 → `/library/N` 라우팅 정상 (10/10) |
| I5 | `/library/N/qXX` → `/learn/chNN_qXX` 라우팅 정상 (64/64 — ch06_q03 제외) |
| I6 | LearnPage 4 탭 (학습/채팅/시연/퀴즈) state round-trip — 정상 |
| I7 | 챗봇 첫 메시지 — Anthropic API 정상 호출 (서버 0 변경 — 회귀) |
| I8 | qa-stubs.ts JSON 파싱 — TS strict 빌드 100% 통과 (id 매핑 정합) |

### §C 회귀 spot-check

- PR #84 QR 풀스크린 모달 ESC 닫힘 인터랙션 (회귀)
- 시연 인라인 데모 (PR-13~PR-21) — 시나리오 탭 클릭 + deep-link `#<scenario>` (회귀 spot-check 1건)

### §C 완료 시 센티넬

`qa/ao-logs/pr0-r1-eval-interaction.status` + `qa-eval/pr0-eval-interaction-round1.json`:
```json
{"status":"done","step":"pr0","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","gen_commit":"<SHA>","results":[{"id":"I1","verdict":"PASS","note":""}, ...]}
```

---

## 2. Master verdict 수령 절차

| 시나리오 | Master 행동 |
|---------|------------|
| 3/3 PASS | `git push origin ao/teacher-explain-pr0` 확인 → `gh pr create --base main --head ao/teacher-explain-pr0` → 사용자 알림 후 머지 (no_stop.auto_proceed.pr_merge) → PR-1 진입 |
| 1+ REVISE/FAIL | 차이 분석 → HANDOFF-pr0-round2.md 작성 → AO `--round 2` re-spawn |
| sentinel SHA mismatch | stale 의심 — sentinel 삭제 + AO re-spawn (`feedback_ao-pr-cycle-base-hygiene-and-stale-sentinel.md`) |

---

## 3. PR-16a + PR-21a 학습 반영

| 학습 | 본 PR-0 적용 |
|------|------------|
| **eval-interaction `npm run build` false PASS** | §C I3 dev mode 콘솔 에러 확인 추가 |
| **gen 코드 0줄 머지 trap** (PR-21a 사고) | 본 PR 은 의도적으로 코드 0줄 (데이터/문서만) — `git diff main..HEAD --stat` 검증 시 client/src/data/qa-stubs.ts + CLAUDE.md + SDD + HANDOFF + 4 mockups 변경 확인 (data/text 만 = OK) |
| **PR 추가 commit stale squash** | 사용자에게 PR 안내 시 "Commits 탭 클릭해서 N개 다 보이는지 확인" 강제 |
| **PR 머지는 사용자 명시 지시 후** | `feedback_pr-merge-after-qa.md` v2 — 7-PR 직렬 가동 일괄 승인이 명시 지시에 해당. 매 PR 자동 머지 OK. 다만 "PR-N 머지 완료 → PR-N+1 진입" 1줄 알림은 필수 |

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. 7-PR 직렬 AO 가동 1/7. 사용자 plan + SDD v2.1 + mockup 사전 승인 합치 |
