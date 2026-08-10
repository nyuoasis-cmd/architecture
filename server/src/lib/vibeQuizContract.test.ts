// 바이브코딩 퀴즈 계약 가드 — 클라 선지(vibe-stubs.ts)와 서버 정답(vibe-quiz-answers.ts)의 어긋남을 잡는다.
//
// 왜 필요한가: 이 카테고리는 정답·해설을 서버에만 둔다(학생이 소스에서 답을 볼 수 없게).
// 그래서 선지와 정답이 서로 다른 파일에 산다 — 한쪽만 고치면 아무도 모른다.
//  - 선지 순서를 바꾸고 서버 correctIdx 를 안 고치면 → 앱은 멀쩡히 돌고 «틀린 답»을 정답이라 가르친다
//  - 문항을 추가하고 정답을 안 넣으면 → 채점이 조용히 빠진다
// 화면도 빌드도 초록인 채로 «교육 내용이 틀리는» 유일한 자리라, 장이 늘 때마다 자동으로 커지는 가드로 둔다.
//
// 🔑 장 목록을 여기 손으로 적지 않는다 — 양쪽 데이터에서 읽어 대조한다.
import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'

import { VIBE_QUIZ_ANSWERS } from '../data/vibe-quiz-answers'
import { VIBE_QA_CONTEXTS } from '../data/vibe-chapter-content'

// 🚨 클라 데이터는 **정적 import 로 가져오지 않는다.** server/tsconfig 의 rootDir 은 server/src 라,
//    `import … from '../../../client/…'` 를 쓰면 런타임(tsx)은 멀쩡한데 `tsc` 가 TS6059 로 죽는다
//    = 테스트를 하나 추가하고 남의 빌드를 깨뜨리는 형태. 경로를 실행 시점에 계산해 읽는다.
type QuizSetLike = { questions: { options: string[] }[] }
type ClientVibeData = {
  VIBE_QUIZZES: Record<string, QuizSetLike>
  VIBE_QAS: { id: string }[]
}

const clientVibe: ClientVibeData = require(
  path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'data', 'vibe-stubs'),
)
const { VIBE_QUIZZES, VIBE_QAS } = clientVibe

test('① 선지가 있는 모든 문항에 서버 정답이 있다', () => {
  const missing = Object.keys(VIBE_QUIZZES).filter((qaId) => !VIBE_QUIZ_ANSWERS[qaId])
  assert.deepEqual(missing, [], `서버 정답이 없는 문항: ${missing.join(', ')}`)
})

test('② 서버 정답에 대응하는 클라 선지가 있다 (유령 정답 금지)', () => {
  const orphan = Object.keys(VIBE_QUIZ_ANSWERS).filter((qaId) => !VIBE_QUIZZES[qaId])
  assert.deepEqual(orphan, [], `선지 없는 정답: ${orphan.join(', ')}`)
})

test('③ 문항 수가 양쪽에서 같다', () => {
  const drift: string[] = []
  for (const [qaId, set] of Object.entries(VIBE_QUIZZES)) {
    const answers = VIBE_QUIZ_ANSWERS[qaId]
    if (!answers) continue
    if (set.questions.length !== answers.answers.length) {
      drift.push(`${qaId}: 선지 ${set.questions.length}문 ≠ 정답 ${answers.answers.length}문`)
    }
  }
  assert.deepEqual(drift, [], drift.join(' / '))
})

test('④ correctIdx 가 선지 범위 안이고 해설이 비어 있지 않다', () => {
  const bad: string[] = []
  for (const [qaId, set] of Object.entries(VIBE_QUIZZES)) {
    const answers = VIBE_QUIZ_ANSWERS[qaId]
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

test('⑤ 학생에게 열린 모든 문항이 챗봇 컨텍스트에 등재돼 있다', () => {
  const registered = new Set(VIBE_QA_CONTEXTS.map((qa) => qa.id))
  const missing = VIBE_QAS.map((qa) => qa.id).filter((id) => !registered.has(id))
  assert.deepEqual(missing, [], `챗봇이 답할 근거가 없는 문항: ${missing.join(', ')}`)
})

test('⑥ 가드가 실패할 수 있는 계측인지 — 대조 대상이 비어 있지 않다', () => {
  assert.ok(Object.keys(VIBE_QUIZZES).length > 0, '클라 선지가 0건이면 위 검사는 전부 공짜로 통과한다')
  assert.ok(VIBE_QAS.length > 0, '문항이 0건이면 ⑤가 공짜로 통과한다')
})

// ⑦⑧ 정답 자리 쏠림 — 내용이 맞아도 «찍어서 맞히는» 퀴즈가 되는 자리.
// 2026-08-10 prod QA 실측: 126문항 중 A·B가 93%(C·D는 9문항뿐)였고, 11개 문은 3문항 정답이 전부 같은 자리였다.
// «B만 찍으면 60점»인 상태라 문항 하나하나가 맞는 것과 별개로 퀴즈 전체가 무력해진다.
test('⑦ 한 문의 문항들이 전부 같은 자리를 정답으로 두지 않는다', () => {
  const flat: string[] = []
  for (const [qaId, set] of Object.entries(VIBE_QUIZ_ANSWERS)) {
    if (!VIBE_QUIZZES[qaId]) continue
    const idxs = set.answers.map((a) => a.correctIdx)
    if (idxs.length > 1 && new Set(idxs).size === 1) {
      flat.push(`${qaId}(전부 ${String.fromCharCode(65 + idxs[0])})`)
    }
  }
  assert.deepEqual(flat, [], `정답이 한 자리에 몰린 문: ${flat.join(', ')}`)
})

test('⑧ 정답 자리가 한쪽으로 쏠리지 않는다 (어느 자리도 45% 미만)', () => {
  const dist = [0, 0, 0, 0]
  let total = 0
  for (const [qaId, set] of Object.entries(VIBE_QUIZ_ANSWERS)) {
    if (!VIBE_QUIZZES[qaId]) continue
    for (const a of set.answers) {
      if (a.correctIdx >= 0 && a.correctIdx < 4) dist[a.correctIdx] += 1
      total += 1
    }
  }
  assert.ok(total >= 30, `문항이 ${total}개뿐이면 이 검사는 의미가 없다 — 대조 대상 부족`)
  const worst = Math.max(...dist)
  const share = worst / total
  assert.ok(
    share < 0.45,
    `정답이 ${String.fromCharCode(65 + dist.indexOf(worst))} 자리에 ${Math.round(share * 100)}% 몰려 있다 ` +
      `(분포 ${dist.map((n, i) => `${String.fromCharCode(65 + i)}:${n}`).join(' ')}, 총 ${total}문항)`,
  )
})
