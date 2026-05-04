# HANDOFF-pr17c-round1 — ch06 q08~q10 인라인 변환 (파일·드라이버·부팅, ch06 마무리)

> **PR**: PR-17c — ch06 3 데모 (q08~q10)
> **base**: `main` (`c87064e` PR-17b 머지 후)
> **브랜치**: `feat/preview-inline-ch06-q8-q10`
> **참조**: PR-17a/b 패턴 + Q04CacheHit (5칸 wide inline) 패턴
> **에픽**: 10/18

---

## 0. 메타

| key | value |
|---|---|
| step | pr17c |
| round | 1 |
| branch | feat/preview-inline-ch06-q8-q10 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **all-roles model override** | **codex** |

---

## 1. ch06 q08~q10 매핑 (SDD §4.2)

| qaId | 메타포 | IT | 형태 | layout |
|---|---|---|---|---|
| ch06_q08 | 폴더/카드/블록/기록 | 디렉터리/inode/블록/저널 | C Match | wide 4칸 |
| ch06_q09 | 요청/번역/실행/응답 | 운영체제 요청/드라이버/장치/결과 | A Flow | wide 4칸 |
| ch06_q10 | 전원/펌웨어/부트/커널/로그인 | POST/BIOS/부트로더/커널/로그인 | A Flow | wide **5칸** |

**톤**: `getTone(6)` = red-700

---

## §A. Generator (Codex)

### §A 시작

1. `cd /home/claude/architecture && git fetch origin main && git checkout main && git pull --ff-only`
2. `git log -1` → `c87064e feat: ch06 q05~q07 인라인 시연 추가 (#52)` 확인
3. `git checkout feat/preview-inline-ch06-q8-q10`
4. force push 금지

### §A STEP

#### STEP 1 — SVG (`_shared/icons/`)

**metaphor.tsx**:
- q08: FolderIcon / CardIcon (충돌 시 별명) / BlockMetaIcon / RecordIcon
- q09: RequestQ09Icon / TranslateIcon / RunActionIcon / RespondIcon (q05 RespondIcon 충돌 시 재사용)
- q10: PowerIcon / FirmwareIcon / BootIcon / KernelIcon / LoginIcon

**computer.tsx**:
- q08: DirectoryIcon / InodeIcon / BlockItIcon / JournalIcon
- q09: OsRequestIcon / DriverItIcon / DeviceIcon / ResultItIcon (또는 ResultIcon 재사용)
- q10: PostIcon / BiosIcon / BootloaderIcon / KernelItIcon / LoginItIcon

> 재사용: `DriverIcon` (PR-12 등록?), `ResultIcon` 등.

#### STEP 2 — `Q08FileSystem.tsx` (PairMatch wide 4칸 — C)

```ts
const METAPHOR = [
  { icon: <Icons.FolderIcon />, label: '폴더', sub: '묶음' },
  { icon: <Icons.CardIcon />,   label: '카드', sub: '메타정보' },
  { icon: <Icons.BlockMetaIcon />, label: '블록', sub: '실제 조각' },
  { icon: <Icons.RecordIcon />, label: '기록', sub: '변경 로그' },
];
const IT = [
  { icon: <Icons.DirectoryIcon />, label: '디렉터리', sub: 'tree' },
  { icon: <Icons.InodeIcon />,     label: 'inode',    sub: 'metadata' },
  { icon: <Icons.BlockItIcon />,   label: '블록',     sub: 'data block' },
  { icon: <Icons.JournalIcon />,   label: '저널',     sub: 'crash 회복' },
];
tone: getTone(6)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 3 — `Q09Driver.tsx` (PairFlow wide 4칸 — A)

```ts
const METAPHOR = [
  { icon: <Icons.RequestQ09Icon />, label: '요청', sub: '필요 발생' },
  { icon: <Icons.TranslateIcon />,  label: '번역', sub: '장치 언어' },
  { icon: <Icons.RunActionIcon />,  label: '실행', sub: '하드웨어 동작' },
  { icon: <Icons.RespondIcon />,    label: '응답', sub: '결과 전달' },
];
const IT = [
  { icon: <Icons.OsRequestIcon />, label: '운영체제 요청', sub: 'system call' },
  { icon: <Icons.DriverItIcon />,  label: '드라이버',     sub: 'device driver' },
  { icon: <Icons.DeviceIcon />,    label: '장치',         sub: 'I/O' },
  { icon: <Icons.ResultIcon />,    label: '결과',         sub: '사용자에게' },
];
tone: getTone(6)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 4 — `Q10BootSequence.tsx` (PairFlow wide **5칸** — A)

