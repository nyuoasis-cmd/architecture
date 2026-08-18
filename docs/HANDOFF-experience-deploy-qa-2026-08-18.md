# HANDOFF — 체험 재구조화 배포·QA·용량 산정 (2026-08-18 저녁)

받는 사람: 다음 세션 (architecture). 앞선 문서: `HANDOFF-experience-restructure-2026-08-17.md`(밤샘 지시서) ·
`REPORT-overnight-experience-2026-08-18.md`(밤샘 결과 + 배포 후기). 이 문서는 **그 뒤에 일어난 전부**다.

## 0. 지금 상태 한 줄

**체험 재구조화가 prod 에 떠 있고(main=24705db 이후), QA 6칸 중 5칸이 🟢, 남은 1칸(용량 산정)은 🟡 다.**
§2 의 결정(R7 처방)은 **끝났다 — 2번 «가드 끄기» 적용 완료**(§6). 그래서 §2·§4 는 «그때의 관측»으로 읽고,
지금 상태는 **§6·§7** 을 볼 것. 남은 병목은 R7 이 아니라 R9·R11(부하 실측 공용 하네스 부채)이다.

## 1. 오늘 배포된 것 (전부 main 머지·CI 초록·prod 확인)

| PR | 무엇 | 비고 |
|---|---|---|
| #249 | 체험 재구조화 에픽 2~5 통합(밤샘 #237~#248) | prod 스모크 8/8 · 낡은 #230 닫음 |
| #250 | 크롤러 비용 게이트에 /api/lab/* 추가 | PR #211 유형 재발 방지 |
| #251·#252 | **trust proxy 2** — ip: 신원이 요청마다 새 통이 되던 결함 | 실측: 미설정→10.x / 1→CF엣지 / 2→공인IP ✅. true 금지(XFF 사칭) |
| #253 | 크롤러 시드 — 체험 앵커 13화면 | 재크롤 47화면·472클릭 전부 PASS |
| #254 | 스모크 축2-b AI 모드(PRECLASS_AI_ROUTES) | 폐쇄 목록 6종 각 1회 + aiusage 보고 |
| #255 | 스모크 시크릿 자체 로드(env 우선) | 축2 러너 호환(brand 선례) |
| #256 | health `tokenCaps` + 스모크 caps 중계 | 출력 상한 런타임 실효값(§1-C) |
| #257 | health caps 를 §1-E {value,scope,audience} 구조로 | R6/R7 판정 요건 · 통제값 변화 0 |

DB: `sql/010_lab_artifacts.sql` **prod 적용 완료**(계보 저장→되읽기 실증, QA 행 청소 0행).
DATABASE_URL 은 `~/.claude/.secrets/architecture-real-flow-qa.env` 에 있다 — psql 은 **PG\* 환경변수로**
(argv 유출 사고 예방책, 등록부 realflow evidence 참조).

## 2. 🔴 결정 대기 — 용량 산정 판정과 처방 3옵션

30명 승인 실행(`prodqa architecture before-class --students 30 --approve`, jery 승인 2026-08-18) 완주 결과:

- **병목 = R7 앱 분당 캡**: `MYTURN_PER_MIN` 120/분(전역·app·all) ÷ 학생 1명 분당 20회(§1-C 최악 버스트
  유도) → **수용 6명**. 30명 최소 600/분 · 🟢(2배 여유) 기준 1200/분.
- 그 외: R8 앱 AI 큐 **68명 🟢**(동시 4+대기 64, 최악 버스트 하한) · R10 SSE/WS **N/A**(경로 없음) ·
  R12 저장소 **N/A**(텍스트뿐) · 축6 공유 quota 🟢(단독 수업 전제 — 같은 키 지문 de1d047a 를 11개 앱이 공유).
- **미측정 3개(무한대로 안 접음)**: R3 입력 TPM(토큰 사용량 원장이 앱에 없음 — recordsTokenUsage 전부
  false 가 사실) · R9 DB pool · R11 서버 처리량(부하 실측 공용 하네스 부채 — QA-POLICY §5, 전 앱 공통).

