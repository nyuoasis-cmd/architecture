# HANDOFF-pr17c-round2 — gen 코드 push 후 재검증 (Eval-Visual + Eval-Interaction)

> **PR**: PR-17c
> **base**: `main` (`c87064e`)
> **브랜치**: `feat/preview-inline-ch06-q8-q10`
> **round 1 결과**: gen sentinel done @ `1e4cc07b` (codex/pr17c-round1 chore 브랜치) BUT feat 브랜치엔 push 안 됨 → eval-interaction FAIL (missing-pr17c-implementation)
> **Master 패치**: cherry-pick `1e4cc07` → `dc4c2f6` (feat 브랜치에 gen 코드 적용)

---

## 0. 메타

| key | value |
|---|---|
| step | pr17c |
| round | 2 |
| branch | feat/preview-inline-ch06-q8-q10 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **eval-visual / eval-interaction model override** | **codex** |

> Phase A 미실행 (gen 코드 이미 적용됨). Phase B + C 만 spawn.

---

## 1. round 1 → round 2 변경

| 항목 | round 1 | round 2 (`dc4c2f6`) |
|---|---|---|
| Generator commit `1e4cc07` (`feat: ch06 q08~q10 인라인 시연 추가`) | `codex/pr17c-round1` chore 브랜치에만 존재, feat 브랜치 무 | feat 브랜치에 cherry-pick `dc4c2f6` |
| 신규 파일 | feat 무 | `Q08FileSystem.tsx`, `Q09Driver.tsx`, `Q10BootSequence.tsx`, registry/data/icons 변경 |

---

## §B. Eval-Visual (Codex)

PR-17b round 1 §B 동일 V1~V9. ch06_q08~q10 검증 + ch06_q01~q07 회귀 spot-check 1건.

### §B 시작

1. `cd /home/claude/architecture && git fetch origin feat/preview-inline-ch06-q8-q10`
2. `git checkout feat/preview-inline-ch06-q8-q10`
3. `git rev-parse HEAD` 가 `dc4c2f6...` 시작
4. `cd client && npm install --no-audit --no-fund && npm run dev`

### §B 결과물

`qa-eval/pr17c-eval-visual-round1.json` (round 1 으로 명명 — 의미상 첫 visual eval) + `qa/ao-logs/pr17c-r2-eval-visual.status` (`git add -f`).

> ⚠️ q10 5칸 — desktop sm:grid-cols-5 / mobile grid-cols-2 검증

---

## §C. Eval-Interaction (Codex)

PR-17b round 1 §C 동일 I1~I8.

### §C 시작

1. `cd /home/claude/architecture && git fetch origin feat/preview-inline-ch06-q8-q10`
2. `git checkout --detach origin/feat/preview-inline-ch06-q8-q10`
3. `git rev-parse HEAD` 가 `dc4c2f6...` 시작
4. `cd client && npm install --no-audit --no-fund`

### §C 결과물

`qa-eval/pr17c-eval-interaction-round2.json` + `qa/ao-logs/pr17c-r2-eval-interaction.status` (`git add -f`).

---

## 2. 학습 — Generator chore 브랜치 push only 패턴

| 학습 | 본 PR-17c 적용 |
|---|---|
| **Generator 가 codex/pr17c-round1 chore 브랜치에 commit + push 했지만 feat 브랜치엔 push 안 됨** (PR-14a/14b 의 codex push 패턴이 chore-only 일 때 발생) | Master 가 cherry-pick `1e4cc07` → `dc4c2f6` 으로 feat 브랜치 동기화 후 round 2 |

향후 PR 의 §A.시작 단계에 다음 강제 추가 후보:

> 작업 commit 은 본 feat 브랜치 위에 직접 만들고 `git push origin feat/...` 강제. chore 브랜치 따로 만들지 말 것 (특히 codex 의 `git checkout -b codex/...` auto-branch 회피).

---

## 변경 기록

| 2026-05-04 | round 2. gen chore 브랜치 → feat cherry-pick 후 Phase B+C 재spawn |
