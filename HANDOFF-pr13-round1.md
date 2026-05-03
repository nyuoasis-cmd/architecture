# HANDOFF-pr13-round1 — AO 표준 진입점 래퍼

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-13 — ch02 4 데모 (`q01~q04`) React 인라인 변환 (메타포 ↔ IT 라벨 매핑)
> **base**: `main` (PR #29~33 머지 후 `91e11a5`)
> **작업 브랜치**: `feat/preview-inline-ch02`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §4.2 + §6 + §7)
> **에픽 위치**: 챕터 프레임 통일 에픽 1/18 (PR-13 ~ PR-22)
> **스코프 경고**: 본 PR-13은 ch02만 적용. ch03~ch10 후속 PR. iframe fallback 분기 제거는 PR-22 cleanup.

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr13 |
| round | 1 |
| branch | feat/preview-inline-ch02 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** (사유: SVG 아이콘 다량 추가 + Pair Block 4 변형 적용 + 토큰 정밀 매핑) |
| **eval-visual model override** | **codex** (사유: 시각/인터랙션 둘 다 Codex 단독 운영, GLM 폐지 — feedback_4phase-evaluator-codex-only.md) |
| **eval-interaction model override** | **codex** (사유: 비동기·a11y·인터랙션 코드 검증 표준) |

---

## 1. 본 래퍼의 위임 구조

본 파일은 AO 표준 `run.sh` 진입점을 위해 만든 얇은 래퍼다. 실제 작업 명세는 역할별 4개 파일에 분리되어 있다.

| Phase | 역할 | 모델 | 명세 파일 (본 래퍼가 위임) | 센티넬 |
|---|---|---|---|---|
| 1 | Planner (완료) | Master | `HANDOFF-pr13-planner-spec.md` | (없음) |
| A | Generator | Codex | `HANDOFF-pr13-generator.md` | `qa/ao-logs/pr13-r1-gen.status` |
| B | Eval-Visual | Codex | `HANDOFF-pr13-eval-visual.md` | `qa/ao-logs/pr13-r1-eval-visual.status` |
| C | Eval-Interaction | Codex | `HANDOFF-pr13-eval-interaction.md` | `qa/ao-logs/pr13-r1-eval-interaction.status` |

**모든 Phase 가 작업 시작 전 다음 두 파일을 반드시 읽는다:**
1. 본 파일 (메타 + 위임 구조 + 공통 규약)
2. 해당 역할의 상세 명세 파일 (`HANDOFF-pr13-{role}.md`)

---

## §A. Generator (Codex)

**상세 명세**: `/home/claude/architecture/HANDOFF-pr13-generator.md`

이 §A는 위 파일의 모든 STEP 1~N 작업 순서를 그대로 따른다. 시작 단계는 아래 절대 규약을 우선 준수한다.

### §A 시작 단계 (절대 준수)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch02`
3. `git checkout feat/preview-inline-ch02` (이미 있으면 이걸로, 없으면 `git checkout -B feat/preview-inline-ch02 origin/feat/preview-inline-ch02`)
4. 모든 commit 은 `feat/preview-inline-ch02` 위에 직접 만든다. **별도 브랜치 생성 금지** (codex/, feat/sub-, chore/ 등 prefix 사용 금지 — 본 작업은 통합 PR head=feat/preview-inline-ch02 가 이미 존재할 예정이므로 신규 PR 생성 시 통합 정책 위반)
5. push: `git push origin feat/preview-inline-ch02` (force 금지)
6. **PR 생성 안 함** — Master 가 모든 verdict PASS 후 일괄 PR 생성

### §A 절대 금지

- ch01, ch03~ch10 콘텐츠 수정 (스코프 외)
- `_shared/*` 공용 계약 변경 (PR-12 잠금)
- iframe fallback 분기 제거 (PR-22 cleanup 영역)
- DESIGN-POLICY §9.B-3 raw hex (디자인 토큰 사용)
- master 브랜치 직접 push, force push, no-verify commit

### §A 완료 시 센티넬 작성

파일: `qa/ao-logs/pr13-r1-gen.status`
형식: 한 줄 JSON (스키마: `qa/ao-logs/SENTINEL-SPEC.md`)

```json
{"status":"done","step":"pr13","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch02","commit":"<SHA>","pr":"pending-master","loc":"+X -Y (요약)","note":"ch02 4 demos 인라인 + 메타포 16 + IT 16 + 클라우드 4 SVG 아이콘 추가. C9 grep 0건 확인."}
```

