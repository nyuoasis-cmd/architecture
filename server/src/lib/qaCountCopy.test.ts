// 학생·교사에게 보여 주는 «문항 수»가 실제 데이터와 어긋나지 않는지.
//
// 🚨 2026-08-11 실측: «71개 Q&A» 가 랜딩·라이브러리·세션 생성 모달·소개 4곳에 손으로 적혀 있었고,
//    실제 1~10장 문항 수는 64개였다. 손으로 적은 숫자는 콘텐츠가 늘고 줄어도 안 따라오고,
//    아무도 안 틀렸다고 말해 주지 않는다 — 교사는 세션을 만들며 그 숫자를 읽는다.
//
// 🚨 세션 상한: 서버가 chapter_ids 를 1..N 으로 막는다. 11장 이후(바이브코딩)는 수업 세션으로 열 수 없고
//    라이브러리 자습으로만 닿는다. 모달 문구가 그 상한과 어긋나면 교사에게 없는 범위를 약속하게 된다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import { ALL_CHAPTER_IDS, MAX_CHAPTER_ID, QA_CONTEXTS } from '../data/chapter-content'
import { HAND_LISTED_LEGACY, getQaChapterId } from '../data/qa-meta'
import { createSessionSchema } from '../routes/sessions'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const clientQa: { CHAPTERS: { id: number; qaCount: number }[] } = require(
  path.resolve(ROOT, 'client', 'src', 'data', 'qa-stubs'),
)

const SESSION_ROUTE = 'server/src/routes/sessions.ts'
const MODAL = 'client/src/components/teacher/NewSessionModal.tsx'

const sampleSession = (chapterIds: number[]) => ({
  name: '테스트 수업',
  mode: 'learn' as const,
  chapter_ids: chapterIds,
  max_participants: 100 as const,
})
const SURFACES = [MODAL, 'client/src/pages/LibraryPage.tsx', 'client/src/pages/LandingPage.tsx', 'client/src/pages/AboutPage.tsx']

// 🚨 이 검사는 예전에 sessions.ts 를 **정규식으로 읽어** 상한을 집어냈다. 그러면 스키마 모양을
//    바꾸는 순간 「못 읽었다」로 죽고, 더 나쁘게는 정규식이 우연히 맞으면 실제 동작과 무관한 숫자를
//    대조하게 된다. 이제 스키마를 **평가해서** 실제로 무엇이 통과·거절되는지로 판정한다.
test('교사에게 보여 주는 챕터 범위 = 서버가 실제로 통과시키는 범위', () => {
  // 서버가 실제로 받아 주는 장 = 스키마에 넣어 보고 결과로 확인한다(선언 읽기 아님).
  const accepted = ALL_CHAPTER_IDS.filter((id) => createSessionSchema.safeParse(sampleSession([id])).success)
  assert.deepEqual(accepted, ALL_CHAPTER_IDS, '등록부에 있는 장인데 세션에 못 담기면, 그 장 콘텐츠는 교실에서 못 쓰인다')

  // 등록부에 없는 장은 거절돼야 한다 — 안 그러면 위 검사가 «전부 통과»로 공짜가 된다(음성 대조군).
  for (const bogus of [0, -1, MAX_CHAPTER_ID + 1, 999]) {
    assert.equal(
      createSessionSchema.safeParse(sampleSession([bogus])).success,
      false,
      `없는 장(${bogus})이 통과하면 상한 검사 자체가 의미를 잃는다`,
    )
  }

  // 교사 화면이 말하는 상한이 그 실제 범위와 같은가.
  const declared = read(MODAL).match(/const SESSION_MAX_CHAPTER_ID = Math\.max/)
  assert.ok(declared, `${MODAL} 의 상한이 손으로 적힌 숫자로 돌아갔다 — 데이터에서 계산해야 한다`)
  assert.equal(
    Math.max(...clientQa.CHAPTERS.map((chapter) => chapter.id)),
    MAX_CHAPTER_ID,
    '교사에게 보여 주는 «1장~N장»이 서버가 실제로 허용하는 범위와 다르면, 없는 범위를 약속하거나 있는 범위를 숨기는 것이다',
  )
})

