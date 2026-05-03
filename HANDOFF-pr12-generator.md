# HANDOFF-pr12-generator — Codex T2 Generator

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **브랜치**: `feat/preview-inline-shared-contract` (main 기준 분기)
> **작업 디렉토리**: `/home/claude/architecture/client/`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §3.3 + §4.0 + §6 + §7)
> **상위 핸드오프**: `HANDOFF-pr12-planner-spec.md` (Sprint Contract C1~C13)

---

## 0. 작업 시작 전 환경 정리

```bash
cd /home/claude/architecture
git checkout main && git pull --ff-only
git log --oneline -1   # 'd39599d feat(preview): iframe·폰 프레임 제거 ...' 확인
git checkout -b feat/preview-inline-shared-contract
```

기존 ch01 v2.0 컴포넌트는 `client/src/demos/ch01/Q01~Q04.tsx` 에 있음. 본 PR 은 이를 **새 `_shared/` API 로 리팩토링**하는 게 핵심.

---

## 1. 작업 단계 (순서 고정)

### STEP 1 — `client/src/demos/_shared/design-tokens.css` 생성

DESIGN-POLICY §9.B-3 예외 (`**/design-tokens.css`) 매칭 위해 파일명 정확히 `design-tokens.css`. 약 55개 CSS 변수.

```css
/* client/src/demos/_shared/design-tokens.css
 * DESIGN-POLICY §9.B-3 예외 — raw hex 의 유일한 거주지.
 * 컴포넌트는 var(--demo-...) 로만 참조. */

:root {
  /* ───────── 챕터 accent (10챕터 × 3 = 30 토큰) ───────── */
  --demo-accent-ch01:        #ea580c;
  --demo-accent-soft-ch01:   #fff7ed;
  --demo-accent-border-ch01: #fdba74;

  --demo-accent-ch02:        #0891b2;
  --demo-accent-soft-ch02:   #ecfeff;
  --demo-accent-border-ch02: #67e8f9;

  --demo-accent-ch03:        #16a34a;
  --demo-accent-soft-ch03:   #f0fdf4;
  --demo-accent-border-ch03: #86efac;

  --demo-accent-ch04:        #b45309;
  --demo-accent-soft-ch04:   #fef3c7;
  --demo-accent-border-ch04: #fcd34d;

  --demo-accent-ch05:        #0284c7;
  --demo-accent-soft-ch05:   #f0f9ff;
  --demo-accent-border-ch05: #7dd3fc;

  --demo-accent-ch06:        #dc2626;
  --demo-accent-soft-ch06:   #fef2f2;
  --demo-accent-border-ch06: #fca5a5;

  --demo-accent-ch07:        #9333ea;
  --demo-accent-soft-ch07:   #faf5ff;
  --demo-accent-border-ch07: #d8b4fe;

  --demo-accent-ch08:        #0d9488;
  --demo-accent-soft-ch08:   #f0fdfa;
  --demo-accent-border-ch08: #5eead4;

  --demo-accent-ch09:        #4f46e5;
  --demo-accent-soft-ch09:   #eef2ff;
  --demo-accent-border-ch09: #a5b4fc;

  --demo-accent-ch10:        #db2777;
  --demo-accent-soft-ch10:   #fdf2f8;
  --demo-accent-border-ch10: #f9a8d4;

  /* ───────── 카드·면 (chrome) ───────── */
  --demo-card-bg:            #ffffff;
  --demo-card-bg-alt:        #f8fafc;

  /* ───────── log box variants (다크 박스) ───────── */
  --demo-log-bg-stone:       #111827;   /* ch01 q01·q04 */
  --demo-log-bg-navy:        #0f172a;   /* ch01 q02 */
  --demo-log-bg-blue:        #102a43;   /* ch01 q03 */
  --demo-log-fg:             #f8fafc;
  --demo-log-time-stone:     #94a3b8;
  --demo-log-time-blue:      #bfdbfe;
  --demo-log-time-cyan:      #93c5fd;
  --demo-log-time-purple:    #c4b5fd;
  --demo-log-time-amber:     #fdba74;

  /* ───────── summary 텍스트 (챕터별 hero 강조 색) ───────── */
  --demo-summary-text-orange:  #7c2d12;   /* ch01 q01 */
  --demo-summary-text-slate:   #475569;
  --demo-summary-text-stone:   #334155;

  /* ───────── chip "hot" foreground variants ───────── */
  --demo-chip-hot-orange-fg:   #9a3412;
  --demo-chip-hot-purple-fg:   #5b21b6;

  /* ───────── 화살표 / arrow accent ───────── */
  --demo-arrow-purple:         #a78bfa;
}
```

