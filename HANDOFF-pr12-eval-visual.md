# HANDOFF-pr12-eval-visual — Codex T3 Eval-Visual

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **검증 대상 브랜치**: `feat/preview-inline-shared-contract`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §6.2)
> **상위 핸드오프**: `HANDOFF-pr12-planner-spec.md` (§2.2)
> **Generator 산출물**: `HANDOFF-pr12-generator.md` 의 STEP 1~12

---

## 0. 역할 한계

- **코드 수정 금지**. 시각 검증만.
- 검증 결과는 `qa/ao-logs/pr12-r1-eval-visual.status` JSON 으로 보고.
- verdict: `PASS` / `REVISE` (Generator 가 고칠 항목) / `FAIL` (설계 자체 결함)

---

## 1. 작업 시작 전 환경 정리

```bash
cd /home/claude/architecture
git fetch origin
git checkout feat/preview-inline-shared-contract
git pull --ff-only

# 빌드 + dev 서버 (이미 5176 떠 있으면 재사용 가능)
cd client && npm run build && cd ..
npm run dev   # client :5176 + server :3003
```

---

## 2. 검증 viewport · 경로

### viewport
- **데스크탑**: 1440 × 900 (Chrome DevTools Responsive)
- **모바일**: 393 × 852 (iPhone 15 Pro 시뮬)

### 경로

```
http://localhost:5176/library/1/ch01_q01    ← 라면 (오렌지)
http://localhost:5176/library/1/ch01_q02    ← 무대-대본 (시안 or 블루)
http://localhost:5176/library/1/ch01_q03    ← 식당 (틸)
http://localhost:5176/library/1/ch01_q04    ← 도서관 (퍼플)
http://localhost:5176/library/2/ch02_q01    ← fallback (iframe + phone-frame 보존 확인)
http://localhost:5176/demos-preview/showcase  ← 4 변형 (PR-12 신규)
```

---

## 3. 시각 체크리스트 (PASS/REVISE/FAIL 항목별 판정)

### V1 ch01 4 데모 시각 동등성 (vs PR #28 baseline)

PR #28 머지 직전 ch01 4 데모 외관과 PR-12 후 외관이 동등해야 함. 토큰화 후 픽셀 1~2px 미세 차 허용. **메타포·IT 셀의 색상·테두리·그림자가 변하면 REVISE**.

| 데모 | 활성 시나리오 | PR #28 | PR-12 결과 | verdict |
|---|---|---|---|---|
| ch01_q01 | input | 오렌지 accent | (캡처) | |
| ch01_q01 | memory | 오렌지 accent | (캡처) | |
| ch01_q02 | stage | 네이비/블루 accent | (캡처) | |
| ch01_q03 | seats | 틸 accent | (캡처) | |
| ch01_q04 | storage | 퍼플 accent | (캡처) | |

> ⚠️ baseline 8 PNG 가 `qa/preview-baseline/` 에 아직 없으면 (사용자 캡처 단계 미완료) "관찰 캡처 + PR #28 머지 시점 main 브랜치 캡처" 로 비교. 또는 git checkout `d39599d` 후 동일 viewport 로 재캡처.

### V2 메타포 ↔ IT 동시 활성화 (시나리오 칩 클릭)

- [ ] ch01_q01 시나리오 칩 4개 모두 클릭 → 메타포 행과 IT 행의 같은 인덱스가 **둘 다** accent 색으로 변함
- [ ] 한쪽만 변하면 FAIL
- [ ] ch01_q02 stage/script 칩 클릭 → 무대 영역 + 하드웨어 영역 (또는 대본 + 소프트웨어) 동시 활성화
- [ ] ch01_q03 4 칩, ch01_q04 5 칩 동일 패턴

### V3 활성·비활성 대비 + accent WCAG AA

