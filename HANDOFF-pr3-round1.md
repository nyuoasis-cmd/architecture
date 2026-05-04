# HANDOFF-pr3-round1 — ch01 4 Q&A teacher-explain 정식 콘텐츠

> **프로젝트**: `architecture`
> **PR**: PR-3 — `server/src/data/teacher-explain/ch01_q{01-04}.ts` 4건 정식 콘텐츠 작성 (q01 refine + q02~q04 placeholder → 정식)
> **base**: `ao/teacher-explain-pr2` (stacked — PR #88 후속)
> **작업 브랜치**: `ao/teacher-explain-pr3`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-teacher-explain-v1.md` v2.1
> **사전 승인 mockup**: `mockups/teacher-explain-content-samples.html` (콘텐츠 톤 4 샘플)
> **에픽 위치**: 7-PR 직렬 4/7

---

## 0. 메타

| key | value |
|---|---|
| step | pr3 |
| round | 1 |
| branch | ao/teacher-explain-pr3 |
| base | ao/teacher-explain-pr2 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** (콘텐츠 작성 — 13 필드 × 4 Q&A) |
| **eval-visual model override** | **codex** (콘텐츠 검증 — 가독성 룰 + 8-gram) |
| **eval-interaction model override** | **codex** (zod schema parse + dev server fetch 회귀 — light) |

---

## 1. 변경 범위

| 파일 | 변경 |
|------|------|
| `server/src/data/teacher-explain/ch01_q01.ts` | refine — mockup `teacher-explain-content-samples.html` 톤 정합 (필요 시) |
| `server/src/data/teacher-explain/ch01_q02.ts` | placeholder → 정식 13 필드 |
| `server/src/data/teacher-explain/ch01_q03.ts` | placeholder → 정식 13 필드 |
| `server/src/data/teacher-explain/ch01_q04.ts` | placeholder → 정식 13 필드 |

ch01 신 chapter title = "컴퓨터가 1초 안에 하는 일" (PR-0 정합).

ch01 신 Q&A title (PR-0 적용됨):
| qaId | 신 title (qa-stubs.ts) |
|------|----------------------|
| ch01_q01 | 키보드를 누르면 무엇이 움직이나요? |
| ch01_q02 | 부품과 명령은 왜 따로 있을까요? |
| ch01_q03 | 앱들 사이를 정리하는 건 누구일까요? |
| ch01_q04 | 한 번의 클릭은 어디서 어디까지 다녀오나요? |

## 2. SDD 참조 (Generator 필독)

| 섹션 | 내용 |
|------|------|
| §4.1 | TeacherExplainBlock 타입 13 필드 |
| §4.2 | 가독성 룰 — 글자수 한도 표 (tldr 30~50, goal ≤200, cue ≤150, concept ≤300, mechanism ≤300, realLife ≤250, prompts 3~5(q≤80, a≤200), beforeDemo ≤200, misconception ≤250, note ≤200, advanced.* ≤500, relatedQas 1~3) |
| §4.4 | 친화 장치 7종 (필드 의미) |
| §9.3 | Sprint Contract — 4 Q&A 모두 §4.2 통과 + prompts 3~5 + 책 8-gram < 5% + ~합니다 0건 + 사용자 spot-check 4 PASS |

---

## §A. Generator (Codex)

### §A 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin && git checkout ao/teacher-explain-pr3 && git pull --ff-only`
3. `git log --oneline -1` 확인 — `bdf9470 feat: 설명 노트 패널과 교사용 탭 추가` 직후
4. **본 HANDOFF + SDD §4.1/§4.2/§9.3 + mockup `teacher-explain-content-samples.html` 본문 읽기** 필수
5. 모든 commit 은 본 브랜치 위에 직접
6. `git push origin ao/teacher-explain-pr3`

### §A 작업 단계

#### STEP 1 — ch01_q01 refine (선택)

기존 ch01_q01.ts 톤 검토 — mockup 의 ch01_q01 샘플이 있으면 정합 (있을 가능성 높음, mockup 4 샘플 중 하나로). 차이가 작으면 그대로 유지.

체크 포인트:
- ~합니다 종결 0건 (prompts.a 제외)
- 책 본문 8-gram 차용 0건
- relatedQas 1~3 valid id (ch01_q02~q04 또는 다른 chapter)

#### STEP 2~4 — ch01_q02 / ch01_q03 / ch01_q04 정식 13 필드

각 파일 placeholder 전체 교체. 13 필드 모두 §4.1 + §4.2 한도 충족:

**ch01_q02**: "부품과 명령은 왜 따로 있을까요?" (하드웨어 vs 소프트웨어)
- 메타포: 무대 장비 vs 대본 (현 qa-stubs.ts body 톤 활용 가능)
- prompts 3~5: 학생이 흔히 묻는 질문 (부품과 코드 차이, 같은 컴퓨터에서 다른 앱 동작 이유, 등)
- misconception: 학생 흔한 오해 + 정정법
- relatedQas: ['ch01_q01', 'ch01_q03'] 또는 합리적 선택

**ch01_q03**: "앱들 사이를 정리하는 건 누구일까요?" (운영체제)
- 메타포: 식당 매니저 (qa-stubs.ts ch01_q03 body 톤)
- prompts: OS 역할, 자원 분배, 앱 간 충돌 방지 등
- relatedQas: ['ch01_q01', 'ch01_q04', 'ch06_q01'] 또는 합리적 선택

**ch01_q04**: "한 번의 클릭은 어디서 어디까지 다녀오나요?" (데이터 흐름)
- 메타포: 클릭 → 입력 → 처리 → 출력 (전체 흐름)
- prompts: 클릭부터 화면 변화까지 단계, 네트워크 거치는 클릭 등
- relatedQas: ['ch01_q01', 'ch01_q03', 'ch08_q01']

### §A 콘텐츠 정책

- **~합니다 종결 0건** (prompts.a 만 정보 톤 허용 — 단정형 OK)
- **책 본문 8-gram 차용 0건** — fresh 자가 생성 (CLAUDE.md 정책 강화 적용)
- 각 카드(tldr/goal/cue/concept/mechanism/...) 의미 분리 — 중복 0
- 비유와 기술 균형 (mechanism 필드 = 비유 1 + 기술 1)
- 학생 입장 prompts (학생이 던질 법한 질문)
- 단정 + 친절 톤 — "~입니다" / "~예요" 종결 자율 (~합니다는 X)

### §A 절대 금지

- 클라이언트 / 컴포넌트 변경
- 라우트 / 서버 로직 변경
- 다른 ch{NN}_q{NN}.ts 변경 (ch01 4건만)
- DB / qa-stubs.ts 변경
- main 직접 push, force push

### §A 검증 (자가)

1. `cd server && npm run build` 무에러
2. zod schema parse — `import { teacherExplainBlockSchema } from './types'; ['ch01_q01','ch01_q02','ch01_q03','ch01_q04'].forEach(id => { const block = require('./'+id).default; const r = teacherExplainBlockSchema.safeParse(block); console.log(id, r.success ? 'PASS' : r.error.issues); })` — 4건 모두 PASS
3. `grep -nE "~합니다([^가-힣]|$)" server/src/data/teacher-explain/ch01_q*.ts | grep -v "^.*//.*" | grep -v 'prompts.*a:'` = 0건 (prompts.a 제외)
4. `grep -c '준비 중입니다' server/src/data/teacher-explain/ch01_q*.ts` = 0 (placeholder 전부 교체)
5. relatedQas 모두 valid id (`ch[0-9]{2}_q[0-9]{2}` 형식 + 실제 entry 존재 — qa-meta.ts와 cross check)

### §A 완료 시 센티넬

`qa/ao-logs/pr3-r1-gen.status`:
```json
{"status":"done","step":"pr3","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"ao/teacher-explain-pr3","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"ch01_q01 refine + q02/q03/q04 정식 13 필드. zod parse PASS, ~합니다 0건, placeholder 잔존 0."}
```

---

## §B. Eval-Visual (Codex) — 콘텐츠 검증

| # | 항목 |
|---|------|
| V1 | 4 Q&A 모두 §4.2 가독수 한도 통과 (글자수 grep 또는 wc 자동) |
| V2 | prompts 각 3~5개 (모두) |
| V3 | ~합니다 종결 0건 (prompts.a 제외) |
| V4 | 책 본문 8-gram overlap < 5% — `client/src/data/qa-stubs.ts` body 와 `ch01_q*.ts` 콘텐츠 cross check (또는 SDD §10 인용 기준) |
| V5 | dev mode 진입 → /learn/{eval-session}?role=teacher&qa=ch01_q02 fetch 200 + 13 필드 모두 렌더 |
| VR1 | PR-2 회귀: 시각 레이아웃 4 Q&A 모두 정상 — 카드 잘림/오버플로 0건 spot-check |

`qa/ao-logs/pr3-r1-eval-visual.status` + `qa-eval/pr3-eval-visual-round1.json`.

---

## §C. Eval-Interaction (Codex) — light

| # | 항목 |
|---|------|
| I1 | server build PASS |
| I2 | client build PASS (회귀) |
| I3 | dev server 부팅 + console error 0 |
| I4 | curl `GET /api/teacher-explain/ch01_q02?sessionId={teacher_session}` 200 + 13 필드 JSON |
| I5 | curl ch01_q03 / ch01_q04 동일 — 모두 200 + 13 필드 |
| I6 | relatedQas chip 클릭 라우팅 — `/learn/{sessionId}?qa={qaId}` 정상 (PR-2 회귀) |

`qa/ao-logs/pr3-r1-eval-interaction.status` + `qa-eval/pr3-eval-interaction-round1.json`.

---

## 2. Master verdict 절차

3/3 PASS → `gh pr create --base ao/teacher-explain-pr2 --head ao/teacher-explain-pr3`. REVISE → master 직접 fix 우선.

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. 7-PR 직렬 4/7 |
