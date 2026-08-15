// 실습실 AI(`lab-ai.ts` · `routes/lab.ts`)의 계약.
//
// 왜 있는가(2026-08-15, 에픽 4/5): 여기가 실습실이 **실제로 돈을 쓰는 유일한 자리**다.
// 이 화면에는 로그인이 없어서, 참여 코드만 있으면 들어오고 토큰을 다시 받으면 학생당 한도가 우회된다.
// 그래서 층이 여러 개다 — 어느 한 층이 조용히 빠져도 나머지가 버텨야 하고, 빠진 것을 여기서 잡는다.
//
// 🔑 AI 를 실제로 부르지 않는다. 부르는 것은 수업에서 하고, 여기서는 **한도·환불·문구**를 본다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import {
  LAB_AI_LIMITS,
  LabQuotaError,
  LabRateLimitError,
  __refundForTest,
  __resetLabAiForTest,
  __takeTokenForTest,
  remainingFor,
} from './lab-ai'

const STUDENT = 'pt:student-1'
const SHARED = 'ip:10.0.0.1'

test('1) 미션과 질문은 따로 센다 — 같이 세면 «물어본다고 미션 횟수가 닳는다»', () => {
  __resetLabAiForTest()
  for (let i = 0; i < LAB_AI_LIMITS.askCalls; i += 1) __takeTokenForTest(STUDENT, 'ask')
  assert.equal(remainingFor(STUDENT).ask, 0, '질문 한도를 다 썼는데 남아 있다고 나온다')
  assert.equal(
    remainingFor(STUDENT).mission,
    LAB_AI_LIMITS.missionCalls,
    '질문을 썼다고 미션 횟수가 줄었다 — 물어보는 것이 벌이 된다',
  )
})

test('2) 학생당 미션 횟수를 다 쓰면 막는다', () => {
  __resetLabAiForTest()
  for (let i = 0; i < LAB_AI_LIMITS.missionCalls; i += 1) __takeTokenForTest(STUDENT, 'mission')
  assert.throws(() => __takeTokenForTest(STUDENT, 'mission'), LabQuotaError, '한도를 넘겼는데 안 막는다')
  // 🔑 미션이 막혔다고 질문까지 막히면 안 된다 — 막힌 학생이 물어볼 길이 사라진다.
  assert.doesNotThrow(() => __takeTokenForTest(STUDENT, 'ask'), '미션이 막히자 질문도 막혔다')
})

test('3) 미션 횟수가 비평 1 + 검증 2 를 담는다 — 모자라면 12강이 끝까지 못 간다', () => {
  assert.ok(
    LAB_AI_LIMITS.missionCalls >= 3,
    `미션 호출이 ${LAB_AI_LIMITS.missionCalls} 회다 — 비평 1 + 검증 2 = 3 을 못 채운다`,
  )
})

test('4) 기술 실패는 환불된다 — 우리 잘못으로 학생 기회가 사라지면 안 된다', () => {
  __resetLabAiForTest()
  __takeTokenForTest(STUDENT, 'mission')
  const afterUse = remainingFor(STUDENT).mission
  __refundForTest(STUDENT, 'mission')
  assert.equal(remainingFor(STUDENT).mission, afterUse + 1, '환불했는데 횟수가 안 돌아온다')

  // 🚨 환불이 음수로 내려가면 «무한 횟수»가 된다.
  for (let i = 0; i < 10; i += 1) __refundForTest(STUDENT, 'mission')
  assert.equal(
    remainingFor(STUDENT).mission,
    LAB_AI_LIMITS.missionCalls,
    '환불이 한도를 넘어 쌓였다 — 실패를 반복하면 횟수가 늘어난다',
  )
})

test('5) 공유 통(자습)은 학생 한 명보다 넉넉하다 — 한 명 몫을 적용하면 교실이 통째로 잠긴다', () => {
  assert.ok(
    LAB_AI_LIMITS.sharedPerMin >= LAB_AI_LIMITS.actorPerMin,
    `공유 통 분당(${LAB_AI_LIMITS.sharedPerMin})이 학생 한 명(${LAB_AI_LIMITS.actorPerMin})보다 작다 — 자습하는 반이 먼저 막힌다`,
  )
})

