// 교안의 «지금 이 칸» 판정에 대한 계약.
//
// 왜 있는가(2026-08-11 prod QA, 신입샘 t3): 교안은 «0–4분 열기 / 4–13분 학습…»으로 시간을
// 말하는데 교사 화면 어디에도 «지금 몇 분째»가 없었다. 교사가 45분 계획을 손에 들고도
// 자기가 어디쯤인지 못 읽었다.
//
// 🚨 이 계약이 지키는 가장 중요한 것은 «맞는 칸을 고르는가»가 아니라 **모를 때 입을 다무는가**다.
//    이 앱에는 «수업 시작» 기록이 없어서 첫 참여 시각을 근사값으로 쓴다. 근사값이 없거나
//    계획 시간을 지난 상태에서 아무 칸이나 «지금»이라고 우기면, 교사는 틀린 «몇 분째»를 믿고
//    진도를 당기거나 늦춘다. 없는 것보다 나쁜 정보가 된다.
import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const load = (rel: string) => require(path.resolve(ROOT, 'client', 'src', 'data', rel))

type Segment = { minutes: number }
type Plan = { chapterId: number; totalMinutes: number; segments: Segment[] }

const { findActiveSegmentIndex, LESSON_PLANS } = load('lesson-plans') as {
  findActiveSegmentIndex: (plan: Plan, elapsedMinutes: number) => number | null
  LESSON_PLANS: Record<number, Plan>
}

const plans = (): Plan[] => Object.values(LESSON_PLANS)

test('① 각 칸의 시작 분에 그 칸이 «지금»이 된다 — 모든 교안에서', () => {
  const broken: string[] = []

  for (const plan of plans()) {
    let start = 0
    for (let index = 0; index < plan.segments.length; index += 1) {
      const picked = findActiveSegmentIndex(plan, start)
      if (picked !== index) {
        broken.push(`${plan.chapterId}장 ${start}분 → 기대 ${index}번 칸, 실제 ${picked}`)
      }
      start += plan.segments[index].minutes
    }
  }

  assert.deepEqual(broken, [], `«지금 이 칸»이 어긋난다:\n  ${broken.join('\n  ')}`)
})

test('② 칸의 마지막 1분도 그 칸에 속한다 — 경계에서 한 칸씩 밀리지 않는다', () => {
  const broken: string[] = []

  for (const plan of plans()) {
    let start = 0
    for (let index = 0; index < plan.segments.length; index += 1) {
      const lastMinute = start + plan.segments[index].minutes - 1
      const picked = findActiveSegmentIndex(plan, lastMinute)
      if (picked !== index) {
        broken.push(`${plan.chapterId}장 ${lastMinute}분 → 기대 ${index}번 칸, 실제 ${picked}`)
      }
      start += plan.segments[index].minutes
    }
  }

  assert.deepEqual(broken, [], `칸 경계에서 밀린다:\n  ${broken.join('\n  ')}`)
})

test('③ 계획한 시간을 지나면 아무 칸도 «지금»이라고 하지 않는다', () => {
  const wrong = plans()
    .filter((plan) => findActiveSegmentIndex(plan, plan.totalMinutes) !== null)
    .map((plan) => `${plan.chapterId}장 (${plan.totalMinutes}분)`)

  assert.deepEqual(
    wrong,
    [],
    '계획 시간을 지났는데 마지막 칸을 «지금»이라고 말한다 — 교사가 아직 그 칸이라고 오해한다:\n  ' +
      `${wrong.join('\n  ')}`,
  )
})

test('④ 시각을 모르면 아무 칸도 고르지 않는다 (없는 것보다 나쁜 정보 금지)', () => {
  const plan = plans()[0]
  assert.equal(findActiveSegmentIndex(plan, Number.NaN), null, 'NaN 인데 칸을 골랐다')
  assert.equal(findActiveSegmentIndex(plan, -1), null, '음수인데 칸을 골랐다')
  assert.equal(findActiveSegmentIndex(plan, Number.POSITIVE_INFINITY), null, '무한대인데 칸을 골랐다')
})

test('⑤ 이 계측이 실패할 수 있는가 — 대조 대상이 비어 있지 않다', () => {
  // 🚨 ①~③ 은 «어긋난 명단이 비어 있음»을 단언한다. 교안이 0개면 아무것도 안 보고도 참이 된다.
  assert.ok(plans().length > 0, '교안이 0개다 — ①~③ 이 아무것도 안 보고 통과하는 상태다.')
  assert.ok(
    plans().every((plan) => plan.segments.length > 0),
    '칸이 없는 교안이 있다 — 그 교안에 대해 ①② 는 아무것도 검사하지 않는다.',
  )
})
