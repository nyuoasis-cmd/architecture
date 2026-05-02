# HANDOFF-pr12-round1 — AO 표준 진입점 래퍼

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-12 — preview inline 공용 API surface 잠금 (`_shared/*` 분할 + Pair Block 4 변형 + design-tokens.css + LABEL_RULES + Showcase + ch01 토큰화)
> **base**: `main` (PR #28 머지 후 `d39599d`)
> **작업 브랜치**: `feat/preview-inline-shared-contract`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2)
> **스코프 경고 (사용자 인지 필수)**: 본 PR-12는 ch01만 적용. ch02~ch10 콘텐츠 마이그레이션은 PR-13~21 후속, iframe fallback 분기 제거는 PR-22 cleanup. 한 번에 전체 적용 아님.

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr12 |
| round | 1 |
| branch | feat/preview-inline-shared-contract |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** (사유: 대량 LOC 리팩토링 + 정교한 타입) |
| **eval-visual model override** | **codex** (사유: 시각/인터랙션 둘 다 Codex 단독 운영, GLM 폐지 — feedback_4phase-evaluator-codex-only.md) |
| **eval-interaction model override** | **codex** (사유: 비동기·a11y·인터랙션 코드 검증 표준) |

---

## 1. 본 래퍼의 위임 구조

본 파일은 AO 표준 `run.sh` 진입점을 위해 만든 얇은 래퍼다. 실제 작업 명세는 역할별 4개 파일에 분리되어 있다.

| Phase | 역할 | 모델 | 명세 파일 (본 래퍼가 위임) | 센티넬 |
|---|---|---|---|---|
| 1 | Planner (완료) | Master | `HANDOFF-pr12-planner-spec.md` | (없음) |
| A | Generator | Codex | `HANDOFF-pr12-generator.md` | `qa/ao-logs/pr12-r1-gen.status` |
| B | Eval-Visual | Codex | `HANDOFF-pr12-eval-visual.md` | `qa/ao-logs/pr12-r1-eval-visual.status` |
| C | Eval-Interaction | Codex | `HANDOFF-pr12-eval-interaction.md` | `qa/ao-logs/pr12-r1-eval-interaction.status` |

**모든 Phase 가 작업 시작 전 다음 두 파일을 반드시 읽는다:**
1. 본 파일 (메타 + 위임 구조 + 공통 규약)
2. 해당 역할의 상세 명세 파일 (`HANDOFF-pr12-{role}.md`)

---

## §A. Generator (Codex)

**상세 명세**: `/home/claude/architecture/HANDOFF-pr12-generator.md`

이 §A는 위 파일의 모든 내용을 그대로 따른다. 시작 단계는 아래 절대 규약을 우선 준수한 뒤 상세 명세의 12 STEP 작업 순서로 진행한다.

### §A 시작 단계 (절대 준수)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-shared-contract`
3. `git checkout feat/preview-inline-shared-contract` (이미 있으면 이걸로, 없으면 `git checkout -B feat/preview-inline-shared-contract origin/feat/preview-inline-shared-contract`)
4. 모든 commit 은 `feat/preview-inline-shared-contract` 위에 직접 만든다. **별도 브랜치 생성 금지** (codex/, feat/sub-, chore/ 등 prefix 사용 금지 — 본 작업은 통합 PR head=feat/preview-inline-shared-contract 가 이미 존재할 예정이므로 신규 PR 생성 시 통합 정책 위반)
5. push: `git push origin feat/preview-inline-shared-contract` (force 금지)
6. **PR 생성 안 함** — Master 가 모든 verdict PASS 후 일괄 PR 생성

### §A 절대 금지

- ch02~ch10 콘텐츠 수정 (스코프 외)
- iframe fallback 분기 제거 (PR-22 cleanup 영역)
- DESIGN-POLICY §9.B-3 raw hex (단, `client/src/demos/_shared/design-tokens.css` 에서 `--demo-*` 변수 정의는 예외)
- master 브랜치 직접 push, force push, no-verify commit

### §A 완료 시 센티넬 작성

파일: `qa/ao-logs/pr12-r1-gen.status`
형식: 한 줄 JSON (스키마: `qa/ao-logs/SENTINEL-SPEC.md`)

```json
{"status":"done","step":"pr12","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-shared-contract","commit":"<SHA>","pr":"pending-master","loc":"+X -Y (요약)","note":"55 CSS 변수 + 4 Pair 변형 + LABEL_RULES + ch01 4 토큰화 + Showcase 라우트 완료. C9 grep 0건 확인."}
```

