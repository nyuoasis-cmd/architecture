# HANDOFF-pr3-5-round1 — teacher-glossary 30 용어 데이터 채움

> **프로젝트**: `architecture`
> **PR**: PR-3.5 — `client/src/data/teacher-glossary.ts` 30 entry 채움 (PR-2 에서 빈 shell 생성, Glossary 컴포넌트 이미 존재)
> **base**: `ao/teacher-explain-pr3` (stacked — PR #89 후속)
> **작업 브랜치**: `ao/teacher-explain-glossary`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-teacher-explain-v1.md` v2.1 §4.4.1 + §9.6
> **에픽 위치**: 7-PR 직렬 5/7

---

## 0. 메타

| key | value |
|---|---|
| step | pr3-5 |
| round | 1 |
| branch | ao/teacher-explain-glossary |
| base | ao/teacher-explain-pr3 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **generator model override** | **codex** (콘텐츠 작성 — 30 용어 oneline) |
| **eval-visual model override** | **codex** (Glossary 컴포넌트 동작 회귀 — 데스크탑 tooltip + 모바일 bottom sheet) |
| **eval-interaction model override** | **codex** (4종 닫힘 + ARIA — light) |

---

## 1. 변경 범위

| 파일 | 변경 |
|------|------|
| `client/src/data/teacher-glossary.ts` | 빈 array → **30 entry** (§4.4.1 우선 용어: CPU/RAM/SSD/GPU/ALU/레지스터/캐시/메모리/버스/OS/커널/스레드/프로세스/인터럽트/API/REST/HTTP/HTTPS/DNS/CDN/DB/SQL/NoSQL/인덱스/트랜잭션/ACID/도커/컨테이너/AI/LLM 또는 합리적 30선) |

**컴포넌트 변경 0** — Glossary.tsx 이미 PR-2에서 완성 (Tooltip + bottom sheet + ARIA).

---

## §A. Generator (Codex)

### §A 시작 단계 (절대 준수)

1. `cd /home/claude/architecture`
2. `git fetch origin` — **필수**
3. `git checkout ao/teacher-explain-glossary` — 본 브랜치 사용
4. `git log --oneline -1` 확인 — `b0a4a48 feat: ch01 설명 노트 정식 콘텐츠 작성` 직후
5. **본 HANDOFF + SDD §4.4.1 (GlossaryEntry 타입 + 30 용어 가이드) + §9.6 + 현 client/src/data/teacher-glossary.ts (빈 shell) + client/src/components/learn/Glossary.tsx (소비자 컴포넌트)** 본문 읽기 필수
6. 모든 commit 본 브랜치 위에 직접
7. `git push origin ao/teacher-explain-glossary`

### §A 작업 — 30 entry 채움

`client/src/data/teacher-glossary.ts`:

```ts
export interface GlossaryEntry {
  term: string;             // 정확 일치 매칭
  aliases?: string[];       // 별명/한글표기
  oneline: string;          // ≤60자 1줄 풀이 (~합니다 0건)
  category?: 'hw' | 'sw' | 'net' | 'data' | 'cloud';
}

export const GLOSSARY: GlossaryEntry[] = [
  // 30 entry — 책 8-gram 차용 0% (CLAUDE.md 정책 강화)
  // 비전공자 친화 톤 (비유 + 짧은 풀이)
];
```

**용어 30개 가이드라인**:
- HW (10개): CPU / RAM / SSD / GPU / ALU / 레지스터 / 캐시 / 메모리 / 버스 / 인터럽트
- SW (5개): OS / 커널 / 프로세스 / 스레드 / 컨테이너
- 네트워크 (5개): API / REST / HTTP / HTTPS / DNS
- 데이터 (5개): DB / SQL / 인덱스 / 트랜잭션 / ACID
- 클라우드/AI (5개): CDN / 도커 / IaaS / AI / LLM

또는 Generator 자율 — 30 항목 합리적 선택 + 각 카테고리 분포.

**oneline 정책**:
- ≤60자
- 비유 + 짧은 풀이 (예: "두뇌처럼 명령을 해석하는 부품" — CPU)
- ~합니다 종결 0건 (~예요 / ~입니다 OK)
- 책 인용 0% (CLAUDE.md 정책)
- 한 문장

**aliases 정책**:
- 한글 표기 (CPU → '중앙처리장치')
- 줄임말 (HTTPS → 'https')
- 1~3 alias 권장

### §A 절대 금지

- Glossary.tsx 컴포넌트 변경
- 다른 컴포넌트 / 데이터 변경
- 책 인용
- main push, force push

### §A 검증

1. `cd client && npm run build` 무에러
2. `grep -c "term:" client/src/data/teacher-glossary.ts` = 30
3. oneline 길이 검증: `node -e "const {GLOSSARY} = require('./client/src/data/teacher-glossary.ts'); GLOSSARY.forEach(g => { if (g.oneline.length > 60) console.log('TOO LONG:', g.term, g.oneline.length); });"` (또는 ts-node) — 위반 0건
4. ~합니다 종결 0건: `grep -c "~합니다" client/src/data/teacher-glossary.ts` = 0

### §A 완료 시 센티넬

`qa/ao-logs/pr3-5-r1-gen.status`:
```json
{"status":"done","step":"pr3-5","role":"gen","model":"codex","session_id":"<arch-NN>","ts":"<ISO8601>","branch":"ao/teacher-explain-glossary","commit":"<SHA>","pr":"pending-master","loc":"+X -Y","note":"teacher-glossary 30 entry. oneline ≤60자 모두, ~합니다 0건, build PASS."}
```

---

## §B. Eval-Visual — light

### §B 시작 단계

1. **`git fetch origin && git checkout ao/teacher-explain-glossary && git pull --ff-only`** — 필수, branch 정확
2. Generator sentinel 확인
3. 별도 브랜치: `codex/eval-visual-pr3-5-r1`

### §B 검증 V1~V3

| # | 항목 |
|---|------|
| V1 | TeacherExplainPanel 렌더 시 본문 안 용어 점선 밑줄 노출 (CPU/RAM/OS 등 첫 등장) |
| V2 | 데스크탑 hover → Tooltip 노출 + oneline 텍스트 |
| V3 | 모바일 393px tap → bottom sheet 30vh 슬라이드 업 |

`qa/ao-logs/pr3-5-r1-eval-visual.status` + `qa-eval/pr3-5-eval-visual-round1.json`.

---

## §C. Eval-Interaction — light

### §C 시작 단계

1. **`git fetch origin && git checkout ao/teacher-explain-glossary && git pull --ff-only`** — 필수
2. Generator sentinel 확인
3. 별도 브랜치: `codex/eval-interaction-pr3-5-r1`

### §C 검증 I1~I4

| # | 항목 |
|---|------|
| I1 | client + server build PASS (회귀) |
| I2 | bottom sheet 4종 닫힘 (backdrop / ESC / 드래그 50px+ / ✕ 버튼) §4.4.1.1 |
| I3 | ARIA — `role="dialog"` + `aria-modal="true"` + `aria-labelledby` + 포커스 트랩 |
| I4 | term aliases 매칭 — 한글 alias 본문 등장 시 Tooltip/sheet 동일 동작 |

`qa/ao-logs/pr3-5-r1-eval-interaction.status` + `qa-eval/pr3-5-eval-interaction-round1.json`.

---

## 2. Master verdict 절차

3/3 PASS → `gh pr create --base ao/teacher-explain-pr3 --head ao/teacher-explain-glossary`. REVISE → master 직접 fix 우선.

---

## 3. PR-3 학습 반영

| 학습 | PR-3.5 적용 |
|------|---------|
| arch-164 worktree HEAD=main 사고 (PR-3 fetch 누락) | §B/§C 시작 단계 1번에 `git fetch && git checkout` 강제 명시 + 별도 브랜치 명 prefix `codex/eval-{role}-pr3-5-r1` 사용 |

---

## 변경 기록

| 날짜 | 변경 |
|---|---|
| 2026-05-04 | 초기 작성. 7-PR 직렬 5/7. data-only |
