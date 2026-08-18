# 핸드오프 — architecture L1/L2/L3 QA 재판정 (2026-08-18)

> 대상 = `architecture` (architecture.teachermate.co.kr). 이 세션이 한 것 = **QA 3-Layer 완주 + 후속 2건**.
> 다음 세션은 아래 **§5 순차 진행**을 위에서부터 그대로 밟으면 된다.
> 정본 표준 = `shared/QA-LAYERS-STANDARD.md` · 등록부 = `shared/qa/registry.yaml`

---

## 1. 이번 판 결과

| 층 | 판정 | 실측 |
|----|:---:|------|
| L1 구조/인벤토리 | 🟢 | 분모 **138**(button 124·role 1·link 11·form 2) · 라우트 14 · 파일 241 · **의심 무핸들러 0** |
| L2 전수 클릭 | 🟡 **WARN** | 46화면 · **클릭 739** · 하드실패 0 · 죽은버튼 0 · SKIPPED 0 · 앱 AI 과금 0 · **soft 1** |
| L3 기능 계약 | 🟢 | prod **steps 11/11 PASS** · AI 소비 0(DB 되읽기) · teardown 잔존 0 |

- L2 대상 = **로컬 dev(5176/3003) + 실DB**. prod 블라인드 전수 크롤 금지(표준 §3) — 이 원칙 그대로 지켰다.
- L3 대상 = **prod**(밤샘 스모크와 같은 경로). `PRECLASS_AI_ROUTES` 는 켜지 않았다 = 💸 0원.
- QA 데이터 잔존 = 크롤 2회 + 스모크 후 `sql/004_qa_cleanup.sql` 적용, 4테이블 전부 **0** 되읽기 확인.
- 리포트: `shared/qa/crawler/reports/architecture/crawl-2026-08-18T07-58-27-614Z.{json,md}`
  · 앱-로컬 깊은 판 = `architecture/qa/reports/crawl-2026-08-18-ygyp/`
  · diff = `shared/qa/inventory/reports/coverage-diff.architecture.{json,md}`

## 2. 🐞 미해결 결함 1건 — 교사 학습 화면 DOM 중첩 (soft 1)

**증상** — `/learn/:sessionId?role=teacher` 에서 용어 사전 시트를 열면 React 19 콘솔 에러 3종:
`<h3>`·`<p>`·`<div>` cannot be a descendant of `<p>` / *This will cause a hydration error.*

**원인(코드 확정)**
- `client/src/components/learn/Glossary.tsx:278` — 시트(`role="dialog"`, 안에 `<h3>`·`<p>`)를 **인라인으로 렌더**한다.
- `client/src/components/learn/TeacherExplainPanel.tsx:62` (`renderText`) 와 `:281` (학생 질문 대비) 가 그 `<Glossary>` 를 **`<p>` 로 감싼다**.
- 결과: 브라우저가 시트를 `<p>` 밖으로 끌어내 재부모화한다 = 마크업이 의도한 자리에 없다.

**🚨 allowlist 하지 않았다** — 덮으면 다음 판부터 안 보인다. 고쳐서 없애는 게 맞다.

**🔑 이 경고는 새로 생긴 게 아니다.** 직전 판(클릭 127)에서는 **클릭 예산 12 뒤에 숨어 있었다**.
예산을 30 으로 올려 739 클릭이 되자 드러났다. 「예산이 커버리지뿐 아니라 실제 결함도 가린다」의 실물 증거.

## 3. 🚨 안 메워진 커버리지 구멍 — 좌측 강 이동

`ChapterNavPanel` 의 활성 이동 버튼(`← N강` · `N강 →`)이 **세 판 전부 클릭 0**이다.

| 판 | 예산 | 총 클릭 | 강 이동 seen | 강 이동 clicked |
|---|---:|---:|---:|---:|
| 공유 크롤러(직전) | 12 | 127 | 3화면 | 0 |
| 앱-로컬 크롤러 | 12 | 472 | **36화면** | 0 |
| 공유 크롤러(이번) | 30 | 739 | 0 | 0 |

- 세션 중 이 세션이 처음에 「예산 문제」로 진단했으나 **틀렸다** — 예산 30 으로도 안 닫혔다.
- 진짜 원인 = `core.mjs` 클릭 루프가 **인덱스 기반**(`handles[i]`)이라, 클릭으로 DOM 이 재배열되면
  뒤쪽 요소가 영영 그 인덱스에 안 온다. 예산을 올려도 순서가 바뀔 뿐이다.
- 참고: diff 의 「렌더후미클릭 2」(`← 이전 강`·`다음 강 →`)는 **비활성 자리표시자**라 정상이다(1강엔 이전이, 23강엔 다음이 없다).
  진짜 구멍은 그 옆의 **활성** 버튼이다. 둘을 혼동하지 말 것.

## 4. 이번 세션이 이미 고친 것 (전부 **미커밋**)

마스터 레포 `/home/claude` 워킹트리, 11파일:

