# 런북 — 1~10장 폴리싱 에픽 (후속 작업 실행용)

작성 2026-08-11. 기준 `main 5572bd5`.
목표: 1~10장(64문항)을 11~17장(바이브코딩)과 같은 수준으로 올린다. 그 뒤에 교안·모듈로 넘어간다(jery 지시).

> 🚨 이 문서의 «현재 상태»는 작성 시점의 관측이다. 착수 전에 아래 «0. 상태 재확인»을 **직접 돌려서** 다시 재라.

---

## 0. 상태 재확인 (착수 전 필수)

```bash
cd /home/claude/architecture
git fetch origin && git checkout main && git pull
git log --oneline -1                 # 기대: 5572bd5 이후
git status --short                   # 기대: 비어 있음
gh pr list --state open              # 기대: #128(초안, DRAFT) 하나뿐
cd server && npm test                # 기대: 종료코드 0
curl -s https://architecture.teachermate.co.kr/api/health
```

`/api/health` 의 `classCheck.caps` 는 «내 차례» 통제값 선언이다. 값이 바뀌었으면 그 자체가 사건이다.

---

## 1. 지금 무엇이 끝났고 무엇이 남았나

### 끝난 것 (2026-08-11 배포·prod 실측)

| PR | 무엇 |
|---|---|
| #138 | 1~10장 정답 자리 쏠림 해소(A45%B41% → 전부 25%대, 한 문 몰림 13건→0) + 계약 가드 8개 |
| #139 | 채점 호출 통제 IP+UA → 학생별(참여자 토큰). 한 반이 한 통에 뭉치던 것 해소 |
| #140 | 문항 수를 데이터에서 계산(«71개 Q&A» 는 4곳에서 거짓, 실제 64) |

### 남은 것 = 이 런북의 본체

1~10장 64문은 **구 3컬럼 레이아웃**이고, 11~17장이 가진 세 가지가 하나도 없다.

| 요소 | 무엇 | AI 호출 |
|---|---|---|
| 🚌 견학(tour) | 학생이 이미 쓰는 앱을 열어 «무엇이 보이는지» 확인 | **없음** |
| ⚡ 사례(incident) | 본문 아래 «실제로 있었던 일» (teachermate 운영 실화만) | **없음** |
| ✋ 내 차례(myTurn) | 학생이 쓴 부탁문을 Haiku 4.5 가 판정 | **있음** |

**🔑 이 표가 실행 순서를 정한다.** 견학·사례는 AI 호출이 없어 비용·한도 파급이 0이다.
«내 차례»만 캡에 걸린다. 그래서 에픽을 A/B 로 쪼갠다.

---

## 2. 결정 게이트 (jery 판단 없이 넘어가지 말 것)

### G1. 🔴 바이브코딩(11~17장)을 수업 세션으로 열 것인가 — **교안의 선행 조건**

지금 `server/src/routes/sessions.ts` 가 이렇게 막는다.

```ts
chapter_ids: z.array(z.number().int().min(1).max(10)).max(10),
```

즉 **11장 이후는 수업 세션에 못 담는다.** 학생은 라이브러리 자습으로만 닿는다.
어제 끝낸 42문 에픽이 교실에서는 못 쓰이는 상태이고, «1장=1차시» 교안을 만들어도 그대로는 수업에 못 건다.

- 열면: 「내 차례」가 수업 규모로 들어온다 → 아래 캡 계산 참조
- 안 열면: 바이브코딩은 자습 콘텐츠로 남고, 교안은 자습 안내서 형태가 된다

**결정에 필요한 캡 계산** (현재 값: 학생 하루 12회 · 쿨타임 5분 · 전역 분당 60 · 전역 하루 500)

| 상황 | 호출 수 | 판정 |
|---|---|---|
| 30명 × 1차시, myTurn 문항 2개 | 60회 | 전역 하루 500 안에서 **8차시/일**까지 |
| 30명이 동시 제출 | 분당 30 | 전역 분당 60 이내 ✅ |
| 학생 1명 45분 수업 | 쿨타임 5분 → 최대 9회 | 학생 하루 12회 이내 ✅ |

