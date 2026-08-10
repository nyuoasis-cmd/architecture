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

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const clientQa: { CHAPTERS: { id: number; qaCount: number }[] } = require(
  path.resolve(ROOT, 'client', 'src', 'data', 'qa-stubs'),
)

const SESSION_ROUTE = 'server/src/routes/sessions.ts'
const MODAL = 'client/src/components/teacher/NewSessionModal.tsx'
const SURFACES = [MODAL, 'client/src/pages/LibraryPage.tsx', 'client/src/pages/LandingPage.tsx', 'client/src/pages/AboutPage.tsx']

test('세션 모달이 말하는 챕터 상한이 서버가 실제로 막는 값과 같다', () => {
  const schema = read(SESSION_ROUTE)
  const bound = schema.match(/chapter_ids:\s*z\s*\.array\(z\.number\(\)\.int\(\)\.min\(1\)\.max\((\d+)\)\)/)
  assert.ok(bound, `${SESSION_ROUTE} 에서 chapter_ids 상한을 못 읽었다 — 스키마 모양이 바뀌었으면 이 검사도 고쳐야 한다`)

  const declared = read(MODAL).match(/const SESSION_MAX_CHAPTER_ID = (\d+)/)
  assert.ok(declared, `${MODAL} 에서 SESSION_MAX_CHAPTER_ID 를 못 읽었다`)
  assert.equal(
    declared[1],
    bound[1],
    '교사에게 보여 주는 «1장~N장»이 서버가 실제로 허용하는 범위와 다르면, 없는 범위를 약속하는 것이다',
  )
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
