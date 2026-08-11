# 핸드오프 — architecture 폴리싱 에픽, 마지막 한 조각

작성 2026-08-12 · 앞선 문서 = `docs/HANDOFF-polish-3col-20260811.md`(왜 이 개편이 시작됐는지·확정된 결정 16건이 거기 있다)

## 0. 지금 상태 한 줄

**에픽 6개 중 5개 머지 완료(전부 prod 배포됨). 남은 것 = PR6 하나.**
학생 화면은 3컬럼으로 돌아왔고, 강은 17 → **23강 131문항**이 됐다.

| PR | | 머지 후 달라진 것 |
|---|---|---|
| [#189](https://github.com/nyuoasis-cmd/architecture/pull/189) | 파비콘 + 목업 3개 | 탭 아이콘 |
| [#190](https://github.com/nyuoasis-cmd/architecture/pull/190) | 교안에서 시간 폐기 | 교사: 「N분째」 사라짐 · 「지금 이 칸」을 눌러서 켬 |
| [#191](https://github.com/nyuoasis-cmd/architecture/pull/191) | 하네스 철거 3,533줄 | 교사: 만들기 버튼 2→1개 |
| [#193](https://github.com/nyuoasis-cmd/architecture/pull/193) | 3컬럼 골격 복원 + 색인 강화 | 학생: 5탭 한 컬럼 → **3컬럼**. 라이브러리에 검색·진도·이어하기 |
| [#194](https://github.com/nyuoasis-cmd/architecture/pull/194) | 실습 6강 + 교안 6개 + 「N강」 + MYTURN | 학생: **17강 → 23강** · 「N장」→「N강」 · 내 차례 쿨타임 사라짐 |

현재 수치(전부 데이터에서 센 값): **23강 131문항 · 🚌 견학 131/131 · ⚡ 사례 76 · ✋ 내 차례 12강 · 📋 교안 23/23**
서버 테스트 **132/132** · CI = `l1-fast.yml`(required check `fast`) · `main` 머지 = prod 자동배포.

---

## 1. 🔴 사람이 해야 하는 일 (에이전트가 못 함)

### ① Render 환경변수 확인 — **이거 안 하면 MYTURN 상향이 적용 안 된다**

PR #194 는 한도의 **코드 기본값**을 올렸다. 그런데 Render 에 `MYTURN_*` 를 **손으로 넣어 둔 게 있으면 그 값이 이긴다.**
예전 값(하루 12·쿨타임 300)이 env 에 박혀 있으면 배포해도 학생은 그대로 5분을 기다린다.

Render → architecture 서비스 → Environment 에서 아래 이름이 있으면 **지우면 된다**(지우면 새 기본값이 적용된다):

```
MYTURN_COOLDOWN_SEC   MYTURN_ACTOR_DAILY_CAP   MYTURN_ACTOR_PER_MIN
MYTURN_SHARED_PER_MIN MYTURN_SHARED_DAILY_CAP  MYTURN_PER_MIN  MYTURN_DAILY_CAP
```

새 기본값 = 학생 분당 10 · 하루 300 · 쿨타임 **0** / 공유 분당 10 · 하루 1,000 / 전역 분당 120 · 하루 4,000.
확인 방법: 배포 후 `https://architecture.teachermate.co.kr/health` 의 `classCheck.caps` 를 보면 **실제 적용값**이 그대로 나온다.

### ② prod QA — 23강 실물 보기 (사람 눈)

기계 검증(테스트 132·빌드·Playwright 콘솔 에러 0)은 끝났지만 **사람이 본 적은 없다.** 볼 것 셋:

1. 라이브러리에서 **1강~23강**이 순서대로 뜨는가(실습 강이 12·13·16·19·22·23 자리)
2. 실습 강 하나(12강) 들어가서 📖읽기·🚌견학·✋내 차례·📝퀴즈 4탭이 정상인가
3. ✋「내 차례」 제출 → 판정 → **바로 다시 제출**이 되는가(쿨타임 0 확인 · 실제 AI 호출)

### ③ teardown 잔여 (앞 문서에서 이월)

- GitHub 레포 archive · Render 서비스 중지 · DNS — 앞 문서 §7 참조
- 🚨 **DB 는 안 건드렸다**: `architecture_sessions.mode` 컬럼 · `architecture_harness_submissions` 테이블 존속
  (학생 제출물이 들어 있어 되돌릴 수 없다 — jery 판단 몫). 내림 = `sql/005·006 *.down.sql`

---

## 2. 다음 PR — PR6 (에픽 6/6, 마지막)

두 조각이다. **둘 다 교사 화면**이라 한 PR 로 묶는 게 자연스럽다.

### 조각 A · 「📋 교안」 탭 (결정 14)

지금 교안은 교사 세션 화면의 «이 차시 진행» 패널에 있다. 이걸 **학습 화면 우측 콘텐츠 탭에 「📋 교안」 하나로** 옮긴다.

- 근거 = 목업 `mockups/learn-3col-restore-v1.html` **S5**, `mockups/teacher-lesson-plan-placement-v1.html`
- 정책 = DESIGN-POLICY §9.H-14(교사 화면 = 학생 화면의 **상위집합**) — 별도 사이드바를 두지 않아 폭이 안 늘어난다
- 붙일 자리는 이미 있다: `ContentPanel.tsx` 의 `tabs` 배열이 `teacherPanel` 일 때 `explain` 을 밀어 넣는 그 자리
  (`TAB_LABELS` 에 `lesson: '📋 교안'` 추가 → `getLessonPlan(chapter.id)` 로 렌더)
- 🔑 **기본 열림/닫힘은 prod QA 때 실물 보고 정한다**(앞 문서 §4-3 에서 그렇게 남겼다)
- 🚨 학생에게 새면 안 된다. `teacherPanel` 이 참일 때만 탭이 생긴다는 것을 **계약으로** 박을 것
  (`learnLayoutContract.test.ts` 에 한 줄 추가하는 게 맞다 — 지금 ③이 견학·내 차례 탭을 보는 방식 그대로)

### 조각 B · B형 시연작 (결정 15)

지금 architecture 는 **C형**이다 — 「수업 시연 시작」이 그냥 `/library` 목록으로 이동할 뿐이라 시연 세션도 QR 도 없다.
`shared/demo-screen-qr-inventory.md` 에 «B형 신설 필요»로 등재돼 있다(Wave 2).

- 근거 = 목업 **S6**
- 요지: 진입은 **매번 목록부터**(§9.H-14, 직전 선택으로 직행 금지) → 강 하나 골라 «이 강으로 시연 시작»
  → 신원 유지 · 진행만 초기화 · **학생 진행 불가침** → QR 로 학생이 같은 세션에 들어와 옆에서 따라옴
- 🚨 QR 은 **조건부로 숨기지 않는다** — 미준비면 `disabled` 로 렌더(목업 S6 명시)
- 끝나면 `shared/demo-screen-qr-inventory.md` 의 architecture 행을 갱신할 것(안 하면 부채 목록이 낡는다)

---

## 3. 판단하고 넘어간 것 — 다음 사람이 뒤집어도 되는 자리

| 무엇 | 어떻게 처리했나 | 왜 |
|---|---|---|
| **「종료된 세션」 섹션**(결정 16) | 통째로 지우지 않고 **0개일 때만 숨김** | 지난 수업을 다시 열어 볼 다른 통로가 없다(목업 S7 의 «지난 수업» 화면 미존재). 그 화면이 생기는 날 그리로 옮기면 된다. 한 줄이라 되돌리기 쉽다 |
| **🎮 시연 데모** 실습 6강 | 안 만들었다 | 기존 강도 문항 전부에 있지는 않다(ch13 은 6문항 중 3개). 탭은 데이터가 있을 때만 켜지므로 화면은 정상이고 교안도 시연을 안 가리킨다. 넣으려면 강당 1개씩 6개(각 ~130줄) |
| **`min-h-11`(44px)** | 그대로 뒀다 | DESIGN-POLICY 는 모바일 48px 을 요구하는데 **앱 전역이 이미 44px**. 주변과 맞췄다 — 앱 전역 부채라 별건 |
| **교사 산문 속 한도 숫자** | 새 값으로 교체했다 | 「하루 12회·5분 쿨타임」이 6개 교안에 박혀 있었고 PR #194 로 **사실이 아니게 됐다**. 존치 여부가 미결이 아니라 오류가 됐으므로 고쳤다 |

---

## 4. 🚨 알아 둘 사실 — 「내 차례」에는 돈 천장이 없다

`CHAT_MONTHLY_BUDGET_USD`($173)는 **챗봇 전용**이다. `registerUsageCost` 가 `chat-service.ts` 안에만 있어서
「내 차례」(`/api/vibe/my-turn`) 지출을 **한 푼도 세지 않는다.**

즉 지금 이 라우트의 상한은 **호출 한도(MYTURN_*) 그것뿐**이다. 포화 시 상한 ≈ $16/일(≈$340/월).
목업 S9 의 «월 예산 가드를 올려야 한다»는 이 코드에선 **틀린 서술**이다 — 올릴 가드가 애초에 이 라우트에 안 걸려 있다.

**미결**: 「내 차례」에도 별도 월 예산 가드(`MYTURN_MONTHLY_BUDGET_USD`)를 신설할지.
2026-08-11 결정 때 선택지로 제시했고 jery 는 «한도만 S9 안대로»를 골랐다 — 가드 신설은 **하지 않기로 한 게 아니라 고르지 않은 것**이다.

---

## 5. prod QA 잔여 (개편과 별개, 앞 문서에서 이월)

- **#2** 데모 103개 볼 입구 없음 (`/demos-preview/showcase` 가 어디에서도 링크되지 않음)
- **#6** `~/scripts/open-chrome.sh` 가 실패를 성공으로 보고 (WSL interop 꺼짐 — exit 126 인데 `OPENED_WITH=chrome` 출력)
- **#7·#8** 목업 HTML `<meta charset>` 누락 (`vibecoding-ch13q01-learn.html` 등)

---

## 6. 이 레포에서 일할 때 알아야 할 것

### 계약이 먼저 말을 건다

이 레포의 테스트는 «통과/실패»가 아니라 **무엇이 왜 잘못됐는지**를 한국어로 말한다. 새 강을 만들다 막히면
대개 계약이 이미 답을 적어 두고 있다. 특히:

| 계약 | 무엇을 막나 |
|---|---|
| `chapterOrderContract` ①③ | 만들어 놓고 진열에 안 넣은 강 / 진열엔 적혔는데 안 만든 강 |
| `chapterOrderContract` ⑥ | 화면이 **속 이름표**(`chapter.id`)를 「N강」으로 찍는 것 |
| `learnLayoutContract` ② | 학습 화면 형판이 **다시 둘로 갈리는 것**(이 에픽이 시작된 원인) |
| `lessonPlanContract` ⑯ | 강은 있는데 교안이 없는 상태 → **강을 늘리면 교안이 같은 PR 에 와야 한다** |
| `extrasContract` ⑨ | 장의 문항 «일부만» 견학이 있는 반쪽 상태 |
| `qaCountCopy` | 화면에 문항 수·강 수를 **손으로 적는 것** |

### 숫자는 손으로 적지 않는다

문항 수·강 수·견학 수 — 전부 데이터에서 센다. 이 문서의 숫자도 «적힌 순간의 관측»이다.
다시 세는 법:

```bash
cd server && npx tsx -e "
const R='../client/src/data/';
const {CHAPTERS,QA_STUBS}=require(R+'qa-stubs');
const {ALL_EXTRAS}=require(R+'learn-extras');
const e=Object.values(ALL_EXTRAS);
console.log(\`강 \${CHAPTERS.length} · 문항 \${QA_STUBS.length} · 견학 \${e.filter(x=>x.tour?.length).length}\`);
"
```

### 새 강을 만들 때 손대야 하는 자리 (PR #194 에서 실측한 목록)

1. `client/src/data/vibe-chNN.ts` — 챕터·문항·extras·퀴즈 (정본)
2. `client/src/data/vibe-stubs.ts` — import + 4개 배열에 등록
3. `client/src/data/chapter-order.ts` — 진열 선언에 번호 넣기
4. `client/src/data/lesson-plan-chNN.ts` + `lesson-plans.ts` 등록 (계약 ⑯)
5. `server/src/data/vibe-chapter-content-chNN.ts` — 🚨 **손으로 적지 말 것.** 클라이언트에서 기계 추출한다
6. `server/src/data/vibe-quiz-answers-chNN.ts` + `vibe-quiz-answers.ts` 등록
7. `server/src/data/vibe-chapter-content.ts` — `VIBE_CHAPTER_META` + `VIBE_QA_CONTEXTS`
8. ✋ 내 차례가 있으면 `server/src/lib/vibe-my-turn.ts` 의 `MY_TURN_TASKS` (슬롯 key·label 이 클라와 1:1)

5번 추출 스크립트는 PR #194 작업 중 썼고 임시 경로에 있었다 — 다시 쓰려면 `CHNN_CHAPTER`/`CHNN_QAS` 를
require 해서 `QaContext[]` 로 뽑아 쓰면 된다(20줄).

### 작업 규칙

- **본체 `/home/claude/architecture` 는 `main` 고정 + 항상 깨끗.** AO 가 이걸 전제로 돈다
- 파일 만들 때 **본체 절대경로 금지** — 워크트리 안에 쓴다
- jery 는 비개발자 — **git·운영 잡무는 에이전트가 처리하고 결과만 보고**
- 🚨 **파급성 큰 결정(비용·한도·모델)은 정보를 먼저 주고 사용자가 고르게 한다.** 이 에픽에서 실제로 한 번 걸렸다
  (MYTURN 공유/전역 한도 — 결정 11 이 학생 몫만 정해 놔서 계약이 역전을 잡았고, 선택지 3개로 물었다)
