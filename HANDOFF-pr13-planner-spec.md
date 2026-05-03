# HANDOFF-pr13-planner-spec — ch02 4 데모 인라인 변환

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **브랜치**: `feat/preview-inline-ch02` (Generator 가 main 기준 분기)
> **base**: `main` (PR #29~33 머지 + 본 PR #33 정합 — `249ab94`)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §4.2 + §6 + §7)
> **상위 PR**: `HANDOFF-pr12-*` (공용 계약 잠금) — 본 PR 은 잠금된 `_shared/*` 만 사용
> **Phase 1 (Planner) 산출물.** Generator(T2) / Eval-Visual(T3) / Eval-Interaction(T4) 가 모두 이 파일을 시작점으로 참조.

---

## 0. PR 정의

- **레포**: `https://github.com/nyuoasis-cmd/architecture`
- **Step**: `pr13`
- **목표**: ch02 4 데모 (`q01~q04`) 를 React 인라인 컴포넌트로 변환 — v2.2 §4.2 라벨 매핑 + 형태 적용
- **Out of scope**: ch03~ch10 (PR-14a~21b 후속), iframe fallback 분기 제거 (PR-22 cleanup)
- **에픽 위치**: 챕터 프레임 통일 에픽 1/18 (PR-13 ~ PR-22)

---

## 1. 워크플로우 — 4-Phase 적용

| Phase | 역할 | 모델 | 터미널 | 입력 핸드오프 |
|---|---|---|---|---|
| 1 Planner | 명세·Sprint Contract·리스크 | Claude Master (이 세션) | T1 | 본 파일 |
| 2 Generator | 구현 | **Codex** | T2 | `HANDOFF-pr13-generator.md` |
| 3 Eval-Visual | 시각 검증 | **Codex** (별도 터미널) | T3 | `HANDOFF-pr13-eval-visual.md` |
| 4 Eval-Interaction | 동작·import·validator·콘텐츠 1:1 | **Codex** (별도 터미널) | T4 | `HANDOFF-pr13-eval-interaction.md` |

> 모델 배치 근거: `feedback_4phase-evaluator-codex-only.md` (2026-05-02). PR-12 ALL PASS 검증된 동일 매트릭스.

---

## 2. ch02 매핑 (v2.2 §4.2 — 잠금됨)

| qaId | 메타포 라벨 | IT 라벨 | sub | 형태 | layout | 챕터 톤 |
|---|---|---|---|---|---|---|
| ch02_q01 | 가전 / 문구 / 책 / 도구 | 운영체제 / 드라이버 / 앱 / 미들웨어 | 사용 | **C Match** | wide | `getTone(2)` |
| ch02_q02 | 자유 / 구입 / 의무 / 학생 | 오픈소스 / 상용 / GPL / 학생용 | 사용 | **C Match** | wide | `getTone(2)` |
| ch02_q03 | 블록 / 박스 / 연결 / 설치 | 모듈 / 패키지 / 의존성 / 설치 | 사용 | **A Flow** | wide | `getTone(2)` |
| ch02_q04 | 직접 / 빌리기 / 완성 / 구독 | IaaS / PaaS / SaaS / 구독 | 사용 | **D Vertical** | square | `getTone(2)` |

---

## 3. Sprint Contract 4축

### 3.1 코드 기준 (Generator 자체 보고)

| # | 기준 | 검증 방법 |
|---|---|---|
| C1 | `client/src/demos/ch02/Q01Software.tsx` `Q02License.tsx` `Q03Module.tsx` `Q04Cloud.tsx` 4 파일 존재 | `ls client/src/demos/ch02/*.tsx \| wc -l` = 4 |
| C2 | `client/src/demos/registry.ts` 에 `ch02_q01~q04` 4 항목 추가 (layout 정확) | grep `ch02_q01.*Q01Software.*'wide'` 등 4 라인 |
| C3 | 모든 ch02 컴포넌트가 `_shared/index.ts` 만 import. `from '../types'`, `from '../_shared/[^i]'` 등 0건 | `grep -E "from ['\"]\.\.?/_shared/[^i]" client/src/demos/ch02/*.tsx` = 0 |
| C4 | 라벨 텍스트가 v2.2 §4.2 ch02 표와 **정확 일치** (대소문자·공백·괄호 포함) | `grep -E "(가전\|문구\|책\|도구\|운영체제\|드라이버\|앱\|미들웨어)" client/src/demos/ch02/Q01Software.tsx` 8건 모두 매칭 |
| C5 | 형태 매핑 정확: q01=`PairMatch`, q02=`PairMatch`, q03=`PairFlow`, q04=`PairVertical` | grep import 문 |
| C6 | 모든 ch02 컴포넌트가 `getTone(2)` 사용 (cyan-600). 다른 톤 0건 | `grep "getTone(2)" client/src/demos/ch02/*.tsx` = 4건 / `getTone([^2])` = 0 |
| C7 | 신규 SVG 아이콘 `_shared/icons/{computer,metaphor}.tsx` 등 적절 분류 (메타포는 metaphor.tsx, IT는 computer.tsx 또는 cloud.tsx) | grep export 신규 추가 분 |
| C8 | **🚨 client/src/demos/\*\*/\*.{ts,tsx} raw hex 0건** | `grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos --include="*.tsx" --include="*.ts"` = 0 (design-tokens.css 외) |
| C9 | `validatePairSet` 호출 → throw 0건 (라벨 길이·sub 일관 정합) | 컴포넌트 mount 시 throw 0 |
| C10 | `npm run build` (client + server) PASS | exit 0 |
| C11 | TypeScript strict 통과 | `tsc -b` 에러 0건 |
| C12 | 시나리오 = 각 데모 4개 (활성 인덱스 0,1,2,3 슬라이딩) | grep `SCENES:` 모든 데모 4 키 |

### 3.2 시각 기준 (Eval-Visual 검증)

`HANDOFF-pr13-eval-visual.md` 참조. 핵심:
- v2.2 §6.2 시각 체크리스트 9항 모두 통과
- ch02 4 데모 × 2 viewport (1440·393) = 8 스크린샷 비교
- PR-12 baseline (ch01 4 데모) 톤·간격·SVG 굵기 일관성

### 3.3 인터랙션·구조 기준 (Eval-Interaction 검증)

`HANDOFF-pr13-eval-interaction.md` 참조. 핵심:
- 시나리오 칩 클릭 → 메타포 셀 + IT 셀 동시 활성화
- ch02 라벨 텍스트가 v2.2 §4.2 와 1:1 일치 (콘텐츠 검증)
- raw hex 0건 / `_shared/index.ts` 외 import 0건 / validateLabel 0 throws

### 3.4 정책 정합 (자체 검증)

- DESIGN-POLICY §9.B-3 — `client/src/demos/_shared/design-tokens.css` 만 hex 거주지. ch02 컴포넌트는 `var(--demo-...)` 만 사용
- LABEL_RULES — 라벨 ≤8자, sub ≤12자

---

## 4. 산출물 트리

```
client/src/demos/
├── ch02/                        (NEW)
│   ├── Q01Software.tsx          (NEW — PairMatch wide, getTone(2))
│   ├── Q02License.tsx           (NEW — PairMatch wide, getTone(2))
│   ├── Q03Module.tsx            (NEW — PairFlow wide, getTone(2))
│   └── Q04Cloud.tsx             (NEW — PairVertical square, getTone(2))
├── _shared/icons/
│   ├── metaphor.tsx             (UPDATE — 가전/문구/책/도구/자유/구입/의무/학생/블록/박스/연결/설치/직접/빌리기/완성/구독 등 신규 ~10)
│   └── computer.tsx 또는 cloud.tsx (UPDATE — 운영체제/드라이버/앱/미들웨어/오픈소스/상용/GPL/학생용/모듈/패키지/의존성/IaaS/PaaS/SaaS 등 신규 ~10)
└── registry.ts                  (UPDATE — ch02_q01~q04 4 항목 추가)
```

신규 SVG 추정: ~10개 (메타포 + IT 분담).

---

## 5. 위험 및 회피책

| 위험 | 회피책 |
|---|---|
| **R1**: ch01 패턴과 시각 일관성 깨짐 (간격·padding·font-size 차이) | Q01Ramen.tsx 패턴 그대로 복붙 후 데이터·아이콘만 교체. 절대 _shared 호출 외 inline style 추가 X |
| **R2**: 라벨 텍스트 misspelling (v2.2 §4.2 와 어긋남) | Generator 가 데이터 선언 직후 v2.2 §4.2 표를 핸드오프에 그대로 복사 + 한 글자씩 검증 |
| **R3**: 형태 매핑 잘못 (q03 을 Match 로 잘못 적용 등) | C5 grep + Sprint Contract 검증으로 강제 |
| **R4**: validatePairSet throw (sub 일관 위반) | 모든 데모는 sub `'사용'` 로 통일 (v2.2 §4.2 명시). subPolicy='all' 검증 통과 |

---

## 6. 센티넬 + 진행 보고

| Role | 센티넬 파일 (절대 경로) | 트리거 |
|---|---|---|
| Generator | `/home/claude/architecture/qa/ao-logs/pr13-r1-gen.status` | Codex T2 가 작업 완료 후 status JSON 작성 |
| Eval-Visual | `/home/claude/architecture/qa/ao-logs/pr13-r1-eval-visual.status` | Codex T3 가 검증 완료 후 verdict 작성 |
| Eval-Interaction | `/home/claude/architecture/qa/ao-logs/pr13-r1-eval-interaction.status` | Codex T4 가 검증 완료 후 verdict 작성 |

> **AO 사각지대 #10 회피**: 센티넬 경로는 항상 절대 경로 명시 (worktree 종속 X).

센티넬 JSON 스키마: `qa/ao-logs/SENTINEL-SPEC.md` 참조.

---

## 7. PR 정책

- Generator 는 별도 브랜치 (`codex/pr13-ch02`) 에 push + 본 핸드오프 변경 사항만. Master 가 결과 확인 후 cherry-pick → `feat/preview-inline-ch02` 갱신 → main 에 PR open
- 또는 Generator 가 `feat/preview-inline-ch02` 직접 push (Master 사전 승인 시) — `feedback_ao-codex-pr-rule-conflict.md` 패턴

---

## 8. 다음 STEP (PR-13 머지 후)

PR-14a (ch03 q01~q04 4 데모). HANDOFF-pr14a-* 가 본 PR 검증된 ch02 패턴을 그대로 따름. v2.2 §5.3 "PR-13 1개만 풀 4-Phase, 안정 확인 후 PR-14 부터 압축 self-QA 가능" 정책 적용 검토.