test('모든 문항이 자기 장을 안다 — 손나열이 콘텐츠를 못 따라오면 교사 해설이 조용히 죽는다', () => {
  const orphans = QA_CONTEXTS.filter((qa) => getQaChapterId(qa.id) === null).map((qa) => qa.id)
  assert.deepEqual(orphans, [], `이 문항들은 chapterId 를 못 찾아 교사 해설이 404 가 된다: ${orphans.join(', ')}`)

  // 음성 대조군 — 없는 문항까지 «안다»고 하면 위 검사는 아무것도 못 잡는다.
  assert.equal(getQaChapterId('ch99_q99'), null, '없는 문항에 장을 붙여 주면 조회 자체가 무의미하다')

  // 파생이 옛 손목록을 덮는가(회귀 방어). 손목록은 얼어붙은 대조군이다.
  for (const legacy of HAND_LISTED_LEGACY) {
    assert.equal(getQaChapterId(legacy.qaId), legacy.chapterId, `${legacy.qaId} 가 파생 목록에서 빠지거나 장이 달라졌다`)
  }
  assert.ok(QA_CONTEXTS.length > HAND_LISTED_LEGACY.length, '파생 목록이 손목록보다 작으면 콘텐츠를 잃은 것이다')
})

test('학생·교사 화면에 문항 수가 손으로 박혀 있지 않다', () => {
  const offenders: string[] = []
  for (const rel of SURFACES) {
    const source = read(rel)
    for (const m of source.matchAll(/(\d+)\s*개?\s*(?:Q&A|문항)/g)) {
      offenders.push(`${rel}: «${m[0].trim()}»`)
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `문항 수는 데이터에서 계산해야 한다 — 콘텐츠가 바뀌어도 손으로 적은 숫자는 안 따라온다: ${offenders.join(' / ')}`,
  )
})

test('가드가 실패할 수 있는 계측인지 — 대조 대상 파일이 실제로 읽히고 비어 있지 않다', () => {
  for (const rel of [SESSION_ROUTE, ...SURFACES]) {
    assert.ok(read(rel).length > 200, `${rel} 이 비어 있으면 위 검사들이 공짜로 통과한다`)
  }
  assert.ok(clientQa.CHAPTERS.length > 0, '챕터가 0개면 계산식 자체가 의미 없다')
})

// ── 학생이 닿는 범위 ────────────────────────────────────────────────
// 🚨 jery 결정(2026-08-11): **학생도 모든 챕터에 접근한다.**
//    예전에는 랜딩이 `LANDING_MAX_CHAPTER_ID = 10` 으로 잘라 «10개 챕터»라 말했는데, 그 근거였던
//    서버 상한은 #142 로 이미 풀린 뒤였다 — 사문이 된 근거가 학생에게 앱을 작아 보이게 했다.
//    🔑 이런 상한은 «지운다»고 끝나지 않는다. 다시 생기면 아무도 모른다. 그래서 계약으로 막는다.
test('학생이 보는 화면에 챕터 범위를 자르는 상한이 없다 — 학생은 전 챕터에 닿는다', () => {
  const STUDENT_SURFACES = ['client/src/pages/LandingPage.tsx', 'client/src/pages/LibraryPage.tsx']
  const offenders: string[] = []
  for (const rel of STUDENT_SURFACES) {
    for (const m of read(rel).matchAll(/MAX_CHAPTER_ID\s*=\s*(\d+)/g)) {
      offenders.push(`${rel}: «${m[0]}»`)
    }
    // `chapter.id <= 10` 처럼 숫자로 직접 자르는 것도 같은 일이다.
    for (const m of read(rel).matchAll(/chapter\.id\s*[<>]=?\s*(\d+)/g)) {
      offenders.push(`${rel}: «${m[0]}»`)
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `학생 화면에 챕터 상한이 손으로 박혔다 — 등록부(CHAPTERS)에서 전체를 세야 한다: ${offenders.join(' / ')}`,
  )

  // 음성 대조군 — 이 검사가 «무엇이든 통과»가 아닌지. 상한이 박힌 문자열은 실제로 잡혀야 한다.
  const probe = 'const LANDING_MAX_CHAPTER_ID = 10;'
  assert.equal(
    /MAX_CHAPTER_ID\s*=\s*(\d+)/.test(probe),
    true,
    '탐지 정규식이 상한 선언을 못 잡으면 이 검사는 실패할 수 없는 계측이다',
  )
})

test('랜딩이 말하는 챕터·문항 수 = 등록부 전체', () => {
  const totalQa = clientQa.CHAPTERS.reduce((sum, chapter) => sum + chapter.qaCount, 0)
  const landing = read('client/src/pages/LandingPage.tsx')
  assert.ok(
    landing.includes('const LANDING_CHAPTERS = CHAPTERS;'),
    '랜딩이 등록부 전체가 아닌 부분집합을 세고 있다 — 학생에게 앱이 실제보다 작아 보인다',
  )
  console.log(`[학생 접근] 랜딩·라이브러리 = ${clientQa.CHAPTERS.length}장 ${totalQa}문항 (전 챕터 개방)`)
})
