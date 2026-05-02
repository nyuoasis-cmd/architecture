# SDD-preview-inline-v1 — Preview iframe·폰 프레임 제거 + 인라인 React 마이그레이션

> 프로젝트: `architecture` (architecture.teachermate.co.kr)
> 작성: 2026-05-02
> 브랜치: `feat/preview-inline-pilot`
> 상위 문서: SDD-v1.4 §12 (시연 콘텐츠 구조)

---

## §1 배경 및 문제

### 1.1 현 구조

`client/src/components/learn/PreviewPanel.tsx`는 시연(데모) HTML을 다음과 같이 렌더한다:

```
flex-1 flex-col items-center justify-center
  └─ .phone-frame (320×640 + 노치)
      └─ .phone-screen
          └─ <iframe sandbox="allow-scripts" src="/demos/chXX/qXX.html#scenario" />
```

데모 본체는 `client/public/demos/chXX/qXX.html` 65개 — 각 파일은 자기완결 HTML(`<head><style>` + `<script>`).

### 1.2 잘못 들어온 가정

`mockups/student-learn.html` 주석: `"phone-frame (ai-app-builder PreviewPanel 패턴)"`. ai-app-builder는 학생이 **모바일 앱**을 만드는 서비스라 폰 프레임이 의미가 있다. architecture는 IT 개념을 메타포로 가르치는 학습 서비스 — 데모 콘텐츠는 라면 4단계, CPU 파이프라인, ACID 4셀, DNS 조회 경로, 메모리 계층, 쿠버네티스 관제실 등 **개념 다이어그램**이지 모바일 앱이 아니다.

### 1.3 문제

| 항목 | 영향 |
|---|---|
| 폰 프레임 320px 강제 | 데스크탑 우측 패널 너비의 절반 이하만 콘텐츠. 4컬럼 흐름이 2컬럼으로 짜부 (`@media (max-width: 375px)`) |
| iframe 컨텍스트 분리 | 시나리오 전환마다 `iframe.src` 재할당 → 전체 리로드 + 흰 깜빡임 (cross-origin sandbox라 `location.hash` 쓰기 차단) |
| iframe 내부 `:root` 토큰 | 한결 v1 디자인 정합 검사에서 항상 §9.B 룰 밖. 챕터별 brand color 통일 어려움 |
| 메타포 충돌 | "관제실/지도실/창구/금고" 같은 메타포가 폰 프레임 안에서 어색함 |
| 1st-party 콘텐츠 샌드박스 | 우리가 직접 작성한 데모를 격리할 적이 없음 — iframe sandbox의 본질적 이유 부재 |

### 1.4 북극성

> "비전공자도 IT 전체 그림을 30분 안에 이해한다."

→ 시각 메타포가 **자기 메타포에 맞는 형태와 너비**로 보여야 한다. 폰 프레임은 이 목표에 직접 반한다.

---

## §2 결정

**iframe과 폰 프레임 둘 다 제거. 데모를 React 컴포넌트로 인라인화한다.**

### 2.1 컴포넌트 컨트랙트

```ts
// client/src/demos/types.ts
export type DemoComponentProps = {
  scenarioId: string;
};

export type DemoLayout = 'wide' | 'tall' | 'square';

export type DemoComponentMeta = {
  Component: React.ComponentType<DemoComponentProps>;
  layout: DemoLayout;  // 'wide' = 흐름 다이어그램, 'tall' = 계층 스택, 'square' = 비교 카드
};
```

각 데모는 단일 React 컴포넌트로 구현. 시나리오는 prop. 내부 hash 라우팅 폐기.

### 2.2 너비 정책

| layout | max-width | 용도 |
|---|---|---|
| `wide` | `860px` | 가로 흐름 (라면 4단계, DNS 조회 경로, 부팅 이어달리기) |
| `square` | `640px` | 비교 카드 (라이선스, 격리 수준, ACID) |
| `tall` | `480px` | 세로 계층 (메모리 계층, AI 가족 트리) |

콘텐츠는 `mx-auto`로 중앙 배치, 좌우 여백 자동.

### 2.3 레지스트리 + 점진 마이그레이션

```ts
// client/src/demos/registry.ts
export const DEMO_REGISTRY: Record<string, DemoComponentMeta> = {
  ch01_q01: { Component: Ch01Q01Ramen, layout: 'wide' },
  ch01_q02: { Component: Ch01Q02Stage, layout: 'square' },
  // ... 마이그레이션된 데모만 등록
};
```

`PreviewPanel.tsx`:
- `DEMO_REGISTRY[qaId]` 있으면 → 인라인 컴포넌트 렌더
- 없으면 → 기존 iframe + 폰 프레임 (호환 모드)

→ 65개를 한 번에 마이그할 필요 없음. 챕터 단위 PR로 점진 이전.

