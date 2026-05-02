# SDD-preview-inline-v2.2 — 메타포 ↔ 실제 IT 병치 패턴 전체 모듈 적용

> 프로젝트: `architecture` (architecture.teachermate.co.kr)
> 작성: 2026-05-02
> 갱신: v2.1 (외부 검토 1차 5건 반영) → v2.2 (외부 검토 2차 5건 반영) — 라우트 경로 정정 / hex 정책 정합 / validator 범위 / acceptance 단일화 / 브랜치 가이드
> 상위 문서: `SDD-preview-inline-v1.md` (인라인 마이그레이션 인프라 + ch01 시범)
> 본 문서는 v1 §3 컴포넌트 컨트랙트 + §4.3 PR 로드맵을 확장.

---

## §1 배경

`SDD-preview-inline-v1`로 iframe + 폰 프레임 제거 + ch01 4개 인라인 마이그레이션 완료. 그 위에 사용자 검토를 거쳐 **A 패턴 (메타포 ↔ 실제 IT 병치)** 을 ch01에 적용해 합격. 이제 같은 패턴을 ch02~ch10 (61개 데모)에 확대.

### 1.1 v1 ch01의 결과

```
┌──────────────────────────────────────────┐
│ [hero — 시나리오 제목 + 요약]              │
├──────────────────────────────────────────┤
│ 🟧 라면 만들기 · 비유                       │
│ [재료] → [냄비] → [불] → [그릇]             │
│           ≋≋ 같은 원리 ≋≋                  │
│ 🟧 컴퓨터의 동작 · 실제                     │
│ [입력] → [메모리] → [처리] → [출력]         │
├──────────────────────────────────────────┤
│ [현재 상태 — chips/cards]                  │
│ [실시간 로그 — 다크 박스]                   │
└──────────────────────────────────────────┘
```

핵심: 시나리오 변경 시 메타포 줄과 IT 줄이 **동시에** 활성화되어 학생이 두 세계의 매핑을 즉시 인지.

### 1.2 검증된 효과

- 텍스트 라벨만 있던 데모에 SVG 메타포 아이콘 24종 도입 → 메타포가 시각적으로 환기됨
- 활성 단계가 메타포·IT 양쪽에서 동시 강조 → "X = Y"가 글자가 아닌 위치·색으로 전달
- 비활성 셀은 outline-only, 활성 셀은 챕터 accent 컬러 → 한 눈에 진행 단계 파악

---

## §2 패턴 정의 (확정)

### 2.1 컴포넌트 구조

모든 데모는 다음 5단을 따른다 (정렬 순서 고정):

| 단 | 역할 | 비고 |
|---|---|---|
| **Hero** | 시나리오 제목·요약. 챕터 accent 그라디언트 배경 | 기존 동일 |
| **Pair Block** | 메타포 행(SVG+라벨) + "같은 원리" 커넥터 + IT 행(SVG+라벨) | **본 SDD 핵심** |
| **State Section** | 현재 시나리오의 chips/cards (기존 items/lanes 등) | 기존 보존 |
| **Log Section** | 다크 박스 + 모노스페이스 로그 | 기존 보존 |

Pair Block은 §2.2 4가지 형태 중 하나를 선택.

### 2.2 Pair Block 4가지 형태

| 형태 | 사용 조건 | layout | 예시 |
|---|---|---|---|
| **A. Flow** | 시퀀스(N단계 →) | `wide` | ch01_q01 라면 4단계, ch06_q10 부팅 5단계 |
| **B. Binary** | 2개 대비 (X vs Y) | `square` | ch01_q02 무대-대본 vs HW-SW |
| **C. Match** | N개 역할 매핑 (1:1) | `wide` | ch01_q03 식당 4역할 ↔ OS 4역할 |
| **D. Vertical Pairs** | 수직 계층 N행 (메타포 ≈ 실제) | `square` | ch01_q04 도서관 5단 ↔ 메모리 5단 |

각 형태는 ch01에 이미 구현되어 있어 **복붙 후 데이터·아이콘만 교체**하면 된다.

### 2.3 데이터 컨트랙트

각 데모 컴포넌트는 다음 4종 데이터를 선언:

```ts
const SCENES: Record<string, Scene> = { /* 시나리오 → 콘텐츠 */ };
const TONE: Tone = { accent, accentSoft, accentBorder };
const METAPHOR_PAIR: Array<{ icon, label, sub }> = [ ... ];   // 비유 측 N칸
const IT_PAIR: Array<{ icon, label, sub }> = [ ... ];         // 실제 측 N칸
```

`scene.active` (또는 `stageActive`/`scriptActive`) 가 인덱스를 가리키며, 메타포 셀과 IT 셀이 같은 인덱스에서 동시 활성.

### 2.4 SVG 아이콘 규격

```jsx
viewBox="0 0 40 40"
fill="none"
stroke="currentColor"
strokeWidth={1.8}
strokeLinecap="round"
strokeLinejoin="round"
```

- `currentColor` 기반이라 활성 시 부모 `color`만 바꿔도 색 반영
- 단순 outline 스타일 (Heroicons 톤)
- 평균 5~10 path / 30~60 line per icon

### 2.5 톤 (챕터 accent) + 인라인 hex 정책 정합

DESIGN-POLICY §9.B-3 가 `client/src/**/*.{ts,tsx,css}` 의 inline hex를 차단하고 `client/src/demos/**` 예외를 두지 않음. 따라서 본 SDD는 **demos 도 hex 인라인 금지** 원칙 채택. Raw hex 는 단 한 곳 — `client/src/demos/_shared/design-tokens.css` (DESIGN-POLICY 예외 경로 `**/design-tokens.css` 매칭) — 에만 존재. 모든 컴포넌트는 `var(--demo-...)` CSS 변수만 사용.

#### 2.5.1 토큰 정의 위치

```css
/* client/src/demos/_shared/design-tokens.css — DESIGN-POLICY §9.B-3 예외 */
:root {
  /* ch01 */
  --demo-accent-ch01:        #ea580c;  /* orange-600 */
  --demo-accent-soft-ch01:   #fff7ed;
  --demo-accent-border-ch01: #fdba74;

  /* ch02 cyan / ch03 green / ... ch10 pink — 동일 패턴 */
  --demo-accent-ch02:        #0891b2;
  --demo-accent-soft-ch02:   #ecfeff;
  --demo-accent-border-ch02: #67e8f9;
  /* ... ch10까지 30 토큰 */
}
```

#### 2.5.2 챕터 톤 표 (raw hex는 위 .css 에만 — 본 표는 참조용)

