# HANDOFF-pr15a-round3 — I7 deep-link fix 재검증 (Eval-Interaction only)

> **프로젝트**: `architecture`
> **PR**: PR-15a — ch04 4 데모 인라인 변환
> **base**: `main` (`ec6413b` PR-14b 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch04-q1-q4`
> **round 2 결과**: eval-visual PASS / eval-interaction REVISE (I7 deep-link only)
> **Master 패치**: commit `b148ab1` (`fix(learn): URL hash deep-link 시 시나리오 첫 항목 fallback 제거`) — `client/src/pages/LearnPage.tsx` useEffect 에 `window.location.hash` 우선 매칭 추가
> **이전 round 핸드오프**: `HANDOFF-pr15a-round1.md`, `HANDOFF-pr15a-round2.md`

---

## 0. 메타

| key | value |
|---|---|
| step | pr15a |
| round | 3 |
| branch | feat/preview-inline-ch04-q1-q4 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **eval-interaction model override** | **codex** |

> **Phase A (Generator) + Phase B (Eval-Visual)**: round 3 에서는 실행하지 않음 (Master 가 직접 패치 + round 2 visual 이미 PASS). Phase C 만 spawn.

---

## 1. round 2 → round 3 변경 요약

| 항목 | round 2 (`3b71b5a`) | round 3 (`b148ab1`) |
|---|---|---|
| `LearnPage.tsx:140-146` useEffect | `resetForQa(qa.id, demo?.scenarios[0]?.id ?? 'launch')` | `window.location.hash` 우선 매칭 후 fallback |
| 영향 범위 | 모든 챕터 deep-link (ch01~ch10) | 동일 — pre-existing 버그 fix |
| ch04 컴포넌트 / data/demos.ts | (변경 없음 — round 2 그대로) | (변경 없음) |

---

## §C. Eval-Interaction (Codex) — round 2 I7 fix 재검증

### §C 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch04-q1-q4`
3. `git checkout --detach origin/feat/preview-inline-ch04-q1-q4`
4. `git rev-parse HEAD` 가 `b148ab1...` 로 시작하는지 확인 (round 3 fix)
5. `cd client && npm install --no-audit --no-fund && npm run dev`
6. **코드 수정 절대 금지**

### §C 검증 (I7 집중)

I7 deep-link 동작 검증:
- 16 시나리오 deep-link 모두 새 탭 (또는 `goto`) 으로 직접 접근 후 활성 카드/hero 가 hash 시나리오로 시작하는지 Playwright 확인
  - `/library/4/ch04_q01#cell`, `#frame`, `#free`, `#choice`
  - `/library/4/ch04_q02#csv`, `#json`, `#xml`, `#choice`
  - `/library/4/ch04_q03#duplicate`, `#anomaly`, `#normalize`, `#balance`
  - `/library/4/ch04_q04#scan`, `#index`, `#seek`, `#cost`
- 추가 회귀 spot-check (1건): `/library/3/ch03_q04#staging` 등 PR-14a/14b 챕터에서도 fallback 동작 정상인지

I1~I6, I8: round 2 PASS — 재검증 불필요. spot-check 1건만 (build + grep).

### §C 결과물

- 평가 보고: `qa-eval/pr15a-eval-interaction-round3.json`
- 센티넬: `qa/ao-logs/pr15a-r3-eval-interaction.status`

```json
{"status":"done","step":"pr15a","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"b148ab1...","branch":"feat/preview-inline-ch04-q1-q4","fail_items":[],"revise_items":[]}
```

> ⚠️ **eval branch push 강제**: 평가 JSON 을 별도 브랜치 `codex/pr15a-r3-eval-interaction` 에 작성하면 즉시 `git push origin <branch>` (force 금지). Master 가 회수 가능하도록.
>
> **추가 (round 2 사례)**: codex 자체 브랜치 push 후 main worktree 의 sentinel path 가 비어 있어 ao_wait_session 이 timeout 으로 codex 프로세스 죽임. **반드시 main worktree 의 `qa/ao-logs/pr15a-r3-eval-interaction.status` 도 직접 write + push** (gitignore 우회: `git add -f`).

---

## 2. Master verdict 수령 절차

1. eval-interaction PASS → Master 가 PR 생성
2. REVISE/FAIL → fail_items 분석 → round 4 또는 추가 패치
3. `commit` 필드 ≠ `b148ab1...` → stale sentinel 의심

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-03 13:55Z | round 3 작성. round 2 I7 only 재검증 (Phase C single). Master `b148ab1` LearnPage hash deep-link fix |
