// 실습실 AI(`lab-ai.ts` · `routes/lab.ts`)의 계약.
//
// 🚨 이 파일이 지키는 것은 **«한도가 없다»는 것 자체**다(2026-08-15 jery).
//    지출 상한은 API 키 쪽에 걸려 있고, 앱 안에 천장을 또 두면 그건 수업을 멈출 수 있는
//    자리가 하나 더 생기는 것이다. 「중요한 건 수업이지 비용이 아니다 —
//    API 비용보다 수업에 문제가 생겼을 때의 리스크가 훨씬 크다.」
//
// 🔑 그래서 검사하는 것은 «잘 막는가»가 아니라
//    **«수업을 막을 수 있는 것이 되살아나지 않았는가»**와
//    **«수업을 지키는 장치는 살아 있는가»** 둘이다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import { LAB_AI_LIMITS, __queueDepthForTest, __resetLabAiForTest } from './lab-ai'

const read = (...parts: string[]) => readFileSync(path.resolve(__dirname, ...parts), 'utf8')

// ─── 되살아나면 안 되는 것 ───

test('1) 학생당 호출 횟수 한도가 없다 — 수업 도중 「횟수를 다 썼습니다」를 만나면 안 된다', () => {
  // 🚨 2026-08-15 이전에는 학생당 미션 3회·질문 5회가 있었다. 비평이 애매해서 다시 받고,
  //    규칙을 고쳐 다시 시켜 보는 것이 이 수업의 본체인데, 그 횟수가 3번이면
  //    학생은 «고치는 법»이 아니라 «횟수를 아끼는 법»을 배운다.
  const source = read('lab-ai.ts')
  for (const gone of ['missionCalls', 'askCalls', 'LabQuotaError', 'quota_exhausted', 'remainingFor']) {
    assert.equal(source.includes(gone), false, `학생당 횟수 한도(${gone})가 되살아났다`)
  }
  assert.equal(
    Object.keys(LAB_AI_LIMITS).some((key) => /Calls$|quota/i.test(key)),
    false,
    `통제값에 «몇 번»이 생겼다: ${Object.keys(LAB_AI_LIMITS).join(', ')}`,
  )
})

test('2) 앱 안에 지출 천장이 없다 — 상한은 API 키 쪽에 있다', () => {
  const source = read('lab-ai.ts')
  for (const gone of ['budgetVerdict', 'registerUsageCost', 'LabBudgetError', 'ai-spend']) {
    assert.equal(source.includes(gone), false, `앱 안의 지출 천장(${gone})이 되살아났다`)
  }
  // 🔑 예전엔 「내 차례」(vibe-my-turn.ts)도 같이 봤다 — 2026-08-18 라우트째 철거되어 볼 파일이 없다.
  //    같은 실수가 새 라우트에서 반복되면 그 라우트의 계약이 잡는다.
})

test('3) 주머니를 나누지 않는다 — 챗봇 예산과 실습 예산을 갈라 두면 관리할 자리가 둘이 된다', () => {
  assert.equal(/SpendBucket/.test(read('lab-ai.ts')), false, '주머니 분리가 되살아났다')
})

test('4) 학생 화면이 「남은 횟수」를 말하지 않는다 — 셀 것이 없으면 말할 것도 없다', () => {
  const nav = readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'components', 'learn', 'ChapterNavPanel.tsx'),
    'utf8',
  )
  assert.equal(/AI 남은 횟수/.test(nav), false, '좌측에 «남은 횟수»가 되살아났다')
})

// ─── 수업을 지키려고 남긴 것 ───

test('5) 시간 제한이 살아 있다 — 매달린 호출은 학생 화면을 얼려 놓는다', () => {
  assert.ok(LAB_AI_LIMITS.timeoutMs > 0 && LAB_AI_LIMITS.timeoutMs <= 60_000, '시간 제한이 없거나 너무 길다')
  assert.ok(/timeout: LAB_AI_LIMITS\.timeoutMs/.test(read('lab-ai.ts')), '호출에 시간 제한이 안 걸려 있다')
})

test('6) 동시성 큐가 살아 있고, 한 반이 통째로 들어와도 넉넉하다', () => {
  assert.ok(LAB_AI_LIMITS.maxConcurrent > 0, '동시성 상한이 없다')
  assert.ok(LAB_AI_LIMITS.maxWaitMs > 0 && LAB_AI_LIMITS.maxWaitMs <= 60_000, '대기 시간 상한이 없거나 너무 길다')
  // 🔑 대기열이 좁으면 그것도 «수업을 막는 한도»가 된다 — 30명이 각자 2회면 60.
  assert.ok(LAB_AI_LIMITS.maxQueued >= 60, `대기열(${LAB_AI_LIMITS.maxQueued})이 한 반을 못 담는다`)
})

