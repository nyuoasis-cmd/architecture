# HANDOFF-pr18a-round1 — ch07 q01~q04 인라인 변환 (DB 시작)

> **PR**: PR-18a — ch07 4 데모
> **base**: `main` (`87d5ecb` PR-17c 머지 후)
> **브랜치**: `feat/preview-inline-ch07-q1-q4`
> **에픽**: 11/18

---

## 0. 메타

| key | value |
|---|---|
| step | pr18a |
| round | 1 |
| branch | feat/preview-inline-ch07-q1-q4 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **all-roles model override** | **codex** |

---

## 1. ch07 q01~q04 매핑 (SDD §4.2)

| qaId | 메타포 | IT (SDD spec) | 형태 | layout |
|---|---|---|---|---|
| ch07_q01 | 칸/문서/연결/분산 | RDBMS/NoSQL/JOIN/샤딩 | D Vertical | square |
| ch07_q02 | 찾기/추가/수정/삭제 | SELECT/INSERT/UPDATE/DELETE | C Match | wide |
| ch07_q03 | 전부/규칙/차단/보존 | 원자성/일관성/고립성/지속성 (ACID) | C Match | wide |
| ch07_q04 | 훑기/가지/범위/비용 | 전체 스캔/B-tree/범위/쓰기 비용 | A Flow | wide |

**톤**: `getTone(7)` = purple-700 series (기존 PR-12 design-tokens.css 의 ch07 = `#9333ea` 인용)

---

## 🚨 본 PR 핵심 함정 — 영문 약자 한+영 병기 강제 (PR-16a/17c 학습)

| 라벨 | ❌ 위험 | ✅ 권장 |
|---|---|---|
| RDBMS | `'RDBMS'` (단조) | `'RDBMS 표'` 또는 `'관계형 RDBMS'` |
| NoSQL | `'NoSQL'` | `'NoSQL 문서'` 또는 `'문서 NoSQL'` |
| JOIN | `'JOIN'` | `'JOIN 결합'` |
| SELECT | `'SELECT'` | `'찾기 SELECT'` (8자) |
| INSERT | `'INSERT'` | `'추가 INSERT'` (9자 ❌ — 8자 한도 초과) → `'추가'` 만 또는 `'추가 INS'` |
| UPDATE | `'UPDATE'` | 동일 — `'수정'` 만 또는 `'수정 UPD'` |
| DELETE | `'DELETE'` | 동일 — `'삭제'` 만 또는 `'삭제 DEL'` |
| B-tree | `'B-tree'` | `'B-tree 색인'` (10자 ❌) → `'B-tree'` 만 |

> **`_shared/labels.ts:13` maxLabelLength = 8자**. PR-17c round 1 fail (POST 자가진단 9자) 학습. 한글+영문 결합 시 길이 신중히 계산.
>
> **regex `^(OS|API|DB|UI|JS|CSS|HTML)$`**: ch07 영문 약자는 모두 미포함 (안전).
>
> **권장 전략**: 가능하면 **한국어 라벨 + sub 에 영문 표기** 분리. 예:
> ```ts
> { label: '추가', sub: 'INSERT' }
> { label: '수정', sub: 'UPDATE' }
> { label: 'B-tree', sub: '계층 색인' }
> ```

---

## §A. Generator (Codex)

### §A 시작

1. `cd /home/claude/architecture && git fetch origin main && git checkout main && git pull --ff-only`
2. `git log -1` → `87d5ecb feat(preview): ch06 q08~q10 인라인 변환 (PR-17c, ch06 마무리)` 확인
3. `git checkout feat/preview-inline-ch07-q1-q4`
4. **🚨 모든 commit feat 브랜치 위 직접** (chore 브랜치 금지 — PR-17c 학습)
5. force push 금지

### §A STEP

**SVG 추가** (metaphor.tsx + computer.tsx):

