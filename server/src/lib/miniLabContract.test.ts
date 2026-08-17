// 미니 실습실(터미널형 강 공용 엔진)의 계약 — SDD 결정 6·14·21 + MAP 배정.
import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const loadClient = (rel: string) => require(path.resolve(ROOT, 'client', 'src', rel))

// 🚨 typeof import(클라)는 서버 tsc 를 TS6059 로 죽인다(CI 사고 2026-08-18) — 모양만 손으로 적는다.
type ProbeState = { ran: Record<string, number>; flags: Record<string, string | number | boolean> }
type ProbeEffect = { kind: string; artifactKind?: string }
type ProbeEvent = { kind: string; tone?: string; text?: string }
type ProbeLab = {
  chapterId: number
  commands: Array<{ name: string; run: (args: string, state: ProbeState) => { lines: ProbeEvent[]; effect?: ProbeEffect } }>
  missions: Array<{ label: string; goal: string; nextCommand: (state: ProbeState) => string | null }>
  qaMissionSpans: Record<string, { from: number; to: number }>
  partialNote?: string
  askFallbacks: string[]
}
const engine = loadClient('lib/mini-lab') as {
  INITIAL_MINI_STATE: ProbeState
  missionIndexOfMini: (lab: ProbeLab, state: ProbeState) => number
  nextStepOfMini: (lab: ProbeLab, state: ProbeState) => string | null
  executeMini: (
    lab: ProbeLab,
    command: string,
    state: ProbeState,
    key: string,
  ) => { events: ProbeEvent[]; nextState: ProbeState; effect?: ProbeEffect }
}
const { MINI_LABS } = loadClient('data/mini-labs') as { MINI_LABS: Record<number, ProbeLab> }
const { EXPERIENCE_KIND_BY_CHAPTER } = loadClient('data/experience') as {
  EXPERIENCE_KIND_BY_CHAPTER: Record<number, string>
}
const { QA_STUBS } = loadClient('data/qa-stubs') as {
  QA_STUBS: Array<{ id: string; chapterId: number }>
}
const { ARTIFACT_KINDS } = require('./lab-artifacts') as typeof import('./lab-artifacts')

test('1) 등록 강은 지도의 터미널형이다 — 12강(ch18)은 큰 실습실이 맡으므로 여기 없다', () => {
  assert.ok(Object.keys(MINI_LABS).length >= 1, '미니 실습실이 하나도 없다')
  for (const [chapterId, lab] of Object.entries(MINI_LABS)) {
    const kind = EXPERIENCE_KIND_BY_CHAPTER[Number(chapterId)]
    assert.ok(
      kind === 'terminal' || kind === 'composite',
      `ch${chapterId}: ${kind} 강에 미니 실습실이 등록됐다 — 지도(MAP) 밖이다`,
    )
    assert.equal(lab.chapterId, Number(chapterId), `ch${chapterId}: 키와 chapterId 가 다르다`)
  }
  assert.equal(MINI_LABS[18], undefined, 'ch18 에 미니 실습실이 등록됐다 — 12강은 lab-shell 이 맡는다')
})

test('2) 미션 구간이 그 강의 문항을 1부터 빈틈없이 덮는다 — 빠진 문항은 카드 근거(partialNote)가 필수다', () => {
  for (const [chapterId, lab] of Object.entries(MINI_LABS)) {
    const qas = QA_STUBS.filter((qa) => qa.chapterId === Number(chapterId)).map((qa) => qa.id)
    const missing = qas.filter((qaId) => !lab.qaMissionSpans[qaId])
    // 🔑 SDD 결정 21(전 문항 터미널)이 기본이고, 카드가 «견학 유지»로 확정한 문항만 예외다.
    //    예외는 partialNote 로 근거를 밝혀야 한다 — 조용한 부분 적용을 막는다.
    if (missing.length > 0) {
      assert.ok(
        lab.partialNote && lab.partialNote.trim().length > 0,
        `ch${chapterId}: 구간 없는 문항(${missing.join(', ')})이 있는데 partialNote(카드 근거)가 없다`,
      )
    }
    const ghosts = Object.keys(lab.qaMissionSpans).filter((qaId) => !qas.includes(qaId))
    assert.deepEqual(ghosts, [], `ch${chapterId}: 없는 문항에 구간이 배정됐다: ${ghosts.join(', ')}`)
    const ranges = Object.values(lab.qaMissionSpans).sort((a, b) => a.from - b.from)
    assert.equal(ranges[0]!.from, 1, `ch${chapterId}: 구간이 1에서 시작하지 않는다`)
    for (let i = 1; i < ranges.length; i += 1) {
      assert.equal(ranges[i]!.from, ranges[i - 1]!.to + 1, `ch${chapterId}: 구간에 빈틈·겹침이 있다`)
    }
    assert.equal(ranges[ranges.length - 1]!.to, lab.missions.length, `ch${chapterId}: 구간 끝과 미션 수가 다르다`)
  }
})