| 챕터 | accent | accentSoft | accentBorder | 의미 |
|---|---|---|---|---|
| ch01 | orange-600 (`#ea580c`) ★ | orange-50 (`#fff7ed`) | orange-300 (`#fdba74`) | 컴퓨터 큰 그림 |
| ch02 | cyan-600 (`#0891b2`) | cyan-50 (`#ecfeff`) | cyan-300 (`#67e8f9`) | 소프트웨어 분류 |
| ch03 | green-600 (`#16a34a`) | green-50 (`#f0fdf4`) | green-300 (`#86efac`) | 개발 사이클 |
| ch04 | amber-700 (`#b45309`) | amber-100 (`#fef3c7`) | amber-300 (`#fcd34d`) | 데이터 |
| ch05 | sky-600 (`#0284c7`) | sky-50 (`#f0f9ff`) | sky-300 (`#7dd3fc`) | 웹·프론트백 |
| ch06 | red-600 (`#dc2626`) | red-50 (`#fef2f2`) | red-300 (`#fca5a5`) | CPU·메모리·OS |
| ch07 | purple-600 (`#9333ea`) | purple-50 (`#faf5ff`) | purple-300 (`#d8b4fe`) | DB |
| ch08 | teal-600 (`#0d9488`) | teal-50 (`#f0fdfa`) | teal-300 (`#5eead4`) | 네트워크·보안 |
| ch09 | indigo-600 (`#4f46e5`) | indigo-50 (`#eef2ff`) | indigo-300 (`#a5b4fc`) | 아키텍처·확장 |
| ch10 | pink-600 (`#db2777`) | pink-50 (`#fdf2f8`) | pink-300 (`#f9a8d4`) | 클라우드·AI |

★ ch01 v2.0 구현은 q01=오렌지, q02=블루, q03=틸, q04=퍼플 — PR-12 에서 모두 챕터 표의 ch01 오렌지로 정합 (또는 §2.5.3 데모별 다양화 토큰 신설).

#### 2.5.3 컴포넌트 사용법 (hex 인라인 0건 강제)

```tsx
// _shared/tone.ts
export type Tone = {
  accent: string;        // 'var(--demo-accent-ch01)'
  accentSoft: string;
  accentBorder: string;
};

export function getTone(chapter: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10): Tone {
  const cc = chapter.toString().padStart(2, '0');
  return {
    accent:        `var(--demo-accent-ch${cc})`,
    accentSoft:    `var(--demo-accent-soft-ch${cc})`,
    accentBorder:  `var(--demo-accent-border-ch${cc})`,
  };
}
```

```tsx
// 사용 (chXX/QYY.tsx)
const tone = getTone(1);
<div style={{ borderColor: tone.accent, background: tone.accentSoft }}>...</div>
```

#### 2.5.4 추가 hex 누수 차단

다크 로그 박스 (`#111827`), 본문 색 (`#7c2d12` 등 챕터별 강조 텍스트), summary text 색은 **모두 토큰화**:

```css
/* design-tokens.css 추가 */
--demo-log-bg:   #111827;
--demo-log-fg:   #f8fafc;
--demo-log-time: #94a3b8;
--demo-summary-text-ch01: #7c2d12;
/* ... 챕터별 summary 색 */
```

ch01 v2.0 컴포넌트의 `'#111827'`, `'#7c2d12'`, `'#94a3b8'` 등 모든 raw hex 는 PR-12 에서 토큰화 + `var(--demo-...)` 로 교체. PR-12 합격 기준에 "demos/** raw hex 0건" 추가 (§3.3.5).

---

## §3 공유 인프라 재배치

### 3.1 현재 (ch01만 마이그)

```
client/src/demos/
├── ch01/
│   ├── _shared.tsx       ← IconCard + 24개 SVG (ch01 전용 + 일부 일반)
│   ├── Q01Ramen.tsx
│   ├── Q02Stage.tsx
│   ├── Q03Restaurant.tsx
│   └── Q04Bookshelf.tsx
├── registry.ts
└── types.ts
```

### 3.2 목표 (전 챕터 마이그 후)

```
client/src/demos/
├── _shared/
│   ├── index.ts            ← public API surface (re-exports — Generator는 이것만 import)
│   ├── pair-block.tsx      ← <PairFlow> <PairBinary> <PairMatch> <PairVertical> 4 변형
│   ├── card.tsx            ← <IconCard> <ZonePanel>
│   ├── chrome.tsx          ← <Hero> <PairConnector> <GroupBadge> <LogBox> <StateChips>
│   ├── tone.ts             ← TONE_BY_CHAPTER 표 + Tone 타입 + getTone(chapter) 헬퍼
│   ├── labels.ts           ← LABEL_RULES 상수 (글자수·금지 요소 — §4.0 룰 코드화)
│   ├── icons/
│   │   ├── computer.tsx    ← CPU, RAM, Cache, Monitor, Keyboard...
│   │   ├── data.tsx        ← Drawer, Index, Chart, Backup...
│   │   ├── network.tsx     ← Globe, Lock, DNS, CDN...
│   │   ├── cloud.tsx       ← Container, K8s, Pizza...
│   │   └── metaphor.tsx    ← Pot, Stage, Restaurant, Library, Bank...
│   └── README.md           ← 공용 계약 문서 (Pair Block API + 사용 예 + DO/DON'T)
├── _preview/
│   └── ShowcasePage.tsx    ← /demos-preview/showcase, 4 변형 한 페이지에 모두 (시각 기준점)
├── ch01/Q01~Q04.tsx        (재구성: _shared/index.ts 만 import)
├── ch02/Q01~Q04.tsx        (신규)
... ch10
├── registry.ts
└── types.ts
```

### 3.3 PR-12 = 공용 계약 잠금 PR (단순 분할 아님)

리뷰 #1 반영. PR-12는 **이후 PR-13~22가 흔들리지 않도록 4가지를 잠그는 PR**로 정의:

#### 3.3.1 잠금 항목 1 — Public API surface (`_shared/index.ts`)

```ts
// _shared/index.ts — 이후 챕터 컴포넌트는 이 파일에서만 import
export { PairFlow, PairBinary, PairMatch, PairVertical } from './pair-block';
export { IconCard, ZonePanel } from './card';
export { Hero, PairConnector, GroupBadge, LogBox, StateChips } from './chrome';
export { getTone, TONE_BY_CHAPTER, type Tone } from './tone';
export { LABEL_RULES, validateLabel } from './labels';
export * as Icons from './icons';
// 챕터 컴포넌트가 이 파일 외 경로를 직접 import 하면 ESLint rule 또는 PR 리뷰 차단
```

#### 3.3.2 잠금 항목 2 — Pair Block 4 변형 props 스펙