| 파일 | 변경 |
|------|------|
| `shared/qa/crawler/core.mjs` | 예산 해석을 `env QA_MAX_CLICKS > manifest.maxClicks > 12` 로 |
| `shared/qa/crawler/types.d.ts` | `CrawlManifest.maxClicks?: number` 계약 추가 |
| `shared/qa/crawler/manifests/manifest.architecture.mjs` | `maxClicks: 30` 선언(+근거 주석) |
| `shared/qa/class-check/manifests/ai-routes.architecture.json` | 근거 문구의 없는 파일 참조 `vibe-my-turn.ts` → `lib/lab-ai.ts` (4곳) |
| `shared/qa/class-check/certs/architecture.json` | 「폐쇄 목록 6종」 → **5종** · 재결속 경위 note 추가 |
| `shared/QA-LAYERS-STANDARD.md` | §2 architecture 행 갱신 + §2.1 diff 표에 이번 판 행 추가 |
| `shared/qa/registry.yaml` | `evidence.patrol` 에 이번 판 기록(soft 1·강 이동 구멍 포함) |
| `shared/qa/inventory/reports/*` · `coverage-diff.*` | 산출물 갱신 |

검증 상태:
- `verify-qa-layers` 전 스텝 통과 — Step 2 계약 정합(`maxClicks` 선언 확인) · Step 5-B fail-open **0/8** · Step 6 드리프트 **0** · Step 6-B 모순 **0**.
- `node shared/qa/class-check/verify-cert.mjs architecture` → 🟢 **인증 유효**.
  배포가 07dd9fe→b4ef1ed 로 움직였지만 이동분이 docs 1파일뿐이라 검증기가 **인증 커밋을 유지**했다(재측정 불필요).
- 앱 레포(`/home/claude/architecture`)는 **무변경**. main = `b4ef1ed`(= 라이브).

## 5. 순차 진행 (다음 세션이 위에서부터)

### 5-1. Glossary 시트 포털화 — 앱 PR (§2 수리)
`Glossary.tsx` 의 시트를 `createPortal(…, document.body)` 로 뺀다. 시트는 이미 전면 오버레이라
`<p>` 안에 있을 이유가 없다. 감싸는 쪽(`TeacherExplainPanel`)을 고치면 두 자리를 다 손봐야 하고
앞으로 `<Glossary>` 를 쓰는 곳마다 같은 함정이 남는다 — **시트 쪽 한 번**이 맞다.

- 확인: `cd server && npm test` (157개) + 아래 5-3 재크롤에서 **soft 0** 확인
- 1 마일스톤 = 1 커밋 = 1 PR (`main` 머지 = prod 자동배포)

### 5-2. `priorityClicks` 훅 — 공유 코어 (§3 구멍)
`CrawlManifest.priorityClicks?: RegExp[]` 를 추가하고, `core.mjs` 클릭 루프가 **매 열거마다**
시그니처가 걸리는 요소를 먼저 클릭하도록 한다(인덱스 순서보다 우선). 그다음 `manifest.architecture.mjs` 에
`/BUTTON\|←\s*\d+강/`·`/BUTTON\|\d+강\s*→/` 를 등록.

- 🚨 코어는 11앱 공용이다 — 선택 필드로 두고 미선언 앱 동작은 **바이트 단위로 그대로** 둘 것.
- 고친 뒤 `verify-qa-layers` Step 1·2·5·5-B 를 반드시 다시 돌린다(계약 drift 검사가 여기 있다).
- 이빨 확인: architecture 재크롤에서 강 이동 clicked > 0 이 되는지로 판정한다. 안 되면 원인을 더 파고,
  숫자를 좋게 보이려고 라우트를 늘리지 말 것.

### 5-3. 재크롤 + 재판정
```bash
# 서버(별 셸): repo 루트 .env + QA 시크릿 로드 후
cd /home/claude/architecture
set -a; . ./.env; . ~/.claude/.secrets/architecture-real-flow-qa.env; set +a
QA_AUTH_ENABLED=true PORT=3003 npm run dev:server     # :3003
npm run dev:client                                     # :5176

# 크롤 + diff (마스터 레포에서)
cd /home/claude
set -a; . ~/.claude/.secrets/architecture-real-flow-qa.env; set +a
QA_CLIENT_URL=http://localhost:5176 QA_API_BASE=http://localhost:3003 \
  node shared/qa/crawler/run.mjs --app architecture
node shared/qa/inventory/coverage-diff.mjs --app architecture

# 잔존 회수(필수) — DATABASE_URL 을 argv 에 넣지 말 것(psql 이 실패 시 argv 를 되뱉는다)
cd /home/claude/architecture && psql -q -f sql/004_qa_cleanup.sql   # PG* 환경변수로 접속
```
- 기대: **soft 0** · 강 이동 clicked > 0 · 잔존 0.
- 끝나면 `shared/QA-LAYERS-STANDARD.md` §2 행과 `registry.yaml` evidence 를 **그날** 갱신한다.

### 5-4. 커밋
`/home/claude` 마스터 레포 11파일(§4)을 커밋한다. 5-2 를 먼저 했다면 코어 변경까지 한 덩어리로 묶어도 된다.
앱 PR(5-1)은 `nyuoasis-cmd/architecture` 쪽 별도 PR.

