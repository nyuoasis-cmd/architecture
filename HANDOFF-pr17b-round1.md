# HANDOFF-pr17b-round1 — ch06 q05~q07 인라인 변환 (스케줄러·가상메모리)

> **PR**: PR-17b — ch06 3 데모 (q05~q07)
> **base**: `main` (`b6bf658` PR-17a 머지 후)
> **브랜치**: `feat/preview-inline-ch06-q5-q7` (origin push 완료)
> **참조 패턴**: PR-17a 의 ch06_q01/q03 (PairFlow wide) + ch04_q02 (PairMatch wide)
> **에픽**: 9/18

---

## 0. 메타

| key | value |
|---|---|
| step | pr17b |
| round | 1 |
| branch | feat/preview-inline-ch06-q5-q7 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator/eval-visual/eval-interaction model override** | **codex** |

---

## 1. ch06 q05~q07 매핑 (SDD §4.2)

| qaId | 메타포 | IT | 형태 | layout |
|---|---|---|---|---|
| ch06_q05 | 확인/신호/처리/복귀 | 폴링/인터럽트/핸들러/복귀 | A Flow | wide |
| ch06_q06 | 조각/교환/우선/동시감 | 타임 슬라이스/컨텍스트/우선순위/동시 실행 | C Match | wide |
| ch06_q07 | 호실/실제/대피/격리 | 가상 주소/물리 RAM/스왑/격리 | C Match | wide |

**톤**: `getTone(6)` = red-700 (PR-17a 와 동일)

---

## §A. Generator (Codex)

### §A 시작 단계

1. `cd /home/claude/architecture && git fetch origin main && git checkout main && git pull --ff-only`
2. `git log --oneline -1` → `b6bf658 feat(preview): ch06 q01~q04 인라인 변환 (PR-17a)` 확인
3. `git checkout feat/preview-inline-ch06-q5-q7`
4. force push 금지

### §A 작업 (3 demos + ~24 SVG)

#### STEP 1 — 신규 SVG (`_shared/icons/`)

**metaphor.tsx**:
- q05: `CheckIcon` (확인 — 충돌 시 별명) / `SignalIcon` (신호) / `HandleIcon` (처리) / `ReturnIcon` (복귀)
- q06: `SliceIcon` (조각) / `SwapMetaIcon` (교환) / `PriorityIcon` (우선) / `ConcurrencyIcon` (동시감)
- q07: `RoomIcon` (호실) / `ActualIcon` (실제) / `EvacuateIcon` (대피) / `IsolateMetaIcon` (격리)

**computer.tsx**:
- q05: `PollingIcon` / `InterruptIcon` / `HandlerIcon` / `ResumeIcon`
- q06: `TimeSliceIcon` / `ContextIcon` / `PriorityItIcon` / `ParallelIcon`
- q07: `VirtualAddrIcon` / `PhysRamIcon` (또는 RamIcon 재사용) / `SwapIcon` / `IsolationItIcon` (또는 IsolationIcon 재사용)

> 재사용 후보: `RamIcon` (q07 IT), 기존 `IsolationIcon` 등.

#### STEP 2 — `Q05Interrupt.tsx` (PairFlow wide — A)

