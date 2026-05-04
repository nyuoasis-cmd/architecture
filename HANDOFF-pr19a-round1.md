# HANDOFF-pr19a-round1 — ch08 q01~q04 인라인 변환 (네트워크·보안 시작)

> **PR**: PR-19a — ch08 4 데모
> **base**: `main` (`950eabf` PR-18b 머지 후)
> **브랜치**: `feat/preview-inline-ch08-q1-q4`
> **에픽**: 13/18

---

## 0. 메타

| key | value |
|---|---|
| step | pr19a |
| round | 1 |
| branch | feat/preview-inline-ch08-q1-q4 |
| project | architecture |
| repo | nyuoasis-cmd/architecture |
| **all-roles model override** | **codex** |

---

## 1. ch08 q01~q04 매핑 (SDD §4.2)

| qaId | 메타포 | IT (SDD spec) | 형태 | layout |
|---|---|---|---|---|
| ch08_q01 | 길/신뢰/빠름/함께 | IP/TCP/UDP/함께 보기 | C Match | wide |
| ch08_q02 | 평문/암호/인증/완성 | HTTP/TLS/인증서/전체 보호 | A Flow | wide |
| ch08_q03 | 캐시/재귀/상위/응답 | 로컬 캐시/재귀 서버/상위 서버/최종 응답 | A Flow | wide |
| ch08_q04 | 원본/서울/유럽/분산 | 원본 서버/엣지 KR/엣지 EU/분산 효과 | D Vertical | square |

**톤**: `getTone(8)` = teal-700 series

---

## 🚨 본 PR 핵심 함정 — 영문 약자 한+영 병기 + 부분 문자열 회피 (PR-16a/17c/18a 학습)

### 라벨 길이 + 약자 정책

| SDD spec 라벨 | 글자수 | 정책 |
|---|---|---|
| `IP` | 2 | 단독 약자 — 한+영 병기: `'길 IP'` (4) 또는 `'IP 주소'` (5) |
| `TCP` | 3 | `'신뢰 TCP'` (6) |
| `UDP` | 3 | `'빠름 UDP'` (6) |
| `HTTP` | 4 | `'평문 HTTP'` (7) |
| `TLS` | 3 | `'암호 TLS'` (6) |
| `엣지 KR` | 5 | OK (Korean 우선) |
| `엣지 EU` | 5 | OK |

> **labels.ts:8 regex** `^(OS|API|DB|UI|JS|CSS|HTML)$`: 위 약자 모두 미포함 (안전), 단 단독 영문 카드는 시각 단조 → 한+영 권장.
>
> **DB 부분 문자열 0건** (PR-18a 학습): Hero/title 에 `'DNS'`, `'IP'`, `'TCP'` 등은 OK (DB 아님). 단 `'TLS DB'` 같은 조합 회피.

---

## §A. Generator (Codex)

### §A 시작

1. `cd /home/claude/architecture && git fetch origin main && git checkout main && git pull --ff-only`
2. `git log -1` → `950eabf feat: ch07 q05~q06 인라인 데모 추가 (#60)` 확인
3. `git checkout feat/preview-inline-ch08-q1-q4`
4. **🚨 모든 commit feat 브랜치 위 직접** (codex chore 만들지 말 것)

### §A STEP

**SVG**:

metaphor:
- q01: PathIcon (길) / TrustIcon (신뢰) / SpeedIcon (빠름) / CompareIcon (함께)
- q02: PlainIcon (평문) / CipherIcon (암호) / VerifyIcon (인증) / CompleteIcon (완성 — 재사용)
- q03: CacheMetaIcon (캐시) / RecursiveIcon (재귀) / UpstreamIcon (상위) / RespondIcon (재사용)
- q04: OriginIcon (원본) / SeoulIcon (서울) / EuropeIcon (유럽) / SpreadIcon (분산)

computer:
- q01: IpIcon / TcpIcon / UdpIcon / OverviewIcon
- q02: HttpIcon / TlsIcon / CertIcon / FullProtectIcon
- q03: LocalCacheIcon / RecursiveServerIcon / UpstreamServerIcon / FinalRespondIcon
- q04: OriginServerIcon / EdgeKrIcon / EdgeEuIcon / DistEffectIcon

#### `Q01Protocol.tsx` (PairMatch wide — C)