**처방 — 셋 중 하나를 jery 가 고른다** (러너도 에이전트도 캡을 자동 변경하지 않는다):
1) 수업 전 `MYTURN_PER_MIN` 상향(Render env 무배포, 예: 1200) → 수업 후 원복. **이 캡의 설계 의도가
   원래 이것**(«대규모 수업 전 상향» — vibe-my-turn 코드 주석).
2) `MYTURN_GUARD_ENABLED=0` 으로 내 차례 가드를 끔 — ✋ 탭은 이미 철거됐고 라우트만 존치라 실호출이
   0에 가깝다. capPolicy=none 이 되면 R7 은 «전역 캡 없음 → R1·R2(제공자 한도) 인계»로 판정된다.
3) my-turn 라우트·데이터 소거 에픽(밤샘 REPORT 의 «별도 소거 PR 제안»과 같은 건) — 근본 정리.

결정 후 재판정: `cd /home/claude && node shared/qa/prodqa/prodqa.mjs architecture before-class --students 30 --approve`
(💸 축2-b 가 폐쇄 목록 6종을 실호출한다 — 회당 제공자 호출 7회).

## 3. QA 기반 시설 — 오늘 새로 선 것 (정본 위치)

- **전수 크롤 표준 파이프라인**: `shared/qa/crawler/manifests/manifest.architecture.mjs` 신설(앱-로컬
  크롤러에서 포팅 — 드리프트의 뿌리가 «경로 규약 불일치»였다). 실행:
  local dev 기동(server: QA_AUTH_ENABLED=true PORT=3003 · client: 5176) 후
  `QA_CLIENT_URL=http://localhost:5176 QA_API_BASE=http://localhost:3003 node shared/qa/crawler/run.mjs --app architecture`.
  앱-로컬 크롤러(`architecture/qa/crawler/`, 클릭 예산 더 큼)는 보조로 병존. **prod 블라인드 크롤 금지.**
- **class-check 일습**: 인증서 `shared/qa/class-check/certs/architecture.json`(S1~S5, files 11개 해시 결속,
  requireLiveMatch) · 폐쇄 목록 `manifests/ai-routes.architecture.json`(재구조화 반영 6종 — lab-voice 포함,
  /api/chat 제거) · 원장 `manifests/capacity.architecture.json`. **서버 파일을 고치면 인증이 만료된다** —
  `node shared/qa/class-check/verify-cert.mjs architecture --record` 로 재결속(declared 항목은 재선언 필요).
- **스모크 확장**(`architecture/qa/preclass-flow-smoke.mjs`): 기본 모드(밤샘, AI 0) 불변 + AI 모드
  (PRECLASS_AI_ROUTES=1, 축2-b 전용 💸) + 시크릿 자체 로드 + teardown 잔존 검사에 제출·계보 포함.
- **health 확장**: `classCheck.tokenCaps`(출력 상한 실효값) + `caps` 가 {value,scope,audience} 구조.
- verify-qa-layers 전 스텝 통과 · QA-LAYERS-STANDARD §2 매트릭스 architecture 행 갱신 · 등록부
  covers `class: partial` + disposition 에 위 판정·처방 기재.

## 4. 남은 일 (우선순위순)

1) **§2 결정** → 재판정 (칸5 를 🟢 로 만드는 유일한 길).
2) R3 해소하려면: 토큰 usage 적재 원장(테이블+기록) 신설 — 앱 기능 변경이라 별도 결정/PR.
   estimatedUsd(ai-routes gaps)도 이 원장이 생겨야 실측으로 적을 수 있다.
3) R9·R11: 부하 실측 공용 하네스 부채(전 앱 공통, QA-POLICY §5) — architecture 단독 사안 아님.
4) 사람 눈 확인: 시연 모드로 12강·22강·10강·준비 점검 4곳 (밤샘 이후 아무도 실화면을 안 봤다).
5) 견학 링크 candidate 8건 확정(REPORT §4 표) + 10강·22강 스냅샷 캡처.
6) 소거 후보 정리(별도 PR): my-turn 라우트·MY_TURN_TASKS·클라 myTurn 데이터·myTurnContract,
   `/api/lab/class`(수업 현황 이관 미결).

