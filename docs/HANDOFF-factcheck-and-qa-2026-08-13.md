# 핸드오프 — 사실 검증 완료·정적 점검 착수 (2026-08-13 오후)

> 대상 = `architecture` (`architecture.teachermate.co.kr`, **라이브**). `main` 머지 = prod 자동배포.
> 앞 단계 = `docs/HANDOFF-audit-followup-2026-08-13.md`(낮) → 그 문서의 §2·§3·§4 를 이 세션에서 처리했다.
> `main` = `c6da968`. **열린 PR 0건.**
> 🔄 **2026-08-13 갱신 2**: §4-1(#213)·§4-3(#215) 완료. `main` = `ad99734`. **남은 것은 §4-4 예산과 §4-5 사람 눈뿐이다.**

---

## 0. 한 문장

**감사 계통에서 코드로 밀 수 있는 일은 전부 닫혔다 — 남은 셋(순찰·class-check·사람 눈)은 시크릿·예산·사람이 있어야 비로소 시작된다.**

---

## 1. 이번에 머지된 것 (전부 prod 반영됨)

| PR | 내용 | 머지 커밋 |
|---|---|---|
| [#204](https://github.com/nyuoasis-cmd/architecture/pull/204) | ⚡ 사례 29개 — **전수 웹 대조 후** 머지. 76 → **105/131** | `7807e11` |
| [#210](https://github.com/nyuoasis-cmd/architecture/pull/210) | 감사 잔여 보통 3건·경미 3건 — 노트 11개 파일 | `0280ed2` |
| [#211](https://github.com/nyuoasis-cmd/architecture/pull/211) | 순찰 크롤러 AI 비용 게이트 + 철거된 하네스 시드 제거 | `6c21fed` |
| [#212](https://github.com/nyuoasis-cmd/architecture/pull/212) | 이 핸드오프 (코드 변경 0) | `5689854` |
| [#213](https://github.com/nyuoasis-cmd/architecture/pull/213) | 학생 화면 2건 — 제목 「다음 조각」·NotPetya 출처 (jery 승인) | `c6da968` |

앞 문서 §2 의 jery 결정 2건은 이 세션 시작에 받았다:
**1) 29건 전수 웹 대조** **2) 틀린 것이 나오면 비운다.**

---

## 2. #204 사실 검증 — 29건 전부 확인, **비울 것 0건**

표본이 아니라 전수로 돌렸다. 각 사건의 1차 자료(공식 장애 보고서·CVE·법원 결정문·감사원 보고서)를
찾아 **제목뿐 아니라 본문의 인과 설명까지** 대조했다. 존재하지 않는 사건도, 틀린 인과도 나오지 않았다.

**검증표 29줄 전문 = [PR #204 코멘트](https://github.com/nyuoasis-cmd/architecture/pull/204#issuecomment-5277544707).**
아래는 대조에서 실제로 확인된 «세부까지 맞았다»의 표본이다.

- `1994 Pentium FDIV` — 조회표(PLA) **1,066칸 중 5칸 누락**, 1994-12 무조건 교환
- `2012 윤초` — futex 재무장 루프, Red Hat 지식베이스 15145·154793
- `1997 Pathfinder` — 우선순위 역전 → **우선순위 상속 플래그 ON** 으로 수정
- `2021 Fastly` — 「정상 고객 설정 변경이 잠복 결함을 작동」 = Fastly 공식 표현 그대로
- `2012 Knight Capital` — 8대 중 1대 미배포 + 2차 검토 절차 문서 없음, SEC 명령

🔑 **`ch06_q09` 연동은 손댈 게 없었다.** 앞 문서가 「#204 가 머지되면 노트를 다시 볼지 판단하라」고
남긴 자리다. #206 이 사례 없이 쓴 노트가 「드라이버는 운영체제 깊은 곳에서 돌기 때문에 하나가
잘못되면 기기 전체가 멈추기도 합니다 — 영향 반경이 왜 넓은지를 함께 짚어 주세요」인데,
들어온 사례(2024 CrowdStrike)가 정확히 그 장면이라 충돌 없이 맞물린다.

### 2-A. 재현 방법 (다음에 사례를 또 넣을 때)

1. `gh pr diff <N> | grep "^+"` 로 `period`·`title`·본문 끝 `— …(출처)` 를 뽑는다
2. 사건마다 **출처에 적힌 기관의 1차 자료**를 웹에서 찾는다 — 요약 블로그가 아니라 원문
3. 대조 대상은 세 가지: **① 사건이 실재하는가 ② 연도가 맞는가 ③ 본문이 말한 인과가 1차 자료의
   설명과 같은가.** 3번에서 대부분의 위험이 나온다 (사건은 진짜인데 원인 설명이 틀린 경우)
4. 확인 안 되면 **비운다** — 개수를 목표로 삼지 않는다

---

## 3. 정적 점검에서 나온 것 — 🚨 돌리기 전에 잡았다

앞 문서 §4 의 미실행 항목 「정적 점검(QA 3-Layer)」이다. 등록부가 architecture 순찰을
「크롤러는 있으나 **한 번도 안 돌았다**」로 적어 둔 상태였다. 돌리기 전에 코드를 읽었더니
**돌렸으면 돈이 나갔을 상태**였다.

### 3-A. 크롤러가 「내 차례」 버튼을 누를 수 있었다

`qa/crawler/crawl.ts` 는 페이지의 `button, a, [role="button"], [data-qa-action]` 을 **전부 클릭한다.**

- `forbiddenRoutes` 검사는 **네비게이션 단계에만** 걸려 있었다
- `setRequestInterception` 은 헤더만 주입하고 **`abort` 를 한 번도 부르지 않았다**
  → 클릭이 부른 XHR 은 그대로 나갔다
- 그리고 앱 AI 라우트 2개가 `forbiddenRoutes` 에 **아예 없었다**

| 라우트 | 무엇 | 돈 천장 |
|---|---|---|
| `/api/chat` | 학생 챗봇 | `CHAT_MONTHLY_BUDGET_USD` 있음 |
| `/api/vibe/my-turn` | ✋「내 차례」 | **없다** — `registerUsageCost` 가 chat-service 안에만 있다 |

QA-LAYERS-STANDARD §3 이 요구하는 이중 방어(`forbiddenRoutes` + `blockRequest`)의
**뒤쪽 절반이 비어 있었다.** #211 에서 두 라우트를 등재하고 네트워크 단계에서 `abort` 를 건다.
차단은 결함이 아니라 «방어가 일했다»는 기록이라 FAIL 로 세지 않고 `🛡️` 로그로 남긴다.

### 3-B. manifest 가 없는 화면을 돌고 있었다

`/harness`·`/harness/module1`~`module6` 시드 8개는 **2026-08-11 PR #191 에서 철거된 라우트**다.
`client/src/App.tsx` 라우트 목록에 `harness` 0건이고, `server/src/routes/sessions.ts:21` 이
「세션은 한 종류뿐이다」라 setup 의 `mode:'harness'` 세션 생성도 죽은 코드였다.
없는 화면을 도는 크롤은 초록이어도 아무것도 안 본다. 같은 김에 살아 있는데 빠져 있던
`/teacher/demo`(🎬 시연작 B형)를 시드에 넣었다.

### 3-C. 초록으로 바꾼 정적 검사 1건

`shared/qa/checks/ghost-columns.mjs` 는 시크릿이 없어 「FAIL(검사 불가)」였다.
`.env` 의 Supabase 자격으로 돌려 **PASS** — select 18건 / 컬럼 47개를 실 스키마(240테이블)와
대조, 유령 컬럼 0건. 실행법:

```bash
cd $WT && set -a && . ./.env && set +a
node /home/claude/shared/qa/checks/ghost-columns.mjs \
  --src server/src --src client/src --table-prefix architecture_
```

---

## 4. 🔴 다음 일감 — 이 순서로

### 4-1. ~~학생 화면 2건~~ ✅ **완료** — [#213](https://github.com/nyuoasis-cmd/architecture/pull/213) (`c6da968`)

jery 승인(2026-08-13)을 받고 둘 다 적용했다. 아래는 무엇을 왜 골랐는지의 기록이다.

| 자리 | 바뀐 것 |
|---|---|
| `qa-stubs.ts:827-828` | 「다음 글자」 → **「다음 조각」** (제목·요약). 잔여 0건 실측 |
| `base-extras-ch06.ts:284` | `(Microsoft·영국 NCSC 공개 분석)` → **`(Microsoft 기술 분석·미국 CISA 경보)`** |

🔑 `qa-stubs.ts` 밖에 제목 참조가 없음을 실측 확인했다 — 표시용이라 교체가 안전했다. `qaId` 는 그대로다.

**왜 1) 이었나** — 토큰 크기는 토크나이저마다 달라 한 글자일 수도, 한 단어 전체일 수도 있다.
같은 문항의 노트는 #210 에서 이미 「다음 조각」으로 맞췄고, 같은 파일 `prompts` 도
「한 글자일 때도 있고 한 단어일 때도 있습니다」라고 정확히 쓰여 있었다 —
**제목만 혼자 남아 한 화면 안에서 용어가 갈리고 있었다.**

**왜 2) 였나** — #204 전수 대조 29건 중 **유일하게 걸린 자리**다. Microsoft 는 실제 기술 분석
2건을 냈지만(2017-06-27·2017-10-03), 영국 NCSC 가 낸 것은 **러시아군 귀속 성명**(2018-02)이지
부팅 사슬의 기술 분석이 아니다. CISA 는 2017-07-01 Petya 경보를 냈다.
본문(MBR 변조·MFT 암호화)은 전부 맞아 손대지 않았다 — **출처 표기만 틀렸다.**

### 4-2. ~~이 문서 = 오늘 기록~~ ✅ **완료** — [#212](https://github.com/nyuoasis-cmd/architecture/pull/212)

앞 세션들은 매번 `docs/HANDOFF-*.md` 를 남겼는데, 오늘 산출물(#204 검증표 29줄·#211 발견 2건)은
PR 본문과 코멘트에만 있었다. 이 문서가 그 자리다.

### 4-3. ~~순찰(patrol) 크롤 실행~~ ✅ **완료** — [#215](https://github.com/nyuoasis-cmd/architecture/pull/215) (`ad99734`)

#### 🚨 정정 — 이 문서의 앞 판이 틀렸다

앞 판은 「`QA_SECRET` 이 로컬에 없다」고 적었다. **틀렸다.** 변수명은 `QA_AUTH_SECRET` 이고,
값은 **`~/.claude/.secrets/architecture-real-flow-qa.env`** 에 처음부터 있었다.
밤샘 스모크(`FLOW_SMOKES`)가 매일 쓰는 파일인데 앱 `.env` 만 보고 없다고 단정했다.
🔑 교훈 = 「시크릿이 없다」고 말하기 전에 **`~/.claude/.secrets/` 를 먼저 볼 것.**

#### 어디에 대고 돌렸나 — prod 아님

시크릿 파일의 `QA_BASE_URL`·`QA_CLIENT_URL` 은 `https://architecture.teachermate.co.kr`(라이브)이고
계정은 `nyuoasis@gmail.com`(jery 실계정)이다. 그건 **밤샘 스모크용**이다 — 정해진 11단계만 밟고
teardown 하는 좁은 각본이라 라이브에 대도 된다.

**L2 크롤러는 다르다. 모든 버튼을 누른다**(경로당 최대 12회). 라이브에 대면
QA-LAYERS-STANDARD 가 금지하는 「prod 블라인드 크롤」이다. 표준의 선례도 전부
local+실DB(`sprint-v2`=yrxk · `vibe`=ltbkd)라 **로컬 dev 서버**에 대고 돌렸다.
시크릿과 계정만 재사용하고 주소만 `localhost` 로 덮었다.

#### 🚨 돌려 보니 크롤러가 깨져 있었다 — teacher 롤은 «한 번도» 통한 적이 없다

첫 실행: **PASS 9 / SKIPPED 4** — teacher 4경로가 전부 로그인으로 샜다.
가설 2회가 연달아 틀려 진단 로그로 전환했고(디버깅 정책), 그때 원인이 나왔다.

```ts
// client/src/lib/supabase-client.ts
createClient(url, key, { auth: { storage: cookieStorage, storageKey: 'sb-auth-token' } })
//                                       ^^^^^^^^^^^^^ js-cookie
```

크롤러는 **localStorage** 에 세션을 넣고 있었다 — 앱이 절대 읽지 않는 곳이다.
**prod 빌드도 같은 쿠키 저장소를 쓴다. 즉 이 크롤러의 teacher 롤은 어느 환경에서도 통한 적이 없다.**
두 번째로 주입 payload 가 stub 이라 `expires_at`·`refresh_token` 이 없었다 —
supabase-js 가 만료로 보고 `getSession()` 에 `null` 을 준다(쿠키로 고쳐도 따로 걸린다).

| | PASS | FAIL | SKIPPED |
|---|---|---|---|
| 수리 전 | 9 | 0 | **4** |
| 수리 후 | **13** | 0 | **0** |

죽은 버튼 0 · 총 클릭 18 · 하드실패 0.

#### 🦷 이빨 확인 (음성 대조)

#211 의 비용 게이트가 실제로 무는지 따로 때렸다:

```
/api/vibe/my-turn → 차단 (네트워크 abort)
/api/chat         → 차단 (네트워크 abort)
/api/sessions     → 통과 (크롤 자체는 계속 돈다)
```

**앱 AI 과금 0원.**

#### 등록부는 `partial` 그대로 뒀다

`shared/qa/registry.yaml` 을 갱신했지만(master `57a1695`) **`covers.patrol` 은 `partial`** 이다.
클릭 깊이가 경로당 1~4로 얕아 표준의 커버리지 정의(L1 − {L2+L3} = 미클릭 버튼 명단)로 보면
아직 덮은 게 아니다. **산출물이 하나 나왔다는 것과 그 층을 덮었다는 것은 다르다.**

#### 재현

```bash
cd $WT && set -a && . ./.env && . ~/.claude/.secrets/architecture-real-flow-qa.env && set +a
export QA_BASE_URL=http://localhost:3003 QA_CLIENT_URL=http://localhost:5176   # 🚨 prod 주소를 덮어쓴다
cp <(grep -E "^VITE_SUPABASE_(URL|ANON_KEY)=" .env) client/.env.local           # vite 는 client/ 에서 env 를 읽는다
npm run dev
cd qa/crawler && npm i && npx tsx crawl.ts
```

#### 📌 곁다리로 막은 것

`.gitignore` 가 `.env` 만 막아 `client/.env.local` 이 **추적 대상으로 잡혔다.**
`.env.*` + `!.env.example` 추가(#215).

### 4-4. 🔴 class-check 등록 — **예산 결정이 먼저다**

인증서를 발급하려면 `shared/qa/class-check/capacity.architecture.json` 원장이 필요하고,
그 원장은 **축2-b 실측**으로만 채울 수 있다(등록부: 「손으로 채우면 날조 — 반드시 실측」).
실측 = **AI 라우트를 실제로 밟는 일**이다. 「내 차례」는 돈 천장이 없는 쪽이라
**얼마를 태울지가 jery 결정**이다. 그 답 없이는 착수하지 않는다.

### 4-5. 🔴 사람 눈 (계속 밀리고 있다)

밤샘 핸드오프가 🔴 로 적은 뒤로 **변경량만 계속 늘었다**:

```
#207·#208   노트 391개 필드 재작성
#206        문항 본문 4곳 (ch05_q04 는 퀴즈까지)
#210        노트 11개 파일
#204        ⚡ 사례 29개 신규
```

「다음 문항」 통로와 노트 131개를 **아직 아무도 실제로 눌러 보지 않았다.**
자동화하려면 앱 AI 라우트를 밟아야 해서 이 세션도 밟지 않았다 — **앱 AI 과금 0원.**

---

## 5. 작업 방식 — 이번에 굳은 것

- **«돌리기 전에 코드를 읽는다».** 크롤러를 그냥 실행했으면 결함을 못 보고 돈만 나갔을 것이다.
  QA 도구도 «한 번도 안 돌았다»고 적혀 있으면 그 도구 자체를 먼저 감사할 것.
- **사실 검증은 제목이 아니라 인과를 본다.** 29건 중 사건이 가짜인 것은 0건이었지만,
  위험이 있었다면 「사건은 진짜인데 원인 설명이 다르다」 쪽이었다. 표본 검사가 놓치는 자리다.
- **출처 표기도 검증 대상이다.** NotPetya 는 본문이 전부 맞는데 **출처에 적힌 기관이 낸 문서의
  종류**가 달랐다. 본문만 보면 영원히 안 걸린다.
- **정확한 «못 했다»는 기록이다.** 등록부의 `patrol: partial`·「한 번도 안 돌았다」를 그대로 둔 것은
  게으름이 아니라 정본을 지킨 것이다. 산출물이 나오기 전에 초록으로 바꾸면 그때부터 아무도 안 본다.
- **학생 화면과 교사 노트를 가른다.** #210 은 노트만 11개 고쳤고, 같은 문제의 학생 쪽 절반
  (문항 제목)은 **승인을 받고 나서 #213 으로** 고쳤다. 앞 세션의 #206 도 같은 규칙이었다.
  같은 결함이라도 교사 노트는 바로 고치고 학생 화면은 물어본다 — 이 경계가 이번에 두 번 작동했다.

---

## 6. 상태 요약

```
main            ad99734
열린 PR         0건
문항            131        (qa-stubs 65 + vibe-ch11~23 66)
📋 설명 노트     131/131    ← teacherExplainContract 가 지킨다
🚌 견학         131/131
⚡ 사례          105/131    ← 76 → 105 (#204)
용어 정합       「다음 글자」 잔여 0건 (#213)
✋ 내 차례        12강
서버 테스트      133 pass / 0 fail
client tsc      통과
qa/crawler tsc  통과
정적 검사        ghost-columns PASS · ime-input-guard PASS · required-checks-path-filter PASS
                render-workspace-refs = RENDER_API_KEY 부재로 미실행
QA 등록부        gate/nightly/realflow/ux = full · patrol = partial(1회 실행 13/13) · class = none
앱 AI 과금       0원
```

---

## 7. 다음 세션 첫 3분

```bash
cd /home/claude/architecture
git fetch origin main && git log --oneline origin/main -1     # ad99734 인지 확인
git branch --show-current                                      # 🚨 main 인지 확인 — 낡은 브랜치면 노트가 66개로 보인다
cd server && npm test | grep -E "^ℹ (tests|pass|fail)"        # 133/133/0
gh pr list --repo nyuoasis-cmd/architecture --state open       # 0건이어야 한다
```

**§4-1·§4-2 는 끝났다. 남은 셋은 전부 사람이 뭔가를 줘야 시작된다.**

| 남은 것 | 필요한 것 | 누가 |
|---|---|---|
| §4-4 class-check | 축2-b 실측에 태울 **예산** | jery |
| §4-5 사람 눈 | 사람이 직접 눌러 보기 | jery |
| (선택) 순찰 클릭 깊이 | 판단 — `partial` 을 `full` 로 올리려면 미클릭 버튼을 줄여야 한다 | — |

🚨 **코드로 더 밀 수 있는 일은 없다.** 새 창이 열리면 위 셋 중 무엇을 줄 수 있는지부터 물을 것 —
아무것도 없으면 이 앱에서 지금 할 수 있는 일은 없고, 억지로 만들면 안 돌던 검사를 초록으로
칠하거나 노트를 또 다시 쓰는 쪽으로 흐른다(둘 다 이미 한 번씩 겪었다).

> ⚠️ **환경 주의**: 2026-08-13 기준 `/home/claude/architecture` 본체 체크아웃이
> `docs/codex-retry-guidance`(`f087281`)라는 낡은 브랜치에 있었다. 거기서는 노트가 **66개**로
> 보인다(실제 131개). 작업 전에 `git branch --show-current` 를 반드시 볼 것.