```ts
const METAPHOR = [
  { icon: <Icons.PathIcon />,    label: '길',   sub: '경로' },
  { icon: <Icons.TrustIcon />,   label: '신뢰', sub: '확인 통신' },
  { icon: <Icons.SpeedIcon />,   label: '빠름', sub: '단방향' },
  { icon: <Icons.CompareIcon />, label: '함께', sub: '대조' },
];
const IT = [
  { icon: <Icons.IpIcon />,       label: '주소 IP',  sub: '경로 지정' },
  { icon: <Icons.TcpIcon />,      label: '신뢰 TCP', sub: '연결 통신' },
  { icon: <Icons.UdpIcon />,      label: '빠름 UDP', sub: '비연결' },
  { icon: <Icons.OverviewIcon />, label: '함께 보기', sub: '계층 비교' },
];
tone: getTone(8)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `Q02Tls.tsx` (PairFlow wide — A)

```ts
const METAPHOR = [
  { icon: <Icons.PlainIcon />,    label: '평문', sub: '보호 X' },
  { icon: <Icons.CipherIcon />,   label: '암호', sub: '내용 보호' },
  { icon: <Icons.VerifyIcon />,   label: '인증', sub: '서버 확인' },
  { icon: <Icons.CompleteIcon />, label: '완성', sub: '신뢰 통신' },
];
const IT = [
  { icon: <Icons.HttpIcon />,         label: '평문 HTTP',  sub: 'port 80' },
  { icon: <Icons.TlsIcon />,          label: '암호 TLS',   sub: 'handshake' },
  { icon: <Icons.CertIcon />,         label: '인증서',     sub: 'X.509' },
  { icon: <Icons.FullProtectIcon />,  label: '전체 보호',  sub: 'HTTPS' },
];
tone: getTone(8)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `Q03Dns.tsx` (PairFlow wide — A)

```ts
const METAPHOR = [
  { icon: <Icons.CacheMetaIcon />, label: '캐시', sub: '저장' },
  { icon: <Icons.RecursiveIcon />, label: '재귀', sub: '대신 찾음' },
  { icon: <Icons.UpstreamIcon />,  label: '상위', sub: '권위 서버' },
  { icon: <Icons.RespondIcon />,   label: '응답', sub: '주소 받음' },
];
const IT = [
  { icon: <Icons.LocalCacheIcon />,      label: '로컬 캐시', sub: '브라우저' },
  { icon: <Icons.RecursiveServerIcon />, label: '재귀 서버', sub: 'resolver' },
  { icon: <Icons.UpstreamServerIcon />,  label: '상위 서버', sub: 'TLD/.kr' },
  { icon: <Icons.FinalRespondIcon />,    label: '최종 응답', sub: 'A record' },
];
tone: getTone(8)
validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' })
```

#### `Q04Cdn.tsx` (PairVertical square — D)

```ts
const METAPHOR = [
  { icon: <Icons.OriginIcon />, label: '원본', sub: '본사 위치' },
  { icon: <Icons.SeoulIcon />,  label: '서울', sub: '국내 사용자' },
  { icon: <Icons.EuropeIcon />, label: '유럽', sub: '해외 사용자' },
  { icon: <Icons.SpreadIcon />, label: '분산', sub: '효과' },
];
const IT = [
  { icon: <Icons.OriginServerIcon />, label: '원본 서버', sub: 'origin' },
  { icon: <Icons.EdgeKrIcon />,       label: '엣지 KR',   sub: '서울 PoP' },
  { icon: <Icons.EdgeEuIcon />,       label: '엣지 EU',   sub: '런던 PoP' },
  { icon: <Icons.DistEffectIcon />,   label: '분산 효과', sub: '지연 ↓' },
];
tone: getTone(8)
validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' })
```

#### `data/demos.ts` + `registry.ts`

```ts
ch08_q01: { Component: Q01Protocol, layout: 'wide' },
ch08_q02: { Component: Q02Tls,      layout: 'wide' },
ch08_q03: { Component: Q03Dns,      layout: 'wide' },
ch08_q04: { Component: Q04Cdn,      layout: 'square' },
```

> 🚨 ID 정렬 grep + 시나리오 한국어 라벨 강제 (PR-18b 학습 — demos.ts scenarios 도 한국어).

### §A 절대 금지

- ch01~ch07 + ch08_q05~q07 + ch09~ch10 콘텐츠 수정
- `_shared/*` 공용 계약 변경
- raw hex, master/main push, force push

### §A 검증 (자체 보고)

1. `npm run build` 무에러
2. `/library/8/ch08_q01~q04` 4 라우트 접근
3. teal-700 series accent
4. raw hex / `_shared` 외 import 0건
5. **🚨 라벨 길이 awk grep** ≤ 8자 0건
6. **🚨 raw 약자 grep**: `grep -nE "label: '(OS|API|DB|UI|JS|CSS|HTML|IP|TCP|UDP|HTTP|TLS)'" client/src/demos/ch08/*.tsx` → 0건
7. **🚨 'DB' 부분 문자열 grep** 0건 (PR-18a 학습)
8. **🚨 ID 정렬 grep** + **🚨 demos.ts scenarios 라벨 한국어 first** (PR-18b 학습)

### §A 센티넬 → `qa/ao-logs/pr19a-r1-gen.status`

---

## §B + §C

PR-18a/b 동일. ch08_q01~q04 + ch07 회귀 spot-check. teal-700 contrast.

> ⚠️ SHA 검증 (race 회피, PR-17c 학습)
> ⚠️ chore 브랜치 push 시 main worktree 회수 (PR-15a 학습)

---

## 변경 기록

| 2026-05-04 | 초기 작성. ch08 q01~q04 (네트워크·보안 시작). q01 C / q02 q03 A / q04 D. IP/TCP/UDP/HTTP/TLS 한+영 병기 강제 |
