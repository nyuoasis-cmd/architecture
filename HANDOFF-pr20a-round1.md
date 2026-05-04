# HANDOFF-pr20a-round1 — ch09 q01~q04 인라인 변환 (아키텍처·확장 시작)

> **PR**: PR-20a — ch09 4 데모
> **base**: `main` (`adc39df` PR-19b 머지 후)
> **브랜치**: `feat/preview-inline-ch09-q1-q4`
> **에픽**: 15/18

---

## 0. 메타

| key | value |
|---|---|
| step | pr20a |
| round | 1 |
| branch | feat/preview-inline-ch09-q1-q4 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **all-roles model override** | **codex** |

---

## 1. ch09 q01~q04 매핑 (SDD §4.2)

| qaId | 메타포 | IT (SDD spec) | 형태 | layout |
|---|---|---|---|---|
| ch09_q01 | 한 솥/통증/여러 솥/균형 | 모놀리식/성장 통증/마이크로서비스/트레이드오프 | B Binary | square |
| ch09_q02 | 화면/규칙/데이터/흐름 | UI 계층/서비스/데이터/요청 흐름 | C Match | wide |
| ch09_q03 | 문제/단일/관찰/생성 | 문제 정의/싱글톤/옵저버/팩토리 | C Match | wide |
| ch09_q04 | 엣지/메모리/앞단/무효화 | CDN/앱 메모리/DB 앞/무효화 | C Match | wide |

**톤**: `getTone(9)` = indigo-700 series

---

## 🚨 본 PR 핵심 함정

### 라벨 길이 + 약자 정책

| SDD spec 라벨 | 글자수 | 정책 |
|---|---|---|
| `마이크로서비스` | 7 | OK |
| `UI 계층` | 5 (UI 단독 X) | **🚨 UI 가 raw acronym regex 에 포함**! `^(OS\|API\|DB\|UI\|JS\|CSS\|HTML)$` — 단 `'UI'` alone 일 때만 throw. `'UI 계층'` (전체 문자열) 은 OK (regex 미매칭) |
| `CDN` | 3 | 한+영: `'엣지 CDN'` (6) |
| `DB 앞` | 4 (DB 부분 문자열) | **🚨 DB 부분 문자열 회피** (PR-18a 학습): `'DB 앞'` → `'데이터 앞'` (5) 또는 `'DB앞 캐시'` X (DB 포함). `'DB 앞 캐시'` (8) 도 substring 검사 시 fail. **권장**: `'데이터 앞'` (5) |

> **DB 부분 문자열**: PR-18a round 2 evaluator 가 `'DB'` 가 라벨/title/eyebrow/sub 에 substring 으로 포함된 모든 케이스를 REVISE 처리. 본 PR 도 동일.

### B Binary q01

ch01_q02 Stage 패턴 (left/right zones + cards). q01 의 4 라벨 → 2 zone 매핑:
- left: `한 솥` (모놀리식) — cards: ['단일 배포', '단순한 시작', '성장 시 통증']
- right: `여러 솥` (마이크로서비스) — cards: ['독립 배포', '서비스 분리', '운영 복잡']
- + scenarios for 통증 (left active + 통증 highlight) and 균형 (both zones, 트레이드오프)

또는 PairMatch wide 4-cell 로 변경 (자율 판단).

---

## §A. Generator (Codex)

### §A 시작

1. `cd /home/claude/architecture && git fetch origin main && git checkout main && git pull --ff-only`
2. `git log -1` → `adc39df feat(preview): ch08 q05~q07 인라인 변환 (PR-19b)` 확인
3. `git checkout feat/preview-inline-ch09-q1-q4`

### §A STEP 요약

#### `Q01Architecture.tsx` (PairBinary square — B, 또는 PairMatch wide 자율)

PairBinary 채택 시 ch01_q02 패턴. 또는 PairMatch wide 4-cell:
```ts
const METAPHOR = [
  { icon: <Icons.OnePotIcon />,  label: '한 솥',     sub: '한 곳 운영' },
  { icon: <Icons.PainIcon />,    label: '통증',       sub: '성장 한계' },
  { icon: <Icons.ManyPotsIcon />, label: '여러 솥',   sub: '나눠 운영' },
  { icon: <Icons.TradeoffIcon />, label: '균형',     sub: '선택의 무게' },
];
const IT = [
  { icon: <Icons.MonolithIcon />,        label: '모놀리식',     sub: 'monolith' },
  { icon: <Icons.GrowthPainIcon />,      label: '성장 통증',    sub: 'scaling pain' },
  { icon: <Icons.MicroserviceIcon />,    label: '마이크로서비스', sub: 'MSA' },
  { icon: <Icons.TradeoffItIcon />,      label: '트레이드오프', sub: 'tradeoff' },
];
tone: getTone(9)
```