## 5. 사고·특이 기록 (오늘분)

- **trust proxy 결함**은 재구조화 «이전부터» 있던 것 — sql/010 적용 검증(저장→되읽기 실패)이 캐냈다.
- gh 체인 자동 재타게팅이 꼬여 통합 브랜치에 PR 1개만 담긴 사고 → 최종 트리 직접 머지(diff 0 검증)로 복구.
- 마스터 repo 오발 커밋 1건(무관한 trip 목업 딸림) → 즉시 revert, 파일은 미추적으로 보존.
- GitHub API 503 다발 — 전부 재시도로 통과, 유실 0.
- 축2-b 실호출 비용: 오늘 승인 실행 3회 × 폐쇄 목록 6라우트(제공자 호출 7회/실행) ≈ Haiku 21회 —
  토큰 원장이 없어 금액은 실측 불가(짐작해 적지 않음).
- QA 잔존 최종 0 (세션·계보·제출 전부 — psql 되읽기).

---

## 6. §2 결정과 그 결과 (2026-08-18 오후 · 추가 기록)

**jery 결정 = 2번 «가드 끄기».** ✋ 내 차례 탭이 이미 철거돼 실호출이 0에 가까운데,
지키는 것이 없는 캡이 30명을 막고 있던 상태였다.

적용:
- Render `srv-d7o3nh9f9bms738s9vug`(architecture) 에 `MYTURN_GUARD_ENABLED=0` 등록.
- 🚨 **env 등록만으로는 반영되지 않았다** — restart(06:06)에도 `/health` 는 계속 `app-daily` 였고,
  재배포(`dep-da1vdsfqj5pc73d8kghg`)를 한 번 돌리고서야 값이 붙었다.
  즉 「무배포 조정」은 **값을 바꾸는 데 배포가 필요 없다**는 뜻이지 **프로세스를 안 건드린다**는 뜻이 아니다.
  수업 당일 캡을 만질 때 이 1~2분을 계산에 넣을 것.
- 실측: `/health` → `capPolicy: "none"` · `caps` 는 `LAB_VOICE_ACTOR_PER_MIN` 하나만 남음
  (voice 연타 창은 가드와 무관하게 항상 켜져 있다) · `tokenCaps` 는 그대로.
- 롤백 = env 삭제 또는 `=1` 로 되돌린 뒤 **재배포 1회**.

재판정(`prodqa architecture before-class --students 30 --approve`) 결과:

| | 전(오전) | 후 |
|---|---|---|
| R7 앱 분당 캡 | 🔴 수용 6명 (30명 불가) | **N/A — 앱 캡 없음**(R1·R2 제공자 한도로 인계) |
| 칸5 인원 산수 | 🔴 | 🟡 |
| 6칸 | 🟢🟢🟢🟢🔴🟢 | 🟢🟢🟢🟢🟡🟢 |

🔑 **판정의 성격이 바뀌었다** — 「30명 불가(아는 병목)」에서 「30명 확인 못 함(못 잰 것이 남음)」으로.
막는 것이 R7 에서 **R9(DB pool)·R11(서버 처리량)** 으로 넘어갔고, 이 둘은 부하 실측 공용 하네스 부채
(QA-POLICY §5)라 **architecture 단독으로는 🟢 를 만들 수 없다**. 미측정 3개(R3·R9·R11)를
무한대로 접지 않기 때문에 🟡 이고, 그건 러너가 정직한 것이다.

## 7. 남은 일 (§4 갱신)

