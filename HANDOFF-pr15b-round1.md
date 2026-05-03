# HANDOFF-pr15b-round1 — ch04 q05~q07 인라인 변환 (데이터 도메인 마무리)

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-15b — ch04 3 데모 (`q05~q07`) React 인라인 변환 (데이터 · amber-700 톤 — ch04 마무리)
> **base**: `main` (`396de23` PR-15a 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch04-q5-q7` (이미 origin push 완료)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §4.2 ch04)
> **참조 패턴**: `client/src/demos/ch04/Q03DataDup.tsx` (PairFlow wide), `client/src/demos/ch04/Q02DataFormat.tsx` (PairMatch wide), `client/src/demos/ch03/Q01Test.tsx`
> **에픽 위치**: 챕터 프레임 통일 에픽 5/18 (PR-13 ✅ → PR-14a ✅ → PR-14b ✅ → PR-15a ✅ → **PR-15b** → PR-16a → ... → PR-22)

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr15b |
| round | 1 |
| branch | feat/preview-inline-ch04-q5-q7 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | **codex** |
| **eval-interaction model override** | **codex** |

---

## 1. ch04 q05~q07 매핑 (SDD v2.2 §4.2 — 잠금됨)

| qaId | 메타포 라벨 (4개) | IT 라벨 (4개) | sub | 형태 | layout |
|---|---|---|---|---|---|
| ch04_q05 | 전부 / 규칙 / 차단 / 보존 | 원자성 / 일관성 / 고립성 / 지속성 | 사용 | **C Match** (PairMatch) | wide |
| ch04_q06 | 백업 / 손실 / 복구 / 훈련 | 백업 / RPO / RTO / 훈련 | 사용 | **C Match** (PairMatch) | wide |
| ch04_q07 | 질문 / 선택 / 점검 / 절제 | 목표 / 차트 / 축 / 단순화 | 사용 | **A Flow** (PairFlow) | wide |

**챕터 톤**: `getTone(4)` = amber-700 (PR-15a 와 동일 — 같은 챕터)

---

## §A. Generator (Codex)

### §A 시작 단계 (절대 준수)

1. `cd /home/claude/architecture`
2. `git fetch origin main && git checkout main && git pull --ff-only`
3. `git log --oneline -1` 확인 (`396de23 feat(preview): ch04 q01~q04 인라인 변환 (PR-15a)` 이후)
4. `git checkout feat/preview-inline-ch04-q5-q7` (이미 main 기준으로 origin push 됨)
5. 모든 commit 은 본 브랜치 위에 직접 만든다. **별도 브랜치 생성 금지**
6. `git push origin feat/preview-inline-ch04-q5-q7` (force 금지)
7. **PR 생성 안 함** — Master 가 모든 verdict PASS 후 일괄 PR 생성

### §A 작업 단계

#### STEP 1 — 신규 SVG 아이콘 (`_shared/icons/`)

**규격**: SVG 24×24 viewBox, stroke="currentColor" strokeWidth={1.5}, fill="none". PR-14a/14b/15a 와 동일 패턴.

**`metaphor.tsx`** — 메타포 측 신규 (기존 아이콘과 충돌 회피):

```
q05: 전부 (AllIcon) / 규칙 (RuleIcon) / 차단 (BlockMetaIcon — BlockIcon 충돌 시 별명) / 보존 (PreserveIcon)
q06: 백업 (BackupMetaIcon) / 손실 (LossIcon) / 복구 (RecoverIcon) / 훈련 (DrillIcon)
q07: 질문 (QuestionIcon) / 선택 (PickQuestionIcon — PickIcon 충돌 시) / 점검 (CheckAxisIcon) / 절제 (RestraintIcon)
```

**`computer.tsx`** — IT 측 신규:

```
q05: 원자성 (AtomicityIcon) / 일관성 (ConsistencyIcon) / 고립성 (IsolationIcon) / 지속성 (DurabilityIcon)
q06: 백업 (BackupItIcon) / RPO (RpoIcon) / RTO (RtoIcon) / 훈련 (DrillItIcon)
q07: 목표 (GoalIcon) / 차트 (ChartIcon) / 축 (AxisIcon) / 단순화 (SimplifyIcon)
```

> **충돌 회피**: 기존 InstallIcon/ItInstallIcon, BackupMetaIcon/BackupItIcon 패턴 그대로. 같은 한국어/영문 라벨이 metaphor·IT 양쪽에 등장하면 IT 측은 `*ItIcon` suffix 또는 별도 컨셉 이름.
>
> **재사용 가능 후보**: `BackupIcon` (기존?), `BalanceIcon`, `PickIcon`, `BlockIcon` 등 기존 등록된 아이콘과 라벨이 동일하면 재사용. Codex 자율 판단.

#### STEP 2 — `client/src/demos/ch04/Q05Acid.tsx` (PairMatch wide — C)

**참조**: `client/src/demos/ch04/Q02DataFormat.tsx` (직전 PR-15a PairMatch wide), `client/src/demos/ch01/Q03Restaurant.tsx`

```ts
metaphorTitle: '약속 4가지'  (자유 판단)
itTitle: 'ACID 트랜잭션'
metaphor: [
  { icon: <Icons.AllIcon />,       label: '전부', sub: '모두 또는 없음' },
  { icon: <Icons.RuleIcon />,      label: '규칙', sub: '항상 유효' },
  { icon: <Icons.BlockMetaIcon />, label: '차단', sub: '동시 간섭 X' },
  { icon: <Icons.PreserveIcon />,  label: '보존', sub: '결과 유지' },
]
it: [
  { icon: <Icons.AtomicityIcon />,  label: '원자성', sub: 'Atomicity' },
  { icon: <Icons.ConsistencyIcon />,label: '일관성', sub: 'Consistency' },
  { icon: <Icons.IsolationIcon />,  label: '고립성', sub: 'Isolation' },
  { icon: <Icons.DurabilityIcon />, label: '지속성', sub: 'Durability' },
]
tone: getTone(4)  // amber-700
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

SCENES 4개 (활성 인덱스 0~3 슬라이딩). **시나리오 ID 자유 명명, 단 `client/src/data/demos.ts` ch04_q05 entry 의 `scenarios[].id` 와 정확히 일치 필수** (PR-15a round 1 fail 패턴 재발 방지).

#### STEP 3 — `Q06Backup.tsx` (PairMatch wide — C)

**참조**: PR-15a `Q02DataFormat.tsx` 동일 패턴

```ts
metaphorTitle: '재해 대비 4단계'  (자유)
itTitle: '복구 지표'
metaphor: [
  { icon: <Icons.BackupMetaIcon />, label: '백업', sub: '미리 복제' },
  { icon: <Icons.LossIcon />,       label: '손실', sub: '얼마까지' },
  { icon: <Icons.RecoverIcon />,    label: '복구', sub: '얼마나 빨리' },
  { icon: <Icons.DrillIcon />,      label: '훈련', sub: '주기적 검증' },
]
it: [
  { icon: <Icons.BackupItIcon />, label: '백업', sub: '데이터 사본' },
  { icon: <Icons.RpoIcon />,      label: 'RPO',  sub: '허용 손실 시간' },
  { icon: <Icons.RtoIcon />,      label: 'RTO',  sub: '허용 복구 시간' },
  { icon: <Icons.DrillItIcon />,  label: '훈련', sub: 'DR 리허설' },
]
tone: getTone(4)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 4 — `Q07Visualization.tsx` (PairFlow wide — A)

**참조**: PR-15a `Q03DataDup.tsx` 또는 `Q04DataIndex.tsx` (PairFlow wide), ch03 `Q01Test.tsx`

```ts
metaphorTitle: '시각화 사고 흐름'  (자유)
itTitle: '데이터 시각화 흐름'
metaphor: [
  { icon: <Icons.QuestionIcon />,     label: '질문',  sub: '무엇을 알고 싶나' },
  { icon: <Icons.PickQuestionIcon />, label: '선택',  sub: '맞는 차트' },
  { icon: <Icons.CheckAxisIcon />,    label: '점검',  sub: '축·범위' },
  { icon: <Icons.RestraintIcon />,    label: '절제',  sub: '핵심만' },
]
it: [
  { icon: <Icons.GoalIcon />,     label: '목표',   sub: '분석 의도' },
  { icon: <Icons.ChartIcon />,    label: '차트',   sub: '시각 형식' },
  { icon: <Icons.AxisIcon />,     label: '축',     sub: '척도 정합' },
  { icon: <Icons.SimplifyIcon />, label: '단순화', sub: '노이즈 제거' },
]
tone: getTone(4)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 5 — `client/src/data/demos.ts` 에 ch04 q05~q07 entry 신설/검증

> **🚨 PR-15a round 1 fail 재발 방지** — `data/demos.ts` 의 `scenarios[].id` 가 각 컴포넌트의 `SCENES` 키와 **정확히 일치** 해야 함. 작업 마지막 단계에서 grep 으로 매핑 확인 필수.

q05/q06/q07 각각:
```ts
{
  qaId: 'ch04_q05',
  title: '...',
  url: '/demos/ch04/q05.html',
  description: '...',
  scenarios: [
    { id: '<SCENES key 1>', label: '<라벨 1>' },
    { id: '<SCENES key 2>', label: '<라벨 2>' },
    { id: '<SCENES key 3>', label: '<라벨 3>' },
    { id: '<SCENES key 4>', label: '<라벨 4>' },
  ],
},
```

q05/q06/q07 동일 패턴.

#### STEP 6 — `client/src/demos/registry.ts` 에 ch04 q05~q07 라우트 등록

PR-15a ch04 q01~q04 등록 패턴 그대로. 3 entries 추가:

```ts
import Q05Acid from './ch04/Q05Acid';
import Q06Backup from './ch04/Q06Backup';
import Q07Visualization from './ch04/Q07Visualization';

// DEMO_REGISTRY 에 추가:
ch04_q05: { Component: Q05Acid,           layout: 'wide' },
ch04_q06: { Component: Q06Backup,         layout: 'wide' },
ch04_q07: { Component: Q07Visualization,  layout: 'wide' },
```

> **모두 wide** (q05/q06 = C Match wide, q07 = A Flow wide).

### §A 절대 금지

- ch01~ch03 전체 + ch04_q01~q04 + ch05~ch10 콘텐츠 수정 (스코프 외)
- `_shared/*` 공용 계약 변경 (PR-12 잠금)
- `_shared/pair-block.tsx`, `_shared/design-tokens.css`, `PreviewPanel.tsx`, `LearnPage.tsx` 변경 (PR-12·13·14a/b·15a 잠금)
- DESIGN-POLICY §9.B-3 raw hex (디자인 토큰 사용)
- master/main 브랜치 직접 push, force push, no-verify commit

### §A 검증 (자체 보고 의무)

1. `cd client && npm run build` 무에러
2. dev 모드 (`npm run dev`) 에서 `/library/4/ch04_q05` ~ `q07` 3개 라우트 접근 가능
3. 3 데모 모두 amber-700 accent 표시 확인 (PR-15a 와 동일 톤)
4. raw hex grep 0건: `grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos/ch04 --include="*.tsx"`
5. `_shared` 외 import 0건: `grep -E "from ['\"]\.\.?/_shared/[^i]" client/src/demos/ch04/Q05Acid.tsx client/src/demos/ch04/Q06Backup.tsx client/src/demos/ch04/Q07Visualization.tsx`
6. **🚨 시나리오 ID 정렬 grep**: `data/demos.ts` 의 q05/q06/q07 ids 가 컴포넌트 SCENES 키와 1:1 매치
7. `git status` 새 파일 모두 staged 확인

### §A 완료 시 센티넬

파일: `qa/ao-logs/pr15b-r1-gen.status`

```json
{"status":"done","step":"pr15b","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch04-q5-q7","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"ch04 q05~q07 3 demos 인라인 + 메타포/IT 신규 SVG ~24 + registry 3 라우트 등록 (모두 wide). amber-700 톤 (ch04 마무리). data/demos.ts ↔ SCENES ID 정렬 검증 완료."}
```

---

## §B. Eval-Visual (Codex)

PR-15a round 2 Eval-Visual 그대로. **viewport 1440×900 (desktop) + 393×852 (mobile) 양쪽 모두 V1~V9**:

- V1 frame inline / V2 desktop 3단 / V3 active 동기화 / V4 contrast (amber-700) / V5 width (wide=860 max) / V6 SVG / V7 baseline / V8 mobile first-viewport / V9 mobile grid

ch04_q05~q07 3 데모만 검증 + ch04 q01~q04 회귀 spot-check 1건 (회귀 0 확인).

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch04-q5-q7`
3. `git checkout feat/preview-inline-ch04-q5-q7`
4. `git rev-parse HEAD` 가 Generator 센티넬 SHA 와 일치 확인
5. `cd client && npm install --no-audit --no-fund && npm run dev`
6. **코드 수정 절대 금지**

### §B 결과물

- 평가 보고: `qa-eval/pr15b-eval-visual-round1.json` (커밋 + push 권장)
- 센티넬: `qa/ao-logs/pr15b-r1-eval-visual.status`

---

## §C. Eval-Interaction (Codex)

PR-15a round 3 Eval-Interaction 그대로. I1~I8 정적 + 동작 검증.

### §C 시작 단계 (B 와의 worktree 충돌 회피)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch04-q5-q7`
3. `git checkout --detach origin/feat/preview-inline-ch04-q5-q7`
4. `git rev-parse HEAD` 로 SHA 확인
5. `cd client && npm install --no-audit --no-fund`
6. **코드 수정 절대 금지**

### §C 검증

- I1 build / I2 raw hex 0건 / I3 `_shared` 외 import 0건 / I4 라벨 길이 / **I5/I7/I8 ID 정렬** (PR-15a round 1 패턴 재발 방지) / I6 validatePairSet (q05/q06/q07 모두 layout='wide') / I7 URL hash deep-link (PR-15a fix 자동 수혜) / I8 콘텐츠 1:1
- **추가**: ch01~ch03 + ch04_q01~q04 무회귀
- **추가**: `_shared` + `PreviewPanel.tsx` + `LearnPage.tsx` 무변경

> ⚠️ **eval branch push 강제** + **main worktree sentinel 직접 write** (PR-15a round 2 사례 — codex 자체 브랜치 push 후 main worktree sentinel 비어 ao_wait_session timeout). `git add -f qa/ao-logs/pr15b-r1-eval-interaction.status` 강제.

### §C 결과물

- 평가 보고: `qa-eval/pr15b-eval-interaction-round1.json` (커밋 + push 권장)
- 센티넬: `qa/ao-logs/pr15b-r1-eval-interaction.status`

---

## 2. Master verdict 수령 절차

1. 3 센티넬 모두 PASS → Master 가 PR 생성
2. 1개라도 REVISE/FAIL → fail_items 분석 → round 2 (no-stop, ALL PASS 까지)
3. `commit` 필드 불일치 → stale sentinel 의심

---

## 3. PR-15a 학습 반영

| 학습 | 본 PR-15b 적용 |
|---|---|
| **scenario id mismatch** (PR-15a round 1 FAIL/REVISE 동시 발생 원인) | §A STEP 5/6 + §A 검증 6번에 grep 강제 명시 |
| **deep-link fallback** (PR-15a round 2 REVISE I7) | LearnPage.tsx 가 main 에 fix 적용됨 — 자동 수혜. round 1 I7 PASS 예상 |
| **codex 자체 브랜치 push + ao_wait_session timeout** (PR-15a round 2 arch-88) | §C 에 main worktree sentinel `git add -f` 명시 |

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. PR-15a 머지 직후 ch04 q05~q07 진입. ch04 마무리 |
