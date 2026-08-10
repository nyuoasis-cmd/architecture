# 런북 — 1~10장 폴리싱 에픽 (후속 작업 실행용)

작성 2026-08-11, **갱신 2026-08-11(견학·사례 에픽 종료 후)**. 기준 `main 866d72a`.
목표: 1~10장을 11~17장과 같은 수준으로 올린다. 그 뒤에 교안·모듈로 넘어간다(jery 지시).

> ✅ **견학·사례는 전 장 완결됐다.** 아래 §1·§2·§3 은 그 결과로 갱신된 상태다.
> 🚨 예전 판에는 «11~17장은 견학·사례·내 차례 셋을 다 갖췄고 1~10장만 없다»고 적혀 있었는데
> **실측은 반대였다** — 바이브코딩 장의 견학 공백이 19문항이었다. 손으로 적은 현황은
> 그때의 관측이지 사실이 아니다. §0 을 직접 돌려서 다시 재라.

> 🚨 이 문서의 «현재 상태»는 작성 시점의 관측이다. 착수 전에 아래 «0. 상태 재확인»을 **직접 돌려서** 다시 재라.

---

## 0. 상태 재확인 (착수 전 필수)

```bash
cd /home/claude/architecture
git fetch origin && git checkout main && git pull
git log --oneline -1                 # 기대: 866d72a 이후
git status --short                   # 기대: 비어 있음
gh pr list --state open              # 기대: 비어 있음
cd server && npm test                # 기대: 종료코드 0
curl -s https://architecture.teachermate.co.kr/api/health
```

`/api/health` 의 `classCheck.caps` 는 «내 차례» 통제값 선언이다. 값이 바뀌었으면 그 자체가 사건이다.

---

## 1. 지금 무엇이 끝났고 무엇이 남았나

### 끝난 것 (2026-08-11 배포·prod 실측)

| PR | 무엇 |
|---|---|
| #138~#140 | 1~10장 정답 자리 쏠림 해소 + 채점 통제 학생별 + 문항 수를 데이터에서 계산 |
| #144~#148 | 기초 1~10장 65문항에 🚌 견학·⚡ 사례 (장당 1 PR) |
| #149~#153 | 바이브코딩 12·13·15·16·17장의 견학 공백 19문항 + 사례 (장당 1 PR) |

### 앱 전체 실측 (모듈을 평가해서 셈 — 소스 정규식 아님)

| | 값 |
|---|---|
| 전체 문항 | **107** |
| 🚌 견학 없는 문항 | **0** |
| ⚡ 사례 있는 문항 | 70 |
| ✋ 내 차례가 있는 문항 | **1** (`ch13_q01` — 시범 상태 그대로) |

```bash
node --import tsx -e "
const path=require('path');const R=path.resolve('..','client','src','data');
const {ALL_EXTRAS}=require(path.join(R,'learn-extras'));const {QA_STUBS}=require(path.join(R,'qa-stubs'));
console.log('문항',QA_STUBS.length,'| 견학없음',QA_STUBS.filter(q=>!ALL_EXTRAS[q.id]?.tour?.length).length,
'| 사례',QA_STUBS.filter(q=>ALL_EXTRAS[q.id]?.incident).length,
'| 내차례',QA_STUBS.filter(q=>ALL_EXTRAS[q.id]?.myTurn).length);"
```

### 남은 것

| 요소 | 무엇 | AI 호출 | 상태 |
|---|---|---|---|
| 🚌 견학 | 학생이 이미 쓰는 앱을 열어 «무엇이 보이는지» 확인 | **없음** | ✅ 107/107 |
| ⚡ 사례 | 본문 아래 «실제로 있었던 일» (teachermate 운영 실화만) | **없음** | 70/107 (선택 요소) |
| ✋ 내 차례 | 학생이 쓴 부탁문을 Haiku 4.5 가 판정 | **있음** | 🔴 1/107 — **캡 결정 선행** |

