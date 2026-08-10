// 1~10장 퀴즈 «정답 자리» 재배치 + 장별 파일로 분리 — 1회 생성기(결정적, 다시 돌려도 같은 결과).
//
// 왜: 2026-08-10 실측에서 1~10장 195개 퀴즈의 정답이 A 45.1% · B 40.5% · C 13.3% · D 1.0% 로 쏠려 있었고,
//     한 문의 세 문항 정답이 전부 같은 자리인 문이 13건이었다(9장은 6문 중 5문이 전부 A).
//     «A만 찍으면 만점»인 상태라 문항 하나하나가 맞는 것과 별개로 퀴즈 전체가 무력해진다.
//     11~17장(바이브코딩)에서 같은 결함을 PR #136 으로 이미 고쳤고, 이건 그 처리를 기존 장으로 넓히는 것.
//
// 🔑 소스 텍스트를 정규식으로 뜯지 않는다 — ch03~05 퀴즈가 createQuizRecord 안에 인라인으로 살아서,
//    정규식 집계는 «29문항이 준비중»이라는 없는 결함을 만들어 냈다. 평가된 런타임 데이터에서 생성한다.
//
// 자리 배정: 정렬된 문항 목록에서 k번째 문의 i번째 퀴즈 → (k + i) % 선지수.
//    한 문 안에서는 서로 다른 자리가 되고(⑦), 문이 넘어갈 때마다 한 칸씩 돌아 전체가 고르게 퍼진다(⑧).
// 선지 텍스트는 한 글자도 바꾸지 않는다 — 정답 선지와 목표 자리의 선지를 맞바꿀 뿐이다.
//
// 실행: node --import tsx scripts/rebalance-base-quiz.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const { QUIZZES } = require(path.join(ROOT, 'client/src/data/quizzes'))
const { QUIZ_ANSWERS } = require(path.join(ROOT, 'server/src/data/quiz-answers'))

const isBase = (qaId) => Number(qaId.slice(2, 4)) <= 10
const baseIds = Object.keys(QUIZZES).filter(isBase).sort()

const lit = (s) => JSON.stringify(s)

/** 장별로 모아 담는다. */
const byChapter = new Map()
for (const qaId of baseIds) byChapter.set(qaId.slice(0, 4), [])

let moved = 0
for (const [k, qaId] of baseIds.entries()) {
  const set = QUIZZES[qaId]
  const answerSet = QUIZ_ANSWERS[qaId]
  if (!set || !answerSet) throw new Error(`${qaId}: 선지/정답 한쪽이 없다 — 생성 전에 계약이 깨져 있다`)
  if (set.questions.length !== answerSet.answers.length) {
    throw new Error(`${qaId}: 선지 ${set.questions.length}문 ≠ 정답 ${answerSet.answers.length}문`)
  }

  const questions = []
  const answers = []
  set.questions.forEach((question, i) => {
    const options = [...question.options]
    const from = answerSet.answers[i].correctIdx
    if (!Number.isInteger(from) || from < 0 || from >= options.length) {
      throw new Error(`${qaId}[${i}]: correctIdx=${from} 가 선지 ${options.length}개 범위 밖`)
    }
    const to = (k + i) % options.length
    if (to !== from) {
      ;[options[from], options[to]] = [options[to], options[from]]
      moved += 1
    }
    questions.push({ question: question.question, options })
    answers.push({ correctIdx: to, explanation: answerSet.answers[i].explanation })
  })

  byChapter.get(qaId.slice(0, 4)).push({ qaId, questions, answers })
}

mkdirSync(path.join(ROOT, 'client/src/data'), { recursive: true })

const HEADER_CLIENT = (ch) => `import type { QuizSet } from './quizzes';

// ${ch}장 학생 선지 — scripts/rebalance-base-quiz.mjs 가 생성했다(정답 자리 재배치, 선지 텍스트는 원본 그대로).
// 🚨 정답·해설은 여기 두지 않는다(server/src/data/base-quiz-answers-${ch}.ts). 학생이 소스에서 답을 볼 수 없게.
// 선지 순서를 바꾸면 서버 correctIdx 도 같이 고쳐야 한다 — baseQuizContract.test.ts 가 어긋남을 잡는다.
`

const HEADER_SERVER = (ch) => `import type { QuizAnswerSet } from './quiz-answers';

// ${ch}장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
`

