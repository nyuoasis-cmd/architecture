// 📋 설명 노트(문항 하나 = 노트 하나) 데이터의 계약.
//
// 왜 지금 생겼는가(2026-08-12, 교안 철거): 「📋 교안」이 사라지면서 **설명 노트가 교사에게
// 남은 유일한 물건**이 됐다. 그런데 노트에는 계약이 하나도 없었다 — 교안에는 18건이 있었다.
//
// 🚨 여기서 막는 것 셋:
//  ① **조용히 사라지는 노트.** `teacher-explain/index.ts` 는 스키마에 걸린 블록을 console.error
//     하나 찍고 **그냥 뺀다**. 교사 화면에는 «불러올 문항 정보가 올바르지 않아요»만 뜨고,
//     CI 는 초록이고, 아무도 안 알려 준다. 파일 수와 통과 수를 맞대는 것이 이 계약의 본체다.
//  ② **수업 진행 시간의 부활.** 교안에 있던 계약 ④⑤ 가 교안과 함께 죽었다(2026-08-11 jery 확정:
//     이 앱엔 「수업 시작」 기록이 없어 «몇 분째»를 정직하게 셀 수 없다). 그 금지를 노트로 옮겨 왔다.
//     🔑 「분」을 통째로 막지 않는다 — 복구 시간(RPO)·사고 지속시간은 **내용**이지 진행 지시가
//     아니다. 겨냥하는 것은 «칸별 소요시간·N분째·총 N분» 뿐이다.
//  ③ **가리키는 곳이 없는 relatedQas.** 노트끼리 서로를 부르는데 없는 문항을 부르면 교사가
//     수업 중에 헛짚는다(교안 계약 ⑨ 가 하던 일).
//
// 🚨 **«모든 문항에 노트가 있다»는 계약을 두지 않는다.** 교안 계약 ⑯ 이 그것이었고, 그게 새 장을
//    만들 때마다 CI 가 없는 교안을 요구하게 만들었다. 노트는 지금 ch01~ch10 만 있고 나머지는
//    순차로 들어온다 — 없는 것은 없는 채로 두고, **있는 것이 성한지만** 본다.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const DIR = path.resolve(__dirname, '..', 'data', 'teacher-explain')
const ROOT = path.resolve(__dirname, '..', '..', '..')

type LayeredNote = {
  qaId: string
  relatedQas: string[]
  layer1?: { opening: string; steps: Array<{ act: string; say: string }>; closing: string }
  layer2?: { why: Array<{ heading: string; body: string }>; stopHere: string }
  layer3?: { incidentLink: string }
}

const { TEACHER_EXPLAIN } = require(path.join(DIR, 'index')) as {
  TEACHER_EXPLAIN: Record<string, LayeredNote>
}
const { QA_STUBS } = require(path.resolve(ROOT, 'client', 'src', 'data', 'qa-stubs')) as {
  QA_STUBS: Array<{ id: string }>
}

/** 디스크에 있는 노트 파일들 — 등록부를 손으로 다시 적지 않는다(복사본은 또 하나의 손나열이다). */
const noteFiles = readdirSync(DIR).filter((name) => /^ch\d{2}_q\d{2}\.ts$/.test(name))
const loaded = Object.keys(TEACHER_EXPLAIN)

test('① 쓴 노트가 전부 실제로 실린다 — 스키마에 걸려 조용히 빠진 노트 금지', () => {
  const fileIds = noteFiles.map((name) => name.replace(/\.ts$/, '')).sort()
  const missing = fileIds.filter((qaId) => !TEACHER_EXPLAIN[qaId])

  assert.deepEqual(
    missing,
    [],
    `노트 파일은 있는데 실리지 않았다: ${missing.join(', ')} — 스키마(types.ts)에 걸린 것이다. ` +
      '교사 화면에는 «불러올 문항 정보가 올바르지 않아요»만 뜨고 CI 는 초록이라, 이 계약이 없으면 아무도 모른다. ' +
      '길이 상한(tldr 30~50 · misconception 250 · realLife 250 · note 200 · demoTip 각 300)을 먼저 의심할 것',
  )
})