> **🚨 5칸 layout 처리**: PR-17a Q04CacheHit 가 inline JSX 로 5칸 작성 + 모바일 grid-cols-2 직접 적용 (PR-17a round 3 fix). 본 demo 도 동일 패턴 권장.
>
> 또는: PairFlow 표준 컴포넌트 사용 (PR-17a round 2 의 pair-block.tsx 5칸 case 추가됨 — `items.length === 5` 분기 자동 적용)

```ts
const METAPHOR = [
  { icon: <Icons.PowerIcon />,    label: '전원',   sub: '공급' },
  { icon: <Icons.FirmwareIcon />, label: '펌웨어', sub: '내장 소프트' },
  { icon: <Icons.BootIcon />,     label: '부트',   sub: 'OS 적재' },
  { icon: <Icons.KernelIcon />,   label: '커널',   sub: 'OS 핵심' },
  { icon: <Icons.LoginIcon />,    label: '로그인', sub: '사용자 진입' },
];
const IT = [
  { icon: <Icons.PostIcon />,       label: 'POST 자가진단', sub: '하드 점검' },
  { icon: <Icons.BiosIcon />,       label: 'BIOS 펌웨어',  sub: '부팅 프로그램' },
  { icon: <Icons.BootloaderIcon />, label: '부트로더',     sub: 'GRUB/LILO' },
  { icon: <Icons.KernelItIcon />,   label: '커널 적재',    sub: 'kernel load' },
  { icon: <Icons.LoginItIcon />,    label: '로그인 셸',    sub: 'getty/PAM' },
];
tone: getTone(6)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

> **POST/BIOS 약자**: 현재 `^(OS|API|DB|UI|JS|CSS|HTML)$` regex 에 미포함 — 단독 사용 가능. 단 시각 통일 위해 한+영 병기 권장 (`'POST 자가진단'`, `'BIOS 펌웨어'`).
>
> **Q10 PairFlow 표준 사용 시**: `_shared/pair-block.tsx` StepRow.gridClass 가 PR-17a round 2 에서 5칸 case 추가됨 (`grid grid-cols-2 ... sm:grid-cols-5`). 자동 적용. inline JSX 작성 불필요.

#### STEP 5 — `data/demos.ts` 신규 entry 3개 + `registry.ts` 라우트 3개

```ts
ch06_q08: { Component: Q08FileSystem,    layout: 'wide' },
ch06_q09: { Component: Q09Driver,        layout: 'wide' },
ch06_q10: { Component: Q10BootSequence,  layout: 'wide' },  // 5칸 — PairFlow 표준 사용 시 자동
```

> **🚨 ID 정렬 grep** 필수.

### §A 절대 금지

- ch01~ch05 + ch06_q01~q07 + ch07~ch10 콘텐츠 수정
- `_shared/*` 공용 계약 변경 (단 `_shared/icons/{metaphor,computer}.tsx` 신규 SVG 추가는 허용)
- `_shared/pair-block.tsx`, `design-tokens.css`, `PreviewPanel.tsx`, `LearnPage.tsx`, `progress.ts`, `_shared/labels.ts` 변경
- raw hex, master/main push, force push

### §A 검증

1. `npm run build` 무에러
2. `/library/6/ch06_q08~q10` 3 라우트 접근
3. red-700 series accent
4. raw hex grep 0건 / `_shared` 외 import 0건
5. **🚨 raw 약자 grep 0건**: `grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML)'" client/src/demos/ch06/Q[0-9]*.tsx`
6. **🚨 ID 정렬 grep**
7. dev mode 콘솔 에러 0 (PR-17b fix 자동 수혜)
8. q10 5칸 — desktop sm:grid-cols-5 / mobile grid-cols-2 확인 (PairFlow 표준 사용 시 자동, inline 사용 시 명시)

### §A 센티넬 → `qa/ao-logs/pr17c-r1-gen.status`

---

## §B. Eval-Visual + §C. Eval-Interaction

PR-17b round 1 동일 패턴. ch06_q08~q10 + ch06_q05~q07 회귀 spot-check.

> ⚠️ **Eval-Visual q10**: 5칸 PairFlow 사용 시 desktop 5열 / mobile 2열 분할 확인 (PR-17a round 3 검증 패턴)
> ⚠️ **Eval-Interaction**: PR-17b 의 progress.ts dev skip 자동 수혜 — dev console 에러 0 자연스럽게 통과

`qa/ao-logs/pr17c-r1-eval-{visual,interaction}.status` + `qa-eval/pr17c-eval-{visual,interaction}-round1.json`.

---

## 변경 기록

| 2026-05-04 | 초기 작성. PR-17b 머지 직후 ch06 q08~q10 (q10=5칸 wide). ch06 마무리 |