```ts
type PairItem = {
  icon: ReactNode;        // _shared/icons에서 가져온 SVG 컴포넌트
  label: string;          // §4.0 LABEL_RULES 준수 (≤6자)
  sub?: string;           // 선택, ≤12자
};

type PairFlowProps = {
  metaphorTitle: string;       // GroupBadge 좌측 라벨 (예: "라면 만들기")
  itTitle: string;             // 우측 라벨 (예: "컴퓨터의 동작")
  metaphor: PairItem[];        // 4~5칸
  it: PairItem[];              // 4~5칸 (metaphor와 동일 길이)
  activeIndex: number;         // 양쪽 동시 활성
  tone: Tone;
};

type PairBinaryProps = {
  metaphorTitle: string;
  itTitle: string;
  metaphorLeft: PairItem & { cards?: string[] };   // ZonePanel
  metaphorRight: PairItem & { cards?: string[] };
  itLeft: PairItem;            // 단순 IconCard
  itRight: PairItem;
  leftActive: boolean;
  rightActive: boolean;
  tone: Tone;
};

type PairMatchProps = PairFlowProps;  // 시퀀스 vs 매핑은 시각상 동일

type PairVerticalProps = {
  metaphorTitle: string;
  itTitle: string;
  pairs: Array<{ metaphor: PairItem; it: PairItem }>;   // N행 (5행 권장)
  activeIndex: number;
  tone: Tone;
};
```

이 props 외 추가 prop을 받지 않음. 챕터별 변형은 `scene` 데이터·아이콘 선택으로만 표현.

#### 3.3.3 잠금 항목 3 — Tone 토큰 규칙 (`_shared/tone.ts`)

`§2.5` 표를 코드로 고정. `getTone(chapter)` 또는 `getTone(qaId)` 호출 시 항상 같은 객체 반환. 챕터 컴포넌트가 인라인 hex를 새로 정의하면 ESLint custom rule이 막음.

#### 3.3.4 잠금 항목 4 — Showcase 라우트 (`/demos-preview/showcase`)

dev 모드 전용. 4 변형(`PairFlow`/`PairBinary`/`PairMatch`/`PairVertical`)을 더미 데이터로 한 페이지에 렌더. PR-13 이후 챕터 작업자가 이 페이지를 시각 기준점으로 사용. (production 빌드 제외 가능 — 또는 그냥 포함하고 라우트는 숨김)

#### 3.3.5 PR-12 합격 기준 (단일 진실원 — §6.2 baseline 항목 통합)

- [ ] `_shared/index.ts` 만 import한 `ch01/Q01~Q04.tsx` 가 시각·동작 기존과 동일 (시나리오 칩 클릭 → 메타포·IT 동시 활성화 보존)
- [ ] `client/src/demos/_shared/design-tokens.css` 에 ch01~ch10 accent/soft/border + log + summary 토큰 모두 존재 (총 ~36 CSS 변수)
- [ ] `client/src/demos/**/*.{ts,tsx}` 의 raw hex (`/#[0-9a-fA-F]{3,8}/`) 0건 — `grep -E "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos --include="*.tsx" --include="*.ts" -r` 가 빈 결과
- [ ] `npm run build` (client + server) PASS
- [ ] `/demos-preview/showcase` 접속 시 4 변형 (`PairFlow` / `PairBinary` / `PairMatch` / `PairVertical`) 모두 더미 데이터로 렌더 + 활성 토글 동작
- [ ] `_shared/README.md` 가 4 변형의 props 표 + 사용 예 + DO/DON'T (raw hex 금지 / `_shared/index.ts` 외 import 금지) 포함
- [ ] `LABEL_RULES` 상수 + `validateLabel(text, kind)` + `validatePairSet(metaphor, it, opts)` 모두 동작
- [ ] **Baseline 캡처**: `qa/preview-baseline/` 디렉토리에 ch01 4 데모 × 2 viewport (1440·393) = **8 PNG** 커밋. 파일명 `ch01_qNN_{desktop|mobile}.png`. PR-13 이후 시각 리뷰의 톤·간격·SVG 굵기 비교 기준점.

---

## §4 챕터별 메타포 ↔ IT 매핑

리뷰 #2 반영. 각 데모를 **메타포 라벨 / IT 라벨 / sub 사용 / 형태 / layout** 5필드로 잠금. Generator가 새로 고민하지 않도록.

### §4.0 공통 룰 (LABEL_RULES — 모든 row 강제)

`_shared/labels.ts` 에 코드화:

| 룰 | 값 | 비고 |
|---|---|---|
| **label 글자수** | 권장 ≤6자 / 한도 ≤8자 | "그릇" / "메모리" / "운영체제" — keep-all 1줄 가정 |
| **sub 글자수** | 권장 ≤12자 / 한도 ≤16자 | 2줄까지 허용. 16자 초과 시 sub 생략 |
| **sub 사용 정책** | 데모 단위로 일관 (전부 사용 / 전부 생략) | 같은 데모에서 일부 셀만 sub 두면 시각 비대칭 |
| **금지 1: emoji** | 모든 라벨/캡션에서 unicode emoji 금지 | DESIGN-POLICY blacklist |
| **금지 2: 영어 raw 약자 단독** | "OS", "API", "DB" 단독 금지 → "운영체제 OS" 식 한+영 병기 | 비전공자 대상이라 약자만 두면 인지 부담 |
| **금지 3: ~합니다 종결** | 라벨/캡션 모두 ~합니다 금지 (UI Glossary 정합) | summary/focus/note는 ~어요/~ㅂ니다 혼용 가능 |
| **금지 4: 제품명 단독** | 가급적 카테고리명 우선. "React" → "프레임워크 React", "Docker" → "컨테이너 Docker" | 학습 자료라 제품명 학습보다 개념 학습 우선 |
| **숫자/단위** | 단위 한국어 (예: "32MB" → "메모리 32MB"), 숫자 임의 변경 금지 | 원본 HTML 콘텐츠 보존 |
| **레이아웃별 허용 칸 수** | wide=4~5칸 / square=2~5칸 / tall=N행(N≤6) | 6칸 초과 시 형태 재검토 |

#### 검증 API 두 단계

| 함수 | 범위 | 용도 |
|---|---|---|
| `validateLabel(text, kind)` | 단일 문자열 | `kind = 'label' \| 'sub'` 별 글자수 한도, emoji, 영어 raw 약자 단독, ~합니다, 제품명 단독 검증 |
| `validatePairSet(pair, opts)` | PairItem[] 집합 | (1) sub 사용 정책 일관 (전부 사용 / 전부 생략) (2) 메타포 행과 IT 행 길이 동일 (3) layout별 칸 수 한도 (wide ≤5 / square ≤5 / tall ≤6) |