`branch` 필드가 `feat/preview-inline-ch02` 가 아니면 Master 가 verdict 무시하고 재spawn한다.

---

## §B. Eval-Visual (Codex)

**상세 명세**: `/home/claude/architecture/HANDOFF-pr13-eval-visual.md`

이 §B는 위 파일의 V1~V9 시각 체크 + viewport (1440·393) + WCAG AA 대비비 + ch01 baseline 일관성 + REVISE/FAIL 기준을 그대로 따른다.

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch02`
3. `git checkout feat/preview-inline-ch02` (이 평가는 claim-pr 또는 일반 checkout 어느 쪽이든 가능. 단, **Generator commit SHA** 와 일치해야 함. `git rev-parse HEAD` 로 확인 후 센티넬에 기록)
4. `cd client && npm install --no-audit --no-fund && npm run dev` — localhost:5176 띄움 (4-Phase Eval-Visual 환경 준비 표준)
5. **코드 수정 절대 금지** — 발견된 위반은 verdict 와 fail_items/revise_items 로만 보고

### §B 결과물

- 평가 보고: `qa-eval/pr13-eval-visual-round1.json` (선택)
- 센티넬: `qa/ao-logs/pr13-r1-eval-visual.status`

```json
{"status":"done","step":"pr13","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA — Gen 센티넬과 동일해야 함>","branch":"feat/preview-inline-ch02","fail_items":[],"revise_items":[]}
```

---

## §C. Eval-Interaction (Codex)

**상세 명세**: `/home/claude/architecture/HANDOFF-pr13-eval-interaction.md`

이 §C는 위 파일의 I1~I8 자동/정적 grep + 동작 검증 + Sprint Contract 자동 검증 명령 + 라벨 길이 + import 경로 강제를 그대로 따른다.

### §C 시작 단계 (B와의 worktree 충돌 회피)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch02`
3. **detached HEAD 로 체크아웃**: `git checkout --detach origin/feat/preview-inline-ch02` (Phase B 가 같은 브랜치를 worktree 로 잡고 있을 수 있으므로 detached 권장)
4. `git rev-parse HEAD` 로 commit SHA 확인 — 센티넬 `commit` 필드에 동일 SHA 기록
5. `cd client && npm install --no-audit --no-fund` — 신규 deps 없을 가능성 높지만 안전 보강
6. **코드 수정 절대 금지**

### §C 결과물

- 평가 보고: `qa-eval/pr13-eval-interaction-round1.json` (선택)
- 센티넬: `qa/ao-logs/pr13-r1-eval-interaction.status`

```json
{"status":"done","step":"pr13","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch02","fail_items":[],"revise_items":[]}
```

---

## 2. 공통 안전망 (PR-12 학습)

| 위험 | 회피 |
|---|---|
| ch01 baseline drift | Eval-Visual 이 ch01 4 데모 spot-check 1건 (PR #29~32 베이스 깨지지 않은지) |
| 라벨 길이 한글 8자 / 영문 16자 초과 | Eval-Interaction §1.4 라벨 길이 검증 |
| 모바일 393px 줄바꿈 3줄+ | Eval-Visual V8 모바일 줄바꿈 |
| `_shared/*` 무단 수정 | Eval-Interaction grep `git diff main..feat/preview-inline-ch02 -- client/src/demos/_shared/icons` 추가만 (제거·기존 수정 금지) |
| Codex 토큰 카운트 false positive | feedback_codex-evaluator-patterns.md — 토큰 미사용 보고 시 Master 가 실측 정정 |

---

## 3. Master verdict 수령 절차

1. 3 센티넬 모두 PASS → Master 가 PR 생성: `gh pr create --base main --head feat/preview-inline-ch02 --title "feat(preview): ch02 4 데모 인라인 변환 + 36 신규 SVG 아이콘 (PR-13)" --body "<요약>"`
2. 1개라도 REVISE → fail_items + revise_items 분석 → round 2 핸드오프 갱신 → 재spawn (사용자에게 묻지 않음. no-stop 정책)
3. 1개라도 FAIL → 즉시 분석 + 사용자 보고
4. `commit` 필드 불일치 (Eval 이 다른 브랜치 평가) → verdict 무시 + 재spawn

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-03 | 초기 작성. PR-12 round1 패턴 복제. ch02 4 데모 인라인 변환 4역할 위임 래퍼 |
