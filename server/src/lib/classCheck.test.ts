import { test } from 'node:test'
import assert from 'node:assert/strict'

import { classCheckBlock, providerFingerprints } from './classCheck'

// 수업점검(class-check)이 /health 에서 읽는 블록의 계약.
//
// 빈 객체를 「캡 없음」으로 추론하게 두면 **버그로 빈 객체가 나온 경우와 구분되지 않는다.**
// 그래서 capPolicy 로 «있음/없음»을 항상 명시한다.
//
// 🚨 2026-08-10 변경: «내 차례»(POST /api/vibe/my-turn)가 전역 일일 캡을 들여왔다.
//    그 전까지 이 앱은 캡이 없어 'none' 이 참이었지만, 이제 'none' 은 거짓말이다.
//    (롤백 스위치로 통제를 끄면 다시 실제로 캡이 없는 상태라 'none' 이 참이 된다 — 아래 둘 다 덮는다.)

// 🚨 2026-08-11 jery 결정: 「내 차례」 호출 통제의 **기본값을 껐다**(바이브코딩 수업 개방과 함께).
//    그래서 env 를 안 주면 capPolicy = 'none' 이 **참**이다. 이 테스트는 그 «기본이 무엇인가»와
//    «켰을 때 제대로 말하는가»를 둘 다 못 박는다 — 한쪽만 두면 기본값이 몰래 뒤집혀도 초록이다.
test('classCheckBlock: 캡이 있으면 있다고, 없으면 없다고 «명시»한다', () => {
  const saved = process.env.MYTURN_GUARD_ENABLED

  delete process.env.MYTURN_GUARD_ENABLED
  const byDefault = classCheckBlock()
  assert.equal(byDefault.capPolicy, 'none', '기본이 «통제 끔»인데 캡이 있는 척하면, 읽는 쪽이 없는 상한을 믿는다')
  assert.deepEqual(byDefault.caps, {}, '캡이 없다고 말해 놓고 값을 흘리면 둘 중 하나는 거짓말이다')

  process.env.MYTURN_GUARD_ENABLED = '1'
  const on = classCheckBlock()
  assert.equal(on.capPolicy, 'app-daily', '전역 일일 캡이 있는데 none 이라 말하면 판정하는 쪽이 여유를 과대평가한다')
  assert.ok(Object.keys(on.caps).length > 0, '정책이 app-daily 인데 caps 가 비면 읽는 쪽이 값을 지어내야 한다')
  assert.equal(on.used, null, '셀 카운터가 아예 없다 ≠ 오늘 0회 썼다')

  process.env.MYTURN_GUARD_ENABLED = '0'
  const off = classCheckBlock()
  assert.equal(off.capPolicy, 'none', '통제를 껐으면 캡이 있는 척하지 않는다')
  assert.deepEqual(off.caps, {})

  if (saved === undefined) delete process.env.MYTURN_GUARD_ENABLED
  else process.env.MYTURN_GUARD_ENABLED = saved
})

test('classCheckBlock: 폐쇄 목록 — 키를 늘리려면 이 테스트도 같이 고쳐야 한다', () => {
  assert.deepEqual(
    Object.keys(classCheckBlock()).sort(),
    ['capPolicy', 'caps', 'providerFingerprint', 'used']
  )
})

test('providerFingerprints: 키가 없으면 항목 자체를 안 넣는다', () => {
  const saved = {
    g: process.env.GEMINI_API_KEY,
    ga: process.env.GOOGLE_AI_API_KEY,
    a: process.env.ANTHROPIC_API_KEY,
  }
  delete process.env.GEMINI_API_KEY
  delete process.env.GOOGLE_AI_API_KEY
  delete process.env.ANTHROPIC_API_KEY
  try {
    // 빈 문자열의 해시를 흘리면 «키 없는 앱들»이 전부 같은 지문으로 보여 공유로 오독된다.
    assert.deepEqual(providerFingerprints(), {})
  } finally {
    if (saved.g) process.env.GEMINI_API_KEY = saved.g
    if (saved.ga) process.env.GOOGLE_AI_API_KEY = saved.ga
    if (saved.a) process.env.ANTHROPIC_API_KEY = saved.a
  }
})

test('providerFingerprints: 같은 키는 같은 지문, 원문은 안 나간다', () => {
  const saved = process.env.ANTHROPIC_API_KEY
  const secret = 'sk-ant-super-secret-value-0123456789'
  process.env.ANTHROPIC_API_KEY = secret
  try {
    const a = providerFingerprints().anthropic
    assert.match(String(a), /^[0-9a-f]{8}$/, '지문은 16진 8자')
    assert.ok(!secret.includes(String(a)), '지문이 원문 부분문자열이면 안 된다')
    assert.equal(providerFingerprints().anthropic, a, '같은 키 → 같은 지문(공유 판정의 근거)')

    process.env.ANTHROPIC_API_KEY = secret + 'x'
    assert.notEqual(providerFingerprints().anthropic, a, '다른 키 → 다른 지문')
  } finally {
    if (saved) process.env.ANTHROPIC_API_KEY = saved
    else delete process.env.ANTHROPIC_API_KEY
  }
})

test('classCheckBlock: 비밀 원문이 직렬화 결과에 없다', () => {
  const saved = process.env.GEMINI_API_KEY
  const secret = 'AIza-super-secret-value-0123456789'
  process.env.GEMINI_API_KEY = secret
  try {
    assert.ok(!JSON.stringify(classCheckBlock()).includes(secret), '원문 API 키가 실렸다')
  } finally {
    if (saved) process.env.GEMINI_API_KEY = saved
    else delete process.env.GEMINI_API_KEY
  }
})
