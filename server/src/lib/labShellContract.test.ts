// 12강 실습실 셸(`client/src/lib/lab-shell.ts`)의 **행동** 계약.
//
// 왜 텍스트 대조가 아니라 행동 검사인가: 이 셸은 학생이 90분 동안 두드리는 유일한 물건이고,
// 「모르는 명령에 무엇이라 답하는가」가 곧 수업의 품질이다. 파일에 그 문자열이 있는지가 아니라
// **실제로 그렇게 답하는지**를 봐야 한다.
//
// 🚨 클라 모듈은 **정적 import 로 가져오지 않는다.** server/tsconfig 의 rootDir 이 server/src 라
//    `import … from '../../../client/…'` 를 쓰면 tsx 는 멀쩡한데 `tsc` 가 TS6059 로 죽는다
//    (vibeQuizContract.test.ts 가 같은 이유로 같은 방식을 쓴다). 경로를 실행 시점에 계산해 읽는다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import path from 'node:path'
import { test } from 'node:test'

type LabTone = 'input' | 'plain' | 'dim' | 'ok' | 'bad' | 'warn'
type LabEvent = { kind: 'line'; text: string; tone: LabTone } | { kind: 'clear' } | { kind: 'exit' }
type LabState = {
  cwd: string[]
  openedFiles: string[]
  ranCommands: string[]
  seenAbout: boolean
  jumpedTo: number | null
  rules: string
  myOutputs: string[]
  reviewDone: boolean
  submittedRevision: number
  lastKey: string | null
  env: { widthPx: number; canPaste: boolean }
}
type LabShell = {
  execute: (command: string, state: LabState, key: string) => { events: LabEvent[]; nextState: LabState }
  missionIndexOf: (state: LabState) => number
  /** 「지금 무엇을 치는가」 한 자리. 터미널 안내와 입력칸 예시가 **여기 하나**를 쓴다(f7·f8). */
  nextStepOf: (state: LabState) => { command: string | null; progress: { done: number; total: number } | null }
  openingEvents: () => LabEvent[]
  earnedMissionIndex: (state: LabState) => number
  saveRules: (state: LabState, rules: string) => { events: LabEvent[]; nextState: LabState }
  applyMyOutputs: (state: LabState, outputs: string[]) => LabState
  markReviewDone: (state: LabState) => LabState
  markSubmitted: (state: LabState, revision: number) => LabState
  INITIAL_LAB_STATE: LabState
  LAB_COMMAND_NAMES: string[]
}
type LabData = {
  LAB_ABOUT: { title: string; lines: string[] }
  LAB_MISSIONS: { label: string; goal: string; live: boolean }[]
  LAB_RUN_FILES: readonly string[]
  LAB_QA_ID: string
  LAB_TREE: unknown
}

const clientPath = (...parts: string[]) => path.resolve(__dirname, '..', '..', '..', 'client', 'src', ...parts)
const shell: LabShell = require(clientPath('lib', 'lab-shell'))
const data: LabData = require(clientPath('data', 'vibe-lab-ch18'))

const { execute, missionIndexOf, openingEvents, INITIAL_LAB_STATE } = shell

/** 명령을 차례로 흘려 넣는다. 키는 매번 다르게 준다(같으면 idempotency 가 두 번째를 삼킨다). */
function run(commands: string[], from: LabState = INITIAL_LAB_STATE) {
  let state = from
  let events: LabEvent[] = []
  commands.forEach((command, index) => {
    const result = execute(command, state, `k${index}`)
    state = result.nextState
    events = result.events
  })
  return { state, events }
}

const textOf = (events: LabEvent[]) =>
  events
    .filter((e): e is Extract<LabEvent, { kind: 'line' }> => e.kind === 'line')
    .map((e) => e.text)
    .join('\n')

test('1) 파일은 진짜다 — cat 이 스냅샷의 내용을 그대로 준다', () => {
  const { events } = run(['cat runs/run-2.txt'])
  const out = textOf(events)
  assert.ok(out.includes('10% off'), 'run-2 의 실제 내용이 안 나온다 — 화면이 파일과 다른 것을 그리고 있다')

  // 음성 대조군 — 아무 문자열이나 통과하면 위 검사는 공짜다.
  assert.equal(out.includes('있지도 않은 문장'), false, '없는 내용이 «있다»고 나오면 탐지가 헛돈다')
})

test('2) REPLAY 라벨이 세 결과 안에 살아 있다 — 떼면 학생이 실시간 AI 답변으로 오해한다', () => {
  for (const file of data.LAB_RUN_FILES) {
    const { events } = run([`cat ${file}`])
    assert.ok(
      textOf(events).includes('REPLAY'),
      `${file} 에 REPLAY 라벨이 없다 — 사전 생성분을 실시간 호출로 오해하게 만든다(§3-가)`,
    )
  }
})