1) ~~§2 결정~~ **완료**. 칸5 🟢 의 유일한 길은 이제 **R9·R11 부하 실측 하네스**(전 앱 공통 부채).
2) R3: 토큰 usage 적재 원장 신설 — 앱 기능 변경이라 별도 결정/PR.
3) 사람 눈 확인: 시연 모드로 12강·22강·10강·준비 점검 4곳 (밤샘 이후 아무도 실화면을 안 봤다).
4) 견학 링크 candidate 8건 확정(REPORT §4 표) + 10강·22강 스냅샷 캡처.
5) 소거 후보 정리(별도 PR): my-turn 라우트·MY_TURN_TASKS·클라 myTurn 데이터·myTurnContract,
   `/api/lab/class`. — 🔑 가드를 끈 지금은 **캡 없이 살아 있는 라우트**라, 소거의 근거가 하나 늘었다.

---

## 8. §7 잔여의 처리 (2026-08-18 저녁 2차 · 추가 기록)

### 8-1. 끝난 것

| 무엇 | PR | 상태 |
|---|---|---|
| 견학 링크 확정 | #259 | 후보 10건 → confirmed. 근거 = 레지스트리 **전수 16건** 접속 확인(HTTP 200·로그인 리다이렉트 없음) |
| ✋「내 차례」 서버 소거 | #260 | 라우트·가드·`MY_TURN_TASKS`·계약 2벌 삭제. prod 실측 `POST /api/vibe/my-turn` → **404** |
| 인증서 재결속 | — | 파일 11개 → **9개**, 🟢 인증 유효(commit 07dd9fe) |
| Render env 정리 | — | `MYTURN_GUARD_ENABLED` **삭제**(가리킬 대상이 없어진 스위치) |
| 원장 재선언 | — | declared 7건을 **항목별로** 재확인(부모로 묶지 않음). `axis2bCalls` 6→5 |

🔑 `capPolicy: "none"` 의 **뜻이 바뀌었다** — 「스위치를 껐다」가 아니라 **「앱 전역 캡이 실제로 없다」**.
`classCheck.test.ts` 가 app 스코프 캡의 재등장과 `MYTURN_*` 의 부활을 둘 다 빨갛게 잡는다.

**남긴 것(의도)**: 클라이언트 `myTurn` 데이터 12강분 = 「12강 터미널 미션 이식 원료」(jery 결정) ·
크롤러 비용 게이트의 my-turn 차단 줄(되살아나면 공짜로 잡힌다 — 이미 철거된 `/api/chat` 과 같은 처리).

### 8-2. 재판정 (3회차)

칸 6개 = 🟢🟢🟢🟢**🟡**🟢. R7 은 「N/A — 앱 캡이 없다」로 확정.
🚨 **칸5 🟡 의 이유가 하나로 좁혀졌다**: R9(DB pool) · R11(서버 처리량) — 둘 다 런타임이 값을 내놓지 않아
**부하 실측 공용 하네스**가 있어야 잰다(QA-POLICY §5, 전 앱 공통 부채). R3(토큰 usage 원장)도 미측정.
미측정을 무한대로 접지 않기 때문에 🟡 이고, 그건 러너가 정직한 것이다.

### 8-3. 못 한 것 (다음 사람 몫)

1) **사람 눈 4곳** — 시연 모드로 12강·22강·10강·준비 점검. 브라우저 자동화가 로컬 페이지에서
   스크립트 주입 타임아웃(5회 연속)으로 실패해 **한 화면도 못 봤다.** 밤샘 이후 아무도 실화면을 안 본 상태 그대로다.
   🚨 이 칸은 원래 «수동만» 이라(QA-POLICY 칸6) 기계가 대신할 수 있는 일도 아니었다.
2) **견학 스냅샷 0건** — 우선순위 = 10강 지도 · 22강 PR 목록. 경로만 채우면 폴백이 자동 점등된다.
   🚨 링크 확정으로 «바깥에서 열린다»는 확인됐지만 **학교망 차단은 재지 못했다** — github.com 계열 3건이 위험군.
3) R9·R11 부하 하네스 · R3 토큰 usage 원장(앱 기능 변경이라 별도 결정).
4) `/api/lab/class` 처분(수업 현황 이관 미결).