test('② 등록부에 파일 없는 노트가 없다 — 지운 파일이 등록부에 남으면 빌드가 깨진다', () => {
  const fileIds = new Set(noteFiles.map((name) => name.replace(/\.ts$/, '')))
  const orphans = loaded.filter((qaId) => !fileIds.has(qaId))
  assert.deepEqual(orphans, [], `index.ts 가 없는 파일을 부른다: ${orphans.join(', ')}`)
})

test('③ 노트의 qaId 가 자기 열쇠와 같다 — 엉뚱한 문항에 걸린 노트 금지', () => {
  const wrong: string[] = []
  for (const [key, block] of Object.entries(TEACHER_EXPLAIN)) {
    if (block.qaId !== key) wrong.push(`${key} → qaId ${block.qaId}`)
  }
  assert.deepEqual(wrong, [], `열쇠와 qaId 가 다르다 — 교사가 다른 문항의 노트를 읽는다: ${wrong.join(', ')}`)
})

test('④ relatedQas 가 실존 문항을 가리킨다 — 없는 문항으로 교사를 보내지 않는다', () => {
  const real = new Set(QA_STUBS.map((qa) => qa.id))
  const dangling: string[] = []
  for (const [key, block] of Object.entries(TEACHER_EXPLAIN)) {
    for (const related of block.relatedQas) {
      if (!real.has(related)) dangling.push(`${key} → ${related}`)
    }
  }
  assert.deepEqual(dangling, [], `노트가 없는 문항을 가리킨다: ${dangling.join(', ')}`)
})

test('⑤ 노트가 수업 진행 시간을 말하지 않는다 — 지킬 수 없는 약속을 되살리지 않는다', () => {
  // 🔑 겨냥하는 것은 «진행 지시»다. 복구 시간·사고 지속시간 같은 **내용**은 통과해야 한다
  //    (ch04_q06 «5분치 잃는 것» · ch08_q07 «5분간 잠긴 사고»).
  const PACING = [
    /\d+\s*분째/,
    /총\s*\d+\s*분/,
    /소요\s*시간/,
    /\d+\s*분\s*(?:동안\s*)?(?:진행|수업|활동)/,
    /"?(?:minutes|totalMinutes|durationMinutes)"?\s*:/,
  ]
  const found: string[] = []
  for (const name of noteFiles) {
    const source = readFileSync(path.join(DIR, name), 'utf8')
    for (const pattern of PACING) {
      const hit = source.match(pattern)
      if (hit) found.push(`${name}: «${hit[0]}»`)
    }
  }
  assert.deepEqual(
    found,
    [],
    '노트에 수업 진행 시간이 들어왔다 — 이 앱에는 「수업 시작」 기록이 없어서 «몇 분째»를 정직하게 셀 수 없다. ' +
      `수업 흐름은 교사가 정한다(2026-08-11 jery 확정, 교안 계약 ④⑤ 승계): ${found.join(' / ')}`,
  )
})

test('⑥ 계약이 검사한 노트 수를 찍는다 — 0개를 검사하고 초록인 계측 금지', () => {
  console.log(`[설명 노트 계약] 파일 ${noteFiles.length}개 / 실린 노트 ${loaded.length}개 / 전체 문항 ${QA_STUBS.length}개`)
  assert.ok(noteFiles.length > 0, '노트 파일이 하나도 없다 — 대조 대상이 비었으면 위 계약들은 전부 실패할 수 없다')
  assert.equal(loaded.length, noteFiles.length, '파일 수와 실린 수가 다르다 — ① 이 잡았어야 한다')
})

// ── 📋 노트의 «층 3개» (2026-08-20 jery 승인) ────────────────────────────────
// 🚨 «모든 노트에 층이 있다»를 걸지 않는다 — 131개가 여러 PR 로 나뉘어 들어오는 동안 CI 가
//    아직 안 쓴 글을 요구하게 된다(교안 계약 ⑯ 의 실패). 없는 것은 없는 채로 두고,
//    **있는 것이 성한지만** 본다. 아래 셋은 전부 «있으면 이래야 한다» 꼴이다.