test('3) 세 결과는 뜻이 같고 형식이 다르다 — 같으면 12강이 가르칠 것이 없어진다', () => {
  const bodies = data.LAB_RUN_FILES.map((file) => {
    const out = textOf(run([`cat ${file}`]).events)
    return out.split('\n').filter((row) => !row.includes('REPLAY') && !row.startsWith('~/')).join('\n').trim()
  })
  assert.equal(new Set(bodies).size, bodies.length, '세 결과 중 같은 것이 있다 — 「형식이 다르다」를 보여 줄 수 없다')
  for (const body of bodies) {
    assert.ok(/9,?000/.test(body), `최종가 9000 이 빠진 결과가 있다 — 뜻이 달라지면 «형식만 다르다»가 거짓이 된다:\n${body}`)
  }
})

test('4) 모르는 명령은 조사를 붙이지 않고 다음 행동을 말하며, «아직 안 열린» 명령과도 가른다', () => {
  // 🔑 2026-08-17 AI 목소리(2단 판정): 한글·자유 문장(예: 「뭐하지」)은 이제 «모르는 명령»이 아니라
  //    voice 의도로 나간다(labVoiceContract 2). «모르는 명령» 안내는 오타도 자유 문장도 아닌
  //    입력에만 남는다 — 그 갈래가 살아 있는지 여기서 본다.
  const unknown = textOf(run(['zqxv']).events)
  assert.ok(unknown.includes('이 실습실이 모르는 명령입니다'), '모르는 명령에 그렇다고 말하지 않는다')
  assert.ok(unknown.includes('help'), '모르는 명령에 다음 행동(help)을 안 준다 — 학생이 멈춘다')
  assert.ok(unknown.includes("'zqxv' — 이 실습실이 모르는 명령입니다."), '명령을 따옴표로 가르지 않는다')
  // 🚨 조사를 아예 붙이지 않는다 — 받침을 모르는 낱말에 은/는·이라는/라는 중 어느 쪽을 붙여도 깨진다.
  assert.equal(/zqxv'?\s*(이?라는|[은는])/.test(unknown), false, '학생이 친 낱말 뒤에 조사를 붙였다 — 받침에 따라 깨진다')
  assert.ok(
    unknown.includes('지금 할 일은 위에 적혀 있어요. 전체 목록은 help.'),
    '모르는 명령 뒤에 지금 할 일과 전체 목록을 함께 안내하지 않는다',
  )

  const notYet = textOf(run(['npm test']).events)
  assert.ok(notYet.includes('아직'), 'npm test 를 «모르는 명령»으로 답하면 학생이 오타를 의심하며 다시 친다')
  assert.equal(notYet.includes('모르는 명령'), false, '아직 안 열린 명령을 모른다고 답하고 있다')
})

test('5) 꾸며낸 성공을 만들지 않는다 — 읽기 전용이라고 말한다', () => {
  for (const command of ['rm parse.js', 'touch a.txt', 'mkdir b']) {
    const out = textOf(run([command]).events)
    assert.ok(out.includes('읽기 전용'), `${command} 에 읽기 전용이라고 말하지 않는다 — 학생은 지워진 줄 안다`)
  }
})

test('6) 실습실 밖으로 나갈 수 없다 — cd .. 로 없는 바깥이 생기지 않게', () => {
  const { state, events } = run(['cd ..'])
  assert.deepEqual(state.cwd, [], 'cd .. 가 루트 위로 올라갔다 — 실습실 밖이 있는 것처럼 보인다')
  assert.ok(textOf(events).includes('가장 바깥'), '왜 못 가는지를 말하지 않는다')

  const deep = run(['cd runs', 'cd ..', 'cd ..'])
  assert.deepEqual(deep.state.cwd, [], '내려갔다 올라온 뒤에도 루트 위로 못 올라가야 한다')
})

test('7) cd 가 실제로 위치를 바꾸고 pwd 가 그것을 말한다', () => {
  const { state } = run(['cd runs'])
  assert.deepEqual(state.cwd, ['runs'])
  const out = textOf(execute('pwd', state, 'x').events)
  assert.ok(out.includes('~/pricing/runs'), `pwd 가 현재 위치를 안 말한다: ${out}`)

  // 폴더가 아닌 것에 cd 하면 위치가 안 바뀐다.
  const stuck = execute('cd parse.js', INITIAL_LAB_STATE, 'y')
  assert.deepEqual(stuck.nextState.cwd, [], '파일에 cd 가 됐다')
  assert.ok(textOf(stuck.events).includes('cat'), '파일이면 cat 을 쓰라고 안내하지 않는다')
})

test('8) 미션은 상태에서 계산된다 — ls·pwd 로 1번, 세 결과를 다 열어야 2번이 끝난다', () => {
  assert.equal(missionIndexOf(INITIAL_LAB_STATE), 0, '아무것도 안 했는데 1번이 끝나 있다')

  const looked = run(['ls', 'pwd']).state
  assert.equal(missionIndexOf(looked), 1, 'ls·pwd 를 했는데 1번이 안 끝난다')

  const twoOfThree = run(['ls', 'pwd', 'cat runs/run-1.txt', 'cat runs/run-2.txt']).state
  assert.equal(missionIndexOf(twoOfThree), 1, '셋 중 둘만 열었는데 2번이 끝났다 — 학생이 안 본 것을 봤다고 센다')

  const all = run(['ls', 'pwd', ...data.LAB_RUN_FILES.map((f) => `cat ${f}`)]).state
  assert.equal(missionIndexOf(all), 2, '세 결과를 다 열었는데 2번이 안 끝난다')
})

test('9) 같은 열쇠로 두 번 부르면 두 번째는 아무 일도 안 한다 — 재전송이 진행을 두 칸 밀지 않게', () => {
  const first = execute('ls', INITIAL_LAB_STATE, 'same-key')
  const second = execute('cat runs/run-1.txt', first.nextState, 'same-key')
  assert.deepEqual(second.events, [], '같은 열쇠인데 명령이 또 실행됐다')
  assert.deepEqual(second.nextState, first.nextState, '같은 열쇠인데 상태가 바뀌었다')

  const third = execute('cat runs/run-1.txt', first.nextState, 'other-key')
  assert.ok(third.events.length > 0, '다른 열쇠인데 아무 일도 안 한다 — idempotency 가 모든 것을 삼킨다')
})

test('10) 처음 화면이 축소판 고지와 지금 할 일을 함께 보여 준다', () => {
  const opening = openingEvents()
  const out = textOf(opening)
  for (const notice of [data.LAB_ABOUT.title, ...data.LAB_ABOUT.lines]) {
    assert.ok(out.includes(notice), `처음 화면에서 고지문 한 줄이 빠졌다: ${notice}`)
  }
  assert.ok(out.includes('줄인'), '무엇을 줄였는지 안 말한다(jery: 「당연히 가짜임을 알려줘야지」)')
  assert.ok(out.includes('진짜'), '무엇이 진짜인지 안 말한다 — 「가짜」만 말하면 실습 전체를 흉내로 여긴다')
  assert.ok(out.includes('REPLAY'), '사전 생성분이 있다는 것을 처음 화면에서 안 말한다')
  assert.ok(out.includes(data.LAB_MISSIONS[0]!.goal), '첫 미션의 지금 할 일이 처음 화면에 없다')
  assert.ok(
    opening.some((event) => event.kind === 'line' && event.tone === 'ok' && /(^|\s)ls(\s|$)/.test(event.text)),
    '처음 따라 칠 명령 ls 를 ok 줄로 권하지 않는다',
  )
  assert.ok(
    opening.some((event) => event.kind === 'line' && event.text.includes('help') && event.text.includes('lab missions')),
    '전체 명령과 미션 목록을 찾는 법이 한 줄에 없다',
  )
})

test('11) help 는 사전임을 밝히고 **맨 끝에** 지금 할 일을 주며, 실제로 도는 명령에서 사전을 만든다', () => {
  const events = run(['help']).events
  const replies = events.filter(
    (event): event is Extract<LabEvent, { kind: 'line' }> => event.kind === 'line' && event.tone !== 'input',
  )
  assert.ok(
    replies[0]!.text.includes('사전') && replies[0]!.tone === 'dim',
    'help 머리가 «이건 순서표가 아니라 사전이다»를 안 밝힌다 — 학생이 순서표로 읽는다',
  )
  // 🚨 f9: 예전에는 머리에 「지금 할 일 → lab missions」만 있어서, 답을 보려면 **또 한 번 쳐야** 했다.
  //    사전이 화면을 채우고 나면 스크롤이 멈추는 자리는 «맨 끝»이다 — 지금 할 일이 거기 있어야 한다.
  const tail = replies.slice(-4).map((row) => row.text).join('\n')
  assert.ok(tail.includes('지금 할 일 —'), 'help 맨 끝에 지금 할 일이 없다 — 사전만 보고 학생이 멈춘다')
  assert.ok(tail.includes('다음 — ls'), 'help 맨 끝에 지금 칠 명령이 없다')
  const out = textOf(events)
  assert.equal(
    out.includes('지금 할 일 → lab missions'),
    false,
    '지금 할 일을 보려고 명령을 또 치게 만드는 안내가 남아 있다',
  )
  // 사전 자체는 줄이지 않는다 — 학생이 유일하게 «이해했다»고 말한 부분이다.
  assert.ok(replies.length > 20, 'help 사전이 줄었다 — 낱말 뜻풀이는 이 실습실에서 가장 잘 먹힌 부분이다')
  for (const name of shell.LAB_COMMAND_NAMES) {
    assert.ok(out.includes(name), `help 에 ${name} 이 없다`)
  }
  // 없는 명령이 help 에 실려 있으면, 학생이 치고 «모르는 명령»을 받는다.
  for (const name of shell.LAB_COMMAND_NAMES) {
    const reply = textOf(run([name === 'cat' || name === 'cd' ? `${name} runs` : name]).events)
    assert.equal(reply.includes('모르는 명령'), false, `help 에 실린 ${name} 이 실제로는 안 돈다`)
  }
})

test('12) lab doctor 가 색이 아니라 «문자»로 판정한다 — 빨강/초록만으로 말하면 못 읽는 학생이 있다', () => {
  const narrow: LabState = { ...INITIAL_LAB_STATE, env: { widthPx: 390, canPaste: false } }
  const out = textOf(execute('lab doctor', narrow, 'd1').events)
  assert.ok(out.includes('주의'), '좁은 화면인데 주의라고 말하지 않는다')
  assert.ok(out.includes('390px'), '실제로 잰 값을 안 보여 준다 — 판정만 있으면 학생이 무엇을 고칠지 모른다')

  const wide: LabState = { ...INITIAL_LAB_STATE, env: { widthPx: 1160, canPaste: true } }
  const ok = textOf(execute('lab doctor', wide, 'd2').events)
  assert.ok(ok.includes('OK'), '넓은 화면인데 OK 를 안 준다')
  assert.equal(ok.includes('주의'), false, '넓고 붙여넣기도 되는데 주의가 남아 있다 — 경고가 늘 켜져 있으면 아무도 안 읽는다')
})

test('13) 실습실은 12강의 마지막 문항 하나에만 걸린다', () => {
  assert.equal(data.LAB_QA_ID, 'ch18_q04', '실습실이 붙는 문항이 바뀌었다 — 12강 마지막 문항이 아니면 수업 흐름이 달라진다')
})

test('14) 화면이 «열렸다»고 말하는 미션은 실제로 판정된다 — 못 하는 일을 할 수 있는 것처럼 적지 않는다', () => {
  // 🔑 개수를 세지 않는다(강이 늘면 곧 어긋난다). **표시(live)와 판정이 맞는가**를 본다.
  //    열린 미션은 `missionIndexOf` 가 도달할 수 있어야 하고, 잠긴 미션은 도달할 수 없어야 한다.
  const live = data.LAB_MISSIONS.filter((m) => m.live)
  assert.ok(live.length > 0, '열린 미션이 하나도 없다')

  const done = run([
    'ls',
    'pwd',
    ...data.LAB_RUN_FILES.map((f) => `cat ${f}`),
    'npm test',
  ]).state
  const withRules = shell.saveRules(done, 'x'.repeat(60)).nextState
  const reviewed = shell.markReviewDone(shell.applyMyOutputs(withRules, ['할인율: 10%\n최종가: 9000']))
  const submitted = shell.markSubmitted(reviewed, 1)

  // 전부 열려 있다면, 전부 해낸 상태에서 마지막 미션 너머까지 도달해야 한다.
  const reachable = missionIndexOf(submitted)
  assert.equal(
    reachable,
    live.length,
    `열린 미션은 ${live.length}개인데 판정이 도달한 자리는 ${reachable} 이다 — 표시와 판정이 어긋난다`,
  )

  // 잠긴 미션이 있다면 «잠김»이라고 적혀야 한다.
  const out = textOf(run(['lab missions']).events)
  const locked = data.LAB_MISSIONS.filter((m) => !m.live)
  assert.equal(
    /잠김/.test(out),
    locked.length > 0,
    locked.length > 0 ? '잠긴 미션을 잠김으로 안 적는다' : '잠긴 미션이 없는데 «잠김»이 보인다',
  )
})

test('15) 가드가 실패할 수 있는 계측인지 — 셸이 실제로 무언가를 돌려주는가', () => {
  const { events } = run(['ls'])
  assert.ok(events.length >= 2, 'ls 가 아무것도 안 돌려준다 — 위 검사들이 빈 문자열로 공짜 통과할 수 있다')
  assert.ok(textOf(events).includes('runs/'), 'ls 에 폴더 표시(/)가 없다 — 학생이 폴더와 파일을 못 가른다')
})

// ─── PR3 — 실패 체험(`npm test`)·건너뛰기·버전 고정 ───

test('16) npm test 가 세 결과 중 2개를 터뜨린다 — 여기가 12강이 실제로 가르치는 자리다', () => {
  const out = textOf(run(['npm test']).events)
  assert.ok(/PASS\s+run-1/.test(out), 'run-1 이 통과하지 않는다 — 약속을 지킨 답까지 터지면 배울 것이 없다')
  assert.ok(/FAIL\s+run-2/.test(out), 'run-2 가 안 터진다 — 「형식이 다르면 터진다」를 못 보여 준다')
  assert.ok(/FAIL\s+run-3/.test(out), 'run-3 이 안 터진다')
  assert.ok(/1 통과 · 2 실패/.test(out), `요약이 «1 통과 · 2 실패» 가 아니다:\n${out}`)
})

test('17) 판정을 색이 아니라 «문자»로 말한다 — 빨강/초록만으로 말하면 못 읽는 학생이 있다', () => {
  const out = textOf(run(['npm test']).events)
  assert.ok(out.includes('PASS'), 'PASS 문자가 없다')
  assert.ok(out.includes('FAIL'), 'FAIL 문자가 없다')
})

test('18) 왜 터졌는지를 «못 찾음»으로 끝내지 않는다 — 학생이 고쳐야 할 것은 «어디가 애매한가»다', () => {
  const out = textOf(run(['npm test']).events)
  assert.ok(/10% off/.test(out), 'run-2 가 어느 대목에서 걸렸는지 안 보여 준다')
  assert.ok(/0\.1/.test(out) && /0\.1%/.test(out), 'run-3 의 «0.1 은 10%인가 0.1%인가» 가 안 나온다')
})

test('19) 검사기는 결정적이다 — 같은 입력에 같은 답. 흔들리면 형식을 가르치는 수업이 형식을 안 지킨다', () => {
  const first = textOf(run(['npm test']).events)
  for (let i = 0; i < 5; i += 1) {
    assert.equal(textOf(run(['npm test']).events), first, '같은 입력에 다른 판정이 나왔다')
  }
})

test('20) npm test 를 치면 미션 3이 끝난다', () => {
  const before = run(['ls', 'pwd', ...data.LAB_RUN_FILES.map((f) => `cat ${f}`)]).state
  assert.equal(missionIndexOf(before), 2, '세 결과를 다 열었는데 미션 3에 안 와 있다')
  const after = execute('npm test', before, 'z').nextState
  assert.equal(missionIndexOf(after), 3, 'npm test 를 쳤는데 미션 3이 안 끝난다')
})

test('21) reset 은 처음으로 되돌리고, 무엇이 사라지는지 말한다', () => {
  const advanced = run(['ls', 'pwd', 'cat runs/run-1.txt']).state
  const result = execute('reset', advanced, 'r1')
  assert.equal(missionIndexOf(result.nextState), 0, 'reset 했는데 진행이 남아 있다')
  assert.deepEqual(result.nextState.openedFiles, [], 'reset 했는데 연 파일이 남아 있다')
  assert.ok(
    textOf(result.events).includes('사라졌'),
    'reset 이 무엇을 지웠는지 안 말한다 — 학생은 되돌린 줄 모르고 다시 친다',
  )
  // 🔑 재어 둔 화면 값은 살린다 — 되돌린다고 화면 폭이 0 이 되면 lab doctor 가 거짓말한다.
  const measured = { ...advanced, env: { widthPx: 900, canPaste: true } }
  assert.deepEqual(execute('reset', measured, 'r2').nextState.env, { widthPx: 900, canPaste: true })
})

test('22) jump 는 건너뛴 사실을 남긴다 — 지운다고 없어지면 과정 점수를 정직하게 못 센다', () => {
  const result = execute('jump 3', INITIAL_LAB_STATE, 'j1')
  assert.equal(result.nextState.jumpedTo, 2, 'jump 3 이 상태에 안 남는다')
  assert.equal(missionIndexOf(result.nextState), 2, 'jump 했는데 그 미션으로 안 간다')
  assert.equal(shell.earnedMissionIndex(result.nextState), 0, '건너뛴 것이 «스스로 도달한 자리»로 잡힌다')
  assert.ok(textOf(result.events).includes('과정 점수'), '건너뛰면 무엇이 달라지는지 안 말한다')
})

test('23) jump 가 스스로 더 나아간 학생을 뒤로 끌어내리지 않는다 — 건너뛴 것이 벌이 되면 안 쓴다', () => {
  const jumped = execute('jump 3', INITIAL_LAB_STATE, 'j2').nextState
  const worked = run(['ls', 'pwd', ...data.LAB_RUN_FILES.map((f) => `cat ${f}`), 'npm test'], jumped).state
  assert.equal(missionIndexOf(worked), 3, '건너뛴 뒤에 스스로 더 나아갔는데 건너뛴 자리로 끌려간다')
})

test('24) 없는 미션으로는 못 건너뛴다 — 없는 곳으로 보내면 학생이 빈 화면 앞에서 기다린다', () => {
  const bad = textOf(execute('jump 99', INITIAL_LAB_STATE, 'j4').events)
  assert.ok(/1~7/.test(bad), '범위 밖 번호에 무엇을 적어야 하는지 안 알려 준다')
  const zero = textOf(execute('jump 0', INITIAL_LAB_STATE, 'j5').events)
  assert.ok(/1~7/.test(zero), '0 도 막아야 한다')

  // 🔑 잠긴 미션이 다시 생기면(다른 강이 붙으면) 그때도 막아야 한다.
  const lockedIndex = data.LAB_MISSIONS.findIndex((m) => !m.live)
  if (lockedIndex >= 0) {
    const out = textOf(execute(`jump ${lockedIndex + 1}`, INITIAL_LAB_STATE, 'j6').events)
    assert.ok(/아직/.test(out), '잠긴 미션으로 건너뛰는 것을 안 막는다')
  }
})

test('25) lab version 이 «무엇으로 만든 재생본인가»를 말한다 — 없으면 규칙 효과와 모델 변화를 못 가른다', () => {
  const out = textOf(run(['lab version']).events)
  assert.ok(/2026-08-15/.test(out), '재생본을 만든 날짜가 없다')
  assert.ok(/claude-haiku/.test(out), '재생본을 만든 모델이 없다')
  assert.ok(/실시간 AI/.test(out), '지금 AI 를 부르는지 여부를 안 말한다')
})

test('26) 이 PR 까지 AI 를 부르는 명령이 하나도 없다 — 실패 체험은 돈 0원으로 겪는다', () => {
  const shellSource = readFileSync(
    resolve(__dirname, '..', '..', '..', 'client', 'src', 'lib', 'lab-shell.ts'),
    'utf8',
  )
  for (const forbidden of ['fetch(', 'anthropic', 'XMLHttpRequest']) {
    assert.equal(
      shellSource.toLowerCase().includes(forbidden.toLowerCase()),
      false,
      `셸이 ${forbidden} 를 쓰고 있다 — 이 PR 은 AI 비용 0원이어야 한다`,
    )
  }
})

// ─── PR6 — Codex 리뷰(2026-08-15)가 잡은 것들의 재발 가드 ───

test('27) 저장한 규칙이 cat 으로 실제로 열린다 — 화면이 하라고 한 일은 할 수 있어야 한다', () => {
  // 🚨 예전에는 저장이 상태만 바꾸고 파일 나무는 상수라 「아직 비어 있습니다」가 계속 나왔다.
  //    게다가 실패 안내가 「cat 으로 내 답을 열어 보세요」였다 — 할 수 없는 일을 시켰다.
  const saved = shell.saveRules(INITIAL_LAB_STATE, '할인율: N%\n최종가: N 으로만 적는다.').nextState
  const out = textOf(execute('cat CLAUDE.md', saved, 'c1').events)
  assert.ok(out.includes('할인율: N%'), `저장한 규칙이 cat 에 안 나온다:\n${out}`)
  assert.equal(out.includes('아직 비어 있습니다'), false, '저장했는데 빈 문서가 나온다')

  // 저장 전에는 스냅샷의 빈 문서가 그대로 나와야 한다(없는 것을 있다고 하지 않게).
  const before = textOf(execute('cat CLAUDE.md', INITIAL_LAB_STATE, 'c0').events)
  assert.ok(before.includes('아직 비어 있습니다'), '저장도 안 했는데 무언가 들어 있다')
})

test('28) 내 결과도 cat 으로 열린다 — 실패 안내가 「cat 으로 내 답을 열어 보라」고 말한다', () => {
  const withOutputs = shell.applyMyOutputs(INITIAL_LAB_STATE, ['할인율: 10%\n최종가: 9000', '10% 할인입니다'])
  const listed = textOf(execute('ls runs', withOutputs, 'l1').events)
  assert.ok(listed.includes('my-1.txt'), `내 결과가 ls 에 안 보인다:\n${listed}`)
  const opened = textOf(execute('cat runs/my-2.txt', withOutputs, 'o1').events)
  assert.ok(opened.includes('10% 할인입니다'), '내 결과를 cat 으로 못 연다')
})

test('29) 비평은 «명령을 친 것»이 아니라 «받은 것»으로 센다 — 실패해도 끝난 것으로 표시되면 안 된다', () => {
  const ready = run([
    'ls',
    'pwd',
    ...data.LAB_RUN_FILES.map((f) => `cat ${f}`),
    'npm test',
  ]).state
  const withRules = shell.saveRules(ready, 'x'.repeat(60)).nextState

  // 명령만 쳤을 때 — 아직 안 끝났다.
  const typed = execute('claude review', withRules, 'r1').nextState
  assert.equal(typed.reviewDone, false, 'claude 를 친 것만으로 «비평을 받았다»가 된다')
  assert.equal(missionIndexOf(typed), 5, '비평을 못 받았는데 다음 미션으로 넘어갔다')

  // 실제로 받았고 검증도 했을 때 — 그제야 끝난다.
  const reviewed = shell.markReviewDone(typed)
  assert.equal(missionIndexOf(reviewed), 5, '검증(myOutputs)을 안 했는데 넘어갔다')
  const verified = shell.applyMyOutputs(reviewed, ['할인율: 10%\n최종가: 9000'])
  assert.equal(missionIndexOf(verified), 6, '비평도 받고 검증도 했는데 안 넘어간다')
})

test('30) lab version 이 «지금 AI 를 부르는가»를 사실대로 말한다', () => {
  const out = textOf(run(['lab version']).events)
  assert.equal(out.includes('해당 없음'), false, 'AI 를 부르는데 «해당 없음»이라고 말한다')
  assert.ok(/claude review/.test(out), '무엇이 실제로 AI 를 부르는지 안 말한다')
})

test('31) 화면이 시키는 명령은 전부 실제로 도는 명령이다 — 없는 것을 시키면 학생이 막힌다', () => {
  // 🔑 이번 사고의 형태 = 「cat 으로 내 답을 열어 보세요」인데 열 수 없었던 것.
  //    안내 문구에 등장하는 명령이 실제로 도는지 기계로 대조한다.
  const shellSource = readFileSync(
    resolve(__dirname, '..', '..', '..', 'client', 'src', 'lib', 'lab-shell.ts'),
    'utf8',
  )
  const suggested = new Set<string>()
  for (const match of shellSource.matchAll(/(?:예\)|으로|로)\s*([a-z]+(?: [a-z]+)?)\s*(?:로|를|으로|하세요|해 보세요)/g)) {
    const candidate = match[1]?.trim()
    if (candidate) suggested.add(candidate)
  }
  for (const command of suggested) {
    const head = command.split(' ')[0]!
    if (!shell.LAB_COMMAND_NAMES.some((name) => name.split(' ')[0] === head)) continue
    const reply = textOf(run([command === 'cat' || command === 'cd' ? `${command} runs` : command]).events)
    assert.equal(reply.includes('모르는 명령'), false, `안내에 나오는 «${command}» 가 실제로는 안 돈다`)
  }
})