test('7) 이탈한 학생 몫이 자리를 물고 있지 않는다', () => {
  const source = read('lab-ai.ts')
  assert.ok(/signal\?\.addEventListener\(\s*'abort'/.test(source), '요청이 끊겨도 큐에서 안 빠진다')
  assert.ok(/if \(signal\?\.aborted\) throw new LabAbortedError/.test(source), '슬롯을 잡은 뒤 이탈을 안 본다')
  assert.ok(
    /if \(caught instanceof LabAbortedError\) return;/.test(read('..', 'routes', 'lab.ts')),
    '이탈을 «고장»으로 세고 있다 — 수업 중 오류 로그가 이탈로 가득 차면 진짜 고장을 못 본다',
  )
})

test('8) 슬롯이 새지 않는다 — 성공·실패·취소 어느 쪽이든 반납된다', () => {
  const source = read('lab-ai.ts')
  const withSlot = source.slice(source.indexOf('async function withSlot'), source.indexOf('/** 테스트 전용 — 큐 상태'))
  assert.ok(/finally \{[\s\S]*active -= 1;[\s\S]*wakeNext\(\)/.test(withSlot), '슬롯 반납이 finally 밖에 있다')
  __resetLabAiForTest()
  const depth = __queueDepthForTest()
  assert.equal(depth.active, 0)
  assert.equal(depth.waiting, 0)
})

test('9) 크기 상한이 system 과 user 양쪽에 걸린다 — 한 호출이 몇 분씩 걸리지 않게', () => {
  const source = read('lab-ai.ts')
  assert.ok(LAB_AI_LIMITS.maxInputChars > 0 && LAB_AI_LIMITS.maxOutputTokens > 0, '크기 상한이 없다')
  assert.ok(/system: system\.slice\(0, LAB_AI_LIMITS\.maxInputChars\)/.test(source), 'system 을 안 자른다')
  assert.ok(/content: user\.slice\(0, LAB_AI_LIMITS\.maxInputChars\)/.test(source), 'user 를 안 자른다')
})

// ─── 수업의 내용을 지키는 것 ───

test('10) AI 가 학생 초안을 대신 써 주지 않는다 — 대신 써 주면 «규칙을 쓸 줄 아는가»가 평가되지 않는다', () => {
  const source = read('lab-ai.ts')
  const system = source.slice(source.indexOf('REVIEW_SYSTEM'), source.indexOf('export type LabReview'))
  for (const rule of ['고쳐 쓴 문장을 주지 마라', '대신 만들어 주지 마라']) {
    assert.ok(system.includes(rule), `비평 프롬프트에 «${rule}» 가 없다`)
  }
  assert.ok(source.slice(source.indexOf('ASK_SYSTEM')).includes('대신 써 주지 마라'), '질문 프롬프트가 대행을 안 막는다')
})

test('11) 검증 판정을 LLM 에게 시키지 않는다 — 학생 글이 판정기 프롬프트로 들어가면 인젝션 자리가 된다', () => {
  const source = read('lab-ai.ts')
  const verify = source.slice(source.indexOf('export async function verifyWithRules'))
  assert.equal(/채점|점수|판정해|맞는지 판단/.test(verify), false, '검증이 모델에게 판정을 시킨다')
  assert.ok(/outputs/.test(verify), '검증이 결과 문자열을 안 돌려준다')
})

test('12) 막힌 이유를 뭉치지 않는다 — 「지금 붐빈다」와 「고장」은 학생이 할 일이 다르다', () => {
  const source = read('..', 'routes', 'lab.ts')
  assert.ok(source.includes('429'), 'routes/lab 이 «지금 붐빈다»(429)를 갈라 답하지 않는다')
  assert.ok(source.includes('503'), 'routes/lab 이 «고장·미설정»(503)을 갈라 답하지 않는다')
  // 🚨 없앤 것을 다시 만들지 않았는지도 본다.
  assert.equal(source.includes('402'), false, '돈 천장 응답(402)이 되살아났다')
  assert.equal(source.includes('409'), false, '횟수 소진 응답(409)이 되살아났다')
})

test('13) 스마트따옴표를 입력 최전방에서 되돌린다 — 태블릿 자동교정이 30명을 동시에 막는다', () => {
  const shell = require(
    path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'lib', 'lab-shell'),
  ) as { normalizeInput: (raw: string) => string }
  assert.equal(shell.normalizeInput('“run”'), '"run"', '큰따옴표가 안 돌아온다')
  assert.equal(shell.normalizeInput('‘run’'), "'run'", '작은따옴표가 안 돌아온다')
  assert.equal(shell.normalizeInput('그대로'), '그대로')
})
