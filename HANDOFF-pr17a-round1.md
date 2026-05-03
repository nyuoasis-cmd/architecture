# HANDOFF-pr17a-round1 — ch06 q01~q04 인라인 변환 (CPU·메모리 시작)

> **프로젝트**: `architecture`
> **PR**: PR-17a — ch06 4 데모 (`q01~q04`) React 인라인 변환 (CPU·메모리·OS · red-600 톤 — ch06 시작)
> **base**: `main` (`8a8bf39` PR-16b 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch06-q1-q4`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §4.2 ch06)
> **참조 패턴**:
>   - **q01/q03/q04 A wide**: `client/src/demos/ch04/Q03DataDup.tsx`, `Q04DataIndex.tsx`
>   - **q02 D square (PairVertical)**: `client/src/demos/ch01/Q04Bookshelf.tsx` (이전 ch01 메모리 데모와 동일 도메인 — 재사용 가능 아이콘 多)
> **에픽 위치**: 챕터 프레임 통일 에픽 8/18 (PR-13~16b ✅ → **PR-17a** → PR-17b → PR-17c → PR-18 → ... → PR-22)

---

## 0. 메타

| key | value |
|---|---|
| step | pr17a |
| round | 1 |
| branch | feat/preview-inline-ch06-q1-q4 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | **codex** |
| **eval-interaction model override** | **codex** |

---

## 1. ch06 q01~q04 매핑 (SDD §4.2 잠금)

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 | layout |
|---|---|---|---|---|---|
| ch06_q01 | 읽기 / 해석 / 계산 / 저장 | Fetch / Decode / Execute / Store | 사용 | **A Flow** (PairFlow) | wide |
| ch06_q02 | 손 안 / 책상 / 캐시 / 창고 | 레지스터 / 캐시 / RAM / 디스크 | 사용 | **D Vertical** (PairVertical) | square |
| ch06_q03 | 실행 / 복제 / 작업 / 종료 | 프로그램 / 프로세스 / CPU / 종료 | 사용 | **A Flow** (PairFlow) | wide |
| ch06_q04 | 방금 / 근처 / 적중 / 미스 / 계층 | 최근값 / 인접값 / 히트 / 미스 / L1-L3 | 사용 | **A Flow 5칸** (PairFlow) | wide |

**챕터 톤**: `getTone(6)` = red-600 (`#dc2626`) — SDD §4.0 컬러 표

---

## 🚨 **본 PR 핵심 함정 3가지** (Generator 시작 전 반드시 인지)

### 1. q03 IT 라벨 "CPU" → raw 약자 단독 금지 (PR-16a 학습)

`client/src/demos/_shared/labels.ts:8` 의 raw 약자 정규식 `^(OS|API|DB|UI|JS|CSS|HTML)$`. **현재 CPU 는 미포함이지만**, q03 의 `'CPU'` 라벨은 **약자 단독** 으로 시각적 통일성 + 향후 정규식 확장 가능성. 한+영 병기 권장:

| ❌ 위험 | ✅ 권장 |
|---|---|
| `label: 'CPU'` | `label: '처리기 CPU'` (sub: '연산 코어') 또는 `label: 'CPU 처리'` |

q01 IT `'Fetch'/'Decode'/'Execute'/'Store'` 도 영어 단독 — 한+영 병기 권장:

| ❌ | ✅ |
|---|---|
| `label: 'Fetch'` | `label: '읽기 Fetch'` (sub: '명령 인출') |
| `label: 'Decode'` | `label: '해석 Decode'` |
| `label: 'Execute'` | `label: '계산 Execute'` |
| `label: 'Store'` | `label: '저장 Store'` |

q02 IT `'레지스터' / '캐시' / 'RAM' / '디스크'` — `'RAM'` 만 약자 단독 → `'주기억 RAM'` 또는 `'RAM 메모리'`.

q04 IT `'L1-L3'` — 기호+숫자라 raw 약자 정규식엔 안 걸리지만 의미 명확히 위해 `'L1-L3 캐시'` 권장.

> **검증 grep**: `grep -nE "label: '(CPU|RAM|OS|API|DB|UI|JS|CSS|HTML|Fetch|Decode|Execute|Store)'" client/src/demos/ch06/*.tsx` → 0건 필수.

### 2. q04 = 5칸 wide (다른 demos = 4칸)

`_shared/pair-block.tsx` 의 `PairFlow` props 가 5개 PairItem 배열 받을 수 있음 (SDD §4.0 `wide=4~5칸` 명시). 단, **`validatePairSet` 가 5칸도 PASS** 하는지 확인 후 진행. labels.ts:329-331 의 한도:

```
| `validatePairSet(pair, opts)` | (3) layout별 칸 수 한도 (wide ≤5 / square ≤5 / tall ≤6) |
```

→ wide 5칸 OK. SCENES 도 5개 (활성 인덱스 0~4 슬라이딩).

### 3. q02 PairVertical 패턴 — ch01 Q04Bookshelf 재사용 가능 아이콘 多

`Q04Bookshelf.tsx` 가 이미 메모리 도메인 demo:
- 메타포: 책장/책상/포스트잇/펜/다시 꽂기 (5단계)
- IT: 저장소/RAM/캐시/CPU/결과 저장 (5단계)

q02 매핑 (4단계):
- 메타포: 손 안 / 책상 / 캐시 / 창고
- IT: 레지스터 / 캐시 / RAM / 디스크

**재사용 가능**: `DeskIcon`, `CacheIcon`, `StorageDiskIcon`, `RamIcon` 등. 단 `'손 안'` (HandIcon — 기존), `'창고'` (WarehouseIcon — 신규?), `'레지스터'` (RegisterIcon — 신규) 는 추가.

---

## §A. Generator (Codex)

### §A 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin main && git checkout main && git pull --ff-only`
3. `git log --oneline -1` 확인 (`8a8bf39 feat: ch05 q05~q07 인라인 데모 추가 (#48)` 이후)
4. `git checkout feat/preview-inline-ch06-q1-q4`
5. 모든 commit 본 브랜치 위
6. `git push origin feat/preview-inline-ch06-q1-q4` (force 금지)

### §A 작업 단계

#### STEP 1 — 신규 SVG 아이콘

**`metaphor.tsx`** — 메타포 측 신규:
```
q01: 읽기 (ReadIcon) / 해석 (InterpretIcon) / 계산 (CalcIcon) / 저장 (SaveIcon — 충돌 시 별명)
q02: 손 안 (재사용? HandIcon 기존) / 책상 (재사용 DeskIcon) / 캐시 (재사용? StickyIcon 기존) / 창고 (WarehouseIcon)
q03: 실행 (ExecuteMetaIcon) / 복제 (CloneIcon) / 작업 (TaskIcon) / 종료 (EndIcon)
q04: 방금 (RecentIcon) / 근처 (NearbyIcon) / 적중 (HitIcon) / 미스 (MissIcon) / 계층 (LayerIcon)
```

**`computer.tsx`** — IT 측 신규:
```
q01: Fetch (FetchIcon) / Decode (DecodeIcon) / Execute (ExecuteItIcon) / Store (StoreIcon)
q02: 레지스터 (RegisterIcon) / 캐시 (재사용 CacheIcon 기존) / RAM (재사용 RamIcon 기존) / 디스크 (재사용 StorageDiskIcon 기존)
q03: 프로그램 (ProgramIcon) / 프로세스 (ProcessIcon) / CPU (재사용 CpuIcon 기존) / 종료 (TerminateIcon)
q04: 최근값 (RecentValueIcon) / 인접값 (NearValueIcon) / 히트 (CacheHitIcon) / 미스 (CacheMissIcon) / L1-L3 (CacheLevelIcon)
```

> **재사용 강력 권장**: ch01 Q04Bookshelf.tsx 에 이미 `RamIcon`, `CacheIcon`, `CpuIcon`, `StorageDiskIcon`, `DeskIcon`, `StickyIcon` 등이 있음. 동일 라벨이면 그대로 재사용.

#### STEP 2 — `Q01CpuCycle.tsx` (PairFlow wide 4칸 — A)

```ts
const METAPHOR = [
  { icon: <Icons.ReadIcon />,      label: '읽기',  sub: '명령 가져오기' },
  { icon: <Icons.InterpretIcon />, label: '해석',  sub: '의미 파악' },
  { icon: <Icons.CalcIcon />,      label: '계산',  sub: '연산 수행' },
  { icon: <Icons.SaveIcon />,      label: '저장',  sub: '결과 보관' },
];
const IT = [
  { icon: <Icons.FetchIcon />,     label: '읽기 Fetch',    sub: '명령 인출' },
  { icon: <Icons.DecodeIcon />,    label: '해석 Decode',   sub: '디코드' },
  { icon: <Icons.ExecuteItIcon />, label: '계산 Execute',  sub: 'ALU 연산' },
  { icon: <Icons.StoreIcon />,     label: '저장 Store',    sub: '레지스터/메모리' },
];
tone: getTone(6)  // red-600
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 3 — `Q02MemoryHierarchy.tsx` (PairVertical square — D)

`Q04Bookshelf.tsx` 패턴 그대로 (CPU/RAM/캐시/디스크 4단계로 축소):

```ts
const METAPHOR = [
  { icon: <Icons.HandIcon />,    label: '손 안', sub: '즉시' },
  { icon: <Icons.DeskIcon />,    label: '책상', sub: '눈앞' },
  { icon: <Icons.StickyIcon />,  label: '캐시', sub: '가까이' },
  { icon: <Icons.WarehouseIcon />, label: '창고', sub: '멀리' },
];
const IT = [
  { icon: <Icons.RegisterIcon />,    label: '레지스터',    sub: 'CPU 내부' },
  { icon: <Icons.CacheIcon />,       label: '캐시',        sub: 'L1·L2·L3' },
  { icon: <Icons.RamIcon />,         label: '주기억 RAM',   sub: '실행 데이터' },
  { icon: <Icons.StorageDiskIcon />, label: '디스크',      sub: '영구 저장' },
];
tone: getTone(6)
validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' })
```

#### STEP 4 — `Q03Process.tsx` (PairFlow wide 4칸 — A)

```ts
const METAPHOR = [
  { icon: <Icons.ExecuteMetaIcon />, label: '실행', sub: '시작 명령' },
  { icon: <Icons.CloneIcon />,       label: '복제', sub: '인스턴스 생성' },
  { icon: <Icons.TaskIcon />,        label: '작업', sub: '실제 수행' },
  { icon: <Icons.EndIcon />,         label: '종료', sub: '자원 회수' },
];
const IT = [
  { icon: <Icons.ProgramIcon />,   label: '프로그램',  sub: '코드+자원 정의' },
  { icon: <Icons.ProcessIcon />,   label: '프로세스',  sub: '실행 인스턴스' },
  { icon: <Icons.CpuIcon />,       label: '처리기 CPU', sub: '연산 수행' },
  { icon: <Icons.TerminateIcon />, label: '종료',      sub: 'exit/cleanup' },
];
tone: getTone(6)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 5 — `Q04CacheHit.tsx` (PairFlow wide **5칸** — A)

```ts
const METAPHOR = [
  { icon: <Icons.RecentIcon />,  label: '방금', sub: '최근 접근' },
  { icon: <Icons.NearbyIcon />,  label: '근처', sub: '인접 데이터' },
  { icon: <Icons.HitIcon />,     label: '적중', sub: '캐시에 있음' },
  { icon: <Icons.MissIcon />,    label: '미스', sub: '없어서 다시' },
  { icon: <Icons.LayerIcon />,   label: '계층', sub: 'L1→L2→L3' },
];
const IT = [
  { icon: <Icons.RecentValueIcon />, label: '최근값', sub: '시간 지역성' },
  { icon: <Icons.NearValueIcon />,   label: '인접값', sub: '공간 지역성' },
  { icon: <Icons.CacheHitIcon />,    label: '히트',   sub: 'cache hit' },
  { icon: <Icons.CacheMissIcon />,   label: '미스',   sub: 'cache miss' },
  { icon: <Icons.CacheLevelIcon />,  label: 'L1-L3 캐시', sub: '계층별' },
];
tone: getTone(6)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

> **5칸 검증**: `validatePairSet` 가 wide 5칸 PASS 확인 (labels.ts:329-331 한도 wide ≤5).

#### STEP 6 — `data/demos.ts` 신규 entry 4개 + `registry.ts` 라우트 4개

> **🚨 PR-15a round 1 fail 재발 방지** — `data/demos.ts` ↔ SCENES 키 정확히 일치.

`registry.ts`:
```ts
ch06_q01: { Component: Q01CpuCycle,        layout: 'wide' },
ch06_q02: { Component: Q02MemoryHierarchy, layout: 'square' },  // ← square (D)
ch06_q03: { Component: Q03Process,         layout: 'wide' },
ch06_q04: { Component: Q04CacheHit,        layout: 'wide' },    // 5칸
```

### §A 절대 금지

- ch01~ch05 + ch06_q05~q10 + ch07~ch10 콘텐츠 수정
- `_shared/*` 공용 계약 변경 (PR-12 잠금)
- `_shared/pair-block.tsx`, `_shared/design-tokens.css`, `PreviewPanel.tsx`, `LearnPage.tsx`, `_shared/labels.ts`, `client/src/lib/progress.ts` 변경
- raw hex, master/main push, force push, no-verify
- **🚨 raw 약자 단독 라벨** (Fetch/Decode/Execute/Store/CPU/RAM 단독 금지)

### §A 검증 (자체 보고)

1. `cd client && npm run build` 무에러
2. `/library/6/ch06_q01~q04` 4 라우트 접근 가능
3. 4 데모 모두 red-600 accent (이전 PR sky-600·amber-700·green-600 와 다른 톤)
4. raw hex grep 0건
5. `_shared` 외 import 0건
6. **🚨 raw 약자 grep 0건**: `grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML|CPU|RAM|Fetch|Decode|Execute|Store)'" client/src/demos/ch06/*.tsx`
7. **🚨 시나리오 ID 정렬 grep**: `data/demos.ts` ch06 ids ↔ 컴포넌트 SCENES 키 1:1
8. **dev mode 콘솔 에러 0건** (PR-16b learning, `npm run dev` + 첫 라우트 진입)
9. q04 5칸 layout 정상 (4칸이 아님 — 그리드 5열 분할 확인)

### §A 완료 시 센티넬

`qa/ao-logs/pr17a-r1-gen.status`:
```json
{"status":"done","step":"pr17a","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch06-q1-q4","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"ch06 q01~q04 4 demos (q01/q03 wide 4칸, q02 square, q04 wide 5칸). red-600 톤. raw 약자 0건 + ID 정렬 + dev mode 콘솔 에러 0 검증 완료."}
```

---

## §B. Eval-Visual (Codex)

PR-16a/16b round 1 §B 동일 V1~V9. **추가 V check**:
- V5 width: q02 만 square (640px), q01/q03 wide (860px ≤), **q04 wide 5칸** — grid template 5열 균등 분할 확인
- V4 contrast: red-600 (`#dc2626`) accent — WCAG AA 4.5:1 만족

ch06_q01~q04 4 데모 + ch05 회귀 spot-check 1건.

`qa/ao-logs/pr17a-r1-eval-visual.status` + `qa-eval/pr17a-eval-visual-round1.json`.

---

## §C. Eval-Interaction (Codex)

PR-16a/16b round 1 §C 동일 I1~I8 + raw 약자 grep + dev mode 콘솔 에러 검증.

`qa/ao-logs/pr17a-r1-eval-interaction.status` + `qa-eval/pr17a-eval-interaction-round1.json`.

> ⚠️ **eval branch push 강제 + main worktree sentinel `git add -f`** (PR-15a/16a 학습)

---

## 2. Master verdict 수령 절차

3 PASS → PR / 1+ REVISE/FAIL → round 2 / SHA mismatch → stale 의심.

---

## 3. PR-16a/16b 학습 반영

| 학습 | 본 PR-17a 적용 |
|---|---|
| **raw 약자 단독 import-time throw** (PR-16a) | §A STEP 1~5 라벨 한+영 병기 강제 + §A 검증 6번 grep + §C raw 약자 검증 |
| **dev mode 401 콘솔 노이즈** (PR-16b) | progress.ts 가 main 에 fix 적용 — 자동 수혜 |
| **scenario id mismatch** (PR-15a) | §A STEP 6 + §A 검증 7번 grep |
| **5칸 layout 신규 변형** (q04) | §B V5 width + grid template 검증 추가 |

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. PR-16b 머지 직후 ch06 q01~q04 진입. ch06 시작 (red-600). q04 5칸 wide 신규 변형 + q03 CPU 약자 한+영 병기 학습 반영 |