→ 병목은 **전역 하루 500**. 하루 8차시를 넘겨 쓰려면 `MYTURN_DAILY_CAP` 상향(Render env, 무배포)이 필요하고 그건 비용 결정이다.

### G2. 🔴 `chat.ts`(학생 챗봇)의 통제 키를 학생별로 바꿀 것인가 — **비용 파급**

`server/src/routes/chat.ts:32` 이 아직 `actorId = req.ip` 다. #139 로 채점은 고쳤지만 챗봇은 그대로다.

- 지금: 한 반(공유 IP)이 «분당 100 · 하루 1000» 을 **나눠 쓴다** → 막힐 위험은 낮지만 한 학생이 몰아 쓰면 반 전체가 영향
- 바꾸면: 같은 한도가 **학생 1인 몫**이 된다 → 30명이면 이론상 하루 30,000회. AI 지출 상한이 30배

→ 키만 바꾸면 안 되고 **한도를 함께 다시 잡아야 한다**. 예: 학생 1인 하루 40 · 전역 하루 1000 유지. 이건 숫자를 정하는 결정이라 jery 몫.

### G3. 🟡 `ch06_q03` 고아 — 콘텐츠 판단

6장 문항이 `q01 · q02 · q04 ~ q10` 로 **q03 을 건너뛴다.** 그런데 `ch06_q03` 의 퀴즈·정답(프로그램/프로세스/프로세서)은 존재한다. 화면에서는 도달 불가(`/library` 로 리다이렉트).

- (a) 6장에 문항 하나가 빠진 것 → 본문을 새로 쓴다(1장 분량 아님, 문항 1개)
- (b) 남은 퀴즈가 잔재 → 퀴즈·정답을 지운다

### G4. 🟡 PR #128(초안 35문) 닫을 것인가

11·12·14~17장 본문은 이미 확정 전환돼 머지됐다. 초안이 더 갖고 있는 게 있는지 확인 후 닫기.

```bash
gh pr diff 128 --name-only
```

---

## 3. 실행 순서

### PR-A ~ PR-J : 견학·사례 붙이기 (장당 1 PR, **AI 파급 0**)

권장 순서 = 학생이 만나는 순서. **1장부터.**

각 PR 의 내용:

1. `client/src/data/base-extras-chNN.ts` 신설 — `Record<string, VibeExtras>`
   - `incident` : ⚡ 실제로 있었던 일. **teachermate 운영 실화만.** 도서 차용 0%
   - `tour` : 견학 미션. 규칙은 `client/src/data/vibe-stubs.ts` 의 `VibeTourMission` 주석에 박혀 있다 —
     ① 학생이 이미 아는 경험에서 출발 ② «찾아봐» 금지, 무엇을 보게 될지 미리 말한 뒤 확인 ③ 전달할 문장은 `feedback` 에 대놓고 쓴다
   - `myTurn` 은 **넣지 않는다** (PR-K 이후, G1 결정 뒤)
2. 형판 전환 — 지금은 카테고리로 가른다:

   ```ts
   // client/src/pages/LearnPage.tsx
   if (props.chapter.category === VIBE_CATEGORY) { return <VibeLearnLayout … /> }
   ```

   🔑 이걸 **카테고리가 아니라 «extras 가 있는 장인가»로 바꾼다.** 그래야 장 단위로 옮겨가고, 문제가 생기면 그 장만 되돌린다.
   탭은 데이터가 있을 때만 켜진다(`VibeLearnLayout.tsx:42-51`) — 견학·사례만 있으면 «내 차례» 탭은 안 생긴다.
3. 가드: `server/src/lib/baseQuizContract.test.ts` 옆에 extras 계약 테스트를 붙인다.
   - 형판을 쓰는 장은 extras 가 실제로 있는가(빈 탭 금지)
   - 견학 미션에 `feedback` 이 비어 있지 않은가
   - 반공백: 대조 대상이 0건이면 위 검사가 공짜로 통과하지 않는가

### PR-K 이후 : 「내 차례」 (**G1 결정 후에만**)

### 병렬 가능 (결정 불필요)

- 6장 문항 번호 정리는 G3 결정 후
- `#128` 정리는 G4 결정 후

---

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
