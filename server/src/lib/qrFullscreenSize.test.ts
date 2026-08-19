// 계약: **QR 전체화면의 한 변은 뷰포트에 비례하고, 고정 px 상한을 갖지 않는다.**
// (DESIGN-POLICY §10 「전체화면 오버레이 v3」, 2026-08-07)
//
// 이 화면은 교실 프로젝터로 쏘는 물건이다. 옛 규칙의 고정 px(320/360)는 폰에서는 티가 안 나고
// 프로젝터(1920×1080)에서만 조용히 잘린다 — 기준 구현이라면 486px 이 나올 자리다.
// 「모바일에서 잘 보이니 됐다」로 이런 결함이 오래 살아남는다.
//
// 🔑 **입구는 하나다**(2026-08-19 통합). 전에는 둘이었다 — `QrFullscreenModal`(교사 화면)과
//    `QrFullscreen`(학습 화면). 죽은 중복이 아니라 **둘 다 살아 있으면서 조금씩 달랐다**:
//    배경이 `bg-black/40` 대 `bg-black/70`, 라벨이 "Join Code" 대 "Join URL". 정책 한 줄을
//    고칠 때마다 두 곳을 고쳐야 했고 실제로 한쪽만 고쳐진 채 남았다. 지금은 한 컴포넌트다.
//    🚨 그래도 아래 「입구 목록이 실제 전부를 덮는다」는 남긴다 — 새 입구가 또 생기는 것이
//       이 결함의 원래 형태였고, 목록에 없으면 위 검사들이 조용히 통과한다.
//
// 🔑 상한은 QR 자신에만 있는 게 아니다. QR 을 담은 카드가 px 로 묶여 있으면
//    (옛 `max-w-md` / `max-w-2xl`) 카드가 먼저 막아서 QR 상한만 지워봐야 화면은 그대로다.
//
// 🚨 소스는 **주석을 지운 뒤** 검사한다. 구현부·이 파일 주석에 옛 값이 그대로 적혀 있어서
//    날 grep 이면 주석만 고쳐도 빨강/초록이 뒤집힌다. 그건 이빨이 아니다.
//    esbuild 는 JSX 안의 `{/* … */}` 는 남기므로 그 컨테이너는 손으로 한 번 더 지운다.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { transformSync } from 'esbuild'

const CLIENT_COMMON = path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'components', 'common')

/** QR 전체화면 입구. 새 입구가 생기면 여기에 더한다 — 하나만 고치는 사고를 막는 목록이다. */
const ENTRANCES = ['QrFullscreen.tsx']

function sourceOf(file: string): string {
  const raw = readFileSync(path.join(CLIENT_COMMON, file), 'utf8')
  return transformSync(raw, { loader: 'tsx', jsx: 'preserve' }).code.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
}

function qrTagOf(code: string, file: string): string {
  const tag = /<QRCodeSVG[\s\S]*?\/>/.exec(code)?.[0]
  assert.ok(tag, `${file}: QRCodeSVG 를 찾지 못했다 — 구조가 바뀌었으면 이 계약도 갱신하라`)
  return tag as string
}

for (const file of ENTRANCES) {
  test(`${file}: QR 한 변이 뷰포트 비례다 — 폰/데스크톱 두 갈래`, () => {
    const tag = qrTagOf(sourceOf(file), file)
    // Tailwind md = 768px. 정책의 min(vw,vh) × (vw<768 ? 0.7 : 0.45) 를 그대로 쓴 것.
    assert.match(tag, /w-\[min\(70vw,70vh\)\]/, `${file}: 폰 갈래(0.7)가 없다`)
    assert.match(tag, /md:w-\[min\(45vw,45vh\)\]/, `${file}: 데스크톱 갈래(0.45)가 없다`)
  })

  test(`${file}: QR 한 변에 고정 px 상한이 없다`, () => {
    const tag = qrTagOf(sourceOf(file), file)
    assert.doesNotMatch(tag, /\bsize\s*=/, `${file}: size prop 이 되살아났다 — 크기가 두 곳이 된다`)
    for (const w of tag.match(/w-\[[^\]]*\]/g) ?? []) {
      assert.doesNotMatch(w, /\d\s*px/, `${file}: QR 폭에 px 상한이 섞였다 = 큰 화면에서 잘린다: ${w}`)
    }
  })

  test(`${file}: QR 을 담은 카드에도 고정 px 상한이 없다`, () => {
    const code = sourceOf(file)
    const card = /className="[^"]*\bm-auto\b[^"]*"/.exec(code)?.[0]
    assert.ok(card, `${file}: QR 카드(m-auto)를 찾지 못했다`)
    // 옛 max-w-md(28rem) / max-w-2xl(42rem) 처럼 고정 폭이면 카드가 QR 보다 먼저 막는다.
    assert.doesNotMatch(
      card as string,
      /max-w-(?:xs|sm|md|lg|xl|\dxl|\[[^\]]*(?:\d\s*px|rem)[^\]]*\])/,
      `${file}: 카드 폭이 고정이라 QR 상한을 지워도 카드가 먼저 막는다: ${card}`,
    )
  })

  test(`${file}: 넘칠 때 위가 잘리지 않는다 — 스크롤 + m-auto`, () => {
    const code = sourceOf(file)
    const overlay = /className="fixed inset-0[^"]*"/.exec(code)?.[0]
    assert.ok(overlay, `${file}: 오버레이 컨테이너를 찾지 못했다`)
    assert.match(overlay as string, /overflow-auto/, `${file}: 넘치는 내용을 스크롤하지 못한다`)
    assert.doesNotMatch(overlay as string, /items-center/, `${file}: items-center 는 넘칠 때 위를 잘라먹는다`)
  })

  test(`${file}: 참여 코드가 프로젝터에서 읽히는 크기다`, () => {
    assert.match(sourceOf(file), /text-\[clamp\(96px,18vw,200px\)\]/, `${file}: 참여 코드가 §10 v3 크기가 아니다`)
  })
}

