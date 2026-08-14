# 핸드오프 — 시연작 철거(완료) + 교사 화면 §4/§4-A 정합화(착수 전)

작성 2026-08-14 · 브랜치 `architecture-qa-260814` · 워크트리 `.orca/worktrees/architecture-qa-260814`

---

## 0. 30초 요약

1. **🎬 시연작 철거는 끝났다**(코드 335줄 삭제, 빌드·서버 테스트 127 초록). **아직 커밋 안 했다.**
2. 남은 일은 **교사 화면 두 개를 정책대로 맞추는 것**뿐이다 — 수업 목록(§4) 14건 · 수업 상세(§4-A) 11건.
3. 새 기능은 없다. **전부 기존 화면을 표준에 맞추는 작업**이고, 레퍼런스 구현이 ai-app-builder 에 있다.
4. 착수 전 **결정 4건**(§5)을 jery 에게 받아야 한다.

---

## 1. 이번 세션에서 한 일 — 시연작 철거

### 무슨 일이 있었나

2026-08-12 에 `/teacher/demo`(교사 대시보드 → 「🎬 시연작」 → 강 고르기 → **새 시연 세션 생성** → 학습 화면 + 시연 바)를 「B형 시연작 신설」로 지었다. 그런데 이 앱엔 **이미 같은 일을 하는 것이 수업 안에 있었다** — 수업 현황 상세의 「👀 학생 화면 미리 보기」(`/library?sessionId=` → `/learn/:sessionId?qa=…&role=teacher`).

결과로 **같은 일을 하는 입구가 수업 안과 밖에 둘** 생겼고, 밖의 것이 이런 것들을 만들었다:

- 누를 때마다 참여 코드가 붙은 **새 방**이 하나씩 생겨 「내 세션 관리」 목록에 수업과 나란히 쌓였다(닫는 버튼을 안 누르면 영구 잔존)
- `chapterIds: [고른 강 하나]` 라 **시연 중에 다른 강으로 갈 수 없었다** — 학생은 갈 수 있는데
- 시연 바의 「시연 끝내기」가 **`endSession()`** 을 불렀다

🔑 **진원**: `shared/demo-screen-qr-inventory.md` 가 architecture 를 「C형 → B형 신설 필요」로 **오분류**했다. 그 지시를 따라 지은 것이다. 인벤토리는 2026-08-14 정정했고, **판정 기준 자체도 고쳤다** — 「학생과 같은 세션·같은 화면을 교사가 밟는가」가 B형이고, **전용 세션·전용 QR 은 B형의 조건이 아니다.** 이 문장이 없으면 다른 앱에서 같은 오분류가 난다.

### 지운 것 (커밋 대기)

| 파일 | |
|---|---|
| `client/src/pages/TeacherDemoPage.tsx` | 삭제 (133줄) — 시연 세션을 만들던 곳 |
| `server/src/lib/demoModeContract.test.ts` | 삭제 (113줄) — 그 구조를 지키던 계약 |
| `client/src/App.tsx` | `/teacher/demo` 라우트 + import |
| `client/src/pages/TeacherDashboardPage.tsx` | 「🎬 시연작」 버튼 + 안내 문구 (+ `Link` import) |
| `client/src/pages/LearnPage.tsx` | `DemoBar`(QR·「시연 끝내기」) · `isDemoMode` · `demo=1` 파라미터 |
| `CLAUDE.md` | 「시연작 = 학생 화면 미리 보기 그 자체다. 밖에 또 만들지 말 것」 + 경위 기록. 서버 테스트 수 128 → 127 |
| `shared/demo-screen-qr-inventory.md` | architecture 행 + B형 판정 기준 정정 (**마스터 레포. 별도 커밋**) |

검증 완료: `npm run build` ✅ · `cd server && npm test` → **127 pass / 0 fail** ✅

🚨 **되살리지 말 것.** 「시연작이 없다」고 읽히거든 `CLAUDE.md` 의 🎬 항목을 먼저 읽을 것. 지금 있는 것이 시연작이다.

---

## 2. 남은 일 A — 수업 목록 화면 §4 정합화 (14건)

기준 `shared/BUILDER-UX-POLICY.md §4`(D안, 2026-04-17 확정) · 레퍼런스 `ai-app-builder/client/src/components/sessions/{SessionsHeader,SessionCard,SessionsEmptyState}.tsx` + `pages/TeacherSessionsPage.tsx`
대상 `client/src/pages/TeacherDashboardPage.tsx` · `client/src/components/teacher/SessionCard.tsx`