> ⚠️ **중요**: 위 hex 값은 PR #28 의 ch01 v2.0 코드와 **완전 동일**해야 함. 변경 시 시각 회귀 발생. 기존 hex 모두 grep 으로 추출 후 그대로 옮길 것.

### STEP 2 — `_shared/tone.ts` 생성

```ts
import './design-tokens.css';

export type Tone = {
  accent: string;        // 'var(--demo-accent-ch01)'
  accentSoft: string;
  accentBorder: string;
};

export type Chapter = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export function getTone(chapter: Chapter): Tone {
  const cc = chapter.toString().padStart(2, '0');
  return {
    accent:        `var(--demo-accent-ch${cc})`,
    accentSoft:    `var(--demo-accent-soft-ch${cc})`,
    accentBorder:  `var(--demo-accent-border-ch${cc})`,
  };
}
```

### STEP 3 — `_shared/labels.ts` 생성

SDD §4.0 LABEL_RULES + 두 검증 함수.

```ts
export const LABEL_RULES = {
  maxLabelLength: 8,         // label 한도 (권장 ≤6)
  recommendedLabelLength: 6,
  maxSubLength: 16,          // sub 한도 (권장 ≤12)
  recommendedSubLength: 12,
  forbiddenPatterns: [
    { pattern: /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u, message: 'emoji 금지' },
    { pattern: /^(OS|API|DB|UI|JS|CSS|HTML)$/, message: '영어 raw 약자 단독 금지 — 한+영 병기 (예: "운영체제 OS")' },
    { pattern: /합니다[.!?]?$/, message: '~합니다 종결 금지 — UI Glossary' },
  ],
} as const;

export type LabelKind = 'label' | 'sub';

export function validateLabel(text: string, kind: LabelKind): void {
  const max = kind === 'label' ? LABEL_RULES.maxLabelLength : LABEL_RULES.maxSubLength;
  if (text.length > max) {
    throw new Error(`[validateLabel] ${kind} 글자수 ${text.length} > ${max} (text: "${text}")`);
  }
  for (const rule of LABEL_RULES.forbiddenPatterns) {
    if (rule.pattern.test(text)) {
      throw new Error(`[validateLabel] ${rule.message} (text: "${text}")`);
    }
  }
}

export type PairItemForValidation = { label: string; sub?: string };

export type DemoLayoutValid = 'wide' | 'square' | 'tall';

export function validatePairSet(
  metaphor: PairItemForValidation[],
  it: PairItemForValidation[],
  opts: { layout: DemoLayoutValid; subPolicy: 'all' | 'none' }
): void {
  // 1. 길이 일치
  if (metaphor.length !== it.length) {
    throw new Error(`[validatePairSet] metaphor.length(${metaphor.length}) !== it.length(${it.length})`);
  }

  // 2. layout별 칸 수 한도
  const max = opts.layout === 'tall' ? 6 : 5;
  if (metaphor.length > max) {
    throw new Error(`[validatePairSet] layout=${opts.layout} max=${max}, got ${metaphor.length}`);
  }

  // 3. sub 정책 일관
  const allHaveSub = (arr: PairItemForValidation[]) => arr.every((p) => p.sub !== undefined);
  const noneHaveSub = (arr: PairItemForValidation[]) => arr.every((p) => p.sub === undefined);
  if (opts.subPolicy === 'all' && !(allHaveSub(metaphor) && allHaveSub(it))) {
    throw new Error(`[validatePairSet] subPolicy=all 위반 — 일부 셀에 sub 없음`);
  }
  if (opts.subPolicy === 'none' && !(noneHaveSub(metaphor) && noneHaveSub(it))) {
    throw new Error(`[validatePairSet] subPolicy=none 위반 — 일부 셀에 sub 있음`);
  }

  // 4. 각 라벨 검증
  for (const p of [...metaphor, ...it]) {
    validateLabel(p.label, 'label');
    if (p.sub !== undefined) validateLabel(p.sub, 'sub');
  }
}
```

