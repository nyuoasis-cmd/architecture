# HANDOFF-pr13-eval-visual — Codex T3 Eval Visual

> **프로젝트**: `architecture`
> **검증 브랜치**: `feat/preview-inline-ch02` (Generator 결과)
> **base 비교**: `main` (PR #29~32 머지 — ch01 4 데모 baseline)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §6.2)
> **상위 핸드오프**: `HANDOFF-pr13-planner-spec.md` (Sprint Contract 3.2)

---

## 0. 검증 시작 전 환경 정리

```bash
cd /home/claude/architecture
git fetch --all
git checkout feat/preview-inline-ch02
cd client && npm install --no-audit --no-fund && npm run dev   # localhost:5176
```

---

## 1. 검증 대상 (8 화면)

| 데모 | 데스크탑 URL (1440×900) | 모바일 URL (393×852) |
|---|---|---|
| ch02_q01 Software | `http://localhost:5176/library/2/ch02_q01` | 동일 (Chrome DevTools 모바일 시뮬) |
| ch02_q02 License | `http://localhost:5176/library/2/ch02_q02` | 동일 |
| ch02_q03 Module | `http://localhost:5176/library/2/ch02_q03` | 동일 |
| ch02_q04 Cloud | `http://localhost:5176/library/2/ch02_q04` | 동일 |

각 화면 시나리오 칩 클릭 4회 (활성 인덱스 0,1,2,3) — 메타포 + IT 동시 활성화 확인.

---

## 2. 시각 체크리스트 (v2.2 §6.2 — 9항)

### per-demo per-viewport (ch02 4 × 2 = 8 회 적용)

- [ ] **frame 0**: 폰 프레임·노치·둥근 검정 베젤 없음 (ch01 패턴 동일)
- [ ] **3단 구조**: Hero (cyan-50 그라디언트) → Pair Block (메타포 + 커넥터 "같은 원리" + IT) → State + Log 순서 유지
- [ ] **동시 활성화**: 시나리오 칩 클릭 → 메타포 셀과 IT 셀이 같은 인덱스에서 동시에 cyan-600 으로 변함 (한쪽만 변하면 FAIL)
- [ ] **활성·비활성 대비**: 활성 셀 border = `var(--demo-accent-ch02)` (#0891b2), 배경 = `var(--demo-accent-soft-ch02)` (#ecfeff). 비활성 = border `var(--color-border)`, 배경 `#fff`
- [ ] **SVG 가시성**: 모든 셀에 SVG 아이콘. 활성 시 stroke = cyan-600, 비활성 시 stroke = `var(--color-text-muted)`
- [ ] **accent tone WCAG**: 활성 라벨 텍스트(text-cyan-900 또는 stone-900) 와 cyan-50 배경 대비비 ≥ 4.5:1 (AA). chrome DevTools contrast checker 1 셀 spot-check per demo
- [ ] **너비 정합**: q01·q02·q03 layout=wide → 콘텐츠 max-width 860px / q04 square → 640px. 1440px viewport 좌우 여백 균등
- [ ] **모바일 줄바꿈**: 393px viewport 에서 라벨이 1~2줄로 자연 줄바꿈 (3줄 이상 = FAIL). word-break: keep-all 적용
- [ ] **모바일 그리드 변환**: wide 4-col → 2-col, square 2-col → 1-col 자동 stack

### baseline 일관성 (vs ch01)

- [ ] **간격**: Hero 와 Pair Block 사이 24~32px (ch01 동일). Pair Block 의 메타포 행/IT 행 간격 16~24px
- [ ] **SVG 굵기**: stroke-width 1.5 (ch01 동일). 굵기 다르면 FAIL
- [ ] **타이포**: title 18~20px, label 14px, sub 11~12px (ch01 동일)
- [ ] **챕터 톤 차별화**: ch01 (orange-600) vs ch02 (cyan-600) 한 눈에 구별

---

## 3. 모바일 1뷰포트 정합 (선택 — 추가 검증)

각 데모 모바일 393×852 에서 **첫 화면(스크롤 0px)** 에 다음이 모두 보여야 함:
- Hero (제목 + 요약 1~2줄)
- Pair Block 메타포 행 1~2칸 (또는 더 많이 보이면 OK)
- 시나리오 칩 (위 또는 아래)

페이지 로드 직후 스크롤 없이 PairFlow/PairMatch 의 첫 칸만 보여도 OK. 단 Hero 가 잘려서 안 보이면 FAIL.

---

## 4. 비교 baseline

`qa/preview-baseline/` 의 ch01 4 PNG (PR-12 캡처) 와 비교. 톤·간격·SVG 굵기 일관성 정성 평가.

---

## 5. Verdict 출력

작업 완료 시 센티넬 작성:

```bash
cat > /home/claude/architecture/qa/ao-logs/pr13-r1-eval-visual.status <<EOF
{"status":"done","step":"pr13","role":"eval-visual","model":"codex","session_id":"<your_session>","ts":"$(date -Iseconds)","verdict":"PASS","fail":0,"revise":0,"sha":"<base_sha>","notes":"ch02 4 데모 9항 모두 통과"}
EOF
```

verdict:
- **PASS**: fail=0 AND revise=0
- **REVISE**: fail=0 AND revise>0 (round 2 보완 권고)
- **FAIL**: fail>0 (round 2 재진입 필수)

revise/fail 항목은 `notes` 에 demo+체크리스트 항목 명시.

> **AO 사각지대 #14 회피**: SHA mismatch false alarm — `<base_sha>` 는 검증 시점의 `git rev-parse HEAD` 결과 그대로 기록. Generator 의 마지막 커밋 SHA 와 일치해야 함.
