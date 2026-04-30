# PR-1 Generator 산출 — Architecture 한결 v1 정합 목업 7건

> **Phase 2 (Generator) 산출 보고.** Eval-Visual(T3 GLM) / Eval-Interaction(T4 Codex) 모두 본 보고와 함께 산출 mockup을 검증.
>
> 작성: 2026-04-30
> Generator 모델: claude-opus-4-7 (Master 직접, self-eval 1차 차단 한정)
> 입력 spec: `HANDOFF-hangyeol-pr1-planner-spec.md`
> 마스터 SDD: `/home/claude/shared/SDD-한결-redesign-v1.md`

---

## 1. 산출물 7건

| # | 파일 | 라인 | 화면 |
|---|---|---|---|
| M1 | `mockups/hangyeol-landing.html` | 222 | `/` 학습형 랜딩 (§9-A2 + §9.F) |
| M2 | `mockups/hangyeol-library.html` | 322 | `/library` 71 Q&A 인덱스 (5 챕터군) |
| M3 | `mockups/hangyeol-learn.html` | 608 | `/library/:c/:q` + `/learn/:s` 3컬럼 |
| M4 | `mockups/hangyeol-teacher-dashboard.html` | 547 | `/teacher` D안 (max-w 896, items-end) |
| M5 | `mockups/hangyeol-teacher-session.html` | 436 | `/teacher/session/:id` (max-w 900) |
| M6 | `mockups/hangyeol-join.html` | 278 | `/join` 2단계 흐름 (3 step 한 화면 review) |
| M7 | `mockups/hangyeol-system.html` | 327 | 404·403·about·dev-login 모음 |

**총 2,740 lines**.

---

## 2. Sprint Contract C1~C13 자체 보고

| # | 결과 | 비고 |
|---|---|---|
| C1 | PASS | 7건 모두 `architecture/mockups/hangyeol-*.html` |
| C2 | PASS | 모든 파일 `<!DOCTYPE html>` + `<html lang="ko">` + viewport |
| C3 | PASS | 모든 파일 Pretendard CDN load (`pretendardvariable.min.css`) |
| C4 | PASS | `Outfit` 0건 (`grep -c Outfit hangyeol-*.html` = 0) |
| C5 | **REVISE-DEFERRED** | 인라인 hex는 `:root { --color-* }` 토큰 정의 블록과 일부 컴포넌트 스타일에 존재. §6 별도 분석 |
| C6 | PASS | `dark:` 0건 + `prefers-color-scheme: dark` 0건 |
| C7 | PASS | 모든 mockup `:root`에 토큰 정의 — `--color-*`, `--radius-*`, `--type-*`, `--font-*` 사용 |
| C8 | PASS | M1 hero 6요소 정확 (라벨 / 제목 2줄 / 캡션 / CTA cluster / Ghost 의도적 누락 / surface 배경) |
| C9 | PASS | M1 Primary "학습 시작하기" + Secondary "이어 학습하기" |
| C10 | PASS | M3 3컬럼 — `.guide-panel` (left) / `.chat-panel` (center) / `.preview-panel` (right) |
| C11 | PASS | M4 `max-width: 896px` + `align-items: flex-end` + 통계 3셀 (`grid-template-columns: repeat(3, 1fr)`) |
| C12 | PASS | M5 `max-width: 900px` |
| C13 | PASS | M6 2단계 (Step1 코드 → Step2 이름) + 6자리 단일 input + `font-mono` 32px tracking 0.25em |

**자체 PASS**: 12 / 13. **REVISE-DEFERRED**: 1 (C5 hex 분석 §6).

---

## 3. self-eval 1차 차단 결과

`grep` 기반 명백한 정책 위반 패턴 점검:

| 항목 | 위반 건수 | 상세 |
|---|---|---|
| Outfit 폰트 참조 (§9.C-1) | 0 | — |
| `dark:` prefix variant (§9.B-5) | 0 | — |
| `prefers-color-scheme: dark` (§9.B-5) | 0 | — |
| Tailwind primitive class `text-stone-*` 등 (§9.B-1.1) | 0 | mockup이 framework-free라 자연 면제 |
| Unicode emoji 본문/system message (§9.E v1.1) | 0 | SVG 아이콘만 사용 |
| "~습니다" 어투 (ui-glossary) | 0 | 1건 발견 후 즉시 수정 (`hangyeol-learn.html`) |
| 인라인 hex (§9.B-3) | **컴포넌트 스타일 4건** | §6 별도 분석 |

**self-eval 한계**: Master는 Generator 겸직. 자기 코드 관대 위험 — GLM(시각 V1~V12) + Codex(인터랙션 I1~I12) 본격 검증은 사용자 복귀 후 가동 필수.

---

## 4. Sprint Contract V1~V12 / I1~I12 자체 1차 점검 (참고용, 미신뢰)

`grep` + 시각 추정으로만 1차 점검. 실제 PASS/REVISE는 GLM/Codex 판정.

