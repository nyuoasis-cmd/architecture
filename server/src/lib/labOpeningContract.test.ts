// 실습실을 **처음 열었을 때 화면에 무엇이 있는가** 에 대한 계약.
//
// 🚨 왜 있는가(2026-08-15 새내기 QA): 학생이 🧪 실습 탭을 누르면 **빈 프롬프트만** 나왔다.
//    축소판 고지도, 「help 를 치면 됩니다」도 없었다. 관찰 원문:
//      「뭘 입력해야 하는지 전혀 힌트가 없어. "명령을 입력하세요"라는 말만 있고」
//    원인은 화면 폭을 재는 효과가 **렌더 시점에 잡아 둔 빈 줄 목록으로 세션을 덮어써서**
//    첫 화면이 통째로 지워진 것이었다. 코드는 멀쩡해 보였고 테스트도 전부 초록이었다 —
//    셸 리듀서는 고지를 제대로 내놓고 있었기 때문이다(계약 10 이 그걸 이미 보고 있었다).
//
// 🔑 그래서 여기서 보는 것은 «리듀서가 고지를 만드는가»가 아니라
//    **«화면이 그것을 지우지 않는가»** 다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const TAB = path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'components', 'learn', 'LabTab.tsx')
const source = readFileSync(TAB, 'utf8')

test('1) 세션을 덮어쓸 때 렌더 시점 값이 아니라 스토어를 그 자리에서 다시 읽는다', () => {
  // 🚨 이것이 고지를 지웠던 정확한 형태다: setSession({ qaId, state, lines, history, ...next })
  //    — state/lines/history 가 렌더 클로저 값이라, 같은 마운트에서 먼저 쓴 값이 날아간다.
  assert.equal(
    /setSession\(\{\s*qaId,\s*state,\s*lines,\s*history,\s*\.\.\.next\s*\}\)/.test(source),
    false,
    '렌더 클로저 값으로 세션을 통째로 덮고 있다 — 첫 화면이 다시 사라진다',
  )
  assert.ok(
    /useLearnStore\.getState\(\)\.labSession/.test(source),
    '세션을 스토어에서 그 자리에서 다시 읽지 않는다',
  )
})

test('2) 세션이 없을 때의 기본값에도 고지가 들어 있다 — 빈 화면으로 시작하지 않게', () => {
  // 🔑 «없으면 빈 줄»로 두면, 초기화 효과보다 다른 효과가 먼저 쓰는 순간 다시 빈 화면이 된다.
  const fallbacks = [...source.matchAll(/qaId,\s*state: INITIAL_LAB_STATE,\s*lines:\s*([A-Za-z_]+)/g)].map(
    (m) => m[1],
  )
  assert.ok(fallbacks.length > 0, '세션 기본값을 만드는 자리를 못 찾았다 — 이 계약이 헛돌고 있다')
  for (const value of fallbacks) {
    assert.equal(value, 'openingEvents', `세션 기본값의 첫 화면이 ${value} 다 — 고지가 아니라 빈 줄이면 안 된다`)
  }
})

test('3) 화면 폭을 재는 효과가 줄 목록을 건드리지 않는다', () => {
  const measure = source.slice(source.indexOf('const measure ='), source.indexOf("window.addEventListener('resize'"))
  assert.ok(measure.length > 0, '폭 재는 효과를 못 찾았다')
  assert.equal(/setLines|lines:/.test(measure), false, '폭만 재면 되는 자리에서 줄 목록까지 쓰고 있다')
})