```ts
// _shared/labels.ts
export function validateLabel(text: string, kind: 'label' | 'sub'): void;
export function validatePairSet(
  metaphor: PairItem[],
  it: PairItem[],
  opts: { layout: DemoLayout; subPolicy: 'all' | 'none' }
): void;
```

PR-13 이후 작업자가 컴포넌트 마운트 시 양쪽 호출. 위반은 빌드 시점 throw — 런타임 도달 전 차단.

#### 집합 규칙 중 코드로 못 잡는 것은 리뷰 체크리스트로

다음은 validator 가 못 잡으므로 §6.2 시각 체크리스트 + Eval Visual 단계에서 검증:
- 메타포 라벨이 데모 제목의 비유 의미와 일관 (예: ACID 은행 창구 → 입금/이체/대기/완료 결)
- IT 라벨이 §4 표 컬럼과 일치 (텍스트 grep 가능 — §6.3 자동 검증으로 옮길 수도 있음)
- 챕터 톤이 §2.5 표 ch{XX} 사용 (코드 grep 가능 — `getTone(N)` 호출 인자 검증)

### §4.1 라벨 컬럼이 비어있을 때 (메타포 약함 데모)

ch02_q02 라이선스, ch08_q01 IP/TCP/UDP 등 외부 비유가 약한 데모는 형태 C 적용 시 **메타포 행 라벨을 IT side variant로 작성**:

```
ch02_q02 메타포 라벨 = ['자유', '구입', '의무', '학생']  (사용 권리 4종 — IT-side 변형)
ch02_q02 IT 라벨    = ['오픈소스', '상용', 'GPL 공개', '학생용']
```

또는 PairBlock 자체를 단일 행(B1 fallback)으로 렌더 — 형태 컬럼에 `B1-fallback` 표기. 본 SDD §4 표는 가능한 모든 경우 형태 C 우선 채택.

### ch02 (4개) — 소프트웨어 분류 · `cyan-600`

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 |
|---|---|---|---|---|
| q01 | 가전 / 문구 / 책 / 도구 | 운영체제 / 드라이버 / 앱 / 미들웨어 | 사용 | C wide |
| q02 | 자유 / 구입 / 의무 / 학생 | 오픈소스 / 상용 / GPL / 학생용 | 사용 | C wide |
| q03 | 블록 / 박스 / 연결 / 설치 | 모듈 / 패키지 / 의존성 / 설치 | 사용 | A wide |
| q04 | 직접 / 빌리기 / 완성 / 구독 | IaaS / PaaS / SaaS / 구독 | 사용 | D square |

### ch03 (7개) — 개발 사이클 · `green-600`

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 |
|---|---|---|---|---|
| q01 | 부품 / 연결 / 사용 / 균형 | 단위 / 통합 / E2E / 균형 | 사용 | C wide |
| q02 | 빨강 / 초록 / 정리 / 반복 | Red / Green / Refactor / Loop | 사용 | A wide |
| q03 | 커밋 / 빌드 / 테스트 / 보고 | 커밋 감지 / 빌드 / 테스트 / 리포트 | 사용 | A wide |
| q04 | 빠른 / 리허설 / 실제 / 자동 | dev / staging / prod / CD | 사용 | A wide |
| q05 | 비상 / 새 무대 / 시범 / 결정 | 즉시 롤백 / 블루그린 / 카나리 / 전략 | 사용 | C wide |
| q06 | 흐름 / 지연 / 오류 / 알림 | 요청 수 / 지연 / 에러율 / 알림 | 사용 | C wide |
| q07 | 제출 / 코멘트 / 수정 / 승인 | PR / 코멘트 / 수정 / 머지 | 사용 | A wide |

### ch04 (7개) — 데이터 · `amber-700`

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 |
|---|---|---|---|---|
| q01 | 칸 / 틀 / 자유 / 선택 | 정형 / 반정형 / 비정형 / 상황별 | 사용 | D square |
| q02 | 표 / 상자 / 태그 / 선택 | CSV / JSON / XML / 무엇을 | 사용 | C wide |
| q03 | 중복 / 혼선 / 분리 / 균형 | 중복 / 수정 이상 / 분리 / 조회 균형 | 사용 | A wide |
| q04 | 훑기 / 색인 / 점프 / 비용 | 전체 스캔 / 색인 / 위치 점프 / 정리 비용 | 사용 | A wide |
| q05 | 전부 / 규칙 / 차단 / 보존 | 원자성 / 일관성 / 고립성 / 지속성 | 사용 | C wide |
| q06 | 백업 / 손실 / 복구 / 훈련 | 백업 / RPO / RTO / 훈련 | 사용 | C wide |
| q07 | 질문 / 선택 / 점검 / 절제 | 목표 / 차트 / 축 / 단순화 | 사용 | A wide |

### ch05 (7개) — 웹·프론트백 · `sky-600`

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 |
|---|---|---|---|---|
| q01 | 홀 / 주방 / 약속 / 분리 | 프론트엔드 / 백엔드 / API / 분리 이점 | 사용 | B square |
| q02 | 뼈대 / 모양 / 반응 / 합체 | HTML / CSS / JS / 통합 | 사용 | A wide |
| q03 | 요청 / 자원 / 메서드 / 단발 | 요청 / 자원 / 메서드 / 무상태 | 사용 | A wide |
| q04 | 시작 / 이동 / 응답 / 혼합 | SPA 시작 / SPA 이동 / SSR 시작 / 혼합 전략 | 사용 | C wide |
| q05 | 분산 / 공유 / 변경 / 도구 | 로컬 / 공용 / 갱신 / 도구 선택 | 사용 | C wide |
| q06 | 반복 / 부품 / 선택 / 팀 | 반복 줄임 / 컴포넌트 / 선택 / 팀 규칙 | 사용 | C wide |
| q07 | 개발 / 묶기 / 최적화 / 배포 | dev / 번들 / 최적화 / 배포 준비 | 사용 | A wide |

