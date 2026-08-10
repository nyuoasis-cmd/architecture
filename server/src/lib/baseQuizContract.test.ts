// 기존 10장(1~10장) 퀴즈 계약 가드 — 바이브코딩(11~17장)의 vibeQuizContract 와 같은 역할을 기존 장에 건다.
//
// 왜 필요한가: 정답·해설은 서버(base-quiz-answers-chNN.ts)에, 선지는 클라(base-quiz-chNN.ts)에 따로 산다.
// 한쪽만 고치면 앱은 멀쩡히 돌면서 «틀린 답»을 정답이라 가르친다 — 화면도 빌드도 초록인 채로.
//
// 🚨 이 가드가 생기기 전 실측(2026-08-10, master a2569ac):
//    1~10장 195개 퀴즈의 정답이 A 45.1% · B 40.5% · C 13.3% · D 1.0% 로 쏠려 있었고,
//    한 문의 세 문항 정답이 전부 같은 자리인 문이 13건이었다(9장은 6문 중 5문이 전부 A).
//    «A만 찍으면 만점»이라 문항 하나하나가 맞는 것과 별개로 퀴즈 전체가 무력해진다.
//    11~17장에서 PR #136 으로 같은 결함을 고쳤고, 이 파일은 그 처리를 기존 장으로 넓힌 것이다.
import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'

import { QUIZ_ANSWERS } from '../data/quiz-answers'

// 🚨 클라 데이터는 정적 import 로 가져오지 않는다 — server/tsconfig 의 rootDir 밖이라 tsc 가 TS6059 로 죽는다.
type QuizSetLike = { questions: { question: string; options: string[] }[] }
const clientQuizzes: { QUIZZES: Record<string, QuizSetLike> } = require(
  path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'data', 'quizzes'),
)
const { QUIZZES } = clientQuizzes

const isBase = (qaId: string) => Number(qaId.slice(2, 4)) <= 10
const BASE_QUIZZES = Object.fromEntries(Object.entries(QUIZZES).filter(([qaId]) => isBase(qaId)))
const baseAnswerIds = Object.keys(QUIZ_ANSWERS).filter(isBase)

test('① 선지가 있는 모든 문항에 서버 정답이 있다', () => {
  const missing = Object.keys(BASE_QUIZZES).filter((qaId) => !QUIZ_ANSWERS[qaId])
  assert.deepEqual(missing, [], `서버 정답이 없는 문항: ${missing.join(', ')}`)
})

test('② 서버 정답에 대응하는 클라 선지가 있다 (유령 정답 금지)', () => {
  const orphan = baseAnswerIds.filter((qaId) => !BASE_QUIZZES[qaId])
  assert.deepEqual(orphan, [], `선지 없는 정답: ${orphan.join(', ')}`)
})

test('③ 문항 수가 양쪽에서 같다', () => {
  const drift: string[] = []
  for (const [qaId, set] of Object.entries(BASE_QUIZZES)) {
    const answers = QUIZ_ANSWERS[qaId]
    if (!answers) continue
    if (set.questions.length !== answers.answers.length) {
      drift.push(`${qaId}: 선지 ${set.questions.length}문 ≠ 정답 ${answers.answers.length}문`)
    }
  }
  assert.deepEqual(drift, [], drift.join(' / '))
})

test('④ correctIdx 가 선지 범위 안이고 해설이 비어 있지 않다', () => {
  const bad: string[] = []
  for (const [qaId, set] of Object.entries(BASE_QUIZZES)) {
    const answers = QUIZ_ANSWERS[qaId]
    if (!answers) continue
    answers.answers.forEach((answer, idx) => {
      const options = set.questions[idx]?.options ?? []
      if (!Number.isInteger(answer.correctIdx) || answer.correctIdx < 0 || answer.correctIdx >= options.length) {
        bad.push(`${qaId}[${idx}]: correctIdx=${answer.correctIdx}, 선지 ${options.length}개`)
      }
      if (!answer.explanation?.trim()) bad.push(`${qaId}[${idx}]: 해설 없음`)
    })
  }
  assert.deepEqual(bad, [], bad.join(' / '))
})

test('⑤ «준비중» 자리표시자가 되살아나지 않았다', () => {
  const placeholder: string[] = []
  for (const [qaId, set] of Object.entries(BASE_QUIZZES)) {
    if (set.questions.some((q) => q.options.some((o) => o.trim() === '준비중'))) placeholder.push(qaId)
    if ((QUIZ_ANSWERS[qaId]?.answers ?? []).some((a) => a.explanation.includes('준비중'))) placeholder.push(qaId)
  }
  assert.deepEqual(placeholder, [], `자리표시자로 남은 문항: ${[...new Set(placeholder)].join(', ')}`)
})

// ⑥⑦ 정답 자리 쏠림 — 내용이 맞아도 «찍어서 맞히는» 퀴즈가 되는 자리.
test('⑥ 한 문의 문항들이 전부 같은 자리를 정답으로 두지 않는다', () => {
  const flat: string[] = []
  for (const qaId of Object.keys(BASE_QUIZZES)) {
    const idxs = (QUIZ_ANSWERS[qaId]?.answers ?? []).map((a) => a.correctIdx)
    if (idxs.length > 1 && new Set(idxs).size === 1) flat.push(`${qaId}(전부 ${String.fromCharCode(65 + idxs[0])})`)
  }
  assert.deepEqual(flat, [], `정답이 한 자리에 몰린 문: ${flat.join(', ')}`)
})

test('⑦ 정답 자리가 한쪽으로 쏠리지 않는다 (어느 자리도 35% 미만)', () => {
  const dist = [0, 0, 0, 0]
  let total = 0
  for (const qaId of Object.keys(BASE_QUIZZES)) {
    for (const a of QUIZ_ANSWERS[qaId]?.answers ?? []) {
      if (a.correctIdx >= 0 && a.correctIdx < 4) dist[a.correctIdx] += 1
      total += 1
    }
  }
  assert.ok(total >= 100, `퀴즈가 ${total}개뿐이면 이 검사는 의미가 없다 — 대조 대상 부족`)
  const worst = Math.max(...dist)
  assert.ok(
    worst / total < 0.35,
    `정답이 ${String.fromCharCode(65 + dist.indexOf(worst))} 자리에 ${Math.round((100 * worst) / total)}% 몰려 있다 ` +
      `(분포 ${dist.map((n, i) => `${String.fromCharCode(65 + i)}:${n}`).join(' ')}, 총 ${total}개)`,
  )
})

test('⑧ 가드가 실패할 수 있는 계측인지 — 대조 대상이 비어 있지 않다', () => {
  assert.ok(Object.keys(BASE_QUIZZES).length >= 60, '클라 선지가 비면 위 검사는 전부 공짜로 통과한다')
  assert.ok(baseAnswerIds.length >= 60, '서버 정답에 1~10장이 없으면 ②가 공짜로 통과한다')
  const withMultiple = Object.keys(BASE_QUIZZES).filter((id) => (QUIZ_ANSWERS[id]?.answers ?? []).length > 1).length
  assert.ok(withMultiple >= 50, `문항이 2개 이상인 문이 ${withMultiple}개뿐이면 ⑥은 사실상 아무것도 검사하지 않는다`)
})
