# HANDOFF-pr14a-round1 — ch03 q01~q04 인라인 변환

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-14a — ch03 4 데모 (`q01~q04`) React 인라인 변환 (개발 사이클 · green-600 톤)
> **base**: `main` (`97b1eea` 또는 그 이후)
> **작업 브랜치**: `feat/preview-inline-ch03-q1-q4` (main 기준 분기)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §4.2 ch03)
> **참조 패턴**: `client/src/demos/ch01/Q01Ramen.tsx` (PairFlow), `Q02Stage.tsx` (PairBinary), `Q03Restaurant.tsx` (PairMatch), `Q04Bookshelf.tsx` (PairVertical), `client/src/demos/ch02/Q01Software.tsx`~`Q04Cloud.tsx` (PR-13 베이스라인)
> **에픽 위치**: 챕터 프레임 통일 에픽 2/18 (PR-13 ✅ → **PR-14a** → PR-14b → ... → PR-22)

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr14a |
| round | 1 |
| branch | feat/preview-inline-ch03-q1-q4 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** (사유: 신규 SVG ~25 + 4 데모 변환 + registry 등록) |
| **eval-visual model override** | **codex** (시각/인터랙션 둘 다 Codex 단독 운영) |
| **eval-interaction model override** | **codex** |

---

## 1. ch03 q01~q04 매핑 (SDD v2.2 §4.2 — 잠금됨)

| qaId | 메타포 라벨 (4개) | IT 라벨 (4개) | sub | 형태 | layout |
|---|---|---|---|---|---|
| ch03_q01 | 부품 / 연결 / 사용 / 균형 | 단위 / 통합 / E2E / 균형 | 사용 | **C Match** (PairMatch) | wide |
| ch03_q02 | 빨강 / 초록 / 정리 / 반복 | Red / Green / Refactor / Loop | 사용 | **A Flow** (PairFlow) | wide |
| ch03_q03 | 커밋 / 빌드 / 테스트 / 보고 | 커밋 감지 / 빌드 / 테스트 / 리포트 | 사용 | **A Flow** (PairFlow) | wide |
| ch03_q04 | 빠른 / 리허설 / 실제 / 자동 | dev / staging / prod / CD | 사용 | **A Flow** (PairFlow) | wide |

**챕터 톤**: `getTone(3)` = green-600 (`#16a34a`) / soft `#f0fdf4` / border `#86efac`

---

## §A. Generator (Codex)

### §A 시작 단계 (절대 준수)

1. `cd /home/claude/architecture`
2. `git fetch origin main && git checkout main && git pull --ff-only`
3. `git log --oneline -1` 확인 (`97b1eea` 또는 이후 커밋)
4. `git checkout -b feat/preview-inline-ch03-q1-q4` (없으면) 또는 `git checkout feat/preview-inline-ch03-q1-q4` (있으면)
5. 모든 commit 은 본 브랜치 위에 직접 만든다. **별도 브랜치 생성 금지**
6. `git push -u origin feat/preview-inline-ch03-q1-q4` (force 금지)
7. **PR 생성 안 함** — Master 가 모든 verdict PASS 후 일괄 PR 생성

### §A 작업 단계

#### STEP 1 — 신규 SVG 아이콘 (`_shared/icons/`)

**규격**: SVG 24×24 viewBox, stroke="currentColor" strokeWidth={1.5}, fill="none". 기존 ch01·ch02 패턴 그대로 (PR-13 ac7331d 참고).

**`metaphor.tsx`** — 메타포 측 신규 (기존 아이콘과 충돌 없는 이름):
```
부품 (PartIcon) / 사용 (UseIcon — 기존 InstallIcon과 별도, 일반 사용 의미)
균형 (BalanceIcon — 메타포 측, 양팔저울)
빨강 (RedDotIcon) / 초록 (GreenDotIcon) / 정리 (TidyIcon) / 반복 (RepeatIcon)
커밋 (CommitIcon) / 빌드 (BuildIcon) / 테스트 (TestIcon) / 보고 (ReportIcon)
빠른 (FastIcon) / 리허설 (RehearsalIcon) / 실제 (RealIcon) / 자동 (AutoIcon)
```

> **연결** 라벨은 기존 `LinkIcon` (ch02 q03) 재사용.

**`computer.tsx`** — IT 측 신규:
```
단위 (UnitIcon) / 통합 (IntegrationIcon) / E2E (E2EIcon) / 균형 (BalanceItIcon — metaphor 와 충돌 시 별도)
Red (RedTestIcon) / Green (GreenTestIcon) / Refactor (RefactorIcon) / Loop (LoopIcon)
커밋감지 (CommitDetectIcon) / 빌드 (ItBuildIcon — metaphor BuildIcon 과 충돌 시 별도) / 테스트 (ItTestIcon — 충돌 시) / 리포트 (ReportLogIcon)
dev (DevIcon) / staging (StagingIcon) / prod (ProdIcon) / CD (CdIcon)
```