### ch06 (10개) — CPU·메모리·OS · `red-600` (3 PR 분할)

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 |
|---|---|---|---|---|
| q01 | 읽기 / 해석 / 계산 / 저장 | Fetch / Decode / Execute / Store | 사용 | A wide |
| q02 | 손 안 / 책상 / 캐시 / 창고 | 레지스터 / 캐시 / RAM / 디스크 | 사용 | D square |
| q03 | 실행 / 복제 / 작업 / 종료 | 프로그램 / 프로세스 / CPU / 종료 | 사용 | A wide |
| q04 | 방금 / 근처 / 적중 / 미스 / 계층 | 최근값 / 인접값 / 히트 / 미스 / L1-L3 | 사용 | A wide (5칸) |
| q05 | 확인 / 신호 / 처리 / 복귀 | 폴링 / 인터럽트 / 핸들러 / 복귀 | 사용 | A wide |
| q06 | 조각 / 교환 / 우선 / 동시감 | 타임 슬라이스 / 컨텍스트 / 우선순위 / 동시 실행 | 사용 | C wide |
| q07 | 호실 / 실제 / 대피 / 격리 | 가상 주소 / 물리 RAM / 스왑 / 격리 | 사용 | C wide |
| q08 | 폴더 / 카드 / 블록 / 기록 | 디렉터리 / inode / 블록 / 저널 | 사용 | C wide |
| q09 | 요청 / 번역 / 실행 / 응답 | 운영체제 요청 / 드라이버 / 장치 / 결과 | 사용 | A wide |
| q10 | 전원 / 펌웨어 / 부트 / 커널 / 로그인 | POST / BIOS / 부트로더 / 커널 / 로그인 | 사용 | A wide (5칸) |

**분할**: PR-17a = q01~q04, PR-17b = q05~q07, PR-17c = q08~q10. (≤4 demos / PR — §5)

### ch07 (6개) — DB · `purple-600`

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 |
|---|---|---|---|---|
| q01 | 칸 / 문서 / 연결 / 분산 | RDBMS / NoSQL / JOIN / 샤딩 | 사용 | D square |
| q02 | 찾기 / 추가 / 수정 / 삭제 | SELECT / INSERT / UPDATE / DELETE | 사용 | C wide |
| q03 | 전부 / 규칙 / 차단 / 보존 | 원자성 / 일관성 / 고립성 / 지속성 | 사용 | C wide |
| q04 | 훑기 / 가지 / 범위 / 비용 | 전체 스캔 / B-tree / 범위 / 쓰기 비용 | 사용 | A wide |
| q05 | 한 표 / 분리 / 이상 / 3정규형 | 미정규 / 분리 / 갱신 이상 / 3NF | 사용 | A wide |
| q06 | 더티 / 커밋 / 반복 / 직렬 | Dirty Read / Read Committed / Repeatable / Serializable | 사용 | A wide |

### ch08 (7개) — 네트워크·보안 · `teal-600`

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 |
|---|---|---|---|---|
| q01 | 길 / 신뢰 / 빠름 / 함께 | IP / TCP / UDP / 함께 보기 | 사용 | C wide |
| q02 | 평문 / 암호 / 인증 / 완성 | HTTP / TLS / 인증서 / 전체 보호 | 사용 | A wide |
| q03 | 캐시 / 재귀 / 상위 / 응답 | 로컬 캐시 / 재귀 서버 / 상위 서버 / 최종 응답 | 사용 | A wide |
| q04 | 원본 / 서울 / 유럽 / 분산 | 원본 서버 / 엣지 KR / 엣지 EU / 분산 효과 | 사용 | D square |
| q05 | 문지기 / 통로 / 함께 / 분리 | 방화벽 / VPN / 함께 사용 / 역할 분리 | 사용 | B square |
| q06 | 단발 / 폴링 / 양방향 / 사례 | HTTP / 폴링 / WebSocket / 적합 사례 | 사용 | C wide |
| q07 | 인증 / 암호 / 격리 / 최소 | 인증 / 암호화 / 격리 / 최소 권한 | 사용 | C wide |

### ch09 (6개) — 아키텍처·확장 · `indigo-600`

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 |
|---|---|---|---|---|
| q01 | 한 솥 / 통증 / 여러 솥 / 균형 | 모놀리식 / 성장 통증 / 마이크로서비스 / 트레이드오프 | 사용 | B square |
| q02 | 화면 / 규칙 / 데이터 / 흐름 | UI 계층 / 서비스 / 데이터 / 요청 흐름 | 사용 | C wide |
| q03 | 문제 / 단일 / 관찰 / 생성 | 문제 정의 / 싱글톤 / 옵저버 / 팩토리 | 사용 | C wide |
| q04 | 엣지 / 메모리 / 앞단 / 무효화 | CDN / 앱 메모리 / DB 앞 / 무효화 | 사용 | C wide |
| q05 | 요청 / 적재 / 처리 / 버퍼 | 요청 / 큐 적재 / 워커 / 버스트 | 사용 | A wide |
| q06 | 측정 / 키우기 / 늘리기 / 혼합 | 병목 측정 / 수직 확장 / 수평 확장 / 혼합 전략 | 사용 | C wide |

### ch10 (7개) — 클라우드·AI · `pink-600`

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 |
|---|---|---|---|---|
| q01 | 직접 / 빌리기 / 완성 / 경계 | IaaS / PaaS / SaaS / 책임 경계 | 사용 | D square |
| q02 | 묶기 / 설계 / 실행 / 공유 | 앱 묶기 / 이미지 / 컨테이너 / 커널 공유 | 사용 | A wide |
| q03 | 원하는 / 복구 / 확장 / 점진 | 원하는 상태 / 자가 복구 / 자동 확장 / 점진 배포 | 사용 | C wide |
| q04 | 큰 목표 / 학습 / 신경망 / 포함 | AI / ML / DL / 포함 관계 | 사용 | D square |
| q05 | 문맥 / 예측 / 반복 / 한계 | 문맥 / 다음 토큰 / 반복 생성 / 검증 한계 | 사용 | A wide |
| q06 | 호출 / 토큰 / 캐시 / 배치 | 호출당 / 토큰당 / 캐시 절감 / 배치 절감 | 사용 | C wide |
| q07 | 권한 / 암호 / 격리 / 감시 | IAM / 암호화 / 네트워크 격리 / 로그 감시 | 사용 | C wide |

---

## §5 PR 로드맵

리뷰 #3 반영. 시각 리뷰 비용 고려해 **≤4 demos / PR** 원칙으로 재분할. 7-demos·10-demos 챕터는 모두 분할.