| # | 할 일 | 등급 |
|---|---|---|
| B-1 | **「세션」 용어 전면 제거** — 내 세션 관리→**내 수업** / +새 세션 만들기→**수업 만들기** / 종료된 세션→**종료됨** / 「이 세션을 삭제할까요?」→「이 수업을…」 | 🔴 §4 명시적 금지 |
| B-2 | 헤더를 §4 표준 2줄 블록으로 — 3줄 산문 → 「**5개 수업 · 진행 중 2개**」 한 줄 (`SessionsHeader.tsx` 그대로) | 🟠 |
| B-3 | 컨테이너 `max-w-6xl` → **`max-w-4xl`**(896px) | 🟠 |
| B-4 | **세션 list API 확장** — `student_count` · `activity_count` · `recent_students` · `last_activity` (`server/src/routes/sessions.ts:184`) | 🔴 B-5·B-6 선결 |
| B-5 | **통계 3셀** 신설 — 참여 학생 / 읽은 문항 / 진행 중. §4 「통계 영역 생략 불가」 | 🔴 |
| B-6 | **최근 활동 피드** 신설 — 아바타 4개 + `+N` 뱃지 + 최근 1건 + 상대 시간 | 🔴 |
| B-7 | 카드 전체 클릭 → 상세 이동 (`role="button"` + Enter/Space). 「세션 진행으로」 버튼 제거 | 🟠 |
| B-8 | 상태 pill — 회색 stone → **emerald-50 / #059669 / dot 6px + `animate-pulse`** | 🟠 |
| B-9 | 형태 토큰 — 카드 radius 24px→**12px**, 코드 뱃지 검정 큰 블록→**82×50 rounded-xl bg-stone-50** | 🟠 |
| B-10 | 종료·삭제 확인을 **인라인 펼침 → 모달**(§4 「아코디언/펼침 금지」, §6) | 🟠 |
| B-11 | 종료 카드에서 QR·삭제 버튼 감춤, opacity 60% → **55%** | 🟡 |
| B-12 | 빈 상태 — 점선 박스 한 줄 → **아이콘 44px + 2줄 + 「첫 수업 만들기」**(`SessionsEmptyState.tsx`) | 🟠 |
| B-13 | `lib/format.ts` `formatRelativeTime` 이 §4 표 + **미래 시각 clamp**(「방금 시작」/「방금」)를 따르는지 점검 | 🟡 |
| B-14 | `BUILDER-UX-POLICY §11` 에 **architecture 체크리스트 절 추가** (지금은 §2·§3 에만 등재) | 🟠 |

### `activity_count` / `last_activity` 매핑 제안 (§4 표에 architecture 행이 없다 — 함께 등재할 것)

| 항목 | architecture |
|---|---|
| `student_count` | `architecture_participants` DISTINCT (이미 `participant_count` 로 있음) |
| `activity_count` | `architecture_progress` 에 행이 있는 DISTINCT `participant_id` (들어오기만 한 학생 제외) |
| `last_activity` | `target_title` = 문항 title / `action` = 「퀴즈 완료」(quiz_score 있음) 또는 「읽음」 / `timestamp` = `read_at` |

---

## 3. 남은 일 B — 수업 상세 화면 §4-A 정합화 (11건)

기준 `BUILDER-UX-POLICY §4-A` · 대상 `client/src/pages/TeacherSessionPage.tsx` · `client/src/components/teacher/ParticipantList.tsx`

| # | 할 일 | 등급 |
|---|---|---|
| C-1 | 🚨 **「세션 종료」가 확인 없이 즉시 실행된다**(`TeacherSessionPage.tsx:169`). §6 모달 확인 필수 — `confirm()` 도 아니고 아예 확인이 없어 더 나쁘다 | 🔴 |
| C-2 | **뒤로 링크 「← 내 수업」 없음** — §4-A 「뒤로 링크 없이 브라우저 뒤로가기에만 의존」 금지 | 🔴 |
| C-3 | **통계 그리드 3열 없음** — 참여자 수 pill 하나뿐. §4-A 「통계에 참여자 수 누락」 금지 계열 | 🔴 |
| C-4 | 컨테이너 `max-w-6xl` → **`max-w-[900px]`** | 🟠 |
| C-5 | 헤더 — `Live Session` eyebrow + 36px 제목 → **22px semibold + 상태 뱃지** | 🟠 |
| C-6 | 상태 뱃지 없음 → §4 카드와 동일(dot + 텍스트) | 🟠 |
| C-7 | 코드 표기 — 32px 검정 큰 블록 → §4 카드와 동일한 코드 뱃지(14px) | 🟠 |
| C-8 | 학생 목록을 §4-A 표준 행으로 — `ParticipantList` 가 카드 나열 + 진도바. 표준 = 컨테이너 1개 + 행 + **상태 뱃지(완성/진행 중/대기)** | 🟠 |
| C-9 | 용어 — 「세션 종료」 → **「수업 종료」**, `Live Session` eyebrow 제거 | 🔴 §4 「세션」 노출 금지 |
| C-10 | 「이 학생 이어주기」(§4-A, §3 이름 이어하기 안전장치) — **구현 권장**. 이 앱에 필요한지 판정부터 | 🟡 판정 |
| C-11 | 빈 상태 문구 정리 — 「아직 참여자가 없습니다」(`ParticipantList.tsx:12`) | 🟡 |

