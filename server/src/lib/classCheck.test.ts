import { test } from 'node:test'
import assert from 'node:assert/strict'

import { classCheckBlock, providerFingerprints } from './classCheck'

// 수업점검(class-check)이 /health 에서 읽는 블록의 계약.
//
// 이 앱은 **앱 레벨 AI 캡이 없다.** 그래서 caps 가 비어 있는데, 빈 객체를 「캡 없음」으로
// 추론하게 두면 **버그로 빈 객체가 나온 경우와 구분되지 않는다.** capPolicy 로 명시한다.

test('classCheckBlock: 앱 캡이 없다는 사실을 «명시»한다', () => {
  const cc = classCheckBlock()
  assert.equal(cc.capPolicy, 'none', '캡 정책을 명시해야 «침묵»과 «없음»이 구분된다')
  assert.deepEqual(cc.caps, {})
  assert.equal(cc.used, null, '셀 카운터가 아예 없다 ≠ 오늘 0회 썼다')
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
