# HANDOFF-pr15a-round1 — ch04 q01~q04 인라인 변환 (데이터 도메인 시작)

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-15a — ch04 4 데모 (`q01~q04`) React 인라인 변환 (데이터 · amber-700 톤 — ch04 시작)
> **base**: `main` (`ec6413b` PR-14b 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch04-q1-q4` (main 기준 분기, 이미 origin push 완료)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §4.2 ch04)
> **참조 패턴**: `client/src/demos/ch01/Q04Bookshelf.tsx` (D square / PairVertical), `client/src/demos/ch01/Q03Restaurant.tsx` (C wide / PairMatch), `client/src/demos/ch03/Q01Test.tsx` (A wide / PairFlow — 직전 챕터 톤만 다름)
> **에픽 위치**: 챕터 프레임 통일 에픽 4/18 (PR-13 ✅ → PR-14a ✅ → PR-14b ✅ → **PR-15a** → PR-15b → ... → PR-22)

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr15a |
| round | 1 |
| branch | feat/preview-inline-ch04-q1-q4 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | **codex** |
| **eval-interaction model override** | **codex** |

---

## 1. ch04 q01~q04 매핑 (SDD v2.2 §4.2 — 잠금됨)

| qaId | 메타포 라벨 (4개) | IT 라벨 (4개) | sub | 형태 | layout |
|---|---|---|---|---|---|
| ch04_q01 | 칸 / 틀 / 자유 / 선택 | 정형 / 반정형 / 비정형 / 상황별 | 사용 | **D Vertical** (PairVertical) | square |
| ch04_q02 | 표 / 상자 / 태그 / 선택 | CSV / JSON / XML / 무엇을 | 사용 | **C Match** (PairMatch) | wide |
| ch04_q03 | 중복 / 혼선 / 분리 / 균형 | 중복 / 수정 이상 / 분리 / 조회 균형 | 사용 | **A Flow** (PairFlow) | wide |
| ch04_q04 | 훑기 / 색인 / 점프 / 비용 | 전체 스캔 / 색인 / 위치 점프 / 정리 비용 | 사용 | **A Flow** (PairFlow) | wide |

**챕터 톤**: `getTone(4)` = amber-700 (`#b45309`) / amber-100 bg / amber-300 accent — SDD §4.0 컬러 표 잠금

---

## §A. Generator (Codex)

### §A 시작 단계 (절대 준수)

1. `cd /home/claude/architecture`
2. `git fetch origin main && git checkout main && git pull --ff-only`
3. `git log --oneline -1` 확인 (`ec6413b feat(preview): ch03 q05~q07 인라인 변환 + 24 SVG (PR-14b)` 이후)
4. `git checkout feat/preview-inline-ch04-q1-q4` (이미 main 기준으로 origin push 됨)
5. 모든 commit 은 본 브랜치 위에 직접 만든다. **별도 브랜치 생성 금지** (Eval 평가 보고용 codex/* branch 는 §B/§C 별도 허용)
6. `git push origin feat/preview-inline-ch04-q1-q4` (force 금지)
7. **PR 생성 안 함** — Master 가 모든 verdict PASS 후 일괄 PR 생성

### §A 작업 단계

#### STEP 1 — 신규 SVG 아이콘 (`_shared/icons/`)

**규격**: SVG 24×24 viewBox, stroke="currentColor" strokeWidth={1.5}, fill="none". PR-14a/14b 와 동일 패턴.

**`metaphor.tsx`** — 메타포 측 신규 (기존 아이콘과 충돌 회피):

```
q01: 칸 (CellIcon) / 틀 (FrameIcon) / 자유 (FreestyleIcon — FreedomIcon 충돌 시 별명) / 선택 (PickIcon)
q02: 표 (TableMetaIcon) / 상자 (BoxMetaIcon — BoxIcon 충돌 시 별명) / 태그 (TagIcon) / 선택 (PickFormatIcon)
q03: 중복 (DuplicateIcon) / 혼선 (ConfusionIcon) / 분리 (SplitIcon) / 균형 (BalanceMetaIcon — BalanceIcon 충돌 시 별명)
q04: 훑기 (BrowseIcon) / 색인 (BookmarkIcon) / 점프 (JumpIcon) / 비용 (CostIcon)
```

**`computer.tsx`** — IT 측 신규:

```
q01: 정형 (StructuredIcon) / 반정형 (SemiStructuredIcon) / 비정형 (UnstructuredIcon) / 상황별 (DataChoiceIcon)
q02: CSV (CsvIcon) / JSON (JsonIcon) / XML (XmlIcon) / 무엇을 (FormatChoiceIcon)
q03: 중복 (DataDupIcon) / 수정 이상 (UpdateAnomalyIcon) / 분리 (NormalizeIcon) / 조회 균형 (QueryBalanceIcon)
q04: 전체 스캔 (FullScanIcon) / 색인 (IndexIcon) / 위치 점프 (SeekIcon) / 정리 비용 (IndexCostIcon)
```

> **충돌 회피**: 기존 PR-12~14b 의 InstallIcon (metaphor) ↔ ItInstallIcon (IT) 패턴 그대로. metaphor·IT 양쪽에 같은 한국어 라벨이 등장하면 IT 측은 `Data*` / `Code*` 등 prefix 로 별도 컨셉 이름.
>
> **재사용 가능 후보**: `BoxIcon`, `BalanceIcon`, `FreedomIcon`, `BalanceItIcon` 등 기존 등록된 아이콘과 라벨이 동일하면 재사용. Codex 자율 판단.
>
> **데이터 도메인 신설**: `client/src/demos/_shared/icons/data.tsx` 는 현재 `export {};` 빈 stub. 새 SVG 를 metaphor.tsx / computer.tsx 에 추가하는 기존 컨벤션 그대로 유지 (도메인 분리 없이 단일 파일 누적). 만약 Codex 가 도메인 분리를 원하면 `data.tsx` 활용도 허용 — 단 `_shared/icons/index.ts` 의 `export *` 와 충돌 없는 unique 함수명 보장.

#### STEP 2 — `client/src/demos/ch04/Q01DataShape.tsx` (PairVertical square — D)

**참조**: `client/src/demos/ch01/Q04Bookshelf.tsx` (PairVertical 패턴), `client/src/demos/ch02/Q04Cloud.tsx`

```ts
metaphorTitle: '데이터 모양'  (자유 판단)
itTitle: '데이터 형태'
metaphor: [
  { icon: <Icons.CellIcon />,      label: '칸',   sub: '정해진 자리' },
  { icon: <Icons.FrameIcon />,     label: '틀',   sub: '느슨한 구조' },
  { icon: <Icons.FreestyleIcon />, label: '자유', sub: '형태 없음' },
  { icon: <Icons.PickIcon />,      label: '선택', sub: '상황별 결정' },
]
it: [
  { icon: <Icons.StructuredIcon />,     label: '정형',     sub: 'RDB · 표' },
  { icon: <Icons.SemiStructuredIcon />, label: '반정형',   sub: 'JSON · XML' },
  { icon: <Icons.UnstructuredIcon />,   label: '비정형',   sub: '문서 · 영상' },
  { icon: <Icons.DataChoiceIcon />,     label: '상황별',   sub: '용도 기반' },
]
tone: getTone(4)  // amber-700
validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' })
```

SCENES 4개 (활성 인덱스 0~3 슬라이딩). 시나리오 ID 자유 명명 (예: `cell/frame/free/choice`).

#### STEP 3 — `Q02DataFormat.tsx` (PairMatch wide — C)

**참조**: `client/src/demos/ch02/Q01Software.tsx`, `client/src/demos/ch01/Q03Restaurant.tsx`

```ts
metaphorTitle: '데이터 담는 방식'  (자유)
itTitle: '데이터 포맷'
metaphor: [
  { icon: <Icons.TableMetaIcon />,   label: '표',   sub: '행과 열' },
  { icon: <Icons.BoxMetaIcon />,     label: '상자', sub: '키-값 구조' },
  { icon: <Icons.TagIcon />,         label: '태그', sub: '꼬리표 구조' },
  { icon: <Icons.PickFormatIcon />,  label: '선택', sub: '용도별' },
]
it: [
  { icon: <Icons.CsvIcon />,          label: 'CSV',   sub: '행렬 표' },
  { icon: <Icons.JsonIcon />,         label: 'JSON',  sub: '키-값' },
  { icon: <Icons.XmlIcon />,          label: 'XML',   sub: '계층 태그' },
  { icon: <Icons.FormatChoiceIcon />, label: '무엇을', sub: '맞는 포맷' },
]
tone: getTone(4)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 4 — `Q03DataDup.tsx` (PairFlow wide — A)

**참조**: `client/src/demos/ch03/Q01Test.tsx` (직전 챕터 동일 layout · 톤만 변경)

```ts
metaphorTitle: '데이터 중복 흐름'  (자유)
itTitle: '정규화 흐름'
metaphor: [
  { icon: <Icons.DuplicateIcon />,   label: '중복', sub: '같은 정보' },
  { icon: <Icons.ConfusionIcon />,   label: '혼선', sub: '갱신 충돌' },
  { icon: <Icons.SplitIcon />,       label: '분리', sub: '한 곳 정리' },
  { icon: <Icons.BalanceMetaIcon />, label: '균형', sub: '읽기 vs 쓰기' },
]
it: [
  { icon: <Icons.DataDupIcon />,        label: '중복',     sub: '비효율' },
  { icon: <Icons.UpdateAnomalyIcon />,  label: '수정 이상', sub: '갱신 위험' },
  { icon: <Icons.NormalizeIcon />,      label: '분리',     sub: '정규화' },
  { icon: <Icons.QueryBalanceIcon />,   label: '조회 균형', sub: '비정규화' },
]
tone: getTone(4)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 5 — `Q04DataIndex.tsx` (PairFlow wide — A)

```ts
metaphorTitle: '책에서 찾기'  (자유)
itTitle: 'DB 색인 흐름'
metaphor: [
  { icon: <Icons.BrowseIcon />,  label: '훑기', sub: '처음부터 끝' },
  { icon: <Icons.BookmarkIcon />, label: '색인', sub: '미리 정리' },
  { icon: <Icons.JumpIcon />,     label: '점프', sub: '바로 위치' },
  { icon: <Icons.CostIcon />,     label: '비용', sub: '관리 부담' },
]
it: [
  { icon: <Icons.FullScanIcon />,  label: '전체 스캔', sub: '느림' },
  { icon: <Icons.IndexIcon />,     label: '색인',     sub: 'B-tree' },
  { icon: <Icons.SeekIcon />,      label: '위치 점프', sub: '빠름' },
  { icon: <Icons.IndexCostIcon />, label: '정리 비용', sub: '쓰기 ↑' },
]
tone: getTone(4)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 6 — `client/src/demos/registry.ts` 에 ch04 q01~q04 라우트 등록

PR-14b ch03 q05~q07 등록 패턴 그대로. 4 entries 추가:

```ts
import Q01DataShape from './ch04/Q01DataShape';
import Q02DataFormat from './ch04/Q02DataFormat';
import Q03DataDup from './ch04/Q03DataDup';
import Q04DataIndex from './ch04/Q04DataIndex';

// DEMO_REGISTRY 에 추가:
ch04_q01: { Component: Q01DataShape,  layout: 'square' },  // ← square (D Vertical)
ch04_q02: { Component: Q02DataFormat, layout: 'wide' },
ch04_q03: { Component: Q03DataDup,    layout: 'wide' },
ch04_q04: { Component: Q04DataIndex,  layout: 'wide' },
```

> **중요**: `ch04_q01` 만 `layout: 'square'` (D Vertical 변형). 나머지 3개는 `wide`.

### §A 절대 금지

- ch01, ch02, ch03 전체 + ch04_q05~q07 + ch05~ch10 콘텐츠 수정 (스코프 외)
- `_shared/*` 공용 계약 변경 (PR-12 잠금 — props/exports/types 무변경. 단 `_shared/icons/{metaphor,computer}.tsx` 또는 `_shared/icons/data.tsx` 에 신규 SVG 함수 추가는 허용)
- `_shared/pair-block.tsx`, `_shared/design-tokens.css`, `PreviewPanel.tsx` 변경 (PR-12·PR-13·PR-14a/b 잠금)
- iframe fallback 분기 제거 (PR-22 cleanup 영역)
- DESIGN-POLICY §9.B-3 raw hex (디자인 토큰 사용)
- master/main 브랜치 직접 push, force push, no-verify commit

### §A 검증 (자체 보고 의무)

1. `cd client && npm run build` 무에러
2. dev 모드 (`npm run dev`) 에서 `/library/4/ch04_q01` ~ `q04` 4개 라우트 접근 가능
3. 4 데모 모두 amber-700 accent 표시 확인 (PR-14b green-600 와 시각적 구분)
4. raw hex grep 0건: `grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos/ch04 --include="*.tsx"`
5. `_shared` 외 import 0건: `grep -E "from ['\"]\.\.?/_shared/[^i]" client/src/demos/ch04/*.tsx`
6. `git status` 새 디렉토리 (`client/src/demos/ch04/`) 와 파일 모두 staged 확인

### §A 완료 시 센티넬

파일: `qa/ao-logs/pr15a-r1-gen.status`

```json
{"status":"done","step":"pr15a","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch04-q1-q4","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"ch04 q01~q04 4 demos 인라인 + 메타포/IT 신규 SVG ~32 + registry 4 라우트 등록 (q01=square, q02~q04=wide). amber-700 톤 (ch04 시작)."}
```

---

## §B. Eval-Visual (Codex)

PR-14a/14b round 1 Eval-Visual 그대로. **viewport 1440×900 (desktop) + 393×852 (mobile) 양쪽 모두 V1~V9**:

- V1 frame inline / V2 desktop 3단 / V3 active 동기화 / V4 contrast / V5 width / V6 SVG / V7 baseline / V8 mobile first-viewport / V9 mobile grid

ch04_q01~q04 4 데모 검증 + ch03 q01~q07 회귀 spot-check 1건 (회귀 0 확인).

**추가 V check (D square 전용)**:
- V5 width: ch04_q01 만 `square` layout 이므로 max-width 640px 확인 (다른 3 wide 데모는 860px). SDD §6.0 너비 정합 표.

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch04-q1-q4`
3. `git checkout feat/preview-inline-ch04-q1-q4`
4. `git rev-parse HEAD` 가 Generator 센티넬 SHA 와 일치 확인
5. `cd client && npm install --no-audit --no-fund && npm run dev`
6. **코드 수정 절대 금지**

### §B 결과물

- 평가 보고: `qa-eval/pr15a-eval-visual-round1.json` (커밋 + push 권장)
- 센티넬: `qa/ao-logs/pr15a-r1-eval-visual.status`

```json
{"status":"done","step":"pr15a","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch04-q1-q4","fail_items":[],"revise_items":[]}
```

---

## §C. Eval-Interaction (Codex)

PR-14a/14b round 1 Eval-Interaction 그대로. I1~I8 정적 + 동작 검증.

### §C 시작 단계 (B 와의 worktree 충돌 회피)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch04-q1-q4`
3. `git checkout --detach origin/feat/preview-inline-ch04-q1-q4`
4. `git rev-parse HEAD` 로 SHA 확인
5. `cd client && npm install --no-audit --no-fund`
6. **코드 수정 절대 금지**

### §C 검증

- I1 build / I2 raw hex 0건 / I3 `_shared` 외 import 0건 / I4 라벨 길이 / I5 active 동기 / I6 validatePairSet (q01 layout='square' / q02~q04 layout='wide') / **I7 URL hash sync (PR-14a 인프라 자동 수혜)** / I8 콘텐츠 1:1
- **추가**: ch01~ch03 무회귀 — `git diff main..HEAD -- client/src/demos/ch01 client/src/demos/ch02 client/src/demos/ch03` 빈 결과
- **추가**: `_shared` + `PreviewPanel.tsx` 무변경 — `git diff main..HEAD -- client/src/demos/_shared/{pair-block.tsx,index.ts,labels.ts,design-tokens.css,types.ts} client/src/components/learn/PreviewPanel.tsx` 빈 결과

> ⚠️ **eval branch push 강제** (PR-14a/14b 회수 패턴): 평가 JSON 을 별도 브랜치 `codex/pr15a-r1-eval-{visual|interaction}` 에 작성하면 즉시 `git push origin <branch>` 강제 push (force 금지). Master 가 회수 가능하도록.

### §C 결과물

- 평가 보고: `qa-eval/pr15a-eval-interaction-round1.json` (커밋 + push 권장)
- 센티넬: `qa/ao-logs/pr15a-r1-eval-interaction.status`

```json
{"status":"done","step":"pr15a","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch04-q1-q4","fail_items":[],"revise_items":[]}
```

---

## 2. Master verdict 수령 절차

1. 3 센티넬 모두 PASS → Master 가 PR 생성: `gh pr create --base main --head feat/preview-inline-ch04-q1-q4 --title "feat(preview): ch04 q01~q04 인라인 변환 (PR-15a)"`
2. 1개라도 REVISE/FAIL → fail_items + revise_items 분석 → round 2 (no-stop, ALL PASS 까지)
3. `commit` 필드 불일치 → verdict 무시 + 재spawn (stale sentinel 패턴 — PR-14b round 1 재발 방지)

---

## 3. PR-14b 학습 반영

| 학습 | 본 PR-15a 적용 |
|---|---|
| Stale sentinel 오염 (PR-14b round 1 attempt 1·2 — 죽은 줄 알았던 이전 AO 세션이 뒤늦게 sentinel 작성) | round 진입 전 Master 가 `qa/ao-logs/pr15a-*` glob 모두 정리 + arch-NN 좀비 pkill |
| URL hash sync (PR-14a round 2 fix) | `PreviewPanel.tsx::handleScenarioHash` 인라인 path `window.history.replaceState` 자동 수혜 — round 1 PASS 예상 |
| Codex Eval branch push 미완료 (arch-70) | §C 에 push 강제 명시 (반복) |
| 모바일 grid + first-viewport (PR-13) | pair-block.tsx + PreviewPanel.tsx 인프라 자동 수혜 |
| D Vertical square layout (PR-14a/b 모두 wide) | §B V5 width check 에 q01 square (640px) 명시 — wide 와 다름 |

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-03 | 초기 작성. PR-14b 머지 직후 ch04 q01~q04 진입. ch04 첫 PR — D square 변형 등장 |