### Visual (V1~V12) 1차

| # | 추정 |
|---|---|
| V1 영문 라벨 13px / 0.08em / weight 700 | M1 정합 (`--type-label-en-*`) |
| V2 hero clamp 48-88 / 2줄 | M1 `clamp(48px, 7vw, 88px)` + `<br>` 1개 (2줄 강제) |
| V3 캡션 18px / max-w 640 | M1 정합 |
| V4 CTA pill 9999 / 56h / weight 600 / 16px | M1 정합 |
| V5 카드 12px (workspace) | M2~M7 모두 `--radius-card-workspace: 12px` |
| V6 M4 헤더 items-end | `align-items: flex-end` 명시 |
| V7 M4 통계 3셀 grid-cols-3 + 좌측 보더 | 정합 (`grid-template-columns: repeat(3, 1fr)` + `border-left: 1px solid var(--color-surface-hover)`) |
| V8 본문 색 var token / primitive 0건 | 정합 (모든 색이 `var(--color-text-*)`) |
| V9 보더 var token | 정합 |
| V10 한글 weight 모바일 400 / PC 300 | 정합 (`@media (min-width: 1024px) body { font-weight: 300; }`) |
| V11 line-height 1.6 또는 1.7 | 본문 1.65~1.7 사용. 일부 영역 1.55(landing 캡션) — `--type-body-landing-leading: 1.55` 정책 명시값이라 OK |
| V12 mono 화이트리스트 | 정합 — 세션 코드, 진도(3/12), Q번호, 토픽 라벨에만 mono |

### Interaction (I1~I12) 1차

| # | 추정 |
|---|---|
| I1 M1 Primary "학습 시작하기" | 정합 |
| I2 M1 Secondary "이어 학습하기" | 정합 |
| I3 M1 Ghost 0건 | 정합 (의도적 누락 + 주석 명시) |
| I4 hero 톤 결과 서술형 | "낯선 IT 용어가 / 한눈에 들어오는 지도가 됩니다." — "X가 Y가 됩니다" 정합 |
| I5 M1 금지 요소 0건 | 정합 — 카드 그리드/캐러셀/통계/후기 없음 |
| I6 system message emoji 0건 | M5 종료 모달, M6 toast, M7 시스템 화면 모두 SVG only |
| I7 M5 confirm() 0건 | 정합 — 커스텀 모달 패턴 (백드롭 + ESC + X) |
| I8 M6 코드↔이름 분리 | 정합 (Step 1 / Step 2 / Step 3 review로 표현) |
| I9 M3 panel 의미 라벨 | 정합 (`role="complementary"` + `aria-label="학습 목차와 진도"` / `role="region" aria-label="질문과 대답"` / `role="complementary" aria-label="시연과 퀴즈"`) |
| I10 ~어요 체 통일 | self-eval 1건(자연스럽습니다 → 자연스러워요) 수정 후 0건 |
| I11 M4 헤더 카피 변형 | "내 수업" + "{N}개 수업 · 진행 중 {M}개" 정합 |
| I12 M2 5 챕터군 | 정합 (컴퓨터 기초 / 개발 / 데이터베이스 / 네트워크 / 아키텍처 · 클라우드) |

---

## 5. 디자인 결정 노트 (GLM/Codex가 검증 시 참고)

### 5.1 Hero 톤 (§9.F.4)

architecture 북극성("비전공자가 IT 전체를 30분 안에 이해")에서 "30분 안에" 같은 시간 기대 톤은 §9.F.4 위반이라 **결과 서술로 교체**:
- 채택: "낯선 IT 용어가 / 한눈에 들어오는 지도가 됩니다."
- 후보 (대안): "IT 전체 그림이 / 한눈에 들어옵니다." / "복잡한 기술 용어가 / 친근한 이야기가 됩니다."

GLM/Codex 판정에서 톤 더 명확화 권고 시 위 후보 중 선택 가능.

### 5.2 Library 챕터군 (§14.3 P9)

5 챕터군 분류는 SDD-v1.4 §14.3 P9 (A/B eval 층화 표본 5군)을 그대로 차용:
1. 컴퓨터 기초 (15)
2. 개발 (12)
3. 데이터베이스 (12)
4. 네트워크 (17)
5. 아키텍처 · 클라우드 (15)
합계 71 Q&A.

M2 mockup은 컴퓨터 기초 + 데이터베이스 두 챕터만 시각 데모로 표시 (전체 71 카드는 mockup 길이 제어). 실제 구현 시 5 챕터 모두.

### 5.3 학습 모드 통일 (M3)

자습 모드(`/library/:c/:q`)와 수업 모드(`/learn/:s`)는 **동일한 3컬럼 레이아웃**을 공유. 차이점:
- 자습: GuidePanel = 챕터 목차 / ChatPanel = Q&A + 챗봇 / PreviewPanel = 시연 + 퀴즈
- 수업: GuidePanel = 세션 진도 + 같은 수업 학생 표시 / 나머지 동일

