# HANDOFF-pr12-eval-interaction — Codex T4 Eval-Interaction

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **검증 대상 브랜치**: `feat/preview-inline-shared-contract`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §6.1 + §6.3)
> **상위 핸드오프**: `HANDOFF-pr12-planner-spec.md` (§2.3)
> **Generator 산출물**: `HANDOFF-pr12-generator.md` 의 STEP 1~12

---

## 0. 역할 한계

- **코드 수정 금지**. 정적 검증 + 동작 확인만.
- 검증 결과는 `qa/ao-logs/pr12-r1-eval-interaction.status` JSON 으로 보고.
- verdict: `PASS` / `REVISE` / `FAIL`

---

## 1. 작업 시작 전 환경 정리

```bash
cd /home/claude/architecture
git fetch origin
git checkout feat/preview-inline-shared-contract
git pull --ff-only

# 빌드 검증 (이미 Generator 가 통과시킨 상태여야 함)
cd client && npm run build
cd ../server && npm run build
```

---

## 2. 검증 항목 (PASS/REVISE/FAIL 판정)

### I1 Sprint Contract 자동 검증 — Generator 보고 재현

```bash
cd /home/claude/architecture

# C1: design-tokens.css 변수 ≥50개
grep -c "^\s*--demo" client/src/demos/_shared/design-tokens.css
# 기대: ≥ 50

# C2: index.ts re-export ≥7개
grep -E "^export" client/src/demos/_shared/index.ts | wc -l
# 기대: ≥ 7

# C3: pair-block 4 변형 export
grep -E "export function (PairFlow|PairBinary|PairMatch|PairVertical)" client/src/demos/_shared/pair-block.tsx | wc -l
# 기대: 4

# C4: getTone + Tone export
grep -E "export (function getTone|type Tone)" client/src/demos/_shared/tone.ts | wc -l
# 기대: ≥ 2

# C5: validateLabel + validatePairSet throw
grep -c "throw new Error" client/src/demos/_shared/labels.ts
# 기대: ≥ 4 (각 함수에 여러 throw)

# C6: icons/ 5 파일
ls client/src/demos/_shared/icons/*.tsx | wc -l
# 기대: 5 (또는 4 + _base.tsx)

# C7: showcase 라우트
grep -n 'Route path="/demos-preview/showcase"' client/src/App.tsx
# 기대: 1 매치, line < 49 (catch-all 위)

# C8: ch01 import 경로 강제 (_shared/index.ts 외 0건)
grep -E "from ['\"]\.\.?/_shared/[^'\"]" client/src/demos/ch01/*.tsx
# 기대: 빈 결과 (또는 from '../_shared' 만 매치)

# C9: 🚨 raw hex 0건
grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos --include="*.tsx" --include="*.ts"
# 기대: 빈 결과

# C10: README.md 존재 + DO/DON'T
test -f client/src/demos/_shared/README.md && grep -E "^## (Public API|DO/DON'T)" client/src/demos/_shared/README.md | wc -l
# 기대: ≥ 2

# C11/C12: 빌드
(cd client && npm run build) && (cd server && npm run build)
# 기대: exit 0

# C13: baseline 안내 파일
test -f qa/preview-baseline/CAPTURE-INSTRUCTIONS.md
# 기대: exit 0
```

각 항목 → PASS / FAIL 판정. 하나라도 FAIL 이면 verdict=FAIL.

### I2 시나리오 칩 동시 활성화 — 코드 검증

ch01 4 데모가 active prop 을 메타포·IT 양쪽 셀에 같은 인덱스로 전달하는지 정적 grep:

```bash
# Q01Ramen.tsx 에서 PairFlow 또는 동등한 컴포넌트가 activeIndex 단일 변수로 양쪽 행 전달하는지
grep -A 3 "PairFlow" client/src/demos/ch01/Q01Ramen.tsx | head -10
# 기대: activeIndex={scene.active} 가 한 번만 전달, 양쪽 행 (metaphor/it) 이 같은 prop 사용
```

PairFlow 구현 자체에서 양쪽 행이 같은 activeIndex 를 받는지:

```bash
grep -n "activeIndex === idx" client/src/demos/_shared/pair-block.tsx | wc -l
# 기대: ≥ 2 (메타포 매핑 + IT 매핑 양쪽에서 사용)
```

### I3 validateLabel 동작 확인 (단위 테스트 수준)

다음 케이스가 throw 하는지 임시 스크립트 또는 런타임 console 로 확인. 또는 Showcase 페이지에 의도적 위반 데이터를 일시 삽입 후 빌드/런타임 에러 확인:

```ts
import { validateLabel, validatePairSet } from './client/src/demos/_shared/labels';

// 1. 8자 초과
try { validateLabel('가전제품운영체제', 'label'); } catch (e) { /* expected */ }

// 2. emoji
try { validateLabel('재료🍜', 'label'); } catch (e) { /* expected */ }

// 3. 영어 raw 약자 단독
try { validateLabel('OS', 'label'); } catch (e) { /* expected */ }

// 4. ~합니다
try { validateLabel('확인합니다', 'label'); } catch (e) { /* expected */ }

// 5. validatePairSet — sub 일관 위반
try {
  validatePairSet(
    [{ label: 'A' }, { label: 'B' }],
    [{ label: 'C', sub: 'foo' }, { label: 'D' }],
    { layout: 'wide', subPolicy: 'all' }
  );
} catch (e) { /* expected */ }

// 6. validatePairSet — 길이 불일치
try {
  validatePairSet(
    [{ label: 'A' }],
    [{ label: 'B' }, { label: 'C' }],
    { layout: 'wide', subPolicy: 'none' }
  );
} catch (e) { /* expected */ }
```

