# HANDOFF-pr13-eval-interaction — Codex T4 Eval Interaction

> **프로젝트**: `architecture`
> **검증 브랜치**: `feat/preview-inline-ch02` (Generator 결과)
> **단일 진입점 SDD**: `/home/claude/architecture/SDD-preview-inline-v2.md` (v2.2 §6.1 + §6.3)
> **상위 핸드오프**: `HANDOFF-pr13-planner-spec.md` (Sprint Contract 3.3)

---

## 0. 검증 시작 전 환경 정리

```bash
cd /home/claude/architecture
git fetch --all
git checkout feat/preview-inline-ch02
cd client && npm install --no-audit --no-fund
```

---

## 1. 자동 검증 (CI 차단 가능 — §6.1)

### 1.1 Build PASS

```bash
cd client && npm run build      # PASS 필수
cd ../server && npm run build   # PASS 필수
```

FAIL 시 즉시 verdict=FAIL.

### 1.2 raw hex 0건

```bash
grep -rE "['\"]#[0-9a-fA-F]{3,8}['\"]" client/src/demos --include="*.tsx" --include="*.ts" | grep -v design-tokens.css
```

빈 결과 = PASS. 1줄이라도 매칭 = FAIL.

### 1.3 _shared 외 import 0건

```bash
grep -E "from ['\"]\.\.?/_shared/[^i]" client/src/demos/ch02/*.tsx
grep -E "from ['\"]\.\./types['\"]" client/src/demos/ch02/*.tsx
```

빈 결과 = PASS. (단 `from '../types'` 는 DemoComponentProps import 용으로 1건 허용 — Generator 자율 판단)

### 1.4 라벨 길이 검증

dev mode 에서 컴포넌트 mount 시 `validatePairSet` 호출 → throw 0건 확인:

```bash
cd client && npm run dev
# 브라우저 콘솔에 errors 0건 확인 — 4 데모 모두 방문
```

---

## 2. 콘텐츠 1:1 검증 (§6.3 — v2.2 §4.2 ch02 표 정확 일치)

### 2.1 Q01Software 메타포 4 + IT 4

`grep -E "(가전\|문구\|책\|도구)" client/src/demos/ch02/Q01Software.tsx`

각 라벨이 정확히 1회 이상 매칭. 그리고:

`grep -E "(운영체제\|드라이버\|앱\|미들웨어)" client/src/demos/ch02/Q01Software.tsx`

마찬가지로 4 라벨 매칭.

### 2.2 Q02License — 자유 / 구입 / 의무 / 학생 + 오픈소스 / 상용 / GPL / 학생용

```bash
grep -E "(자유\|구입\|의무\|학생)" client/src/demos/ch02/Q02License.tsx          # 4 라인
grep -E "(오픈소스\|상용\|GPL\|학생용)" client/src/demos/ch02/Q02License.tsx     # 4 라인
```

### 2.3 Q03Module — 블록 / 박스 / 연결 / 설치 + 모듈 / 패키지 / 의존성 / 설치

```bash
grep -E "(블록\|박스\|연결\|설치)" client/src/demos/ch02/Q03Module.tsx           # 메타포 4
grep -E "(모듈\|패키지\|의존성\|설치)" client/src/demos/ch02/Q03Module.tsx       # IT 4
```

### 2.4 Q04Cloud — 직접 / 빌리기 / 완성 / 구독 + IaaS / PaaS / SaaS / 구독

```bash
grep -E "(직접\|빌리기\|완성\|구독)" client/src/demos/ch02/Q04Cloud.tsx          # 메타포 4
grep -E "(IaaS\|PaaS\|SaaS\|구독)" client/src/demos/ch02/Q04Cloud.tsx            # IT 4
```

### 2.5 형태 매핑 정확

```bash
grep "PairMatch" client/src/demos/ch02/Q01Software.tsx     # 1 매칭
grep "PairMatch" client/src/demos/ch02/Q02License.tsx      # 1 매칭
grep "PairFlow" client/src/demos/ch02/Q03Module.tsx        # 1 매칭
grep "PairVertical" client/src/demos/ch02/Q04Cloud.tsx     # 1 매칭

# 형태 잘못 적용 0건
grep -l "PairMatch" client/src/demos/ch02/Q03Module.tsx     # 빈 결과
grep -l "PairFlow" client/src/demos/ch02/Q01Software.tsx   # 빈 결과
```

### 2.6 챕터 톤 정합

```bash
grep "getTone(2)" client/src/demos/ch02/*.tsx | wc -l       # 4
grep -E "getTone\([^2]\)" client/src/demos/ch02/*.tsx       # 빈 결과 (다른 톤 0건)
```

---

## 3. 인터랙션 검증 (브라우저)

### 3.1 시나리오 칩 클릭 → 동시 활성화

각 데모 (`/library/2/ch02_q01` ~ `/library/2/ch02_q04`) 방문 → 시나리오 칩 4회 클릭 (인덱스 0→1→2→3):

- [ ] 클릭마다 메타포 셀 활성 cyan border + cyan soft 배경
- [ ] 동일 인덱스의 IT 셀도 동시 활성
- [ ] 한쪽만 변하면 FAIL

### 3.2 registry 매핑 확인

`http://localhost:5176/library/2/ch02_q01` 방문 → React 인라인 컴포넌트 렌더 확인 (iframe 폰 프레임 표시되면 FAIL — registry 미반영).

DevTools → Components 패널 → `Q01Software` 마운트 확인.

---

## 4. Verdict 출력

작업 완료 시 센티넬 작성:

```bash
cat > /home/claude/architecture/qa/ao-logs/pr13-r1-eval-interaction.status <<EOF
{"status":"done","step":"pr13","role":"eval-interaction","model":"codex","session_id":"<your_session>","ts":"$(date -Iseconds)","verdict":"PASS","fail":0,"revise":0,"sha":"<base_sha>","notes":"build PASS / hex 0 / import 0 / 라벨 1:1 일치 / 동시 활성 4 데모 모두 OK"}
EOF
```

verdict:
- **PASS**: fail=0 AND revise=0
- **REVISE**: fail=0 AND revise>0
- **FAIL**: fail>0

fail 항목은 §1·§2·§3 중 어디서 위반인지 `notes` 에 명시.

> **AO 사각지대 #18 — Generator 센티넬 verdict 누락**: 본 Eval-Interaction 센티넬은 `verdict` 필드 필수. PASS 시 `verdict:"PASS"` 명시.
