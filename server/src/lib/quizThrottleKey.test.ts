// 퀴즈 채점 호출 통제의 «누구» 가드.
//
// 🚨 예전 키는 «IP + User-Agent» 였다. 학교는 교실 전체가 공인 IP 하나로 나가고 학교 지급 PC 는
//    User-Agent 도 같아서, 30명 한 반이 통 하나에 뭉쳐 분당 30회를 나눠 썼다.
//    «다 같이 퀴즈 풀어» 한 번이면 늦게 낸 학생부터 429 로 채점을 못 받는다 — 수업 중에 조용히 멈춘다.
//    2026-08-10 «내 차례»에서 잡은 것과 같은 결함이고, 여기 남아 있던 것이다.
//
// 🚨 서명 비밀에 기대지 않는다. 비밀은 CI 에 없어서, 실제 토큰을 서명하는 테스트는 로컬에서만 초록이고
//    CI 에서 빨강이 된다(2026-08-10 실제로 밟았다). 검증기를 주입해 «키를 어떻게 만드는가» 만 본다.
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getBucketKey, PARTICIPANT_LIMIT, SHARED_LIMIT } from '../routes/quiz'
import { isParticipantKey } from './actor-id'

const mk = (cookie?: string, ua = 'school-pc') =>
  ({
    ip: '1.2.3.4',
    socket: { remoteAddress: '1.2.3.4' },
    get: (name: string) => {
      const key = name.toLowerCase()
      if (key === 'cookie') return cookie
      if (key === 'user-agent') return ua
      return undefined
    },
  }) as never

const fakeVerify = (token: string) => (token.startsWith('ok-') ? { participant_id: token.slice(3) } : null)

test('같은 교실(같은 IP·같은 기기)의 두 학생이 서로 다른 통에 들어간다', () => {
  const keyA = getBucketKey(mk('arch_pt=ok-alpha'), fakeVerify)
  const keyB = getBucketKey(mk('arch_pt=ok-beta'), fakeVerify)

  assert.ok(isParticipantKey(keyA), `참여자 키여야 한다: ${keyA}`)
  assert.notEqual(keyA, keyB, '같은 IP·같은 User-Agent 라도 학생이 다르면 통이 달라야 한다')
})

test('참여자 키에는 IP 도 User-Agent 도 섞이지 않는다 — 섞이면 기기를 바꿀 때 한도가 초기화된다', () => {
  assert.equal(
    getBucketKey(mk('arch_pt=ok-alpha', 'phone'), fakeVerify),
    getBucketKey(mk('arch_pt=ok-alpha', 'school-pc'), fakeVerify),
  )
})

test('토큰이 없으면 공유 통으로 떨어지고, 그 사실이 키에 남는다', () => {
  const key = getBucketKey(mk(), fakeVerify)
  assert.ok(!isParticipantKey(key), `토큰이 없으면 참여자 키가 아니어야 한다: ${key}`)
  assert.ok(key.startsWith('ip:'), '공유 통임을 호출부가 알아볼 수 있어야 한다')
})

test('공유 통은 여전히 User-Agent 로 갈린다 — 자습 중인 서로 다른 기기까지 한 통에 뭉치지 않게', () => {
  assert.notEqual(getBucketKey(mk(undefined, 'phone'), fakeVerify), getBucketKey(mk(undefined, 'school-pc'), fakeVerify))
})

test('공유 통의 한도가 학생 한 명 한도보다 넉넉하다 — 여럿이 나눠 쓰는 통이기 때문', () => {
  assert.ok(
    SHARED_LIMIT > PARTICIPANT_LIMIT,
    `공유 통 ${SHARED_LIMIT} 이 1인 한도 ${PARTICIPANT_LIMIT} 이하이면, 자습 중인 교실이 예전과 똑같이 막힌다`,
  )
})

test('가드가 실패할 수 있는 계측인지 — 위조 토큰이 참여자 키로 통과하지 않는다', () => {
  assert.ok(
    !isParticipantKey(getBucketKey(mk('arch_pt=위조된토큰'), fakeVerify)),
    '검증에 실패한 토큰을 신원으로 받아주면 아무나 남의 통을 주장할 수 있다',
  )
  // 검증기를 안 넘겼을 때 진짜 검증기가 쓰이는지 — 위조 토큰이 통과하면 주입 인자가 기본값을 덮어쓴 것이다.
  assert.ok(!isParticipantKey(getBucketKey(mk('arch_pt=위조된토큰'))), '기본 검증기도 위조를 걸러야 한다')
})