q01: HouseIcon (칸 — 충돌 시 별명) / DocIcon (문서) / LinkDbIcon (연결) / DistributedDbIcon (분산)  
q02: FindIcon (찾기) / AddIcon (추가) / EditDbIcon (수정 — EditIcon 충돌 시) / DeleteIcon (삭제)  
q03: 재사용 가능 (PR-15b ACID 와 동일) — AllIcon, RuleIcon, BlockMetaIcon, PreserveIcon  
q04: BrowseDbIcon (훑기) / BranchIcon (가지) / RangeIcon (범위) / WriteCostIcon (비용)

IT:  
q01: RdbmsIcon / NoSqlIcon / JoinIcon / ShardIcon  
q02: SelectIcon / InsertIcon / UpdateDbIcon / DeleteDbIcon  
q03: 재사용 (PR-15b 의 AtomicityIcon, ConsistencyIcon, IsolationIcon, DurabilityIcon)  
q04: FullScanIcon (재사용 PR-15a) / BTreeIcon / RangeIcon / WriteCostIcon

**컴포넌트 STEP**:

#### `Q01DbType.tsx` (PairVertical square — D)
```ts
const METAPHOR = [
  { icon: <Icons.HouseIcon />,   label: '칸',   sub: '정해진 자리' },
  { icon: <Icons.DocIcon />,     label: '문서', sub: '자유로운 모양' },
  { icon: <Icons.LinkDbIcon />,  label: '연결', sub: '관계로 합침' },
  { icon: <Icons.DistributedDbIcon />, label: '분산', sub: '여러 대에 나눔' },
];
const IT = [
  { icon: <Icons.RdbmsIcon />, label: 'RDBMS', sub: '관계형' },
  { icon: <Icons.NoSqlIcon />, label: 'NoSQL', sub: '문서·키값' },
  { icon: <Icons.JoinIcon />,  label: 'JOIN',  sub: '테이블 결합' },
  { icon: <Icons.ShardIcon />, label: '샤딩',  sub: '수평 분산' },
];
tone: getTone(7)
validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' })
```

#### `Q02Crud.tsx` (PairMatch wide — C)
```ts
const METAPHOR = [
  { icon: <Icons.FindIcon />,    label: '찾기', sub: '읽기' },
  { icon: <Icons.AddIcon />,     label: '추가', sub: '신규' },
  { icon: <Icons.EditDbIcon />,  label: '수정', sub: '변경' },
  { icon: <Icons.DeleteIcon />,  label: '삭제', sub: '제거' },
];
const IT = [
  { icon: <Icons.SelectIcon />,   label: 'SELECT', sub: '조회' },
  { icon: <Icons.InsertIcon />,   label: 'INSERT', sub: '레코드 추가' },
  { icon: <Icons.UpdateDbIcon />, label: 'UPDATE', sub: '컬럼 변경' },
  { icon: <Icons.DeleteDbIcon />, label: 'DELETE', sub: '레코드 제거' },
];
tone: getTone(7)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

> **SELECT/INSERT/UPDATE/DELETE = 6자, OK**. 8자 한도 안.

#### `Q03Acid.tsx` (PairMatch wide — C, PR-15b Q05Acid 와 동일 콘텐츠)
PR-15b ch04_q05 와 콘텐츠 100% 동일 (메타포: 전부/규칙/차단/보존 ↔ ACID). **SDD 가 ch04_q05 와 ch07_q03 둘 다 ACID 로 지정** — 의도된 중복. 본 PR 에서는 ch07 톤 (purple-700) 으로 새 컴포넌트 작성:

```ts
const METAPHOR = [
  { icon: <Icons.AllIcon />,       label: '전부', sub: '모두 또는 없음' },
  { icon: <Icons.RuleIcon />,      label: '규칙', sub: '항상 유효' },
  { icon: <Icons.BlockMetaIcon />, label: '차단', sub: '동시 간섭 X' },
  { icon: <Icons.PreserveIcon />,  label: '보존', sub: '결과 유지' },
];
const IT = [
  { icon: <Icons.AtomicityIcon />,   label: '원자성', sub: 'Atomicity' },
  { icon: <Icons.ConsistencyIcon />, label: '일관성', sub: 'Consistency' },
  { icon: <Icons.IsolationIcon />,   label: '고립성', sub: 'Isolation' },
  { icon: <Icons.DurabilityIcon />,  label: '지속성', sub: 'Durability' },
];
tone: getTone(7)  // ch04_q05 는 getTone(4)
```

#### `Q04Index.tsx` (PairFlow wide — A)
```ts
const METAPHOR = [
  { icon: <Icons.BrowseDbIcon />,  label: '훑기', sub: '처음부터 끝' },
  { icon: <Icons.BranchIcon />,    label: '가지', sub: '계층 탐색' },
  { icon: <Icons.RangeIcon />,     label: '범위', sub: '구간 조회' },
  { icon: <Icons.WriteCostIcon />, label: '비용', sub: '갱신 부담' },
];
const IT = [
  { icon: <Icons.FullScanIcon />, label: '전체 스캔', sub: '느림' },
  { icon: <Icons.BTreeIcon />,    label: 'B-tree',    sub: '계층 색인' },
  { icon: <Icons.RangeIcon />,    label: '범위',      sub: 'BETWEEN' },
  { icon: <Icons.WriteCostIcon />, label: '쓰기 비용', sub: '인덱스 갱신' },
];
tone: getTone(7)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