test('3) 미션은 처음 상태에서 전부 미완이고, 안내(nextCommand·goal)가 비어 있지 않다', () => {
  for (const [chapterId, lab] of Object.entries(MINI_LABS)) {
    assert.equal(
      engine.missionIndexOfMini(lab, engine.INITIAL_MINI_STATE),
      0,
      `ch${chapterId}: 시작부터 끝난 미션이 있다 — done 판정이 공짜다`,
    )
    for (const mission of lab.missions) {
      assert.ok(mission.label.trim() && mission.goal.trim(), `ch${chapterId}: 미션 문구가 비었다`)
    }
    assert.ok(
      engine.nextStepOfMini(lab, engine.INITIAL_MINI_STATE),
      `ch${chapterId}: 첫 미션이 다음 명령을 안 알려 준다 — 입력칸 예시가 빈다`,
    )
  }
})

test('4) AI 필수 강(11강)의 대체 응답 풀 — 3개 이상, 서로 달라야 «세 다른 답» 체험이 유지된다', () => {
  const lab = MINI_LABS[11]
  assert.ok(lab, '11강 미니 실습실이 없다 — AI 필수 강이다')
  assert.ok(lab!.askFallbacks.length >= 3, '대체 응답이 3개 미만 — 세 번 부탁 체험이 무너진다 (SDD 결정 14)')
  assert.equal(
    new Set(lab!.askFallbacks.map((text) => text.trim())).size,
    lab!.askFallbacks.length,
    '대체 응답이 겹친다 — «같은 부탁, 다른 답»이 거짓이 된다',
  )
})

test('5) 사전 생성 출력에는 REPLAY 라벨이 있다 — 떼면 실시간 답으로 오해한다', () => {
  // 🔑 «장면»(대화 기록·실행 기록을 재현한 출력)에만 라벨 의무가 있다 — compare·brief 같은
  //    실황 해설은 사전 생성이 아니라서 라벨을 붙이면 오히려 거짓이 된다. 그래서 전수 규칙 대신
  //    장면 명령을 표적으로 짚는다. 새 장면 명령을 만들면 여기에도 한 줄을 더한다.
  // 표적 검사 — 11강 tokens·memory, 13강 init 은 반드시 라벨이 있다.
  const probe = (chapterId: number, name: string) => {
    const lab = MINI_LABS[chapterId]!
    const command = lab.commands.find((item) => item.name === name)!
    const text = command
      .run('', engine.INITIAL_MINI_STATE)
      .lines.map((event) => (event.kind === 'line' ? event.text : ''))
      .join('\n')
    assert.ok(text.includes('REPLAY'), `ch${chapterId}/${name} 에 REPLAY 라벨이 없다`)
  }
  probe(11, 'tokens')
  probe(11, 'memory')
  probe(19, 'init')
  probe(1, 'apps')
  probe(1, 'trace')
  probe(5, 'render')
  probe(8, 'live')
})

test('6) AI 목소리 — 오타는 로컬, 자유 문장은 voice 의도, 같은 키는 두 번 실행되지 않는다', () => {
  const lab = MINI_LABS[11]!
  const typo = engine.executeMini(lab, 'helo', engine.INITIAL_MINI_STATE, 'k1')
  assert.equal(typo.effect, undefined, '오타가 서버 의도를 내보냈다')
  assert.ok(
    typo.events.some((event) => event.kind === 'line' && event.tone === 'ai'),
    '오타에 ai▸ 제안이 없다',
  )
  const free = engine.executeMini(lab, '이제 뭘 하면 돼?', engine.INITIAL_MINI_STATE, 'k2')
  assert.equal(free.effect?.kind, 'voice', '자유 문장이 voice 의도로 안 나간다')

  const first = engine.executeMini(lab, 'tokens', engine.INITIAL_MINI_STATE, 'same')
  const second = engine.executeMini(lab, 'tokens', first.nextState, 'same')
  assert.deepEqual(second.events, [], '같은 키가 두 번 실행됐다 — 재전송이 진행을 두 칸 민다')
})

test('7) 편집기 산출물이 계보의 kind 를 쓴다 — 13강 스킬 = skill', () => {
  const lab = MINI_LABS[19]!
  const skillCommand = lab.commands.find((command) => command.name === 'skill')!
  const result = skillCommand.run('', engine.INITIAL_MINI_STATE)
  assert.equal(result.effect?.kind, 'editor')
  const effect = result.effect as { kind: string; artifactKind?: string }
  assert.equal(effect.artifactKind, 'skill', '스킬이 계보 skill 칸으로 안 간다 — 23강 묶음의 2번째 칸이 빈다')
  assert.ok(
    (ARTIFACT_KINDS as readonly string[]).includes(effect.artifactKind!),
    '편집기 artifactKind 가 계보 enum 밖이다',
  )
})