```ts
const METAPHOR = [
  { icon: <Icons.CheckIcon />,  label: '확인', sub: '주기적 점검' },
  { icon: <Icons.SignalIcon />, label: '신호', sub: '발생 알림' },
  { icon: <Icons.HandleIcon />, label: '처리', sub: '대응 동작' },
  { icon: <Icons.ReturnIcon />, label: '복귀', sub: '원래 작업' },
];
const IT = [
  { icon: <Icons.PollingIcon />,   label: '폴링',     sub: 'busy-wait' },
  { icon: <Icons.InterruptIcon />, label: '인터럽트', sub: '비동기 알림' },
  { icon: <Icons.HandlerIcon />,   label: '핸들러',   sub: 'ISR 실행' },
  { icon: <Icons.ResumeIcon />,    label: '복귀',     sub: '컨텍스트 복원' },
];
tone: getTone(6)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 3 — `Q06Scheduler.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.SliceIcon />,       label: '조각',   sub: '시간 분할' },
  { icon: <Icons.SwapMetaIcon />,    label: '교환',   sub: '작업 전환' },
  { icon: <Icons.PriorityIcon />,    label: '우선',   sub: '먼저 처리' },
  { icon: <Icons.ConcurrencyIcon />, label: '동시감', sub: '느낌상 동시' },
];
const IT = [
  { icon: <Icons.TimeSliceIcon />,  label: '타임 슬라이스', sub: 'quantum' },
  { icon: <Icons.ContextIcon />,    label: '컨텍스트',     sub: 'switch' },
  { icon: <Icons.PriorityItIcon />, label: '우선순위',     sub: 'priority' },
  { icon: <Icons.ParallelIcon />,   label: '동시 실행',    sub: '환상' },
];
tone: getTone(6)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 4 — `Q07VirtualMemory.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.RoomIcon />,         label: '호실',  sub: '문패만' },
  { icon: <Icons.ActualIcon />,       label: '실제',  sub: '진짜 위치' },
  { icon: <Icons.EvacuateIcon />,     label: '대피',  sub: '잠시 옮김' },
  { icon: <Icons.IsolateMetaIcon />,  label: '격리',  sub: '서로 못 봄' },
];
const IT = [
  { icon: <Icons.VirtualAddrIcon />,  label: '가상 주소', sub: 'VAS' },
  { icon: <Icons.RamIcon />,          label: '물리 RAM', sub: 'frame' },
  { icon: <Icons.SwapIcon />,         label: '스왑',     sub: 'page out' },
  { icon: <Icons.IsolationIcon />,    label: '격리',     sub: 'process VM' },
];
tone: getTone(6)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 5 — `data/demos.ts` 신규 entry 3개 + `registry.ts` 라우트 3개

> **🚨 ID 정렬**: data/demos.ts ↔ SCENES 키 1:1 일치.

```ts
ch06_q05: { Component: Q05Interrupt,      layout: 'wide' },
ch06_q06: { Component: Q06Scheduler,      layout: 'wide' },
ch06_q07: { Component: Q07VirtualMemory,  layout: 'wide' },
```

### §A 절대 금지

- ch01~ch05 + ch06_q01~q04 + ch06_q08~q10 + ch07~ch10 콘텐츠 수정
- `_shared/*` 공용 계약 변경
- `_shared/pair-block.tsx`, `design-tokens.css`, `PreviewPanel.tsx`, `LearnPage.tsx`, `progress.ts`, `_shared/labels.ts` 변경
- raw hex, master/main push, force push
- **🚨 raw 약자 단독 라벨** (regex `^(OS|API|DB|UI|JS|CSS|HTML)$`)

### §A 검증 (자체 보고)

1. `cd client && npm run build` 무에러
2. `/library/6/ch06_q05~q07` 3 라우트 접근 가능
3. 3 데모 모두 red-700 series accent
4. raw hex grep 0건
5. `_shared` 외 import 0건
6. **🚨 raw 약자 grep 0건**: `grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML)'" client/src/demos/ch06/Q0[5-7]*.tsx`
7. **🚨 시나리오 ID 정렬 grep**: `data/demos.ts` ch06_q05~q07 ids ↔ SCENES 키 1:1
8. dev mode 콘솔 에러 0건 (favicon 404 제외)

### §A 센티넬 → `qa/ao-logs/pr17b-r1-gen.status`

---

## §B. Eval-Visual (Codex)

V1~V9, ch06_q05~q07 + ch06_q01~q04 회귀 spot-check 1건. red-700 series contrast (PR-17a 와 동일 톤).

`qa-eval/pr17b-eval-visual-round1.json` + `qa/ao-logs/pr17b-r1-eval-visual.status`.

---

## §C. Eval-Interaction (Codex)

I1~I8 + raw 약자 grep + dev console (favicon 404 제외).

`qa-eval/pr17b-eval-interaction-round1.json` + `qa/ao-logs/pr17b-r1-eval-interaction.status` (`git add -f`).

---

## 2. PR-17a 학습 반영

| 학습 | 본 PR-17b 적용 |
|---|---|
| inline JSX 가 PairFlow 우회 시 모바일 grid 누락 (PR-17a Q04 round 2) | 본 PR 모두 PairFlow/PairMatch 표준 컴포넌트 사용 (5칸 미사용) |
| V4 contrast SDD spec mismatch | 본 PR 핸드오프 §B 에서 spec 명시 안 함 (PR-17a 와 동일 톤 표현만) |
| favicon 404 informational | §C 검증에서 명시적 제외 |
| dev mode 401 (PR-16b) | progress.ts main fix 자동 수혜 |
| 시나리오 ID mismatch (PR-15a) | §A STEP 5 + §A 검증 7번 grep |

---

## 변경 기록

| 2026-05-04 | 초기 작성. PR-17a 머지 직후 ch06 q05~q07 (모두 wide) |
