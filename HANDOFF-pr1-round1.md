# HANDOFF-pr1-round1 — server TS 데이터 모델 + 라우트 + 권한 (teacher-explain v1)

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-1 — server `teacher-explain/` 64 TS 모듈 + `qa-meta.ts` + 라우트 + 권한 검증 + Cache-Control: no-store
> **base (GitHub PR)**: `ao/teacher-explain-pr0` (stacked — PR #85 후속)
> **작업 브랜치**: `ao/teacher-explain-pr1` (master 가 이미 ao/teacher-explain-pr0 HEAD `c43fef0` 에서 분기)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-teacher-explain-v1.md` (v2.1 — PR-0 §7~§13 정합 갱신 적용)
> **에픽 위치**: teacher-explain v1 SDD 7-PR 직렬 2/7

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr1 |
| round | 1 |
| branch | ao/teacher-explain-pr1 |
| base | ao/teacher-explain-pr0 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** (사유: 64 TS 모듈 자동 생성 + 라우트 + zod 스키마 — 반복 코드) |
| **eval-visual model override** | **codex** (PR-1 = 서버 only, 시각 검증 light: V1 server 빌드 산출 grep 만) |
| **eval-interaction model override** | **codex** (11 권한 케이스 + safeParse 의도 fail 검증 — 핵심) |

---

## 1. PR-1 변경 범위 (잠금)

### 1.1 신규 파일 (66+ files)

| 경로 | 내용 |
|------|------|
| `server/src/data/teacher-explain/types.ts` | zod 스키마 + `TeacherExplainBlock` 타입 (§4.1 12 필드 — tldr/misconception/relatedQas/goal/cue/concept/mechanism/realLife/prompts/beforeDemo/note + advanced?/demoTip?) |
| `server/src/data/teacher-explain/index.ts` | static record map + `getTeacherExplainBlock(qaId)` helper. import-time `safeParse` skip 패턴 (§7.2.1) |
| `server/src/data/teacher-explain/ch01_q01.ts` | 정식 1개 (mockup `teacher-explain-content-samples.html` 톤 참고 가능, 또는 §4.2 가독성 룰 충족하는 임시 정식) |
| `server/src/data/teacher-explain/ch{NN}_q{NN}.ts` × 63 | placeholder — 모든 필드 "준비 중입니다" 1 문장 (학생 노출 가정 X, 교사 시각만 자연스러우면 OK) |
| `server/src/data/qa-meta.ts` | 64 entry `{ qaId, chapterId }` + `getQaChapterId(qaId)` helper (§6.1.2.1) |
| `server/src/routes.ts` (수정) | `GET /api/teacher-explain/:qaId` 추가 (§6.1.2 7단계 검증 순서) |
| (선택) `server/src/__tests__/teacher-explain.test.ts` | 권한 11 케이스 자동 테스트 (이미 있는 vitest 또는 jest 사용) — 없으면 manual curl |

64 entry = 4(ch01) + 4(ch02) + 7(ch03) + 7(ch04) + 7(ch05) + 9(ch06, q03 제외) + 6(ch07) + 7(ch08) + 6(ch09) + 7(ch10).

### 1.2 변경 0 파일

- 클라이언트 (PR-2 영역)
- DB schema / SQL 마이그
- 챗봇 / Anthropic prompt caching
- `ai.ts` / `db.ts` 핵심 로직 (단 routes.ts 마운트 1줄은 OK)

### 1.3 SDD 섹션 참조 (Generator 직접 읽기)

| 섹션 | 내용 |
|------|------|
| §4.1 | TeacherExplainBlock 타입 12 필드 + 글자수 한도 |
| §4.3.1 | 옵션 D 구현 패턴 (TS 모듈 + index record + types) |
| §6.1 | 권한 §6.1.1 (좁은 권한 B) + §6.1.2 (라우트 7단계) + §6.1.2.1 (qa-meta helper) + §6.1.3 (Cache-Control no-store) |
| §7.2.1 | zod safeParse + skip + console.error 패턴 (서버 부팅 차단 0건 강제) |
| §9.1 | Sprint Contract — 17 체크리스트 PASS 기준 |
| §13.2.2 | PR-1 구현 절차 단계별 가이드 |

---

## §A. Generator (Codex)

### §A 시작 단계 (절대 준수)

1. `cd /home/claude/architecture`
2. `git fetch origin && git checkout ao/teacher-explain-pr1 && git pull --ff-only` (없으면 `git checkout -b ao/teacher-explain-pr1 origin/ao/teacher-explain-pr0` 후 push)
3. `git log --oneline -1` 확인 — `c43fef0 fix(demos): ch01_q01 Q01Ramen eyebrow 토픽 라벨로 정정` 직후
4. **본 HANDOFF + SDD §4.1/§4.2/§4.3.1/§6.1/§7.2.1/§9.1/§13.2.2 + mockup `teacher-explain-content-samples.html` (ch01_q01 톤 참고용) 본문 읽기** 필수
5. 모든 commit 은 본 브랜치 위에 직접 만든다. **별도 브랜치 생성 금지**
6. `git push origin ao/teacher-explain-pr1` (force 금지)
7. **PR 생성 안 함** — Master 가 모든 verdict PASS 후 일괄 PR 생성

### §A 작업 단계

#### STEP 1 — `types.ts` zod 스키마

§4.1 TypeScript interface → zod 스키마 1:1 매핑. 글자수 한도 §4.2 표 그대로 `.max()` 적용. tldr/misconception/relatedQas 3 필드 v2.0 신설 포함. relatedQas는 `z.string().regex(/^ch(0[1-9]|10)_q(0[1-9]|10)$/).array().min(1).max(3)`. prompts는 `z.array(promptSchema).min(3).max(5)`. advanced/demoTip은 `.optional()`.

#### STEP 2 — `qa-meta.ts` 64 entry

§6.1.2.1 패턴 그대로. 64 entry 명시 (qa-stubs.ts CHAPTERS 1:1 매핑, ch06_q03 제외):
```ts
{ qaId: 'ch01_q01', chapterId: 1 }, { qaId: 'ch01_q02', chapterId: 1 }, ...
{ qaId: 'ch06_q01', chapterId: 6 }, { qaId: 'ch06_q02', chapterId: 6 }, /* q03 SKIP */ { qaId: 'ch06_q04', chapterId: 6 }, ...
{ qaId: 'ch10_q07', chapterId: 10 },
```

#### STEP 3 — 64 TS 모듈

**ch01_q01 정식 1개** — mockup `mockups/teacher-explain-content-samples.html` 의 ch01_q01 샘플 톤 따르거나 §4.2 가독성 룰 충족하는 자가 생성. 12 필드 모두 채움. tldr 30~50자, misconception 1~2 단락, relatedQas 1~3 entry, prompts 3~5 pair.

**63 placeholder** — Bash for loop 또는 코드 생성으로 일괄. 모든 필드 "준비 중입니다" 1 문장. relatedQas `[]` 또는 `['ch01_q01']` (정합용 single entry). prompts `[{ q: '준비 중입니다', a: '준비 중입니다' }, { q: '준비 중입니다', a: '준비 중입니다' }, { q: '준비 중입니다', a: '준비 중입니다' }]` (3 pair 최소). advanced/demoTip 생략 (optional).

#### STEP 4 — `index.ts`

§7.2.1 패턴:
```ts
import ch01_q01 from './ch01_q01';
// ... 64 import (ch06_q03 제외)
import { teacherExplainBlockSchema } from './types';

const RAW_BLOCKS = { ch01_q01, /* ... */ ch10_q07 };

export const TEACHER_EXPLAIN: Record<string, TeacherExplainBlock> = {};

for (const [qaId, raw] of Object.entries(RAW_BLOCKS)) {
  const result = teacherExplainBlockSchema.safeParse(raw);
  if (result.success) {
    TEACHER_EXPLAIN[qaId] = result.data;
  } else {
    console.error(`[teacher-explain] schema fail for ${qaId}:`, result.error.format());
  }
}

export function getTeacherExplainBlock(qaId: string): TeacherExplainBlock | null {
  return TEACHER_EXPLAIN[qaId] ?? null;
}
```

#### STEP 5 — `routes.ts` 라우트

§6.1.2 7단계 검증 순서 정확 적용:
1. qaId 정규식 — 미준수 = 400 `invalid_qa_id`
2. sessionId UUID — 미준수 = 400 `invalid_session_id`
3. `getRequestUser(req)` — null = 401 `unauthenticated`
4. `getSupabaseAdminClient()` — null = 503 `db_not_configured` / SELECT session — 없으면 404 `session_not_found` / teacher_id 불일치 = 403 `not_session_teacher`
5. `getQaChapterId(qaId)` — null = 404 `qa_not_found` / chapterId ∉ chapter_ids = 403 `qa_not_in_session`
6. `getTeacherExplainBlock(qaId)` — null = 404 `qa_not_found` / placeholder는 200
7. `Cache-Control: no-store` 헤더 + body JSON

기존 `getRequestUser` / `getSupabaseAdminClient` 헬퍼는 server 측 이미 존재 — `server/src/lib/auth.ts` 또는 유사 위치. routes.ts 에 import 후 재사용.

dev 헤더 fallback: `process.env.NODE_ENV === 'development' && req.headers['x-dev-teacher-id']` 그대로 user.id 로 사용.

### §A 절대 금지

- 클라이언트 변경
- DB schema 변경 (sql/ 마이그레이션 X)
- ai.ts / 챗봇 / Anthropic 호출 변경
- main 직접 push, force push
- 64 모듈 외 다른 데이터 변경
- ch06_q03 entry 신설

### §A 검증

1. `cd server && npm run build` 무에러
2. `find server/dist/data/teacher-explain -maxdepth 1 -name '*.js' | wc -l` = 66 (64 + index + types)
3. `cd client && npm run build` 무에러 (회귀 — 변경 0)
4. `grep -c "qaId:" server/src/data/qa-meta.ts` = 64
5. `grep -nE "id: 'ch[0-9]{2}_q[0-9]{2}'" server/src/data/qa-meta.ts | wc -l` = 64
6. dev 모드 server 부팅 — `cd server && npm run dev` 5초 내 정상 listen + 콘솔 에러 0건 (zod schema fail 0)
7. 의도적 schema fail 주입 시 (Generator 가 임시로 ch02_q01.ts 의 tldr 을 number 로 만들었다가 되돌림) — `console.error [teacher-explain] schema fail for ch02_q01` 1줄 + 서버 정상 부팅 (정정 후 commit)
8. 11 curl 케이스 (`§9.1 권한 표`) 자가 검증 — 적어도 6 핵심 (200/400/401/403 not_session/403 qa_not_in/404 qa_not_found) PASS

### §A 완료 시 센티넬

`qa/ao-logs/pr1-r1-gen.status`:
```json
{"status":"done","step":"pr1","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"ao/teacher-explain-pr1","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"server teacher-explain 64 TS 모듈 + qa-meta + routes + safeParse skip + Cache-Control no-store. build PASS, dev server 부팅 OK, schema fail 의도 주입 검증 PASS."}
```

---

## §B. Eval-Visual (Codex)

### PR-1 = 서버 only → 시각 검증 minimal

PR-1 은 server 만 변경. 시각 회귀 spot-check 1건만:
- **VR1**: PR #84 QR 버튼 + Q01Ramen eyebrow "입력·처리·출력 사이클" (PR-0 V3 fix) 회귀 0건 — `/library/1/ch01_q01` 진입 spot-check

### §B 시작 단계

1. `cd /home/claude/architecture && git fetch origin && git checkout ao/teacher-explain-pr1 && git pull --ff-only`
2. **Generator 센티넬 확인**: `cat qa/ao-logs/pr1-r1-gen.status` — `status:done` + `commit:<SHA>` 검증
3. **별도 브랜치 작업**: `git checkout -b codex/eval-visual-pr1-r1` (sentinel 만 push)

### §B 검증 V1

| # | 항목 | 대상 |
|---|------|------|
| V1 | `cd server && dist/data/teacher-explain` 디렉토리 존재 + `.js` 파일 66개 + `index.js` import 검증 (서버 빌드 결과물 grep) | 코드 grep |
| VR1 | `/library/1/ch01_q01` PreviewPanel 회귀 — QR 버튼 + Q01Ramen eyebrow "입력·처리·출력 사이클" 노출 | 데스크탑 1440×900 spot-check 1건 |

### §B 완료 시 센티넬

`qa/ao-logs/pr1-r1-eval-visual.status` + `qa-eval/pr1-eval-visual-round1.json`:
```json
{"status":"done","step":"pr1","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","gen_commit":"<SHA>","results":[{"id":"V1","verdict":"PASS","note":""}, ...]}
```

---

## §C. Eval-Interaction (Codex)

### §C 시작 단계

1. `cd /home/claude/architecture && git fetch origin && git checkout ao/teacher-explain-pr1 && git pull --ff-only`
2. **Generator 센티넬 확인** — `qa/ao-logs/pr1-r1-gen.status`
3. **별도 브랜치 작업**: `git checkout -b codex/eval-interaction-pr1-r1`

### §C 검증 I1~I12 — §9.1 Sprint Contract 매핑

| # | 항목 |
|---|------|
| I1 | `cd server && npm run build` 무에러 |
| I2 | `find server/dist/data/teacher-explain -maxdepth 1 -name '*.js' \| wc -l` = 66 |
| I3 | `cd client && npm run build` 무에러 (회귀) |
| I4 | dev server 부팅 5초 내 + console error 0건 (zod schema fail 0 = 정상 64 모듈 통과) |
| I5 | curl `GET /api/teacher-explain/ch01_q01?sessionId={teacher_session}` 200 + `Cache-Control: no-store` 헤더 + JSON body 12 필드 |
| I6 | curl `GET /api/teacher-explain/ch01_q01` (sessionId 누락) → 400 `invalid_session_id` |
| I7 | curl `GET /api/teacher-explain/ch01_q01?sessionId={uuid}` (Authorization 헤더 없음) → 401 `unauthenticated` |
| I8 | curl `GET /api/teacher-explain/ch01_q01?sessionId={다른_교사_session}` → 403 `not_session_teacher` |
| I9 | curl `GET /api/teacher-explain/ch99_q01?sessionId={teacher_session}` → 400 또는 404 (qaId 형식 또는 qa_not_found) |
| I10 | curl `GET /api/teacher-explain/ch10_q07?sessionId={teacher_session_with_only_ch01}` → 403 `qa_not_in_session` |
| I11 | **schema fail 의도 주입** — 임시로 `ch02_q01.ts` 의 `tldr` 을 number 로 변경 → server 재시작 → console.error 1줄 + 서버 정상 부팅 + `GET /api/teacher-explain/ch02_q01?sessionId=...` → 404 `qa_not_found` (해당 qaId 만) + 다른 qaId 200 (정정 후 commit 되돌림) |
| I12 | Supabase env 미설정 환경 시뮬 — `SUPABASE_URL` 빈값 + server 재시작 → `GET /api/teacher-explain/ch01_q01?sessionId=...` → 503 `db_not_configured` (env 정정 후 되돌림) |

### §C 절대 금지

- 코드 수정 (Eval session 강제 명령)
- 본 데이터 수정

### §C 완료 시 센티넬

`qa/ao-logs/pr1-r1-eval-interaction.status` + `qa-eval/pr1-eval-interaction-round1.json`.

---

## 2. Master verdict 수령 절차

| 시나리오 | Master 행동 |
|---------|------------|
| 3/3 PASS | `gh pr create --base ao/teacher-explain-pr0 --head ao/teacher-explain-pr1` (stacked PR) |
| 1+ REVISE/FAIL | 차이 분석 → master 직접 fix (1~3줄 패치) 우선, 큰 변경 시 round 2 codex |
| sentinel SHA mismatch | stale 의심 — sentinel 삭제 + 재spawn |

---

## 3. PR-0 학습 반영

| 학습 | PR-1 적용 |
|------|---------|
| eval-interaction sentinel write hang (codex/arch-156) | master 가 eval JSON 직접 읽고 sentinel 작성 가능 — 우회 패턴 박제 |
| master worktree HEAD가 codex eval branch로 이동되는 사고 | master 작업 전 `git branch --show-current` 확인 강제 |
| Eval-Visual REVISE 의 일부는 HANDOFF 결함 (없는 경로 검증 요구) | PR-1 §B는 minimal 1건만 — false REVISE 회피 |

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. teacher-explain v1 SDD 7-PR 직렬 2/7. 사용자 머지 다음 날 일괄 — stacked PR 패턴 |
