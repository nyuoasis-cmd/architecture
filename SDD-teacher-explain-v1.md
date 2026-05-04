# SDD-teacher-explain-v1 — 교사를 위한 "설명 노트" 탭 추가

> 프로젝트: `architecture` (architecture.teachermate.co.kr)
> 작성: 2026-05-04
> 상위 문서: `SDD-v1.md` (전체 서비스), `SDD-preview-inline-v2.md` (시연 인라인)
> 양식 참조: `ai-app-builder/SDD-자유모드-react-canvas-v2.md` (PR 분할 + Sprint Contract) + `ai-app-builder/SDD-한결-session-join-v1.md` (AC 중심)
> 구현 양식 참조: `ai-app-builder/client/src/components/tutorial/TeacherLessonMockup.tsx` + `lesson-flows.ts` (교사 설명 탭 — 본 SDD가 architecture 맥락으로 변환)
> 사용자 결정 (2026-05-04, Q1~Q8): A 추가 탭 / "설명 노트" / ai-app-builder 양식 참고 / 모두 추가(가독성만 신경) / 책 무시·Claude 작성·외부 fetch 허용 / 서버단 권한 / 더보기 드롭다운 / 64 Q&A 한 번에

---

## §0 메타

| 항목 | 값 |
|------|-----|
| 버전 | v2.1 (preflight FAIL 1 + WARN 핵심 5 정정) |
| 상태 | PR-1 진입 가능 |
| 시각 mockup | `mockups/teacher-explain-v1.html` (v2.0 그대로) |
| 적용 범위 | LearnPage 시연 모드 (`role=teacher`) 5번째 탭 |
| 학생 노출 | ❌ 없음 (서버단 + 클라단 이중 차단) |
| 책 본문 인용 | 0% (`SDD-v1.md` §2.1 정책 동일 — 본 SDD에서도 강제) |
| 콘텐츠 64개 작성 | 1 PR (Claude Sonnet 4.6 일괄 + 가독성 검수) |
| 의존 | LearnPage 시연 모드 (PR #76·#77) ✅ 머지 완료 / lucide-react ✅ 도입 완료 (PR #84) |

---

## §1 배경·목적

### 1.1 현재 문제

PR #80~#84 시리즈로 교사 시연 흐름이 완성되었으나, **교사가 시연 중 어떻게 설명할지는 즉석 판단에 맡겨짐**:
- LearnPage 4탭(`📖 학습` / `💬 채팅` / `📱 시연` / `✅ 퀴즈`)은 **학생용**. 교사가 시연 모드(`role=teacher`)로 들어가도 학생과 동일 화면을 봄
- `currentQa.body`(GuidePanel 본문)는 학생용 학습 텍스트라 교사 운영 정보 없음 — "이 Q&A의 핵심 메시지가 뭔지", "어떤 비유가 잘 먹히는지", "학생이 어떤 질문 던지는지", "시연 시나리오를 어떤 순서로 클릭해야 하는지" 모두 비공개
- 64 Q&A × 평균 2.4 시연 시나리오 = ~154 시나리오를 교사가 사전 학습 없이 운영해야 함

### 1.2 본 SDD의 목적

LearnPage에 **5번째 탭 "📝 설명 노트"** 추가 — 교사 시연 모드에서만 노출. 각 Q&A별 교사용 운영 가이드 11개 필드(목표·멘트·개념·작동·실생활·학생질문 3~5·시연 전 체크·교사 메모 + 선택 심화·시연 운영 팁) 제공. ai-app-builder의 "교사 설명" 탭 양식을 architecture 맥락(시연·퀴즈 중심, 책 인용 0%)으로 변환.

### 1.3 비목표 (Out of scope — §3.2 참조)

- 학생용 LearnPage 4탭 콘텐츠 변경
- AI 실시간 생성 (정적 콘텐츠로만 — 비용·예측 가능성)
- 교사가 직접 편집 (CMS 미도입, repo PR로 갱신)
- TeacherSessionPage 또는 별도 페이지 분리

---

## §2 사용자 시나리오

### 2.1 교사 (P0)

```
1. /teacher → "수업 시연 시작" → /library?sessionId=X
2. 챕터 카드 클릭 → /learn/{sessionId}?role=teacher&qa=ch01_q01
3. 4탭 그대로 + 5번째 탭 "📝 설명 노트" 노출 (학생 모드는 안 보임)
4. 시연 직전: 설명 노트 탭 → 학습 목표 + 교사 멘트 + 학생 질문 미리 훑음
5. 시연 탭으로 전환 → 학생들에게 시나리오 보여주며 설명
6. 학생 반응 따라 다시 설명 노트 탭으로 → 추가 질문/답변/심화 참조
```

**모바일 (393px)**: 5탭이 좁아지므로 **더보기 드롭다운** — 4탭 노출 + ⋯ 버튼 → 드롭다운에 "📝 설명 노트" + 다른 보조 메뉴 (확장 여지).

### 2.2 학생 (P0 — 비노출 검증)

```
1. /join → 세션 코드 입력 → /learn/{sessionId} (role 파라미터 없음)
2. LearnPage가 mode='session' && !role=teacher → 4탭만 렌더, 5번째 탭 DOM에 0건
3. 학생이 URL 조작 (?role=teacher) 시도 → 서버 401 또는 403 → /forbidden 리다이렉트
```

---

## §3 범위

### 3.1 In

- 데이터 모델 `TeacherExplainBlock` 11~13 필드 정의 (§4)
- 64 Q&A × 1 블록 = 64 블록 콘텐츠 정적 작성 (`server/data/teacher-explain/*.json` 또는 `client/src/data/teacher-explain.ts` — §4.3 결정 표)
- 서버 라우트 `GET /api/teacher-explain/:qaId` 권한 검증 + 응답 (§6.1)
- LearnPage 5번째 탭 + 새 컴포넌트 `<TeacherExplainPanel>` (§5)
- 모바일 더보기 드롭다운 (§5.2)
- DESIGN-POLICY §10 + §9-A2 정합 (§5.3)

### 3.2 Out

- 학생용 4탭 변경
- AI 실시간 생성 (Anthropic API 호출 추가 0건 — server/src/lib/chat-service.ts 무변경)
- 교사 편집 UI / CMS
- 별도 페이지(`/teacher/session/:id/explain`) 또는 TeacherSessionPage 변경
- 시연 운영 팁의 시각 자료(스크린샷·동영상) — 텍스트만
- 다국어 (한국어 단독)

---

## §4 데이터 모델

### 4.1 TeacherExplainBlock 타입 (v2.0 — 친화 장치 3 필드 추가)

```ts
// server/src/data/teacher-explain/types.ts
export interface TeacherExplainPrompt {
  q: string;       // 학생 질문 (≤80자)
  a: string;       // 교사 답변 (≤200자, 2~3 문장)
}

export interface TeacherExplainBlock {
  qaId: string;                    // 'ch01_q01' 등 64개

  // 신규 (v2.0)
  tldr: string;                    // A1 한 줄 요약 (30~50자, 1 문장 — "1분 훑기" 모드 핵심)
  misconception: string;           // D1 학생 흔한 오개념 + 정정법 (≤250자, 1~2 단락 — 붉은 tint)
  relatedQas: string[];            // E1 관련 Q&A id 1~3개 (예: ['ch06_q01', 'ch07_q01'])

  // 필수 9 필드 (v1)
  goal: string;                    // 이 Q&A의 수업 목표 (≤200자)
  cue: string;                     // 교사가 먼저 해줄 말 (인용부호, ≤150자)
  concept: string;                 // 개념 설명 (≤300자)
  mechanism: string;               // 작동 방식 (≤300자, 비유 1 + 기술 1)
  realLife: string;                // 실생활 활용 연결 (≤250자)
  prompts: TeacherExplainPrompt[]; // 학생 질문 3~5개
  beforeDemo: string;              // 시연 시작 전 체크 (≤200자)
  note: string;                    // 교사 메모 (≤200자)

  // 선택 2 필드
  advanced?: {
    technicalSpec: string;
    friendlyExplanation: string;
  };
  demoTip?: {
    scenarioOrder: string;
    studentReaction: string;
  };
}
```

#### 4.1.1 시간 라벨 매핑 (B1 — 코드 only, 데이터 변경 0)

각 필드는 시연 흐름의 한 시점에 매핑. UI 카드 좌측에 3px 색 띠 표시:

| 시점 | 색 | 변수 | 필드 |
|------|----|------|------|
| 🟢 시연 **전** | green-500 | `--color-time-before` | `tldr`, `goal`, `cue`, `concept`, `mechanism`, `advanced`, `realLife` |
| 🟡 시연 **중** | amber-500 | `--color-time-during` | `prompts`, `beforeDemo`, `demoTip`, `misconception` |
| 🔵 시연 **후** | blue-500 | `--color-time-after` | `note`, `relatedQas` |

매핑은 `client/src/components/learn/TeacherExplainPanel.tsx` 내부 상수 — 데이터 모델에 필드 추가 0.

### 4.2 가독성 룰 (§7 콘텐츠 검수에서 강제)

| 필드 | 글자수 | 단락 | 문장 길이 |
|------|--------|------|-----------|
| **tldr** (v2.0) | 30~50 | 1 | 1 문장, 단정형 |
| goal | ≤200 | 1 | ≤80자/문장 |
| cue | ≤150 | 1 | 1 문장 (큰따옴표 포함) |
| concept | ≤300 | 1~2 | ≤80자/문장 |
| mechanism | ≤300 | 1~2 | ≤80자/문장, 비유 1 + 기술 1 |
| realLife | ≤250 | 1~2 | ≤80자/문장 |
| prompts | 3~5개 | - | q ≤80, a ≤200 |
| beforeDemo | ≤200 | 1 | ≤80자/문장 |
| **misconception** (v2.0) | ≤250 | 1~2 | 첫 문장 = 오개념 진술 / 둘째 = 정정법 |
| note | ≤200 | 1 | ≤80자/문장 |
| advanced.technicalSpec | ≤500 | 1~2 | 기술 용어 허용 |
| advanced.friendlyExplanation | ≤500 | 1~2 | 비유 위주 |
| **relatedQas** (v2.0) | 1~3 항목 | - | 각 항목 = `chNN_qNN` 형식 |

`word-break: keep-all` + `overflow-wrap: break-word` 카드 기본 스타일에 적용.

### 4.4 비개발자 친화 장치 7종 (v2.0 신설)

비개발자 교사가 시연 직전 1분 안에 핵심 파악 + 시연 중 학생 반응 즉시 대응 가능하도록 7개 보조 장치 도입.

| # | 장치 | 데이터 | UI | 구현 위치 |
|---|------|--------|----|-----------|
| **A1** | 한 줄 요약 | `tldr` (필드 1) | 패널 최상단, 진한 강조 카드 (accent border-left 4px + accent-soft bg + 14px font + 1줄) | TeacherExplainPanel 헤더 직후 |
| **A2** | 읽기 시간 배지 + 1분/3분 토글 | (없음 — UI state) | 패널 우상단 작은 토글 "⏱️ 1분 훑기 / 3분 정독". **1분 모드** = `tldr` + `cue` + `prompts` + `misconception` 만 노출. **3분 모드** = 전체 (현재 동작) | TeacherExplainPanel state |
| **B1** | 시간 라벨 색 띠 | (없음 — 매핑 §4.1.1) | 카드 좌측 3px 색 띠 (녹/황/청) + 카드 라벨 옆 작은 dot | 카드 컴포넌트 props |
| **C1** | 용어 사전 hover/탭 | `client/src/data/teacher-glossary.ts` (~30 용어 정적) | 본문 안 기술 용어 (CPU·RAM·SSD·GPU·ALU·OS·API·DB·CDN·캐시·버스·인덱스·트랜잭션 등) 점선 밑줄 + hover (데스크탑) / 탭 (모바일) → Tooltip 또는 bottom sheet 1줄 풀이 | concept·mechanism·advanced 본문 + Glossary 컴포넌트 |
| **D1** | 오개념 상자 | `misconception` (필드 1) | 붉은 tint 카드 (`#fef2f2` bg / `#fecaca` border / `#7f1d1d` label) — `prompts` 와 `beforeDemo` 사이 | TeacherExplainPanel 새 카드 |
| **E1** | 관련 Q&A 링크 | `relatedQas` (필드 1, 배열) | 패널 footer (note 다음) — "👉 함께 보면 좋은 Q&A" 라벨 + chip 1~3개. 클릭 시 `/learn/{sessionId}?qa={qaId}` 이동 (현재 세션 chapter_ids 안에 있을 때만 활성, 없으면 회색 + 호버 안내) | TeacherExplainPanel footer |
| **F1** | 인쇄 친화 보기 | (없음 — CSS @media print) | 패널 우상단 🖨️ 버튼 → `window.print()`. CSS `@media print` 로 A4 1장 레이아웃 자동 (3컬럼 → 단일 컬럼, 색 띠 보존, hover Tooltip 펼쳐서 노출, 글자 12pt) | TeacherExplainPanel + print-only CSS |

#### 4.4.1 용어 사전 데이터 (C1)

```ts
// client/src/data/teacher-glossary.ts
export interface GlossaryEntry {
  term: string;             // 'CPU' (정확 일치 매칭)
  aliases?: string[];       // 'cpu', '중앙처리장치'
  oneline: string;          // ≤60자 1줄 풀이
  category?: 'hw' | 'sw' | 'net' | 'data' | 'cloud';
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'CPU', aliases: ['중앙처리장치'], oneline: '컴퓨터의 두뇌 — 명령어를 해석하고 계산을 수행하는 부품', category: 'hw' },
  { term: 'RAM', aliases: ['메모리'], oneline: '책상 위 작업 공간 — 빠르지만 전원 꺼지면 비워지는 임시 저장소', category: 'hw' },
  { term: 'SSD', aliases: ['디스크'], oneline: '책장 — 느리지만 영구 보관되는 저장 장치', category: 'hw' },
  // ... 30 항목 (PR-3 콘텐츠 PR 에서 일괄 작성)
];
```

매칭 알고리즘: 본문 텍스트에서 `term` + `aliases` 정확 일치 (단어 경계). 첫 등장만 점선 밑줄 (반복 등장 시 평문) — UI 노이즈 최소화.

모바일: hover 불가 → tap 시 bottom sheet **30vh** 슬라이드 업.

#### 4.4.1.1 Bottom Sheet 접근성 명세 (v2.1 신설 — preflight Area 4 #11)

| 항목 | 값 |
|------|-----|
| ARIA role | `role="dialog"` |
| ARIA modal | `aria-modal="true"` |
| ARIA labelledby | `aria-labelledby="glossary-sheet-title"` (term-name 요소 id) |
| 닫힘 트리거 (4종 모두 강제) | (a) 외부 backdrop 탭 (b) ESC 키 (c) handle 드래그 다운 50px+ (d) ✕ 버튼 |
| 포커스 관리 | open 시 sheet 내부 첫 focusable로 이동, close 시 trigger 요소(`<span class="term">`)로 복귀 |
| 키보드 | Tab 트랩 (sheet 내부 순환), Enter/Space ✕ 버튼 활성화 |

#### 4.4.2 1분/3분 모드 노출 룰 (A2)

```
1분 모드 (시연 직전 훑기):
  ✓ tldr (한 줄)
  ✓ cue (교사가 먼저 해줄 말)
  ✓ prompts (학생 질문 3~5개)
  ✓ misconception (오개념)
  ✗ goal·concept·mechanism·realLife·advanced·beforeDemo·note·demoTip·relatedQas 숨김

3분 모드 (정독, 기본값):
  ✓ 전체 노출 (v1.5 동작 그대로)
```

토글 state 는 패널 진입 시 기본 '3분'. 사용자 조작 시 `localStorage`에 마지막 선택 저장 (재진입 시 유지). store 변경 0 (지역 컴포넌트 state).

#### 4.4.3 친화 장치 영향 (PR 비용)

| PR | 추가 비용 | 비고 |
|----|-----------|------|
| PR-1 | +5분 | `types.ts` 에 `tldr`/`misconception`/`relatedQas` 3 필드 zod 스키마 추가만 |
| PR-2 | +1.5h | A1·A2·B1·D1·E1·F1 UI 모두 PR-2 (TeacherExplainPanel 컴포넌트 작성) |
| PR-2 (C1 용어 사전) | +1h | Glossary 컴포넌트 + Tooltip + bottom sheet (모바일) |
| PR-3 | +20% (~20분) | ch01 4 Q&A 작성 시 `tldr`/`misconception`/`relatedQas` 3 필드 같이 작성 |
| PR-4 | +20% (~50분) | 60 Q&A 일괄 — Claude 한 번에 같이 생성 |
| PR-3.5 (신규) | 1h | `client/src/data/teacher-glossary.ts` 30 용어 작성 (Claude 일괄) |

총 추가 ~5h. SDD §11 타임라인 갱신 §14.6 참조.

### 4.3 저장 위치 결정 (옵션 표 — v1.2 정정)

| 옵션 | 위치 | 장점 | 단점 | 채택 |
|------|------|------|------|------|
| A. 클라이언트 정적 TS | `client/src/data/teacher-explain.ts` (64 객체) | 즉시 import | 번들 ~120KB 증가 / 학생 클라에 콘텐츠 노출 | ❌ |
| ~~B. 서버 정적 JSON~~ | ~~`server/data/teacher-explain/{qaId}.json` 64 파일~~ | 권한 검증 가능 | **현 build script `tsc` 단독 → dist 에 JSON 누락 (production 미동작)**. postbuild copy 필요 | ❌ **v1.2 폐기** |
| C. DB | Supabase `architecture_teacher_explain` 테이블 | 갱신 용이 | 이중 관리 / 마이그 PR 필요 | ❌ |
| **D. 서버 TS 모듈** ⭐ | `server/src/data/teacher-explain/{qaId}.ts` 64 파일 + `index.ts` (record map) | tsc 자동 컴파일 → dist/data 자동 생성 / fs 의존 0 / 권한 검증 가능 / 학생 번들 0byte / 타입 안전 | 64 파일 모두 시작 시 로드 (~100KB 메모리, 무시 가능) | ✅ **v1.2 채택** |

**결정 (v1.2)**: 옵션 **D — TS 모듈**. 사용자 검토 ①번(배포 시 JSON 누락 위험) 정면 대응.

#### 4.3.1 옵션 D 구현 패턴

```ts
// server/src/data/teacher-explain/ch01_q01.ts
import type { TeacherExplainBlock } from './types';

const block: TeacherExplainBlock = {
  qaId: 'ch01_q01',
  goal: '...',
  cue: '...',
  // ... 11~13 필드
};

export default block;
```

```ts
// server/src/data/teacher-explain/index.ts (정적 record — Vite/tsc 친화)
import ch01_q01 from './ch01_q01';
import ch01_q02 from './ch01_q02';
// ... ch10_q07
import type { TeacherExplainBlock } from './types';

export const TEACHER_EXPLAIN: Record<string, TeacherExplainBlock> = {
  ch01_q01,
  ch01_q02,
  // ...
};

export function getTeacherExplainBlock(qaId: string): TeacherExplainBlock | null {
  return TEACHER_EXPLAIN[qaId] ?? null;
}
```

```ts
// server/src/data/teacher-explain/types.ts
export type TeacherExplainPrompt = { q: string; a: string };
export type TeacherExplainBlock = {
  qaId: string;
  goal: string;
  cue: string;
  // ... 11~13 필드 §4.1과 동일
};
```

build 시: `tsc` 가 `server/dist/data/teacher-explain/{qaId}.js` 64 + `index.js` + `types.js` 자동 생성. asset copy 스크립트 0건.

dev 시: `tsx` 가 동일 import 처리.

콘텐츠 갱신: TS 파일 수정 → 재배포 (정적 콘텐츠 운영 패턴 그대로).

---

## §5 UI 명세

> ⚠️ **DESIGN-POLICY 사전 인용** (사용자 지시: "PR #84 정책 미준수 사후 수정 발생, 사전 검증 필수")

### 5.1 DESIGN-POLICY 정합 발췌 (인용 — 본 SDD 잠금)

#### 5.1.1 §10 QR 공유 화면 — 본 SDD 영향 0 (탭 추가만, QR 미변경)

§10이 PR #84에서 사후 수정된 PreviewPanel QR 버튼 정책. 본 SDD는 PreviewPanel 미변경 → §10 영향 없음. 단 **회귀 검증 항목**으로 §9.1에 PR 머지 전 PreviewPanel QR 버튼 시각·동작 spot-check 1회 포함.

#### 5.1.2 §9-A2 학습형 CTA — 본 SDD 영향 0 (랜딩 미변경)

§9-A2는 architecture 랜딩 페이지(`/`) hero CTA 카피 규칙. 본 SDD는 LearnPage 내부 변경이라 §9-A2 영향 없음. 회귀 검증 0건.

#### 5.1.3 §9.B 색상 토큰 — **본 SDD 강제**

```
- 인라인 hex 0건. 모든 색은 var(--color-*) 또는 var(--demo-*) 토큰 사용
- ai-app-builder의 TeacherLessonMockup.tsx는 amber tint(`#fffbeb` 등) 인라인 hex 다수 사용 — architecture 이식 시 모두 토큰화
- 신규 토큰 필요 시 `client/src/index.css` (architecture) 의 :root 에 추가 + 본 §5.1.3 표 갱신
```

신규 토큰 표 (PR-1 또는 PR-2에서 추가):

| 토큰 | 용도 | 매핑 |
|------|------|------|
| `--color-explain-prompt-bg` | 학생 질문 카드 배경 (amber tint 대체) | `#fffbeb` 또는 stone-50 검토 |
| `--color-explain-prompt-border` | 학생 질문 카드 테두리 | `#fde68a` 또는 stone-200 검토 |
| `--color-explain-prompt-q` | 질문 텍스트 색 | `#78350f` 또는 stone-900 검토 |
| `--color-explain-prompt-a` | 답변 텍스트 색 | `#92400e` 또는 stone-700 검토 |
| `--color-explain-note-bg` | 교사 메모 배경 (slate tint) | `var(--color-bg-subtle)` 재사용 |
| `--color-explain-note-text` | 교사 메모 텍스트 | `#475569` 또는 stone-600 검토 |
| `--color-explain-section-label` | 섹션 라벨 (uppercase, teal) | `#0f766e` 또는 var(--color-accent) |

**결정 룰**: stone palette 우선. amber/teal은 architecture 톤(`Restrained Trust`)에서 약간 튐 → PR-2 시각 검수에서 stone variant로 교체 검토. 사용자 spot-check 후 확정.

#### 5.1.4 §3 타이포 — Pretendard 단일

`font-heading` 변수 그대로 (h3/uppercase 라벨에). 별도 폰트 추가 0.

#### 5.1.5 §8 UI 언어 — 말투

- 카드 라벨: 영어 uppercase 허용 (예: "LESSON GOAL" — ai-app-builder 패턴) **또는** 한글 (예: "이 단계의 수업 목표"). architecture 톤 = 한글 우선 → **한글 채택**
- 본문: ~합니다 금지 → ~어요/~ㅂ니다 혼용 허용 (UI Glossary 정합)
- prompts.a (답변)은 ~합니다 허용 (정보 전달 톤)

### 5.2 LearnPage 탭바 변경

#### 5.2.1 데스크탑 (lg ≥ 1024px)

LearnPage 데스크탑은 현재 3컬럼 layout (Guide 280px + Chat 320px + Preview flex-1). **데스크탑에는 탭바 자체가 없음** (lg 분기에서 탭 숨김 + 모든 패널 동시 노출). → **데스크탑에서는 5번째 탭 미노출** 대신 PreviewPanel 헤더에 "설명 노트" 보조 탭 추가? 또는 Chat 컬럼과 같은 자리에 토글?

**확정 (v1.5, 2026-05-04 사용자 정정)**: **D-3 채택** (PreviewPanel 헤더 3 토글). v1.1~v1.4 의 D-1 결정 폐기.

**채택 근거 (사용자 지시 정합)**:
- 사용자 첫 답변 Q1~Q8 (v1.0): "app builder의 튜토리얼 모드 '교사 설명'처럼 추가 탭으로 구현" + "app build 프로젝트 교사 설명 탭 참고해"
- ai-app-builder 실제 패턴 (`PreviewPanel.tsx:226-233`): "교사 설명" 토글이 "미리보기 / 시뮬레이터 / 코드"와 **같은 헤더 자리** → **D-3와 정확히 일치**
- "시연 / 퀴즈 / 설명 노트" 모두 같은 의미 그룹 (수업 영역 콘텐츠)
- 모바일 더보기 ⋯ 드롭다운 **불필요** — 기존 4탭 그대로
- store 변경 최소: `previewTab` 에 `'explain'` 추가만. learn-store 의 mobileTab/teacherChatTab 신설 0
- ChatPanel 변경 0 / learn-store 변경 0

**v1.1~v1.4 D-1 결정 폐기 사유** (Claude 자기 정정):
- D-1 "Chat 컬럼 비어있다"는 검증 안 된 추측에 근거
- 사용자 명시 지시(ai-app-builder 패턴)와 어긋남
- 자세한 분석은 메모리 `feedback_user-spec-precedence-over-claude-judgment.md` 참조

#### 5.2.1.1 D-3 상세 명세 (PR-2 잠금)

**PreviewPanel 헤더 3 토글** (데스크탑 lg ≥ 1024px + 모바일 둘 다 동일):

```
┌─────────────────────────────────────────────────┐
│ [시연] [퀴즈] [📝 설명 노트]    [QR코드][↺][⛶]    │  ← PreviewPanel 헤더 (height 40px)
│                       ↑ role=teacher 한정 노출  │
├─────────────────────────────────────────────────┤
│ {활성 토글의 콘텐츠}                              │
│  - 'demo' 활성 → 인라인 시연 (현재 그대로)         │
│  - 'quiz' 활성 → QuizTab (현재 그대로)            │
│  - 'explain' 활성 → TeacherExplainPanel (신규)    │
└─────────────────────────────────────────────────┘
```

| 항목 | 값 |
|------|-----|
| 토글 위치 | `PreviewPanel.tsx` 헤더 (현 "시연 / 퀴즈" 2 토글 자리에 1개 추가) |
| 노출 조건 | `mode === 'session' && searchParams.get('role') === 'teacher'` (props 로 LearnPage 에서 전달) |
| 학생 모드 동작 | 토글 미노출 → 시연/퀴즈 2 토글 (현재와 동일) |
| 기본 활성 탭 | 진입 시 `initialTab` prop 그대로 (학생 흐름 보존) |
| store 변경 | `learn-store.ts` 의 `previewTab` 타입 확장: `'demo' \| 'quiz'` → `'demo' \| 'quiz' \| 'explain'` |
| 토글 스타일 | 현재 "시연 / 퀴즈" 토글 그대로 — `rounded-md px-3 py-1 text-xs font-medium`, 활성 = `bg-stone-100 + text-primary`, 비활성 = `transparent + text-muted`. ai-app-builder `PreviewPanel.tsx:226-233` 의 "교사 설명" 토글 패턴 준수 |
| keyboard | Tab 이동 가능, Enter/Space 전환 |
| QR 버튼·툴바 | `previewTab === 'explain'` 시 reload(↺)·fullscreen(⛶) 툴바 숨김 (현재 quiz 활성 시와 동일 로직). QR 버튼은 `sessionCode` 있으면 항상 노출 (PR #84 정책 §10) |

**ChatPanel 변경 0** / **learn-store 의 `mobileTab` 변경 0** / **모바일 더보기 ⋯ 드롭다운 불필요** — D-1 대비 변경 영역 더 적음.

**LearnPage 변경**: `isTeacherPreview` 를 `<PreviewPanel>` props 로 전달 (`teacherPanel` boolean). 그 외 LearnLayout 변경 0.

#### 5.2.1.2 모바일 라벨 단축 (v2.1 결정 — preflight Area 4 #15)

393px 폭 PreviewPanel 헤더 3 토글 + QR 한 줄 정합 위해 모바일 라벨 단축:

| 데스크탑 | 모바일 (lg < 1024px) |
|----------|----------------------|
| 시연 | 시연 |
| 퀴즈 | 퀴즈 |
| 📝 설명 노트 | **📝 설명** (이모지 보존) |
| QR코드 | **QR** (DESIGN-POLICY §10 텍스트 단축 가능, 이모지 미사용) |

CSS 분기: `<span class="hidden lg:inline">노트</span>` 패턴 또는 `lg:` Tailwind variant.

#### 5.2.1.3 chapter 이동 시 previewTab 보존 (v2.1 결정 — preflight Area 4 #9)

`LearnPage:149` 의 `resetForQa(qa.id, ...)` 가 store 의 `previewTab` 을 'demo' 로 강제 리셋 → 교사 인지 부담. **resetForQa 분기**: `previewTab === 'explain'` 일 때 보존, 그 외(시연/퀴즈) reset 그대로.

```ts
// learn-store.ts resetForQa 의사코드 (v2.1)
resetForQa: (qaId, scenarioId) => set((state) => ({
  scenarioId,
  previewTab: state.previewTab === 'explain' ? 'explain' : 'demo',
  // ... 기존
}))
```

**근거**: 교사가 64 Q&A 사이를 자유롭게 점프하며 설명 노트 훑는 패턴 보존. 학생은 explain 진입 불가라 영향 0.

#### 5.2.2 모바일 (lg < 1024px) — 4탭 그대로, 더보기 ⋯ 불필요 (v1.5)

```
탭바 (현재):    📖 학습 | 💬 채팅 | 📱 시연 | ✅ 퀴즈
탭바 (v1.5):    📖 학습 | 💬 채팅 | 📱 시연 | ✅ 퀴즈   ← 변경 0

시연 탭 진입 시 PreviewPanel 헤더:
  학생:        [시연] [퀴즈]                      [QR][↺][⛶]
  role=teacher: [시연] [퀴즈] [📝 설명 노트]      [QR][↺][⛶]
                              ↑ role=teacher 한정
```

- D-3 채택으로 mobileTab 변경 0. 기존 4탭 구조 보존
- 모바일에서 교사가 설명 노트 진입 = 시연 탭 → PreviewPanel 헤더 "📝 설명 노트" 토글
- 모바일 더보기 ⋯ 드롭다운 **불필요** (v1.1~v1.4 명세 폐기)
- v1.0~v1.4 의 사용자 결정 #7 ("더보기")은 D-1 기반이라 폐기. 사용자 정정 의견 = ai-app-builder 패턴 그대로 따름 = 모바일도 PreviewPanel 헤더 토글로 통일

#### 5.2.3 learn-store 변경 (v1.5 — D-3 정합)

```ts
// client/src/store/learn-store.ts (현재)
type PreviewTab = 'demo' | 'quiz';

// v1.5 변경 (1 줄만)
type PreviewTab = 'demo' | 'quiz' | 'explain';   // 'explain' 추가 (D-3)

// mobileTab, teacherChatTab 신설 모두 폐기 (v1.1~v1.4 명세)
// 기존 LearnStore 의 setPreviewTab 시그니처 그대로 — type 만 확장
```

**v1.5 변경 영역 최소화**: store 변경 = `previewTab` 타입에 `'explain'` 추가 1 줄. v1.1~v1.4 의 `mobileTab` `'explain'` 추가 / `teacherChatTab` 신설 / `setTeacherChatTab` setter 모두 **폐기**.

ai-app-builder `tutorial-store` 의 `viewMode: 'preview' | 'simulator' | 'code' | 'teacher'` 패턴과 정확히 일치 (architecture 변형 = `'demo' | 'quiz' | 'explain'`).

### 5.3 TeacherExplainPanel 컴포넌트 명세

**파일**: `client/src/components/learn/TeacherExplainPanel.tsx` (신규)

```tsx
interface TeacherExplainPanelProps {
  qaId: string;       // 'ch01_q01' 등
  chapterTitle: string; // "1장 · 컴퓨터 큰 그림"
  qaTitle: string;    // "Q&A 제목"
}
```

#### 5.3.1 ASCII 와이어프레임 (모바일 393px 가정)

```
┌─────────────────────────────────────────────┐
│ 1장 · Q1                          [세션 주인 전용]│  ← Header
│ Q&A 제목 (현재 currentQa.title)              │
├─────────────────────────────────────────────┤
│ [1.학습] [2.채팅] [3.시연] [4.퀴즈]          │  ← Flow chips (1~4 학생 흐름, 모두 비활성)
├─────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐          │  ← 2-col grid (sm:grid-cols-2)
│ │ 이 Q&A 수업 목표│ │ 교사가 먼저 해줄 말│          │
│ │ {goal}       │ │ "{cue}"      │          │
│ └──────────────┘ └──────────────┘          │
├─────────────────────────────────────────────┤
│ 개념 설명                                     │  ← Card
│ {concept}                                    │
├─────────────────────────────────────────────┤
│ 작동 원리 / UX·시연 운영 팁  ← AdvancedSection│  ← 선택 (advanced/demoTip 있을 때)
│ [기술] [풀어쓴]   ← 내부 탭                    │
│ {advanced.technicalSpec | friendlyExplanation}│
├─────────────────────────────────────────────┤
│ 실생활 활용 연결                               │
│ {realLife}                                  │
├─────────────────────────────────────────────┤
│ 학생에게 던질 질문            ← amber tint    │
│ Q. {prompt[0].q}                            │
│ A. {prompt[0].a}                            │
│ Q. {prompt[1].q}                            │
│ ...                                         │
├─────────────────────────────────────────────┤
│ 시연 시작 전 체크                              │
│ {beforeDemo}                                │
├─────────────────────────────────────────────┤
│ 교사 메모                  ← slate tint       │
│ {note}                                       │
└─────────────────────────────────────────────┘
```

#### 5.3.2 카드 표준 스펙

| 항목 | 값 |
|------|-----|
| Wrapper padding | 16px |
| 카드 padding | 12px |
| 카드 radius | 12px (`rounded-xl`) |
| 카드 spacing | 10px (`mb-2.5`) |
| 라벨 (uppercase) | 10px / weight 700 / tracking 0.18em / `var(--color-explain-section-label)` |
| 본문 | 12px / weight 400 / leading 1.6 / `var(--color-text-body)` |
| Q (학생질문) | 12px / weight 600 / `var(--color-explain-prompt-q)` |
| A (답변) | 12px / weight 400 / `var(--color-explain-prompt-a)` / 별도 inset 박스 |
| 배지 "세션 주인 전용" | 11px / weight 700 / pill / stone-100 + stone-600 |

#### 5.3.3 AdvancedSection 내부 탭

ai-app-builder의 `AdvancedSection`을 그대로 이식 — `advanced` 필드 있을 때만 카드 노출:

```
[작동 원리] [시연 운영 팁]   ← 2 탭 (있는 것만)
─────────────────────────
{선택된 탭의 내용}
```

architecture 변형:
- ai-app-builder는 "작동 원리(기술/풀어쓴 2 토글)" + "UX·UI 디자인" — 2 탭 + 내부 토글
- architecture는 advanced(기술/풀어쓴) + demoTip(시나리오 순서/학생 반응) — 같은 2 탭 구조

### 5.4 GuidePanel·ChatPanel·PreviewPanel 변경

| 컴포넌트 | 변경 | 근거 |
|----------|------|------|
| GuidePanel | 변경 0 | 4탭 학생 흐름 그대로 |
| ChatPanel | 변경 0 (D-3 채택으로 LearnLayout swap 불필요 — v1.5 정정) | §5.2.1.1 |
| **PreviewPanel** | 헤더 토글 1개 추가 (`teacherPanel` prop true 시 "📝 설명 노트" 노출) + previewTab='explain' 분기에 `<TeacherExplainPanel>` 렌더 + reload/fullscreen 툴바 explain 시 숨김. ai-app-builder `PreviewPanel.tsx:226-233` 패턴 그대로 | §5.2.1.1 / §5.3 |
| LearnPage | `<PreviewPanel teacherPanel={isTeacherPreview} qaId={qa.id} sessionId={params.sessionId} />` 로 props 추가 전달 | §5.2.1.1 |
| LearnLayout | 변경 0 (4탭 / 3컬럼 구조 보존 — v1.5 정정) | §5.2 |
| learn-store | `previewTab` 타입에 `'explain'` 추가 1 줄 (mobileTab/teacherChatTab 신설 모두 폐기) | §5.2.3 |

---

## §6 권한·정책

### 6.1 서버 라우트 (신규 — v1.2 권한 계약 정정)

> **v1.2 정정 (외부 검토 ③번)**: 실제 인증 함수 = `getRequestUser(req)` (`server/src/lib/auth.ts:25`) — Bearer Supabase 토큰 또는 dev `x-dev-teacher-id` 헤더. 학생 쿠키 `arch_pt` 는 참여자 토큰이며 교사 인증과 **무관**. 세션 컬럼명은 `architecture_sessions.teacher_id` (`server/src/routes/sessions.ts:21`).

#### 6.1.1 권한 범위 결정 (v1.2 — 외부 검토 열린 질문 답)

옵션 (A) 광역 vs (B) 좁은:

| 옵션 | 의미 | 채택 |
|------|------|------|
| A. 광역 | 교사 권한자(어느 세션이든 1개 이상의 `teacher_id` 보유) → 64 Q&A 전체 접근 | ❌ |
| **B. 좁은** ⭐ | 요청 시 `sessionId` 동봉 → `architecture_sessions.teacher_id == user.id` AND `qaId의 chapterId ∈ session.chapter_ids` 검증 | ✅ **채택** |

**채택 이유**:
- "세션 주인 전용" 배지 의미와 정합
- 자율학습 (`/library/{ch}/{qa}` mode='self') 에서 콘텐츠 노출 0건 — 학생용 진입 경로 차단
- 시연 모드만 진입 — 사용자 시나리오 §2.1 흐름과 정합

#### 6.1.2 라우트 명세

```
GET /api/teacher-explain/:qaId?sessionId={sessionId}
  Headers (택 1):
    - Authorization: Bearer {supabase_access_token}
    - x-dev-teacher-id: {teacher_uuid}    (env.NODE_ENV === 'development' 한정)
  
  쿼리:
    sessionId  필수, UUID. 세션 좁은 권한(§6.1.1 B) 검증용

  검증 순서:
  1. qaId 형식 (정규식 /^ch(0[1-9]|10)_q(0[1-9]|10)$/) — 미준수 = 400
  2. sessionId 형식 (UUID) — 미준수 = 400
  3. user = await getRequestUser(req) — null = 401
  4. supabase = getSupabaseAdminClient()
     — null (env 미설정) = 503 (db_not_configured)  ← v2.1 신규 (preflight Area 1 #2)
     session = SELECT id, teacher_id, chapter_ids FROM architecture_sessions WHERE id=sessionId
     — 없으면 404 (session_not_found)
     — session.teacher_id !== user.id = 403 (not_session_teacher)
  5. chapterId = getQaChapterId(qaId)  ← v2.1 정정 (preflight FAIL — qa-stubs server import 불가)
     — null = 404 (qa_not_found)
     — chapterId ∉ session.chapter_ids = 403 (qa_not_in_session)
  6. block = getTeacherExplainBlock(qaId) (§4.3.1 옵션 D)
     — null = 404 (qa_not_found) / placeholder 더미는 200 (PR-1~PR-3 흐름 보존)
  7. 200 응답

응답:
  200 OK
  Cache-Control: no-store                   ← v1.2 정정 (외부 검토 ②번)
  ETag: "{contentHash}"                     ← 선택 — 304 가능
  Content-Type: application/json
  Body: TeacherExplainBlock JSON

  400: { error: "invalid_qa_id" | "invalid_session_id" }
  401: { error: "unauthenticated" }
  403: { error: "not_session_teacher" | "qa_not_in_session" }
  404: { error: "session_not_found" | "qa_not_found" }
  503: { error: "db_not_configured" }   ← v2.1 신규 (env 미설정 시)
```

#### 6.1.2.1 `getQaChapterId` helper 신설 (v2.1 — preflight FAIL 정정)

SDD v1.0~v2.0 의 `getQaById(qaId)` 호출은 `client/src/data/qa-stubs.ts` 정의 → server `tsconfig.json rootDir:"src"` 위반으로 import 불가. server 측 자체 복제 패턴 (`server/src/data/chapter-content.ts` 와 동일) 채택:

```ts
// server/src/data/qa-meta.ts (PR-1 신설)
type QaMeta = { qaId: string; chapterId: number };

export const QA_META: QaMeta[] = [
  { qaId: 'ch01_q01', chapterId: 1 },
  { qaId: 'ch01_q02', chapterId: 1 },
  // ... 64 entry (qaId → chapterId 매핑만, body·title 복제 0)
];

const QA_INDEX: Record<string, number> = Object.fromEntries(
  QA_META.map(({ qaId, chapterId }) => [qaId, chapterId])
);

export function getQaChapterId(qaId: string): number | null {
  return QA_INDEX[qaId] ?? null;
}
```

용량: 64 × ~30 bytes ≈ 2KB. import-time evaluation 즉시 완료, throw 0건.

§7.1 입력 자료 표 갱신: "Q&A 학생용 본문 — `client/src/data/qa-stubs.ts` (Claude 콘텐츠 생성 시 base, 정적 fetch)" + "qaId·chapterId 매핑 — `server/src/data/qa-meta.ts` (server 권한 검증용, PR-1 신설)" 두 항목으로 분리.

#### 6.1.3 Cache-Control 정책 (v1.2 정정 — 외부 검토 ②번)

| 단계 | Cache-Control | 이유 |
|------|---------------|------|
| **PR-1 ~ PR-5 (현 SDD)** | `no-store` 단독 | 더미 → 정식 교체 시 클라 stale 0건. 64 × ~1KB × 클릭 횟수 = 부담 무시 |
| (별도 SDD) 안정화 단계 | `private, max-age=300, must-revalidate` + ETag | 5분 SWR. 갱신 시 5분 내 자동 반영 |

**결정 (v2.1 정정 — preflight Area 1 #4)**: PR-1~PR-5 모두 **`no-store` 단독**. ETag 응답 부착 폐기 — RFC 9111 §5.2.1.5 에 따라 `no-store` 면 캐시 저장 자체 금지 → 브라우저가 `If-None-Match` 미발송 → ETag 검증 효력 0. v1.2~v2.0 의 "ETag 선택 부착" 문구 폐기. 안정화 단계에서 SWR 환원 시 ETag 의미 회복 — 별도 SDD 작업.

**구현 절감**: ETag 코드 5~10줄 생략 가능.

### 6.2 클라단 이중 차단 (v1.5 — D-3 정합 갱신)

```tsx
// LearnPage.tsx — PreviewPanel 에 props 추가
const isTeacherPreview = mode === 'session' && searchParams.get('role') === 'teacher';
const sessionId = params.sessionId;  // 좁은 권한 — 필수 (§6.1.1 B)

<PreviewPanel
  // ... 기존 props
  teacherPanel={isTeacherPreview}              // v1.5 신규: 토글 노출 조건
  sessionId={isTeacherPreview ? sessionId : undefined}  // 가드용
  qaId={qa.id}                                  // 이미 있음
/>

// PreviewPanel.tsx — 헤더 토글
{teacherPanel && (
  <button
    className={`preview-tab ${previewTab === 'explain' ? 'active' : ''}`}
    onClick={() => setPreviewTab('explain')}
  >
    📝 설명 노트
  </button>
)}

// previewTab === 'explain' 분기 본문에서:
//   fetch 호출 조건 (모두 만족 시에만):
//     1. teacherPanel === true
//     2. sessionId truthy + UUID 형식 검증
//     3. qaId 형식 OK (/^ch(0[1-9]|10)_q(0[1-9]|10)$/)
//   → 1 조건이라도 미충족 시 fetch 0건 + 인라인 "세션 정보 없음" 또는 빈 상태
//
// 정상 fetch:
//   GET /api/teacher-explain/{qaId}?sessionId={sessionId}
//   Authorization: Bearer ${supabase.auth.session().access_token}
//
// 응답 처리:
//   401 → /forbidden (토큰 만료) 또는 인라인 에러
//   403 → 인라인 "이 Q&A는 현재 세션에 포함되어 있지 않아요" (방어적)
//   404 (qa_not_found) → 인라인 "준비 중" 메시지 (PR-1~PR-3 placeholder 흐름 호환)
//   200 → <TeacherExplainPanel block={data} /> 렌더
```

#### 6.2.1 가드 부재 시 사고 패턴 (v1.3 — D-3 정합 v1.5 갱신)

```
비정상 URL: /learn/{sessionId-누락}?role=teacher&qa=ch01_q01
  → isTeacherPreview = true, sessionId = undefined
  → 토글은 노출되나 클릭 시 가드: fetch skip + 인라인 "세션 정보 없음"
  → 가드 없으면: GET /api/teacher-explain/ch01_q01?sessionId=undefined
  → 서버 400 invalid_session_id (불필요한 RTT + 에러 토스트)
```

PR-2 Sprint Contract §9.2 인터랙션 검증에 본 케이스 강제.

### 6.2.1 자율학습 (mode='self') 차단

`isTeacherPreview === false` → 5번째 탭 미노출 + fetch 0건. 자율학습 사용자가 URL 조작 (`?role=teacher&sessionId=X`) 시도 시 § 6.1.2 step 4(`session.teacher_id !== user.id`) 또는 step 3(unauthenticated) 에서 차단.

### 6.3 콘텐츠 정책 (책 무시 — 사용자 결정 #5)

- **책 본문 직접 인용 0%** (`SDD-v1.md` §2.1 정책 동일 — 본 SDD에서도 강제)
- Claude Sonnet 4.6이 64 Q&A 블록 일괄 작성 (master agent가 콘텐츠 PR에서 수행)
- 외부 자료 fetch 허용 — 애매한 IT 개념(예: Reed-Solomon, ACID 미묘한 케이스)은 master agent가 web search/fetch로 정보 보강
- 출처 표기: about 페이지 푸터에 "교사 가이드 콘텐츠는 Claude로 작성, 외부 공개 IT 학습 자료 참조" 한 줄 (책은 미언급 — 책 무시 정책)

### 6.4 라이선스·저작권 후처리

`SDD-v1.md` §11.7 (n-gram overlap 80자 substring 검출) — 본 SDD 콘텐츠도 동일 후처리:
- Claude 생성 출력 → 책 PDF 8-gram hash set 비교 → overlap 5% 이상 시 재생성
- 단 책 본문은 0% 인용이라 발생 가능성 낮음

---

## §7 콘텐츠 작성 흐름 (PR-3 + PR-4)

### 7.1 입력 자료

| 자료 | 위치 | 용도 |
|------|------|------|
| Q&A 학생용 본문 | `client/src/data/qa-stubs.ts` | 개념 추출 base |
| 시연 메타 | `client/src/data/demos.ts` + `client/src/demos/*` | beforeDemo 시나리오 정보 |
| 퀴즈 데이터 | `client/src/data/quizzes.ts` | 퀴즈 통과 기준 (필요 시) |
| 외부 자료 | web search (master agent) | 애매한 기술 개념 보강 |

### 7.2 작성 절차 (master agent 수행)

```
For each qaId in 64:
  1. qa-stubs.ts에서 currentQa.{title, body, keywords, checkpoint} 추출
  2. demos.ts에서 시연 시나리오 라벨 N개 추출 (beforeDemo input)
  3. SDD-preview-inline-v2.md §4 표에서 메타포 ↔ IT 매핑 추출 (mechanism input)
  4. Claude Sonnet 4.6 호출 (system: §4.2 가독성 룰 + 13 필드 스펙 / user: 위 1~3 입력)
  5. 출력 검증:
     - zod safeParse PASS (실패 시 console.error + skip + placeholder fallback — 시작 시점 throw 0건. preflight Area 3 #7)
     - 글자수 한도 0건 위반
     - prompts 3~5개
     - 책 본문 8-gram overlap < 5%
     - DESIGN-POLICY UI 글로서리 위반 0건 (~합니다 등)
  6. server/src/data/teacher-explain/{qaId}.ts 저장 (v2.1 정정 — TS 모듈)
End
```

#### 7.2.1 zod 안전 파싱 패턴 (v2.1 신설 — preflight Area 3 #7)

`server/src/data/teacher-explain/index.ts` 의 record 빌드 시 import-time `parse()` 호출 시 1 모듈 throw → Express 부팅 차단 + Render Starter 헬스체크 fail → 503 무한. 방어 패턴:

```ts
// server/src/data/teacher-explain/index.ts
import { teacherExplainBlockSchema } from './types';
import ch01_q01 from './ch01_q01';
// ... 64 import

const RAW_BLOCKS = { ch01_q01, /* ... */ };

export const TEACHER_EXPLAIN: Record<string, TeacherExplainBlock> = {};

for (const [qaId, raw] of Object.entries(RAW_BLOCKS)) {
  const result = teacherExplainBlockSchema.safeParse(raw);
  if (result.success) {
    TEACHER_EXPLAIN[qaId] = result.data;
  } else {
    console.error(`[teacher-explain] schema fail for ${qaId}:`, result.error.format());
    // skip — 해당 qaId 만 404 응답, 서버는 정상 부팅
  }
}
```

서버 시작 차단 0건 강제 — §9.1 PR-1 PASS 기준에 "schema fail 1건 의도 주입 시 server 정상 부팅 + 해당 qaId 만 404" 검증 항목 추가.

### 7.3 가독성 검수 (수동)

랜덤 샘플 6~7개 (10%, ch01 PR-3 4건 + 잔여 PR-4 60건 중 랜덤 6개) 사용자 spot-check:
- 교사 입장에서 시연 직전 1분 안에 훑을 수 있는가?
- 학생 질문 3~5개가 실제 수업에서 나올 법한가?
- 비유와 기술이 균형 잡혀 있는가? (한쪽 치우치면 FAIL)

---

## §8 STEP 분할 (1 STEP = 1 PR)

| STEP / PR | 마일스톤 | 데이터 | 코드 | 시간 |
|-----------|---------|------|------|------|
| **PR-0** | qa-stubs.ts 64 Q&A title+summary fresh + CHAPTERS 10 title + qaCount(ch06) + FULL_QA_ID + CLAUDE.md 정책 + SDD §7~§13 정합 | qa-stubs.ts | 0 | 1.5h |
| PR-1 | 데이터 모델 (TS 모듈, §4.3.1) + 서버 라우트 (좁은 권한 §6.1.1 B) + 1개 더미 콘텐츠 + 권한 검증 + Cache-Control: no-store | `server/src/data/teacher-explain/ch01_q01.ts` 1개 정식 + 더미 63개 (placeholder TS) + `index.ts` + `types.ts` | 서버 라우트 / 타입 / 400·401·403·404 테스트 / sessionId 검증 | 1.8h |
| PR-2 | LearnPage 5번째 탭 + TeacherExplainPanel 컴포넌트 (D-1: Chat 컬럼 토글, 또는 사용자 결정 옵션) + 데스크탑·모바일 layout + 더보기 드롭다운 + DESIGN-POLICY 토큰 정합 | 변경 0 (PR-1의 ch01_q01 더미로 시각 검증) | 클라 컴포넌트 + store + fetch hook | 2.5h |
| PR-3 | ch01 4 Q&A 정식 콘텐츠 작성 (Claude + 가독성 검수) | ch01 4 TS | 변경 0 | 1.5h |
| **PR-3.5** | `client/src/data/teacher-glossary.ts` 30 용어 + Glossary 컴포넌트 (tooltip 데스크탑 / bottom sheet 모바일 ARIA) | teacher-glossary.ts | 1 신규 컴포넌트 | 1h |
| PR-4 | 잔여 60 Q&A 콘텐츠 일괄 작성 (Claude + 후처리 + 책 8-gram overlap 검사 + 사용자 spot-check 6개) | `ch02~ch10` 60 TS | 변경 0 | 4h |
| PR-5 | (조건부) 사용자 spot-check FAIL 항목 정정 + DESIGN-POLICY 토큰 stone variant 교체 검토 + PR #84 QR 회귀 spot-check 보고 | 일부 TS 정정 | 토큰 교체 시 일부 컴포넌트 | 1h |

총 **7 PR / ~13.3h / 64 콘텐츠**.

### 8.1 의존 그래프

```
PR-1 (서버 + 더미)
  ↓
PR-2 (클라 UI — 더미로 시각 검증)
  ↓
PR-3 (ch01 정식 콘텐츠 — 위험 측정 1 챕터)
  ↓
PR-4 (60 Q&A 일괄)
  ↓
PR-5 (조건부 정정)
```

PR-1·PR-2 머지 전에는 사용자가 시각 spot-check 가능 (더미 콘텐츠로). PR-3 머지 후 ch01 정식으로 톤 확정 → PR-4 진입.

### 8.2 사용자 결정 (v1.1 — 완료)

본 SDD §5.2.1 데스크탑 layout 옵션 = **D-1 확정** (2026-05-04). PR-2 진입 차단 0.

---

## §9 Sprint Contract (PR마다 — 측정 가능한 PASS 기준)

### 9.0 PR-0 (qa-stubs title fresh + 정책)

- [ ] CHAPTERS 10 entry title mockup 정합 (qa-titles-fresh-samples.html)
- [ ] CHAPTERS ch06 qaCount: 10 → 9
- [ ] FULL_QA_ID 'ch06_q03' → valid id ('ch01_q01' 권장)
- [ ] 64 Q&A entry title mockup 정합 (id 매핑 1:1)
- [ ] 64 Q&A entry summary fresh 재작성 (~합니다 0건, 책 8-gram 0건, 30~80자)
- [ ] CLAUDE.md 책 TOC 차용 0% 정책 강화
- [ ] SDD §7/§8/§9/§13 정합 (본 PR 자체 self-rewrite)
- [ ] `cd client && npm run build` PASS
- [ ] `cd server && npm run build` PASS (서버는 본 PR 변경 0 — 회귀 PASS)
- [ ] Library/LearnPage 시각 spot-check — 새 title 노출
- [ ] qa-stubs JSON parse 에러 0건 (TS strict 빌드 통과)

### 9.1 PR-1 (서버 + 더미)

- [ ] `server/src/data/teacher-explain/ch01_q01.ts` 정식 1개 + 63개 더미 placeholder (모든 필드 "준비 중입니다" 같은 1 문장씩 — 학생 노출 가정 X, 교사 시각만 자연스러우면 PASS)
- [ ] `server/src/data/teacher-explain/index.ts` 64 record export + `getTeacherExplainBlock(qaId)` helper
- [ ] `server/src/data/teacher-explain/types.ts` zod 스키마 + `TeacherExplainBlock` 타입
- [ ] **build 검증** (v1.4 견고화 — 외부 검토 v1.4-2번): `cd server && npm run build && find dist/data/teacher-explain -maxdepth 1 -name '*.js' | wc -l` 출력 = `66` (64 + index + types). `find` 가 디렉터리 미존재 시 stderr 출력 + exit≠0 반환하므로 `ls *.js` glob 미매치 사고 회피
- [ ] `GET /api/teacher-explain/ch01_q01?sessionId={teacher_session_id}` 200 (Bearer 또는 dev `x-dev-teacher-id` 헤더)
- [ ] `GET /api/teacher-explain/ch01_q01` 400 (sessionId 누락)
- [ ] `GET /api/teacher-explain/ch01_q01?sessionId={uuid}` 401 (인증 헤더 없음)
- [ ] `GET /api/teacher-explain/ch01_q01?sessionId={다른_교사_session_id}` 403 (not_session_teacher)
- [ ] `GET /api/teacher-explain/ch99_q01?sessionId={teacher_session_id}` 404 (qa_not_found)
- [ ] `GET /api/teacher-explain/ch10_q07?sessionId={teacher_session_id_with_only_ch01}` 403 (qa_not_in_session — 좁은 권한 §6.1.1 B)
- [ ] `GET /api/teacher-explain/INVALID?sessionId={teacher_session_id}` 400 (qaId 형식 fail)
- [ ] `Cache-Control: no-store` 헤더 존재 (외부 검토 ②번)
- [ ] (선택) `ETag` 헤더 부착 — `If-None-Match` 일치 시 304
- [ ] 64 TS 모듈 모두 zod 스키마 통과 (validateBlock test)
- [ ] PR #84 QR 버튼 spot-check (회귀 0건)
- [ ] **`server/src/data/qa-meta.ts` 64 entry 신설** (v2.1 — preflight FAIL 정정) + `getQaChapterId(qaId)` helper export
- [ ] **schema fail 의도 주입** — 1 모듈을 의도적으로 깨뜨림 (예: `ch01_q01.ts` 의 `tldr` 을 number 로) → 서버 정상 부팅 + console.error 로그 + 해당 qaId 만 404 응답 + 다른 63 qaId 200 응답 PASS (§7.2.1)
- [ ] **503 응답** — Supabase env 미설정 환경에서 `getSupabaseAdminClient() === null` → 503 db_not_configured 응답

### 9.2 PR-2 (클라 UI)

#### 자동 (CI)
- [ ] `cd client && npm run build` PASS
- [ ] `cd server && npm run build` PASS
- [ ] 인라인 hex 0건 추가 (`grep -E "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/components/learn/TeacherExplainPanel.tsx` 빈 결과)
- [ ] 신규 파일에 `~합니다` 종결 0건

#### 시각 (사용자 spot-check + 4-Phase Eval-Visual)

viewport: 1440×900 (데스크탑) / 393×852 (모바일)

| # | 검증 항목 | 대상 |
|---|-----------|------|
| 1 | role=teacher일 때 PreviewPanel 헤더에 "📝 설명 노트" 토글 노출 (학생: 시연/퀴즈 2 토글만) | 모바일·데스크탑 |
| 2 | role=teacher 없을 때 "📝 설명 노트" 토글 DOM 에 0건 | 모바일·데스크탑 |
| 3 | 모바일 4탭 구조 변경 0 (📖 학습 / 💬 채팅 / 📱 시연 / ✅ 퀴즈) — 더보기 ⋯ 부재 검증 | 모바일 |
| 4 | TeacherExplainPanel 11~13 필드 모두 렌더 (ch01_q01 더미) | 모바일·데스크탑 |
| 5 | "세션 주인 전용" 배지 노출 (한글) | 모바일·데스크탑 |
| 6 | Flow chips 4단계 표시 (현재 학습 흐름 위치 강조 1, 나머지 3 비활성) | 모바일·데스크탑 |
| 7 | AdvancedSection 내부 탭 — advanced 또는 demoTip 1개 이상 있을 때만 노출 | 모바일·데스크탑 |
| 8 | DESIGN-POLICY §9.B 토큰 정합 — 인라인 hex 0건 | 코드 grep |
| 9 | 텍스트 줄바꿈 — 모든 카드에서 word-break:keep-all 적용, 3줄 초과 0건 (393px) | 모바일 |
| 10 | "QR코드" 버튼 회귀 — PreviewPanel 헤더에 lucide QrCode + "QR코드" 텍스트 (PR #84) | 모바일·데스크탑 |
| 11 | previewTab='explain' 활성 시 reload(↺)·fullscreen(⛶) 툴바 숨김 (현재 quiz 와 동일 로직) | 모바일·데스크탑 |
| 12 | 모바일 393px 폭에서 PreviewPanel 헤더 3 토글 + QR 버튼 한 줄에 들어감 (텍스트 잘림 0건) | 모바일 |

#### 인터랙션 (Eval-Interaction)
- [ ] "📝 설명 노트" 토글 클릭 → previewTab='explain' state 전환 → TeacherExplainPanel 렌더 (모바일·데스크탑 동일)
- [ ] previewTab='explain' 에서 "시연" / "퀴즈" 토글 클릭 시 정상 전환 (state round-trip)
- [ ] TeacherExplainPanel 내부 AdvancedSection 탭 클릭 시 활성/비활성 전환
- [ ] role=teacher 모드에서 학생 모드(role 파라미터 제거 후 새로고침) 전환 시 "📝 설명 노트" 토글 사라짐 + previewTab='explain' 이었으면 'demo' 로 fallback
- [ ] fetch 401 응답 시 토스트 또는 인라인 에러 + /forbidden 리다이렉트 (서버 401 시 클라가 어떻게 처리할지 — §6.2 참조)
- [ ] 같은 qaId 재진입 시 매 요청 서버 hit (Cache-Control: no-store — DevTools Network 200/304 모두 hit. v1.2 정정)
- [ ] PR-1 머지 후 PR-3 ch01 정식 콘텐츠 머지 시점 클라 새로고침 0회로 정식 콘텐츠 즉시 노출 (no-store 검증 — placeholder 오염 0건, 외부 검토 ②번)
- [ ] role=teacher 진입 시 fetch URL 에 `?sessionId=` 동봉 (§6.2)
- [ ] 403 응답 시 인라인 메시지 분기 (not_session_teacher / qa_not_in_session)
- [ ] **sessionId 누락 가드** (§6.2.1) — `?role=teacher` 만 있고 `params.sessionId` 부재인 비정상 URL 진입 시 fetch 호출 0건 + 인라인 "세션 정보 없음" 노출 (DevTools Network 검증, 서버 400 발생 0건). 외부 검토 v1.3-2번
- [ ] 동일하게 `qaId` 형식 검증 (`/^ch(0[1-9]|10)_q(0[1-9]|10)$/`) 실패 시 fetch 0건

### 9.3 PR-3 (ch01 4 Q&A 정식)

- [ ] `ch01_q01~q04.json` 4개 모두 §4.2 가독성 룰 통과 (글자수 / 단락 / 문장 길이)
- [ ] prompts 각 Q&A 3~5개 (모두)
- [ ] 책 본문 8-gram overlap < 5% (자동 검사 — `scripts/check-overlap.mjs` 신설 또는 inline)
- [ ] ~합니다 종결 0건 (단 prompts.a는 정보 톤 허용)
- [ ] 사용자 spot-check 4 Q&A 모두 PASS (목표·멘트·개념 톤 확정)

### 9.4 PR-4 (60 Q&A 일괄)

- [ ] `ch02~ch10` 60 TS 모두 §4.2 가독성 룰 통과
- [ ] prompts 각 Q&A 3~5개 (모두)
- [ ] 책 본문 8-gram overlap < 5% (모두)
- [ ] ~합니다 종결 0건 (prompts.a 제외)
- [ ] 사용자 spot-check 6개 (10% 랜덤) 모두 PASS
- [ ] 64 TS 모두 zod 스키마 통과 (validate 스크립트)

### 9.5 PR-5 (조건부 정정)

- [ ] PR-4 사용자 spot-check FAIL 항목 모두 정정 PASS
- [ ] DESIGN-POLICY 토큰 amber/teal → stone variant 교체 결정 시 시각 검수 PASS
- [ ] PR #84 QR 회귀 spot-check 1회 PASS

### 9.6 PR-3.5 (teacher-glossary)

- [ ] `client/src/data/teacher-glossary.ts` 30 용어 export
- [ ] Glossary 컴포넌트 (tooltip 데스크탑 / bottom sheet 모바일)
- [ ] ARIA — `role="dialog" aria-modal="true"` (모바일) + `aria-describedby` (데스크탑)
- [ ] 4종 닫힘 (ESC / 외부 클릭 / X 버튼 / 스와이프 다운 — 모바일)
- [ ] TeacherExplainPanel 의 단어 marker → Glossary 호출 동작
- [ ] DESIGN-POLICY 토큰 정합 (인라인 hex 0건)
- [ ] `cd client && npm run build` PASS

---

## §10 리스크·미해결

| 위험 | 영향 | 완화 |
|------|------|------|
| ~~데스크탑 layout 옵션 미결정~~ ✅ v1.1 D-1 확정 | - | §5.2.1.1 잠금 명세 |
| ~~배포 시 정적 JSON dist 누락~~ ✅ v1.2 옵션 D (TS 모듈) 채택 | - | §4.3 / §4.3.1 / §9.1 build 검증 |
| ~~Cache-Control 24h vs placeholder 충돌~~ ✅ v1.2 `no-store` 고정 | - | §6.1.3 / §9.1 / §9.2 |
| ~~권한 계약 코드베이스 불일치~~ ✅ v1.2 `getRequestUser` 재사용 + `teacher_id` 컬럼 + `arch_pt` 무관 명시 | - | §6.1 머리말 / §6.1.2 |
| ~~store 명칭 분기 (`teacherChatTab` vs `teacherViewMode`)~~ ✅ v1.2 `teacherChatTab` 단일 | - | §5.2.3 |
| ~~"세션 주인 전용" 배지 의미와 권한 범위 불일치~~ ✅ v1.2 옵션 B (좁은) 채택 — sessionId 검증 | - | §6.1.1 / §6.1.2 / §6.2 |
| **DESIGN-POLICY 토큰 amber/teal stone 정합 안 함** | 시각 톤 튀어 PR-2 사후 수정 | 신규 토큰 §5.1.3 표 미리 등록 + PR-2에서 stone variant 교체 시각 검수 동시 진행 |
| **Claude Sonnet 64 일괄 호출 비용** (v2.1 갱신 — preflight Area 1 #5) | 64 Q&A × 13 필드 ≈ 출력 3000 tok/Q&A × 64 = ~192k output. 입력 prefix ~4500 tok × 64 = 288k input. Sonnet 4.6 단가 (\$3/M in + \$15/M out) → \$0.86 + \$2.88 = **~\$3.8** (재시도 2배 ~\$7.6). 30 glossary 추가 trivial (<\$0.05) | 절대값 합리. v2.0 까지 명시한 \$1.50 은 출력 토큰 과소 추정 (1500→3000) — v2.1 실측 정정 |
| **책 본문 8-gram overlap 검사 부재** | 저작권 리스크 (책 무시 정책에도 우발적 인용 가능) | PR-3·PR-4에 자동 검사 강제 (scripts/check-overlap.mjs 또는 inline). 5% 초과 시 해당 블록 재생성 |
| **외부 web fetch 자료 라이선스** (사용자 #5 "크롤링") | Wikipedia/MDN 등 CC-BY-SA 라이선스 표기 누락 | master agent가 fetch 시 출처 기록 → about 페이지에 외부 자료 라이선스 표기 한 줄 추가 (PR-4) |
| ~~모바일 더보기 드롭다운 a11y 누락~~ ✅ v1.5 D-3 폐기 | - | - |
| ~~모바일 393px PreviewPanel 헤더 3 토글 폭 부족~~ ✅ v2.1 §5.2.1.2 라벨 단축 결정 잠금 ("📝 설명" / "QR") | - | §9.2 #12 |
| ~~chapter 이동 시 previewTab='explain' 끊김~~ ✅ v2.1 §5.2.1.3 explain 보존 분기 결정 | - | learn-store.resetForQa 분기 |
| ~~bottom sheet 접근성 명세 누락~~ ✅ v2.1 §4.4.1.1 ARIA + 4종 닫힘 강제 | - | §4.4.1.1 |
| ~~zod 시작 시점 파싱 사고~~ ✅ v2.1 §7.2.1 safeParse + skip + placeholder fallback | - | §9.1 검증 1줄 |
| ~~Cache-Control + ETag 동시 부착~~ ✅ v2.1 §6.1.3 ETag 폐기 (no-store 단독) | - | §6.1.3 |
| ~~`getQaById` server import 불가~~ ✅ v2.1 §6.1.2.1 `qa-meta.ts` 자체 복제 | - | PR-1 §9.1 |
| ~~Anthropic 비용 추정 ~3배 차이~~ ✅ v2.1 §10 비용 정정 (~$4.2) | - | §10 |
| **role=teacher URL 조작으로 학생 노출** | 학생이 클라 우회 시도 | 서버단 401/403이 단일 진실원 (§6.1). 클라단은 UX 단축. fetch 실패 시 빈 패널 + 토스트 |
| **콘텐츠 갱신 시 64 TS 재배포** | 작은 오타도 1 PR 머지 + 재배포 | 일반적 정적 콘텐츠 운영 패턴. CMS 미도입은 §3.2 Out |
| **AdvancedSection 내부 탭 인지 부담** | 탭 안 탭 — 교사가 못 찾을 수 있음 | demoTip 또는 advanced 둘 중 **하나만** 있으면 탭 없이 직접 노출. 둘 다 있을 때만 2 탭 |
| **Anthropic 캐시 prefix 갱신 0건** (`server/src/lib/chat-service.ts` 무변경) | 본 SDD는 챗봇 0 영향 — 정적 JSON | server/src/ai.ts 무변경. `SDD-v1.md` §5.4 캐시 영향 0 |

### 미해결 (v1.1 — PR 진행 중 결정 위임)

1. ~~데스크탑 layout~~ ✅ **D-1 확정 (2026-05-04)**
2. **stone variant 토큰 교체** — PR-2 시각 spot-check에서 master agent 판단 (위임). amber/teal 톤이 architecture Restrained Trust 와 충돌하면 stone-50/stone-200/stone-600 로 자동 교체 → PR-5 가 아닌 PR-2 안에서 처리
3. **외부 자료 라이선스 표기 위치** — 기본값 = about 페이지 푸터 1줄 ("교사 가이드 콘텐츠는 Claude로 작성, 외부 공개 IT 학습 자료 참조"). PR-4 머지 시 적용. 별도 페이지 신설 시도 0

---

## §11 타임라인 추정

| 단계 | 시간 | 비고 |
|------|------|------|
| ~~본 SDD v1 사용자 검토~~ | ~~30분~~ | ✅ v1.1 — D-1 확정 / 잔여 2건 위임 |
| PR-1 (서버 + 더미) | 1.5h | master agent 단독 |
| PR-2 (클라 UI) | 2.5h | 4-Phase 또는 master 단독 |
| PR-3 (ch01 4 Q&A) | 1.5h | Claude 호출 + master 검수 + 사용자 spot-check |
| PR-4 (60 Q&A 일괄) | 4h | Claude 호출 다회 + 후처리 + 사용자 spot-check 6개 |
| PR-5 (조건부 정정) | 1h | FAIL 항목 + 토큰 교체 |
| **합계** | **~11h** | 1~2 세션 |

---

## §12 인용·참조

- **상위 SDD**: `architecture/SDD-v1.md` (전체) + `architecture/SDD-preview-inline-v2.md` (시연 인라인)
- **양식 참조**: `ai-app-builder/SDD-자유모드-react-canvas-v2.md` (PR 분할 + Sprint Contract) + `ai-app-builder/SDD-한결-session-join-v1.md` (AC 중심)
- **구현 양식 참조**:
  - `ai-app-builder/client/src/components/tutorial/TeacherLessonMockup.tsx` (UI 템플릿)
  - `ai-app-builder/client/src/components/tutorial/lesson-flows.ts:15-28` (TeacherLessonBlock 데이터 모델)
  - `ai-app-builder/client/src/components/preview/PreviewPanel.tsx:226-233` (탭 추가 패턴)
- **정책**:
  - `shared/DESIGN-POLICY.md` §10 (QR — 회귀 검증) / §9-A2 (학습형 CTA — 영향 0) / §9.B 색상 토큰 (강제) / §3 타이포 / §8 UI 언어
  - `shared/BUILDER-UX-POLICY.md` (세션 흐름 — 본 SDD는 탭 추가만이라 영향 작음)
- **메모리**:
  - `architecture-spotcheck-completion-2026-05-04.md` (직전 PR #73~#78 환경)
  - `feedback_no-auto-dev-server.md` / `feedback_pr-merge-after-qa.md` / `feedback_pr-additional-commit-stale-squash.md` (운영 정책)

---

## §13 다음 작업 (사용자)

1. ✅ v1 사용자 검토 완료
2. ✅ v1.1 D-1 확정 / v1.2 외부 검토 4건 + 열린 질문 / v1.3 외부 검토 추가 2건 / v1.4 외부 검토 추가 3건 반영
3. **다음 세션 PR-1 시작** — master agent 단독, ~1.8h. 본 §13.2 절차 정확히 따름
4. PR-1 머지 후 PR-2 시각 spot-check → PR-3 ch01 정식 콘텐츠 작성 → PR-4 60 일괄 → PR-5 (조건부)
5. 모든 PR 머지 후 본 SDD 를 `archive/SDD-teacher-explain-v1-completed.md` 로 이동

### 13.1 브랜치 명 규칙 (v1.3 정정)

AGENTS 규칙 `codex/<task-id>` 패턴 채택. master agent (Claude) 단독 PR 도 동일:

| PR | 브랜치 명 |
|----|-----------|
| PR-0 | `ao/teacher-explain-pr0` |
| PR-1 | `codex/teacher-explain-server` |
| PR-2 | `codex/teacher-explain-client` |
| PR-3 | `codex/teacher-explain-content-ch01` |
| PR-3.5 | `codex/teacher-explain-glossary` |
| PR-4 | `codex/teacher-explain-content-rest` |
| PR-5 | `codex/teacher-explain-polish` (조건부) |

(v1 ~ v1.2 §10.0 의 `feat/*` 컨벤션 폐기 — 외부 검토 v1.3-1번)

### 13.2 PR-1 절차 (v1.4 — 메모리 / PR 생성 분리)

> v1.4 변경 (외부 검토 v1.4-1번 / v1.4-3번):
> - PR-1 범위 = **구현 + 검증 + 커밋까지**. **PR 생성은 사용자 명시 승인 후 별도 단계**
> - 작업 시작 전 메모리 읽기 + 종료 직전 결과 메모리 작성을 절차에 명시 (AGENTS 메모리 정책 정합)

#### 13.2.1 시작 전 (≤ 5분)

1. **공유 메모리 확인**: 다음 4개 필수 읽기
   - `~/.claude/projects/-home-claude/memory/MEMORY.md` (인덱스)
   - `architecture-spotcheck-completion-2026-05-04.md` (직전 환경)
   - `feedback_no-auto-dev-server.md` (dev server 자동 시작 금지)
   - `feedback_pr-merge-after-qa.md` + `feedback_pr-additional-commit-stale-squash.md` (PR 운영)
2. **본 SDD v1.4 본문 다시 읽기** — §4.3.1 (TS 모듈 패턴), §6.1.2 (라우트 명세), §9.1 (Sprint Contract)
3. **mockup 시각 확인**: `architecture/mockups/teacher-explain-v1.html` 데스크탑·모바일 두 뷰 한 번 훑어 UI 의도 정합
4. main HEAD 확인: `cd /home/claude/architecture && git fetch origin && git log --oneline origin/main -3` (현재 `7321a7d` 또는 그 이후)

#### 13.2.2 구현 (~1.5h)

5. 새 브랜치: `git checkout -b codex/teacher-explain-server`
6. 생성 파일:
   - `server/src/data/teacher-explain/types.ts` (zod + `TeacherExplainBlock`)
   - `server/src/data/teacher-explain/index.ts` (record map + `getTeacherExplainBlock(qaId)`)
   - `server/src/data/teacher-explain/ch01_q01.ts` (정식 1개 — mockup 의 콘텐츠 참고 가능)
   - `server/src/data/teacher-explain/ch{NN}_q{NN}.ts` × 70 (placeholder — 모든 필드 "준비 중입니다" 1 문장)
   - `server/src/routes/teacher-explain.ts` (GET 라우터, 좁은 권한 §6.1.1 B)
   - `server/src/index.ts` 라우터 등록 (`app.use('/api/teacher-explain', teacherExplainRouter)`)

#### 13.2.3 검증 (~0.3h)

7. **빌드 검증** (외부 검토 v1.4-2번):
   ```bash
   cd /home/claude/architecture/server
   npm run build
   find dist/data/teacher-explain -maxdepth 1 -name '*.js' | wc -l
   # 출력: 66 (64 + index + types)
   ```
8. **권한 / 캐시 / 형식 검증** — §9.1 Sprint Contract 의 9개 케이스 자체 테스트:
   - 200 (정상) / 400×2 (qaId 형식 / sessionId 형식) / 401 (인증 헤더 없음) / 403×2 (not_session_teacher / qa_not_in_session) / 404×2 (session_not_found / qa_not_found) / `Cache-Control: no-store` 헤더
   - dev 모드에서 `x-dev-teacher-id` 헤더로 9 케이스 모두 cURL 또는 인라인 스크립트 실행

#### 13.2.4 커밋 (~5분)

9. `git status` 확인 — 의도하지 않은 파일 staged 0건
10. 커밋: 1 마일스톤 = 1 커밋 (TOKEN-POLICY §5)
    ```
    feat(server): teacher-explain 라우터 + TS 데이터 모듈 (PR-1)
    
    - 좁은 권한 (sessionId + teacher_id + chapter_ids 검증)
    - Cache-Control: no-store
    - 64 TS 모듈 (ch01_q01 정식 1 + 더미 63)
    - find 빌드 검증 = 73 .js
    ```

#### 13.2.5 종료 직전 — 결과 메모리 작성

11. **새 메모리 파일 작성**: `~/.claude/projects/-home-claude/memory/teacher-explain-pr1-completion-2026-05-XX.md`
    - 머지 PR 번호 (사용자 머지 시점에 채움 — 본 시점은 비워둠)
    - main HEAD (push 전 현재 commit hash)
    - 환경 상태 (dev server 죽었는지 / 살아있는지)
    - 다음 단계 = PR-2 (사용자 명시 승인 대기 중)
    - 발견 사항 / 함정 / 사용자 spot-check 권장 항목
12. `MEMORY.md` 인덱스에 1줄 추가
13. **사용자에게 보고** — push + PR 생성은 **사용자 명시 승인 후** (외부 검토 v1.4-1번 / `feedback_pr-merge-after-qa.md`):
    - "PR-1 구현 + 검증 + 커밋 완료. push + PR 생성 진행할까요?" 형태
    - 승인 후에만 `git push -u origin codex/teacher-explain-server` + `gh pr create`

### 13.3 PR-2 ~ PR-5 절차 (요약)

PR-1 의 §13.2 절차를 PR-2~PR-5 도 동일 패턴 적용:
- 시작 전 → 공유 메모리 + SDD 본문 읽기
- 구현 → 검증 → 커밋
- 종료 직전 → 결과 메모리 작성 + MEMORY.md 인덱스 1줄 추가
- 사용자 명시 승인 후에만 push + PR 생성

### 13.1 검토 결과 (v1.1, 2026-05-04 사용자 결정)

```
§10 미해결:
1. 데스크탑 layout = D-1 ✅
2. stone variant 교체 = PR-2 위임 (master agent 판단)
3. 외부 자료 라이선스 표기 = about 페이지 푸터 1줄 (기본값 채택)
```

---

## §14 변경 요약

| # | 결정 | 출처 |
|---|------|------|
| 1 | 5번째 탭 추가 (LearnPage 시연 모드 한정) | 사용자 결정 #1 |
| 2 | 라벨 = "📝 설명 노트" | 사용자 결정 #2 |
| 3 | UI 템플릿 = ai-app-builder 교사 설명 양식 이식 | 사용자 결정 #3 |
| 4 | 11~13 필드 모두 (가독성만 신경) | 사용자 결정 #4 |
| 5 | 책 본문 0% + Claude 작성 + 외부 fetch 허용 | 사용자 결정 #5 + `SDD-v1.md` §2.1 |
| 6 | 권한 = 서버단 (`/api/teacher-explain/:qaId` 401/403) | 사용자 결정 #6 |
| 7 | 모바일 = 더보기 ⋯ 드롭다운 | 사용자 결정 #7 |
| 8 | 64 Q&A 한 번에 1 PR (PR-4) | 사용자 결정 #8 |
| 9 | DESIGN-POLICY §10/§9-A2/§9.B 사전 인용 | 사용자 지시 (PR #84 사후 수정 사고 재발 방지) |
| 10 | 데스크탑 layout D-1 (Chat 컬럼 토글) 권장, D-2/D-3/D-4 옵션 명시 | 본 SDD §5.2.1 — v1.1 D-1 확정 |

### §14.1 v1 → v1.1 (2026-05-04 사용자 결정)

| # | 결정 | 반영 위치 |
|---|------|-----------|
| 1 | 데스크탑 layout = **D-1** (Chat 컬럼 자리 토글) 확정 | §5.2.1 → §5.2.1.1 잠금 명세 신설 / §5.4 컴포넌트 영향 갱신 / §10 위험 표 해제 / §13.1 결정 기록 |
| 2 | stone variant 교체 = **PR-2 위임** (master agent 판단) | §10 미해결 갱신 — PR-5 잔여에서 PR-2 내부로 이동 |
| 3 | 외부 자료 라이선스 = **about 푸터 1줄** (기본값 채택) | §10 미해결 갱신 + §6.3 콘텐츠 정책의 "출처 표기" 그대로 — PR-4 적용 |

### §14.7 v2.0 → v2.1 (2026-05-04 preflight 결과 — FAIL 1 + WARN 핵심 5 + 비용 정정)

| # | preflight 영역 / 항목 | Sev | 정정 | 반영 위치 |
|---|------------------------|-----|------|-----------|
| 1 | Area 1 #3 / Area 3 #5 — `getQaById` server→client import rootDir 위반 | ❌ FAIL | `server/src/data/qa-meta.ts` 64 entry + `getQaChapterId(qaId)` helper 신설 | §6.1.2 step 5 / §6.1.2.1 / §7.1 / §9.1 |
| 2 | Area 1 #4 — Cache-Control: no-store + ETag 모순 (RFC 9111) | ⚠️ WARN | ETag 부착 폐기. PR-1~PR-5 `no-store` 단독. ETag 의미 회복은 안정화 SWR 별도 SDD | §6.1.3 |
| 3 | Area 3 #7 — zod 시작 시점 throw → 서버 부팅 차단 위험 | ⚠️ WARN | `safeParse` + console.error + skip + placeholder fallback 패턴 강제. schema fail 의도 주입 검증 항목 추가 | §7.2.1 / §9.1 |
| 4 | Area 4 #9 — chapter 이동 시 previewTab='explain' reset (교사 인지 부담) | ⚠️ WARN | `resetForQa` 분기 — explain 활성 시 보존, 그 외 reset. 교사 자유 점프 흐름 보존 | §5.2.1.3 / learn-store |
| 5 | Area 4 #11 — bottom sheet 접근성 명세 누락 | ⚠️ WARN | `role="dialog"` + `aria-modal` + 4종 닫힘 (backdrop/ESC/handle drag/✕) + 포커스 trap 강제 | §4.4.1.1 |
| 6 | Area 4 #15 — 모바일 393px 라벨 단축 결정 미잠금 | ⚠️ WARN | "📝 설명" / "QR" 채택 결정 잠금. lg: breakpoint 분기 | §5.2.1.2 |
| (보너스) | Area 1 #5 — Anthropic 비용 ~3배 추정 차이 | 정합 | ~$1.50 → ~$4.2 (실측 단가 기반) | §10 비용 표 |
| (보너스) | Area 1 #2 — Supabase env 미설정 시 503 분기 누락 | 정합 | `getSupabaseAdminClient() === null` → 503 db_not_configured | §6.1.2 step 4 / §9.1 |

**나머지 WARN 7건** (preflight 보고서) — PR-2 시각 spot-check 시 한꺼번에 정정 (사용자 결정 옵션 A):
- 인쇄 복귀 dialog state 보존 (§9.2 1줄)
- disabled chip a11y 카피·aria-disabled (§4.4 E1)
- lucide-react v1.14 ↔ 다른 앱 0.x 통일 (별도 작업)
- iOS Safari window.print() 사용자 제스처 QA
- Safari private mode localStorage QuotaExceededError try/catch
- Tooltip 자체 구현 모바일 sticky 동작 검증
- StrictMode 이중 실행 + setItem 멱등성

### §14.6 v1.5 → v2.0 (2026-05-04 사용자 결정 — 비개발자 교사 친화 장치 7종)

| # | 장치 | 핵심 변경 | 반영 위치 |
|---|------|-----------|-----------|
| A1 | 한 줄 요약 (`tldr`) | 패널 최상단 진한 강조 카드, 30~50자 1 문장. "1분 훑기" 모드 핵심 | §4.1 / §4.2 / §4.4 / §5.3 mockup |
| A2 | 1분/3분 모드 토글 | 패널 우상단 ⏱️ 토글. 1분 = tldr+cue+prompts+misconception 만. 3분 = 전체. localStorage 저장 | §4.4.2 / §5.3 / §9.2 |
| B1 | 시간 라벨 색 띠 | 카드 좌측 3px 색 띠 (🟢전 / 🟡중 / 🔵후). 매핑은 코드 상수, 데이터 변경 0 | §4.1.1 / §5.3 |
| C1 | 용어 사전 hover/탭 | `client/src/data/teacher-glossary.ts` 30 용어. 본문 점선 밑줄 + Tooltip(데스크탑) / bottom sheet(모바일) | §4.4 / §4.4.1 / §5.3 / PR-3.5 신설 |
| D1 | 오개념 상자 (`misconception`) | 붉은 tint 카드, prompts·beforeDemo 사이. 첫 문장 = 오개념 / 둘째 = 정정법 | §4.1 / §4.2 / §5.3 mockup |
| E1 | 관련 Q&A 링크 (`relatedQas`) | 패널 footer chip 1~3개. 현재 세션 chapter_ids 안에 있을 때만 활성 | §4.1 / §5.3 / §5.5 |
| F1 | 인쇄 친화 (`@media print`) | 우상단 🖨️ 버튼 + A4 1장 레이아웃 CSS. 색 띠 보존, hover 풀이 펼쳐서 노출, 12pt | §4.4 / §5.3 |
| 추가 | PR-3.5 신설 | `teacher-glossary.ts` 30 용어 작성 1h (Claude 일괄) | §4.4.3 / §8 PR 표 |
| 추가 | 타임라인 +5h | 총 11h → 16h | §11 |

mockup HTML 은 v2.0 으로 통째 갱신 — 7개 장치 모두 시각화.

### §14.5 v1.4 → v1.5 (2026-05-04 사용자 정정 — D-1 폐기 → D-3 채택)

| # | 정정 | 반영 위치 | 핵심 변경 |
|---|------|-----------|-----------|
| 1 | **데스크탑 layout D-1 → D-3** (PreviewPanel 헤더 3 토글) — ai-app-builder `PreviewPanel.tsx:226-233` 패턴 그대로 | §5.2.1 / §5.2.1.1 / §5.2.2 / §5.2.3 / §5.4 | Chat 컬럼 토글 폐기. PreviewPanel 헤더에 "📝 설명 노트" 토글 1개 추가. ChatPanel·learn-store mobileTab/teacherChatTab 변경 0. previewTab 타입에 'explain' 1 줄 추가만 |
| 2 | **모바일 더보기 ⋯ 폐기** | §5.2.2 / §10 위험 표 / §9.2 검증 | 4탭 구조 변경 0. 시연 탭 진입 후 PreviewPanel 헤더 3 토글로 통일. 더보기 a11y 위험 자동 해소 |
| 3 | 신규 위험 — 모바일 393px 폭 3 토글 + QR 버튼 한 줄 | §10 / §9.2 검증 항목 12 | 라벨 단축·flex-wrap·overflow-x-auto 옵션 |
| 4 | v1.0~v1.4 D-1 결정 사고 분석 → 메모리 신설 | `feedback_user-strong-conviction-precedence.md` | 사용자 강한 확신(명시 자료 지정·반복 강조·단정 어투)은 그대로 따름. 변형 옵션 제시 자체는 OK |
| 5 | mockup HTML 갱신 | `mockups/teacher-explain-v1.html` | D-3 패턴으로 통째 재작성. 데스크탑 PreviewPanel 헤더 3 토글 + 모바일 4탭 그대로 + 시연 탭 안 3 토글 |

### §14.4 v1.3 → v1.4 (2026-05-04 외부 검토 추가 3건)

| # | 외부 지적 (Sev) | 반영 위치 | 핵심 변경 |
|---|------------------|-----------|-----------|
| 1 | **Medium** PR-1 절차에 PR 생성까지 포함 — `feedback_pr-merge-after-qa.md` 와 충돌 | §13.2 신설 (5단계 절차) | PR-1 범위 = 구현 + 검증 + 커밋까지. push + PR 생성은 사용자 명시 승인 후 별도 단계. PR-2~PR-5 도 동일 패턴 (§13.3) |
| 2 | **Medium** 빌드 검증 명령 `ls dist/.../*.js \| wc -l` glob 미매치 시 sed 동작 모호 | §9.1 정정 / §13.2.3 | `find dist/data/teacher-explain -maxdepth 1 -name '*.js' \| wc -l` 로 견고화. 디렉터리 미존재 시 stderr + exit≠0 |
| 3 | **Low** 핸드오프 메모리 시작/종료 절차 부재 | §13.2.1 / §13.2.5 / §13.3 | 시작 전 = 공유 메모리 4개 + SDD 본문 + mockup 읽기 / 종료 전 = 결과 메모리 1개 + MEMORY.md 인덱스 1줄 추가. AGENTS 메모리 정책 정합 |

### §14.3 v1.2 → v1.3 (2026-05-04 외부 검토 추가 2건)

| # | 외부 지적 | 반영 위치 | 핵심 변경 |
|---|-----------|-----------|-----------|
| 1 | 브랜치 명 `feat/teacher-explain-server` 가 AGENTS 규칙 (`codex/<task-id>`) 미준수 | §13 다음 작업 안내 | PR-1~PR-5 모두 `codex/<task-id>` 패턴. master agent (Claude) 단독 PR도 동일 패턴 채택 |
| 2 | PR-2 클라단 명세에 sessionId 누락 시 fetch skip 조건 부재 → 비정상 URL 에서 불필요한 400 발생 | §6.2 클라단 / §6.2.1 신설 / §9.2 인터랙션 검증 | fetch 호출 조건 3 (`isTeacherPreview && sessionId 존재 && qaId 형식 OK`) 모두 만족 시에만. 미충족 시 fetch 0건 + 인라인 안내 |

### §14.2 v1.1 → v1.2 (2026-05-04 외부 검토 4건 + 열린 질문 1건)

| # | 외부 지적 (Severity) | 반영 위치 | 핵심 변경 |
|---|----------------------|-----------|-----------|
| ① | **High** — 배포 시 `server/data/*.json` dist 누락 (build = `tsc` 단독, asset copy 0) | §4.3 옵션 표 갱신 / §4.3.1 신설 / §8 PR-1 / §9.1 build 검증 | 옵션 B 폐기 → **옵션 D (TS 모듈, `server/src/data/teacher-explain/{qaId}.ts` 64 + `index.ts` + `types.ts`)** 채택. tsc 자동 컴파일 → fs 의존 0 |
| ② | **High** — `Cache-Control: max-age=86400` vs placeholder 교체 충돌 (PR-1 더미 24h 캐시 → PR-3/4 정식 노출 안됨) | §6.1.3 신설 / §9.1 / §9.2 | **`Cache-Control: no-store`** 고정 (PR-1~PR-5). ETag 선택. 안정화 후 SWR 환원 별도 SDD |
| ③ | **Medium** — 권한 계약 코드베이스 불일치 (실제: `getRequestUser` Bearer/dev-header / `teacher_id` 컬럼 / `arch_pt` 학생 토큰 무관) | §6.1 머리말 / §6.1.2 라우트 명세 / §9.1 검증 케이스 | "Authorization: Bearer ATS / Cookie: ats / created_by / admin role" 모두 정정 → 실제 인증 함수 `getRequestUser(req)` 재사용. 컬럼명 `architecture_sessions.teacher_id`. 학생 쿠키 `arch_pt` 와 교사 인증 무관 명시 |
| ④ | **Medium** — store 명칭 분기 (`teacherChatTab` ↔ `teacherViewMode`) | §5.2.3 갱신 / §5.2.1.1 cross-link | **`teacherChatTab`** 단일화. `teacherViewMode` 명세 폐기. `mobileTab` 에 `'explain'` 추가만 별도 명시 |
| ⑤ | **Open** — "세션 주인 전용" 배지 vs API qaId-only — 광역 vs 좁은 권한 모호 | §6.1.1 신설 (옵션 표) / §6.1.2 / §6.2 | **옵션 B (좁은)** 채택 — `sessionId` 쿼리 필수. `session.teacher_id == user.id` AND `qa.chapterId ∈ session.chapter_ids` 검증. 자율학습 mode='self' 콘텐츠 노출 0건 |

**진입 조건**: PR-1 즉시 시작 가능. 사용자 추가 결정 0건.