> 충돌 회피 규칙: metaphor 와 같은 영문 이름이면 IT 측은 `It` prefix 또는 별도 컨셉 이름. 기존 PR-13 의 `InstallIcon` (metaphor) ↔ `ItInstallIcon` (IT) 패턴 그대로.

> **import**: 모두 `_shared/icons/index.ts` 의 `export *` 에 자동 노출. 수동 추가 불필요.

#### STEP 2 — `client/src/demos/ch03/Q01Test.tsx` (PairMatch wide)

ch01 `Q03Restaurant.tsx` (PairMatch) 또는 ch02 `Q01Software.tsx` 패턴 복붙 후 다음 데이터로 교체:

```ts
metaphorTitle: '품질 점검 단계'  (또는 적절한 메타포 제목 — 자유 판단)
itTitle: '테스트 단계'
metaphor: [
  { icon: <Icons.PartIcon />,    label: '부품', sub: '사용' },
  { icon: <Icons.LinkIcon />,    label: '연결', sub: '사용' },
  { icon: <Icons.UseIcon />,     label: '사용', sub: '사용' },
  { icon: <Icons.BalanceIcon />, label: '균형', sub: '사용' },
]
it: [
  { icon: <Icons.UnitIcon />,        label: '단위',   sub: '사용' },
  { icon: <Icons.IntegrationIcon />, label: '통합',   sub: '사용' },
  { icon: <Icons.E2EIcon />,         label: 'E2E',    sub: '사용' },
  { icon: <Icons.BalanceItIcon />,   label: '균형',   sub: '사용' },  // 또는 BalanceIcon 공유
]
tone: getTone(3)  // green-600
```

SCENES 4개 (활성 인덱스 0~3 슬라이딩, 각 시나리오 title/summary/active/lanes/note/logs). 시나리오 ID 자유 명명 (예: `unit/integration/e2e/balance`).

#### STEP 3 — `Q02TddCycle.tsx` (PairFlow wide)

```ts
metaphorTitle: '신호등 점검 사이클'  (자유)
itTitle: 'TDD 사이클'
metaphor: [
  { icon: <Icons.RedDotIcon />,   label: '빨강', sub: '사용' },
  { icon: <Icons.GreenDotIcon />, label: '초록', sub: '사용' },
  { icon: <Icons.TidyIcon />,     label: '정리', sub: '사용' },
  { icon: <Icons.RepeatIcon />,   label: '반복', sub: '사용' },
]
it: [
  { icon: <Icons.RedTestIcon />,   label: 'Red',      sub: '사용' },
  { icon: <Icons.GreenTestIcon />, label: 'Green',    sub: '사용' },
  { icon: <Icons.RefactorIcon />,  label: 'Refactor', sub: '사용' },
  { icon: <Icons.LoopIcon />,      label: 'Loop',     sub: '사용' },
]
tone: getTone(3)
```

#### STEP 4 — `Q03CiCd.tsx` (PairFlow wide)

```ts
metaphorTitle: '제출 → 검수 흐름'  (자유)
itTitle: 'CI 파이프라인'
metaphor: [
  { icon: <Icons.CommitIcon />, label: '커밋', sub: '사용' },
  { icon: <Icons.BuildIcon />,  label: '빌드', sub: '사용' },
  { icon: <Icons.TestIcon />,   label: '테스트', sub: '사용' },
  { icon: <Icons.ReportIcon />, label: '보고', sub: '사용' },
]
it: [
  { icon: <Icons.CommitDetectIcon />, label: '커밋 감지', sub: '사용' },
  { icon: <Icons.ItBuildIcon />,      label: '빌드',      sub: '사용' },  // 또는 BuildIcon 공유
  { icon: <Icons.ItTestIcon />,       label: '테스트',    sub: '사용' },  // 또는 TestIcon 공유
  { icon: <Icons.ReportLogIcon />,    label: '리포트',    sub: '사용' },
]
tone: getTone(3)
```

#### STEP 5 — `Q04Deploy.tsx` (PairFlow wide)

```ts
metaphorTitle: '공연 단계 흐름'  (자유)
itTitle: '배포 환경 흐름'
metaphor: [
  { icon: <Icons.FastIcon />,      label: '빠른',   sub: '사용' },
  { icon: <Icons.RehearsalIcon />, label: '리허설', sub: '사용' },
  { icon: <Icons.RealIcon />,      label: '실제',   sub: '사용' },
  { icon: <Icons.AutoIcon />,      label: '자동',   sub: '사용' },
]
it: [
  { icon: <Icons.DevIcon />,     label: 'dev',     sub: '사용' },
  { icon: <Icons.StagingIcon />, label: 'staging', sub: '사용' },
  { icon: <Icons.ProdIcon />,    label: 'prod',    sub: '사용' },
  { icon: <Icons.CdIcon />,      label: 'CD',      sub: '사용' },
]
tone: getTone(3)
```

