import { test } from 'node:test'
import assert from 'node:assert/strict'

import { classCheckBlock, providerFingerprints } from './classCheck'

// 수업점검(class-check)이 /health 에서 읽는 블록의 계약.
//
// 빈 객체를 「캡 없음」으로 추론하게 두면 **버그로 빈 객체가 나온 경우와 구분되지 않는다.**
// 그래서 capPolicy 로 «있음/없음»을 항상 명시한다.
//
// 🚨 2026-08-18 변경: «내 차례»(POST /api/vibe/my-turn) 철거로 **앱 전역 캡이 실제로 사라졌다.**
//    2026-08-10~08-18 사이에는 그 라우트가 전역 일일 캡을 들여와서 'none' 이 거짓말이었고,
//    가드 스위치(MYTURN_GUARD_ENABLED)에 따라 갈리는 두 상태를 여기서 덮고 있었다.
//    지금은 갈래가 없다 — 남은 통제는 전부 «신원별 창»(per-key)이라 학급 총량을 묶지 않는다.
// 🚨 이 테스트가 지키는 것은 「캡이 없다」가 아니라 **「없으면 없다고 말한다」** 다.
//    app 스코프 캡이 다시 들어오는데 여기가 그대로면, 캡을 보고 인원을 계산하는 쪽(축3 R6·R7)이
//    없는 여유를 믿는다. 그래서 scope 까지 본다.
test('classCheckBlock: 앱 전역 캡이 없으면 없다고 «명시»한다 — 침묵은 의미가 아니다', () => {
  const block = classCheckBlock()
  assert.equal(block.capPolicy, 'none', '앱 캡이 없으면 none 이 참이다 — 빈 객체로 추론하게 두지 않는다')
  assert.equal(block.used, null, '셀 카운터가 아예 없다 ≠ 오늘 0회 썼다')

  // 🚨 남은 캡이 전부 per-key 인지 본다. app 스코프가 하나라도 생기면 capPolicy 가 거짓이 된다.
  const caps = block.caps as Record<string, { value: number; scope: string; audience: string }>
  const appScoped = Object.entries(caps).filter(([, c]) => c.scope === 'app').map(([k]) => k)
  assert.deepEqual(
    appScoped,
    [],
    `app 스코프 캡이 생겼는데 capPolicy 가 none 이다 — 읽는 쪽이 없는 여유를 믿는다: ${appScoped.join(', ')}`,
  )

  // 🔑 캡을 선언한 이상 값·스코프·대상이 전부 서 있어야 한다 — 하나라도 비면 읽는 쪽이 지어낸다.
  for (const [k, c] of Object.entries(caps)) {
    assert.ok(Number.isFinite(c.value) && c.value > 0, `${k}: value 가 숫자가 아니다`)
    assert.ok(['app', 'per-key'].includes(c.scope), `${k}: scope 가 계약 밖이다`)
    assert.ok(['all', 'verified', 'anon'].includes(c.audience), `${k}: audience 가 계약 밖이다`)
  }

  // 🚨 철거분이 되살아나면 여기서 잡는다 — MYTURN_* 은 더 이상 존재하지 않는 라우트의 캡이다.
  assert.equal(
    Object.keys(caps).some((k) => k.startsWith('MYTURN_')),
    false,
    '철거한 «내 차례» 캡이 선언에 남아 있다 — 라우트가 없는데 캡만 말하면 원장이 유령을 잰다',
  )
})

test('classCheckBlock: 폐쇄 목록 — 키를 늘리려면 이 테스트도 같이 고쳐야 한다', () => {
  // 🔑 2026-08-18 tokenCaps 추가 — env 조정형 출력 상한의 런타임 실효값(축2-b 가 caps: 로 중계).
  assert.deepEqual(
    Object.keys(classCheckBlock()).sort(),
    ['capPolicy', 'caps', 'providerFingerprint', 'tokenCaps', 'used']
  )
  // 출력 상한이 항상 숫자로 선다 — 스모크가 «숫자만 중계» 하므로 비면 조용히 빠진다.
  // 🔑 2026-08-18 「내 차례」 철거로 MYTURN_MAX_OUTPUT_TOKENS 는 잰 대상 자체가 없어졌다.
  const caps = (classCheckBlock() as { tokenCaps: Record<string, number> }).tokenCaps
  assert.deepEqual(Object.keys(caps).sort(), ['LAB_MAX_OUTPUT_TOKENS'])
  for (const [k, v] of Object.entries(caps)) assert.ok(Number.isFinite(v) && v > 0, `${k} 가 숫자가 아니다`)
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
