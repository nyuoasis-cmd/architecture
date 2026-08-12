# Codex 작업 브리프 — architecture PR2 · PR3 (에픽 2/3, 3/3)

> 작성 2026-08-12. 앞 단계 = **PR1 머지 대기**(PR #198, 브랜치 `architecture-qa-260812`).
> 상위 결정 정본 = `docs/HANDOFF-lesson-plan-teardown-2026-08-12.md` — **먼저 읽을 것.**
> 대상 = `architecture` (`architecture.teachermate.co.kr`, **라이브**). 기본 브랜치 **`main`** = 머지 시 prod 자동배포.

---

## 0. 착수 전 (실측, 생략 금지)

```bash
cd /home/claude/architecture            # ← worktree 아님. 여기서 작업한다
git fetch origin && git checkout main && git pull
npm install && (cd server && npm install)
cd server && npm test                   # 베이스라인을 눈으로 확인하고 적어 둘 것
```

🚨 **PR1(#198)이 아직 main 에 없으면 PR2 를 시작하지 말 것.** PR2 의 입력 파일
(`docs/lesson-plan-salvage-ch11-23.md`)과 계약(`teacherExplainContract.test.ts`)이 PR1 에 들어 있다.

🔑 **그럴 때는 멈추지 말고 PR3 를 먼저 한다.** PR3 는 PR1 과 **의존이 없다**(건드리는 파일이
겹치지 않는다 — PR1 = 교사 노트·교안 철거, PR3 = 학생 학습 화면 이동). 순서는 다음과 같다:

```bash
gh pr view 198 --json state,mergedAt -q '.state + " " + (.mergedAt // "미머지")'
```
- `MERGED` → PR2 먼저, 그다음 PR3
- 아직 열려 있음 → **PR3 부터** 하고, PR1 이 머지된 뒤 PR2 를 한다
- 에픽 번호(2/3·3/3)는 **작업 내용에 붙은 이름표**다. 순서가 바뀌어도 번호는 그대로 쓴다

🚨 **베이스라인을 못 잡은 채 «테스트 통과»를 보고하지 말 것**(QA 진실성 게이트).
숫자는 기억·요약이 아니라 그 자리에서 돌린 명령의 출력으로만 말한다.

---

## 1. 지켜야 할 전제 (뒤집지 말 것)

| # | 전제 |
|---|---|
| P1 | 다른 IT 비전공 교사가 이 앱으로 수업한다 |
| P2 | 북극성 = 비전공자도 IT 전체 그림을 30분 안에 이해한다 |
| P3 | **수업 진행 시간 표기 금지** — 「N분째」·총 소요시간·칸별 분. `teacherExplainContract` ⑤ 가 잡는다 |
| P4 | **수업 흐름은 교사가 정한다.** 앱이 진행을 지시하거나 페이싱하지 않는다 |
| P5 | 교사 화면 = 학생 화면의 **상위집합**. 교사 전용은 `ContentPanel` 의 `if (teacherPanel)` **한 블록 안에서만** |
| P6 | 책 『기술노트』 차용 0% — 모든 학생 노출 콘텐츠는 fresh 자가 생성 |
| P7 | **동그라미 숫자(①②③) 금지** — 줄머리 목록은 `1)`. 문서·PR·커밋·코드 주석·터미널 출력 전부 |

🚨 **「📋 교안」을 되살리지 말 것.** 2026-08-12 에 철거했다. `learnLayoutContract` ⑦ 이
`ContentPanel` 에서 부활을 빨갛게 잡는다. 「수업을 어떤 순서로 하라」를 앱이 다시 말하기
시작하면 P4 가 무너진다.

🚨 **1 마일스톤 = 1 커밋 = 1 PR.** PR2 와 PR3 는 **각각 별도 브랜치 + 별도 PR**이다. 섞지 말 것.
PR 시작 전 「이번 PR = 에픽 N/3, 잔여 Y」, 머지 전 「머지 후 사용자 입장에선 Z만 적용」을 본문에 적는다.

---

## 2. PR2 (에픽 2/3) — 설명 노트 ch11~ch23 신규 67개

### 머지 후 사용자 입장에서 바뀌는 것
11~23강에서 교사가 「📋 설명 노트」 탭을 열면 **«불러올 문항 정보가 올바르지 않아요» 고장 문구 대신 노트가 뜬다.**

### 지금 상태 (실측으로 재확인할 것)
- 노트는 `ch01`~`ch10` **64개**만 있다 → `server/src/data/teacher-explain/chNN_qNN.ts`
- 전체 문항 **131개** → 부족분 **67개**(ch11~ch23)
- 등록부 = 같은 디렉토리 `index.ts` — 신규 파일을 **import 목록과 `RAW_BLOCKS` 양쪽에** 넣어야 실린다
- 🚨 정확한 문항 목록은 **손으로 적지 말고 데이터에서 뽑을 것**:
  ```bash
  cd /home/claude/architecture/server && npx tsx -e "
  const {QA_STUBS}=require('../client/src/data/qa-stubs');
  const {TEACHER_EXPLAIN}=require('./src/data/teacher-explain/index');
  const missing=QA_STUBS.map(q=>q.id).filter(id=>!TEACHER_EXPLAIN[id]);
  console.log('없는 노트',missing.length); console.log(missing.join(' '));"
  ```

### 재료
🔑 **`docs/lesson-plan-salvage-ch11-23.md`** — 철거된 교안에서 건진 원재료다. 장별로
`realLife` / `note` / `demoTip` / 교실 운영이 이미 갈라져 있다. **이걸 먼저 읽고 쓰기 시작한다.**
문항 본문·선지·해설은 `client/src/data/qa-stubs.ts` 와 `client/src/data/learn-extras*`(견학·사례·내 차례)에 있다.

### 스키마 (`server/src/data/teacher-explain/types.ts`) — 건드리지 말 것
| 필드 | 필수 | 상한 |
|---|---|---|
| `qaId` | ✓ | `chNN_qNN` |
| `tldr` | ✓ | **30~50자** (하한 있음 — 가장 자주 걸린다) |
| `misconception` | ✓ | 250 |
| `relatedQas` | ✓ | 1~3개, **실존 문항만** |
| `goal` | ✓ | 200 |
| `cue` | ✓ | 150 |
| `concept` · `mechanism` | ✓ | 각 300 |
| `realLife` | ✓ | 250 |
| `prompts` | ✓ | **3~5개**, 각 `q` 80 / `a` 200 |
| `beforeDemo` | ✓ | 200 |
| `note` | ✓ | 200 |
| `advanced` | 선택 | `technicalSpec` · `friendlyExplanation` 각 500 |
| `demoTip` | 선택 | `scenarioOrder` · `studentReaction` 각 300 |

### 품질 기준 — 이게 이 PR 의 본체다
🚨 **형판(템플릿)으로 찍지 말 것.** 기존 ch02·ch04~ch10 노트에 이런 상투 꼬리가 복붙돼 있고,
PR1 에서 39곳을 걷어냈다. **같은 것을 67개 새로 만들면 이 PR 은 실패다.**
- ✗ *"…라는 점을 끝에 다시 묶어 주세요. 학생이 용어보다 판단 기준을 가져가게 만드는 편이 좋습니다."*
- ✗ *"질문을 생활 장면으로 다시 돌려주면 학생이 자기 경험으로 개념을 재구성하곤 해요."*
- ✗ `realLife` 에 `mechanism` 문장을 그대로 복사해 넣기(ch09_q05 의 `prompts` 가 그 사고다)

대신 **salvage 문서의 구체적인 사고 사례·장간 연결·견학 운영 요령을 쓴다.** 손으로 쓴 `ch01_*` 계열이
품질 기준선이다 — 그걸 읽고 톤을 맞춰라.

🔑 문체 = 교사에게 **존댓말로 말 거는** 톤(«…해 주세요», «…하면 좋습니다»). 학생용이 아니다.
🔑 `«»` 인용부호와 `—` 줄표를 쓰는 기존 관습을 따른다.

### 완료 기준
```bash
cd /home/claude/architecture/server && npm test    # teacherExplainContract ①~⑥ 전부 초록
# [설명 노트 계약] 파일 131개 / 실린 노트 131개 / 전체 문항 131개  ← 이 줄이 나와야 한다
cd /home/claude/architecture && npm run build
```
- 계약 ① 이 «파일은 있는데 안 실렸다»를 잡는다 = 스키마 위반이 조용히 넘어가지 않는다
- 🚨 CLAUDE.md 「현재 단계」의 노트 개수(**64/131**)를 같은 PR 에서 갱신할 것
- 🗑️ **`docs/lesson-plan-salvage-ch11-23.md` 를 같은 PR 에서 삭제한다** — 소모품이다. 다 옮겼으면 지운다

---

## 3. PR3 (에픽 3/3) — 학생이 본문 끝에서 막힌다 (sev4)

### 머지 후 사용자 입장에서 바뀌는 것
학생이 한 문항을 다 보고 나서 **다음 문항으로 갈 문이 생긴다.**

### 증상 (2026-08-12 실측)
- `ReadTab` 의 「다음 →」 버튼은 **탭만 넘긴다**(`ContentPanel:208` `nextTab = tabs[tabs.indexOf('read')+1]`).
- 마지막 탭(보통 📝 퀴즈)을 끝내면 **다음 문항으로 가는 버튼이 아무 데도 없다.**
- 좌측 `ChapterNavPanel` 에는 「← 이전 강 / 다음 강 →」(**강** 단위)만 있고 **문항 단위 이동이 없다.**
  문항은 목록을 직접 눌러야 바뀐다.
- 🚨 **모바일에서 더 나쁘다** — 3컬럼이 접히면서 좌측 네비가 아예 다른 탭(`MobileTab = 'nav'`)이라,
  학생은 «끝났는데 뭘 눌러야 하는지» 알 수 없다.
- 증거 = `~/.claude/projects/-home-claude/memory/saenaegi/audit/saenaegi-architecture-first-2026-08-12-1e34/`

### 제약
- 🚨 **P4 를 어기지 말 것.** 「다음 문항으로 가라」고 **떠밀지** 않는다 — 문을 **열어 두는** 것뿐이다.
  자동 이동·카운트다운·«N초 후 다음»·강제 진행 전부 금지.
- 🚨 마지막 문항에서는 다음 문항이 없다 — 그 자리에 «준비 중» 같은 빈 상자를 띄우지 말 것.
  버튼을 **안 그리거나**, 「다음 강」으로 자연스럽게 잇는다.
- 진열 순서 정본 = `client/src/data/chapter-order.ts`. 🚨 **화면의 「N강」과 속 이름표(chNN)는 다르다.**
  화면에 속 이름표를 찍으면 `chapterOrderContract` ⑥ 이 빨개진다 — `lessonNo` 를 쓸 것.
- 교사 전용 탭(`explain`)에는 이 문을 달지 않는다(P5).

### 접근은 네가 정한다
다만 **계약을 하나 남길 것** — 이 문이 조용히 사라지거나 P4 를 어기는 형태로 바뀌는 걸 잡는 회귀 계약.
`server/src/lib/` 에 두고 기존 계약 파일들의 관용구(«왜 있는가» 머리말 + 실패할 수 있는 계측인지 확인)를 따른다.
🚨 계약이 «0건을 검사하고 초록»이 되지 않게 대조 대상이 비어 있지 않은지 반드시 같이 검사한다.

### 완료 기준 (GWT)
- **Given** 학생이 한 문항의 마지막 탭을 끝냈다, **When** 화면 아래를 본다, **Then** 다음 문항으로 갈 문이 있다.
- **Given** 그게 그 강의 마지막 문항이다, **When** 같은 자리를 본다, **Then** 빈 상자나 죽은 버튼이 없다.
- **Given** 모바일 폭(390px)이다, **When** 문항을 끝낸다, **Then** 좌측 네비 탭으로 넘어가지 않고도 다음으로 갈 수 있다.
- 서버 테스트 전부 초록 · `npm run build` 통과

---

## 4. 공통 — 막히면

- 🚨 **가설 기반 수정이 2회 연속 검증 실패하면**, 다음 시도는 무조건 **진단 로그 추가**로 전환한다.
  추측 누적 금지(글로벌 디버깅 정책).
- 🚨 **파급성 큰 결정**(모델 교체·비용·스키마 변경·정책 위반 소지)은 **단독으로 내리지 말고 jery 에게 선택지·트레이드오프와 함께 올린다.**
- 판단이 갈리는데 정보가 없으면 **멈추고 물어라.** 조용히 정하고 진행하는 쪽이 더 큰 위반이다.

## 5. PR 본문에 반드시 넣을 것

1. 「이번 PR = 에픽 N/3, 잔여 Y」 · 「머지 후 사용자 입장에선 Z만 적용」
2. **안 하는 것** 목록
3. 완료 기준 GWT
4. 검증 — **그 자리에서 돌린 명령의 실제 출력**(테스트 수 before/after, 빌드 결과). 기억으로 쓰지 말 것
5. PR 제목은 단정형 금지 → 명시형 (`§5.3`)

---

## 6. 🚨 1차 위임 실패 기록 (2026-08-12) — 재시도 전에 반드시 읽을 것

**결과 = 산출물 0.** Codex 가 PR3 를 «구현·검증·커밋 완료»로 보고했지만 **디스크에 아무것도 남지 않았다.**

| Codex 보고 | 실측 |
|---|---|
| 커밋 `4e6f944` 완료 | 레포·워크트리·자기 클론 어디에도 **없다** |
| `nextQuestionDoorContract.test.ts` 신설 | 파일 **없음** |
| 착수 전 18/18 → 완료 19/19 | 실제 서버 테스트는 **128개**(PR1 머지 후). 그 숫자가 나올 수 없다 |
| PR2 미착수 (PR1 미머지라서) | PR1 은 그때 이미 머지돼 있었다 — `gh` 조회가 망 차단으로 실패한 것을 «미머지»로 읽었다 |

결정적 증거 — 브랜치 reflog 에 커밋 기록이 없다:
```
80f0abf refs/heads/codex/pr3-student-next-question@{0}: branch: Created from github/main
```

🔑 **Codex 가 거짓 보고를 한 게 아니다.** `git commit` 은 exit 0 이었고, 자기 샌드박스 안에서 본 사실을
그대로 말했다. 그 샌드박스가 폐기된 것이다. **에이전트 보고를 그대로 옮기지 말고 디스크에서 확인할 것.**

### 확정된 원인 (하나)
외부 DNS 차단 — `git push` · `gh` 전부 `Could not resolve host: github.com` (exit 128).
`~/.codex/config.toml` 에 sandbox·network 설정이 **없어** CLI 기본값(네트워크 차단)으로 돌았다.

### 미확정 (더 중요한 쪽)
**쓰기 유실의 기전은 확정하지 못했다.** Codex 는 워크스페이스가 아니라 `/tmp/architecture-pr2-pr3-Sx12Pv`
에 자기 클론을 떠서 작업했고, 그 클론은 남아 있는데 커밋 오브젝트만 없다.
🚨 **망만 열고 재시도하면 또 빈손이 될 수 있다.** 재시도 전 아주 싼 검증부터:
```
codex 에게: "/home/claude/architecture/ZZZ-write-test.txt 에 hello 를 쓰고 git status 를 보여 줘"
→ 사람이 직접 그 파일이 남았는지 확인. 안 남으면 망이 아니라 샌드박스부터 고쳐야 한다.
```

### 재시도 시 반드시 바꿀 것
1. 🚨 **Codex 에게 `git push` · `gh pr create` 를 시키지 말 것.** 구현·테스트·**커밋까지만** 시킨다.
   push 와 PR 생성은 Claude(또는 사람)가 한다 — 실패 지점을 하나 줄이는 게 목적이다.
2. 🚨 **자기 클론을 뜨지 말고 지정한 경로에서 직접 작업하게 할 것.** 어디서 작업했는지를 보고에 적게 한다.
3. 🚨 완료 보고에 **`git -C <경로> log --oneline -1` 과 `git status --porcelain` 의 실제 출력**을 넣게 할 것.
   «커밋했다»는 문장이 아니라 그 출력이 증거다.
4. 서버 테스트 숫자는 `npm test` 의 `ℹ tests N` 줄을 그대로 인용하게 할 것 — 파일 개수와 혼동한 정황이 있다.