| PR | 범위 | 데모 수 | 신규 SVG 추정 | 예상 시간 |
|---|---|---|---|---|
| **PR-12** (선행) | 공용 계약 잠금 (§3.3) — `_shared/*` API + Pair Block 4 변형 + tone.ts + LABEL_RULES + Showcase 라우트 + ch01 import 경로 갱신 | 0 (인프라) | 0 | 1.5시간 |
| **PR-13** | ch02 전체 | 4 | ~10 | 2시간 |
| **PR-14a** | ch03 q01~q04 | 4 | ~8 | 2시간 |
| **PR-14b** | ch03 q05~q07 | 3 | ~6 | 1.5시간 |
| **PR-15a** | ch04 q01~q04 | 4 | ~8 | 2시간 |
| **PR-15b** | ch04 q05~q07 | 3 | ~6 | 1.5시간 |
| **PR-16a** | ch05 q01~q04 | 4 | ~8 | 2시간 |
| **PR-16b** | ch05 q05~q07 | 3 | ~6 | 1.5시간 |
| **PR-17a** | ch06 q01~q04 (CPU) | 4 | ~8 | 2시간 |
| **PR-17b** | ch06 q05~q07 (스케줄러·가상메모리) | 3 | ~6 | 1.5시간 |
| **PR-17c** | ch06 q08~q10 (파일·드라이버·부팅) | 3 | ~6 | 1.5시간 |
| **PR-18a** | ch07 q01~q04 | 4 | ~8 | 2시간 |
| **PR-18b** | ch07 q05~q06 | 2 | ~4 | 1시간 |
| **PR-19a** | ch08 q01~q04 | 4 | ~8 | 2시간 |
| **PR-19b** | ch08 q05~q07 | 3 | ~6 | 1.5시간 |
| **PR-20a** | ch09 q01~q04 | 4 | ~8 | 2시간 |
| **PR-20b** | ch09 q05~q06 | 2 | ~4 | 1시간 |
| **PR-21a** | ch10 q01~q04 | 4 | ~8 | 2시간 |
| **PR-21b** | ch10 q05~q07 | 3 | ~6 | 1.5시간 |
| **PR-22** (cleanup) | iframe fallback 분기 제거 / `.phone-*` CSS 삭제 / `client/public/demos/` HTML 일괄 삭제 / Showcase 라우트 정리 (또는 보존) | - | - | 1시간 |

총 **20 PR / 약 33시간 / 신규 SVG ~118개**.

### 5.1 SVG asset / composition 분리 (선택)

대형 챕터에서 자산 생성과 컴포지션이 같이 섞이면 시각 리뷰 비용이 폭증. 다음 옵션 중 하나:

- **옵션 A (현재)**: PR마다 SVG + 컴포넌트 한 번에. ≤4 demos 분할로 위험 통제.
- **옵션 B (고위험 챕터만)**: PR-N-assets (SVG only — `_shared/icons/*` 추가) → PR-N-compose (컴포넌트만). PR-17 ch06 / PR-19 ch08 추천.

PR-13 (ch02) 1개 4-Phase 검증 후 위험 평가, 옵션 B 전환 여부 결정.

### 5.2 병렬 실행 가능성

PR-12 머지 후 PR-13~21은 챕터별 독립이라 4-Phase 또는 별도 Codex 터미널로 동시 진행 가능. ch06 (PR-17a/b/c) 처럼 한 챕터 내 분할은 SVG 의존성 (이전 PR가 추가한 아이콘 재사용) 때문에 순차 권장.

### 5.3 검증 체계

- 각 PR마다 `npm run build` PASS 필수 (CI)
- §6 닫힌 QA spec 적용 (viewport / 경로 / 비교 기준 명시)
- 4-Phase 워크플로우 적용 시: Generator (Codex 단독) + Eval Visual (Codex T2) + Eval Interaction (Codex T3)
- PR-13 1개만 풀 4-Phase, 안정 확인 후 PR-14 부터 압축 self-QA 가능 (Master 단독 round 1+2)

---

## §6 합격 기준 (PR마다 — 닫힌 QA spec)

리뷰 #4 반영. viewport / 경로 / 비교 기준 / accent 대비를 모두 명시해 PASS/FAIL 판단을 사람 직관에서 룰북으로.

### §6.1 자동 (CI 차단 가능)

- [ ] `cd client && npm run build` PASS (TypeScript strict + Vite)
- [ ] `cd server && npm run build` PASS
- [ ] 신규 inline hex가 `client/src/demos/**` 외 파일에 추가 0건 (§9.B-3 content 룰 영역 한정)
- [ ] 챕터 컴포넌트 파일이 `_shared/index.ts` 외 경로를 import 0건 (`grep -E "from '\.\./_shared/[^i]" client/src/demos/chXX/*.tsx` = 0)
- [ ] 라벨 길이 검증: `validateLabel` 호출 0 throws (LABEL_RULES 위반 0건)

### §6.2 시각 검증 — 닫힌 spec

#### viewport

- **데스크탑**: 1440 × 900 (Chrome DevTools "Responsive" → 1440px width)
- **모바일**: 393 × 852 (iPhone 15 Pro 시뮬)

#### 경로 (PR마다 대상 챕터 X·Q 치환)

실제 라우트는 `client/src/App.tsx:47` 의 `/library/:chapterId/:qaId` (자율학습 모드) 와 `App.tsx:48` 의 `/learn/:sessionId` (세션 모드) 두 가지뿐. 본 SDD QA 는 **자율학습 모드** 기준:

```
http://localhost:5176/library/{chapterId}/ch{XX}_q{YY}
http://localhost:5176/demos-preview/showcase   (PR-12에서 신설)
```

세션 모드 (`/learn/:sessionId`) 는 동일 `LearnPage` 컴포넌트가 mode prop만 다르게 받아 동작하므로 자율학습 모드 통과 = 세션 모드 통과로 간주. 단 PR-13 1회는 세션 모드도 spot-check.

`chapterId` 는 1~10 (정수). `qaId` 는 `chXX_qYY` 형식 (예: `ch01_q01`). 따라서 ch04_q05 ACID 검증 URL = `http://localhost:5176/library/4/ch04_q05`.

#### 시각 체크리스트

대상 챕터의 **모든** 데모 페이지에서 (시나리오마다 1회 클릭, 데스크탑·모바일 양쪽):

- [ ] **frame 0**: 폰 프레임·노치·둥근 검정 베젤 없음
- [ ] **3단 구조**: Hero (그라디언트) → Pair Block (메타포 + 커넥터 + IT) → State + Log 순서 유지
- [ ] **동시 활성화**: 시나리오 칩 클릭 → 메타포 셀과 IT 셀이 같은 인덱스에서 동시에 accent 컬러로 변함 (한쪽만 변하면 FAIL)
- [ ] **활성·비활성 대비**: 활성 셀 border = accent (예: red-600), 배경 = accentSoft (예: red-50). 비활성 = border `var(--color-border)`, 배경 `#fff`. 명도 차이 즉시 인지 가능
- [ ] **SVG 가시성**: 모든 셀에 SVG 아이콘. 활성 시 stroke = accent, 비활성 시 stroke = `var(--color-text-muted)`
- [ ] **accent tone WCAG**: 활성 라벨 텍스트와 accentSoft 배경 대비비 ≥ 4.5:1 (AA). chrome DevTools 의 contrast checker로 1개 셀 spot-check
- [ ] **너비 정합**: layout=wide → 콘텐츠 max-width 860px / square → 640px / tall → 480px. 1440px viewport에서 좌우 여백이 시각적으로 균등
- [ ] **모바일 줄바꿈**: 393px viewport에서 라벨이 1~2줄로 자연 줄바꿈 (3줄 이상 = FAIL). word-break: keep-all 적용 확인
- [ ] **모바일 그리드 변환**: wide 4-col → 2-col, square 2-col → 1-col 자동 stack

