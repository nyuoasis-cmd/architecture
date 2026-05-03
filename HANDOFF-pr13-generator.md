# HANDOFF-pr13-generator — Codex T2 Generator

> **프로젝트**: `architecture` (architecture.teachermate.co.kr)
> **브랜치**: `feat/preview-inline-ch02` (main 기준 분기)
> **작업 디렉토리**: `/home/claude/architecture/client/`
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §4.2 + §6)
> **상위 핸드오프**: `HANDOFF-pr13-planner-spec.md` (Sprint Contract C1~C12)
> **참조 패턴**: `client/src/demos/ch01/Q01Ramen.tsx` (PairFlow), `Q02Stage.tsx` (PairBinary), `Q03Restaurant.tsx` (PairMatch), `Q04Bookshelf.tsx` (PairVertical)

---

## 0. 작업 시작 전 환경 정리

```bash
cd /home/claude/architecture
git checkout main && git pull --ff-only
git log --oneline -1   # '249ab94 feat(landing): 한결 v1 §9.F 정합 ...' 확인
git checkout -b feat/preview-inline-ch02
```

---

## 1. 작업 단계 (순서 고정)

### STEP 1 — 신규 SVG 아이콘 추가

**`_shared/icons/metaphor.tsx`** 에 메타포 측 신규 아이콘 추가 (~16개):

```
가전 (HomeApplianceIcon) / 문구 (StationeryIcon) / 책 (BookIcon — 기존 ShelfIcon 과 별도) / 도구 (ToolIcon) /
자유 (FreedomIcon) / 구입 (PurchaseIcon) / 의무 (DutyIcon) / 학생 (StudentIcon) /
블록 (BlockIcon — 기존 동의어 없음 / 신규) / 박스 (BoxIcon) / 연결 (LinkIcon) / 설치 (InstallIcon) /
직접 (HandIcon) / 빌리기 (RentIcon) / 완성 (CompleteIcon) / 구독 (SubscribeIcon)
```

**`_shared/icons/computer.tsx`** 에 IT 측 신규 아이콘 추가 (~16개):

```
운영체제 (OsIcon — 기존 OsAllocateIcon 과 별도, 일반 OS 의미) / 드라이버 (DriverIcon) / 앱 (AppIcon) / 미들웨어 (MiddlewareIcon) /
오픈소스 (OpenSourceIcon) / 상용 (CommercialIcon) / GPL (GplIcon) / 학생용 (StudentLicenseIcon) /
모듈 (ModuleIcon) / 패키지 (PackageIcon) / 의존성 (DependencyIcon) / 설치 (InstallIcon — metaphor 와 충돌 시 ItInstallIcon 명명)
```

**`_shared/icons/cloud.tsx`** 에 클라우드 IT 측 (~4개):

```
IaaS / PaaS / SaaS / 구독 (SubscriptionIcon — metaphor 의 SubscribeIcon 과 별도)
```

> **규격**: SVG 24×24 viewBox, stroke="currentColor" strokeWidth={1.5}, fill="none". v1 ch01 SVG 패턴 그대로.
> **import**: 모두 `_shared/icons/index.ts` 의 `export *` 에 자동 노출. 수동 추가 불필요.

### STEP 2 — `client/src/demos/ch02/Q01Software.tsx` (PairMatch wide)

ch01 `Q03Restaurant.tsx` 패턴 복붙 후 다음 데이터로 교체:

```ts
// 라벨 (v2.2 §4.2 ch02_q01 정확 일치)
metaphorTitle: '생활 도구 분류'  (또는 적절한 메타포 제목)
itTitle: '소프트웨어 분류'
metaphor: [
  { icon: <Icons.HomeApplianceIcon />, label: '가전', sub: '사용' },
  { icon: <Icons.StationeryIcon />,    label: '문구', sub: '사용' },
  { icon: <Icons.BookIcon />,          label: '책',   sub: '사용' },
  { icon: <Icons.ToolIcon />,          label: '도구', sub: '사용' },
]
it: [
  { icon: <Icons.OsIcon />,         label: '운영체제',  sub: '사용' },
  { icon: <Icons.DriverIcon />,     label: '드라이버',  sub: '사용' },
  { icon: <Icons.AppIcon />,        label: '앱',        sub: '사용' },
  { icon: <Icons.MiddlewareIcon />, label: '미들웨어',  sub: '사용' },
]
tone: getTone(2)
```