## 6. 재현에 필요한 사실 (매번 까먹는 것들)

- 로컬 dev 는 **repo 루트 `.env`** 하나로 뜬다(client `vite.config.ts` 의 `envDir: '..'`). client/server 개별 `.env` 없다.
- `/health` 가 아니라 **`/api/health`**. 지금 값 = `capPolicy: none`(앱 전역 캡이 실제로 없다) · `LAB_VOICE_ACTOR_PER_MIN 10`(per-key).
- 크롤러 뷰포트 = **390×844 모바일** 고정(코어 하드코딩, 매니페스트로 못 바꾼다). 데스크톱 3단 화면은 이 판정에 안 들어온다.
- 비용 게이트는 `/api/lab/{voice,ask,review,verify,submit,artifact,bundle}` 를 **forbiddenRoutes + blockRequest 이중**으로 막는다.
  철거된 `/api/chat`·`/api/vibe/my-turn` 패턴도 **일부러 남겨 뒀다** — 되살아나는 날 공짜로 잡힌다.
- 앱-로컬 크롤러(`architecture/qa/crawler`)는 보조로 병존한다. 표준 판정은 공유 파이프라인 쪽이다.

---

## 7. ✅ §5 완료 기록 (2026-08-18, 같은 날 후속 세션)

**§5 전 단계를 밟았고 미결 2건이 둘 다 닫혔다. 이 문서의 §5 는 더 실행하지 말 것** — 아래가 결과다.

| | 직전 판 | 이 판 |
|---|---|---|
| L2 판정 | 🟡 WARN(soft 1) | 🟢 **soft 0** |
| 클릭 | 739 | 762 |
| 강 이동 clicked | 0(세 판 연속) | **35**(35화면 전부) |
| diff 매칭 / 렌더후미클릭 | 21 / 2 | 22 / **0** |
| 잔존 | 0 | 0(4테이블 되읽기) |

- **5-1** — `Glossary.tsx` 시트를 `createPortal(document.body)` 로. PR **#262** 머지·배포.
  allowlist 가 아니다 — 재크롤이 그 시트를 **실제로 열고**(교사 화면 `clickedSigs` 에 용어 버튼 있음)
  콘솔 0 을 확인했다.
- **5-2** — 공유 코어에 `priorityClicks?: RegExp[]`(선택) 훅. 미선언 앱은 그 블록에 진입하지 않아
  11앱 공용 코어의 기존 동작 불변. 마스터 `d089338`.
  🔑 §3 의 진단(「예산이 아니라 인덱스 기반 클릭 순서」)이 **맞았다** — 훅 하나로 0→35.
- **5-3** — 재크롤·diff·잔존 회수 완료. 🚨 첫 크롤은 버렸다: `nohup` 으로 띄운 dev 서버가
  도구 호출 종료와 함께 죽어 교사 라우트가 502·클릭 0 이 됐다(soft 10 = 전부 502).
  **서버는 세션이 붙들고 있는 방식으로 띄울 것** — 죽은 서버는 «결함 없음» 이 아니라 «못 본 것» 이다.
- **5-4** — 마스터 `d089338` 커밋·푸시.

### 곁가지로 나온 것 둘

1. **PR #263** — `testRegistration` 의 SKIP_DIRS 가 `.worktrees` 는 거르는데 orca 워크트리
   `.orca/worktrees/` 는 안 걸러, 워크트리를 쓰는 로컬에서만 264개 중 1개가 빨갰다(CI 는 초록 =
   **재현 안 되는 빨강**). `.orca` 추가로 264/264.
2. **class-check 인증서가 만료됐다 → 재인증.** 두 PR 배포로 인증 커밋이 07dd9fe→45a620b 로
   움직였는데, 원인은 **클라이언트 표현 컴포넌트 1 + 테스트 파일 1** 이고 AI 호출부·큐·라우트는
   한 줄도 안 움직였다. 게이트가 경로 기반 fail-closed(무해 = `*.md`·`qa/`·`docs/`)라 만료로
   잡힌 것이다. 🚨 **무해 목록을 넓히지 않았다** — 그건 게이트를 조용히 무르게 만든다.
   조치 = 재인증(`--record`) + 축2-b 재실행(폐쇄 목록 **5/5 🟢**, 운영 quota 5회 실소비) +
   declared 7건 근거 재확인 후 재선언(실행 0·과금 0). 마스터 `ed0e7dd`.
   결과 30명 산수 = R8 **68명** 🟢 · 측정 안 된 병목 8개 → **3개(R3·R9·R11)** 로 복귀.
   🔑 **다음에도 같은 일이 난다**: 이 앱은 client 파일 한 줄만 배포해도 인증이 만료되고,
   그 만료는 원장 E2 를 깨서 축2-b 재실행(=실과금)과 declared 재선언을 부른다.
   앱 PR 을 머지하는 날 **그날 안에** 재인증까지 묶어서 처리할 것.
