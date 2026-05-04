# HANDOFF-pr18b-round1 — ch07 q05~q06 인라인 변환 (DB 마무리)

> **PR**: PR-18b — ch07 2 데모 (q05~q06)
> **base**: `main` (`15db3b2` PR-18a 머지 후)
> **브랜치**: `feat/preview-inline-ch07-q5-q6`
> **에픽**: 12/18

---

## 0. 메타

| key | value |
|---|---|
| step | pr18b |
| round | 1 |
| branch | feat/preview-inline-ch07-q5-q6 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **all-roles model override** | **codex** |

---

## 1. ch07 q05~q06 매핑 (SDD §4.2)

| qaId | 메타포 | IT (SDD spec) | 형태 | layout |
|---|---|---|---|---|
| ch07_q05 | 한 표/분리/이상/3정규형 | 미정규/분리/갱신 이상/3NF | A Flow | wide |
| ch07_q06 | 더티/커밋/반복/직렬 | Dirty Read/Read Committed/Repeatable/Serializable | A Flow | wide |

**톤**: `getTone(7)` = purple-700

---

## 🚨 본 PR 핵심 함정 — q06 영문 라벨 길이 한도

| SDD spec 라벨 | 글자수 | 문제 | 권장 |
|---|---|---|---|
| `Dirty Read` | 10 | maxLabelLength 8 초과 ❌ | label `'더티'` + sub `'Dirty Read'` |
| `Read Committed` | 14 | 초과 ❌ | label `'커밋 읽기'` (5) + sub `'Read Committed'` |
| `Repeatable` | 10 | 초과 ❌ | label `'반복 가능'` (5) + sub `'Repeatable'` |
| `Serializable` | 12 | 초과 ❌ | label `'직렬화'` (3) + sub `'Serializable'` |
| `3NF` | 3 | OK | label `'3NF'` 또는 `'3 정규형'` (5) |

> **labels.ts:13 maxLabelLength = 8자**. PR-17c POST 자가진단 학습.
>
> **권장 전략**: q06 의 4 IT 라벨은 모두 한국어 표기로 통일 + sub 에 영문 보조.
>
> **regex `^(OS|API|DB|UI|JS|CSS|HTML)$`**: 본 PR 에서 트리거 라벨 없음 (3NF / 한국어 / 짧은 약자 모두 미포함).
>
> **DB 부분 문자열 0건 (PR-18a 학습)**: Hero eyebrow / itTitle / LogBox title 에 'DB' 부분 문자열 회피. `'데이터베이스'` 사용.

---

## §A. Generator (Codex)

### §A 시작

1. `cd /home/claude/architecture && git fetch origin main && git checkout main && git pull --ff-only`
2. `git log -1` → `15db3b2 feat(preview): ch07 q01~q04 인라인 변환 (PR-18a, DB 시작)` 확인
3. `git checkout feat/preview-inline-ch07-q5-q6`
4. **🚨 모든 commit feat 브랜치 위 직접** (codex chore 브랜치 만들지 말 것 — PR-17c, PR-18a 학습)
5. force push 금지

### §A STEP

#### STEP 1 — SVG 추가

**metaphor.tsx**:
- q05: TableSingleIcon (한 표) / SeparateIcon (재사용 가능 — PR-16a) / AnomalyIcon (이상) / NormalFormIcon (3정규형)
- q06: DirtyIcon (더티) / CommitIcon (커밋 — 재사용 PR-14a/b) / RepeatableIcon (반복) / SerialIcon (직렬)

**computer.tsx**:
- q05: UnnormalizedIcon / NormalizeIcon (재사용 PR-15a) / UpdateAnomalyIcon (재사용 PR-15a) / ThirdNfIcon
- q06: DirtyReadIcon / ReadCommittedIcon / RepeatableReadIcon / SerializableIcon

#### STEP 2 — `Q05Normalization.tsx` (PairFlow wide — A)