SCENES 4개 (활성 인덱스 0~3 슬라이딩, 각 시나리오 title/summary/items/focus/logs).

### STEP 3 — `Q02License.tsx` (PairMatch wide)

```ts
metaphor: [
  { icon: <Icons.FreedomIcon />,   label: '자유', sub: '사용' },
  { icon: <Icons.PurchaseIcon />,  label: '구입', sub: '사용' },
  { icon: <Icons.DutyIcon />,      label: '의무', sub: '사용' },
  { icon: <Icons.StudentIcon />,   label: '학생', sub: '사용' },
]
it: [
  { icon: <Icons.OpenSourceIcon />,     label: '오픈소스',  sub: '사용' },
  { icon: <Icons.CommercialIcon />,     label: '상용',      sub: '사용' },
  { icon: <Icons.GplIcon />,            label: 'GPL',       sub: '사용' },
  { icon: <Icons.StudentLicenseIcon />, label: '학생용',    sub: '사용' },
]
tone: getTone(2)
```

### STEP 4 — `Q03Module.tsx` (PairFlow wide)

ch01 `Q01Ramen.tsx` 패턴 복붙. `metaphorTitle`, `itTitle` 적절 명명. 4단계 순차 흐름.

```ts
metaphor: [
  { icon: <Icons.BlockIcon />,   label: '블록', sub: '사용' },
  { icon: <Icons.BoxIcon />,     label: '박스', sub: '사용' },
  { icon: <Icons.LinkIcon />,    label: '연결', sub: '사용' },
  { icon: <Icons.InstallIcon />, label: '설치', sub: '사용' },
]
it: [
  { icon: <Icons.ModuleIcon />,     label: '모듈',     sub: '사용' },
  { icon: <Icons.PackageIcon />,    label: '패키지',   sub: '사용' },
  { icon: <Icons.DependencyIcon />, label: '의존성',   sub: '사용' },
  { icon: <Icons.ItInstallIcon />,  label: '설치',     sub: '사용' },
]
tone: getTone(2)
```

### STEP 5 — `Q04Cloud.tsx` (PairVertical square)

ch01 `Q04Bookshelf.tsx` 패턴 복붙. 4 페어 수직 위계.

```ts
pairs: [
  { metaphor: { icon: <Icons.HandIcon />,       label: '직접',   sub: '사용' },
    it:       { icon: <Icons.IaasIcon />,       label: 'IaaS',   sub: '사용' } },
  { metaphor: { icon: <Icons.RentIcon />,       label: '빌리기', sub: '사용' },
    it:       { icon: <Icons.PaasIcon />,       label: 'PaaS',   sub: '사용' } },
  { metaphor: { icon: <Icons.CompleteIcon />,   label: '완성',   sub: '사용' },
    it:       { icon: <Icons.SaasIcon />,       label: 'SaaS',   sub: '사용' } },
  { metaphor: { icon: <Icons.SubscribeIcon />,  label: '구독',   sub: '사용' },
    it:       { icon: <Icons.SubscriptionIcon/>,label: '구독',   sub: '사용' } },
]
tone: getTone(2)
```

### STEP 6 — `client/src/demos/registry.ts` 4 항목 추가

```ts
import Q01Software from './ch02/Q01Software';
import Q02License from './ch02/Q02License';
import Q03Module from './ch02/Q03Module';
import Q04Cloud from './ch02/Q04Cloud';

export const DEMO_REGISTRY: Record<string, DemoComponentMeta> = {
  // ... ch01 기존 4 항목 ...
  ch02_q01: { Component: Q01Software, layout: 'wide' },
  ch02_q02: { Component: Q02License, layout: 'wide' },
  ch02_q03: { Component: Q03Module,  layout: 'wide' },
  ch02_q04: { Component: Q04Cloud,   layout: 'square' },
};
```