방법: 임시 `client/src/demos/_shared/labels.test-manual.ts` 작성 → `tsx labels.test-manual.ts` 실행 → 6개 모두 throw 확인. 검증 후 파일 삭제 (커밋 X).

또는 정적 grep 으로 throw 분기 확인:

```bash
grep -B 1 "throw new Error" client/src/demos/_shared/labels.ts | head -30
# 기대: 글자수 / forbiddenPatterns / 길이 불일치 / layout 한도 / subPolicy 위반 / nested validateLabel 호출 — 5+ throw 분기
```

### I4 fallback 보존 (PR #28 회귀 0건)

```bash
# PreviewPanel.tsx 가 registry 기반 분기 유지하는지
grep -n "DEMO_REGISTRY\|getDemoComponent\|inlineMeta" client/src/components/learn/PreviewPanel.tsx
# 기대: 분기 코드 보존
```

런타임 확인:
```
http://localhost:5176/library/2/ch02_q01
```
브라우저 또는 curl 으로:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5176/library/2/ch02_q01
# 기대: 200
```

DOM 검증 (Codex 가 가능한 범위에서):
- 폰 프레임 클래스 `phone-frame` 존재
- iframe `src="/demos/ch02/q01.html#..."` 존재
- 시나리오 점 `preview-scenario-dot` 존재 (chip 아닌)

### I5 import 경로 강제

```bash
# ch01 컴포넌트가 _shared/index.ts 외 직접 경로 import 0건
grep -rE "from ['\"]\.\.?/_shared/(pair-block|card|chrome|tone|labels|icons)" client/src/demos/ch01/
# 기대: 빈 결과

# 또한 외부 (다른 챕터) 가 _shared 내부 직접 import 안 하는지 (현재는 ch01만 있으니 빈 결과)
grep -rE "from ['\"]@/demos/_shared/[^i]" client/src/
# 기대: 빈 결과
```

### I6 라우트 충돌 + 등록 확인

```bash
# /demos-preview/showcase 가 catch-all (*) 위에 등록됐는지
grep -nB 2 -A 2 "demos-preview/showcase\|path=\"\*\"" client/src/App.tsx
```

기대 결과:
```
... <Route path="/demos-preview/showcase" element={<ShowcasePage />} />
... <Route path="*" element={<NotFoundPage />} />
```

순서 반대면 FAIL — `*` 가 먼저 매치돼 showcase 가 NotFound 로 가게 됨.

### I7 디스크립션 정합 (SDD § 표 일치)

```bash
# ch01 컴포넌트의 메타포·IT 라벨이 SDD §4 ch01 표와 일치
grep -E "label: ['\"]" client/src/demos/ch01/Q01Ramen.tsx | head -10
# 기대: 메타포 = 재료/냄비/불/그릇, IT = 입력/메모리/처리/출력 (또는 SDD 표 라벨)
```

라벨 텍스트가 SDD 표와 다르면 REVISE.

### I8 SDD-preview-inline-v2 §6.3 콘텐츠 1:1 검증

각 ch01 데모의 SCENES 객체가 원본 HTML 의 scenes 와 1:1 일치:

```bash
# 예: Q01Ramen.tsx 의 SCENES.input.title 과 client/public/demos/ch01/q01.html 의 #input title 비교
diff <(grep "title:" client/src/demos/ch01/Q01Ramen.tsx) <(grep "title:" client/public/demos/ch01/q01.html | sed 's/.*title: //; s/,$//')
```

또는 정성 검토 (4 데모 × 4-5 시나리오 = 16~20 항목).

---

## 3. WARN 단계 (REVISE 권고)

- import 경로가 `from '../_shared'` (✓) 와 `from '../_shared/index'` (불필요한 `/index`) 가 혼재 — 일관 권고
- design-tokens.css 변수 명명 컨벤션 일관 (`--demo-` prefix 누락 또는 dash/underscore 혼재)
- showcase 페이지에 4 변형 라벨이 한국어/영어 혼재

## 4. FAIL 단계

- I1 Sprint Contract 항목 1개라도 FAIL
- I2 시나리오 동시 활성화 분기가 코드 상에서 단방향 (한쪽 행만 active prop 받음)
- I3 validateLabel 위반 케이스가 throw 안 함
- I4 ch02_q01 fallback iframe 200 응답 X 또는 phone-frame 클래스 부재
- I5 `_shared/` 직접 경로 import 1건 이상
- I6 라우트 순서 역전
- I8 SCENES 텍스트가 원본 HTML 과 1자 이상 다름

---

## 5. 센티넬 JSON

검증 완료 시 `qa/ao-logs/pr12-r1-eval-interaction.status` 작성:

```json
{
  "status": "done",
  "step": "pr12",
  "role": "eval-interaction",
  "model": "codex",
  "session_id": "arch-XX",
  "ts": "2026-05-02TXX:XX:XXZ",
  "verdict": "PASS",
  "fail_items": [],
  "revise_items": []
}
```

---

## 6. 보고 형식 (REVISE/FAIL 시)

각 fail_items / revise_items 는 명확한 ID + 1-2줄 설명:

```
"fail_items": [
  "I1-C9: grep 으로 raw hex 7건 발견 — Q03Restaurant.tsx 에 #93c5fd, #102a43 등 토큰화 누락",
  "I3-validateLabel: 'OS' 단독 입력 시 throw 안 함 — forbiddenPatterns 정규식 ^(OS|API|...)$ 가 누락"
]
```

ID 는 본 핸드오프의 I1~I8 + 검증 항목 + 발견 위치 조합. Generator 가 즉시 위치 파악할 수 있도록.
