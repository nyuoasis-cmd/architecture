# HANDOFF-pr19b-round1 — ch08 q05~q07 인라인 변환 (네트워크·보안 마무리)

> **PR**: PR-19b — ch08 3 데모 (q05~q07)
> **base**: `main` (`20ee47f` PR-19a 머지 후)
> **브랜치**: `feat/preview-inline-ch08-q5-q7`
> **에픽**: 14/18

---

## 0. 메타

| key | value |
|---|---|
| step | pr19b |
| round | 1 |
| branch | feat/preview-inline-ch08-q5-q7 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **all-roles model override** | **codex** |

---

## 1. ch08 q05~q07 매핑 (SDD §4.2)

| qaId | 메타포 | IT (SDD spec) | 형태 | layout |
|---|---|---|---|---|
| ch08_q05 | 문지기/통로/함께/분리 | 방화벽/VPN/함께 사용/역할 분리 | B Binary | square |
| ch08_q06 | 단발/폴링/양방향/사례 | HTTP/폴링/WebSocket/적합 사례 | C Match | wide |
| ch08_q07 | 인증/암호/격리/최소 | 인증/암호화/격리/최소 권한 | C Match | wide |

**톤**: `getTone(8)` = teal-700

---

## 🚨 본 PR 핵심 함정

| SDD spec 라벨 | 글자수 | 정책 |
|---|---|---|
| `VPN` | 3 | 한+영: `'통로 VPN'` (6) |
| `WebSocket` | 9 ❌ | label `'양방향 WS'` (6) + sub `'WebSocket'` |
| `HTTP` | 4 | `'단발 HTTP'` (7) (PR-19a 패턴) |

> **labels.ts:13 maxLabelLength = 8**. PR-17c POST 자가진단 + PR-18b isolation level 학습.
>
> **q05 PairBinary**: ch01_q02 Stage / ch05_q01 Hall-Kitchen 패턴 (left/right + cards).
>
> q05 의 4 라벨 (문지기/통로/함께/분리) 은 4-cell 이지만 PairBinary 는 2 zone (left/right). 매핑 방식: left zone = "보호 도구" (문지기 + 통로) cards / right zone = "운영 방식" (함께 + 분리) cards. 또는 **스코프 변경** 가능 — 4-cell 이 의도라면 PairMatch wide 으로 변경 (SDD 의 'B square' 가 잘못 표기일 수도).
>
> → **자율 판단 권장**: PairBinary 가 어색하면 PairMatch wide 로 변경 (Master 가 SDD 보강 필요).

---

## §A. Generator (Codex)

### §A 시작

1. `cd /home/claude/architecture && git fetch origin main && git checkout main && git pull --ff-only`
2. `git log -1` → `20ee47f feat: ch08 q01~q04 인라인 데모 추가 (#61)` 확인
3. `git checkout feat/preview-inline-ch08-q5-q7`
4. **🚨 모든 commit feat 브랜치 위 직접**

### §A STEP 요약

#### `Q05Firewall.tsx` — PairBinary square (ch01 Q02Stage 패턴) 또는 PairMatch wide (자율 판단)

PairBinary 채택 시:
```ts
metaphorLeft:  { icon: <Icons.GatekeeperIcon />, label: '문지기', cards: ['외부 차단', '검사'] }
metaphorRight: { icon: <Icons.TunnelIcon />,    label: '통로',   cards: ['암호화', '원격 접속'] }
itLeft:  { icon: <Icons.FirewallIcon />, label: '방화벽', sub: '경계 보호' }
itRight: { icon: <Icons.VpnIcon />,      label: '통로 VPN', sub: '암호 터널' }
SCENES: gatekeeper(left active) / tunnel(right active) / together(both) / separate(side by side roles)
```