#### 비교 기준 이미지

`qa/preview-baseline/` 디렉토리에 ch01 4 데모 × 2 viewport = 8 PNG. 캡처·커밋 책임은 PR-12 — 본 항목은 §3.3.5 acceptance 의 마지막 줄에 단일 정의됨 (중복 방지). 이후 PR마다 시각 리뷰는 이 baseline 톤·간격·SVG 굵기와 일관성 검증.

```
qa/preview-baseline/
├── ch01_q01_desktop.png   (1440×900)
├── ch01_q01_mobile.png    (393×852)
├── ch01_q02_desktop.png
├── ch01_q02_mobile.png
├── ch01_q03_desktop.png
├── ch01_q03_mobile.png
├── ch01_q04_desktop.png
└── ch01_q04_mobile.png
```

### §6.3 콘텐츠 (텍스트 1:1 검증)

- [ ] 시나리오 데이터 (`SCENES` 객체)의 title / summary / items / chips / lanes / cards / note / logs 필드 텍스트가 원본 `client/public/demos/chXX/qYY.html` 의 `scenes` 객체와 1:1 일치 (공백·문장부호 포함)
- [ ] 메타포 라벨 (`METAPHOR_PAIR.label`) 이 SDD §4 해당 row의 "메타포 라벨" 컬럼과 일치
- [ ] IT 라벨 (`IT_PAIR.label`) 이 SDD §4 해당 row의 "IT 라벨" 컬럼과 일치
- [ ] sub 사용 정책이 SDD §4 sub 컬럼과 일치 (사용/미사용 통일)
- [ ] §4.0 LABEL_RULES 위반 0건 (글자수 / emoji / 영어 raw 약자 단독 / ~합니다 / 제품명 단독)

---

## §7 위험 및 완화

