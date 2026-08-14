// 수업 현황 상세 화면이 «되돌릴 수 없는 일 앞에 서는가»에 대한 계약. BUILDER-UX-POLICY §4-A·§6.
//
// 🚨 왜 있는가(2026-08-14): 「수업 종료」가 **아무것도 묻지 않고 즉시** 실행됐다.
//    confirm() 조차 없었다 — 그래서 오히려 더 나빴다. 진행 중인 수업이 오클릭 한 번에 끝나고,
//    그 순간부터 학생은 못 들어온다. 되돌리는 길은 없다(새 수업을 만들고 코드를 다시 나눠 줘야 한다).
//
// 🔑 그래서 여기서 지키는 것은 «모달이 예쁜가»가 아니라 **endSession 호출이 확인 뒤에만 있는가**이다.
//    버튼 onClick 에 직결되는 순간 계약이 빨개진다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { stripComments } from './strip-comments'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const DETAIL = 'client/src/pages/TeacherSessionPage.tsx'
const MODAL = 'client/src/components/common/ConfirmModal.tsx'

test('① 수업 종료는 확인 모달을 거친다 — 버튼 onClick 에 직결되지 않는다', () => {
  const source = read(DETAIL)

  assert.ok(/<ConfirmModal\b/.test(source), `${DETAIL} 에 확인 모달이 없다 — 종료가 오클릭 한 번에 실행된다`)

  const calls = [...source.matchAll(/endSession\(/g)].map((match) => match.index ?? -1)
  assert.equal(calls.length, 1, `endSession 호출이 ${calls.length}곳이다 — 확인을 거치지 않는 통로가 생겼는지 볼 것`)

  const modalAt = source.indexOf('<ConfirmModal')
  assert.ok(
    calls[0] > modalAt,
    'endSession 이 확인 모달보다 앞에서 불린다 — 모달 밖에서 종료가 실행되는 자리다',
  )
})

test('② confirm()·alert() 로 확인을 때우지 않는다 (§6 금지)', () => {
  const source = read(DETAIL)
  for (const banned of ['window.confirm(', 'window.alert(']) {
    assert.equal(source.includes(banned), false, `${DETAIL} 이 ${banned} 를 쓴다 — §6 은 커스텀 모달을 요구한다`)
  }
})

test('③ 「← 내 수업」 뒤로 링크가 있다 — 브라우저 뒤로가기에만 기대지 않는다 (§4-A 금지)', () => {
  const source = read(DETAIL)
  assert.ok(/to="\/teacher"/.test(source), `${DETAIL} 에 목록으로 돌아가는 링크가 없다`)
  assert.ok(source.includes('내 수업'), `${DETAIL} 의 뒤로 링크 문구가 「내 수업」이 아니다`)
})

test('④ 통계 3열이 있고 참여자 수가 그 안에 있다 (§4-A 「통계에 참여자 수 누락」 금지)', () => {
  const source = read(DETAIL)
  assert.ok(/grid-cols-3/.test(source), `${DETAIL} 에 3열 통계 그리드가 없다`)
  for (const label of ['참여 학생', '열어 본 문항', '진행 중']) {
    assert.ok(source.includes(label), `통계 칸 「${label}」이 없다`)
  }
  // 🚨 「읽은 문항」으로 되돌리지 말 것 — 진도 행은 문항을 **여는 순간** 생긴다(session-progress.ts).
  //    「읽은」이라고 적으면 교사가 이해도까지 봤다고 오해한다.
  assert.equal(stripComments(source).includes('읽은 문항'), false, '「읽은 문항」은 앱이 알 수 없는 것을 안다고 말하는 문구다')
})

test('⑤ 확인 모달을 닫는 길이 셋이다(백드롭·ESC·X) + 파괴 버튼이 자동 포커스되지 않는다', () => {
  const source = read(MODAL)
  assert.ok(/onClick=\{onClose\}/.test(source), '백드롭 클릭으로 닫히지 않는다')
  assert.ok(/'Escape'/.test(source), 'ESC 로 닫히지 않는다')
  assert.ok(/aria-label="닫기"/.test(source), 'X 버튼이 없다')
  assert.ok(/document\.body\.style\.overflow/.test(source), '모달 뒤 본문이 같이 스크롤된다')
  assert.ok(
    /cancelRef\.current\?\.focus\(\)/.test(source),
    '포커스가 「취소」에 있지 않다 — 열자마자 Enter 를 누르면 수업이 끝난다',
  )
})
