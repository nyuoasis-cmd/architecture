# HANDOFF-pr16a-round1 — ch05 q01~q04 인라인 변환 (웹·프론트백 시작)

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **PR**: PR-16a — ch05 4 데모 (`q01~q04`) React 인라인 변환 (웹·프론트백 · sky-600 톤 — ch05 시작)
> **base**: `main` (`2a1adba` PR-15b 머지 후)
> **작업 브랜치**: `feat/preview-inline-ch05-q1-q4` (이미 origin push 완료)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §4.2 ch05)
> **참조 패턴**:
>   - **q01 B square (PairBinary)**: `client/src/demos/ch01/Q02Stage.tsx`
>   - **q02/q03 A wide (PairFlow)**: `client/src/demos/ch04/Q03DataDup.tsx`, `Q04DataIndex.tsx`
>   - **q04 C wide (PairMatch)**: `client/src/demos/ch04/Q02DataFormat.tsx`
> **에픽 위치**: 챕터 프레임 통일 에픽 6/18 (PR-13~15b ✅ → **PR-16a** → PR-16b → ... → PR-22)

---

## 0. 메타 (AO 파서가 읽는 영역)

| key | value |
|---|---|
| step | pr16a |
| round | 1 |
| branch | feat/preview-inline-ch05-q1-q4 |
| base | main |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** |
| **eval-visual model override** | **codex** |
| **eval-interaction model override** | **codex** |

---

## 1. ch05 q01~q04 매핑 (SDD v2.2 §4.2 — 잠금됨)

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 | layout |
|---|---|---|---|---|---|
| ch05_q01 | 홀 / 주방 / 약속 / 분리 | 프론트엔드 / 백엔드 / API / 분리 이점 | 사용 | **B Binary** (PairBinary) | square |
| ch05_q02 | 뼈대 / 모양 / 반응 / 합체 | HTML / CSS / JS / 통합 | 사용 | **A Flow** (PairFlow) | wide |
| ch05_q03 | 요청 / 자원 / 메서드 / 단발 | 요청 / 자원 / 메서드 / 무상태 | 사용 | **A Flow** (PairFlow) | wide |
| ch05_q04 | 시작 / 이동 / 응답 / 혼합 | SPA 시작 / SPA 이동 / SSR 시작 / 혼합 전략 | 사용 | **C Match** (PairMatch) | wide |

**챕터 톤**: `getTone(5)` = sky-600 (SDD §4.0 컬러 표 — `#0284c7` accent / sky-100 bg / sky-300 highlight)

---

## §A. Generator (Codex)

### §A 시작 단계

1. `cd /home/claude/architecture`
2. `git fetch origin main && git checkout main && git pull --ff-only`
3. `git log --oneline -1` 확인 (`2a1adba feat(preview): ch04 q05~q07 인라인 변환 (PR-15b)` 이후)
4. `git checkout feat/preview-inline-ch05-q1-q4` (이미 main 기준으로 origin push 됨)
5. 모든 commit 은 본 브랜치 위에 직접
6. `git push origin feat/preview-inline-ch05-q1-q4` (force 금지)

### §A 작업 단계

#### STEP 1 — 신규 SVG 아이콘 (`_shared/icons/`)

**`metaphor.tsx`** — 메타포 측 신규:
```
q01: 홀 (HallIcon) / 주방 (KitchenIcon) / 약속 (PromiseIcon) / 분리 (SeparateIcon)
q02: 뼈대 (SkeletonIcon) / 모양 (ShapeIcon) / 반응 (ReactIcon) / 합체 (UniteIcon)
q03: 요청 (RequestMetaIcon — 충돌 시 별명) / 자원 (ResourceIcon) / 메서드 (MethodIcon) / 단발 (StatelessIcon)
q04: 시작 (StartIcon) / 이동 (MoveIcon) / 응답 (RespondIcon) / 혼합 (MixIcon)
```