### STEP 4 — `_shared/icons/` 분할

기존 `client/src/demos/ch01/_shared.tsx` 의 24개 SVG 를 다음 5 파일로 분류:

| 파일 | 포함 |
|---|---|
| `metaphor.tsx` | IngredientsIcon, PotIcon, FlameIcon, BowlIcon, StageIcon, ScriptIcon, SeatsIcon, OrdersIcon, StorageBoxIcon, CheckoutIcon, ShelfIcon, DeskIcon, StickyIcon, PenIcon, CheckBookIcon |
| `computer.tsx` | KeyboardIcon, RamIcon, CpuIcon, MonitorIcon, HardwareIcon, SoftwareIcon, StorageDiskIcon, CacheIcon, ResultIcon |
| `data.tsx` | (placeholder — ch04 부터 추가, 빈 export OK) |
| `network.tsx` | (placeholder) |
| `cloud.tsx` | (placeholder) |
| `_index.tsx` (또는 `index.ts`) | OS 관련 (OsAllocateIcon, OsScheduleIcon, OsFileIcon, OsLockIcon) — `computer.tsx` 에 합쳐도 OK |

각 파일 첫 줄: `import type { ReactNode } from 'react';` 또는 `import { type SVGProps } from 'react';`. ICON_BASE 상수도 분할된 파일들이 공유 가능 — `_shared/icons/_base.tsx` 에 분리 추천.

### STEP 5 — `_shared/card.tsx` + `chrome.tsx` + `pair-block.tsx` 생성

기존 `_shared.tsx` 에서 분할:

- **card.tsx**: `IconCard`, `ZonePanel` (Q02 의 cards 표시 패널). Tailwind 클래스에 `min-w-0 break-words` 추가 (preflight WARN W4 회피).
- **chrome.tsx**: `Hero` (제목+요약), `PairConnector` (≋ 같은 원리 ≋), `GroupBadge` ("라면 만들기 · 비유"), `LogBox` (다크 로그 박스), `StateChips` (현재 상태 chips 행).
- **pair-block.tsx**: 4 변형 (`PairFlow` `PairBinary` `PairMatch` `PairVertical`). props 시그니처는 SDD §3.3.2 와 정확히 일치.

```ts
// pair-block.tsx 예시 — PairFlow
import { type ReactNode } from 'react';
import { IconCard } from './card';
import { GroupBadge, PairConnector } from './chrome';
import type { Tone } from './tone';

export type PairItem = {
  icon: ReactNode;
  label: string;
  sub?: string;
};

export type PairFlowProps = {
  metaphorTitle: string;
  itTitle: string;
  metaphor: PairItem[];
  it: PairItem[];
  activeIndex: number;
  tone: Tone;
};

export function PairFlow({ metaphorTitle, itTitle, metaphor, it, activeIndex, tone }: PairFlowProps) {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
    >
      <GroupBadge label={metaphorTitle} sub="비유" tone={tone} />
      <div className={`grid grid-cols-${metaphor.length} items-stretch gap-2`}>
        {metaphor.map((step, idx) => (
          <IconCard
            key={step.label}
            icon={step.icon}
            label={step.label}
            sub={step.sub}
            active={activeIndex === idx}
            tone={tone}
          />
        ))}
      </div>

      <PairConnector tone={tone} />

      <GroupBadge label={itTitle} sub="실제" tone={tone} />
      <div className={`grid grid-cols-${it.length} items-stretch gap-2`}>
        {it.map((step, idx) => (
          <IconCard
            key={step.label}
            icon={step.icon}
            label={step.label}
            sub={step.sub}
            active={activeIndex === idx}
            tone={tone}
          />
        ))}
      </div>
    </section>
  );
}
```

