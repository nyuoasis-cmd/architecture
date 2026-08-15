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
import path from 'node:path'
import { test } from 'node:test'

type LabTone = 'input' | 'plain' | 'dim' | 'ok' | 'bad' | 'warn'
type LabEvent = { kind: 'line'; text: string; tone: LabTone } | { kind: 'clear' } | { kind: 'exit' }
type LabState = {
  cwd: string[]
  openedFiles: string[]
  ranCommands: string[]
  seenAbout: boolean
  lastKey: string | null
  env: { widthPx: number; canPaste: boolean }
}
type LabShell = {
  execute: (command: string, state: LabState, key: string) => { events: LabEvent[]; nextState: LabState }
  missionIndexOf: (state: LabState) => number
  openingEvents: () => LabEvent[]
  INITIAL_LAB_STATE: LabState
  LAB_COMMAND_NAMES: string[]
}
type LabData = {
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

test('4) 모르는 명령과 «아직 안 열린» 명령을 갈라 답한다 — 학생이 할 일이 다르다', () => {
  const unknown = textOf(run(['ㅁㄴㅇㄹ']).events)
  assert.ok(unknown.includes('모르는 명령'), '모르는 명령에 그렇다고 말하지 않는다')
  assert.ok(unknown.includes('help'), '모르는 명령에 다음 행동(help)을 안 준다 — 학생이 멈춘다')

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

test('10) 처음 화면이 축소판 고지로 시작한다 — 무엇이 진짜인지까지 말한다', () => {
  const out = textOf(openingEvents())
  assert.ok(out.includes('줄인'), '무엇을 줄였는지 안 말한다(jery: 「당연히 가짜임을 알려줘야지」)')
  assert.ok(out.includes('진짜'), '무엇이 진짜인지 안 말한다 — 「가짜」만 말하면 실습 전체를 흉내로 여긴다')
  assert.ok(out.includes('REPLAY'), '사전 생성분이 있다는 것을 처음 화면에서 안 말한다')
})

test('11) help 가 실제로 도는 명령에서 나온다 — 손으로 적은 목록은 곧 어긋난다', () => {
  const out = textOf(run(['help']).events)
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

test('14) 미션 표시가 «못 하는 일»을 할 수 있는 것처럼 적지 않는다', () => {
  const live = data.LAB_MISSIONS.filter((m) => m.live)
  assert.equal(live.length, 2, 'PR1 에서 실제로 판정되는 미션은 2개다 — 숫자가 바뀌면 판정부도 같이 바뀌어야 한다')
  const out = textOf(run(['lab missions']).events)
  assert.ok(out.includes('잠김'), '아직 안 열린 미션을 잠김으로 표시하지 않는다 — 학생이 그 앞에서 기다린다')
})

test('15) 가드가 실패할 수 있는 계측인지 — 셸이 실제로 무언가를 돌려주는가', () => {
  const { events } = run(['ls'])
  assert.ok(events.length >= 2, 'ls 가 아무것도 안 돌려준다 — 위 검사들이 빈 문자열로 공짜 통과할 수 있다')
  assert.ok(textOf(events).includes('runs/'), 'ls 에 폴더 표시(/)가 없다 — 학생이 폴더와 파일을 못 가른다')
})
