# HANDOFF-pr20b-round1 — ch09 q05~q06 인라인 변환 (아키텍처·확장 마무리)

> **PR**: PR-20b — ch09 2 데모
> **base**: `main` (`eec6560` PR-20a 머지 후)
> **브랜치**: `feat/preview-inline-ch09-q5-q6`
> **에픽**: 16/18

---

## 0. 메타

| key | value |
|---|---|
| step | pr20b |
| round | 1 |
| branch | feat/preview-inline-ch09-q5-q6 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **all-roles model override** | **codex** |

---

## 1. ch09 q05~q06 매핑 (SDD §4.2)

| qaId | 메타포 | IT (SDD spec) | 형태 | layout |
|---|---|---|---|---|
| ch09_q05 | 요청/적재/처리/버퍼 | 요청/큐 적재/워커/버스트 | A Flow | wide |
| ch09_q06 | 측정/키우기/늘리기/혼합 | 병목 측정/수직 확장/수평 확장/혼합 전략 | C Match | wide |

**톤**: `getTone(9)` = indigo-700

> 모든 라벨 한국어 ≤ 8자, raw 약자 무, DB substring 무. PR-15b/16b/19a 패턴 그대로.

---

## §A. Generator (Codex)

### §A 시작

1. `cd /home/claude/architecture && git fetch origin main && git checkout main && git pull --ff-only`
2. `git log -1` → `eec6560 feat(preview): ch09 q01~q04 인라인 변환 (PR-20a, 아키텍처 시작)` 확인
3. `git checkout feat/preview-inline-ch09-q5-q6`
4. **🚨 모든 commit feat 브랜치 위 직접** (codex chore 만들지 말 것)

### §A STEP

#### `Q05Queue.tsx` (PairFlow wide — A)

```ts
const METAPHOR = [
  { icon: <Icons.RequestQ20Icon />,  label: '요청', sub: '들어옴' },
  { icon: <Icons.PileIcon />,        label: '적재', sub: '대기열' },
  { icon: <Icons.WorkerMetaIcon />,  label: '처리', sub: '하나씩 처리' },
  { icon: <Icons.BufferIcon />,      label: '버퍼', sub: '폭주 흡수' },
];
const IT = [
  { icon: <Icons.RequestIcon />,    label: '요청',     sub: 'incoming' },
  { icon: <Icons.QueueIcon />,      label: '큐 적재', sub: 'message queue' },
  { icon: <Icons.WorkerIcon />,     label: '워커',    sub: 'consumer' },
  { icon: <Icons.BurstIcon />,      label: '버스트', sub: 'spike absorb' },
];
tone: getTone(9)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `Q06Scaling.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.MeasureIcon />,    label: '측정',  sub: '병목 찾기' },
  { icon: <Icons.GrowVerticalIcon />, label: '키우기', sub: '한 대 강화' },
  { icon: <Icons.GrowHorizontalIcon />, label: '늘리기', sub: '여러 대 추가' },
  { icon: <Icons.MixScaleIcon />,   label: '혼합',  sub: '상황별' },
];
const IT = [
  { icon: <Icons.BottleneckIcon />,    label: '병목 측정', sub: 'profiling' },
  { icon: <Icons.VerticalScaleIcon />, label: '수직 확장', sub: 'scale up' },
  { icon: <Icons.HorizontalScaleIcon />, label: '수평 확장', sub: 'scale out' },
  { icon: <Icons.HybridScaleIcon />,   label: '혼합 전략', sub: 'mixed' },
];
tone: getTone(9)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `data/demos.ts` + `registry.ts`

```ts
ch09_q05: { Component: Q05Queue,    layout: 'wide' },
ch09_q06: { Component: Q06Scaling,  layout: 'wide' },
```

> 🚨 ID 정렬 + scenarios 한국어 강제

### §A 절대 금지 + §A 검증

PR-20a 동일 (raw 약자 0건, label 길이 ≤ 8, DB substring 0건, ID 정렬, dev console).

### §A 센티넬 → `qa/ao-logs/pr20b-r1-gen.status`

---

## §B + §C

PR-20a 동일. ch09_q05~q06 + ch09_q01~q04 회귀 spot-check. indigo-700.

---

## 변경 기록

| 2026-05-04 | 초기 작성. ch09 q05~q06 (아키텍처 마무리) |