- [ ] 활성 셀 border = chapter accent (예: `var(--demo-accent-ch01)` = #ea580c)
- [ ] 활성 셀 배경 = chapter accentSoft (예: #fff7ed)
- [ ] 비활성 셀 border = `var(--color-border)`, 배경 = `var(--demo-card-bg)` (#fff)
- [ ] 활성 라벨 텍스트 (accent 색) ↔ accentSoft 배경 **대비비 ≥ 4.5:1** (WCAG AA)
  - Chrome DevTools → Inspect 활성 셀 텍스트 → Computed → Contrast checker spot-check (1 데모 1 셀)
  - 예: `#ea580c` vs `#fff7ed` 대비비 약 5.5:1 → PASS

### V4 너비 정합 (1440 viewport)

- [ ] q01 (wide): 메타포 행·IT 행 max-width 860px, 좌우 여백 균등
- [ ] q02 (square): max-width 640px
- [ ] q04 (square): max-width 640px (PR #28 에서 tall 이었으나 v2.1 에서 square 로 변경 — registry.ts 확인)

### V5 모바일 줄바꿈 (393 viewport)

- [ ] **🚨 한글 라벨이 1~2줄로 자연 줄바꿈** (3줄 이상 = FAIL — preflight WARN W4)
- [ ] `word-break: keep-all` 적용 확인 (DevTools Computed)
- [ ] q01 4-col → 2-col 자동 stack
- [ ] q02 2-col → 1-col 자동 stack
- [ ] q04 2-col 5행 → 좁은 화면에서 column 보존하면서 cell 너비 균등 줄어듦 (또는 1-col stack)
- [ ] SVG 아이콘 크기 (40×40 viewBox) 가 모바일에서 고정 — 라벨에 가려지지 않음

### V6 Showcase 라우트 (`/demos-preview/showcase`)

- [ ] 200 응답
- [ ] PairFlow 더미 렌더 + 활성 인덱스 토글 동작
- [ ] PairBinary 더미 렌더 + 좌·우 활성 토글
- [ ] PairMatch 더미 렌더 + 활성 토글
- [ ] PairVertical 더미 렌더 + 활성 인덱스 토글
- [ ] 4 변형 한 페이지에 모두 보임 (스크롤로 확인)

### V7 fallback 보존 (PR #28 기능 회귀 0건)

- [ ] `/library/2/ch02_q01`: 폰 프레임 + iframe + 노치 그대로 (PR-22 cleanup 전까지 fallback 유지)
- [ ] 시나리오 점(dot) 그대로 (chip 으로 안 바뀌었어야 함 — fallback 영역)
- [ ] `<teachermate-nav>` 헤더 정상

### V8 Hero 그라디언트 + 챕터 톤 일관

- [ ] 각 ch01 데모 hero 영역 그라디언트 시각 PR #28 와 동등
- [ ] q01 = 오렌지 그라디언트 (linear-gradient(135deg, #fff7ed, #ffedd5 58%, #ffffff))
- [ ] q02/q03/q04 도 chapter 톤 그라디언트 보존

---

## 4. WARN 단계 (REVISE 권고)

다음 발견 시 verdict=REVISE + revise_items 에 ID 기록:
- 활성·비활성 차이가 미세해 한 눈에 인식 어려움 (border 두께 ≥2px 또는 box-shadow 강화 권고)
- 모바일에서 hero summary 가 4줄 이상 (line-height 또는 font-size 조정)
- showcase 4 변형 spacing 불균형

## 5. FAIL 단계

다음 발견 시 verdict=FAIL + fail_items:
- ch01 시나리오 칩 클릭 시 한쪽 행만 활성화 (V2)
- raw hex 가 시각으로 노출 (V3 accent 가 챕터 토큰과 다른 hex)
- 모바일 393px 에서 hero 또는 라벨 overflow (V5)
- showcase 라우트 404 또는 변형 누락 (V6)
- ch02_q01 fallback 깨짐 (V7)

---

## 6. 센티넬 JSON

검증 완료 시 `qa/ao-logs/pr12-r1-eval-visual.status` 작성:

```json
{
  "status": "done",
  "step": "pr12",
  "role": "eval-visual",
  "model": "codex",
  "session_id": "arch-XX",
  "ts": "2026-05-02TXX:XX:XXZ",
  "verdict": "PASS",
  "fail_items": [],
  "revise_items": []
}
```

---

## 7. 보고 형식 (REVISE/FAIL 시)

각 fail_items / revise_items 는 명확한 ID + 1-2줄 설명:

```
"fail_items": [
  "V2-ch01_q01: 시나리오 'memory' 클릭 시 IT 행 메모리 셀이 활성화 안 됨 — 메타포 행만 변함",
  "V5-ch01_q04: 모바일 393px 에서 '다시 꽂기' 라벨이 3줄로 줄바꿈 (8자 > LABEL_RULES.maxLabelLength)"
]
```

ID 는 본 핸드오프의 V1~V8 + 데모 ID + 시나리오 ID 조합. Generator 가 즉시 위치 파악할 수 있도록.
