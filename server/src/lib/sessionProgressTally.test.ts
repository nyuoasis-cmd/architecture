// 진도 집계(참여자별 개수 · 문항별 도달 학생 수)의 계약.
//
// 왜 있는가(2026-08-11 prod QA, 신입샘 t3): 교사 화면의 «이 차시 진행»과 «참여자 진도»가 같은
// 화면에 있으면서 서로를 몰랐다. 진짜 원인은 화면이 아니라 **서버가 qa_id 를 버린 것**이었다 —
// 행은 이미 다 읽어 오면서 참여자별 개수로 접고 문항 축을 통째로 날렸다.
//
// 🚨 문항 축을 그리는 화면은 2026-08-12 교안 철거로 사라졌지만 이 계약은 남긴다 — 축이 다시
//    필요해졌을 때 «어긋난 채로» 돌아오는 것이 이 사고의 모양이었다.
//
// 🚨 여기서 지키는 것: 두 축이 **같은 행에서** 나온다는 것. 한쪽에만 반영되는 행이 생기면
//    교사 화면에서 «진도 3/7 인데 어느 문항에도 안 잡히는 학생» 같은 유령이 나온다.
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { tallyProgressRows } from './session-progress'

test('① 같은 행이 두 축에 똑같이 반영된다 — 합계가 어긋나지 않는다', () => {
  const rows = [
    { participant_id: 'p1', qa_id: 'ch12_q01' },
    { participant_id: 'p1', qa_id: 'ch12_q02' },
    { participant_id: 'p2', qa_id: 'ch12_q01' },
  ]

  const { countsByParticipant, qaCompletion } = tallyProgressRows(rows)

  const byParticipant = [...countsByParticipant.values()].reduce((sum, n) => sum + n, 0)
  const byQa = Object.values(qaCompletion).reduce((sum, n) => sum + n, 0)

  assert.equal(byParticipant, 3, '참여자 축 합계가 행 수와 다르다')
  assert.equal(byQa, byParticipant, '두 축의 합계가 어긋난다 — 화면에서 유령 진도가 생긴다')
  assert.deepEqual(qaCompletion, { ch12_q01: 2, ch12_q02: 1 })
  assert.equal(countsByParticipant.get('p1'), 2)
})

test('② 주인 없는 행은 어느 축에서도 세지 않는다', () => {
  const { countsByParticipant, qaCompletion } = tallyProgressRows([
    { participant_id: null, qa_id: 'ch12_q01' },
    { qa_id: 'ch12_q01' },
    { participant_id: 'p1', qa_id: 'ch12_q01' },
  ])

  assert.equal(countsByParticipant.size, 1)
  assert.deepEqual(qaCompletion, { ch12_q01: 1 }, '주인 없는 행이 문항 축에만 반영됐다 — 두 축이 어긋난다')
})

test('③ qa_id 가 없는 행은 참여자 축에만 남는다 (문항 축에 빈 열쇠를 만들지 않는다)', () => {
  const { countsByParticipant, qaCompletion } = tallyProgressRows([
    { participant_id: 'p1', qa_id: null },
    { participant_id: 'p1' },
  ])

  assert.equal(countsByParticipant.get('p1'), 2)
  assert.deepEqual(Object.keys(qaCompletion), [], '빈 문항 열쇠가 생겼다 — 화면에 « 0/3» 같은 유령 칸이 뜬다')
})

test('④ 행이 없으면 둘 다 비어 있다', () => {
  const { countsByParticipant, qaCompletion } = tallyProgressRows([])
  assert.equal(countsByParticipant.size, 0)
  assert.deepEqual(qaCompletion, {})
})

test('⑤ 이 계측이 실패할 수 있는가 — ① 이 실제로 숫자를 보고 있다', () => {
  // 🚨 ① 은 «합계가 같다»를 본다. 두 축이 동시에 0 이면 그 단언은 아무것도 안 보고도 참이다.
  const { countsByParticipant, qaCompletion } = tallyProgressRows([{ participant_id: 'p1', qa_id: 'ch01_q01' }])
  assert.ok(countsByParticipant.size > 0 && Object.keys(qaCompletion).length > 0, '집계가 아무것도 세지 못한다')
})
