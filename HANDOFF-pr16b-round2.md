# HANDOFF-pr16b-round2 — markRead 401 fix 재검증 (Eval-Interaction only)

> **프로젝트**: `architecture`
> **PR**: PR-16b — ch05 q05~q07 인라인 변환
> **base**: `main` (`ca5fea8` PR-16a 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch05-q5-q7`
> **round 1 결과**: eval-visual PASS / eval-interaction REVISE (I7 — dev mode 미인증 401 콘솔 노이즈)
> **Master 패치**: commit `0f140ab` (`fix(progress): dev mode 미인증 시 syncProgressRemote skip`)
> **이전 round**: `HANDOFF-pr16b-round1.md`

---

## 0. 메타

| key | value |
|---|---|
| step | pr16b |
| round | 2 |
| branch | feat/preview-inline-ch05-q5-q7 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **eval-interaction model override** | **codex** |

> Phase A (Generator) + Phase B (Eval-Visual) round 2 미실행. Phase C 만 spawn.

---

## 1. round 1 → round 2 변경 요약

| 항목 | round 1 (`5463c78`) | round 2 (`0f140ab`) |
|---|---|---|
| `client/src/lib/progress.ts` syncProgressRemote | DEV + devId 없을 때도 fetch 호출 → 401 | DEV + devId 없으면 early return |
| 다른 파일 | (변경 없음) | (변경 없음) |

---

## §C. Eval-Interaction (Codex)

PR-16b round 1 §C 동일 I1~I8. **I7 재검증 (dev mode 콘솔 에러 0)**:

- `/library/5/ch05_q05`, `q06`, `q07` direct dev-mode entry 시 console error 0 (특히 `/api/progress` 401 없음)
- 기존 deep-link, ID 정렬, build, raw 약자 grep 등 round 1 PASS 항목은 spot-check 1건만

### §C 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch05-q5-q7`
3. `git checkout --detach origin/feat/preview-inline-ch05-q5-q7`
4. `git rev-parse HEAD` 가 `0f140ab...` 로 시작하는지 확인
5. `cd client && npm install --no-audit --no-fund && npm run dev`
6. **코드 수정 절대 금지**

### §C 결과물

- 평가 보고: `qa-eval/pr16b-eval-interaction-round2.json` (커밋 + push, 또는 chore 브랜치 push 시 main worktree 도 직접 write)
- 센티넬: `qa/ao-logs/pr16b-r2-eval-interaction.status` (`git add -f` 강제)

```json
{"status":"done","step":"pr16b","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"0f140ab...","branch":"feat/preview-inline-ch05-q5-q7","fail_items":[],"revise_items":[]}
```

---

## 2. Master verdict 수령 절차

PASS → PR / REVISE/FAIL → 추가 패치 또는 round 3.

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | round 2 작성. round 1 dev-mode 401 fix 재검증 only |