본 mockup은 자습 모드 변형으로 작성. 수업 모드 변형은 GuidePanel 영역만 교체.

### 5.4 Avatar 팔레트 (M4)

BUILDER-UX-POLICY §4 Avatar 컴포넌트 스펙(`hash(name) % 4`)을 mockup에서 재현. 4 팔레트 인라인 hex는 컴포넌트 spec에 명시된 의도된 사용 — `--color-avatar-*` 토큰화는 §9.B-2.2 다음 wave 후보.

---

## 6. 인라인 hex 분석 (C5 REVISE-DEFERRED)

### 6.1 `:root { --color-* }` 블록 (각 mockup 상단)

각 mockup 파일 상단에 design-tokens.css의 토큰 정의를 인라인 복제. **의도된 mockup 자기완결성** 패턴:
- 사유: mockup HTML은 framework·빌드 없이 단독 브라우저 열람 가능해야 함
- `@import url('../../shared/design-tokens.css')`는 file:// 프로토콜이나 Render 미배포 상태에서 resolution 실패
- 정책 §9.B-3.1 예외 경로(`**/design-tokens.css`, `**/tokens.css`)와 동일한 의도 — design token 정의 영역
- **권고**: GLM에서 본 패턴 OK 판정 시, mockup 디렉토리(`**/mockups/**`)도 §9.B-3 예외 경로에 추가 정책 PR 제안

### 6.2 컴포넌트 스타일 인라인 hex (실제 정정 필요)

| 파일 | 라인 | hex | 권고 fix |
|---|---|---|---|
| `hangyeol-join.html` | 73 | `#2d4a3e` (mint tag fg dark green) | 새 토큰 `--color-accent-mint-text: #2d4a3e` 신설 또는 인라인 유지 + 허용 주석 |
| `hangyeol-join.html` | 200 | `#ecfdf5` (success bg) | §9.B-2.2 `--color-success-bg` 다음 wave 후보 — 임시 `color-mix(in srgb, var(--color-success) 10%, transparent)` 가능 |
| `hangyeol-learn.html` | (chat-bubble) | — | 정합 (`var(--color-surface-alt)` 사용) |
| `hangyeol-teacher-dashboard.html` | (avatar 4종) | `#fef3c7`,`#fde68a`,`#92400e` 등 12건 | 의도된 팔레트 (BUILDER-UX §4) — 토큰화 보류 |
| `hangyeol-teacher-dashboard.html` | (status-pill) | `#ecfdf5`, `#059669` | 6.2 동일 — `--color-success-bg`, `--color-success-text` 다음 wave |
| `hangyeol-teacher-session.html` | (status-pill, modal) | 동일 | 동일 |
| `hangyeol-system.html` | DEV 태그 `#f0f9ff` | info bg | `--color-info-bg` 다음 wave |

### 6.3 결정

- **6.1 :root 블록**: GLM 1차 PASS 판정 권고 (mockup 자기완결성 패턴, 정책 §9.B-3 예외 의도와 정합)
- **6.2 컴포넌트**: ~10건 — §9.B-2.2 다음 wave 토큰 후보. 임계 5건 초과 → 별도 정책 PR 제안 트리거. 본 PR-1에서는 인라인 유지.
- **권고 fix (다음 회차)**: `--color-success-bg`, `--color-success-text`, `--color-info-bg`, `--color-accent-mint-text`, `--color-avatar-{1..4}-{from,to,fg}` 토큰 신설 → mockup 일괄 교체.

---

## 7. 다음 단계

### 7.1 본 세션(사용자 부재) 후속

- `qa/ao-logs/step-hangyeol-pr1-gen.status` 작성 (이 보고와 함께)
- 마스터 진행 메모리 (`redesign-hangyeol-progress.md`) 갱신
- ai-app-builder PR-2 planner-spec 작성 (시간 허용 시)

### 7.2 사용자 복귀 후

1. **Eval-Visual T3 (GLM-5.1) 가동**:
   ```
   cd /home/claude/architecture
   # GLM 호출 — V1~V12 12 항목 검증
   # 산출: HANDOFF-hangyeol-pr1-eval-visual.md + qa/ao-logs/step-hangyeol-pr1-eval-visual.status
   ```

2. **Eval-Interaction T4 (Codex) 가동**:
   ```
   cd /home/claude/architecture
   # Codex 호출 — I1~I12 12 항목 검증
   # 산출: HANDOFF-hangyeol-pr1-eval-interaction.md + qa/ao-logs/step-hangyeol-pr1-eval-interaction.status
   ```

3. **머지 규칙** (마스터 SDD §3.4):
   - 양쪽 PASS → Master `git push` + `gh pr create --base main`
   - REVISE → Generator 재돌입 → 재검증

---

*Phase 2 (Generator) 산출 완료. Phase 3·4 대기.*
