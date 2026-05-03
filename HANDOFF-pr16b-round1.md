# HANDOFF-pr16b-round1 — ch05 q05~q07 인라인 변환 (웹·프론트백 마무리)

> **프로젝트**: `architecture`
> **PR**: PR-16b — ch05 3 데모 (`q05~q07`) React 인라인 변환 (웹·프론트백 · sky-600 톤 — ch05 마무리)
> **base**: `main` (`ca5fea8` PR-16a 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch05-q5-q7` (이미 origin push 완료)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §4.2 ch05)
> **참조 패턴**: PR-15b/16a 방식 — q05/q06 PairMatch wide → `Q06Backup.tsx` (ch04), q07 PairFlow wide → `Q03DataDup.tsx` (ch04) 또는 `Q01Test.tsx` (ch03)
> **에픽 위치**: 챕터 프레임 통일 에픽 7/18

---

## 0. 메타

| key | value |
|---|---|
| step | pr16b |
| round | 1 |
| branch | feat/preview-inline-ch05-q5-q7 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | **codex** |
| **eval-interaction model override** | **codex** |

---

## 1. ch05 q05~q07 매핑 (SDD §4.2 잠금)

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 | layout |
|---|---|---|---|---|---|
| ch05_q05 | 분산 / 공유 / 변경 / 도구 | 로컬 / 공용 / 갱신 / 도구 선택 | 사용 | **C Match** (PairMatch) | wide |
| ch05_q06 | 반복 / 부품 / 선택 / 팀 | 반복 줄임 / 컴포넌트 / 선택 / 팀 규칙 | 사용 | **C Match** (PairMatch) | wide |
| ch05_q07 | 개발 / 묶기 / 최적화 / 배포 | dev / 번들 / 최적화 / 배포 준비 | 사용 | **A Flow** (PairFlow) | wide |

**챕터 톤**: `getTone(5)` = sky-600 (PR-16a 와 동일)

---

## §A. Generator (Codex)

### §A 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin main && git checkout main && git pull --ff-only`
3. `git log --oneline -1` 확인 (`ca5fea8 feat(preview): ch05 q01~q04 인라인 변환 (PR-16a)` 이후)
4. `git checkout feat/preview-inline-ch05-q5-q7`
5. 모든 commit 은 본 브랜치 위에 직접
6. `git push origin feat/preview-inline-ch05-q5-q7` (force 금지)

### §A 작업 단계

#### STEP 1 — 신규 SVG 아이콘

**`metaphor.tsx`** — 메타포 측 신규:
```
q05: 분산 (DistributedIcon) / 공유 (ShareIcon) / 변경 (ChangeIcon) / 도구 (ToolMetaIcon — ToolIcon 충돌 시 별명)
q06: 반복 (RepeatMetaIcon — RepeatIcon 충돌 시) / 부품 (PartMetaIcon — PartIcon 충돌 시) / 선택 (PickComponentIcon) / 팀 (TeamIcon)
q07: 개발 (DevMetaIcon) / 묶기 (BundleMetaIcon) / 최적화 (OptimizeIcon) / 배포 (DeployMetaIcon)
```

**`computer.tsx`** — IT 측 신규:
```
q05: 로컬 (LocalIcon) / 공용 (SharedIcon) / 갱신 (UpdateIcon) / 도구 선택 (ToolPickIcon)
q06: 반복 줄임 (DryIcon) / 컴포넌트 (ComponentIcon) / 선택 (PickItIcon) / 팀 규칙 (TeamRuleIcon)
q07: dev (DevServerIcon) / 번들 (BundleItIcon) / 최적화 (OptimizeItIcon) / 배포 준비 (DeployItIcon)
```

> **충돌 회피**: `ToolIcon`, `RepeatIcon`, `PartIcon` 등 기존 아이콘 라벨 일치 시 prefix/suffix.
> **재사용 후보**: `BalanceItIcon`, `IntegrationIcon` 등.

#### STEP 2 — `Q05PackageManager.tsx` (PairMatch wide — C)

```ts
metaphorTitle: '도구 함의 변화'  (자유)
itTitle: '의존성 관리'
metaphor: [
  { icon: <Icons.DistributedIcon />, label: '분산', sub: '여러 장소' },
  { icon: <Icons.ShareIcon />,       label: '공유', sub: '함께 사용' },
  { icon: <Icons.ChangeIcon />,      label: '변경', sub: '버전 갱신' },
  { icon: <Icons.ToolMetaIcon />,    label: '도구', sub: '용도별 선택' },
]
it: [
  { icon: <Icons.LocalIcon />,    label: '로컬',    sub: 'node_modules' },
  { icon: <Icons.SharedIcon />,   label: '공용',    sub: 'package.json' },
  { icon: <Icons.UpdateIcon />,   label: '갱신',    sub: 'install/update' },
  { icon: <Icons.ToolPickIcon />, label: '도구 선택', sub: 'npm/pnpm/yarn' },
]
tone: getTone(5)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 3 — `Q06ComponentReuse.tsx` (PairMatch wide — C)

```ts
metaphorTitle: '재사용 4단계'  (자유)
itTitle: '컴포넌트 패턴'
metaphor: [
  { icon: <Icons.RepeatMetaIcon />,      label: '반복', sub: '같은 코드' },
  { icon: <Icons.PartMetaIcon />,        label: '부품', sub: '쪼갠 단위' },
  { icon: <Icons.PickComponentIcon />,   label: '선택', sub: '맞는 부품' },
  { icon: <Icons.TeamIcon />,            label: '팀',   sub: '공유 규칙' },
]
it: [
  { icon: <Icons.DryIcon />,        label: '반복 줄임', sub: 'DRY' },
  { icon: <Icons.ComponentIcon />,  label: '컴포넌트', sub: '재사용 단위' },
  { icon: <Icons.PickItIcon />,     label: '선택',     sub: '용도 매핑' },
  { icon: <Icons.TeamRuleIcon />,   label: '팀 규칙',  sub: 'Storybook' },
]
tone: getTone(5)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 4 — `Q07BuildDeploy.tsx` (PairFlow wide — A)

```ts
metaphorTitle: '제품 출시 흐름'  (자유)
itTitle: '빌드 & 배포'
metaphor: [
  { icon: <Icons.DevMetaIcon />,    label: '개발',   sub: '코딩' },
  { icon: <Icons.BundleMetaIcon />, label: '묶기',   sub: '하나로' },
  { icon: <Icons.OptimizeIcon />,   label: '최적화', sub: '빠르게' },
  { icon: <Icons.DeployMetaIcon />, label: '배포',   sub: '서비스로' },
]
it: [
  { icon: <Icons.DevServerIcon />,  label: 'dev',       sub: 'HMR' },
  { icon: <Icons.BundleItIcon />,   label: '번들',     sub: 'Vite/Webpack' },
  { icon: <Icons.OptimizeItIcon />, label: '최적화',   sub: 'minify/split' },
  { icon: <Icons.DeployItIcon />,   label: '배포 준비', sub: 'CDN/Server' },
]
tone: getTone(5)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 5 — `data/demos.ts` 신규 entry 3개 + `registry.ts` 라우트 3개

> **🚨 PR-15a round 1 fail 재발 방지** — `data/demos.ts` ↔ SCENES 키 정확히 일치.

`registry.ts`:
```ts
ch05_q05: { Component: Q05PackageManager,   layout: 'wide' },
ch05_q06: { Component: Q06ComponentReuse,   layout: 'wide' },
ch05_q07: { Component: Q07BuildDeploy,      layout: 'wide' },
```

### §A 절대 금지

- ch01~ch04 + ch05_q01~q04 + ch06~ch10 콘텐츠 수정
- `_shared/*` 공용 계약 변경 (PR-12 잠금)
- `_shared/pair-block.tsx`, `_shared/design-tokens.css`, `PreviewPanel.tsx`, `LearnPage.tsx`, `_shared/labels.ts` 변경
- raw hex, master/main push, force push

### §A 검증

1. `cd client && npm run build` 무에러
2. `/library/5/ch05_q05~q07` 3 라우트 접근 가능
3. 3 데모 모두 sky-600 accent (PR-16a 와 동일 톤)
4. raw hex grep 0건
5. `_shared` 외 import 0건
6. **🚨 raw 약자 단독 grep 0건**: `grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML)'" client/src/demos/ch05/*.tsx` (PR-16a round 1 fail 패턴 재발 방지). 필요 시 한+영 병기 (`'개발 dev'` 또는 `'개발 서버 dev'` 등).
7. **🚨 시나리오 ID 정렬 grep**: `data/demos.ts` ch05 ids ↔ 컴포넌트 SCENES 키 1:1
8. dev mode (`npm run dev`) 직접 진입 + 시나리오 탭 클릭 + deep-link `#<scenario>` 모두 동작 확인 (build PASS 만으로는 fail 잡지 못함)

> ⚠️ `'dev'` 라벨은 raw 약자 정규식에 없으나 길이 3자 — 시각적으로 단조로울 수 있음. 한+영 병기 예: `'개발 dev'` 또는 `'dev 서버'` 권장 (자율 판단).

### §A 완료 시 센티넬

`qa/ao-logs/pr16b-r1-gen.status`:
```json
{"status":"done","step":"pr16b","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch05-q5-q7","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"ch05 q05~q07 3 demos (모두 wide). sky-600 톤. raw 약자 0건 + ID 정렬 검증 완료."}
```

---

## §B. Eval-Visual (Codex)

PR-16a round 2 §B 동일 V1~V9. ch05_q05~q07 + ch05 q01~q04 회귀 spot-check 1건.

`qa/ao-logs/pr16b-r1-eval-visual.status` + `qa-eval/pr16b-eval-visual-round1.json`.

---

## §C. Eval-Interaction (Codex)

PR-16a round 1 §C 동일 I1~I8 (특히 I5/I7/I8 ID 정렬 + I7 deep-link).

> ⚠️ **중요**: I4 라벨 길이 외 **raw 약자 grep 추가 검증** (`labels.ts:8` 정규식 위반 0건). PR-16a round 1 sample fail 학습 — `npm run build` 만으로는 안 잡힘. dev mode `npm run dev` 띄우고 첫 라우트 진입 시 콘솔 에러 0건 확인 필수.

`qa/ao-logs/pr16b-r1-eval-interaction.status` + `qa-eval/pr16b-eval-interaction-round1.json`.

---

## 2. Master verdict 수령 절차

3 PASS → PR / 1+ REVISE/FAIL → round 2 / SHA mismatch → stale 의심.

---

## 3. PR-16a 학습 반영

| 학습 | 본 PR-16b 적용 |
|---|---|
| **raw 약자 단독 import-time throw** (PR-16a round 1 V1~V9 + V7 모두 fail) | §A 검증 6번 + §C 에 raw 약자 grep 강제 명시 |
| **eval-interaction `npm run build` false PASS** | §C 에 dev mode 콘솔 에러 확인 추가 |

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. PR-16a 머지 직후 ch05 q05~q07 진입. ch05 마무리 |
