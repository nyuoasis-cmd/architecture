// ✋ «내 차례»의 클라이언트 ↔ 서버 정합 계약.
//
// 🚨 이 기능은 **양쪽에 나뉘어 산다.** 학생 화면의 탭·안내·칸 이름은 클라이언트 데이터
//    (`client/src/data/*` 의 `myTurn`)에 있고, 실제 판정에 쓰는 과제·힌트는 서버
//    (`MY_TURN_TASKS`)에 있다. 둘이 어긋나면 이렇게 된다:
//    - 클라에만 있으면 → 학생에게 ✋ 탭이 보이고, 부탁문을 써서 제출하면 `unknown_qa` 로 죽는다.
//      **화면은 멀쩡하고, 그 문항을 연 학생만 «안 돼요»를 겪는다.**
//    - 서버에만 있으면 → 판정 과제를 써 놓고 아무도 못 쓴다(문항에 탭이 안 생긴다).
//    - 칸(slot) 이름이 어긋나면 → 판정 결과의 칸과 화면의 칸이 서로 다른 것을 가리킨다.
//
// 🔑 1문항 시범일 때는 사람이 눈으로 맞출 수 있었다. 문항을 넓히는 순간 그게 안 되므로,
//    넓히기 **전에** 이 계약을 먼저 만든다.
import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'

import { MY_TURN_TASKS } from './vibe-my-turn'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const load = (rel: string) => require(path.resolve(ROOT, 'client', 'src', 'data', rel))

type ClientSlot = { key: string; label: string; inventedExample: string }
type ClientMyTurn = { intro: string; placeholder: string; slots: ClientSlot[] }
type ClientExtras = { qaId: string; myTurn?: ClientMyTurn }

const { ALL_EXTRAS } = load('learn-extras') as { ALL_EXTRAS: Record<string, ClientExtras> }
const { QA_STUBS } = load('qa-stubs') as { QA_STUBS: Array<{ id: string }> }

const clientEntries = Object.entries(ALL_EXTRAS).filter(([, extras]) => extras.myTurn)
const serverIds = Object.keys(MY_TURN_TASKS)

test('① 학생에게 ✋ 탭이 보이는 문항은 서버에도 과제가 있다 — 없으면 제출이 죽는다', () => {
  const missing = clientEntries.map(([qaId]) => qaId).filter((qaId) => !MY_TURN_TASKS[qaId])
  assert.deepEqual(
    missing,
    [],
    `이 문항들은 ✋ 탭이 뜨지만 서버에 과제가 없다 — 학생이 제출하면 unknown_qa 로 죽는다: ${missing.join(', ')}`,
  )
})

test('② 서버에만 있는 과제가 없다 — 써 놓고 아무도 못 쓰는 상태', () => {
  const clientIds = new Set(clientEntries.map(([qaId]) => qaId))
  const orphan = serverIds.filter((qaId) => !clientIds.has(qaId))
  assert.deepEqual(orphan, [], `이 과제들은 서버에만 있어 학생 화면에 탭이 안 생긴다: ${orphan.join(', ')}`)
})

test('③ 과제가 붙은 문항이 실제로 존재한다', () => {
  const realIds = new Set(QA_STUBS.map((qa) => qa.id))
  const ghosts = serverIds.filter((qaId) => !realIds.has(qaId))
  assert.deepEqual(ghosts, [], `없는 문항에 붙은 과제: ${ghosts.join(', ')}`)
})

test('④ 칸(slot)의 key·label·순서가 양쪽에서 같다 — 어긋나면 판정이 엉뚱한 칸을 가리킨다', () => {
  const broken: string[] = []
  for (const [qaId, extras] of clientEntries) {
    const task = MY_TURN_TASKS[qaId]
    if (!task) continue // ① 이 잡는다
    const client = extras.myTurn!.slots.map((slot) => `${slot.key}/${slot.label}`)
    const server = task.slots.map((slot) => `${slot.key}/${slot.label}`)
    if (JSON.stringify(client) !== JSON.stringify(server)) {
      broken.push(`${qaId}\n    화면: ${client.join(' · ')}\n    서버: ${server.join(' · ')}`)
    }
  }
  assert.deepEqual(broken, [], `칸이 양쪽에서 다르다:\n  ${broken.join('\n  ')}`)
})

test('⑤ 판정에 필요한 문구가 비어 있지 않다 — 빈 힌트는 «아무 말이나» 판정이 된다', () => {
  const empty: string[] = []
  for (const [qaId, task] of Object.entries(MY_TURN_TASKS)) {
    if (!task.topic?.trim()) empty.push(`${qaId} (과제 주제)`)
    if (task.slots.length === 0) empty.push(`${qaId} (칸 0개)`)
    for (const slot of task.slots) {
      if (!slot.hint?.trim()) empty.push(`${qaId}/${slot.key} (판정 힌트)`)
      // 🚨 inventedExample 은 «학생이 안 정하면 AI 가 이렇게 정해 버린다»를 보여 주는 값이다.
      //    비면 학생은 «안 정한 칸»이 무슨 뜻인지 못 본 채 통과한다 — 이 활동의 핵심이 사라진다.
      if (!slot.inventedExample?.trim()) empty.push(`${qaId}/${slot.key} (AI 가 대신 정할 값 예시)`)
    }
  }
  for (const [qaId, extras] of clientEntries) {
    const myTurn = extras.myTurn!
    if (!myTurn.intro?.trim()) empty.push(`${qaId} (안내문)`)
    if (!myTurn.placeholder?.trim()) empty.push(`${qaId} (입력 칸 안내)`)
    for (const slot of myTurn.slots) {
      if (!slot.inventedExample?.trim()) empty.push(`${qaId}/${slot.key} (화면 쪽 예시)`)
    }
  }
  assert.deepEqual(empty, [], `«내 차례»의 필수 문구가 비었다: ${empty.join(', ')}`)
})

test('⑥ 한 문항 안에서 칸 key 가 중복되지 않는다 — 판정 결과가 한쪽을 덮어쓴다', () => {
  const dup: string[] = []
  for (const [qaId, task] of Object.entries(MY_TURN_TASKS)) {
    const keys = task.slots.map((slot) => slot.key)
    if (new Set(keys).size !== keys.length) dup.push(`${qaId}: ${keys.join(', ')}`)
  }
  assert.deepEqual(dup, [], `칸 key 가 겹친다: ${dup.join(' / ')}`)
})

test('⑦ 가드가 실패할 수 있는 계측인지 — 대조 대상이 0건이 아니다 (반공백)', () => {
  // 🚨 이게 없으면 ①~⑥ 이 «순회할 것이 없어서» 전부 공짜로 통과한다.
  //    실제로 이 기능은 오랫동안 **1문항**뿐이었고, 그 사이 정합을 보는 검사는 아예 없었다.
  assert.ok(clientEntries.length > 0, '화면 쪽 myTurn 이 0건이면 ①④⑤ 가 무의미하다')
  assert.ok(serverIds.length > 0, '서버 과제가 0건이면 ②③⑤⑥ 이 무의미하다')
  const slotCount = Object.values(MY_TURN_TASKS).reduce((sum, task) => sum + task.slots.length, 0)
  assert.ok(slotCount > 0, '칸이 0개면 ④⑤⑥ 이 공짜로 통과한다')
})
