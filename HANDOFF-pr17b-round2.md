# HANDOFF-pr17b-round2 — progress.ts dev skip 강화 재검증 (Eval-Interaction only)

> **PR**: PR-17b
> **base**: `main` (`b6bf658`)
> **브랜치**: `feat/preview-inline-ch06-q5-q7`
> **round 1 결과**: eval-visual PASS / eval-interaction FAIL (dev-console-500-progress-api — Supabase egress quota 초과 → /api/progress 500 → 브라우저 자동 console error 표시 → "console error 0" 기준 위반)
> **Master 패치**: commit `d0016c6` — `progress.ts` DEV mode 전체 skip (PR-16b 의 부분 fix 보다 엄격)

---

## 0. 메타

| key | value |
|---|---|
| step | pr17b |
| round | 2 |
| branch | feat/preview-inline-ch06-q5-q7 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **eval-interaction model override** | **codex** |

> Phase A/B 미실행. Phase C 만 spawn.

---

## 1. round 1 → round 2 변경

| 항목 | round 1 (`8b5ab4e`) | round 2 (`d0016c6`) |
|---|---|---|
| `client/src/lib/progress.ts` syncProgressRemote DEV 분기 | devId 없을 때만 skip | DEV 무조건 skip (devId 무관) |

---

## §C. Eval-Interaction (Codex) — dev console 0 재검증

### §C 시작 단계

1. `cd /home/claude/architecture && git fetch origin feat/preview-inline-ch06-q5-q7`
2. `git checkout --detach origin/feat/preview-inline-ch06-q5-q7`
3. `git rev-parse HEAD` 가 `d0016c6...` 시작
4. `cd client && npm install --no-audit --no-fund && npm run dev`
5. **코드 수정 절대 금지**

### §C 검증

- I7 dev mode 콘솔 에러 0 (favicon 404 제외): `/library/6/ch06_q05~q07` direct entry 시 `/api/progress` 호출 자체가 발생 안 해야 함
- 기타 I check 는 round 1 정적 검증 모두 PASS — spot-check 1건만

### §C 결과물

- `qa-eval/pr17b-eval-interaction-round2.json`
- `qa/ao-logs/pr17b-r2-eval-interaction.status` (`git add -f`)

---

## 변경 기록

| 2026-05-04 | round 2. progress.ts DEV 무조건 skip 후 dev console 검증 |
