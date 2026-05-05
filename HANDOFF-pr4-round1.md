# HANDOFF-pr4-round1 — 잔여 60 Q&A teacher-explain 일괄 콘텐츠

> **프로젝트**: `architecture`
> **PR**: PR-4 — `server/src/data/teacher-explain/ch{02-10}_q*.ts` 60건 placeholder → 정식 13 필드 일괄 (PR-3 ch01 4건 제외)
> **base**: `ao/teacher-explain-glossary` (stacked — PR #91 후속)
> **작업 브랜치**: `ao/teacher-explain-pr4`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-teacher-explain-v1.md` v2.1 §4.1/§4.2/§9.4
> **사전 승인 mockup**: `mockups/teacher-explain-content-samples.html` (콘텐츠 톤 4 샘플)
> **에픽 위치**: 7-PR 직렬 6/7

---

## 0. 메타

| key | value |
|---|---|
| step | pr4 |
| round | 1 |
| branch | ao/teacher-explain-pr4 |
| base | ao/teacher-explain-glossary |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** (콘텐츠 일괄 — 60 Q&A × 13 필드 = 780 필드 작성, 30-60분 예상) |
| **eval-visual model override** | **codex** (콘텐츠 검증 — 가독성 + 8-gram + 시각 spot-check 랜덤 7건) |
| **eval-interaction model override** | **codex** (zod parse 60건 + dev fetch 7건 spot-check) |

---

## 1. 변경 범위

| 파일 | 변경 |
|------|------|
| `server/src/data/teacher-explain/ch{NN}_q{NN}.ts` × 60 | placeholder → 정식 13 필드 |

ch02 4 + ch03 7 + ch04 7 + ch05 7 + ch06 9(q03 제외) + ch07 6 + ch08 7 + ch09 6 + ch10 7 = 60.

`server/src/data/teacher-explain/ch01_q*.ts` (4건) — PR-3 에서 이미 정식. **변경 0**.

---

## §A. Generator (Codex)

### §A 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin && git checkout ao/teacher-explain-pr4 && git pull --ff-only`
3. `git log --oneline -1` 확인 — `a3660a9 feat: teacher-glossary 30 entry 채움` 직후
4. **본 HANDOFF + SDD §4.1/§4.2/§4.4/§9.4 + mockup `teacher-explain-content-samples.html` (톤 4 샘플) + qa-stubs.ts (각 Q&A title/summary/body 톤 참고) 본문 읽기** 필수
5. 모든 commit 본 브랜치 위에 직접
6. `git push origin ao/teacher-explain-pr4`

### §A 작업 단계 — 60 Q&A 일괄

각 Q&A entry 패턴:

```ts
import type { TeacherExplainBlock } from './types';

const block: TeacherExplainBlock = {
  qaId: 'chNN_qNN',
  
  // v2.0 신규 (필수)
  tldr: '...',                    // 30~50자, 1 문장, 단정형
  misconception: '...',           // ≤250자, 1~2 단락 (첫 문장=오개념 진술 / 둘째=정정법)
  relatedQas: ['...'],            // 1~3 valid id (ch01_q01~ch10_q07, ch06_q03 제외)
  
  // v1 필수 9
  goal: '...',                    // ≤200자
  cue: '"..."',                   // ≤150자, 1 문장 (큰따옴표)
  concept: '...',                 // ≤300자, 1~2 단락
  mechanism: '...',               // ≤300자, 1~2 단락 (비유 1 + 기술 1)
  realLife: '...',                // ≤250자
  prompts: [
    { q: '...', a: '...' },       // 3~5 pair (q ≤80자, a ≤200자)
  ],
  beforeDemo: '...',              // ≤200자
  note: '...',                    // ≤200자
  
  // 선택 2 (자율 — 둘 다 또는 하나 또는 없음)
  advanced: { technicalSpec: '...', friendlyExplanation: '...' },  // each ≤500자
  demoTip: { scenarioOrder: '...', studentReaction: '...' },       // 시연 도구 있는 Q&A에 한정
};

export default block;
```

### §A 콘텐츠 정책 (절대 준수)

- **~합니다 종결 0건** (prompts.a 만 정보 톤 허용)
- **책 본문 8-gram 차용 0건** — fresh 자가 생성 (CLAUDE.md 정책 강화)
- **chapter title 차용 0%** — PR-0 mockup 정합. fresh refframing
- 메타포 = 일상 hook (카카오톡/유튜브/송금 등)
- prompts = 학생이 던질 법한 질문 (고민/오해/실생활 연결)
- 비전공자 친화 (기술 용어 사용 시 풀이 또는 비유)
- DESIGN-POLICY UI 글로서리 정합 (~예요 / ~입니다 OK)

### §A 시간 관리 가이드 (60 entry — 30-60분 작업)

- 청크 단위 처리: ch02 → ch03 → ... → ch10 순차
- 각 청크 끝나면 `git commit` → 진행 상황 보존 (codex 자율 또는 작업 끝 단일 commit)
- 콘텐츠 생성 시 SDD §4.2 글자수 한도 매번 체크
- relatedQas는 같은 chapter 또는 cross-chapter (관련성 있는 Q&A id)

### §A 절대 금지

- ch01_q01~q04 변경 (PR-3 영역)
- ch06_q03 신설 (entry 미존재)
- 컴포넌트 / 라우트 / 데이터 외 코드 변경
- main push, force push

### §A 검증 (자가)

1. `cd server && npm run build` 무에러
2. `find server/dist/data/teacher-explain -maxdepth 1 -name '*.js' | wc -l` = 66 (회귀)
3. zod schema parse 60건 PASS — `for f in server/src/data/teacher-explain/ch{02..10}_q*.ts; do node -e "require('./'+f.replace('.ts','.ts').replace('server/src/','server/dist/'))" 2>&1 | grep -i error; done` (또는 ts-node 일괄)
4. `grep -c "준비 중입니다" server/src/data/teacher-explain/ch*_q*.ts` = 0 (placeholder 잔존 0)
5. `grep -nE "~합니다([^가-힣]|$)" server/src/data/teacher-explain/ch*_q*.ts | grep -v "prompts.*a:" | wc -l` = 0 (prompts.a 제외)
6. relatedQas 모두 valid id (qa-meta.ts cross check)

### §A 완료 시 센티넬

`qa/ao-logs/pr4-r1-gen.status`:
```json
{"status":"done","step":"pr4","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"ao/teacher-explain-pr4","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"60 Q&A 정식 13 필드 일괄. zod parse 60/60 PASS, ~합니다 0건, placeholder 잔존 0, build PASS."}
```

---

## §B. Eval-Visual — 콘텐츠 + spot-check 7건

### §B 시작 단계

1. **`git fetch origin && git checkout ao/teacher-explain-pr4 && git pull --ff-only`** — 필수
2. Generator sentinel + commit SHA 확인 (stale 의심 시 fail)
3. 별도 브랜치: `codex/eval-visual-pr4-r1`

### §B 검증 V1~V5

| # | 항목 |
|---|------|
| V1 | 60 Q&A 모두 §4.2 글자수 한도 통과 (자동 grep + wc) |
| V2 | prompts 각 3~5개 |
| V3 | ~합니다 종결 0건 (prompts.a 제외) |
| V4 | 책 본문 8-gram overlap < 5% — qa-stubs.ts body vs ch{NN}_q{NN}.ts 콘텐츠 cross check |
| V5 | 사용자 spot-check 랜덤 7건 (10%) — Playwright dev fetch + TeacherExplainPanel 13 필드 렌더 spot-check (qaId 무작위 7개) |

`qa/ao-logs/pr4-r1-eval-visual.status` + `qa-eval/pr4-eval-visual-round1.json`.

---

## §C. Eval-Interaction — light

### §C 시작 단계

1. **`git fetch origin && git checkout ao/teacher-explain-pr4 && git pull --ff-only`** — 필수
2. Generator sentinel 확인
3. 별도 브랜치: `codex/eval-interaction-pr4-r1`

### §C 검증 I1~I5

| # | 항목 |
|---|------|
| I1 | client + server build PASS |
| I2 | dev server 부팅 + console error 0 |
| I3 | 60 zod parse PASS — server logs `[teacher-explain] schema fail` 0건 |
| I4 | curl `GET /api/teacher-explain/{qaId}?sessionId={teacher_session}` 7건 spot-check (랜덤) — 모두 200 + 13 필드 |
| I5 | relatedQas chip 클릭 라우팅 회귀 (PR-2 검증) — 무작위 1건 |

`qa/ao-logs/pr4-r1-eval-interaction.status` + `qa-eval/pr4-eval-interaction-round1.json`.

---

## 2. Master verdict 절차

3/3 PASS → `gh pr create --base ao/teacher-explain-glossary --head ao/teacher-explain-pr4`. REVISE → master 직접 fix 우선.

---

## 3. PR-3 + PR-3.5 학습 반영

| 학습 | PR-4 적용 |
|------|---------|
| arch-164 worktree HEAD=main 사고 | §B/§C 시작 단계 1번에 git fetch + checkout 강제 |
| arch-167 codex hang (sentinel write 후 미종료) | master 직접 sync 패턴 박제 — worktree 안 sentinel/JSON 직접 회수 |
| Glossary 매칭 fail (PR-3.5 인계) | PR-4 본 PR 책임 X — PR-5 가 Glossary 컴포넌트 + ARIA 처리 |

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. 7-PR 직렬 6/7. 콘텐츠 일괄 — 가장 큰 PR |