> ⚠️ Tailwind v4 의 `grid-cols-${N}` 동적 클래스는 JIT compile 안 될 수 있음. 안전하게는 `grid-cols-2`, `grid-cols-3`, `grid-cols-4`, `grid-cols-5` 명시 분기 + safelist. 대안: `style={{ gridTemplateColumns: \`repeat(${metaphor.length}, minmax(0, 1fr))\` }}`.

### STEP 6 — `_shared/index.ts` public API surface

```ts
import './design-tokens.css';

export { PairFlow, PairBinary, PairMatch, PairVertical } from './pair-block';
export type { PairFlowProps, PairBinaryProps, PairMatchProps, PairVerticalProps, PairItem } from './pair-block';

export { IconCard, ZonePanel } from './card';
export { Hero, PairConnector, GroupBadge, LogBox, StateChips } from './chrome';
export { getTone, type Tone, type Chapter } from './tone';
export { LABEL_RULES, validateLabel, validatePairSet } from './labels';
export type { LabelKind } from './labels';

export * as Icons from './icons';
```

### STEP 7 — ch01 `Q01~Q04.tsx` 리팩토링

기존 4 파일을 새 API 로 재작성. 모든 raw hex 제거.

```tsx
// 예시: Q01Ramen.tsx 핵심 부분
import { Hero, LogBox, PairFlow, getTone, Icons, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

const tone = getTone(1);

const METAPHOR = [
  { icon: <Icons.IngredientsIcon />, label: '재료', sub: '면·물·스프' },
  { icon: <Icons.PotIcon />,         label: '냄비', sub: '잠깐 올려두기' },
  { icon: <Icons.FlameIcon />,       label: '불',   sub: '익혀서 변화' },
  { icon: <Icons.BowlIcon />,        label: '그릇', sub: '담아 내놓기' },
];

const IT = [
  { icon: <Icons.KeyboardIcon />, label: '입력',   sub: '바깥에서 들어옴' },
  { icon: <Icons.RamIcon />,      label: '메모리', sub: '작업 중 보관' },
  { icon: <Icons.CpuIcon />,      label: '처리',   sub: 'CPU가 계산' },
  { icon: <Icons.MonitorIcon />,  label: '출력',   sub: '화면·스피커' },
];

// 모듈 마운트 시점에 검증 — 위반 시 빌드/런타임 throw
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

// SCENES 데이터는 기존과 동일

export default function Q01Ramen({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.input;
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="컴퓨터의 큰 그림"
        title={scene.title}
        summary={scene.summary}
        toneVariant="orange"  // var(--demo-summary-text-orange) 등
      />
      <PairFlow
        metaphorTitle="라면 만들기"
        itTitle="컴퓨터의 동작"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={tone}
      />
      <StateChips items={scene.items} hot={0} tone={tone} />
      <LogBox logs={scene.logs} variant="stone" />
    </div>
  );
}
```

> Q02 (Binary), Q03 (Match), Q04 (Vertical Pairs) 도 동일 패턴. 각 데모의 layout 은 SDD §4 ch01 표 참조 (q01=wide, q02=square, q03=wide, q04=square — 변경 없음).

### STEP 8 — `_shared.tsx` 삭제

`client/src/demos/ch01/_shared.tsx` 파일 삭제 (`git rm`). 모든 import 가 `_shared/index.ts` 로 이전됐는지 확인.

### STEP 9 — `_preview/ShowcasePage.tsx` + 라우트 등록