test('6) 연타는 분당 한도가 막는다 — 횟수 한도만으로는 오작동을 못 막는다', () => {
  __resetLabAiForTest()
  assert.throws(
    () => {
      for (let i = 0; i < LAB_AI_LIMITS.actorPerMin + 2; i += 1) __takeTokenForTest(STUDENT, 'ask')
    },
    (error: unknown) => error instanceof LabRateLimitError || error instanceof LabQuotaError,
    '분당 한도가 연타를 안 막는다',
  )
})

test('7) 전역 한도가 한 반을 흡수한다 — 30명이 동시에 눌러도 반이 막히면 안 된다', () => {
  const oneClass = 30 * 3
  assert.ok(
    LAB_AI_LIMITS.globalDaily >= oneClass * 4,
    `전역 일일(${LAB_AI_LIMITS.globalDaily})이 한 반(${oneClass})의 4배가 안 된다 — 하루 몇 차시도 못 받는다`,
  )
  assert.ok(LAB_AI_LIMITS.globalPerMin >= 30, `전역 분당(${LAB_AI_LIMITS.globalPerMin})이 30명 동시 클릭을 못 받는다`)
})

test('8) 시간·크기 상한이 실제로 걸려 있다 — 매달린 호출이 동시성 자리를 물면 수업이 멈춘다', () => {
  assert.ok(LAB_AI_LIMITS.timeoutMs > 0 && LAB_AI_LIMITS.timeoutMs <= 60_000, '시간 제한이 없거나 너무 길다')
  assert.ok(LAB_AI_LIMITS.maxOutputTokens > 0, '출력 상한이 없다 — 한 호출의 최대 금액이 안 정해진다')
  assert.ok(LAB_AI_LIMITS.maxInputChars > 0, '입력 길이 상한이 없다')
  assert.ok(LAB_AI_LIMITS.maxConcurrent > 0, '동시성 상한이 없다')
})

// ─── 배선·문구 계약 ───

const read = (...parts: string[]) => readFileSync(path.resolve(__dirname, ...parts), 'utf8')

