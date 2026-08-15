// AI 지출 장부(`ai-spend.ts`)의 계약.
//
// 왜 있는가(2026-08-15, 에픽 2/5): 2026-08-15 이전에는 지출 계산이 chat-service 안에만 있어서
// 「내 차례」(`/api/vibe/my-turn`)가 부르는 AI 가 **어떤 장부에도 안 잡혔다.** 그 라우트에는
// 호출 횟수 한도만 있고 돈 천장이 없었다 — MYTURN_* 를 올리는 것이 곧 상한을 올리는 일이었다.
// 실습실(PR4)이 같은 자리에 AI 를 더 붙이므로, 붙이기 전에 장부가 실제로 세는지부터 못 박는다.
//
// 🔑 여기서 검사하는 것은 «예산 숫자가 얼마인가»가 아니라 **«세고 있는가 · 막는가 · 정직하게 말하는가»**다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test } from 'node:test'

import {
  __markPersistBrokenForTest,
  __resetSpendForTest,
  budgetUsdFor,
  budgetVerdict,
  estimateCostUsd,
  registerUsageCost,
  spendSnapshot,
  spentUsdFor,
} from './ai-spend'

const HAIKU = 'claude-haiku-4-5-20251001'
const SONNET = 'claude-sonnet-4-6'

/** 한 주머니를 원하는 금액까지 채운다. */
function fill(bucket: 'chat' | 'lab', usd: number, at?: Date) {
  registerUsageCost(bucket, usd, at)
}

test('1) 주머니가 갈라져 있다 — 챗봇이 쓴 돈이 실습을 막지 않는다', () => {
  __resetSpendForTest()
  fill('chat', budgetUsdFor('chat') * 2)
  assert.equal(budgetVerdict('chat'), 'blocked', '천장을 두 배로 넘겼는데 챗봇이 안 막힌다')
  assert.equal(
    budgetVerdict('lab'),
    'ok',
    '챗봇이 많이 썼다고 실습이 막혔다 — 주머니가 합쳐져 있으면 어느 쪽이 왜 막혔는지도 모른다',
  )
})

test('2) 천장에 닿으면 실제로 막는다 — 세기만 하고 안 막으면 장부가 아니라 일기다', () => {
  __resetSpendForTest()
  const budget = budgetUsdFor('lab')
  assert.equal(budgetVerdict('lab'), 'ok', '아무것도 안 썼는데 막혀 있다')

  fill('lab', budget * 1.25)
  assert.equal(budgetVerdict('lab'), 'cache_only', '예산의 1.2배를 넘겼는데 중간 단계로 안 내려간다')

  fill('lab', budget * 0.3)
  assert.equal(budgetVerdict('lab'), 'blocked', '예산의 1.5배를 넘겼는데 안 막는다')
})

test('3) 달이 바뀌면 0 으로 되돌아간다 — 예전 코드는 이게 없어 「월 예산」이 영원히 누적됐다', () => {
  __resetSpendForTest()
  const january = new Date(Date.UTC(2026, 0, 20))
  const february = new Date(Date.UTC(2026, 1, 3))

  fill('lab', budgetUsdFor('lab') * 2, january)
  assert.equal(budgetVerdict('lab', january), 'blocked', '1월에 두 배를 썼는데 안 막힌다')
  assert.equal(budgetVerdict('lab', february), 'ok', '달이 바뀌었는데 지난달 지출이 그대로 남아 막고 있다')
  assert.equal(spentUsdFor('lab', february), 0, '새 달의 누계가 0 이 아니다')
})

test('4) 장부는 «언제부터 센 것인가»를 같이 말한다 — 안 말하면 읽는 쪽이 이번 달 총액으로 오해한다', () => {
  __resetSpendForTest()
  const snapshot = spendSnapshot('lab')
  assert.ok(snapshot.countingSince, '언제부터 센 것인지를 안 말한다')
  assert.equal(
    snapshot.persisted,
    false,
    '프로세스 안에만 있는 장부인데 «저장됨»이라고 말한다 — 이 값이 참이 되는 날에만 «월 상한»이라 부를 수 있다',
  )
  assert.equal(snapshot.budgetUsd, budgetUsdFor('lab'), '선언한 예산이 실제 예산과 다르다')
})

test('5) 실패한 호출은 세지 않는다 — 0 이나 음수, NaN 이 장부를 밀지 않는다', () => {
  __resetSpendForTest()
  for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    registerUsageCost('lab', bad)
  }
  assert.equal(spentUsdFor('lab'), 0, `버려야 할 값이 장부에 들어갔다: ${spentUsdFor('lab')}`)
})

