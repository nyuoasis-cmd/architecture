# HANDOFF-pr4-round2 — `~합니다` 종결 정책 정합 (tone fix only)

> **프로젝트**: `architecture`
> **PR**: PR-4 round 2 — round 1 Eval-Visual REVISE 정정 (58/60 blocks `~합니다` 종결 정책 위반)
> **base**: `ao/teacher-explain-glossary` (변경 0 — round 1 commit `3cece17` 위에 추가)
> **작업 브랜치**: `ao/teacher-explain-pr4` (round 1 그대로 — Generator 추가 commit)

---

## 0. 메타

| key | value |
|---|---|
| step | pr4 |
| round | 2 |
| branch | ao/teacher-explain-pr4 |
| base | ao/teacher-explain-glossary |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | (생략 — phase A 만) |
| **eval-interaction model override** | (생략) |

---

## 1. 변경 범위 (정정만)

| 파일 | 변경 |
|------|------|
| `server/src/data/teacher-explain/ch{02-10}_q{01-10}.ts` × 60 | `~ㅂ니다`/`~습니다` → `~어요`/`~예요` 등 정중체 변환 (prompts.a 제외) |

**target 필드** (Eval-Visual 진단):
- `mechanism` (모든 entry)
- `advanced.technicalSpec` / `advanced.friendlyExplanation` (있는 entry)
- `demoTip.studentReaction` (있는 entry)
- + 기타 `~ㅂ니다`/`~습니다` 발견 시 모두 (단 `prompts.a`는 정보 톤 허용)

**보존 필드**:
- `prompts.a` — 정보 톤 허용 (정책)
- 의미 변경 0 — 어미 톤만 바꿈
- 인용부호/큰따옴표/숫자/날짜 등 유지

---

## §A. Generator (Codex) round 2 - tone fix only

### §A 시작 단계

1. `cd /home/claude/architecture && git fetch origin && git checkout ao/teacher-explain-pr4 && git pull --ff-only`
2. `git log --oneline -1` 확인 — `3cece17` 또는 그 이후
3. 모든 commit 본 브랜치 위에 추가
4. `git push origin ao/teacher-explain-pr4`

### §A 작업 (단일 sweep)

**STEP 1**: 60 Q&A 모든 ch{02-10}_q*.ts 검사 — `~ㅂ니다`/`~습니다` 종결 grep

```bash
grep -nE "(ㅂ니다|습니다)['\"]?,?$" server/src/data/teacher-explain/ch*_q*.ts | grep -v "prompts" | wc -l
```

**STEP 2**: 발견된 모든 라인에 대해 정중체 자가 변환:

| 변환 패턴 | 예 |
|----------|-----|
| `~ㅂ니다` (받침 없음) → `~여요` 또는 `~요` | "보입니다" → "보여요" |
| `~습니다` (받침 있음) → `~어요`/`~아요` | "맡습니다" → "맡아요" |
| `있습니다` → `있어요` | |
| `됩니다` → `돼요` | |
| `합니다` → `해요` | |
| `없습니다` → `없어요` | |
| `같습니다` → `같아요` | |
| `만듭니다` → `만들어요` | |
| `드립니다` → `드려요` | |
| `옵니다` → `와요` | |

**의미 보존 절대 준수** — 동사 어간 + 적합한 어미 선택. 한국어 활용 규칙.

**STEP 3**: 변환 후 검증
- `cd server && npm run build` 무에러
- `grep -nE "(ㅂ니다|습니다)['\"]?,?$" server/src/data/teacher-explain/ch[02-9]*_q*.ts server/src/data/teacher-explain/ch10_q*.ts | grep -v "prompts.*a:" | wc -l` ≤ 0
- zod schema parse 60건 PASS (회귀)

### §A 절대 금지

- 다른 필드 의미 변경
- ch01_q*.ts 변경 (PR-3 영역)
- ch06_q03 신설
- prompts.a 변경 (정보 톤 허용)
- 다른 컴포넌트/데이터 파일 변경

### §A 완료 시 센티넬

`qa/ao-logs/pr4-r2-gen.status`:
```json
{"status":"done","step":"pr4","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"ao/teacher-explain-pr4","commit":"<SHA>","pr":"existing","loc":"+X -Y","note":"~합니다 종결 정합 정정 — 60 Q&A 일괄 tone fix. mechanism/advanced/demoTip 위주. ~합니다 grep 0건 (prompts.a 제외), build PASS, zod parse 60 PASS."}
```

---

## §B/§C 생략

Phase A only (`--phase A`). tone fix만이라 시각/인터랙션 변화 0.

---

## 2. Master verdict 절차

PASS → master 검증 (grep 0건) → PR 생성 (round 1 commit + round 2 commit 합쳐서). PR description 보강.

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | round 2 — round 1의 ~합니다 정책 위반 일괄 정정 |