**🔑 남은 본체는 «내 차례»와 교안 둘뿐이다.** 견학·사례는 AI 파급 0 이라 먼저 갔고, 끝났다.

## 2. 결정 게이트

### ✅ 닫힌 게이트 (예전 판의 G1~G4)

| | 무엇이었나 | 어떻게 닫혔나 |
|---|---|---|
| G1 | 11~17장이 수업 세션에 못 담김(`max(10)` 하드코딩) | **#142** — 범위를 `ALL_CHAPTER_IDS` 에서 파생. 장이 늘면 저절로 따라온다 |
| G2 | `chat.ts` 통제 키가 `req.ip` (교실 전체가 한 명) | **#143** — `resolveActorId` 사용 + 한도 4층 재설정 |
| G3 | `ch06_q03` 고아 | **#147** — 본문 신설(6장 10문항) |
| G4 | PR #128 초안 | CLOSED |

### 🔴 열려 있는 게이트 — G5. 「내 차례」를 넓힐 것인가 (**비용 결정**)

지금 상태: **앱 전체 1문항**(`ch13_q01`) · 통제 **기본 꺼짐**(jery 결정). 그래서 prod `/api/health` 의
`classCheck.capPolicy` 가 `"none"` 인 것은 **정상**이다 — 거짓 선언이 아니라 «캡이 실제로 없는 상태».

넓히기 전에 정해야 하는 것 둘:
1. `MYTURN_GUARD_ENABLED` 를 켤 것인가 (켜야 아래 캡이 실효)
2. `MYTURN_DAILY_CAP` / `MYTURN_PER_MIN` / `MYTURN_ACTOR_DAILY_CAP` 의 숫자

환산표(코드 기본값: 학생 하루 12 · 쿨타임 5분 · 전역 분당 60 · 전역 하루 500)

| 상황 | 호출 수 | 판정 |
|---|---|---|
| 30명 × 1차시, myTurn 문항 2개 | 60회 | 전역 하루 500 안에서 **8차시/일**까지 |
| 30명이 동시 제출 | 분당 30 | 전역 분당 60 이내 ✅ |
| 학생 1명 45분 수업 | 쿨타임 5분 → 최대 9회 | 학생 하루 12 이내 ✅ |

→ 병목은 **전역 하루 500**. 하루 8차시를 넘기려면 상향(Render env, 무배포)이 필요하고 그건 비용 결정이다.

## 3. 실행 순서

### ✅ PR-A ~ PR-J (견학·사례) — 끝남

형판 전환은 **카테고리가 아니라 «extras 가 있는 장인가»** 로 갈린다(`client/src/data/learn-extras.ts`).
그래서 장 단위로 옮겨 가고, 문제가 생기면 그 장 파일만 되돌리면 된다.

### 🔒 가드 상태 — 예외 목록 두 개가 **비어 있다**

`server/src/lib/extrasContract.test.ts` (계약 ⑨·⑨-b·⑤·⑤-b)

- `CHAPTERS_NOT_YET_FULLY_COVERED` = **빈 집합** — 어느 장이든 문항 하나만 견학이 없으면 ⑨ 가 빨개진다.
- `TOURS_WITHOUT_CONFIRMATION_STEP` = **빈 집합** — «떠올려 적어 봐»만 시키는 미션은 ⑤ 가 잡는다.
- 🔑 두 목록은 **줄어들기만 한다.** 번호나 id 를 새로 넣는 것은 «반쪽을 만들겠다»는 선언이고,
  ⑨-b·⑤-b 가 «이미 채워졌으니 지워라»로 되받는다. (⑤-b 의 이 절반은 변이가 초록으로
  통과해서 발견됐다 — «대상이 사라졌는가»만 보고 «이미 고쳐졌는가»는 안 보고 있었다.)

### PR-K 이후 : 「내 차례」 (**G5 결정 후에만**)

