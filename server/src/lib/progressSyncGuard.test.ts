import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

// 비로그인 열람(라이브러리 자습)은 서버 동기화 권한이 없어 401 이 돌아온다.
// 참여자 쿠키가 httpOnly 라 클라이언트가 «신원 있음»을 미리 알 수 없으므로,
// 한 번 거절당하면 그 브라우징 동안은 더 부르지 않는다 — 안 그러면 문마다 401 이 쌓인다.
// 🚨 이 테스트는 «동작»이 아니라 «코드가 그렇게 생겼는지»를 본다(클라 런타임 테스트 러너가 없다).
//    그래서 문구가 아니라 **구조 두 가지**를 본다: 거절 코드를 읽는가 · 읽고 나서 멈추는가.
const source = readFileSync(
  path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'lib', 'progress.ts'),
  'utf8',
)

test('진도 동기화: 거절(401·403)을 읽고 그 뒤로 멈춘다', () => {
  assert.match(source, /response\.status === 401/, '거절 코드를 아예 안 읽으면 매 문마다 401 을 쌓는다')
  assert.match(source, /remoteSyncDisabled = true/, '거절을 읽고도 계속 부르면 읽은 의미가 없다')
  assert.match(source, /if \(remoteSyncDisabled\) \{[\s\S]{0,40}return;/, '플래그를 세우기만 하고 검사하지 않으면 아무 일도 안 일어난다')
})

test('진도 동기화: 다시 켤 수 있는 길이 있다 — 참여로 신원이 생기면 되살아나야 한다', () => {
  assert.match(source, /export function enableProgressSync/, '한 번 꺼지면 영영 안 켜지는 스위치는 사고가 된다')
  const join = readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'pages', 'JoinPage.tsx'),
    'utf8',
  )
  assert.match(join, /enableProgressSync\(\)/, '참여 성공 시 다시 켜지 않으면 참여 전 열람 때문에 진도가 안 남는다')
})

test('진도 동기화: 로컬 저장은 끄지 않는다 — 서버만 못 갈 뿐이다', () => {
  assert.match(source, /localStorage/, '동기화가 꺼져도 진도 자체는 브라우저에 남아야 한다')
})