// ─── 2026-08-16 새내기 관찰 f7·f8·f9 의 회귀 계약 ───
// 세 발견은 전부 같은 질문 하나였다: **「지금 이 순간 무엇을 치는가」를 화면이 말해 주는가.**
// 그래서 규칙은 `nextStepOf` 한 자리에 있고, 아래 검사는 «두 곳이 갈라지지 않는가»까지 본다.

test('32) 미션의 «일부»를 채우면 그 자리에서 남은 것을 이름으로 말한다 (f7)', () => {
  // 미션 1 은 ls + pwd 둘을 요구한다. 예전에는 ls 를 쳐도 화면이 그대로여서 학생이 여기서 멈췄다.
  const afterLs = run(['ls'])
  const out = textOf(afterLs.events)
  assert.ok(out.includes('1/2'), 'ls 를 쳤는데 «2개 중 1개»라는 진행 표시가 없다 — 성공 표지가 없으면 멈춘다')
  assert.ok(out.includes('pwd'), 'ls 를 쳤는데 남은 명령(pwd)을 안 알려준다 — f7 이 그대로 살아 있다')
  assert.equal(missionIndexOf(afterLs.state), 0, 'ls 하나로 미션이 넘어가 버렸다')

  // 🚨 음성 대조군 — 같은 명령을 또 치면 잠자코 있어야 한다. 아무 때나 떠들면 잔소리가 된다.
  const twice = execute('ls', afterLs.state, 'again')
  assert.equal(textOf(twice.events).includes('1/2'), false, '같은 명령을 두 번 쳤는데 진행 표시가 또 나온다')
})