**`computer.tsx`** — IT 측 신규:
```
q01: 프론트엔드 (FrontendIcon) / 백엔드 (BackendIcon) / API (ApiIcon) / 분리 이점 (SeparationIcon)
q02: HTML (HtmlIcon) / CSS (CssIcon) / JS (JsIcon) / 통합 (IntegrationItIcon — IntegrationIcon 충돌 시 별명)
q03: 요청 (HttpRequestIcon) / 자원 (RestResourceIcon) / 메서드 (HttpMethodIcon) / 무상태 (StatelessItIcon)
q04: SPA 시작 (SpaInitIcon) / SPA 이동 (SpaNavIcon) / SSR 시작 (SsrInitIcon) / 혼합 전략 (HybridIcon)
```

> **충돌 회피**: 기존 InstallIcon/ItInstallIcon 패턴. ReactIcon (metaphor) ↔ ReactJsIcon 등.
> **재사용 가능 후보**: `RequestCountIcon`, `IntegrationIcon`, `ResultIcon` 등 라벨이 동일하면 재사용.

#### STEP 2 — `Q01HallKitchen.tsx` (PairBinary square — B)

**참조**: `client/src/demos/ch01/Q02Stage.tsx` 패턴 (PairBinary 의 SCENES 는 `stageActive` / `scriptActive` boolean 형태).

```ts
metaphorTitle: '식당 운영'  (자유)
itTitle: '웹 아키텍처'

// PairBinary props:
// metaphorLeft, metaphorRight, itLeft, itRight (각각 cards: string[] 가능)
metaphorLeft:  { icon: <Icons.HallIcon />,    label: '홀',   sub: '손님 응대',   cards: [...] }
metaphorRight: { icon: <Icons.KitchenIcon />, label: '주방', sub: '음식 조리',   cards: [...] }
itLeft:        { icon: <Icons.FrontendIcon />,label: '프론트엔드', sub: '화면 응답', cards: [...] }
itRight:       { icon: <Icons.BackendIcon />, label: '백엔드',     sub: '데이터 처리', cards: [...] }
tone: getTone(5)
```

SCENES 4개 — 각 시나리오별 left/right active boolean + cards. ch01 Q02Stage 와 동일 구조.

> **약속 / 분리** scenarios 는 추가 row 또는 badge 로 표현 (ch01 Q02 의 `badges` 패턴 참조).

#### STEP 3 — `Q02WebStack.tsx` (PairFlow wide — A)

```ts
metaphorTitle: '집 짓기'  (자유)
itTitle: '웹 3대장'
metaphor: [
  { icon: <Icons.SkeletonIcon />, label: '뼈대', sub: '구조' },
  { icon: <Icons.ShapeIcon />,    label: '모양', sub: '꾸미기' },
  { icon: <Icons.ReactIcon />,    label: '반응', sub: '동작' },
  { icon: <Icons.UniteIcon />,    label: '합체', sub: '함께 동작' },
]
it: [
  { icon: <Icons.HtmlIcon />, label: 'HTML', sub: '구조 마크업' },
  { icon: <Icons.CssIcon />,  label: 'CSS',  sub: '스타일' },
  { icon: <Icons.JsIcon />,   label: 'JS',   sub: '동작' },
  { icon: <Icons.IntegrationItIcon />, label: '통합', sub: '브라우저 렌더' },
]
tone: getTone(5)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 4 — `Q03Rest.tsx` (PairFlow wide — A)

```ts
metaphorTitle: '주문 양식'  (자유)
itTitle: 'REST 호출'
metaphor: [
  { icon: <Icons.RequestMetaIcon />, label: '요청',   sub: '무엇을' },
  { icon: <Icons.ResourceIcon />,    label: '자원',   sub: '대상' },
  { icon: <Icons.MethodIcon />,      label: '메서드', sub: '동사' },
  { icon: <Icons.StatelessIcon />,   label: '단발',   sub: '독립 호출' },
]
it: [
  { icon: <Icons.HttpRequestIcon />,  label: '요청',   sub: 'HTTP request' },
  { icon: <Icons.RestResourceIcon />, label: '자원',   sub: 'URI' },
  { icon: <Icons.HttpMethodIcon />,   label: '메서드', sub: 'GET/POST/...' },
  { icon: <Icons.StatelessItIcon />,  label: '무상태', sub: '세션 X' },
]
tone: getTone(5)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 5 — `Q04SpaSsr.tsx` (PairMatch wide — C)

