# HANDOFF-pr21a-round1 — ch10 q01~q04 인라인 변환 (클라우드·AI 시작)

> **PR**: PR-21a — ch10 4 데모
> **base**: `main` (`c31fa60` PR-20b 머지 후)
> **브랜치**: `feat/preview-inline-ch10-q1-q4`
> **에픽**: 17/18

---

## 0. 메타

| key | value |
|---|---|
| step | pr21a |
| round | 1 |
| branch | feat/preview-inline-ch10-q1-q4 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **all-roles model override** | **codex** |

---

## 1. ch10 q01~q04 매핑 (SDD §4.2)

| qaId | 메타포 | IT (SDD spec) | 형태 | layout |
|---|---|---|---|---|
| ch10_q01 | 직접/빌리기/완성/경계 | IaaS/PaaS/SaaS/책임 경계 | D Vertical | square |
| ch10_q02 | 묶기/설계/실행/공유 | 앱 묶기/이미지/컨테이너/커널 공유 | A Flow | wide |
| ch10_q03 | 원하는/복구/확장/점진 | 원하는 상태/자가 복구/자동 확장/점진 배포 | C Match | wide |
| ch10_q04 | 큰 목표/학습/신경망/포함 | AI/ML/DL/포함 관계 | D Vertical | square |

**톤**: `getTone(10)` = pink-700 series

---

## 🚨 본 PR 핵심 함정 — 영문 약자 한+영 병기 (PR-19a 학습)

| SDD spec 라벨 | 글자수 | 정책 |
|---|---|---|
| `IaaS` | 4 | 한+영: `'직접 IaaS'` (7) |
| `PaaS` | 4 | `'빌리기 PaaS'` (8) |
| `SaaS` | 4 | `'완성 SaaS'` (7) |
| `AI` | 2 | `'큰 목표 AI'` (7) 또는 `'AI 학습'` |
| `ML` | 2 | `'학습 ML'` (5) |
| `DL` | 2 | `'신경망 DL'` (6) |

> **labels.ts:8 regex** `^(OS|API|DB|UI|JS|CSS|HTML)$`: 위 약자 모두 미포함 (안전), 단 단독 사용 시 시각 단조.
>
> **DB 부분 문자열 0건** 유지 (PR-18a 학습).

---

## §A. Generator (Codex)

### §A 시작

1. `cd /home/claude/architecture && git fetch origin main && git checkout main && git pull --ff-only`
2. `git log -1` → `c31fa60 feat(preview): ch09 q05~q06 인라인 변환 (PR-20b, 아키텍처 마무리)` 확인
3. `git checkout feat/preview-inline-ch10-q1-q4`
4. **🚨 모든 commit feat 브랜치 위 직접** (codex chore 만들지 말 것 — PR-17c~PR-20b 매번 문제)

### §A STEP 요약

#### `Q01CloudService.tsx` (PairVertical square — D)

```ts
const METAPHOR = [
  { icon: <Icons.DirectIcon />,  label: '직접',  sub: '하드부터' },
  { icon: <Icons.RentIcon />,    label: '빌리기', sub: '플랫폼만' },
  { icon: <Icons.CompletedIcon />,label: '완성',  sub: '소프트만' },
  { icon: <Icons.BoundaryIcon />, label: '경계',  sub: '책임 분담' },
];
const IT = [
  { icon: <Icons.IaasIcon />,      label: '직접 IaaS',  sub: 'infra' },
  { icon: <Icons.PaasIcon />,      label: '빌리기 PaaS', sub: 'platform' },
  { icon: <Icons.SaasIcon />,      label: '완성 SaaS',   sub: 'software' },
  { icon: <Icons.RespBoundIcon />, label: '책임 경계',   sub: 'shared model' },
];
tone: getTone(10)
validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' })
```

> `'빌리기 PaaS'` = 8자 (한도). 안전.

#### `Q02Container.tsx` (PairFlow wide — A)