test('33) 미션이 넘어가면 끝난 것과 다음 할 일을 함께 말한다 (f7)', () => {
  const { state, events } = run(['ls', 'pwd'])
  assert.equal(missionIndexOf(state), 1, 'ls 와 pwd 를 다 했는데 미션이 안 넘어간다')
  const out = textOf(events)
  // 색이 아니라 «문자»로도 읽혀야 한다 — lab missions 와 같은 낱말을 쓴다.
  assert.ok(out.includes('[끝]'), '미션을 끝냈는데 끝났다고 문자로 말하지 않는다')
  assert.ok(out.includes(data.LAB_MISSIONS[1]!.goal), '다음 미션의 지금 할 일이 그 자리에 안 나온다')
  // 🔑 미션 2 의 goal 에는 열어야 할 **파일 이름이 없다.** 다음 명령이 이름을 준다.
  assert.ok(out.includes('cat runs/run-1.txt'), '무엇을 열어야 하는지 파일 이름을 끝까지 말해 주지 않는다')
})

test('34) 건너뛰기는 «끝냈다»로 적지 않는다 — 거짓 칭찬 금지', () => {
  const out = textOf(run(['jump 3']).events)
  assert.equal(out.includes('[끝]'), false, '건너뛴 미션을 «끝»이라고 말한다 — 안 한 일을 했다고 적는 셈이다')
  assert.ok(out.includes('지금 할 일'), '건너뛴 뒤 무엇을 할지 안 말한다')
})

