// 화면에 「세션」이라는 낱말이 다시 새어 나오지 않는가에 대한 계약.
//
// 🚨 왜 있는가: BUILDER-UX-POLICY §4 는 «세션 용어 노출»을 명시적으로 금지한다.
//    교사도 학생도 «세션»이라는 말을 쓰지 않는다 — 그들이 하는 것은 **수업**이다.
//    그런데 코드에서는 테이블·타입·라우트가 전부 session 이라, 화면 문구를 적을 때
//    손이 저절로 「세션」을 적는다. 2026-08-14 정합화 전까지 「내 세션 관리」·
//    「새 세션 만들기」·「이 세션을 삭제할까요?」가 그대로 교사에게 보이고 있었다.
//
// 🔑 그래서 막는 것은 «변수 이름»이 아니라 **주석을 걷어낸 뒤에도 남는 한글 「세션」**이다.
//    session·SessionCard 같은 영문 식별자는 얼마든지 써도 된다 — 화면에 안 나오니까.
//    주석에 적힌 사고 경위(«세션 라우트»)도 그대로 둔다 — 읽는 사람은 개발자다.
//
// 🚨 대상은 **교사·학생이 실제로 읽는 화면** 파일만이다. 교육 콘텐츠(demos/·data/)에는
//    TLS 세션 키처럼 «세션»이 정답인 문장이 있다. 그건 UI 용어가 아니라 지식이다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { stripComments } from './strip-comments'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

/** 교사·학생이 읽는 화면. 여기 남은 한글 「세션」은 전부 UI 문구다. */
const SCREENS = [
  'client/src/pages/TeacherDashboardPage.tsx',
  'client/src/pages/TeacherSessionPage.tsx',
  'client/src/pages/LibraryPage.tsx',
  'client/src/pages/LearnPage.tsx',
  'client/src/pages/JoinPage.tsx',
  'client/src/pages/ForbiddenPage.tsx',
  'client/src/pages/LandingPage.tsx',
  'client/src/pages/AboutPage.tsx',
  'client/src/components/teacher/SessionCard.tsx',
  'client/src/components/teacher/NewSessionModal.tsx',
  'client/src/components/teacher/ParticipantList.tsx',
  'client/src/components/learn/ContentPanel.tsx',
  'client/src/components/learn/TeacherExplainPanel.tsx',
]

test('1) 교사·학생 화면에 한글 「세션」이 없다 — 그들이 하는 것은 수업이다', () => {
  const offenders: string[] = []

  for (const file of SCREENS) {
    const body = stripComments(read(file))
    body.split('\n').forEach((line, index) => {
      if (line.includes('세션')) {
        offenders.push(`${file}:${index + 1} ${line.trim()}`)
      }
    })
  }

  assert.deepEqual(
    offenders,
    [],
    `화면 문구에 「세션」이 남아 있다(§4 금지) — 「수업」으로 적을 것:\n${offenders.join('\n')}`,
  )
})

test('2) 주석 제거기가 문자열 안의 // 를 삼키지 않는다 — 삼키면 1) 은 실패할 수 없는 계측이다', () => {
  // 음성 대조군 셋. 하나라도 어긋나면 1) 의 «0건»은 탐지가 죽어서 나온 0건이다.
  assert.equal(stripComments("const url = 'https://x/세션'").includes('세션'), true)
  assert.equal(stripComments('// 세션 라우트 주석').includes('세션'), false)
  assert.equal(stripComments('{/* 세션 블록 주석 */}').includes('세션'), false)
  assert.equal(stripComments('<p>세션</p> // 꼬리 주석').includes('세션'), true)
})

test('3) 대상 파일이 전부 실재한다 — 이름이 바뀌면 계약이 빈 목록을 보고 초록이 된다', () => {
  assert.ok(SCREENS.length >= 10, '화면 목록이 줄었다 — 지운 것이 아니라 이름이 바뀐 것은 아닌지')
  for (const file of SCREENS) {
    assert.doesNotThrow(() => read(file), `${file} 이 없다 — 목록을 고치지 않으면 그 화면은 검사 밖이다`)
  }
})
