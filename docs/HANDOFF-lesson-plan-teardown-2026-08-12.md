# 핸드오프 — 📋 교안 철거 + 설명 노트로 흡수 (구현 착수용)

> 용도: 새 세션 구현 입력 정본. 2026-08-12 jery 결정.
> 대상: architecture (`architecture.teachermate.co.kr`, 라이브). 기본 브랜치 **`main`** = 머지 시 prod 자동배포.
> 앞 단계: `/brainstorm` 3모델(Claude·Codex·GLM) 완료 → 전문 = `~/.claude/skills/brainstorm/runs/brainstorm-architecture-lesson-plan-2026-08-12.md`
> 입력이었던 진단 핸드오프 = `docs/HANDOFF-brainstorm-lesson-plan-2026-08-12.md` (실측 근거는 거기 있다)

---

## 0. 한 문장

**「📋 교안」 23강 164칸을 앱에서 걷어낸다. 그 안에서 설명 노트가 못 가진 3종만 건져 옮기고, 나머지는 버린다.**

---

## 1. 확정된 결정 (jery, 2026-08-12 — 뒤집지 말 것)

| # | 결정 | 비고 |
|---|---|---|
| D1 | **「📋 교안」 탭 제거** | 데이터·화면·계약 전부 |
| D2 | **리허설 신설 안 함** | 🎬 시연작(`/teacher/demo`)이 이미 그 일을 한다. 이름표만 다른 중복이었다 |
| D3 | **종이·인쇄물·A4 치트시트 전부 폐기** | 오프라인이 필요한 설계로 만들지 않는다 |
| D4 | **164칸(활동 지시)은 버린다** | P4(수업 흐름은 교사가 정한다)와 충돌 |
| D5 | **설명 노트는 살린다 — 64 → 131 확장** | 교사가 **공부하기 위한** 물건이라는 게 존치 이유 |
| D6 | 교안 내용 중 **노트를 보강하는 것만 덧붙이고, 아니면 삭제** | 판정 결과는 §3 |
| D7 | 자원은 **학생 UX 우선** | 3모델 만장일치. 「둘 다 하자」는 답이 아니다 |

「다른 교사가 몇 명 언제 쓰는가」는 jery가 «신경 쓸 것 아니다»로 닫았다 — 다시 묻지 말 것.

---

## 2. 🔴 착수 전 jery에게 물어야 할 것 (미결 1건)

**`pitfalls` 83줄 중 `misconception`과 겹치는 것을 버릴 것인가, 전부 살릴 것인가.**
- 겹침 실례: ch09 pitfalls *"마이크로서비스를 «최신=우월»로 받는다"* ↔ ch09_q01 misconception *"작게 쪼갠 구조가 무조건 더 현대적이라 보기 쉽지요"*
- **버리면** 노트가 같은 말을 두 번 안 한다. **살리면** 누락 위험이 0이지만 노트가 중복으로 두꺼워진다.
- 기본값 제안 = **버린다**(겹치는 것만). 겹치지 않는 pitfalls는 §3의 흡수 대상에 포함.

이 답 없이도 PR1의 §3-A(제거)는 착수 가능하다. §3-B(흡수) 범위만 이 답에 걸린다.

---

## 3. 판정 — 무엇을 버리고 무엇을 옮기는가 (2026-08-12 코드 실측)

### 3-A. 버린다

| 교안 항목 | 규모 | 버리는 이유 |
|---|---|---|
| `phase`·`title`·`studentDoes` | 164칸 | 활동 지시. 앱이 수업 흐름을 정하는 일(P4 위반) |
| `goal` | 23개 | 노트에 문항 단위 `goal` 필드가 이미 있다 |
| `qaIds` | 123개 | 노트 `relatedQas`가 대신한다 |
| `wrapUp` 중 진행 예고 | 23개 중 대부분 | *"다음 시간에는 …로 갑니다"* = 진행 지시. 단 장간 연결 정보는 3-B②로 건진다 |
| `pitfalls` 중 misconception 중복분 | 83줄 중 다수 | §2 미결 |

### 3-B. 흡수한다 — 노트가 **구조적으로** 못 가진 3종

