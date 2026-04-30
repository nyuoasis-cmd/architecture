# PR-1 Planner Spec — Architecture 한결 v1 정합 목업

> **Phase 1 (Planner) 산출물.** Generator(T2) / Eval-Visual(T3 GLM) / Eval-Interaction(T4 Codex) 모두 본 파일 시작점.
>
> 작성: 2026-04-30 / 단일 진입점 SDD: `/home/claude/shared/SDD-한결-redesign-v1.md` §3 (PR-1 표본)
> 정책: `shared/DESIGN-POLICY.md` (한결 v1.0/1.1/1.2), `shared/BUILDER-UX-POLICY.md`, `shared/한결-INDEX.md`
> 토큰: `shared/design-tokens.css`

---

## 0. PR 정의

- **레포**: `nyuoasis-cmd/architecture` (이미 존재, AO 표본 운영 중)
- **브랜치**: `redesign/hangyeol-v1-mockups` (Generator가 생성)
- **base**: `main`
- **목표**: 12 라우트 전체 한결 v1 정합 mockup 7건 + AO 표본 자체 검증 (다른 PR이 본 PR-1을 패턴 기준으로 사용)
- **HANDOFF 파일명**: `HANDOFF-hangyeol-pr1-{role}.md` (기존 PR #1 코드 스캐폴드 HANDOFF와 prefix 분리)
- **센티넬**: `qa/ao-logs/step-hangyeol-pr1-{gen|eval-visual|eval-interaction}.status`

---

## 1. 워크플로우 — 4-Phase

| Phase | 역할 | 모델 | 터미널 | 입력 |
|---|---|---|---|---|
| 1 Planner | 본 spec | Claude Opus | T1 | 마스터 SDD §3 + 인벤토리 |
| 2 Generator | mockup HTML 작성 | Claude Opus (Master 직접) | T2 또는 self | 본 spec |
| 3 Eval-Visual | 시각 토큰·여백·타이포 | GLM-5.1 | T3 | 본 spec + Generator 산출 |
| 4 Eval-Interaction | 카피·CTA·이모지·금지 요소 | Codex | T4 | 본 spec + Generator 산출 |

**자동화 한계**: Phase 3·4는 별도 모델·터미널 강제(WORKFLOW-4PHASE.md). Master가 부재 중 Phase 2까지 진행 가능. Phase 3·4는 사용자 복귀 후.

---

## 2. 산출물 7건

각 mockup은 `architecture/mockups/hangyeol-{slug}.html`. Pretendard CDN load + design-tokens 인라인 또는 import.

| # | 파일 | 화면 | 한결 카드 | 적용 layer |
|---|---|---|---|---|
| M1 | `hangyeol-landing.html` | `/` LandingPage | A (학습형 §9-A2) | landing |
| M2 | `hangyeol-library.html` | `/library` (71 Q&A 인덱스) | C (gallery 변형) | workspace |
| M3 | `hangyeol-learn.html` | `/library/:c/:q` 자습 + `/learn/:s` 수업 | C (3컬럼 빌더) | workspace |
| M4 | `hangyeol-teacher-dashboard.html` | `/teacher` | B (max-w-4xl D안) | workspace |
| M5 | `hangyeol-teacher-session.html` | `/teacher/session/:id` | C (max-w-[900px]) | workspace |
| M6 | `hangyeol-join.html` | `/join` 학생 참여 | D | workspace |
| M7 | `hangyeol-system.html` | 404·403·about·dev-login·forbidden 모음 | F | workspace |

---

## 3. Sprint Contract 4축

### 3.1 코드 기준 (C1~C13) — Generator 자체 보고

| # | 기준 | 검증 |
|---|---|---|
| C1 | mockup 파일 7건 모두 정확한 위치·이름 | `ls architecture/mockups/hangyeol-*.html` |
| C2 | 모든 파일 `<!DOCTYPE html>` + `<html lang="ko">` + viewport meta | grep |
| C3 | 모든 파일 Pretendard 로드 (CDN 또는 design-tokens.css 임베드) | grep |
| C4 | `Outfit` 참조 0건 (한결 §9.C-1) | `grep -c "Outfit"` |
| C5 | 인라인 hex `#[0-9a-fA-F]{3,8}` 0건 (예외: BrandMark 영역, design-tokens 정의 라인) | grep regex |
| C6 | `dark:` prefix 0건 + `prefers-color-scheme: dark` 0건 | grep |
| C7 | CSS 변수 사용: `--color-*`, `--radius-*`, `--type-*`, `--font-*` | grep |
| C8 | M1: hero 6요소 (영문 라벨 / 제목 2줄 / 캡션 / CTA cluster / Ghost 없음(학습형) / `--color-surface` 배경) | grep + 시각 |
| C9 | M1 CTA Primary "학습 시작하기" + Secondary "이어 학습하기" 정확 (§9-A2.3) | grep exact |
| C10 | M3: 3컬럼 — left GuidePanel(목차/진도) + center ChatPanel(Q&A 본문 + Claude 챗) + right PreviewPanel(iframe 시연) | grep + DOM |
| C11 | M4: `max-width: 896px` 또는 `max-w-4xl` + flex `items-end` 헤더 + 통계 3셀 카드 | grep |
| C12 | M5: `max-width: 900px` (BUILDER-UX §4-A) | grep |
| C13 | M6: 2단계 (코드 → 이름) + 6자리 단일 input + `font-mono` 코드 입력 | grep |

### 3.2 자동 검증 (A1~A5)

| # | 기준 | 명령 |
|---|---|---|
| A1 | HTML5 valid (모든 mockup) | `npx html-validate architecture/mockups/hangyeol-*.html` |
| A2 | 모바일 viewport (375×812) 가로 스크롤 0px | Puppeteer (Eval-Visual 단계) |
| A3 | 데스크톱 (1280×800) 콘솔 에러 0건 | Puppeteer |
| A4 | M1 hero `min-height: 100vh` flex center | computed |
| A5 | M1 hero-inner `max-width` ≤ 880px | computed |

### 3.3 시각 기준 (V1~V12) — Eval-Visual / GLM

| # | 기준 | 측정 |
|---|---|---|
| V1 | M1 영문 라벨: uppercase, letter-spacing 0.08em, font-size 13px, weight 700 | computed |
| V2 | M1 hero 제목: clamp(48px, 7vw, 88px), 2줄 권장 | computed |
| V3 | M1 캡션: 18px, max-width 640px | computed |
| V4 | M1 CTA pill: border-radius 9999px, height 56px, font-weight 600, font-size 16px | computed |
| V5 | M2~M7 (workspace) 카드 border-radius 12px (`--radius-card-workspace`) | computed |
| V6 | M4 헤더 layout: `flex items-end justify-between gap-4 mb-8` 정확 | DOM tree |
| V7 | M4 통계 3셀: `grid-cols-3` + 셀 사이 좌측 보더 stone-100 | DOM |
| V8 | 본문 텍스트 색 = `--color-text-body` (computed `rgb(87, 83, 78)` = stone-600) — `text-stone-*` Tailwind 클래스 0건 | grep + computed |
| V9 | 보더 색 = `--color-border` (computed `rgb(231, 229, 228)` = stone-200) | computed |
| V10 | 한글 본문 weight: 모바일(<1024px) 400, PC(≥1024px) 300 가능 (`--density-body-weight`) | computed |
| V11 | line-height: 본문 1.6 또는 1.7 (§9.C-4) — 임의값 금지 | computed |
| V12 | M3 mono(`--font-mono`) 사용 영역: 세션 코드만 — 본문 한글에 mono 0건 (§9.C-1.2) | computed |

### 3.4 인터랙션 기준 (I1~I12) — Eval-Interaction / Codex

| # | 기준 | 시나리오 |
|---|---|---|
| I1 | M1 CTA Primary 카피 = "학습 시작하기" (§9-A2.3) | text exact |
| I2 | M1 CTA Secondary 카피 = "이어 학습하기" (§9-A2.3) | text exact |
| I3 | M1 Ghost CTA 0건 (architecture는 §9-A2 학습형 — Ghost 미적용) | DOM absence |
| I4 | M1 hero 제목 톤: 결과 서술형 ("X가 Y가 됩니다" / "X가 Z합니다") — "~해주세요"/"~이면 충분해요"/"~만 있으면" 0건 | text classifier (§9.F.4) |
| I5 | M1 금지 요소 0건: 카드 그리드 / 캐러셀 / how-it-works / 후기 카드 / 통계 카드 / 보조 그리드 (§9.F.2) | DOM scan |
| I6 | 모든 mockup system message(`role="status"`/`role="alert"`/모달) 영역에 unicode emoji `[✅⚠️❌🎉🌟😀]` 0건 (§9.E v1.1) | text scan |
| I7 | M5 종료 버튼 클릭 → 커스텀 모달 (백드롭 + ESC + X 닫기) — `confirm()` 사용 0건 (BUILDER-UX §6) | code |
| I8 | M6 학생 참여: Step1 코드 → Step2 이름 분리 (단일 화면 동시 입력 0건, BUILDER-UX §3) | DOM step |
| I9 | M3 GuidePanel·ChatPanel·PreviewPanel 의미 구분 — `aria-label` 또는 `<section>` 라벨 명시 | DOM |
| I10 | 모든 텍스트 ~어요 체 통일 — "~습니다"/"~합니다" 0건 (`ui-glossary.md`) | text scan |
| I11 | M4 헤더 카피: "내 수업" + "{N}개 수업 · 진행 중 {M}개" — architecture는 "수업"이 학습 콘텐츠라 변형 가능: "내 수업" → "내 수업" 유지 + 서브텍스트 "Q&A {N}개 · 진행 중 {M}명 학생" | text |
| I12 | M2 library 인덱스: 71 Q&A 5 챕터군(컴퓨터 기초/개발/DB/네트워크/아키텍처·클라우드, SDD §14.3 P9) 카테고리 표시 | text |

---

## 4. 머지 규칙

마스터 SDD §3.4 그대로:

| Eval-V | Eval-I | 다음 |
|---|---|---|
| PASS | PASS | Master 커밋 + push + PR open. 사용자 부재 시 알림 보류, 메모리 핸드오프 기록 |
| REVISE | PASS | Generator 시각 항목만 수정 → Eval-V 재돌입 |
| PASS | REVISE | Generator 인터랙션만 수정 → Eval-I 재돌입 |
| REVISE | REVISE | Generator 통합 수정 → 양 Eval 재돌입 |
| FAIL (어느 쪽) | — | Master 중단 + 사용자 에스컬레이션 |

---

## 5. 리스크 예측 (Generator가 놓칠 수 있는 지점)

1. **Tailwind primitive class 우회 표기**: `text-stone-600` 같은 직접 클래스는 정책 §9.B-1.1 위반. Tailwind v4의 `@theme` 토큰 또는 인라인 CSS `color: var(--color-text-body)` 사용. mockup HTML은 framework 없는 단독 파일이라 인라인 CSS 또는 `<style>` 블록 사용.
2. **인라인 hex 0건 강제**: BrandMark CSS bar (네이비 #1B2A4A + 민트 #7EC8B5) 영역만 예외. 그 외 모든 색은 CSS 변수.
3. **§9.E 이모지 룰**: 학생 콘텐츠 영역(Q&A 본문 시연)은 emoji OK. system message(toast/modal)는 SVG 아이콘만. 실수로 ✅/⚠️ 토스트 만들지 않기.
4. **§9.F.4 hero 톤**: "한 시간이면 충분해요" / "한 줄로 설명해주세요" 같은 압박 톤 금지. 결과 서술형 강제. architecture는 "비전공자가 IT 전체를 30분 안에 이해" 북극성에서 "30분 안에" 같은 시간 기대 톤 금지 — "IT 전체 그림이 한눈에 보입니다" 같은 결과 서술로.
5. **mono 화이트리스트**: 카드 제목·본문 한글에 mono 사용 금지. 코드 블록·세션 코드·QR 코드·KPI 숫자만.
6. **3컬럼 모바일 분기**: M3 PC 3컬럼은 모바일에서 1컬럼 + 탭 또는 바텀시트 (BUILDER-UX-POLICY §10 허용 변형).

---

## 6. Generator 인지 사항 (4-Phase 자체 보고 의무)

> 본 mockup 시리즈는 시각 Evaluator(GLM-5.1)와 인터랙션 Evaluator(Codex) 독립 검증을 받습니다.
> 시각·인터랙션 각 축 모두 PASS여야 전체 PASS.
> 어느 한 축만 PASS면 전체 PASS 아님.
> "대체로 정합"은 PASS 아님 — 의심스러운 항목은 FAIL로 자체 보고.
> 본 PR-1은 AO 표본 검증을 겸하므로 다른 18 PR이 패턴 기준으로 본 산출을 사용. 정합도 100% 목표.

---

## 7. 센티넬 작성 규약

`qa/ao-logs/SENTINEL-SPEC.md` 참조. 예시:

```json
// step-hangyeol-pr1-gen.status
{"status":"done","step":"hangyeol-pr1","role":"gen","model":"claude-opus-4-7","session_id":"hangyeol-redesign-v1-master","ts":"2026-04-30T...Z","branch":"redesign/hangyeol-v1-mockups","commit":"pending-master","pr":"pending-master","loc":"+N -0 (mockup HTML 7 신규)","note":"7 mockup 작성 완료, self-eval 1차 차단 항목 0건"}
```

```json
// step-hangyeol-pr1-eval-visual.status (사용자 복귀 후 GLM 작성)
{"status":"done","step":"hangyeol-pr1","role":"eval-visual","model":"glm-5.1","session_id":"...","ts":"...","verdict":"PASS","fail_items":[],"revise_items":[]}
```

---

*Planner-spec 작성 완료. Generator(T2)가 다음 단계.*
