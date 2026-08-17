// 터미널 AI 목소리(«한 터미널, 두 목소리»)의 계약 — SDD 결정 6·7·14.
//
// 지키는 것 셋:
//   1단 로컬 — 뻔한 오타는 서버 호출 없이 즉시. 30명이 쳐도 수업이 안 끊긴다.
//   2단 Haiku — 자유 문장만 의도로 나간다. 자동 실행은 없다 — 손은 학생이 다시 친다.
//   대체 응답 — 장애 시에도 안내가 멈추지 않고, «(대체 응답)» 라벨을 절대 떼지 않는다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (...rel: string[]) => readFileSync(path.join(ROOT, ...rel), 'utf8')

const shell = require(path.resolve(ROOT, 'client', 'src', 'lib', 'lab-shell')) as
  typeof import('../../../client/src/lib/lab-shell')

test('1) 뻔한 오타는 로컬(1단)이 잡는다 — 서버 의도가 나가지 않고, ai▸ 목소리로만 제안한다', () => {
  for (const typo of ['sl', 'claer', 'pwe']) {
    const { events } = shell.execute(typo, shell.INITIAL_LAB_STATE, `k:${typo}`)
    assert.equal(
      events.some((event) => event.kind === 'ai'),
      false,
      `오타 «${typo}» 가 서버 호출 의도를 내보냈다 — 1단은 호출 0 이어야 한다`,
    )
    const aiLines = events.filter((event) => event.kind === 'line' && event.tone === 'ai')
    assert.ok(aiLines.length > 0, `오타 «${typo}» 에 ai▸ 제안이 없다`)
    assert.ok(
      aiLines.every((event) => event.kind === 'line' && event.text.startsWith(shell.AI_PREFIX)),
      'AI 목소리 줄이 ai▸ 프리픽스 없이 나간다 — 셸 출력(사실)과 AI 의 말이 안 갈라진다',
    )
  }
  // 음성 대조군 — 아는 명령은 오타 취급하지 않는다.
  const { events } = shell.execute('ls', shell.INITIAL_LAB_STATE, 'k:ls')
  assert.equal(events.some((event) => event.kind === 'line' && event.tone === 'ai'), false, 'ls 가 오타로 잡혔다')
})

test('2) 자유 문장은 2단 의도로만 나간다 — 셸이 답을 지어내지 않는다', () => {
  const { events } = shell.execute('이제 뭘 하면 돼?', shell.INITIAL_LAB_STATE, 'k:free')
  const intents = events.filter((event): event is Extract<typeof events[number], { kind: 'ai' }> => event.kind === 'ai')
  assert.equal(intents.length, 1, '자유 문장이 voice 의도 하나로 나가지 않는다')
  assert.equal(intents[0]!.mode, 'voice')
  // 셸이 자기 말을 덧붙이면 «꾸며낸 대사 금지» 골격이 깨진다 — echo 밖의 출력은 없어야 한다.
  const spoken = events.filter((event) => event.kind === 'line' && event.tone !== 'input')
  assert.deepEqual(spoken, [], '셸이 자유 문장에 스스로 답을 지어냈다')
})

test('3) 제안은 제안일 뿐 — 화면이 suggestedCommand 를 대신 실행하지 않는다', () => {
  const tab = read('client', 'src', 'components', 'learn', 'LabTab.tsx')
  assert.ok(/suggestedCommand/.test(tab), 'LabTab 이 제안을 표시조차 안 한다 — 이 검사가 헛돈다')
  assert.equal(
    /execute\([^)]*suggestedCommand/.test(tab),
    false,
    'LabTab 이 제안 명령을 대신 실행한다 — 손은 학생이 다시 쳐야 한다 (SDD 결정 6)',
  )
  const shellSource = read('client', 'src', 'lib', 'lab-shell.ts')
  assert.ok(/자동으로 실행하지는 않아요/.test(shellSource), '1단 제안이 «자동 실행 없음»을 학생에게 말하지 않는다')
})

test('4) 장애 시 대체 응답 — 라벨이 붙고, 내용은 판정과 같은 자리(nextStepOf)에서 나온다', () => {
  const lines = shell.voiceFallbackLines(shell.INITIAL_LAB_STATE)
  assert.ok(lines.length >= 2, '대체 응답이 안내를 담지 않는다')
  const first = lines[0]!
  assert.ok(first.kind === 'line' && first.text.includes('(대체 응답)'), '«(대체 응답)» 라벨이 없다 — 진실성 장치다 (SDD 결정 14)')
  assert.ok(
    lines.some((event) => event.kind === 'line' && /지금은 미션|다음 —/.test(event.text)),
    '대체 응답이 지금 할 일을 안 읽어 준다 — AI 없이도 안내가 이어져야 한다 (AI 의존도 0)',
  )
  // 화면이 실패 시 이 폴백을 실제로 쓴다.
  const tab = read('client', 'src', 'components', 'learn', 'LabTab.tsx')
  assert.ok(/voiceFallbackLines\(/.test(tab), 'LabTab 이 voice 실패에 대체 응답을 안 쓴다')
})

test('5) 서버 2단 — 신원은 resolveActorId, 연타 방지는 소진이 아니라 창이다', () => {
  const route = read('server', 'src', 'routes', 'lab.ts')
  const voiceRoute = route.slice(route.indexOf("router.post('/voice'"), route.indexOf("router.post('/submit'"))
  assert.ok(/takeVoiceToken\(resolveActorId\(req\)\)/.test(voiceRoute), 'voice 가 학생 신원을 resolveActorId 로 안 잰다')
  assert.ok(/retryAfterSeconds/.test(voiceRoute), '429 에 기다릴 초가 없다 — 화면이 지어내게 된다')

  const { takeVoiceToken, __resetLabAiForTest, VOICE_ACTOR_PER_MIN } = require('./lab-ai') as
    typeof import('./lab-ai')
  __resetLabAiForTest()
  const now = 1_000_000
  for (let i = 0; i < VOICE_ACTOR_PER_MIN; i += 1) {
    assert.equal(takeVoiceToken('pt:a', now + i).ok, true, `연타 방지가 ${VOICE_ACTOR_PER_MIN}번 안에서 막았다`)
  }
  assert.equal(takeVoiceToken('pt:a', now + 100).ok, false, '창이 넘쳤는데 안 막는다')
  // 🔑 1분이 지나면 그냥 다시 된다 — «횟수 소진»이 아니다 (앱 안 한도 금지 철학).
  assert.equal(takeVoiceToken('pt:a', now + 61_000).ok, true, '1분이 지났는데 계속 막는다 — 이건 소진이지 창이 아니다')
  // 다른 학생은 서로를 굶기지 않는다.
  assert.equal(takeVoiceToken('pt:b', now + 100).ok, true, '한 학생의 연타가 다른 학생을 막는다')
  __resetLabAiForTest()
})

test('6) 서버 응답은 2문장·제안 모양 검사를 지킨다 — 모델이 지어낸 것을 화면이 권하지 않게', () => {
  const source = read('server', 'src', 'lib', 'lab-ai.ts')
  assert.ok(/\.slice\(0, 2\)/.test(source), 'reply 를 2문장으로 안 자른다')
  assert.ok(/\^\[a-z\]\[a-z0-9 \.\/~_-\]\{0,30\}\$/.test(source), 'suggest 의 모양 검사가 없다')
  assert.ok(/voice_empty_reply/.test(source), '빈 응답을 성공으로 흘려보낸다')
})