✅ 이미 맞는 것: QR 진입점(우측 `QrInline` + 「📱 QR 전체화면」) · 자동 갱신 6초(§4-A 5~30초 범위 내)

🔑 **「👀 학생 화면 미리 보기」 버튼은 여기 그대로 둔다.** 그것이 시연작이다(§1). 문구만 결정 대기(§5-4).

---

## 4. PR 쪼개기

| PR | 범위 | 비고 |
|---|---|---|
| **PR0** | 시연작 철거 (이미 되어 있음, 커밋만) | 마스터 레포 `demo-screen-qr-inventory.md` 는 **별도 커밋** |
| **PR1** | B-1 + C-9 (용어) | 가장 싸고 명시적 위반. 먼저 친다 |
| **PR2** | C-1 · C-2 · C-3 (상세의 🔴 3건) | 종료 확인 없음이 최우선 |
| **PR3** | B-4 (서버 API 확장) | B-5·B-6 선결 |
| **PR4** | B-2·B-3·B-5~B-13 (목록 카드·헤더) + B-14 | 목업대로 |
| **PR5** | C-4~C-8 · C-11 (상세 폴리싱) | |

---

## 5. 착수 전 결정 대기 — jery

1. **통계 3셀 라벨** — 「참여 학생 / 읽은 문항 / 진행 중」으로 잡았다. aab 는 「만든 앱」인데 이 앱엔 만드는 물건이 없어 문항 기준으로 바꿨다.
2. **활동 피드 문구** — 「김민수님이 "서버는 왜 필요할까" 퀴즈 완료」
3. **삭제 버튼 자리** — 종료된 수업에만 (지금은 진행 중 카드에도 있다)
4. **「👀 학생 화면 미리 보기」 문구** — 용어 정본(`ui-glossary §H`)은 「시연작」 단일인데, 이 버튼은 **2026-08-11 prod QA(신입샘 t2)에서 「시연」이 교사에게 두 가지로 읽혀** 일부러 지금 문구로 바꾼 것이다(`TeacherSessionPage.tsx:113` 주석). 실사용 관찰로 내린 결정을 용어 규칙으로 되돌릴지 말지.
5. **C-10 이어주기** — 이 앱에 필요한가(학생이 기기를 바꾸는 상황이 실제로 있는가).

---

## 6. 목업

`mockups/teacher-sessions-list-v1.html` — CDN 없이 그대로 열린다.

```bash
cd mockups && python3 -m http.server 5199 --bind 127.0.0.1
# → http://localhost:5199/teacher-sessions-list-v1.html
```

상단 탭 4개: **제안(To-Be)** / **빈 상태** / **지금(As-Is)** / **변경 14건**(승인용 표 + PR 쪼개기 + 결정 대기).

🗑️ `teacher-session-detail-v1.html` 은 **삭제했다** — 존재하지 않는 시연 구조를 그린 것이었다. §4-A 상세 목업은 필요하면 새로 그린다.

---

## 7. 검증

```bash
npm run build                 # client vite + server tsc
cd server && npm test         # 127 pass 기대
```

CI = `l1-fast.yml`, `main` 보호(required check `fast`). `main` 머지 = prod 자동배포.

---

## 8. 착수 전 읽을 것

- `CLAUDE.md` 🎬 항목 — **시연작을 또 만들지 않기 위해**
- `shared/BUILDER-UX-POLICY.md` §4 · §4-A · §6 · §9
- `shared/DESIGN-POLICY.md` §9.H-14 (v1.10 진입구 = 수업 현황 상세 · v1.11 수업 안의 작품)
- 레퍼런스 코드 `ai-app-builder/client/src/components/sessions/`
