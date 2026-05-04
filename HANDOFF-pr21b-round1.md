# HANDOFF-pr21b-round1 — ch10 q05~q07 인라인 변환 (클라우드·AI 마무리)

> **PR**: PR-21b — ch10 3 데모
> **base**: `main` (`b6e424e` PR-21a 머지 후)
> **브랜치**: `feat/preview-inline-ch10-q5-q7`
> **에픽**: 18/18 — **콘텐츠 PR 마지막**

---

## 0. 메타

| key | value |
|---|---|
| step | pr21b |
| round | 1 |
| branch | feat/preview-inline-ch10-q5-q7 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **all-roles model override** | **codex** |

---

## 1. ch10 q05~q07 매핑 (SDD §4.2)

| qaId | 메타포 | IT (SDD spec) | 형태 | layout |
|---|---|---|---|---|
| ch10_q05 | 문맥/예측/반복/한계 | 문맥/다음 토큰/반복 생성/검증 한계 | A Flow | wide |
| ch10_q06 | 호출/토큰/캐시/배치 | 호출당/토큰당/캐시 절감/배치 절감 | C Match | wide |
| ch10_q07 | 권한/암호/격리/감시 | IAM/암호화/네트워크 격리/로그 감시 | C Match | wide |

**톤**: `getTone(10)` = pink-700 (PR-21a 와 동일)

---

## 🚨 본 PR 핵심 함정

| SDD spec 라벨 | 글자수 | 정책 |
|---|---|---|
| `IAM` | 3 | 한+영: `'권한 IAM'` (6) |

> 모든 다른 라벨 한국어 ≤ 8자. PR-19a/21a 패턴.

---

## §A. Generator (Codex)

### §A 시작

1. `cd /home/claude/architecture && git fetch origin main && git checkout main && git pull --ff-only`
2. `git log -1` → `b6e424e feat(preview): ch10 q01~q04 인라인 변환 (PR-21a, 클라우드·AI 시작)` 확인
3. `git checkout feat/preview-inline-ch10-q5-q7`
4. **🚨 모든 commit feat 브랜치 위 직접**

### §A STEP 요약

#### `Q05Llm.tsx` (PairFlow wide — A)

```ts
const METAPHOR = [
  { icon: <Icons.ContextIcon />,   label: '문맥', sub: '입력 흐름' },
  { icon: <Icons.PredictIcon />,   label: '예측', sub: '다음 단어' },
  { icon: <Icons.LoopIconLlm />,   label: '반복', sub: '여러 번 생성' },
  { icon: <Icons.LimitIcon />,     label: '한계', sub: '검증 필요' },
];
const IT = [
  { icon: <Icons.ContextItIcon />, label: '문맥',       sub: 'input window' },
  { icon: <Icons.NextTokenIcon />, label: '다음 토큰',  sub: 'next token' },
  { icon: <Icons.RepeatGenIcon />, label: '반복 생성',  sub: 'iterative' },
  { icon: <Icons.VerifyLimitIcon />, label: '검증 한계', sub: 'hallucination' },
];
tone: getTone(10)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `Q06Cost.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.CallIcon />,     label: '호출', sub: '요청 횟수' },
  { icon: <Icons.TokenMetaIcon />, label: '토큰', sub: '글자 분량' },
  { icon: <Icons.CacheCostIcon />, label: '캐시', sub: '재사용' },
  { icon: <Icons.BatchIcon />,    label: '배치', sub: '한 번에' },
];
const IT = [
  { icon: <Icons.CallCostIcon />,    label: '호출당',    sub: 'per request' },
  { icon: <Icons.TokenCostIcon />,   label: '토큰당',    sub: 'per token' },
  { icon: <Icons.CacheSaveIcon />,   label: '캐시 절감', sub: 'prompt cache' },
  { icon: <Icons.BatchSaveIcon />,   label: '배치 절감', sub: 'batch API' },
];
tone: getTone(10)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `Q07AiSecurity.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.PermitIcon />,    label: '권한', sub: '누가 무엇을' },
  { icon: <Icons.EncryptMetaIcon />, label: '암호', sub: '내용 보호' },
  { icon: <Icons.NetIsolateIcon />, label: '격리', sub: '네트워크 분리' },
  { icon: <Icons.WatchIcon />,     label: '감시', sub: '로그 분석' },
];
const IT = [
  { icon: <Icons.IamIcon />,        label: '권한 IAM',     sub: 'identity & access' },
  { icon: <Icons.EncryptIcon />,    label: '암호화',       sub: 'KMS' },
  { icon: <Icons.NetIsolateItIcon />, label: '네트워크 격리', sub: 'VPC/subnet' },
  { icon: <Icons.LogWatchIcon />,   label: '로그 감시',     sub: 'CloudWatch/SIEM' },
];
tone: getTone(10)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

> `'네트워크 격리'` = 7자, `'권한 IAM'` = 6자. ≤ 8 OK.

#### `data/demos.ts` + `registry.ts`

```ts
ch10_q05: { Component: Q05Llm,         layout: 'wide' },
ch10_q06: { Component: Q06Cost,        layout: 'wide' },
ch10_q07: { Component: Q07AiSecurity,  layout: 'wide' },
```

> 🚨 ID 정렬 + scenarios 한국어 강제

### §A 절대 금지

- ch01~ch09 + ch10_q01~q04 콘텐츠 수정
- `_shared/*` 공용 계약 변경
- raw hex, master/main push, force push

### §A 검증

PR-21a 동일. raw 약자 grep 에 `IAM` 추가:
`grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML|IAM)'" client/src/demos/ch10/Q0[5-7]*.tsx` → 0건

### §A 센티넬 → `qa/ao-logs/pr21b-r1-gen.status`

---

## §B + §C

PR-21a 동일. ch10_q05~q07 + ch10_q01~q04 회귀 spot-check. pink-700.

---

## 변경 기록

| 2026-05-04 | 초기 작성. ch10 q05~q07 (클라우드·AI 마무리). 콘텐츠 PR 마지막 (PR-22 = cleanup) |