### STEP 7 — Build + 자체 검증

```bash
cd client && npm run build      # PASS
cd ../server && npm run build   # PASS
cd ..

# Sprint Contract C3·C5·C6·C8 검증
grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos --include="*.tsx" --include="*.ts" | grep -v design-tokens.css   # 0 lines
grep -E "from ['\"]\.\.?/_shared/[^i]" client/src/demos/ch02/*.tsx                                                       # 0 lines
grep "getTone(2)" client/src/demos/ch02/*.tsx | wc -l                                                                     # = 4
grep -c "PairMatch\|PairFlow\|PairVertical" client/src/demos/ch02/*.tsx                                                   # 각 1 (총 4)
```

---

## 2. 라벨 텍스트 정확 검증 (C4 — 1자 misspelling 도 FAIL)

| 데모 | 메타포 4 | IT 4 |
|---|---|---|
| Q01Software | 가전 / 문구 / 책 / 도구 | 운영체제 / 드라이버 / 앱 / 미들웨어 |
| Q02License | 자유 / 구입 / 의무 / 학생 | 오픈소스 / 상용 / GPL / 학생용 |
| Q03Module | 블록 / 박스 / 연결 / 설치 | 모듈 / 패키지 / 의존성 / 설치 |
| Q04Cloud | 직접 / 빌리기 / 완성 / 구독 | IaaS / PaaS / SaaS / 구독 |

> 각 라벨 ≤ 8자 (LABEL_RULES). sub 는 모두 `'사용'` (sub ≤ 12자).

---

## 3. 센티넬 작성 (작업 완료 후)

작업 완료 시 다음 파일 생성:

```bash
mkdir -p /home/claude/architecture/qa/ao-logs
cat > /home/claude/architecture/qa/ao-logs/pr13-r1-gen.status <<EOF
{"status":"done","step":"pr13","role":"gen","model":"codex","session_id":"<your_session>","ts":"$(date -Iseconds)","branch":"feat/preview-inline-ch02","commits":["<sha1>","<sha2>"]}
EOF
```

> **AO 사각지대 #18 회피**: Generator 센티넬은 `verdict` 필드 없음. `status:done` 만 기록. `ao_collect_verdict`가 NO_VERDICT 표기해도 ALL PASS 가능 — Master 수동 점검.

---

## 4. 자기 평가 제약

- 의심스러우면 FAIL 으로 보고. C1~C12 중 1개라도 실패면 round 1 FAIL → round 2 재진입
- 라벨 1자 misspelling 도 FAIL (C4). Eval-Interaction 콘텐츠 1:1 검증에서 결국 잡힘
- 형태 매핑 잘못 (q03 을 Match 로 잘못 적용 등) → C5 grep 0 검증 강제

---

## 5. 완료 보고 형식

| # | 완료 기준 | 결과 | 근거 |
|---|----------|------|------|
| C1 | ch02 4 컴포넌트 파일 존재 | PASS/FAIL | ls 결과 |
| C2 | registry.ts 4 항목 추가 | PASS/FAIL | grep 결과 |
| C3 | _shared/index.ts 외 import 0건 | PASS/FAIL | grep 결과 |
| C4 | 라벨 v2.2 §4.2 정확 일치 | PASS/FAIL | grep 16건 모두 매칭 |
| C5 | 형태 매핑 정확 | PASS/FAIL | import 문 |
| C6 | getTone(2) 4건 | PASS/FAIL | grep |
| C7 | 신규 SVG 적절 분류 | PASS/FAIL | export 위치 |
| C8 | raw hex 0건 | PASS/FAIL | grep 결과 |
| C9 | validatePairSet throw 0건 | PASS/FAIL | dev mount |
| C10 | npm run build PASS | PASS/FAIL | exit 0 |
| C11 | TypeScript strict | PASS/FAIL | tsc -b |
| C12 | SCENES 4 키 | PASS/FAIL | grep |