`branch` 필드가 `feat/preview-inline-shared-contract` 가 아니면 Master 가 verdict 무시하고 재spawn한다.

---

## §B. Eval-Visual (Codex)

**상세 명세**: `/home/claude/architecture/HANDOFF-pr12-eval-visual.md`

이 §B는 위 파일의 V1~V8 시각 체크 + viewport (1440·393) + WCAG AA 대비비 + fallback 보존 + REVISE/FAIL 기준을 그대로 따른다.

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-shared-contract`
3. `git checkout feat/preview-inline-shared-contract` (이 평가는 claim-pr 또는 일반 checkout 어느 쪽이든 가능. 단, **Generator commit SHA** 와 일치해야 함. `git rev-parse HEAD` 로 확인 후 센티넬에 기록)
4. **코드 수정 절대 금지** — 발견된 위반은 verdict 와 fail_items/revise_items 로만 보고

### §B 결과물

- 평가 보고: `qa-eval/pr12-eval-visual-round1.json` (커밋 + push 가능. 단, 본 평가가 코드 변경 없이 보고만이라면 push 시 skip 가능)
- 센티넬: `qa/ao-logs/pr12-r1-eval-visual.status`

```json
{"status":"done","step":"pr12","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA — Gen 센티넬과 동일해야 함>","branch":"feat/preview-inline-shared-contract","fail_items":[],"revise_items":[]}
```

---

## §C. Eval-Interaction (Codex)

**상세 명세**: `/home/claude/architecture/HANDOFF-pr12-eval-interaction.md`

이 §C는 위 파일의 I1~I8 정적 grep + 동작 검증 + Sprint Contract 자동 검증 명령 + validateLabel 6 케이스 throw 검증 + import 경로 강제를 그대로 따른다.

### §C 시작 단계 (B와의 worktree 충돌 회피)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-shared-contract`
3. **detached HEAD 로 체크아웃**: `git checkout --detach origin/feat/preview-inline-shared-contract` (Phase B 가 같은 브랜치를 worktree 로 잡고 있을 수 있으므로 detached 권장)
4. `git rev-parse HEAD` 로 commit SHA 확인 — 센티넬 `commit` 필드에 동일 SHA 기록
5. **코드 수정 절대 금지**

### §C 결과물

- 평가 보고: `qa-eval/pr12-eval-interaction-round1.json` (선택)
- 센티넬: `qa/ao-logs/pr12-r1-eval-interaction.status`

```json
{"status":"done","step":"pr12","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-shared-contract","fail_items":[],"revise_items":[]}
```

---

## 2. 공통 안전망 (Preflight WARN 4건 반영)

| WARN | 이슈 | 회피 |
|---|---|---|
| W1 | `STAGE=audit` default 라 raw hex 가 CI 차단 안 됨 | C9: `grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos --include="*.tsx" --include="*.ts"` 가 빈 결과 (Generator 자체 검증 + Eval-Interaction 재검증) |
| W2 | ch01 raw hex 43건 (ch01/Q01~Q04.tsx) | design-tokens.css 에 보조 토큰 ~17개 명시 (Generator 핸드오프 §A.4 참조) |
| W3 | 픽셀 동등성 (PR #28 vs 토큰화 후) | 토큰 hex 값을 PR #28 의 inline hex 와 완전 동일 유지 |
| W4 | 모바일 393px overflow | IconCard 에 `min-w-0 break-words` 강제 |

---

## 3. Master verdict 수령 절차

1. 3 센티넬 모두 PASS → Master 가 PR 생성: `gh pr create --base main --head feat/preview-inline-shared-contract --title "feat(preview): _shared/* 공용 계약 잠금 + ch01 토큰화 (PR-12)" --body "<요약>"`
2. 1개라도 REVISE → fail_items + revise_items 분석 → round 2 핸드오프 갱신 → 재spawn (사용자에게 묻지 않음. no-stop 정책)
3. 1개라도 FAIL → 즉시 분석 + 사용자 보고
4. `commit` 필드 불일치 (Eval 이 다른 브랜치 평가) → verdict 무시 + 재spawn

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-02 | 초기 작성. 4 역할별 핸드오프 위임 래퍼. AO 표준 v1 (run.sh) 진입점 |