**① 실제 사고 사례 — 13개 강에 존재**
grep 실측: ch03·04·08·09·10·11·12·13·15·17·19·20·23 (`실제로|난 일|그날|멈춘|터졌`)
- 9강 *"160명이 동시에 저장을 눌러 저장이 멈춘 날 — 수업 중에는 서버를 키우는 것밖에 할 수 없었다"*
- 5강 *"빌드는 초록인데 꾸밈이 하나도 안 입혀졌던 일"* · *"창구는 열려 있었는데 서로 아는 사이가 아니었다"*
→ 노트 `realLife`는 일반론(*"작은 사내 도구는 한 덩어리로 충분할 수 있고…"*)이라 확실히 약하다.
→ **흡수 자리 = `realLife`**

**② 장간 연결**
- 9강 *"캐시가 4장·6장에서도 나왔습니다. 세 번째라 지루해하면 여기서는 «언제 비우나»가 새로운 것"*
- 5강 *"이 구분이 다음 장(창고)과 8장(길)의 손잡이가 됩니다"*
→ 문항 단위 노트가 **원리적으로** 가질 수 없는 정보.
→ **흡수 자리 = `note`**

**③ 🚌 견학 운영 요령 — 노트 131개 어디에도 없다**
- 1강 *"«제대로 안 보여요»가 나옵니다. 기기·버전마다 화면이 달라서 정상입니다. 보인 대로 적으라고 하세요"*
- 1강 *"차이가 안 느껴진 학생도 그대로 적게 합니다 — 결과를 맞추라고 하면 다음 견학부터 지어냅니다"*
→ 견학은 이 앱 고유 기능인데 노트에 운영 얘기가 0.
→ **흡수 자리 = `demoTip`**

### 3-C. 🔑 스키마는 건드리지 않는다
`teacherExplainBlockSchema`(`server/src/data/teacher-explain/types.ts`)에 **새 필드를 추가하지 않는다.**
기존 `realLife`·`note`·`demoTip`을 쓴다 — 그래야 PR2의 신규 67개 작성이 싸진다.
길이 상한 주의: `realLife` 250자 · `note` 200자 · `demoTip.*` 각 300자.

---

## 4. 에픽 분할 (전체 3 PR)

> §5.2 보고 의무: 각 PR 시작 전 「이번 PR = 에픽 N/3, 잔여 Y」, 머지 전 「머지 후 사용자 입장에선 Z만 적용」을 보고할 것.

| PR | 내용 | 머지 후 사용자 입장에서 바뀌는 것 |
|---|---|---|
| **1/3** | §3-B 흡수(기존 노트 64개 보강) + §3-A 제거(교안 탭·데이터·계약 전면) | 교사 화면에서 「📋 교안」 탭이 사라진다. 설명 노트가 두꺼워진다 |
| 2/3 | 설명 노트 ch11~ch23 **67개 신규** (교안에서 건진 재료 포함) | 11~23강에서 «불러올 문항 정보가 올바르지 않아요» 고장 문구 대신 노트가 뜬다 |
| 3/3 | 학생 UX sev4 — 본문을 다 읽어도 다음 문항으로 갈 문이 없다 | 학생이 본문 끝에서 막히지 않는다 |

🚨 **PR1에서 흡수와 제거를 반드시 같은 커밋에 묶는다.** 분리하면 그 사이에 내용이 사라진다.

---

## 5. 제거 대상 전수 (grep 실측 — 이 목록이 빠지면 헤맨다)

### 5.1 삭제할 파일
```
client/src/data/lesson-plan-ch01.ts … ch23.ts     (23개 · 164칸)
client/src/data/lesson-plans.ts                    (등록부, 파생)
client/src/components/teacher/LessonPlanPanel.tsx  (181줄)
server/src/lib/lessonPlanContract.test.ts          (계약 ①~⑱)
```
🔑 삭제 전에 **§3-B 3종을 먼저 뽑아 노트에 넣을 것.** git 이력에 남지만 되찾는 비용이 든다.

### 5.2 수정할 파일 (교안 참조를 걷어낸다)
```
client/src/components/learn/ContentPanel.tsx    ← 탭 구성 · hasLessonPlan() · teacherPanel 게이트
client/src/pages/TeacherSessionPage.tsx         ← F2 문 이름(「학생 화면 미리 보기」 안내문)
client/src/store/learn-store.ts                 ← contentTab 에 'lesson' 잔존
client/src/lib/session-client.ts
server/src/routes/sessions.ts:345               ← 「교안의 칸이 가리키는 문항 도달 수」 주석·용도
server/src/lib/session-progress.ts:5            ← 같은 주석
server/src/lib/learnLayoutContract.test.ts      ← ⑦ 의 ['lesson','📋 교안'] 항목 · hasLessonPlan 검사(131행)
server/src/lib/sessionProgressTally.test.ts     ← 「이 차시 진행」 교안 전제
server/src/lib/chapterOrderContract.test.ts     ← 교안 참조 확인 필요
```