```tsx
// client/src/demos/_preview/ShowcasePage.tsx
import { useState } from 'react';
import { PairFlow, PairBinary, PairMatch, PairVertical, getTone, Icons } from '../_shared';

const DUMMY_FLOW = { /* PairFlow 더미 데이터 */ };
const DUMMY_BINARY = { /* PairBinary 더미 데이터 */ };
// ...

export default function ShowcasePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  // 4 변형 모두 렌더 + active toggle 슬라이더
  return (
    <main className="mx-auto max-w-[860px] p-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">_shared/ Pair Block 4 변형</h1>
      {/* PairFlow */}
      {/* PairBinary */}
      {/* PairMatch */}
      {/* PairVertical */}
      {/* active toggle */}
    </main>
  );
}
```

`client/src/App.tsx` 의 catch-all `*` (line 49) **위에** 추가:

```tsx
<Route path="/demos-preview/showcase" element={<ShowcasePage />} />
```

import 도 추가: `import ShowcasePage from './demos/_preview/ShowcasePage';`

### STEP 10 — `_shared/README.md` 작성

```markdown
# _shared/ — 데모 공용 인프라

## Public API
**규칙**: 컴포넌트는 `_shared/index.ts` 에서만 import. `_shared/pair-block` 등 직접 경로 import 금지.

| Export | 용도 |
|---|---|
| `PairFlow` | 4-N 시퀀스 메타포↔IT 병치 (wide layout) |
| `PairBinary` | 2개 비교 (square layout) |
| `PairMatch` | 4-N 역할 매핑 (wide layout) |
| `PairVertical` | N행 메타포 ≈ 실제 (square layout) |
| `IconCard`, `ZonePanel` | 카드 primitive |
| `Hero`, `LogBox`, ... | chrome primitive |
| `getTone(chapter)` | 챕터 accent 토큰 객체 |
| `LABEL_RULES`, `validateLabel`, `validatePairSet` | 라벨 검증 |
| `Icons.*` | SVG 아이콘 네임스페이스 |

## DO / DON'T
**DO**:
- `import { ... } from '../_shared'` 만 사용
- `var(--demo-...)` CSS 변수만 사용 (raw hex 0건)
- 컴포넌트 마운트 시 `validatePairSet(...)` 호출

**DON'T**:
- `from '../_shared/pair-block'` 직접 경로 import
- inline `style={{ color: '#ea580c' }}` (raw hex 금지 — `var(--demo-accent-ch01)` 사용)
- ch01 외 챕터에서 ch01 전용 SVG (`IngredientsIcon` 등) 재사용 (메타포 컬렉션 구분)

## 4 변형 props
[SDD-preview-inline-v2.md §3.3.2 그대로 복사]
```

### STEP 11 — Baseline 캡처 안내 파일

```
qa/preview-baseline/
└── CAPTURE-INSTRUCTIONS.md
```