test('35) 세 결과를 하나씩 열 때마다 남은 개수와 다음 파일 이름을 준다 (f7)', () => {
  const first = run(['ls', 'pwd', 'cat runs/run-1.txt'])
  const out = textOf(first.events)
  assert.ok(out.includes('1/3'), '세 결과 중 하나를 열었는데 진행이 안 보인다')
  assert.ok(out.includes('cat runs/run-2.txt'), '다음에 열 파일 이름을 안 준다 — 화면 어디에도 이름이 없다')

  const done = run([...data.LAB_RUN_FILES.slice(1).map((f) => `cat ${f}`)], first.state)
  assert.equal(missionIndexOf(done.state), 2, '셋 다 열었는데 미션이 안 넘어간다')
  assert.ok(textOf(done.events).includes('npm test'), '다음 미션의 명령(npm test)을 안 준다')
})

test('36) nextStepOf 가 미션마다 «실제로 도는» 명령 하나를 준다', () => {
  const step = (state: LabState) => shell.nextStepOf(state)

  assert.equal(step(INITIAL_LAB_STATE).command, 'ls', '처음에 칠 명령이 ls 가 아니다')
  const looked = run(['ls', 'pwd']).state
  assert.equal(step(looked).command, 'cat runs/run-1.txt', '미션 2 에서 파일 이름이 붙은 명령을 안 준다')
  const opened = run(data.LAB_RUN_FILES.map((f) => `cat ${f}`), looked).state
  assert.equal(step(opened).command, 'npm test')
  const tested = run(['npm test'], opened).state
  assert.equal(step(tested).command, 'edit')
  const short = shell.saveRules(tested, 'x'.repeat(5)).nextState
  assert.equal(step(short).command, 'edit', '짧게 쓴 학생에게 편집기로 돌아가라고 안 한다')
  const written = shell.saveRules(tested, 'x'.repeat(60)).nextState
  assert.equal(step(written).command, 'claude review', '규칙을 쓴 뒤 비평받기를 안 시킨다')
  const reviewed = shell.markReviewDone(written)
  assert.equal(step(reviewed).command, 'npm test', '비평받은 뒤 내 규칙으로 시켜 보기를 안 시킨다')
  const verified = shell.applyMyOutputs(reviewed, ['할인율: 10%\n최종가: 9000'])
  assert.equal(step(verified).command, 'lab check', '다 한 학생에게 제출을 안 시킨다')
  assert.equal(step(shell.markSubmitted(verified, 1)).command, null, '전부 끝났는데 시킬 것이 남아 있다')

  // 🚨 시키는 명령은 전부 실제로 도는 명령이어야 한다. 하나라도 «모르는 명령»이면 학생이 막힌다.
  for (const state of [INITIAL_LAB_STATE, looked, opened, tested, written, reviewed, verified]) {
    const command = step(state).command
    if (!command) continue
    assert.equal(
      textOf(execute(command, state, `probe:${command}`).events).includes('모르는 명령'),
      false,
      `nextStepOf 가 시키는 «${command}» 가 실제로는 안 돈다`,
    )
  }
})

test('37) 입력칸의 회색 예시가 «지금 칠 명령»을 따라 움직인다 — ls 로 박혀 있지 않다 (f8)', () => {
  // 🚨 화면 파일을 글자로 본다. 여기가 갈라지는 순간 학생은 서로 다른 두 지시를 동시에 받는다:
  //    터미널은 「이제 pwd」인데 입력칸은 영원히 `ls` 를 제안하던 것이 f8 이었다.
  const tab = readFileSync(
    resolve(__dirname, '..', '..', '..', 'client', 'src', 'components', 'learn', 'LabTab.tsx'),
    'utf8',
  )
  assert.equal(
    /placeholder="ls"/.test(tab),
    false,
    '입력칸 예시가 ls 로 박혀 있다 — 방금 한 것을 또 하라고 말하는 셈이다(f8)',
  )
  assert.ok(
    /nextStepOf\(state\)/.test(tab),
    '입력칸이 nextStepOf 를 안 쓴다 — 규칙을 두 곳에 적으면 그 순간 갈라진다',
  )
})