### 5.3 🚨 같이 폐기해야 할 계약
- `lessonPlanContract.test.ts` **⑯ 「모든 장에 교안이 있다 — 장을 늘리면 교안도 따라와야 한다」**
  → 이걸 안 지우면 **새 장을 만들 때마다 CI가 없는 교안을 요구한다.**
- 같은 파일 ⑫ ⑬ ⑰ ⑱ 도 교안 전제라 함께 소멸.
- `learnLayoutContract.test.ts` ⑦ 에서 `'lesson'` 탭 항목 제거 — **단 ⑦ 자체(교사 전용 탭이 학생에게 새지 않는다)는 남긴다.** 설명 노트가 그 게이트를 계속 쓴다.
- CLAUDE.md 「현재 단계」의 교안 문단(📋 23/23·계약 ⑯⑫⑬ 언급)을 같은 PR에서 갱신할 것.

---

## 6. 🚨 착수 전 환경 (실측 2026-08-12)

이 worktree는 **`node_modules`가 비어 있다**(`server/` 에서 `tsx` 미설치 → 전 테스트가 `ERR_MODULE_NOT_FOUND` 로 죽는다).
**이건 실제 실패가 아니다.** 착수 첫 명령:
```bash
cd /home/claude/architecture/.orca/worktrees/architecture-qa-260812
npm install && (cd server && npm install)
cd server && npm test        # 베이스라인 확보 후 착수 (기준: 140개)
```
베이스라인을 못 잡은 채 «테스트 통과» 를 보고하지 말 것(QA 진실성 게이트).

---

## 7. 뒤집지 말 전제

| # | 전제 |
|---|---|
| P1 | 다른 IT 비전공 교사가 이 앱으로 수업한다 |
| P2 | 북극성 = 비전공자도 IT 전체 그림을 30분 안에 이해한다 |
| P3 | **시간 표기 금지** — 칸별 분·「N분째」·총 소요시간. 계약 ④⑤가 지키던 것이라 교안과 함께 사라진다. **되살아나지 않게 다른 곳에 대체 계약이 필요한지 검토할 것** |
| P4 | 수업 흐름은 교사가 정한다. 앱이 진행을 지시하거나 페이싱하지 않는다 |
| P5 | 교사 화면 = 학생 화면의 **상위집합**. 교사 전용은 `ContentPanel` 의 `if (teacherPanel)` 한 블록 안에서만 |
| P6 | 책 『기술노트』 차용 0% |
| P7 | 동그라미 숫자(①②③) 금지 — 줄머리 목록은 `1)` |

---

## 8. 브레인스토밍에서 **기각된** 안 (되살리지 말 것)

- 목업 M1·M2·M3 (`mockups/teacher-tab-merge-spec-v1.html` · `teacher-lessonplan-ux-fix-v1.html` · `lesson-plan-two-kinds-v1.html`) — 전부 「고쳐서 살린다」 노선. **이번 결론과 상충**
- 큐시트·코치마크·상태 바·알림 트리거 — **전부 P4 위반**(앱이 페이싱한다)
- AI 챗봇으로 교안 대체 — 고장 난 원문을 확률적 답변으로 포장하는 안
- 서브 디바이스 리모콘 뷰 — 실시간 동기화 신규 구축, 자원 경쟁에서 최악
- 리허설 신설 (D2)

---

## 9. 참고 경로

```
설명 노트   server/src/data/teacher-explain/{types.ts,index.ts,chNN_qNN.ts}   (현재 64개 = ch01~ch10)
            client/src/components/learn/TeacherExplainPanel.tsx  (347줄 · 인쇄 버튼 213행)
교안        client/src/data/lesson-plan-ch01…ch23.ts             (164칸: 학습66·견학37·내차례12·퀴즈8·열기23·정리18)
            pitfalls 83줄 · wrapUp 23개
시연작      client/src/pages/TeacherDemoPage.tsx · server/src/lib/demoModeContract.test.ts
QA 증거     ~/.claude/projects/-home-claude/memory/sinipssaem/audit/sinipssaem-architecture-lessonplan-2026-08-12-baad/
            ~/.claude/projects/-home-claude/memory/saenaegi/audit/saenaegi-architecture-first-2026-08-12-1e34/
정책        /home/claude/shared/DESIGN-POLICY.md §9.H-14
```
