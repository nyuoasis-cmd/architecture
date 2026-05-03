# HANDOFF-pr14b-round1 — ch03 q05~q07 인라인 변환

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-14b — ch03 3 데모 (`q05~q07`) React 인라인 변환 (개발 사이클 · green-600 톤 — ch03 마무리)
> **base**: `main` (`21acdbb` PR-14a 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch03-q5-q7` (main 기준 분기)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §4.2 ch03)
> **참조 패턴**: `client/src/demos/ch03/Q01Test.tsx`~`Q04Deploy.tsx` (PR-14a 베이스라인 — 동일 톤)
> **에픽 위치**: 챕터 프레임 통일 에픽 3/18 (PR-13 ✅ → PR-14a ✅ → **PR-14b** → PR-15a → ... → PR-22)

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr14b |
| round | 1 |
| branch | feat/preview-inline-ch03-q5-q7 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | **codex** |
| **eval-interaction model override** | **codex** |

---

## 1. ch03 q05~q07 매핑 (SDD v2.2 §4.2 — 잠금됨)

| qaId | 메타포 라벨 (4개) | IT 라벨 (4개) | sub | 형태 | layout |
|---|---|---|---|---|---|
| ch03_q05 | 비상 / 새 무대 / 시범 / 결정 | 즉시 롤백 / 블루그린 / 카나리 / 전략 | 사용 | **C Match** (PairMatch) | wide |
| ch03_q06 | 흐름 / 지연 / 오류 / 알림 | 요청 수 / 지연 / 에러율 / 알림 | 사용 | **C Match** (PairMatch) | wide |
| ch03_q07 | 제출 / 코멘트 / 수정 / 승인 | PR / 코멘트 / 수정 / 머지 | 사용 | **A Flow** (PairFlow) | wide |

**챕터 톤**: `getTone(3)` = green-600 (PR-14a 와 동일)

---

## §A. Generator (Codex)

### §A 시작 단계 (절대 준수)

1. `cd /home/claude/architecture`
2. `git fetch origin main && git checkout main && git pull --ff-only`
3. `git log --oneline -1` 확인 (`21acdbb feat(preview): ch03 q01~q04 인라인 변환 + URL hash sync (PR-14a)` 이후)
4. `git checkout -b feat/preview-inline-ch03-q5-q7` (없으면) 또는 `git checkout feat/preview-inline-ch03-q5-q7` (있으면)
5. 모든 commit 은 본 브랜치 위에 직접 만든다. **별도 브랜치 생성 금지** (Eval 평가 보고용 codex/* branch 는 §B/§C 별도 허용)
6. `git push -u origin feat/preview-inline-ch03-q5-q7` (force 금지)
7. **PR 생성 안 함** — Master 가 모든 verdict PASS 후 일괄 PR 생성

### §A 작업 단계

#### STEP 1 — 신규 SVG 아이콘 (`_shared/icons/`)

**규격**: SVG 24×24 viewBox, stroke="currentColor" strokeWidth={1.5}, fill="none". PR-14a (PR-13) 와 동일 패턴.

**`metaphor.tsx`** — 메타포 측 신규 (기존 아이콘과 충돌 회피):
```
비상 (EmergencyIcon) / 새 무대 (NewStageIcon) / 시범 (DemoIcon — Stage 와 별도 시범 의미) / 결정 (DecisionIcon)
흐름 (FlowIcon) / 지연 (DelayIcon) / 오류 (ErrorIcon) / 알림 (NotificationIcon)
제출 (SubmitIcon) / 코멘트 (CommentIcon) / 수정 (EditIcon) / 승인 (ApproveIcon)
```

**`computer.tsx`** — IT 측 신규:
```
즉시 롤백 (RollbackIcon) / 블루그린 (BlueGreenIcon) / 카나리 (CanaryIcon) / 전략 (StrategyIcon)
요청 수 (RequestCountIcon) / 지연 (LatencyIcon) / 에러율 (ErrorRateIcon) / 알림 (AlertIcon)
PR (PullRequestIcon) / 코멘트 (CodeCommentIcon — metaphor 와 충돌 시) / 수정 (CodeEditIcon — 충돌 시) / 머지 (MergeIcon)
```

> **충돌 회피**: 기존 PR-13/PR-14a 의 InstallIcon (metaphor) ↔ ItInstallIcon (IT) 패턴 그대로. 같은 한국어/영문 라벨이 metaphor·IT 양쪽에 등장하면 IT 측은 별도 컨셉 이름.
>
> **재사용 가능 후보**: PR-14a 에 존재하는 아이콘 (예: ReportIcon, TestIcon 등) 중 라벨이 동일하다면 재사용. Codex 자율 판단.

#### STEP 2 — `client/src/demos/ch03/Q05Rollback.tsx` (PairMatch wide)

ch01 `Q03Restaurant.tsx` 또는 ch03 `Q01Test.tsx` (PR-14a) 패턴 복붙 후 데이터 교체:

```ts
metaphorTitle: '비상 대응 단계'  (또는 자유 판단)
itTitle: '롤백 전략'
metaphor: [
  { icon: <Icons.EmergencyIcon />, label: '비상',     sub: '사용' },
  { icon: <Icons.NewStageIcon />,  label: '새 무대',  sub: '사용' },
  { icon: <Icons.DemoIcon />,      label: '시범',     sub: '사용' },
  { icon: <Icons.DecisionIcon />,  label: '결정',     sub: '사용' },
]
it: [
  { icon: <Icons.RollbackIcon />,  label: '즉시 롤백', sub: '사용' },
  { icon: <Icons.BlueGreenIcon />, label: '블루그린',  sub: '사용' },
  { icon: <Icons.CanaryIcon />,    label: '카나리',    sub: '사용' },
  { icon: <Icons.StrategyIcon />,  label: '전략',      sub: '사용' },
]
tone: getTone(3)
```

SCENES 4개 (활성 인덱스 0~3 슬라이딩). 시나리오 ID 자유 명명 (예: `rollback/bluegreen/canary/strategy`).

#### STEP 3 — `Q06Monitor.tsx` (PairMatch wide)

```ts
metaphorTitle: '관찰 신호 4 종'  (자유)
itTitle: '관측 4 골든 시그널'
metaphor: [
  { icon: <Icons.FlowIcon />,         label: '흐름',  sub: '사용' },
  { icon: <Icons.DelayIcon />,        label: '지연',  sub: '사용' },
  { icon: <Icons.ErrorIcon />,        label: '오류',  sub: '사용' },
  { icon: <Icons.NotificationIcon />, label: '알림',  sub: '사용' },
]
it: [
  { icon: <Icons.RequestCountIcon />, label: '요청 수', sub: '사용' },
  { icon: <Icons.LatencyIcon />,      label: '지연',    sub: '사용' },
  { icon: <Icons.ErrorRateIcon />,    label: '에러율',  sub: '사용' },
  { icon: <Icons.AlertIcon />,        label: '알림',    sub: '사용' },
]
tone: getTone(3)
```

#### STEP 4 — `Q07CodeReview.tsx` (PairFlow wide)

```ts
metaphorTitle: '결재 흐름'  (자유)
itTitle: '코드 리뷰 흐름'
metaphor: [
  { icon: <Icons.SubmitIcon />,  label: '제출',   sub: '사용' },
  { icon: <Icons.CommentIcon />, label: '코멘트', sub: '사용' },
  { icon: <Icons.EditIcon />,    label: '수정',   sub: '사용' },
  { icon: <Icons.ApproveIcon />, label: '승인',   sub: '사용' },
]
it: [
  { icon: <Icons.PullRequestIcon />, label: 'PR',     sub: '사용' },
  { icon: <Icons.CodeCommentIcon />, label: '코멘트', sub: '사용' },  // 또는 CommentIcon 공유
  { icon: <Icons.CodeEditIcon />,    label: '수정',   sub: '사용' },  // 또는 EditIcon 공유
  { icon: <Icons.MergeIcon />,       label: '머지',   sub: '사용' },
]
tone: getTone(3)
```

#### STEP 5 — `client/src/demos/registry.ts` 에 ch03 q05~q07 라우트 등록

PR-14a ch03 q01~q04 등록 패턴 그대로. 3 entries 추가:
```ts
{ qaId: 'ch03_q05', module: () => import('./ch03/Q05Rollback') },
{ qaId: 'ch03_q06', module: () => import('./ch03/Q06Monitor') },
{ qaId: 'ch03_q07', module: () => import('./ch03/Q07CodeReview') },
```

> 정확한 entry 형식은 기존 `registry.ts` 의 ch03_q01~q04 entries 그대로 따름.

### §A 절대 금지

- ch01, ch02, ch03_q01~q04, ch04~ch10 콘텐츠 수정 (스코프 외)
- `_shared/*` 공용 계약 변경 (PR-12 잠금 — props/exports/types 무변경. 단 `_shared/icons/{metaphor,computer}.tsx` 에 신규 SVG 함수 추가는 허용)
- `_shared/pair-block.tsx`, `_shared/design-tokens.css`, `PreviewPanel.tsx` 변경 (PR-12·PR-13·PR-14a 잠금)
- iframe fallback 분기 제거 (PR-22 cleanup 영역)
- DESIGN-POLICY §9.B-3 raw hex (디자인 토큰 사용)
- master/main 브랜치 직접 push, force push, no-verify commit

### §A 검증 (자체 보고 의무)

1. `cd client && npm run build` 무에러
2. dev 모드 (`npm run dev`) 에서 `/library/3/ch03_q05` ~ `q07` 3개 라우트 접근 가능
3. 3 데모 모두 green-600 accent (PR-14a 와 동일 톤) 표시 확인
4. raw hex grep 0건: `grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos/ch03 --include="*.tsx"`
5. `_shared` 외 import 0건: `grep -E "from ['\"]\.\.?/_shared/[^i]" client/src/demos/ch03/*.tsx`

### §A 완료 시 센티넬

파일: `qa/ao-logs/pr14b-r1-gen.status`

```json
{"status":"done","step":"pr14b","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch03-q5-q7","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"ch03 q05~q07 3 demos 인라인 + 메타포/IT 신규 SVG ~20 + registry 3 라우트 등록. green-600 톤 (PR-14a 베이스 동일)."}
```

---

## §B. Eval-Visual (Codex)

PR-14a round 2 Eval-Visual 그대로. **viewport 1440×900 (desktop) + 393×852 (mobile) 양쪽 모두 V1~V9**:

- V1 frame inline / V2 desktop 3단 / V3 active 동기화 / V4 contrast / V5 width / V6 SVG / V7 baseline / V8 mobile first-viewport / V9 mobile grid

ch03_q05~q07 3 데모만 검증 + ch03 q01~q04 회귀 spot-check 1건.

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch03-q5-q7`
3. `git checkout feat/preview-inline-ch03-q5-q7`
4. `git rev-parse HEAD` 가 Generator 센티넬 SHA 와 일치 확인
5. `cd client && npm install --no-audit --no-fund && npm run dev`
6. **코드 수정 절대 금지**

### §B 결과물

- 평가 보고: `qa-eval/pr14b-eval-visual-round1.json` (커밋 + push 권장)
- 센티넬: `qa/ao-logs/pr14b-r1-eval-visual.status`

```json
{"status":"done","step":"pr14b","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch03-q5-q7","fail_items":[],"revise_items":[]}
```

---

## §C. Eval-Interaction (Codex)

PR-14a round 2 Eval-Interaction 그대로. I1~I8 정적 + 동작 검증.

### §C 시작 단계 (B 와의 worktree 충돌 회피)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch03-q5-q7`
3. `git checkout --detach origin/feat/preview-inline-ch03-q5-q7`
4. `git rev-parse HEAD` 로 SHA 확인
5. `cd client && npm install --no-audit --no-fund`
6. **코드 수정 절대 금지**

### §C 검증

- I1 build / I2 raw hex 0건 / I3 `_shared` 외 import 0건 / I4 라벨 길이 / I5 active 동기 / I6 validatePairSet / **I7 URL hash sync (PR-14a 인프라)** / I8 콘텐츠 1:1
- **추가**: ch03 q01~q04 무회귀 — `git diff main..HEAD -- client/src/demos/ch03/Q01Test.tsx client/src/demos/ch03/Q02TddCycle.tsx client/src/demos/ch03/Q03CiCd.tsx client/src/demos/ch03/Q04Deploy.tsx` 빈 결과 (q01~q04 변경 0)
- **추가**: `_shared` + `PreviewPanel.tsx` 무변경 — `git diff main..HEAD -- client/src/demos/_shared/{pair-block.tsx,index.ts,labels.ts,design-tokens.css,types.ts} client/src/components/learn/PreviewPanel.tsx` 빈 결과

> ⚠️ **eval branch push 강제** (PR-14a 의 round 1 arch-70 사례): 평가 JSON 을 별도 브랜치 `codex/pr14b-r1-eval-{visual|interaction}` 에 작성하면 즉시 `git push origin <branch>` 강제 push (force 금지). Master 가 회수 가능하도록.

### §C 결과물

- 평가 보고: `qa-eval/pr14b-eval-interaction-round1.json` (커밋 + push 권장)
- 센티넬: `qa/ao-logs/pr14b-r1-eval-interaction.status`

```json
{"status":"done","step":"pr14b","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch03-q5-q7","fail_items":[],"revise_items":[]}
```

---

## 2. Master verdict 수령 절차

1. 3 센티넬 모두 PASS → Master 가 PR 생성: `gh pr create --base main --head feat/preview-inline-ch03-q5-q7 --title "feat(preview): ch03 q05~q07 인라인 변환 (PR-14b)"`
2. 1개라도 REVISE/FAIL → fail_items + revise_items 분석 → round 2 (no-stop, ALL PASS 까지)
3. `commit` 필드 불일치 → verdict 무시 + 재spawn

---

## 3. PR-14a 학습 반영

| 학습 | 본 PR-14b 적용 |
|---|---|
| URL hash sync (PR-14a round 2 fix) | `PreviewPanel.tsx::handleScenarioHash` 인라인 path `window.history.replaceState` 추가됨 — 자동 수혜. round 1 PASS 예상 |
| Codex Eval branch push 미완료 (arch-70) | §C 에 push 강제 명시 |
| 모바일 grid + first-viewport (PR-13) | pair-block.tsx + PreviewPanel.tsx 인프라 자동 수혜 |

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-03 | 초기 작성. PR-14a 머지 직후 ch03 q05~q07 진입. ch03 챕터 마무리 |