```ts
const METAPHOR = [
  { icon: <Icons.WrapIcon />,    label: '묶기', sub: '앱 패키징' },
  { icon: <Icons.BlueprintIcon />, label: '설계', sub: '이미지 정의' },
  { icon: <Icons.RunContIcon />,  label: '실행', sub: '인스턴스' },
  { icon: <Icons.ShareKernelIcon />, label: '공유', sub: '커널' },
];
const IT = [
  { icon: <Icons.AppPackIcon />,    label: '앱 묶기',  sub: 'package' },
  { icon: <Icons.ImageIcon />,      label: '이미지',  sub: 'docker image' },
  { icon: <Icons.ContainerIcon />,  label: '컨테이너', sub: 'runtime' },
  { icon: <Icons.KernelShareIcon />, label: '커널 공유', sub: 'cgroup/ns' },
];
tone: getTone(10)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `Q03K8s.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.DesireIcon />,    label: '원하는', sub: '목표 상태' },
  { icon: <Icons.SelfHealIcon />,  label: '복구',   sub: '자동 회복' },
  { icon: <Icons.AutoScaleIcon />, label: '확장',   sub: '부하 따라' },
  { icon: <Icons.GraduallyIcon />, label: '점진',   sub: '단계 배포' },
];
const IT = [
  { icon: <Icons.DesiredStateIcon />, label: '원하는 상태', sub: 'declarative' },
  { icon: <Icons.SelfHealItIcon />,   label: '자가 복구',   sub: 'reconcile' },
  { icon: <Icons.AutoScaleItIcon />,  label: '자동 확장',   sub: 'HPA' },
  { icon: <Icons.GradualDeployIcon />,label: '점진 배포',   sub: 'rolling' },
];
tone: getTone(10)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `Q04AiHierarchy.tsx` (PairVertical square — D)

```ts
const METAPHOR = [
  { icon: <Icons.BigGoalIcon />,    label: '큰 목표', sub: '문제 풀기' },
  { icon: <Icons.LearnIcon />,      label: '학습',    sub: '데이터 기반' },
  { icon: <Icons.NeuralIcon />,     label: '신경망',  sub: '깊은 층' },
  { icon: <Icons.IncludesIcon />,   label: '포함',    sub: '계층 구조' },
];
const IT = [
  { icon: <Icons.AiIcon />,        label: 'AI 큰 목표', sub: 'Artificial Intelligence' },
  { icon: <Icons.MlIcon />,        label: '학습 ML',     sub: 'Machine Learning' },
  { icon: <Icons.DlIcon />,        label: '신경망 DL',   sub: 'Deep Learning' },
  { icon: <Icons.IncludeRelIcon />, label: '포함 관계',   sub: 'AI⊃ML⊃DL' },
];
tone: getTone(10)
validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' })
```

> `'AI 큰 목표'` = 7자, `'학습 ML'` = 5자, `'신경망 DL'` = 6자. 모두 ≤ 8.

#### `data/demos.ts` + `registry.ts`

```ts
ch10_q01: { Component: Q01CloudService, layout: 'square' },
ch10_q02: { Component: Q02Container,    layout: 'wide' },
ch10_q03: { Component: Q03K8s,          layout: 'wide' },
ch10_q04: { Component: Q04AiHierarchy,  layout: 'square' },
```

> 🚨 ID 정렬 + scenarios 한국어 강제

### §A 절대 금지

- ch01~ch09 + ch10_q05~q07 콘텐츠 수정
- `_shared/*` 공용 계약 변경
- raw hex, master/main push, force push

### §A 검증 (자체 보고)

1. `npm run build` 무에러
2. `/library/10/ch10_q01~q04` 4 라우트 접근
3. pink-700 series accent
4. raw hex / `_shared` 외 import 0건
5. **🚨 라벨 길이 ≤ 8자** awk grep 0건
6. **🚨 raw 약자 grep**: `grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML|IaaS|PaaS|SaaS|AI|ML|DL)'" client/src/demos/ch10/*.tsx` → 0건
7. **🚨 'DB' 부분 문자열 grep** 0건
8. **🚨 ID 정렬 grep** + scenarios 한국어 first

### §A 센티넬 → `qa/ao-logs/pr21a-r1-gen.status`

---

## §B + §C

PR-20a/b 동일 패턴. ch10_q01~q04 + ch09 회귀 spot-check. pink-700 contrast.

---

## 변경 기록

| 2026-05-04 | 초기 작성. ch10 q01~q04 (클라우드·AI 시작). q01/q04 D Vertical, q02/q03 wide. IaaS/PaaS/SaaS/AI/ML/DL 한+영 병기 강제 |