for (const file of ENTRANCES) {
  test(`${file}: 배경이 흰색이고 z-[100] 이다 — 프로젝터로 쏘는 화면이다`, () => {
    // 🚨 왜 있는가(2026-08-19 jery): 두 입구가 각각 `bg-black/40`·`bg-black/70` 이었다.
    //    §10 금지 「어두운 배경 (프로젝터 가시성 저하)」 — 교실 뒤에서 QR 이 안 찍힌다.
    //    어두운 배경은 «모달처럼 보이게» 하려던 것이었고, 이 화면은 모달이 아니다.
    const overlay = /className="fixed inset-0[^"]*"/.exec(sourceOf(file))?.[0]
    assert.ok(overlay, `${file}: 오버레이 컨테이너를 찾지 못했다`)
    assert.match(overlay as string, /\bbg-white\b/, `${file}: 배경이 흰색이 아니다(§10 금지: 어두운 배경)`)
    assert.doesNotMatch(overlay as string, /bg-black|bg-stone-[89]|bg-neutral-[89]/, `${file}: 어두운 배경이 되살아났다`)
    assert.match(overlay as string, /z-\[100\]/, `${file}: §10 v3 는 z-[100] 을 요구한다(z-50 은 다른 층에 덮인다)`)
  })

  test(`${file}: 화면 문구가 한국어 정본이다 — 영문 라벨을 다시 붙이지 않는다`, () => {
    // 🚨 "Join Code" · "Join URL" 이 프로젝터에 떠 있었다 — DESIGN-POLICY UI 언어는 한국어다.
    //    수업 중 교실 앞에 영어가 뜨면 학생이 «내가 뭘 해야 하나»를 못 읽는다.
    const code = sourceOf(file)
    // 🔑 대소문자를 구분한다 — `joinUrl` **변수 이름**은 영문 라벨이 아니다. 앞서 `/join url/i`
    //    로 잡으려다 변수를 라벨로 오인해 계약이 «고칠 수 없는 빨강»이 됐다.
    assert.doesNotMatch(code, /"[^"]*Join (Code|URL)|>\s*Join (Code|URL)|Join Code|Join URL/, `${file}: 영문 라벨이 남아 있다`)
    assert.ok(
      code.includes('QR 코드를 스캔하거나 코드를 입력하세요'),
      `${file}: §10 정본 안내 문구가 없다`,
    )
    // §10 표 — 안내 16px / ≥640px 20px · keep-all.
    assert.match(code, /text-base[\s\S]{0,80}sm:text-xl/, `${file}: 안내 문구가 16px→20px 두 갈래가 아니다`)
    assert.match(code, /keep-all/, `${file}: 안내 문구에 keep-all 이 없다 — 낱말이 중간에서 끊긴다`)
  })

  test(`${file}: 참여자 수는 살아 있을 때만 그린다 — 모르는 것을 아는 것처럼 말하지 않는다`, () => {
    // 🔑 §10 은 참여자 수(emerald 펄스)를 요구한다. 그런데 이 앱에는 그 숫자를 **모르는 입구**가
    //    있다 — 학습 화면(시연작)은 명단을 들고 있지 않고, 「내 수업」 목록은 폴링하지 않는다.
    // 🚨 그래서 0 을 기본값으로 두지 않는다. `participantCount = 0` 이면 프로젝터에
    //    「참여 0명」이 굳은 채로 떠서, 교사가 «아직 아무도 안 들어왔다»로 잘못 읽는다.
    const code = sourceOf(file)
    assert.match(code, /participantCount/, `${file}: 참여자 수를 받지 않는다(§10 표)`)
    assert.doesNotMatch(
      code,
      /participantCount\s*=\s*0|participantCount\s*\?\?\s*0/,
      `${file}: 참여자 수에 0 기본값이 붙었다 — 모르는 것을 「0명」이라고 말한다`,
    )
    assert.match(
      code,
      // esbuild 가 `undefined` 를 `void 0` 으로 바꾼다 — 변환 뒤 소스를 보므로 둘 다 받는다.
      /participantCount === (?:undefined|void 0) \? null/,
      `${file}: 모를 때 그 줄을 빼는 갈래가 없다`,
    )
    assert.match(code, /animate-pulse[\s\S]{0,60}bg-emerald-500/, `${file}: emerald 펄스 dot 이 없다(§10 표)`)
    assert.match(code, /text-\[clamp\(24px,3vw,32px\)\]/, `${file}: 참여자 수 크기가 §10 표와 다르다`)
  })
}

test('입구 목록이 실제 QR 전체화면 전부를 덮는다', () => {
  // 🔑 이 검사가 없으면 새 QR 전체화면이 생겨도 위 루프가 조용히 통과한다
  //    — 「목록에 적힌 것만 초록」은 커버리지가 아니다.
  const actual = readdirSync(CLIENT_COMMON)
    .filter((f) => /Qr.*\.tsx$/i.test(f))
    .filter((f) => readFileSync(path.join(CLIENT_COMMON, f), 'utf8').includes('fixed inset-0'))
  assert.deepEqual(
    actual.slice().sort(),
    ENTRANCES.slice().sort(),
    `QR 전체화면 입구 목록이 실제와 다르다. 실제=${actual.join(',')} — 새 입구가 생겼으면 ENTRANCES 에 더하라`,
  )
})
