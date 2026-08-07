// 계약: **QR 전체화면의 한 변은 뷰포트에 비례하고, 고정 px 상한을 갖지 않는다.**
// (DESIGN-POLICY §10 「전체화면 오버레이 v3」, 2026-08-07)
//
// 이 화면은 교실 프로젝터로 쏘는 물건이다. 옛 규칙의 고정 px(320/360)는 폰에서는 티가 안 나고
// 프로젝터(1920×1080)에서만 조용히 잘린다 — 기준 구현이라면 486px 이 나올 자리다.
// 「모바일에서 잘 보이니 됐다」로 이런 결함이 오래 살아남는다.
//
// 🔑 **입구가 둘이다.** 이 레포에는 QR 전체화면이 두 개 있고 죽은 중복이 아니다 —
//    `QrFullscreenModal` = 교사 세션 화면, `QrFullscreen` = 학습 미리보기 패널.
//    한쪽만 고치면 나머지 한쪽에서 그대로 잘린다. 그래서 이 파일은 **둘 다** 센다.
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
const ENTRANCES = ['QrFullscreenModal.tsx', 'QrFullscreen.tsx']

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
