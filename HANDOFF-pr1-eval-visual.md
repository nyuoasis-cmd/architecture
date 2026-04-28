# HANDOFF — PR #1 Evaluator-Visual (T3, GLM-5.1)

> 이 프롬프트를 새 터미널(T3)의 GLM-5.1에 그대로 복붙. Planner/Generator/Eval-Interaction과 같은 터미널 절대 사용 금지.

---

## 컨텍스트

Architecture Academy PR #1 (프로젝트 스캐폴드)의 **시각 검증자**입니다. **Generator의 자체 보고를 신뢰하지 않고 적대적으로 재검증**합니다. PR #1은 인프라 위주라 시각 검증 항목은 ServiceHeader + LandingPage 임시 한정. 본격적인 목업 매칭은 PR #2부터.

### 필수 읽기

1. `/home/claude/shared/WORKFLOW-4PHASE.md` — Evaluator 공통 원칙 (§Evaluator 공통 원칙)
2. `/home/claude/architecture/HANDOFF-pr1-planner-spec.md` **§2.3 시각 기준 V1~V5**
3. `/home/claude/shared/DESIGN-POLICY.md` — Restrained Trust 팔레트, Pretendard
4. `/home/claude/architecture/mockups/student-learn.html` — 차후 PR에서 매칭할 목업 (PR #1엔 매칭 대상 없음, 참고만)

---

## 검증 항목 (Planner spec §2.3)

| ID | 기준 | 측정 방법 |
|----|------|----------|
| V1 | ServiceHeader: web component `<teachermate-nav active="Architecture" />` 렌더 시도 + script `https://teachermate.co.kr/service-nav.js` 로드 | DOM inspector + Network |
| V2 | LandingPage 임시: 헤딩 "Architecture Academy" + 부제 1줄 + 카카오 로그인 placeholder 버튼 1개 + DEV 로그인 링크 1개. 그 외 콘텐츠 없음 | 스크린샷 + DOM |
| V3 | shared design-tokens 적용: `getComputedStyle(document.body)` 또는 `getComputedStyle(document.documentElement)` 에서 `--color-stone-50` / `--color-navy` 등 CSS 변수 정의 존재 | DevTools Console |
| V4 | Pretendard 폰트 적용 (한글 표기에 영문 fallback X) — `getComputedStyle(h1).fontFamily`에 Pretendard 포함 | DevTools |
| V5 | 모바일 viewport 375×812 깨짐 없음 — 가로 스크롤 0px (`document.documentElement.scrollWidth <= 375`) | Puppeteer |

**측정 절차**:
```bash
cd /home/claude/architecture
npm run dev   # client :5176 + server :3003
# 다른 터미널에서:
# 1. 데스크톱 viewport (1280×800) 스크린샷 → screenshots/pr1-desktop.png
# 2. 모바일 viewport (375×812) 스크린샷 → screenshots/pr1-mobile.png
# 3. console.log(getComputedStyle(document.documentElement).getPropertyValue('--color-stone-50'))
```

Puppeteer 한 번에:
```js
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // 모바일
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5176');
  await page.screenshot({ path: 'screenshots/pr1-mobile.png' });
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log({ scrollWidth, viewport: 375 });
  // 데스크톱
  await page.setViewport({ width: 1280, height: 800 });
  await page.screenshot({ path: 'screenshots/pr1-desktop.png' });
  // 토큰
  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      stone50: cs.getPropertyValue('--color-stone-50'),
      navy: cs.getPropertyValue('--color-navy'),
      fontFamilyH1: getComputedStyle(document.querySelector('h1')).fontFamily,
    };
  });
  console.log(tokens);
  await browser.close();
})();
```

---

## 출력 (JSON, 표준 스키마)

```json
{
  "step": "PR #1",
  "type": "visual",
  "evaluator_model": "glm-5.1",
  "items": [
    { "id": "V1", "criterion": "ServiceHeader web component + script load", "result": "PASS|REVISE", "evidence": "..." },
    { "id": "V2", "criterion": "LandingPage 임시 4 요소만", "result": "PASS|REVISE", "evidence": "..." },
    { "id": "V3", "criterion": "design-tokens CSS 변수", "result": "PASS|REVISE", "evidence": "--color-stone-50: #fafaf9 / --color-navy: #1B2A4A" },
    { "id": "V4", "criterion": "Pretendard 적용", "result": "PASS|REVISE", "evidence": "h1 fontFamily=Pretendard, ..." },
    { "id": "V5", "criterion": "모바일 가로 스크롤 0", "result": "PASS|REVISE", "evidence": "scrollWidth=375" }
  ],
  "overall": "PASS|REVISE",
  "notes": "PR #1 인프라라 본격 비교 대상 없음. 위 5개만 측정."
}
```

REVISE 시 file:line + 현재값 + 기대값 명시. grep으로 클래스 존재만 확인하지 말 것 — 렌더된 실제 값으로 판정.

---

## 완료 트리거

위 JSON을 Planner(T1)에게 회신.