#### STEP 6 — `client/src/demos/registry.ts` 에 ch03 4 라우트 등록

ch02 등록 패턴 그대로. 4 entries:
```ts
{ qaId: 'ch03_q01', module: () => import('./ch03/Q01Test') },
{ qaId: 'ch03_q02', module: () => import('./ch03/Q02TddCycle') },
{ qaId: 'ch03_q03', module: () => import('./ch03/Q03CiCd') },
{ qaId: 'ch03_q04', module: () => import('./ch03/Q04Deploy') },
```

> 정확한 entry 형식은 기존 `registry.ts` 의 ch02 entries 그대로 따름.

### §A 절대 금지

- ch01, ch02, ch03_q05~q07, ch04~ch10 콘텐츠 수정 (스코프 외)
- `_shared/*` 공용 계약 변경 (PR-12 잠금 — props/exports/types 무변경. 단 `_shared/icons/{metaphor,computer}.tsx` 에 신규 SVG 함수 추가는 허용 = export 추가만)
- iframe fallback 분기 제거 (PR-22 cleanup 영역)
- `_shared/pair-block.tsx`, `_shared/design-tokens.css` 변경 (PR-12·PR-13 잠금)
- DESIGN-POLICY §9.B-3 raw hex (디자인 토큰 사용)
- master 브랜치 직접 push, force push, no-verify commit

### §A 검증 (자체 보고 의무)

1. `cd client && npm run build` 무에러
2. dev 모드 (`npm run dev`) 에서 `/library/3/ch03_q01` ~ `q04` 4개 라우트 접근 가능
3. 4 데모 모두 green-600 accent (active 셀 border) 표시 확인
4. raw hex grep 0건: `grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos/ch03 --include="*.tsx"`
5. `_shared` 외 import 0건: `grep -E "from ['\"]\.\.?/_shared/[^i]" client/src/demos/ch03/*.tsx`

### §A 완료 시 센티넬

파일: `qa/ao-logs/pr14a-r1-gen.status`

```json
{"status":"done","step":"pr14a","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch03-q1-q4","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"ch03 q01~q04 4 demos 인라인 + 메타포/IT 신규 SVG ~25 + registry 4 라우트 등록. green-600 톤. C9 grep 0건 확인."}
```

---

## §B. Eval-Visual (Codex)

### §B 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch03-q1-q4`
3. `git checkout feat/preview-inline-ch03-q1-q4`
4. `git rev-parse HEAD` 가 Generator 센티넬 SHA 와 일치 확인
5. `cd client && npm install --no-audit --no-fund && npm run dev` — localhost:5176
6. **코드 수정 절대 금지** — 위반은 verdict 와 fail_items/revise_items 로만 보고

### §B 검증 매트릭스 (V1~V9)

PR-13 round 3 ALL PASS 매트릭스 그대로. **viewport 1440×900 (desktop) + 393×852 (mobile) 양쪽 모두**:

- **V1 frame inline**: `.phone-frame` / `.phone-notch` 0건 — 4 데모 모두 React 인라인
- **V2 3단 구조 (desktop)**: Hero (green-50 그라디언트) → Pair Block (메타포 + 커넥터 "같은 원리" + IT) → State + Log 순서
- **V3 active 동기화**: 시나리오 칩 클릭 → 메타포 셀 + IT 셀 동시 활성화 (인덱스 0~3)
- **V4 accent contrast WCAG AA**: ch03 active accent (`#16a34a` 추정) on green-50 (`#f0fdf4`) 대비비 ≥ 4.5:1 — 1 셀 spot-check per demo
- **V5 width**: 4 데모 모두 wide → max-w-860px (PreviewPanel 분기). 데스크탑 좌우 여백 균등
- **V6 SVG 가시성**: 모든 셀에 SVG. active = green stroke / inactive = muted stroke
- **V7 baseline ch01·ch02 일관성**: ch01 (orange) / ch02 (cyan) / ch03 (green) 챕터 톤 분리 명확
- **V8 mobile first-viewport (393×852)**: ScenarioPicker chips 가 첫 화면 안 (PR-13 round 3 fix 자동 수혜)
- **V9 mobile grid transform (393×852)**: wide 4-col → 2-col, square 2-col → 1-col (PR-13 round 2 pair-block.tsx fix 자동 수혜)

### §B 결과물