### 병렬 가능 (결정 불필요)

- ⚡ 사례가 없는 37문항 — **실화가 있을 때만** 채운다. 없으면 비워 두는 게 맞다(날조 금지).
- 교안·모듈(1장=1차시) — jery 가 «1~10장 다음»으로 지목한 것

## 4. 이 레포에서 굳은 검증 절차

장/기능 추가 시 순서대로:

1. 계약 테스트 작성 → `cd server && npm test`
2. **커밋** (🚨 변이 시험은 반드시 커밋 뒤에 — 원복이 미커밋 작업을 삼킨다)
3. 변이 3건 이상 주입 → 전부 **빨강** 확인 → 원복
   - 변이가 **실제로 적용됐는지** 먼저 확인한다. 안 걸린 변이가 초록인 건 가드의 무죄가 아니다
4. `cd client && npm run build` + `cd server && npx tsc --noEmit`
5. 🚨 **`.env` 를 치우고 `npm test` 재실행** — 로컬 비밀에 기댄 테스트는 CI 에서만 빨강이 된다

   ```bash
   cd /home/claude/architecture && mv .env .env.away
   cd server && npm test; echo "rc=$?"
   cd .. && mv .env.away .env
   ```
6. PR → CI(`fast`) 초록 → 머지(squash) → **main 에서 테스트 재실행**
7. prod 실측 — **동작으로 판별한다.** 문자열·번들 해시로 배포 여부를 판단하지 말 것

---

## 5. 함정 (전부 이 레포에서 실제로 밟았다)

| 함정 | 판별법 |
|---|---|
| 소스 정규식으로 개수를 세면 «없는 결함»이 나온다 | 모듈을 평가해서 센다: `cd server && node --import tsx -e "require('../client/src/data/…')"` |
| 스윕의 «정상» 판정이 없는 문항에도 나온다 | 없는 문항은 `/library` 로 리다이렉트된다 → **경로 유지**를 확인. 음성 대조군(`chNN_q99`) 필수 |
| 선지를 하나 지워도 범위 검사는 침묵한다 | 4지선다·중복 선지 검사(baseQuizContract ⑧)가 잡는다 |
| 학생당 한도를 IP 로 재면 교실 전체가 한 명 | 신원은 `server/src/lib/actor-id.ts` 의 `resolveActorId` 만 쓴다 |
| 판정을 파이프 뒤에서 읽으면 종료코드가 `tail` 의 것 | 맨몸 실행 or `${PIPESTATUS[0]}` |

---

## 6. 자주 쓰는 명령

```bash
# 정답 자리 재배치기(멱등). 1~10장 데이터를 손댄 뒤 다시 돌려도 안전
cd /home/claude/architecture/server && node --import tsx ../scripts/rebalance-base-quiz.mjs

# 지금 분포·몰림 즉시 확인
cd /home/claude/architecture/server && node --import tsx -e "
const {QUIZZES}=require('../client/src/data/quizzes');
const {QUIZ_ANSWERS}=require('./src/data/quiz-answers');
const d=[0,0,0,0];let t=0;const flat=[];
Object.keys(QUIZZES).filter(i=>+i.slice(2,4)<=10).forEach(id=>{
  const a=(QUIZ_ANSWERS[id]?.answers||[]).map(x=>x.correctIdx);
  a.forEach(i=>{if(i<4)d[i]++;t++});
  if(a.length>1&&new Set(a).size===1)flat.push(id);});
console.log('분포',d.map((c,i)=>String.fromCharCode(65+i)+':'+(100*c/t).toFixed(1)+'%').join(' '),'| 몰림',flat.length);"

# prod 채점 왕복(동작 판별용)
curl -s -X POST https://architecture.teachermate.co.kr/api/quiz/grade \
  -H 'content-type: application/json' -d '{"qaId":"ch09_q01","answers":[0,1,2]}'
```