```ts
const METAPHOR = [
  { icon: <Icons.TableSingleIcon />, label: '한 표',   sub: '모든 데이터' },
  { icon: <Icons.SeparateIcon />,    label: '분리',     sub: '테이블 나눔' },
  { icon: <Icons.AnomalyIcon />,     label: '이상',     sub: '갱신 위험' },
  { icon: <Icons.NormalFormIcon />,  label: '3정규형',  sub: '정규화 결과' },
];
const IT = [
  { icon: <Icons.UnnormalizedIcon />,  label: '미정규',     sub: '중복 多' },
  { icon: <Icons.NormalizeIcon />,     label: '분리',       sub: '관계 정리' },
  { icon: <Icons.UpdateAnomalyIcon />, label: '갱신 이상',  sub: 'update anomaly' },
  { icon: <Icons.ThirdNfIcon />,       label: '3NF',         sub: 'third normal' },
];
tone: getTone(7)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

> **`'3정규형'` = 4자**, `'3NF'` = 3자, `'갱신 이상'` = 5자 (공백 포함). 모두 8자 한도 안.

#### STEP 3 — `Q06IsolationLevel.tsx` (PairFlow wide — A)

```ts
const METAPHOR = [
  { icon: <Icons.DirtyIcon />,      label: '더티', sub: '미확정 읽음' },
  { icon: <Icons.CommitIcon />,     label: '커밋', sub: '확정 읽음' },
  { icon: <Icons.RepeatableIcon />, label: '반복', sub: '같은 결과' },
  { icon: <Icons.SerialIcon />,     label: '직렬', sub: '한 줄로' },
];
const IT = [
  { icon: <Icons.DirtyReadIcon />,      label: '더티 읽기',  sub: 'Dirty Read' },
  { icon: <Icons.ReadCommittedIcon />,  label: '커밋 읽기',  sub: 'Read Committed' },
  { icon: <Icons.RepeatableReadIcon />, label: '반복 읽기',  sub: 'Repeatable Read' },
  { icon: <Icons.SerializableIcon />,   label: '직렬화',    sub: 'Serializable' },
];
tone: getTone(7)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

> **모든 IT 라벨 ≤ 8자**: `'더티 읽기'` (5), `'커밋 읽기'` (5), `'반복 읽기'` (5), `'직렬화'` (3). 영문 sub 에 정규 명칭 분리.

#### STEP 4 — `data/demos.ts` 신규 entry 2개 + `registry.ts`

```ts
ch07_q05: { Component: Q05Normalization,    layout: 'wide' },
ch07_q06: { Component: Q06IsolationLevel,   layout: 'wide' },
```

> 🚨 ID 정렬 grep 필수.

### §A 절대 금지

- ch01~ch06 + ch07_q01~q04 + ch08~ch10 콘텐츠 수정
- `_shared/*`, `pair-block.tsx`, `design-tokens.css`, `PreviewPanel.tsx`, `LearnPage.tsx`, `progress.ts`, `_shared/labels.ts` 변경
- raw hex, master/main push, force push

### §A 검증 (자체 보고)

1. `npm run build` 무에러
2. `/library/7/ch07_q05~q06` 2 라우트 접근
3. purple-700 series accent
4. raw hex grep 0건 / `_shared` 외 import 0건
5. **🚨 라벨 길이 awk grep**: `awk '/label:/ {match($0, /label: '\''([^'\'']+)'\''/, a); if (length(a[1]) > 8) print FILENAME":"NR": "a[1]" ("length(a[1])"자)"}' client/src/demos/ch07/Q0[5-6]*.tsx` → 0건
6. **🚨 raw 약자 grep 0건**: `grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML)'" client/src/demos/ch07/Q0[5-6]*.tsx`
7. **🚨 'DB' 부분 문자열 0건** (PR-18a 학습): `grep -n "DB" client/src/demos/ch07/Q0[5-6]*.tsx`
8. **🚨 ID 정렬 grep**

### §A 센티넬 → `qa/ao-logs/pr18b-r1-gen.status`

---

## §B + §C

PR-18a round 2 동일 패턴. ch07_q05~q06 + ch07_q01~q04 회귀 spot-check.

### 🚨 SHA 검증 (race 회피, PR-17c 학습)

§B/§C 시작 시 `git rev-parse HEAD` 가 Generator commit 또는 그 후 fix 와 일치하는지 확인. 불일치 시 fetch 재시도.

`qa-eval/pr18b-eval-{visual,interaction}-round1.json` + `qa/ao-logs/pr18b-r1-eval-{visual,interaction}.status` (`git add -f`).

---

## 변경 기록

| 2026-05-04 | 초기 작성. ch07 q05~q06 (DB 마무리). q06 영문 isolation level 한국어 + sub 분리 |