**또는 PairMatch wide** — 4-cell:
```ts
const METAPHOR = [
  { icon: <Icons.GatekeeperIcon />, label: '문지기', sub: '경계 보호' },
  { icon: <Icons.TunnelIcon />,     label: '통로',   sub: '안전 통신' },
  { icon: <Icons.TogetherIcon />,   label: '함께',   sub: '복합 사용' },
  { icon: <Icons.SeparateIcon />,   label: '분리',   sub: '역할 구분' },
];
const IT = [
  { icon: <Icons.FirewallIcon />,  label: '방화벽',     sub: 'inbound/outbound' },
  { icon: <Icons.VpnIcon />,       label: '통로 VPN',   sub: 'tunnel encrypt' },
  { icon: <Icons.CombineIcon />,   label: '함께 사용',  sub: 'firewall+VPN' },
  { icon: <Icons.RoleSplitIcon />, label: '역할 분리',  sub: '책임 매핑' },
];
tone: getTone(8)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `Q06Realtime.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.OneShotIcon />,    label: '단발',   sub: '한 번 요청' },
  { icon: <Icons.PollIcon />,       label: '폴링',   sub: '주기 확인' },
  { icon: <Icons.BiDirIcon />,      label: '양방향', sub: '동시 송수신' },
  { icon: <Icons.UseCaseIcon />,    label: '사례',   sub: '적합 선택' },
];
const IT = [
  { icon: <Icons.HttpReqIcon />,   label: '단발 HTTP',   sub: 'request/response' },
  { icon: <Icons.PollItIcon />,    label: '폴링',        sub: 'long polling' },
  { icon: <Icons.WebSocketIcon />, label: '양방향 WS',   sub: 'WebSocket' },
  { icon: <Icons.UseCaseItIcon />, label: '적합 사례',   sub: 'chat/feed' },
];
tone: getTone(8)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `Q07Security.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.AuthIcon />,         label: '인증', sub: '신원 확인' },
  { icon: <Icons.EncryptIcon />,      label: '암호', sub: '내용 보호' },
  { icon: <Icons.IsolateMetaIcon />,  label: '격리', sub: '서로 못 봄' },
  { icon: <Icons.MinPrivIcon />,      label: '최소', sub: '필요한 만큼만' },
];
const IT = [
  { icon: <Icons.AuthItIcon />,        label: '인증',      sub: 'authenticate' },
  { icon: <Icons.EncryptItIcon />,     label: '암호화',    sub: 'encrypt' },
  { icon: <Icons.IsolationIcon />,     label: '격리',      sub: 'network isolate' },
  { icon: <Icons.LeastPrivIcon />,     label: '최소 권한', sub: 'least privilege' },
];
tone: getTone(8)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `data/demos.ts` + `registry.ts`

```ts
ch08_q05: { Component: Q05Firewall, layout: 'square' },  // 또는 'wide' (PairMatch 채택 시)
ch08_q06: { Component: Q06Realtime, layout: 'wide' },
ch08_q07: { Component: Q07Security, layout: 'wide' },
```

> 🚨 ID 정렬 + 시나리오 한국어 라벨 강제 (PR-18b 학습)

### §A 절대 금지

- ch01~ch07 + ch08_q01~q04 + ch09~ch10 콘텐츠 수정
- `_shared/*` 공용 계약 변경
- raw hex, master/main push, force push

### §A 검증

1. `npm run build` 무에러
2. `/library/8/ch08_q05~q07` 3 라우트 접근
3. teal-700 series accent
4. raw hex / `_shared` 외 import 0건
5. **🚨 라벨 길이 ≤ 8자** awk grep
6. **🚨 raw 약자 grep**: `grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML|VPN|WS)'" client/src/demos/ch08/Q0[5-7]*.tsx` → 0건
7. **🚨 'DB' 부분 문자열 grep** 0건
8. **🚨 ID 정렬 grep** + scenarios 라벨 한국어 first

### §A 센티넬 → `qa/ao-logs/pr19b-r1-gen.status`

---

## §B + §C

PR-19a 동일 패턴. ch08_q05~q07 + ch08_q01~q04 회귀 spot-check.

> ⚠️ SHA 검증 (race) + chore 브랜치 회수 (필요 시).

---

## 변경 기록

| 2026-05-04 | 초기 작성. ch08 q05~q07 (네트워크 마무리). q05 자율 판단 (PairBinary or PairMatch). WebSocket 9자 → '양방향 WS' 강제 |