> **B-tree = 6자, OK**.

#### data/demos.ts + registry.ts

```ts
ch07_q01: { Component: Q01DbType, layout: 'square' },
ch07_q02: { Component: Q02Crud,   layout: 'wide' },
ch07_q03: { Component: Q03Acid,   layout: 'wide' },
ch07_q04: { Component: Q04Index,  layout: 'wide' },
```

> 🚨 ID 정렬 grep 필수.

### §A 절대 금지

- ch01~ch06 + ch07_q05~q06 + ch08~ch10 콘텐츠 수정
- `_shared/*` 공용 계약 변경 (단 _shared/icons/* 추가는 허용)
- `_shared/pair-block.tsx`, `design-tokens.css`, `PreviewPanel.tsx`, `LearnPage.tsx`, `progress.ts`, `_shared/labels.ts` 변경
- raw hex, master/main push, force push

### §A 검증

1. `npm run build` 무에러
2. `/library/7/ch07_q01~q04` 4 라우트 접근
3. purple-700 series accent
4. raw hex grep 0건 / `_shared` 외 import 0건
5. **🚨 라벨 길이 grep**: 모든 라벨 ≤ 8자 검증 (label string length, 공백 포함)
   ```bash
   awk '/label:/ {match($0, /label: '\''([^'\'']*)'\''/, a); if (length(a[1]) > 8) print FILENAME":"NR": "a[1]" ("length(a[1])"자)"}' client/src/demos/ch07/*.tsx
   ```
6. **🚨 raw 약자 grep 0건**: `grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML)'" client/src/demos/ch07/*.tsx`
7. **🚨 ID 정렬 grep**
8. dev mode 콘솔 에러 0 (PR-17b fix 자동 수혜)

### §A 센티넬 → `qa/ao-logs/pr18a-r1-gen.status`

---

## §B. Eval-Visual + §C. Eval-Interaction

PR-17b 동일 패턴. ch07_q01~q04 + ch06 회귀 spot-check 1건. purple-700 contrast 측정.

> ⚠️ **commit SHA 검증**: §B/§C 시작 시 `git rev-parse HEAD` 가 Generator commit (또는 그 후 fix) 와 일치 확인. PR-17c 의 race 학습.

---

## 변경 기록

| 2026-05-04 | 초기 작성. ch07 q01~q04 (DB 시작, q01 D square). 라벨 길이 + 약자 강제 |