- 평가 보고: `qa-eval/pr14a-eval-visual-round1.json`
- 센티넬: `qa/ao-logs/pr14a-r1-eval-visual.status`

```json
{"status":"done","step":"pr14a","role":"eval-visual","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch03-q1-q4","fail_items":[],"revise_items":[]}
```

---

## §C. Eval-Interaction (Codex)

### §C 시작 단계 (B 와의 worktree 충돌 회피)

1. `cd /home/claude/architecture`
2. `git fetch origin feat/preview-inline-ch03-q1-q4`
3. `git checkout --detach origin/feat/preview-inline-ch03-q1-q4`
4. `git rev-parse HEAD` 로 SHA 확인
5. `cd client && npm install --no-audit --no-fund`
6. **코드 수정 절대 금지**

### §C 검증 매트릭스 (I1~I8) — PR-13 round 3 ALL PASS 그대로

- **I1.1 build PASS**: `cd client && npm run build` 무에러 + `cd ../server && npm run build` 무에러
- **I1.2 raw hex 0건**: `grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos/ch03 --include="*.tsx" --include="*.ts"` 빈 결과
- **I1.3 _shared 외 import 0건**: `grep -E "from ['\"]\.\.?/_shared/[^i]" client/src/demos/ch03/*.tsx` 빈 결과 (단 `from '../types'` 1건 허용)
- **I1.4 라벨 길이**: `validateLabel` 호출 0 throws (LABEL_RULES 위반 0건). 한글 8자 / 영문 16자 초과 없음 — ch03 라벨 모두 충족 (최장 "Refactor" = 8자, "커밋 감지" = 5자, 모두 OK)
- **I2 active 동기화**: PairMatch / PairFlow active prop 정상 전달
- **I3 validatePairSet 정상 호출** — 모듈 로드 시 throw 0건
- **I4 registry 4 entries 정확 등록** — ch03_q01~q04 라우트
- **I5 _shared 변경 0건 확인**: `git diff main..HEAD -- client/src/demos/_shared/{pair-block.tsx,index.ts,labels.ts,design-tokens.css,types.ts}` 빈 결과
- **I6 ch01·ch02 무회귀**: `git diff main..HEAD -- client/src/demos/ch01 client/src/demos/ch02` 빈 결과
- **I7 시나리오 hash 동작**: 칩 클릭 → URL hash 변경 → InlineComponent rerender 정상
- **I8 콘텐츠 1:1 일치**: SCENES 4개의 `lanes` 와 `active` 인덱스 정합 (lanes 배열 인덱스 = active 값)

### §C 결과물

- 평가 보고: `qa-eval/pr14a-eval-interaction-round1.json`
- 센티넬: `qa/ao-logs/pr14a-r1-eval-interaction.status`

```json
{"status":"done","step":"pr14a","role":"eval-interaction","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","verdict":"PASS|REVISE|FAIL","commit":"<Gen SHA>","branch":"feat/preview-inline-ch03-q1-q4","fail_items":[],"revise_items":[]}
```

---

## 2. Master verdict 수령 절차

1. 3 센티넬 모두 PASS → Master 가 PR 생성: `gh pr create --base main --head feat/preview-inline-ch03-q1-q4 --title "feat(preview): ch03 q01~q04 인라인 변환 (개발 사이클 · green-600) (PR-14a)"`
2. 1개라도 REVISE/FAIL → fail_items + revise_items 분석 → round 2 핸드오프 갱신 → 재spawn (no-stop, ALL PASS 까지)
3. `commit` 필드 불일치 → verdict 무시 + 재spawn

---

## 3. PR-13 학습 반영

| 학습 | 본 PR-14a 적용 |
|---|---|
| ready 오감지 mid-work kill | lib.sh 패치 적용됨 (master `65dbaf9`) — 안전 |
| 모바일 grid 누락 (PR-13 round 1 V9 FAIL) | PR-13 round 2 pair-block.tsx fix 자동 수혜 — round 1 PASS 예상 |
| 모바일 first-viewport (PR-13 round 1+2 V8 FAIL) | PR-13 round 3 PreviewPanel.tsx fix 자동 수혜 — round 1 PASS 예상 |
| Codex 명세 누락 (라벨 16개 → 12개) | 본 핸드오프에 정확한 라벨 표 + 16 metaphor + 16 IT 명시 |

PR-13 round 3 의 ALL PASS 인프라 (pair-block.tsx mobile responsive + PreviewPanel.tsx flex-col-reverse) 는 main 머지됨 (`6ed2736`). PR-14a 는 콘텐츠만 추가하면 round 1 ALL PASS 가능성 매우 높음.

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-03 | 초기 작성. PR-13 round 3 ALL PASS 직후 ch03 q01~q04 진입. PR-13 학습 반영 |
