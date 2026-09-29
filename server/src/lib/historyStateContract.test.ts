// 주소만 바꾸는 replaceState 가 **history.state 를 지우지 않는가**에 대한 계약.
//
// 🚨 왜 있는가(2026-09-29 라이브 재현): 시연 탭의 시나리오 전환이 `replaceState(null, '', '#…')` 였다.
//    history.state 에는 react-router 의 칸 번호(idx)와 공용 나가기 가드의 표식(__tmExitGuard)이 들어 있다.
//    null 로 덮으면 가드가 그 화면을 «첫 화면» 으로 오판해, 2강 이후에서 시나리오를 바꾼 뒤 뒤로가기가
//    앞 강 대신 「수업에서 나갈까요?」 를 띄웠다(DESIGN-POLICY §9.H-18 「한 칸 뒤로」 위반).
//    1강에서는 눈에 안 띄고 기록 칸만 하나씩 늘었다 — 그래서 몇 주 동안 아무도 못 봤다.
// 🔑 주소만 바꿀 때는 `replaceState(window.history.state, …)` 로 지금 state 를 그대로 넘긴다.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import { stripComments } from './strip-comments'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const CLIENT_SRC = path.join(ROOT, 'client', 'src')

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full))
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full)
  }
  return out
}

// state 자리에 null·undefined·빈 객체를 넘기는 replaceState — 칸 번호와 가드 표식을 지운다.
const WIPES_STATE = /history\.replaceState\(\s*(?:null|undefined|\{\s*\})\s*,/

test('1) 클라이언트 어디서도 replaceState 로 history.state 를 지우지 않는다', () => {
  const offenders = sourceFiles(CLIENT_SRC)
    // 로그인 콜백은 토큰을 주소에서 지우는 자리다 — 교사 화면이고 가드가 없다.
    .filter((file) => !/AuthCallback/.test(file))
    .filter((file) => WIPES_STATE.test(stripComments(readFileSync(file, 'utf8'))))
    .map((file) => path.relative(ROOT, file))
  assert.deepEqual(
    offenders,
    [],
    `history.state 를 지우는 replaceState 가 있다 — 뒤로가기 가드가 «첫 화면» 으로 오판한다: ${offenders.join(', ')}`,
  )
})

test('2) 시나리오 전환은 지금 state 를 그대로 넘긴다', () => {
  const source = stripComments(readFileSync(path.join(CLIENT_SRC, 'components/learn/ContentPanel.tsx'), 'utf8'))
  assert.match(
    source,
    /history\.replaceState\(\s*window\.history\.state\s*,\s*''\s*,\s*`#\$\{nextScenarioId\}`\s*\)/,
    'ContentPanel 의 시나리오 해시 전환이 history.state 를 넘기지 않는다',
  )
})

test('3) 음성 대조군 — 탐지식이 실제로 지우는 호출을 잡는다', () => {
  for (const bad of ["window.history.replaceState(null, '', '#x')", 'history.replaceState({}, "", url)', 'history.replaceState( undefined , "")']) {
    assert.equal(WIPES_STATE.test(bad), true, `탐지식이 ${bad} 를 못 잡으면 1) 은 실패할 수 없는 계측이다`)
  }
  assert.equal(WIPES_STATE.test("window.history.replaceState(window.history.state, '', '#x')"), false, '보존하는 호출까지 잡으면 오탐이다')
})