| 위험 | 완화 |
|---|---|
| **메타포가 약하거나 IT와 1:1이 아닌 데모** (예: ch02_q02 라이선스, ch08_q01 IP/TCP/UDP) | §4.1 패턴 — 메타포 행 라벨을 IT-side variant로 작성. 또는 B1-fallback (단일 행 풍부 SVG). 본 SDD §4 표에 형태 미리 결정. |
| **SVG 아이콘 디자인 비일관** | 모두 §2.4 규격 준수. 1.8 stroke / 40×40 viewBox / outline-only. ch01 24개를 baseline 시각 기준점으로 `qa/preview-baseline/` 캡처 후 비교. |
| **챕터별 accent 충돌** | §2.5 표 + `_shared/tone.ts` getTone() 가 코드로 강제. 데모별 다양화는 챕터 톤의 ±1 단계 한정. |
| **65개 한 번에 작업 시 검토 부담** | ≤4 demos / PR 분할 (§5). 7-demos·10-demos 챕터는 모두 분할. |
| **메타포 데이터·SVG 중복** (예: RamIcon이 ch01_q04와 ch06_q02 양쪽에서 필요) | `_shared/icons/*.tsx` 로 통합. PR-12 가 이를 위한 인프라 잠금. |
| **Codex/Sonnet이 메타포 매핑을 자율 결정해 SDD 표와 다르게 만듦** | 본 SDD §4를 Generator 프롬프트에 명시 인용 (project prefix + 데모 ID + 메타포 라벨/IT 라벨 컬럼 복붙). Evaluator는 §6.3 검증. |
| **layout 결정이 잘못돼 콘텐츠 짜부** | §4 표가 layout 미리 지정 (wide=860 / square=640 / tall=480). 코드에서 `DEMO_LAYOUT_MAX_WIDTH` 가 강제. |
| **🆕 한글 라벨 overflow / 줄바꿈 깨짐** (리뷰 #5) | (1) `word-break: keep-all` + `overflow-wrap: break-word` 가 `_shared/card.tsx` 카드 기본 스타일에 적용. (2) §4.0 LABEL_RULES — label ≤6자 권장·≤8자 한도 / sub ≤12자 권장·≤16자 한도. (3) `validateLabel(text)` 가 컴포넌트 마운트 시 throw → 빌드 시점 검출. (4) 2줄 초과 시 layout 한 단계 좁히거나 (wide → square) sub 생략. (5) 모바일 viewport 393px에서 모든 라벨이 1~2줄 — §6.2 체크리스트 강제. |
| **🆕 학생용 줄바꿈 일관성 깨짐** | 카드 padding 8px 양쪽 + label `text-[12px] font-semibold` + sub `text-[10px]` 고정. 폰트 크기 변경은 `_shared/card.tsx` 외에서 금지 — ESLint custom rule 또는 PR 리뷰. |
| **🆕 SVG-라벨 정렬 비일관** (리뷰 #5 부수) | `IconCard` 가 `flex flex-col items-center` 강제. 컴포넌트 외부에서 인라인 align 변경 금지. |

---

## §8 Out of scope

- ❌ 데모 콘텐츠 자체 재작성 (시나리오 텍스트 보존)
- ❌ 정답 표 시나리오 추가 (D 패턴이 이미 매핑 표 역할 — 별도 SDD에서 결정)
- ❌ 누적 빌드(C 옵션, whiteboard 방식) — 데이터 구조 갈아엎어야 해 별도 SDD
- ❌ 인터랙티브 기능 (드래그 매칭, 미니 퀴즈) — 별도 SDD
- ❌ 애니메이션 (시나리오 전환 트랜지션) — 별도 SDD
- ❌ standalone `/demos-preview/:qaId` 라우트 — 본 SDD 외
- ✅ ~~DESIGN-POLICY §9.B-3 화이트리스트 갱신~~ → **본 SDD가 "demos 도 hex 금지" 채택**으로 갱신 불필요. raw hex는 `client/src/demos/_shared/design-tokens.css` 에만 존재 (`**/design-tokens.css` 예외 매칭). 정책 PR 선행 불필요.

---

## §9 인용·참조

- 상위: `SDD-preview-inline-v1.md`
- 시범 구현: `client/src/demos/ch01/_shared.tsx` (24 SVG + IconCard + Pair 컴포넌트)
- 4가지 형태 레퍼런스 코드:
  - **A Flow** → `Q01Ramen.tsx`, `Q03Restaurant.tsx`
  - **B Binary** → `Q02Stage.tsx`
  - **D Vertical Pairs** → `Q04Bookshelf.tsx`
  - C Match는 Q01·Q03이 동시 만족 (시퀀스+매핑)
- 디자인 정책: `shared/DESIGN-POLICY.md` §9.B-3 (학생 콘텐츠 룰)

---

## §10 다음 작업 (사용자)

### §10.0 진입 전 정리

현재 브랜치 `feat/preview-inline-pilot` 에 v1 (frame 제거 + ch01 인라인) + v2.0 (ch01 메타포 패턴) 이 혼재. PR-12 진입 전 다음 정리 권장:

```bash
# 1. 현재 브랜치 push + PR-1 머지 (frame 제거 + ch01 metaphor 한 묶음)
cd /home/claude/architecture
git push -u origin feat/preview-inline-pilot
gh pr create --base main --title "feat: preview iframe·폰 프레임 제거 + ch01 인라인 마이그레이션 + 메타포 병치 패턴 (ch01)" \
  --body-file SDD-preview-inline-v1.md

# 2. PR-1 머지 후 PR-12용 새 브랜치
git checkout main && git pull
git checkout -b feat/preview-inline-shared-contract
```

루트 규칙이 외부 Codex 작업에 `codex/<task-id>` 를 권장하지만 master agent (Claude) PR 은 `feat/*` 또는 `chore/*` 기존 컨벤션 유지 (예: `feat/nav-active-label`, `chore/render-build-include-dev`). PR-12 = `feat/preview-inline-shared-contract`, PR-13 = `feat/preview-inline-ch02` 식.

### §10.1 진행 순서

1. 본 SDD v2.2 검토 → OK 시 위 §10.0 정리 후 **PR-12 (공용 계약 잠금)** 시작
2. PR-12 머지 후 **PR-13 (ch02)** 풀 4-Phase 검증 — 위험 측정용 1회 통과 후 후속 챕터 압축 가능
3. PR-14 부터 챕터 단위 진행, ch06 (10 demos) 만 3 PR 분할
4. PR-21b (ch10 q05~q07) 머지 후 PR-22 cleanup
5. 모든 PR 머지 완료 후 본 SDD를 `archive/SDD-preview-inline-v2-completed.md`로 이동

### §10.1 4-Phase 워크플로우 적용 권장

UI 핵심 STEP 분류라 본 SDD 모든 챕터 PR은 4-Phase로 진행 권장:
- **Generator** (Codex 단독, T1 터미널) — 본 SDD §4 표을 그대로 prompt에 삽입 (메타포 라벨 + IT 라벨 + sub + 형태 + layout 5컬럼 복붙)
- **Eval-Visual** (Codex T2) — §6.2 시각 체크리스트 + `qa/preview-baseline/` 비교
- **Eval-Interaction** (Codex T3) — 시나리오 칩 클릭 시 메타포·IT 동시 활성화 + 한글 overflow 검증
- Master 압축 self-QA만 적용 시 PR-13 1개로 위험 측정 후 결정

`feedback_evaluator-prompt-project-prefix.md` 준수 — 모든 외부 모델 프롬프트 첫 줄에 `architecture / branch / 데모 ID` 명시.

---

## §11 변경 요약

### §11.1 v2 → v2.1 (외부 검토 1차 5건 반영)

| # | 지적 | 반영 위치 | 핵심 변경 |
|---|---|---|---|
| 1 | PR-12 가 단순 분할 — 공용 API 잠금 부재 | §3.3 (확장) | PR-12 = "공용 계약 잠금 PR"로 재정의. public API surface + Pair Block 4 변형 props + tone.ts + LABEL_RULES + Showcase 라우트 + ch01 import 경로 갱신 |
| 2 | §4 한 줄 매핑이 정보 부족 | §4.0 (신설) + §4 표 전면 갱신 | LABEL_RULES (글자수·금지·sub 정책) 신설. 모든 챕터 표에 "메타포 라벨 / IT 라벨 / sub" 컬럼 추가 |
| 3 | 7·10·14-demos PR이 시각 리뷰 비용 폭증 | §5 PR 표 | 11 PR → 20 PR 재분할. ≤4 demos / PR 원칙 |
| 4 | §6 합격 기준 닫혀 있지 않음 | §6 전면 재작성 | viewport (1440·393), 경로, baseline 캡처, accent WCAG AA, 닫힌 체크리스트 12종 |
| 5 | 한글 길이/줄바꿈/overflow 위험 누락 | §7 (3건 추가) | LABEL_RULES + word-break:keep-all + validateLabel throw + layout downgrade |

### §11.2 v2.1 → v2.2 (외부 검토 2차 5건 반영)

| # | 지적 | 반영 위치 | 핵심 변경 |
|---|---|---|---|
| 1 | §6.2 QA 경로가 실제 라우터와 불일치 | §6.2 경로 블록 | `/learn/{chapterId}/...` (오류) → `/library/{chapterId}/{qaId}` (App.tsx:47 자율학습 모드). 세션 모드 spot-check만 |
| 2 | 인라인 hex 허용 전제가 DESIGN-POLICY §9.B-3 와 충돌 (`client/src/demos/**` 예외 없음) | §2.5 + §3.3.5 + §8 | "demos 도 hex 금지" 원칙 채택. raw hex 단 한 곳 = `client/src/demos/_shared/design-tokens.css` (예외 매칭 `**/design-tokens.css`). 컴포넌트는 `var(--demo-...)` 만 사용. 정책 PR 선행 불필요. ch01 v2.0 의 raw hex 도 PR-12 에서 모두 토큰화 |
| 3 | `validateLabel(text)` 단일 문자열로 집합 규칙 못 잡음 | §4.0 검증 API 표 | `validatePairSet(metaphor, it, opts)` 추가. sub 일관·길이 일치·layout별 칸 수 검증. 코드로 못 잡는 집합 규칙은 §6.2 시각 체크리스트 + Eval Visual 로 격하 |
| 4 | PR-12 baseline 8 PNG 가 §3.3.5 와 §6.2 두 곳에 따로 적힘 | §3.3.5 + §6.2 | §3.3.5 PR-12 합격 기준에 단일 정의. §6.2 비교 기준은 §3.3.5 참조 (단일 진실원) |
| 5 | 브랜치 `feat/preview-inline-pilot` 가 v1+v2.0 혼재 | §10.0 (신설) | PR-1 머지 후 PR-12 새 브랜치 (`feat/preview-inline-shared-contract`) 권장. 루트 `codex/<task-id>` 컨벤션은 외부 Codex 작업용 — master agent 는 기존 `feat/*` 유지 |

**진입 조건**: 본 v2.2 검토 → OK 시 §10.0 정리 → PR-12 시작.