### 2.4 디자인 토큰

각 데모는 자기 챕터의 메타포 컬러를 유지(라면=오렌지, 무대=네이비/블루, 식당=틸, 책장=퍼플 등). 인라인 `style={{ '--demo-accent': '#ea580c' }}` 또는 컴포넌트별 Tailwind 클래스로 캡슐화.

→ 새 공유 토큰 추가 없음 (한결 v1 §9.B-3 content 룰 영역).

### 2.5 시나리오 전환

기존: `iframe.src = url#scenario` (전체 리로드)
신규: `<DemoComponent scenarioId={scenarioId} />` (React re-render, 깜빡임 0)

scenario 변경은 이미 `useLearnStore.scenarioId`로 관리되고 있어 추가 인프라 불필요.

### 2.6 standalone 미리보기 (개발용)

iframe이 주던 유일한 실질 이점. dev 모드에서 보존:

```
/demos-preview/:qaId   → DemoComponent를 단독 페이지로 렌더 (개발 확인용)
```

본 PR 범위 외. 후속 PR에서 필요 시 추가.

---

## §3 PreviewPanel 변경

### 3.1 전후 비교

**Before** (현재):
```tsx
<div className="flex flex-1 flex-col items-center justify-center overflow-auto p-6 lg:p-8">
  <div className="phone-frame">
    <div className="phone-notch" />
    <div className="phone-screen">
      <iframe src={`${demo.url}#${scenarioId}`} sandbox="allow-scripts" ... />
    </div>
  </div>
  <div className="preview-scenario-dots">{...}</div>
  <p>▶ {scenario label} — {description}</p>
</div>
```

**After** (목표):
```tsx
<div className="flex flex-1 flex-col overflow-auto px-4 py-6 lg:px-8">
  {registered ? (
    <div className={`mx-auto w-full ${maxWidthByLayout[meta.layout]}`}>
      <meta.Component scenarioId={scenarioId} />
    </div>
  ) : (
    /* 기존 iframe + phone-frame fallback (마이그레이션 미완료 데모용) */
    <LegacyIframeDemo demo={demo} scenarioId={scenarioId} />
  )}
  <ScenarioPicker demo={demo} scenarioId={scenarioId} onChange={...} />
</div>
```

### 3.2 시나리오 픽커 개선

기존 점(dot) → 라벨 포함 칩(chip):

```
┌──────────────────────────────────────────────┐
│  ● 재료 받기   ○ 냄비 준비   ○ 불로 익히기   ○ 그릇에 담기  │
└──────────────────────────────────────────────┘
```

활성 칩만 강조, 나머지는 muted. 4~5개 시나리오 라벨이 한눈에 보여 학습 흐름 가시성 ↑.

### 3.3 헤더 바

폰 노치 자리 → 데모 제목 + 도구 (재시작/전체화면) 한 줄 헤더.

전체화면 버튼은 인라인 컴포넌트에서도 `host.requestFullscreen()` 가능 (host = 컨테이너 div). 재시작은 `key={qaId+scenarioId}` 강제 remount로 충분.

---

## §4 본 PR (PR-1) 범위

### 4.1 포함

- [ ] `client/src/demos/types.ts` — 컴포넌트 컨트랙트
- [ ] `client/src/demos/registry.ts` — 레지스트리 (ch01 4개만)
- [ ] `client/src/demos/ch01/` — q01~q04 React 변환 (4개)
- [ ] `client/src/components/learn/PreviewPanel.tsx` — 분기 로직 + 시나리오 칩 + 헤더 바
- [ ] `client/src/index.css` — `.phone-frame` `.phone-notch` `.phone-screen` `.preview-scenario-dots` `.preview-scenario-dot` 제거 (단, registry 미등록 fallback iframe은 폰 프레임 그대로 유지하므로 클래스 보존; ch01_qXX이 등록되면 그것들만 인라인). **수정**: 마이그된 데모만 인라인 렌더되고 fallback은 여전히 폰 프레임 — 따라서 `.phone-*` 클래스는 모두 보존, 본 PR에서 CSS 삭제 없음.
- [ ] `SDD-preview-inline-v1.md` — 본 문서

### 4.2 제외 (out of scope)

- ❌ ch02~ch10 데모 마이그레이션 — 별도 PR 9개 (PR-2 ~ PR-10)
- ❌ `/demos-preview/:qaId` standalone 라우트 — 필요 시 후속 PR
- ❌ `client/public/demos/chXX/qXX.html` 파일 삭제 — 모든 챕터 마이그 완료 후 cleanup PR에서 일괄
- ❌ iframe fallback 분기 제거 — cleanup PR
- ❌ `.phone-frame` CSS 삭제 — cleanup PR
- ❌ 시연 외 패널(Guide/Chat/Quiz) 변경
- ❌ `mockups/student-learn.html` 갱신 — 인프라 검증 후 별도

⚠️ **사용자 직관과 차이**: 사용자는 "폰 프레임 다 삭제해도 되는 거 아니야?"라 물었으나, 본 PR은 **ch01만** 인라인. 미마이그된 ch02~ch10은 여전히 폰 프레임 안에서 보임. 한 번에 65개 다 옮기지 않는 이유는 PR 검토 부담 + 디자인 변동 시 롤백 단위 분리.

### 4.3 후속 PR 로드맵

| PR | 범위 | 데모 수 |
|---|---|---|
| **PR-1** (본) | 인프라 + ch01 | 4 |
| PR-2 | ch02 (소프트웨어 분류) | 4 |
| PR-3 | ch03 (개발 사이클) | 7 |
| PR-4 | ch04 (데이터 표현) | 7 |
| PR-5 | ch05 (웹·프론트백) | 7 |
| PR-6 | ch06 (CPU·메모리·OS) | 10 |
| PR-7 | ch07 (DB) | 6 |
| PR-8 | ch08 (네트워크·보안) | 7 |
| PR-9 | ch09 (아키텍처·확장) | 6 |
| PR-10 | ch10 (클라우드·AI) | 7 |
| PR-11 (cleanup) | iframe fallback / `.phone-*` CSS / `public/demos/` HTML 삭제 | - |

각 PR 예상 작업: 30분 ~ 1.5시간 (챕터 데모 수에 비례).

---

## §5 합격 기준 (PR-1)

### 5.1 자동 검증

- [ ] `npm run build` PASS (client + server)
- [ ] TypeScript strict 통과
- [ ] 신규 inline hex가 §9.B-3 content 룰 영역 (chapter accent) 외 누출 없음

### 5.2 시각 검증 (사용자 수동)

`http://localhost:5176/learn/1/ch01_q01` 접속 후:

- [ ] q01~q04 모두 폰 프레임 없이 콘텐츠가 자연스러운 너비로 보임
- [ ] q01 라면 4단계가 가로 한 줄로 보임 (현재는 2×2로 짜부)
- [ ] 시나리오 칩 클릭 시 깜빡임 없이 즉시 전환
- [ ] 시나리오 칩 라벨이 점 아닌 "재료 받기" 등 한국어로 보임
- [ ] 모바일 뷰 (브라우저 폭 좁힘)에서 콘텐츠가 자연 줄바꿈
- [ ] ch02 이후 (예: `ch02_q01`)는 **여전히 폰 프레임 안 iframe**으로 보임 (fallback 동작 확인)

### 5.3 콘텐츠 동등성

q01~q04 각 시나리오의 텍스트(title / summary / items / logs)가 원본 HTML과 1:1 일치. 메타포 색상도 보존(라면=오렌지, 무대=블루, 식당=틸, 책장=퍼플).

---

## §6 위험 및 완화

| 위험 | 완화 |
|---|---|
| 데모별 micro-CSS가 인라인화하면서 글로벌 클래스명 충돌 | Tailwind utility만 사용, 커스텀 클래스 필요 시 컴포넌트별 prefix(`.demo-ramen-step` 등). 또는 인라인 `style={{}}` |
| 시나리오 prop 변경 시 React re-render 비용 | 4 시나리오 × ~30개 DOM 노드 = 무시 가능 |
| 마이그레이션 누락 (ch01_q03 등록 안 함 등) | registry에 명시적 등록 + PR 체크리스트 강제 |
| 기존 iframe 데모와 인라인 데모 혼재 시 시각 차이 | 인라인 데모는 폰 프레임 없음 → 사용자 경험 격차. 단, PR-2~10 빠르게 진행하면 1주 내 해소 가능 |
| 디자인 토큰 누수 (chapter accent가 한결 v1 검증 fail 트리거) | `client/src/demos/**`을 §9.B-3 content 룰 화이트리스트로 명시 (DESIGN-POLICY 본문 갱신은 별도 정책 PR) |

---

## §7 의사결정 기록

- **iframe 유지 vs 제거**: 제거. 1st-party 콘텐츠라 sandbox 본질 부재 + 시나리오 전환 깜빡임 부작용 큼.
- **빅뱅 vs 점진**: 점진 (registry 분기). 65개 한 번에 머지 시 검토 불가능.
- **새 layout 토큰 vs 컴포넌트 자율**: 컴포넌트 자율(메타포 색은 §9.B-3 content 룰).
- **시나리오 라벨 dot vs chip**: chip. 학습 흐름 가시성 우선.

---

## §8 다음 작업 (사용자)

1. 본 SDD 검토 → OK 시 PR-1 구현 진행
2. PR-1 머지 후 PR-2 (ch02) 동일 패턴 반복
3. PR-11 cleanup은 PR-10 머지 후
