# HANDOFF — PR #1 Evaluator-Interaction (T4, Codex)

> 이 프롬프트를 새 터미널(T4)의 Codex에 그대로 복붙. Planner/Generator/Eval-Visual과 같은 터미널 절대 사용 금지.

---

## 컨텍스트

Architecture Academy PR #1 (프로젝트 스캐폴드)의 **인터랙션·인프라 검증자**입니다. PR #1은 UI가 거의 없으므로, **인터랙션·인프라 검증이 사실상 핵심 PASS 결정자**입니다.

### 필수 읽기

1. `/home/claude/shared/WORKFLOW-4PHASE.md` — Evaluator 공통 원칙
2. `/home/claude/architecture/HANDOFF-pr1-planner-spec.md` **§2.4 인터랙션·인프라 기준 I1~I9 + §2.2 자동 검증 A1~A8**
3. `/home/claude/architecture/SDD-v1.md` §11.6 (env 관리), §6 (RLS — sql 파일 검증용), §8 (스택)
4. `/home/claude/architecture/preflight-v1.4-report.md` — WARN 3건이 PR #1에서 실제로 처리됐는지 확인

---

## 검증 항목 (Planner spec §2.4 + §2.2)

### 자동 검증 (curl/build) — A1~A8

| ID | 기준 | 명령 |
|----|------|------|
| A1 | `cd /home/claude/architecture && npm install` 무에러 | exit 0 + `node_modules/concurrently` |
| A2 | `cd client && npm install`, `cd ../server && npm install` 무에러 | exit 0 |
| A3 | `npm run dev` — client :5176 + server :3003 부팅 (15초 대기 후 health 체크) | 양쪽 모두 응답 |
| A4 | `curl -s http://localhost:3003/api/health` → 200 + JSON `{"status":"ok","ts":<number>}` | numeric ts |
| A5 | `curl -s http://localhost:5176/api/health` → 200 동일 응답 (vite proxy) | 동일 |
| A6 | `curl -s http://localhost:5176` → 200 + HTML에 "Architecture" + `<teachermate-nav` | grep |
| A7 | `npm run build` → `client/dist/index.html` + `server/dist/index.js` | ls |
| A8 | `node server/dist/index.js` (production) → 3003 부팅 + `/api/health` 200 + `/`에서 client/dist/index.html 정적 서빙 | curl |

### 인터랙션·인프라 — I1~I9

| ID | 기준 | 시나리오 |
|----|------|---------|
| I1 | `/api/health` 응답 헤더 `Cache-Control: no-store` 또는 동등 | `curl -I http://localhost:3003/api/health` |
| I2 | env 누락 시 명시 에러: `unset SUPABASE_URL` 후 production 부팅 → non-zero exit + zod 메시지 | bash test |
| I3 | SIGTERM graceful: `kill -TERM <pid>` → Express close → exit 0 (10s 이내) | bash test |
| I4 | client 빌드 산출물에 `import.meta.env.VITE_SUPABASE_URL` 누락 시 빌드 시점 경고 또는 런타임 명시 메시지 (현 PR엔 호출 X — 빌드만 통과해도 PASS) | grep |
| I5 | `render.yaml` lint — 사용자가 작성했으면 lint, 안 됐으면 ❓ 표기 (작성 차단 hook 사용자 인지 필요) | yamllint |
| I6 | proxy 동작: `curl http://localhost:5176/api/nonexistent` → server 404 JSON `{"error":"..."}` | curl |
| I7 | CORS: `curl -H "Origin: http://other.local" http://localhost:3003/api/health` → CORS 헤더 정상 | curl |
| I8 | `git -C /home/claude/architecture remote get-url origin` = `https://github.com/nyuoasis-cmd/architecture.git` | git |
| I9 | PR open 상태 + base=main + head=feat/scaffold + Test plan 체크리스트 동봉 + Generator 자체 보고 표 동봉 | `gh pr view 1 --json baseRefName,headRefName,body` |

---

## 적대적 검증 가이드

- Generator의 자체 보고를 의심하라. PASS 보고가 있어도 직접 명령을 실행해 출력으로 검증.
- `npm install` 후 lock 파일 + node_modules가 실제로 생성됐는지 ls로 확인 (sha 검증까지는 불필요).
- `npm run dev`는 백그라운드로 띄우고, 15초 대기 후 curl. 응답 없으면 `npm run dev` 출력 마지막 30줄 첨부.
- production `node server/dist/index.js`도 실제로 띄워서 검증. 빌드만 통과해도 production 부팅 미검증이면 FAIL.
- 보안 점검 보너스: `.env`가 git에 staging되거나 commit됐는지 확인 (`git ls-files | grep -E '^\.env$'` → 결과 없어야 PASS).

---

## 출력 (JSON, 표준 스키마)

```json
{
  "step": "PR #1",
  "type": "interaction",
  "evaluator_model": "codex",
  "items": [
    { "id": "A1", "criterion": "npm install root 무에러", "result": "PASS|REVISE", "evidence": "exit 0, concurrently@8.2.2 installed" },
    { "id": "A4", "criterion": "/api/health 200 JSON", "result": "PASS|REVISE", "evidence": "curl -s ... → {\"status\":\"ok\",\"ts\":1735...}" },
    { "id": "I2", "criterion": "env 누락 시 zod 에러", "result": "PASS|REVISE", "evidence": "unset SUPABASE_URL && node server/dist/index.js → exit 1, message: 'SUPABASE_URL is required'" },
    { "id": "I3", "criterion": "SIGTERM graceful", "result": "PASS|REVISE", "evidence": "kill -TERM 1234 → 'closing server' → exit 0 in 0.4s" },
    { "id": "I9", "criterion": "PR open + body 동봉", "result": "PASS|REVISE", "evidence": "PR #1, base=main, head=feat/scaffold, body has 22 checkboxes" }
  ],
  "overall": "PASS|REVISE",
  "notes": "I5 render.yaml은 사용자 액션으로 분리됨 (Planner spec §4.5) — 작성 안 됐으면 ❓ 처리"
}
```

REVISE 시 file:line + 현재값 + 기대값 명시.

---

## 완료 트리거

위 JSON을 Planner(T1)에게 회신.