```markdown
# Baseline 캡처 안내 (사용자 단계)

## 캡처 대상 (8 PNG)

데스크탑 1440×900 + 모바일 393×852 두 viewport 에서 ch01 4 데모.

```
http://localhost:5176/library/1/ch01_q01
http://localhost:5176/library/1/ch01_q02
http://localhost:5176/library/1/ch01_q03
http://localhost:5176/library/1/ch01_q04
```

## 파일명

```
ch01_q01_desktop.png
ch01_q01_mobile.png
ch01_q02_desktop.png
ch01_q02_mobile.png
ch01_q03_desktop.png
ch01_q03_mobile.png
ch01_q04_desktop.png
ch01_q04_mobile.png
```

## 절차

1. `cd /home/claude/architecture && npm run dev`
2. 브라우저에서 위 4 URL 접속
3. Chrome DevTools → Toggle device toolbar → Responsive → 1440×900 또는 393×852 (iPhone 15 Pro)
4. Cmd+Shift+P → "Capture full size screenshot"
5. `qa/preview-baseline/{파일명}.png` 로 저장
6. `git add qa/preview-baseline/*.png && git commit -m "qa: ch01 baseline 캡처 8장"`
```

### STEP 12 — 검증·커밋·push

```bash
# 1. raw hex 0건
grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos --include="*.tsx" --include="*.ts"
# 출력 빈 결과 = PASS. 무엇이든 출력되면 토큰화 누락 — 추가 작업 필요.

# 2. import 경로 강제
grep -E "from ['\"]\.\.?/_shared/[^']" client/src/demos/ch01/*.tsx
# 출력 빈 결과 = PASS. (`from '../_shared'` 만 허용, `from '../_shared/pair-block'` 금지)

# 3. 빌드
cd client && npm run build
cd ../server && npm run build

# 4. 커밋
cd ..
git add client/src/demos/ client/src/App.tsx qa/preview-baseline/
git rm client/src/demos/ch01/_shared.tsx
git status
git commit -m "feat(demos): _shared 공용 계약 잠금 (PR-12)

- _shared/design-tokens.css ~55 CSS 변수 (DESIGN-POLICY §9.B-3 예외)
- _shared/index.ts public API surface
- pair-block 4 변형 (Flow / Binary / Match / Vertical)
- card / chrome / tone / labels 분할
- validateLabel + validatePairSet (LABEL_RULES 강제)
- icons/ 디렉토리 분할 (computer / metaphor / 챕터 placeholder)
- ch01 Q01~Q04 _shared/index.ts 만 import + raw hex 0건 토큰화
- /demos-preview/showcase 라우트 신설
- _shared/README.md (Public API + DO/DON'T)
- qa/preview-baseline/CAPTURE-INSTRUCTIONS.md (사용자 캡처 안내)

SDD: SDD-preview-inline-v2.md §3.3 + §4.0 + §6
sentinel: pr12-r1-gen.status

Co-Authored-By: Codex <noreply@openai.com>"

# 5. push
git push -u origin feat/preview-inline-shared-contract

# 6. 센티넬 작성
cat > qa/ao-logs/pr12-r1-gen.status <<'EOF'
{"status":"done","step":"pr12","role":"gen","model":"codex","session_id":"arch-XX","ts":"2026-05-02TXX:XX:XXZ","branch":"feat/preview-inline-shared-contract","commit":"<SHA>","pr":"<PR URL or pending-master>","loc":"+XXXX -YYY","note":"공용 계약 잠금 — _shared/* 분할 + design-tokens.css ~55 vars + 4 PairBlock 변형 + LABEL_RULES + ch01 raw hex 0건 + showcase 라우트"}
EOF
```

PR 생성은 Master 가 처리. Generator 는 push + 센티넬 까지만.

---

## 2. 합격 기준 (Sprint Contract C1~C13)

`HANDOFF-pr12-planner-spec.md §2.1` 참조. 핵심:

- ✅ `grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos --include="*.tsx" --include="*.ts"` 빈 결과 (raw hex 0건)
- ✅ `npm run build` PASS
- ✅ `_shared/index.ts` 외 `_shared/` 직접 경로 import 0건
- ✅ ch01 4 데모 시각이 PR #28 와 동등 (사용자 baseline 캡처로 검증)
- ✅ `/demos-preview/showcase` 200 응답 + 4 변형 렌더

---

## 3. WARN 회피 — 반드시 준수

| WARN | 작업 시 준수 사항 |
|---|---|
| W1 STAGE=audit 함정 | CI 통과 = 정책 정합 아님. C9 grep 0건 까지 작업 미완료 |
| W2 ch01 hex 43건 | design-tokens.css 에 보조 토큰 ~17개 추가 (W2 분포 표 참조) |
| W3 픽셀 동등성 | 토큰화 hex 값을 PR #28 와 **완전 동일**하게 유지 |
| W4 모바일 overflow | `card.tsx` IconCard 클래스에 `min-w-0 break-words` 강제 |

---

## 4. 작업 외 영역 (사용자 확인 필수 — 멈추고 묻기)

- `shared/DESIGN-POLICY.md` 화이트리스트 변경 — **불필요** (design-tokens.css 가 이미 예외)
- `scripts/check-design-policy.sh` 변경 — **불필요**
- 다른 프로젝트 (ai-app-builder 등) 코드 변경 — **금지**

---

## 5. 센티넬 JSON

작업 완료 시 `qa/ao-logs/pr12-r1-gen.status` 작성. 스키마는 `qa/ao-logs/SENTINEL-SPEC.md` 참조.