```ts
metaphorTitle: '극장 운영'  (자유)
itTitle: 'SPA vs SSR'
metaphor: [
  { icon: <Icons.StartIcon />,   label: '시작',  sub: '한 번에 준비' },
  { icon: <Icons.MoveIcon />,    label: '이동',  sub: '내부에서만' },
  { icon: <Icons.RespondIcon />, label: '응답',  sub: '서버가 매번' },
  { icon: <Icons.MixIcon />,     label: '혼합',  sub: '상황별' },
]
it: [
  { icon: <Icons.SpaInitIcon />, label: 'SPA 시작', sub: '초기 번들' },
  { icon: <Icons.SpaNavIcon />,  label: 'SPA 이동', sub: '클라 라우팅' },
  { icon: <Icons.SsrInitIcon />, label: 'SSR 시작', sub: '서버 렌더' },
  { icon: <Icons.HybridIcon />,  label: '혼합 전략', sub: 'ISR/SSG' },
]
tone: getTone(5)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### STEP 6 — `data/demos.ts` 신규 entry 4개 + `registry.ts` 라우트 4개

> **🚨 PR-15a round 1 fail 재발 방지** — `data/demos.ts` 의 `scenarios[].id` ↔ 컴포넌트 SCENES 키 정확히 일치.

`registry.ts`:
```ts
ch05_q01: { Component: Q01HallKitchen, layout: 'square' },  // ← square (B Binary)
ch05_q02: { Component: Q02WebStack,    layout: 'wide' },
ch05_q03: { Component: Q03Rest,        layout: 'wide' },
ch05_q04: { Component: Q04SpaSsr,      layout: 'wide' },
```

### §A 절대 금지

- ch01~ch04 + ch05_q05~q07 + ch06~ch10 콘텐츠 수정
- `_shared/*` 공용 계약 변경 (PR-12 잠금)
- `_shared/pair-block.tsx`, `_shared/design-tokens.css`, `PreviewPanel.tsx`, `LearnPage.tsx` 변경
- raw hex, master/main push, force push, no-verify

### §A 검증 (자체 보고)

1. `cd client && npm run build` 무에러
2. `/library/5/ch05_q01~q04` 4 라우트 접근 가능
3. 4 데모 모두 sky-600 accent (이전 PR 와 다른 톤)
4. raw hex grep 0건 / `_shared` 외 import grep 0건
5. **🚨 시나리오 ID 정렬 grep**: `data/demos.ts` ch05 ids ↔ 컴포넌트 SCENES 키 1:1
6. PairBinary 의 경우 SCENES 가 `xLeftActive` 형태이므로 ID 매칭 검증 별도 (Q02Stage 패턴 참조)

### §A 완료 시 센티넬

`qa/ao-logs/pr16a-r1-gen.status`:
```json
{"status":"done","step":"pr16a","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"feat/preview-inline-ch05-q1-q4","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"ch05 q01~q04 4 demos (q01=B square, q02~q04=wide). sky-600 톤. data/demos.ts ↔ SCENES ID 정렬 검증 완료."}
```

---

## §B. Eval-Visual (Codex)

PR-15a/15b 동일 V1~V9. **챕터 톤이 sky-600 (`#0284c7`)** 이므로 V4 contrast 측정값이 amber-700 과 다름. WCAG AA 4.5:1 만족 확인.

ch05_q01~q04 4 데모 + ch04 spot-check 1건.

### §B 시작 단계 / 결과물

PR-15a/15b 동일 패턴. 센티넬 = `qa/ao-logs/pr16a-r1-eval-visual.status`. JSON = `qa-eval/pr16a-eval-visual-round1.json`.

---

## §C. Eval-Interaction (Codex)

PR-15a/15b 동일 I1~I8 (특히 I5/I7/I8 ID 정렬 + I7 deep-link).

> ⚠️ **eval branch push 강제** + **main worktree sentinel `git add -f`** (PR-15a 학습)

`qa/ao-logs/pr16a-r1-eval-interaction.status` + `qa-eval/pr16a-eval-interaction-round1.json`.

---

## 2. Master verdict 수령 절차

3 PASS → PR / 1+ REVISE/FAIL → round 2 / SHA mismatch → stale 의심.

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. PR-15b 머지 직후 ch05 q01~q04 진입. ch05 시작 (sky-600) — q01 B square 신규 변형 (PairBinary, ch01 Q02Stage 패턴 참조) |
