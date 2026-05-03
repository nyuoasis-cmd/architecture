# HANDOFF-pr15a-round2 — ch04 q01~q04 인라인 변환 (round 1 fix 재검증)

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-15a — ch04 4 데모 (`q01~q04`) React 인라인 변환
> **base**: `main` (`ec6413b` PR-14b 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch04-q1-q4`
> **round 1 결과**: eval-visual FAIL (V3-active-sync) + eval-interaction REVISE (I5/I7/I8) — 동일 원인 (scenario id mismatch)
> **Master 패치**: commit `91c2270` (`fix(ch04): scenario id 정렬`) — `client/src/data/demos.ts` 의 ID 9개 수정
> **참조 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` §4.2 ch04
> **이전 round 핸드오프**: `HANDOFF-pr15a-round1.md`

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr15a |
| round | 2 |
| branch | feat/preview-inline-ch04-q1-q4 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | **codex** |
| **eval-interaction model override** | **codex** |

---

## 1. round 1 → round 2 변경 요약

| 항목 | round 1 (`9e27b5b`) | round 2 (`91c2270`) |
|---|---|---|
| `data/demos.ts` ch04_q01 ids | structured/semi/unstructured/choice | **cell/frame/free/choice** |
| `data/demos.ts` ch04_q02 ids | csv/json/xml/pick | csv/json/xml/**choice** |
| `data/demos.ts` ch04_q03 ids | dup/update/split/tradeoff | **duplicate/anomaly/normalize/balance** |
| `data/demos.ts` ch04_q04 ids | scan/index/lookup/cost | scan/index/**seek**/cost |
| 컴포넌트 SCENES 키 | (변경 없음) | (변경 없음 — round 1 그대로) |
| 한국어 라벨 | (변경 없음) | (변경 없음) |

**범위**: 단일 파일 9 ID 매핑. 컴포넌트 코드 / SCENES / 라벨 / icon / registry 무변경.

---

## §A. Generator (Codex) — round 2 = no-op 확인

> **중요**: round 2 의 fix 는 Master 가 이미 직접 패치 적용 (commit `91c2270`). Generator 는 **신규 코드 작성 금지**, fix 가 정상 push 되었는지만 확인하고 센티넬 작성.

### §A 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch04-q1-q4 && git checkout feat/preview-inline-ch04-q1-q4 && git pull --ff-only`
3. `git log --oneline -3` 으로 다음 3 commit 확인:
   - `91c2270 fix(ch04): scenario id 정렬 — data/demos.ts ↔ SCENES 키 일치` (round 2 fix)
   - `9e27b5b feat: ch04 q01~q04 인라인 데모 추가` (round 1 generator)
   - `9336489 chore(ao): PR-15a round 1 wrapper`
4. `cd client && npm run build` 무에러 확인
5. **추가 commit 금지**

### §A 검증 (자체 보고)

```bash
# data/demos.ts 의 ch04 ids 가 SCENES 키와 1:1 매치되는지 확인
grep -A 5 "qaId: 'ch04_q01'" client/src/data/demos.ts | grep "id:"
# → 'cell', 'frame', 'free', 'choice' 출력 기대

grep "^\s\+[a-z]\+: {" client/src/demos/ch04/Q01DataShape.tsx | head -10
# → 'cell:', 'frame:', 'free:', 'choice:' 출력 기대
```

ch04_q02/q03/q04 도 동일 grep 으로 정렬 확인.

### §A 완료 시 센티넬

파일: `qa/ao-logs/pr15a-r2-gen.status`

```json
{"status":"done","step":"pr15a","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch04-q1-q4","commit":"91c2270","pr":"pending-master","loc":"+0 -0","note":"round 2 = Master 직접 패치 (data/demos.ts 9 ID 정렬) 확인. 신규 코드 작성 없음. ID-SCENES 매치 grep PASS, build 무에러."}
```

---

## §B. Eval-Visual (Codex) — round 1 fail 재검증

round 1 §B + 동일. 단, **재검증 시 V3 만 집중 확인**:

- V3 active sync: `/library/4/ch04_q01#cell`, `#frame`, `#free`, `#choice` 4 hash + ch04_q02 `#csv`/`#json`/`#xml`/`#choice` + ch04_q03 `#duplicate`/`#anomaly`/`#normalize`/`#balance` + ch04_q04 `#scan`/`#index`/`#seek`/`#cost` 16 시나리오 모두 active 카드 / hero 가 기대 장면으로 이동하는지 Playwright 로 검증.
- V1, V2, V4~V9: round 1 PASS 였음 — spot-check 1건만 (ch04_q01 desktop + mobile).

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch04-q1-q4`
3. `git checkout feat/preview-inline-ch04-q1-q4`
4. `git rev-parse HEAD` 가 `91c2270...` 로 시작하는지 확인 (round 2 commit)
5. `cd client && npm install --no-audit --no-fund && npm run dev`
6. **코드 수정 절대 금지**

### §B 결과물

- 평가 보고: `qa-eval/pr15a-eval-visual-round2.json`
- 센티넬: `qa/ao-logs/pr15a-r2-eval-visual.status`

```json
{"status":"done","step":"pr15a","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"91c2270...","branch":"feat/preview-inline-ch04-q1-q4","fail_items":[],"revise_items":[]}
```

---

## §C. Eval-Interaction (Codex) — round 1 revise 재검증

round 1 §C + 동일. **I5/I7/I8 집중 재확인**:

- I5 active sync: 16 시나리오 ID 가 모두 컴포넌트의 SCENES 키와 일치하는지 grep 비교
- I7 URL hash sync: `PreviewPanel::handleScenarioHash` 가 정확한 ID 를 forward 하는지 (PR-14a 인프라 자동 수혜)
- I8 콘텐츠 1:1: `data/demos.ts` ch04 ids ↔ `client/src/demos/ch04/Q0*.tsx` SCENES 키 정렬 grep
- I1~I4, I6, Regression: round 1 PASS — spot-check 1건만

### §C 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch04-q1-q4`
3. `git checkout --detach origin/feat/preview-inline-ch04-q1-q4`
4. `git rev-parse HEAD` 가 `91c2270...` 로 시작하는지 확인
5. `cd client && npm install --no-audit --no-fund`
6. **코드 수정 절대 금지**

### §C 결과물

- 평가 보고: `qa-eval/pr15a-eval-interaction-round2.json`
- 센티넬: `qa/ao-logs/pr15a-r2-eval-interaction.status`

```json
{"status":"done","step":"pr15a","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"91c2270...","branch":"feat/preview-inline-ch04-q1-q4","fail_items":[],"revise_items":[]}
```

---

## 2. Master verdict 수령 절차

1. 3 센티넬 모두 PASS → Master 가 PR 생성
2. 1개라도 REVISE/FAIL → fail_items + revise_items 분석 → round 3
3. `commit` 필드 ≠ `91c2270...` → stale sentinel 의심 → 삭제 후 재spawn

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-03 12:50Z | round 2 작성. round 1 fail/revise 동일 원인 (scenario id mismatch) 을 Master 가 1 파일 9 ID 직접 패치. round 2 = 재검증 only |