test('⑦ 층 1 이 있으면 층 2 도 있다 — 대본만 있고 «왜»가 없는 노트 금지', () => {
  // 🔑 이 개정의 무게는 층 2 에 있다(2026-08-20 jery). 층 1 만 채우면 지금 노트와 달라지는 게
  //    «말투»뿐이고, 교사는 학생 질문 앞에서 여전히 멈춘다 — 네 번 실패한 자리가 정확히 거기다.
  const dangling = Object.entries(TEACHER_EXPLAIN)
    .filter(([, block]) => block.layer1 && !block.layer2)
    .map(([qaId]) => qaId)

  assert.deepEqual(
    dangling,
    [],
    `층 1(지금 말할 것)만 있고 층 2(왜 그런가)가 없다: ${dangling.join(', ')} — ` +
      '교사가 이해하지 못한 것을 학생에게 설명할 수는 없다. 층 2 를 채우거나, 층 1 을 빼고 기존 카드로 두라',
  )
})

test('⑧ 층 2 의 첫 문장이 학생이 이미 아는 데서 출발한다 — 첫 줄부터 모르는 세계 금지', () => {
  // 🔑 §7 검사 넷 중 1번을 기계로 내린 것이다. 넷을 전부 사람이 보면 131개를 완주할 수 없다.
  //    나머지(«안 하면 무슨 일이 생기나» · «개발자 얘기는 마지막 한 줄»)는 여전히 사람이 본다.
  // 🚨 이 낱말들이 «금지어»라는 뜻이 아니다 — **첫 문장에** 못 나온다는 뜻이다. 본문에서는 얼마든지 쓴다.
  const STRANGER = /프로그램|서버|개발자|시스템|소프트웨어|알고리즘/
  const bad: string[] = []
  for (const [qaId, block] of Object.entries(TEACHER_EXPLAIN)) {
    for (const item of block.layer2?.why ?? []) {
      const first = item.body.split(/(?<=[.!?])\s|\n/)[0] ?? ''
      const hit = first.match(STRANGER)
      if (hit) bad.push(`${qaId} «${item.heading}» → ${hit[0]}`)
    }
  }
  assert.deepEqual(
    bad,
    [],
    `층 2 의 첫 문장이 학생이 모르는 세계에서 시작한다: ${bad.join(' / ')} — ` +
      '비전공자에게 «실무»는 또 하나의 모르는 세계다(2026-08-20 회의, 1차 실패). ' +
      '카페·심부름·숙제·사물함처럼 이미 해 본 일에서 출발하고, 이 낱말은 두 번째 문장부터 쓰라',
  )
})

test('⑨ 화면이 세 층을 전부 그린다 — 데이터에만 있고 아무도 못 보는 층 금지', () => {
  // 🔑 ① 과 같은 계열의 이빨이다. 노트에 층을 써 넣었는데 화면이 안 읽으면 CI 는 초록이고
  //    교사 화면에는 아무 변화가 없다 — 그리고 아무도 안 알려 준다.
  const panel = readFileSync(
    path.resolve(ROOT, 'client', 'src', 'components', 'learn', 'TeacherExplainPanel.tsx'),
    'utf8',
  )
  const missing = (['layer1', 'layer2', 'layer3'] as const).filter((key) => !panel.includes(`block.${key}`))
  assert.deepEqual(
    missing,
    [],
    `TeacherExplainPanel 이 안 그리는 층이 있다: ${missing.join(', ')} — 데이터만 늘고 교사가 보는 것은 그대로다`,
  )
})

test('⑩ 층을 가진 노트 수를 찍는다 — 0개에 초록인 계측 금지', () => {
  const withLayer1 = Object.values(TEACHER_EXPLAIN).filter((block) => block.layer1).length
  const withLayer2 = Object.values(TEACHER_EXPLAIN).filter((block) => block.layer2).length
  const withLayer3 = Object.values(TEACHER_EXPLAIN).filter((block) => block.layer3).length
  console.log(
    `[설명 노트 층] 층1 ${withLayer1} · 층2 ${withLayer2} · 층3 ${withLayer3} / 전체 노트 ${loaded.length}개`,
  )
  assert.ok(
    withLayer2 > 0,
    '층 2 를 가진 노트가 하나도 없다 — ⑦⑧ 은 검사할 대상이 없어 실패할 수 없는 계측이 된다',
  )
})
