# HANDOFF-pr12-planner-spec — 공용 계약 잠금

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **브랜치**: `feat/preview-inline-shared-contract` (Generator 가 main 기준 분기 — `git checkout main && git pull && git checkout -b feat/preview-inline-shared-contract`)
> **base**: `main` (PR #28 머지된 상태 — `d39599d feat(preview): iframe·폰 프레임 제거 + ch01 인라인 마이그레이션 + 메타포 병치 패턴`)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2)
> **상위 SDD**: `/home/claude/architecture/SDD-preview-inline-v1.md`
> **Phase 1 (Planner) 산출물.** Generator(T2) / Eval-Visual(T3) / Eval-Interaction(T4) 가 모두 이 파일을 시작점으로 참조.

---

## 0. PR 정의

- **레포**: `https://github.com/nyuoasis-cmd/architecture`
- **Step**: `pr12`
- **목표**: 공용 API surface 잠금 — `_shared/*` 분할 + Pair Block 4 변형 props + design-tokens.css + LABEL_RULES + validateLabel/validatePairSet + Showcase 라우트 + ch01 raw hex 토큰화
- **Out of scope**: ch02~ch10 콘텐츠 마이그레이션 (PR-13~21 후속), iframe fallback 분기 제거 (PR-22 cleanup)

---

## 1. 워크플로우 — 4-Phase 적용

| Phase | 역할 | 모델 | 터미널 | 입력 핸드오프 |
|---|---|---|---|---|
| 1 Planner | 명세·Sprint Contract·리스크 | Claude Master (이 세션) | T1 | 본 파일 |
| 2 Generator | 구현 | **Codex** | T2 | `HANDOFF-pr12-generator.md` |
| 3 Eval-Visual | 시각 검증 | **Codex** (별도 터미널) | T3 | `HANDOFF-pr12-eval-visual.md` |
| 4 Eval-Interaction | 동작·import·validator 검증 | **Codex** (별도 터미널) | T4 | `HANDOFF-pr12-eval-interaction.md` |

> 모델 배치 근거: `feedback_4phase-evaluator-codex-only.md` (2026-05-02) — GLM 폐지 후 Eval 시각·인터랙션 둘 다 Codex 별도 터미널 운영.

---

## 2. Sprint Contract 4축

### 2.1 코드 기준 (Generator 자체 보고)

| # | 기준 | 검증 방법 |
|---|---|---|
| C1 | `client/src/demos/_shared/design-tokens.css` 존재 + ch01~ch10 accent/soft/border (30) + log 3 + summary 10 + chip-active 1 + card-bg 1 + ~10 보조 = 약 **55개 CSS 변수** | `grep -c "^\s*--demo" client/src/demos/_shared/design-tokens.css` ≥ 50 |
| C2 | `client/src/demos/_shared/index.ts` 존재 + public API 모두 re-export (`PairFlow/PairBinary/PairMatch/PairVertical`, `IconCard/ZonePanel`, `Hero/PairConnector/GroupBadge/LogBox/StateChips`, `getTone`, `LABEL_RULES`/`validateLabel`/`validatePairSet`, `Icons.*`) | `grep -E "^export" client/src/demos/_shared/index.ts \| wc -l` ≥ 7 |
| C3 | `_shared/pair-block.tsx` 4 변형 컴포넌트 모두 export + props 타입은 SDD §3.3.2 와 일치 | grep `export function PairFlow`, `PairBinary`, `PairMatch`, `PairVertical` |
| C4 | `_shared/tone.ts` `getTone(chapter: 1\|2\|...\|10): Tone` 함수 + `Tone` 타입 export. 반환값은 `var(--demo-...)` 문자열만 | grep `var(--demo-accent-` |
| C5 | `_shared/labels.ts` `LABEL_RULES` 상수 + `validateLabel(text, kind)` + `validatePairSet(metaphor, it, opts)` 함수. 위반 시 throw | grep `throw new Error` 두 함수 모두에 |
| C6 | `_shared/icons/{computer,data,network,cloud,metaphor}.tsx` 5 파일 + 기존 ch01 24 SVG 모두 분류 이전 | `ls client/src/demos/_shared/icons/*.tsx \| wc -l` = 5 |
| C7 | `client/src/demos/_preview/ShowcasePage.tsx` + `App.tsx` 라우트 `/demos-preview/showcase` 등록 (기존 catch-all `*` 위에) | grep `Route path="/demos-preview/showcase"` `client/src/App.tsx` |
| C8 | ch01 4개 (`ch01/Q01~Q04.tsx`) 가 `_shared/index.ts` 만 import. `from '../types'`, `from './_shared'` 등 다른 경로 0건 | `grep -E "from ['\"]\.\.?/_shared(?!/index)" client/src/demos/ch01/*.tsx` = 0 |
| **C9** | **🚨 client/src/demos/\*\*/\*.{ts,tsx} raw hex 0건** (preflight WARN #2 반영) | `grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos --include="*.tsx" --include="*.ts"` 가 빈 결과 |
| C10 | `_shared/README.md` 존재 + 4 변형 props 표 + DO/DON'T (raw hex 금지 / `_shared/index.ts` 외 import 금지) 포함 | grep `## DO/DON'T`, `## Props` |
| C11 | `npm run build` (client + server) PASS | exit 0 |
| C12 | TypeScript strict 통과 (`tsc -b` 에러 0건) | build log |
| C13 | `qa/preview-baseline/` 디렉토리에 ch01 4 데모 × 2 viewport (1440·393) = **8 PNG** 커밋 (사용자가 캡처 — Generator 는 빈 디렉토리 + README 만 생성하고 사용자에게 캡처 요청 안내) | `ls qa/preview-baseline/*.png \| wc -l` = 8 (사용자 단계) / Generator 단계 = `qa/preview-baseline/CAPTURE-INSTRUCTIONS.md` 존재 |

### 2.2 시각 기준 (Eval-Visual 검증)

`HANDOFF-pr12-eval-visual.md` 참조. 핵심:
- ch01 4 데모 시각 동등성 (PR #28 머지 직전 vs 토큰화 후) — 픽셀 동일 우선 / 미세 차 (1~2px) 허용
- `/demos-preview/showcase` 4 변형 모두 더미 데이터로 렌더 + 활성 토글 동작
- 모바일 393px 줄바꿈 자연 (1~2줄 한도)
- accent + accentSoft 활성 라벨 텍스트 대비비 ≥ 4.5:1 (WCAG AA)

### 2.3 인터랙션·구조 기준 (Eval-Interaction 검증)

`HANDOFF-pr12-eval-interaction.md` 참조. 핵심:
- 시나리오 칩 클릭 → 메타포 셀 + IT 셀 동시 활성화 (한쪽만 변하면 FAIL)
- ch02_q01 등 미마이그 데모는 fallback iframe + phone-frame 그대로
- `validateLabel('가전제품', 'label')` (8자 한도 초과) throw 검증
- `validatePairSet([{label:'A'}], [{label:'A',sub:'foo'}], {layout:'wide', subPolicy:'all'})` (sub 일관 위반) throw 검증
- ch01 컴포넌트가 `_shared/index.ts` 외 경로 import 0건 (grep)

### 2.4 정책 정합 (자체 검증)

- `client/src/demos/_shared/design-tokens.css` 가 DESIGN-POLICY §9.B-3 예외 (`**/design-tokens.css`) 매칭 — `scripts/check-design-policy.sh:91` 의 `! -name 'design-tokens.css'` 가 정확히 매칭
- ⚠️ `STAGE=audit` 가 default 라 CI 차단 안 되더라도 **C9 grep 0건** 이 acceptance 강제

---

## 3. 산출물 트리

```
client/src/demos/
├── _shared/
│   ├── index.ts            (NEW — public API surface)
│   ├── design-tokens.css   (NEW — 약 55개 CSS 변수)
│   ├── pair-block.tsx      (NEW — PairFlow/PairBinary/PairMatch/PairVertical)
│   ├── card.tsx            (NEW — IconCard, ZonePanel)
│   ├── chrome.tsx          (NEW — Hero, PairConnector, GroupBadge, LogBox, StateChips)
│   ├── tone.ts             (NEW — getTone, Tone)
│   ├── labels.ts           (NEW — LABEL_RULES, validateLabel, validatePairSet)
│   ├── icons/
│   │   ├── computer.tsx    (NEW — Keyboard, Ram, Cpu, Monitor, ...)
│   │   ├── data.tsx        (NEW — placeholder, ch04부터 추가)
│   │   ├── network.tsx     (NEW — placeholder)
│   │   ├── cloud.tsx       (NEW — placeholder)
│   │   └── metaphor.tsx    (NEW — Ingredients, Pot, Flame, Bowl, Stage, Script, Restaurant, Bookshelf, ...)
│   └── README.md           (NEW — props 표 + DO/DON'T)
├── _preview/
│   └── ShowcasePage.tsx    (NEW — /demos-preview/showcase)
├── ch01/
│   ├── _shared.tsx         (DELETE — 분할 완료 후)
│   ├── Q01Ramen.tsx        (REFACTOR — _shared/index.ts 만 import, hex 0건)
│   ├── Q02Stage.tsx        (REFACTOR)
│   ├── Q03Restaurant.tsx   (REFACTOR)
│   └── Q04Bookshelf.tsx    (REFACTOR)
├── registry.ts             (변경 없음)
└── types.ts                (변경 없음)

client/src/App.tsx          (UPDATE — /demos-preview/showcase 라우트 추가)

qa/
└── preview-baseline/
    ├── CAPTURE-INSTRUCTIONS.md  (NEW — 사용자가 캡처 — Generator 는 dir + 안내 파일만)
    └── (8 PNG — 사용자 단계)
```

---

## 4. 위험 및 회피책 (Preflight WARN 4건)

| WARN | 회피책 |
|---|---|
| **W1**: Gate STAGE=audit 함정 — CI 통과 ≠ 정책 정합 | Generator 는 C9 grep 0건 통과까지 작업 미완료 처리. CI 결과 무관. |
| **W2**: ch01 raw hex 43건 + 25 hex 종류 토큰화 | design-tokens.css 에 ch01~ch10 챕터 토큰 30개 외에 보조 토큰 명시: `--demo-card-bg` (#fff) / `--demo-card-bg-alt` (#f8fafc) / `--demo-log-bg-stone` (#111827) / `--demo-log-bg-blue` (#102a43) / `--demo-log-bg-navy` (#0f172a) / `--demo-log-fg` (#f8fafc) / `--demo-log-time-stone` (#94a3b8) / `--demo-log-time-blue` (#bfdbfe) / `--demo-log-time-cyan` (#93c5fd) / `--demo-log-time-purple` (#c4b5fd) / `--demo-summary-text-orange` (#7c2d12) / `--demo-summary-text-slate` (#475569) / `--demo-summary-text-stone` (#334155) / `--demo-text-faint-orange` (#fed7aa) / `--demo-chip-hot-orange-fg` (#9a3412) / `--demo-chip-hot-purple-fg` (#5b21b6) / `--demo-arrow-purple` (#a78bfa). 총 17 보조 + 30 챕터 + 8 chrome (border, text-muted 등은 기존 `--color-*` 사용 가능) ≈ **55 토큰** |
| **W3**: 픽셀 동등성 보장 어려움 | 토큰화 hex 값을 PR #28 의 hex 와 **완전 동일**하게 유지. CSS 변수 경유로 인한 1~2px 차이는 §6 acceptance 허용 |
| **W4**: 모바일 393px overflow | `_shared/card.tsx` IconCard 기본 클래스에 `min-w-0 break-words`. label 글자수 ≤6 (LABEL_RULES) 강제로 추가 보호 |

---

## 5. 센티넬 + 진행 보고

| Role | 센티넬 파일 | 사용자/Master 트리거 |
|---|---|---|
| Generator | `qa/ao-logs/pr12-r1-gen.status` | Codex T2 가 작업 완료 후 status JSON 작성 |
| Eval-Visual | `qa/ao-logs/pr12-r1-eval-visual.status` | Codex T3 가 검증 완료 후 verdict 작성 |
| Eval-Interaction | `qa/ao-logs/pr12-r1-eval-interaction.status` | Codex T4 가 검증 완료 후 verdict 작성 |

센티넬 JSON 스키마: `qa/ao-logs/SENTINEL-SPEC.md` 참조.

---

## 6. PR 정책

- Generator 는 별도 브랜치 (`codex/pr12-shared-contract`) 에 push + draft PR. Master 가 머지 후 cherry-pick → `feat/preview-inline-shared-contract` 갱신 → main 에 PR open. (`feedback_ao-codex-pr-rule-conflict.md` 패턴)
- 또는 Generator 가 `feat/preview-inline-shared-contract` 직접 push (Master 사전 승인 시) — 본 SDD 기준은 후자 가능 (사용자 1회 승인 — `진행해`).

---

## 7. 다음 STEP (PR-12 머지 후)

PR-13 (ch02 4개 데모 마이그레이션). HANDOFF-pr13-* 가 본 잠금된 공용 API 만 사용. 신규 SVG 는 `_shared/icons/data.tsx` 등에 추가.