test('9) 돈 천장이 AI 호출 앞에 있다 — 쓰고 나서 세면 천장을 넘긴 뒤에야 안다', () => {
  const source = read('lab-ai.ts')
  const budgetAt = source.indexOf("budgetVerdict('lab')")
  const callAt = source.indexOf('anthropic.messages.create')
  assert.ok(budgetAt > 0, 'lab-ai 가 예산을 안 본다 — 실습실 AI 에 돈 천장이 없다')
  assert.ok(budgetAt < callAt, '예산 확인이 호출보다 뒤에 있다')
  assert.ok(/registerUsageCost\('lab',/.test(source), 'lab-ai 가 쓴 돈을 장부에 안 적는다')
})

test('10) AI 가 학생 초안을 대신 써 주지 않는다 — 대신 써 주면 «규칙을 쓸 줄 아는가»가 평가되지 않는다', () => {
  const source = read('lab-ai.ts')
  const system = source.slice(source.indexOf('REVIEW_SYSTEM'), source.indexOf('export type LabReview'))
  for (const rule of ['고쳐 쓴 문장을 주지 마라', '대신 만들어 주지 마라']) {
    assert.ok(system.includes(rule), `비평 프롬프트에 «${rule}» 가 없다 — A안(내 초안 비평)이 B안으로 미끄러진다`)
  }
  const ask = source.slice(source.indexOf('ASK_SYSTEM'))
  assert.ok(ask.includes('대신 써 주지 마라'), '질문 프롬프트가 과제를 대신 해 주는 것을 안 막는다')
})

test('11) 검증 판정을 LLM 에게 시키지 않는다 — 학생 글이 판정기 프롬프트로 들어가면 인젝션 자리가 된다', () => {
  const source = read('lab-ai.ts')
  const verify = source.slice(source.indexOf('export async function verifyWithRules'))
  assert.equal(
    /채점|점수|판정해|맞는지 판단/.test(verify),
    false,
    '검증이 모델에게 판정을 시키고 있다 — 판정은 결정적 검사기(lab-checker)가 한다',
  )
  assert.ok(/outputs/.test(verify), '검증이 결과 문자열을 안 돌려준다')
})

test('12) 막힌 이유를 뭉치지 않는다 — 돈·횟수·너무 자주·고장은 학생이 할 일이 다르다', () => {
  const source = read('..', 'routes', 'lab.ts')
  for (const [status, why] of [
    ['402', '돈 천장'],
    ['409', '내 횟수 소진'],
    ['429', '너무 자주'],
    ['503', '고장·미설정'],
  ]) {
    assert.ok(source.includes(status), `routes/lab 이 ${why}(${status})을 갈라 답하지 않는다`)
  }
  // 남은 횟수는 어떤 답에도 붙어야 한다 — 화면이 따로 세지 않게.
  assert.ok(/withRemaining\(/.test(source), '답에 남은 횟수를 안 붙인다 — 화면이 스스로 세게 되고, 그건 위조된다')
})

test('13) 스마트따옴표를 입력 최전방에서 되돌린다 — 태블릿 자동교정이 30명을 동시에 막는다', () => {
  const shellPath = path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'lib', 'lab-shell')
  const shell = require(shellPath) as { normalizeInput: (raw: string) => string }
  assert.equal(shell.normalizeInput('cat "run-1.txt"'), 'cat "run-1.txt"')
  assert.equal(shell.normalizeInput('“run”'), '"run"', '큰따옴표가 안 돌아온다')
  assert.equal(shell.normalizeInput('‘run’'), "'run'", '작은따옴표가 안 돌아온다')
  assert.ok(shell.normalizeInput('a b').includes(' '), '줄바꿈 없는 공백(NBSP)이 안 돌아온다')

  // 음성 대조군 — 아무거나 통과시키면 위 검사는 공짜다.
  assert.equal(shell.normalizeInput('그대로'), '그대로')
})

test('14) 가드가 실패할 수 있는 계측인지 — 한도가 실제로 값을 움직이는가', () => {
  __resetLabAiForTest()
  const before = remainingFor(STUDENT).mission
  __takeTokenForTest(STUDENT, 'mission')
  assert.equal(remainingFor(STUDENT).mission, before - 1, '한도를 집었는데 남은 횟수가 안 줄었다')
  __resetLabAiForTest()
  assert.equal(remainingFor(STUDENT).ask, LAB_AI_LIMITS.askCalls, '통을 비웠는데 값이 안 돌아온다')
})

test('15) 공유 통(자습)에는 학생당 횟수를 걸지 않는다 — 걸면 첫 학생이 반 전체를 막는다', () => {
  // 🚨 2026-08-15 실측에서 실제로 이렇게 동작하고 있었다. 학교는 교실 전체가 공인 IP 하나로 나가서,
  //    참여자 토큰이 없는 자습 경로에 «3회»를 걸면 첫 학생이 다 쓰는 순간 나머지가 전부 막힌다.
  //    (분당·일일만 갈라 두고 횟수는 안 갈랐던 자리 — 같은 실수의 세 번째 재발이다.)
  __resetLabAiForTest()
  for (let i = 0; i < LAB_AI_LIMITS.missionCalls + 3; i += 1) __takeTokenForTest(SHARED, 'mission')
  assert.ok(
    remainingFor(SHARED).mission > 0,
    '공유 통에 학생당 횟수가 걸려 있다 — 자습하던 다른 학생이 남의 사용 때문에 막힌다',
  )
  assert.doesNotThrow(() => __takeTokenForTest(SHARED, 'mission'), '공유 통이 학생당 횟수로 막혔다')

  // 🔑 그렇다고 무제한은 아니다 — 분당·일일·전역이 받는다.
  assert.ok(LAB_AI_LIMITS.sharedDaily > 0, '공유 통의 일일 한도가 없다 — 정말로 무제한이 된다')

  // 학생 한 명(참여자 토큰)에게는 여전히 걸린다.
  assert.equal(remainingFor(STUDENT).mission, LAB_AI_LIMITS.missionCalls)
  for (let i = 0; i < LAB_AI_LIMITS.missionCalls; i += 1) __takeTokenForTest(STUDENT, 'mission')
  assert.throws(() => __takeTokenForTest(STUDENT, 'mission'), LabQuotaError, '학생 한 명에게는 횟수가 걸려야 한다')
})

test('16) 남은 횟수가 JSON 으로 나갈 수 있는 값이다 — Infinity 는 null 이 되어 «확인 중»과 헷갈린다', () => {
  __resetLabAiForTest()
  const parsed = JSON.parse(JSON.stringify(remainingFor(SHARED))) as { mission: unknown; ask: unknown }
  assert.equal(typeof parsed.mission, 'number', '공유 통의 남은 횟수가 JSON 으로 숫자가 아니다')
  assert.equal(typeof parsed.ask, 'number')
})