for (const [ch, items] of byChapter) {
  const constName = ch.toUpperCase().replace('CH', 'CH')
  const clientBody = items
    .map(
      (item) => `  ${item.qaId}: {
    qaId: ${lit(item.qaId)},
    questions: [
${item.questions
  .map(
    (q) => `      {
        question: ${lit(q.question)},
        options: [
${q.options.map((o) => `          ${lit(o)},`).join('\n')}
        ],
      },`,
  )
  .join('\n')}
    ],
  },`,
    )
    .join('\n')

  writeFileSync(
    path.join(ROOT, `client/src/data/base-quiz-${ch}.ts`),
    `${HEADER_CLIENT(ch)}export const ${constName}_QUIZZES: Record<string, QuizSet> = {\n${clientBody}\n};\n`,
  )

  const serverBody = items
    .map(
      (item) => `  ${item.qaId}: {
    qaId: ${lit(item.qaId)},
    answers: [
${item.answers
  .map(
    (a) => `      {
        correctIdx: ${a.correctIdx},
        explanation: ${lit(a.explanation)},
      },`,
  )
  .join('\n')}
    ],
  },`,
    )
    .join('\n')

  writeFileSync(
    path.join(ROOT, `server/src/data/base-quiz-answers-${ch}.ts`),
    `${HEADER_SERVER(ch)}export const ${constName}_ANSWERS: Record<string, QuizAnswerSet> = {\n${serverBody}\n};\n`,
  )
}

// ─── 두 진입 파일도 생성기가 함께 쓴다 — 장별 파일과 목록이 어긋나면 그 자체가 결함이라 손으로 안 적는다 ───
const chapters = [...byChapter.keys()].sort()
const upper = (ch) => ch.toUpperCase()

writeFileSync(
  path.join(ROOT, 'client/src/data/quizzes.ts'),
  `${chapters.map((ch) => `import { ${upper(ch)}_QUIZZES } from './base-quiz-${ch}';`).join('\n')}
import { VIBE_QUIZZES } from './vibe-stubs';

export type QuizQuestion = {
  question: string;
  options: string[];
};

export type QuizSet = {
  qaId: string;
  questions: QuizQuestion[];
};

// 1~10장은 장별 파일(base-quiz-chNN.ts), 11~17장은 vibe-stubs 에서 온다.
// 예전에는 이 파일 안에 장별 Record + createQuizRecord 인라인 분기 + «준비중» 자리표시자가 뒤섞여 있었다.
// 인라인 분기 탓에 소스를 훑는 집계가 ch03~05 를 «준비중»으로 잘못 세는 일이 있었고,
// 자리표시자 경로는 도달하는 문항이 하나도 없는 죽은 코드였다 — 둘 다 걷어냈다.
export const QUIZZES: Record<string, QuizSet> = {
${chapters.map((ch) => `  ...${upper(ch)}_QUIZZES,`).join('\n')}
  ...VIBE_QUIZZES,
};
`,
)

writeFileSync(
  path.join(ROOT, 'server/src/data/quiz-answers.ts'),
  `${chapters.map((ch) => `import { ${upper(ch)}_ANSWERS } from './base-quiz-answers-${ch}';`).join('\n')}
import { VIBE_QUIZ_ANSWERS } from './vibe-quiz-answers';

export type QuizAnswer = {
  correctIdx: number;
  explanation: string;
};

export type QuizAnswerSet = {
  qaId: string;
  answers: QuizAnswer[];
};

// 1~10장은 장별 파일(base-quiz-answers-chNN.ts), 11~17장은 vibe-quiz-answers 에서 온다.
// 정답 자리는 scripts/rebalance-base-quiz.mjs 가 흩어 놓았다 — 손으로 고칠 때도 한 문에 같은 자리를 몰지 말 것.
export const QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
${chapters.map((ch) => `  ...${upper(ch)}_ANSWERS,`).join('\n')}
  ...VIBE_QUIZ_ANSWERS,
};
`,
)

const dist = [0, 0, 0, 0]
let total = 0
for (const items of byChapter.values()) {
  for (const item of items) {
    for (const a of item.answers) {
      dist[a.correctIdx] += 1
      total += 1
    }
  }
}
console.log(`문항 ${baseIds.length} · 퀴즈 ${total} · 자리 옮긴 퀴즈 ${moved}`)
console.log(
  '재배치 후 분포 ' +
    dist.map((c, i) => `${String.fromCharCode(65 + i)}:${c}(${((100 * c) / total).toFixed(1)}%)`).join(' '),
)