test('6) 캐시를 쓴 호출을 갈라 센다 — 안 가르면 캐시가 잘 들을수록 멀쩡한데 천장에 닿는다', () => {
  const usage = {
    input_tokens: 100_000,
    output_tokens: 1_000,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 95_000,
  }
  const withCache = estimateCostUsd(HAIKU, usage, true)
  const withoutCache = estimateCostUsd(HAIKU, usage, false)
  assert.ok(
    withCache < withoutCache,
    `캐시 읽기가 더 싸야 한다 — 캐시 ${withCache} vs 비캐시 ${withoutCache}`,
  )
  assert.ok(withCache > 0, '캐시를 썼다고 공짜가 되면 장부가 지출을 놓친다')
})

test('7) 모델에 따라 요율이 다르다 — 같은 값을 쓰면 Sonnet 지출이 3분의 1로 잡힌다', () => {
  const usage = {
    input_tokens: 10_000,
    output_tokens: 1_000,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  }
  const haiku = estimateCostUsd(HAIKU, usage, false)
  const sonnet = estimateCostUsd(SONNET, usage, false)
  assert.ok(sonnet > haiku * 2.5, `Sonnet 이 Haiku 요율로 잡히고 있다 — haiku ${haiku} / sonnet ${sonnet}`)
})