#### `Q02Layer.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.ScreenIcon />, label: '화면', sub: '사용자 입력' },
  { icon: <Icons.RuleIcon />,    label: '규칙', sub: '비즈니스 로직' },
  { icon: <Icons.DataLayerIcon />, label: '데이터', sub: '저장과 조회' },
  { icon: <Icons.FlowLayerIcon />, label: '흐름', sub: '계층 간 호출' },
];
const IT = [
  { icon: <Icons.UiLayerIcon />,    label: 'UI 계층',  sub: 'presentation' },
  { icon: <Icons.ServiceIcon />,    label: '서비스',  sub: 'business' },
  { icon: <Icons.DataIcon />,       label: '데이터',  sub: 'persistence' },
  { icon: <Icons.RequestFlowIcon />, label: '요청 흐름', sub: 'top-down' },
];
tone: getTone(9)
```

> `'UI 계층'` (5자) — regex 미매칭 (UI alone 만 catch). 안전.

#### `Q03Pattern.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.ProblemIcon />,   label: '문제', sub: '재발 경향' },
  { icon: <Icons.SingleIcon />,    label: '단일', sub: '하나만' },
  { icon: <Icons.ObserveIcon />,   label: '관찰', sub: '구독' },
  { icon: <Icons.CreateIcon />,    label: '생성', sub: '인스턴스화' },
];
const IT = [
  { icon: <Icons.ProblemDefIcon />, label: '문제 정의', sub: 'context' },
  { icon: <Icons.SingletonIcon />,  label: '싱글톤',   sub: 'Singleton' },
  { icon: <Icons.ObserverIcon />,   label: '옵저버',   sub: 'Observer' },
  { icon: <Icons.FactoryIcon />,    label: '팩토리',   sub: 'Factory' },
];
tone: getTone(9)
```

#### `Q04Cache.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.EdgeMetaIcon />,  label: '엣지',     sub: '사용자 가까이' },
  { icon: <Icons.MemoryIcon />,    label: '메모리',   sub: '앱 안' },
  { icon: <Icons.FrontIcon />,     label: '앞단',     sub: '데이터 앞' },
  { icon: <Icons.InvalidateIcon />, label: '무효화',  sub: '갱신 시' },
];
const IT = [
  { icon: <Icons.CdnIcon />,       label: '엣지 CDN',  sub: 'edge cache' },
  { icon: <Icons.AppCacheIcon />,  label: '앱 메모리', sub: 'in-memory' },
  { icon: <Icons.DataFrontIcon />, label: '데이터 앞', sub: 'cache-aside' },
  { icon: <Icons.InvalidateItIcon />, label: '무효화', sub: 'TTL/key' },
];
tone: getTone(9)
```

> **🚨 `'DB 앞'` → `'데이터 앞'`** 변경 (PR-18a 학습 — DB substring 회피).

#### `data/demos.ts` + `registry.ts`

```ts
ch09_q01: { Component: Q01Architecture, layout: 'square' },  // 또는 'wide' (PairMatch 채택)
ch09_q02: { Component: Q02Layer,        layout: 'wide' },
ch09_q03: { Component: Q03Pattern,      layout: 'wide' },
ch09_q04: { Component: Q04Cache,        layout: 'wide' },
```

> 🚨 ID 정렬 + scenarios 한국어 강제

### §A 절대 금지

- ch01~ch08 + ch09_q05~q06 + ch10 콘텐츠 수정
- `_shared/*` 공용 계약 변경
- raw hex, master/main push, force push

### §A 검증

1. `npm run build` 무에러
2. `/library/9/ch09_q01~q04` 4 라우트
3. indigo-700 series accent
4. raw hex / `_shared` 외 import 0건
5. **🚨 라벨 길이 ≤ 8자** awk grep 0건
6. **🚨 raw 약자 grep**: `grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML|CDN)'" client/src/demos/ch09/*.tsx` → 0건
7. **🚨 'DB' 부분 문자열 grep** 0건: `grep -n "DB" client/src/demos/ch09/*.tsx` → 0건
8. **🚨 ID 정렬 grep** + scenarios 한국어 first

### §A 센티넬 → `qa/ao-logs/pr20a-r1-gen.status`

---

## §B + §C

PR-19a/b 동일 패턴. ch09_q01~q04 + ch08 회귀 spot-check. indigo-700 contrast.

---

## 변경 기록

| 2026-05-04 | 초기 작성. ch09 q01~q04 (아키텍처·확장 시작). q01 자율 판단. DB 부분 문자열 → '데이터 앞' 강제 |
