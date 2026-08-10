// 학생 챗봇(POST /api/chat)의 호출 통제 — «누구를 한 명으로 세는가» 와 «그 한 명의 한도» 계약.
//
// 🚨 2026-08-11 이전: `actorId = req.ip` 였다. 학교는 교실 전체가 공인 IP 하나로 나가기 때문에
//    한 반이 통 하나에 뭉쳤고, 첫 학생이 한도를 쓰면 나머지가 전부 429 를 맞았다.
//    채점 라우트는 #139 에서 고쳤지만 챗봇은 남아 있었다.
//
// 🚨 키만 바꾸면 안 된다: 같은 «하루 1000» 이 반 전체 몫에서 **1인 몫**이 되면 30명 교실의
//    지출 상한이 30배로 뛴다. 그래서 한도를 함께 다시 잡았고(학생 하루 40 · 전역 하루 1000),
//    이 파일이 «키와 숫자가 한 몸» 이라는 것을 계약으로 붙든다.
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { isParticipantKey } from './actor-id'
import { __resetRateLimitBucketsForTest, chatLimits, takeRateLimitToken } from './chat-service'
import { getChatBucketKey } from '../routes/chat'

// 서명 비밀 없이도 «키를 어떻게 만드는가» 를 검사하기 위한 가짜 검증기.
// 🔑 실물 비밀은 CI 에 없다 — 비밀에 기대면 이 검사는 CI 에서만 빨개진다.
const fakeVerify = (token: string) => (token.startsWith('ok-') ? { participant_id: token.slice(3) } : null)

const mk = (cookie?: string, userAgent = 'UA-공용기기') =>
  ({
    ip: '1.2.3.4',
    socket: { remoteAddress: '1.2.3.4' },
    get: (name: string) => {
      if (name.toLowerCase() === 'cookie') return cookie
      if (name.toLowerCase() === 'user-agent') return userAgent
      return undefined
    },
  }) as never

test('같은 교실(같은 IP·같은 기기)의 두 학생이 서로 다른 통에 들어간다', () => {
  const a = getChatBucketKey(mk('arch_pt=ok-alpha'), fakeVerify)
  const b = getChatBucketKey(mk('arch_pt=ok-beta'), fakeVerify)

  assert.ok(isParticipantKey(a), `참여자 키여야 한다: ${a}`)
  assert.notEqual(a, b, '같은 IP 에서 온 두 학생이 같은 키를 받으면, 한 명이 쓰는 순간 반 전체가 막힌다')
})

test('참여자 키에는 IP 도 User-Agent 도 섞이지 않는다 — 섞이면 기기를 바꿀 때 한도가 초기화된다', () => {
  const key = getChatBucketKey(mk('arch_pt=ok-alpha', 'UA-노트북'), fakeVerify)
  assert.equal(key, 'pt:alpha')
  assert.equal(getChatBucketKey(mk('arch_pt=ok-alpha', 'UA-폰'), fakeVerify), key, '같은 학생은 기기를 바꿔도 같은 통')
})

test('토큰이 없으면 공유 통으로 떨어지고, 그 사실이 키에 남는다', () => {
  const key = getChatBucketKey(mk(undefined), fakeVerify)
  assert.ok(!isParticipantKey(key), `토큰이 없으면 참여자 키가 아니어야 한다: ${key}`)
  assert.match(key, /^ip:/, '호출부가 «한 명»과 «여럿일 수 있는 통»을 구분할 수 있어야 한다')
})

test('위조 토큰은 신원이 되지 못한다 — 되면 아무나 남의 통을 주장할 수 있다', () => {
  assert.ok(!isParticipantKey(getChatBucketKey(mk('arch_pt=위조'), fakeVerify)))
  // 기본 인자가 «진짜» 검증기인지. 가짜만 검사하면 실물 경로는 한 번도 안 밟힌다.
  assert.ok(!isParticipantKey(getChatBucketKey(mk('arch_pt=위조'))))
})