test('8) 「내 차례」한 명분이 실제로 예산 안이다 — 상한이 정상 사용을 막으면 수업이 멈춘다', () => {
  // 학생 1명 = AI 3회, 호출당 입력 약 2,000 · 출력 약 500 토큰(2026-08-15 산정).
  const perCall = estimateCostUsd(
    HAIKU,
    { input_tokens: 2_000, output_tokens: 500, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    false,
  )
  const oneClass = perCall * 3 * 30
  assert.ok(
    oneClass < budgetUsdFor('lab'),
    `한 반(30명)이 예산을 넘긴다 — 한 반 $${oneClass.toFixed(2)} / 예산 $${budgetUsdFor('lab')}. 상한은 사고를 끊는 것이지 수업을 막는 게 아니다`,
  )
  // 🔑 반대로 «너무 커서 아무것도 안 막는» 것도 곤란하다. 최대 사용량(6강 × 3개 반)의 몇 배인지 본다.
  const worstCase = perCall * 3 * 30 * 6 * 3
  assert.ok(
    budgetUsdFor('lab') < worstCase * 20,
    `예산이 최대 사용량의 20배를 넘는다 — 사고가 나도 안 끊긴다(예산 $${budgetUsdFor('lab')} / 최대 $${worstCase.toFixed(2)})`,
  )
})

test('9) 가드가 실패할 수 있는 계측인지 — 장부가 실제로 값을 움직이는가', () => {
  __resetSpendForTest()
  assert.equal(spentUsdFor('lab'), 0)
  fill('lab', 1.23)
  assert.ok(spentUsdFor('lab') > 1.2, '적었는데 누계가 안 움직인다 — 위 검사들이 0 으로 공짜 통과할 수 있다')
})

// ─── 배선 계약 — 장부가 있어도 «부르는 쪽이 안 쓰면» 천장은 없는 것과 같다 ───

test('10) 「내 차례」가 장부에 실제로 배선돼 있다 — 이게 빠지면 돈 천장이 다시 사라진다', () => {
  const source = readFileSync(resolve(__dirname, 'vibe-my-turn.ts'), 'utf8')

  assert.ok(
    /budgetVerdict\('lab'\)/.test(source),
    'vibe-my-turn 이 호출 전에 예산을 안 본다 — 쓰고 나서 세면 천장을 넘긴 뒤에야 알게 된다',
  )
  assert.ok(
    /registerUsageCost\('lab',/.test(source),
    'vibe-my-turn 이 쓴 돈을 안 적는다 — 2026-08-15 이전으로 되돌아간 상태다(호출 한도만 있고 돈 천장 없음)',
  )
  assert.ok(/timeout: MY_TURN_TIMEOUT_MS/.test(source), '시간 제한이 없다 — 매달린 호출이 동시성 자리를 문다')
  assert.ok(
    /max_tokens: MY_TURN_MAX_OUTPUT_TOKENS/.test(source),
    '출력 상한이 상수로 안 묶여 있다 — 한 호출의 최대 금액이 코드에서 안 보인다',
  )

  // 🚨 적는 자리가 «성공한 뒤»인지. 실패한 호출까지 세면 천장이 헛돈다.
  const callAt = source.indexOf('anthropic.messages.create')
  const registerAt = source.indexOf("registerUsageCost('lab',")
  assert.ok(callAt > 0 && registerAt > callAt, '지출을 호출보다 먼저 적고 있다 — 실패한 호출까지 세게 된다')
})

test('11) 돈 천장과 «그 문항엔 없다»를 갈라 답한다 — 조치가 완전히 다른 두 원인이다', () => {
  const source = readFileSync(resolve(__dirname, '..', 'routes', 'vibe.ts'), 'utf8')
  assert.ok(
    /budget_exceeded/.test(source) && /503/.test(source),
    'routes/vibe 가 돈 천장을 404(«없다»)와 같은 답으로 돌려준다 — 무엇이 막혔는지 아무도 모른 채 다시 시도한다',
  )
})

test('12) chat-service 가 자기 장부를 다시 만들지 않았다 — 갈라지면 총액을 아무도 못 센다', () => {
  const source = readFileSync(resolve(__dirname, 'chat-service.ts'), 'utf8')
  assert.equal(
    /let monthlyUsdEstimate|monthlyUsdEstimate \+=/.test(source),
    false,
    'chat-service 안에 지출 누계가 되살아났다 — 장부는 ai-spend 하나여야 한다',
  )
  assert.ok(/from '\.\/ai-spend'/.test(source), 'chat-service 가 공용 장부를 안 쓴다')
})

// ─── 영속화 계약 (2026-08-15, 별도 PR) ───

test('13) 장부가 «저장됐는가»를 정직하게 말한다 — 조용히 메모리로 떨어지면 아무도 모른다', () => {
  __resetSpendForTest()
  __markPersistBrokenForTest(true)
  assert.equal(
    spendSnapshot('lab').persisted,
    false,
    'DB 쓰기가 깨졌는데 «저장됨»이라고 말한다 — «월 상한이 있다»고 믿는 쪽이 속는다',
  )
})

test('14) 못 보낸 금액을 숨기지 않는다 — 0 이 아니면 장부가 뒤처져 있다는 뜻이다', () => {
  __resetSpendForTest()
  registerUsageCost('lab', 1.5)
  const snapshot = spendSnapshot('lab')
  assert.equal(typeof snapshot.pendingUsd, 'number', '못 보낸 금액을 안 말한다')
  assert.ok(snapshot.spentUsd >= 1.5, '누계에 안 잡혔다')
})

test('15) 장부가 안 돼도 천장은 여전히 선다 — 못 적는다고 지출이 열리면 안 된다', () => {
  __resetSpendForTest()
  __markPersistBrokenForTest(true)
  registerUsageCost('lab', budgetUsdFor('lab') * 2)
  assert.equal(
    budgetVerdict('lab'),
    'blocked',
    'DB 가 안 되자 천장까지 사라졌다 — 메모리 차단기라도 남아 있어야 한다',
  )
})

test('16) SQL 이 «증분 더하기»로 쓴다 — 읽고 덮어쓰면 인스턴스 둘이 서로의 지출을 지운다', () => {
  const sql = readFileSync(resolve(__dirname, '..', '..', '..', 'sql', '008_ai_spend.sql'), 'utf8')
  assert.ok(/ON CONFLICT/i.test(sql), 'upsert 가 아니다 — 같은 달 두 번째 쓰기가 실패한다')
  assert.ok(
    /usd = architecture_ai_spend\.usd \+/i.test(sql),
    '기존 값에 더하지 않고 덮어쓴다 — 동시에 뜬 두 인스턴스가 서로를 지운다',
  )
  assert.ok(/PRIMARY KEY \(bucket, month_key\)/i.test(sql), '주머니·달이 키가 아니다')
  // 되돌리기가 있는가 — 없으면 잘못 나갔을 때 손으로 지워야 한다.
  const down = readFileSync(resolve(__dirname, '..', '..', '..', 'sql', '008_ai_spend.down.sql'), 'utf8')
  assert.ok(/DROP TABLE/i.test(down), '되돌리기 스크립트가 표를 안 지운다')
})

test('17) /health 가 지출과 «저장됐는가»를 같이 낸다 — 안 내면 조용히 떨어져도 아무도 모른다', () => {
  const source = readFileSync(resolve(__dirname, '..', 'index.ts'), 'utf8')
  assert.ok(/aiSpend/.test(source), '/health 에 지출 장부가 없다')
  assert.ok(/spendSnapshot\('lab'\)/.test(source), '/health 가 실습 주머니를 안 낸다')
  assert.ok(/initSpendLedger\(\)/.test(source), '서버가 뜰 때 이 달 누계를 안 읽어 온다 — 늘 0 부터 센다')
})