test('공유 통의 한도가 학생 한 명 한도보다 넉넉하다 — 여럿이 나눠 쓰는 통이기 때문', () => {
  const l = chatLimits()
  assert.ok(
    l.sharedDaily > l.participantDaily,
    '공유 통에 한 명 몫을 적용하면 자습하던 다른 학생이 남의 질문 때문에 막힌다',
  )
  assert.ok(l.sharedPerMin > l.participantPerMin)
})

/** 한도별로 «그 한도가 자기 이유로» 막히는지 보려면 나머지를 넉넉히 열어 둬야 한다. */
function withLimits(overrides: Record<string, string>, body: () => void) {
  const saved: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(overrides)) {
    saved[k] = process.env[k]
    process.env[k] = v
  }
  __resetRateLimitBucketsForTest()
  try {
    body()
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
    __resetRateLimitBucketsForTest()
  }
}

test('학생 한 명이 한도를 다 써도 옆 학생은 멀쩡하다 — 이게 이번 변경의 요점', () => {
  withLimits({ CHAT_ACTOR_PER_MIN: '5', CHAT_GLOBAL_PER_MIN: '9999', CHAT_GLOBAL_DAILY_CAP: '9999' }, () => {
    for (let i = 0; i < 5; i += 1) {
      assert.equal(takeRateLimitToken('pt:alpha').allowed, true, `${i + 1}번째 호출이 벌써 막히면 한도가 헛돈다`)
    }
    assert.equal(takeRateLimitToken('pt:alpha').allowed, false, '한도를 넘겼는데 통과하면 그건 한도가 아니다')
    assert.equal(
      takeRateLimitToken('pt:beta').allowed,
      true,
      '한 학생이 다 썼다고 옆 학생까지 막히면, IP 로 재던 옛 결함이 그대로 돌아온 것이다',
    )
  })
})

test('전역 일일 캡이 실제로 막는다 — 학생별 키가 열어 둔 상한을 이게 닫는다', () => {
  // 🔑 전역 «분당» 을 넉넉히 열어야, 멈춘 이유가 «일일» 캡임이 확실해진다.
  //    둘이 같은 값이면 어느 쪽이 막았는지 구분할 수 없고, 그런 검사는 아무것도 증명하지 못한다.
  withLimits({ CHAT_GLOBAL_DAILY_CAP: '25', CHAT_GLOBAL_PER_MIN: '9999', CHAT_ACTOR_PER_MIN: '9999' }, () => {
    let allowed = 0
    for (let i = 0; i < 60; i += 1) {
      if (takeRateLimitToken(`pt:student-${i}`).allowed) allowed += 1
    }
    assert.equal(allowed, 25, '학생마다 새 통을 받으므로, 전역 일일 캡이 없으면 상한이 사실상 사라진다')
  })
})

test('공유 통은 학생 한 명보다 실제로 더 많이 받는다 (선언이 아니라 동작으로)', () => {
  withLimits(
    { CHAT_ACTOR_PER_MIN: '3', CHAT_SHARED_PER_MIN: '8', CHAT_GLOBAL_PER_MIN: '9999', CHAT_GLOBAL_DAILY_CAP: '9999' },
    () => {
      let one = 0
      while (takeRateLimitToken('pt:alpha').allowed) one += 1
      let shared = 0
      while (takeRateLimitToken('ip:1.2.3.4:UA').allowed) shared += 1
      assert.equal(one, 3)
      assert.equal(shared, 8, '공유 통이 한 명 몫만 받으면, 자습 중인 다른 학생들이 남의 질문에 막힌다')
    },
  )
})

test('가드가 실패할 수 있는 계측인지 — 한도가 0 이나 무한이 아니다', () => {
  for (const [name, value] of Object.entries(chatLimits())) {
    assert.ok(Number.isFinite(value) && value > 0, `${name} 이 0·무한이면 위 검사들이 의미를 잃는다`)
  }
})
