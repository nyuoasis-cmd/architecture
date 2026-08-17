// 🧭 체험 부품 배정의 계약 — «전 강에 체험이 있고, 부품은 지도(MAP)가 정한 그대로인가».
//
// 🚨 왜 있는가(2026-08-17 체험 재구조화): 체험 탭은 전 문항에 무조건 뜬다(learnLayoutContract 3).
//    탭이 무조건 뜬다는 것은, **부품 배정이 비거나 어긋나면 학생이 빈 체험을 연다**는 뜻이다 —
//    그리고 그건 그 문항을 연 학생만 겪는다. 그래서 배정표(experience.ts)를 지도
//    (docs/MAP-experience-23lessons-v1.md, jery 확정)와 기계로 대조한다.
import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const load = (rel: string) => require(path.resolve(ROOT, 'client', 'src', 'data', rel))

const { EXPERIENCE_KIND_BY_CHAPTER } = load('experience') as {
  EXPERIENCE_KIND_BY_CHAPTER: Record<number, string>
}
const { CHAPTERS, QA_STUBS } = load('qa-stubs') as {
  CHAPTERS: Array<{ id: number; lessonNo: number }>
  QA_STUBS: Array<{ id: string; chapterId: number }>
}
const { ALL_EXTRAS } = load('learn-extras') as {
  ALL_EXTRAS: Record<string, { tour?: unknown[] }>
}

// 🔑 지도(MAP v2)의 확정 배정 — 속 이름표(chNN) 기준. 여기 숫자를 고치는 것은 지도 개정이다.
const MAP_TERMINAL = [1, 5, 8, 11, 18, 19, 21]
const MAP_GITHUB = [3, 20, 22]
const MAP_COMPOSITE = [23]

test('1) 진열되는 전 강이 부품 하나씩을 갖는다 — 빠지면 그 강의 체험 탭이 빈다', () => {
  const assigned = new Set(Object.keys(EXPERIENCE_KIND_BY_CHAPTER).map(Number))
  const missing = CHAPTERS.filter((chapter) => !assigned.has(chapter.id))
  assert.deepEqual(
    missing.map((chapter) => `${chapter.lessonNo}강(ch${String(chapter.id).padStart(2, '0')})`),
    [],
    '부품 배정이 없는 강이 있다 — 체험 탭이 빈 채로 뜬다',
  )
  // 반대 방향 — 없는 장에 배정만 있으면 지도가 유령을 가리킨다.
  const real = new Set(CHAPTERS.map((chapter) => chapter.id))
  const ghosts = [...assigned].filter((id) => !real.has(id))
  assert.deepEqual(ghosts, [], `진열되지 않는 장에 부품이 배정돼 있다: ${ghosts.join(', ')}`)
})

test('2) 부품은 3종+복합뿐이다 — 새 부품은 지도 개정 없이 생기지 않는다 (SDD 결정 2)', () => {
  const allowed = new Set(['terminal', 'github', 'tour', 'composite'])
  const alien = Object.entries(EXPERIENCE_KIND_BY_CHAPTER).filter(([, kind]) => !allowed.has(kind))
  assert.deepEqual(alien, [], `지도에 없는 부품이 생겼다: ${alien.map(([id, kind]) => `ch${id}=${kind}`).join(', ')}`)
})

test('3) 배정이 지도(MAP v2, jery 확정)와 1:1 로 같다 — 구현 사정으로 배정을 바꾸지 않는다', () => {
  const byKind = (kind: string) =>
    Object.entries(EXPERIENCE_KIND_BY_CHAPTER)
      .filter(([, value]) => value === kind)
      .map(([id]) => Number(id))
      .sort((a, b) => a - b)
  assert.deepEqual(byKind('terminal'), MAP_TERMINAL, '터미널형 배정이 지도와 다르다')
  assert.deepEqual(byKind('github'), MAP_GITHUB, '유사 GitHub 배정이 지도와 다르다')
  assert.deepEqual(byKind('composite'), MAP_COMPOSITE, '복합(23강) 배정이 지도와 다르다')
  // 나머지 전부가 견학형 — 개수로 재확인 (23강 = 7 + 3 + 1 + 12).
  assert.equal(byKind('tour').length, 12, '견학형 강 수가 지도(12강)와 다르다')
})

test('4) 견학형 강은 전 문항에 견학 데이터가 있다 — 견학이 곧 그 강의 체험이므로 (SDD 결정 4)', () => {
  const tourChapters = new Set(
    Object.entries(EXPERIENCE_KIND_BY_CHAPTER)
      .filter(([, kind]) => kind === 'tour')
      .map(([id]) => Number(id)),
  )
  const empty = QA_STUBS.filter(
    (qa) => tourChapters.has(qa.chapterId) && !ALL_EXTRAS[qa.id]?.tour?.length,
  )
  assert.deepEqual(
    empty.map((qa) => qa.id),
    [],
    '견학형 강인데 견학 데이터가 없는 문항이 있다 — 그 문항의 체험 탭이 «준비 중»으로 빈다',
  )
})

test('5) 철거된 화면의 유령 참조가 학생 문구에 없다 — 없는 탭을 가리키는 안내는 고장으로 읽힌다', () => {
  // 🚨 왜 있는가: 골격 재편(E2-1)으로 ✋내 차례 탭·AI 챗봇 컬럼이 사라졌다. 본문·미션이
  //    「내 차례에 넣고 보내세요」「챗봇 탭을 연다」를 계속 말하면, 학생은 없는 탭을 찾다가
  //    «고장»으로 읽는다 — 그리고 그건 그 문항을 연 학생만 겪는다.
  // 🔑 금지하는 것은 **탭·화면을 가리키는 표현**이다. 개념으로서의 «챗봇»(Tay·Air Canada 사례,
  //    학생이 밖에서 쓰는 AI 챗봇)과 과거형 서술(«챗봇이 있던 시절»)은 참말이므로 남는다.
  const { readFileSync, readdirSync } = require('node:fs') as typeof import('node:fs')
  const dataDir = path.resolve(ROOT, 'client', 'src', 'data')
  const banned: Array<[RegExp, string]> = [
    [/✋/, '✋(내 차례 탭 표식)'],
    [/「내 차례」|«내 차례»\s*탭/, '「내 차례」 탭 지시'],
    [/챗봇 탭/, '챗봇 탭 지시'],
    [/이 앱의 챗봇[은이]/, '«이 앱의 챗봇» 현재형 서술'],
    [/🧪\s*「?실습」?\s*탭/, '실습 탭 지시(지금 이름은 🧭 체험)'],
  ]
  const offenders: string[] = []
  for (const file of readdirSync(dataDir).filter((name) => name.endsWith('.ts'))) {
    const source = readFileSync(path.join(dataDir, file), 'utf8')
    // 주석은 제외하지 않는다 — 데이터 파일의 주석도 다음 작성자가 «있는 화면»으로 오독한다.
    for (const [pattern, label] of banned) {
      if (pattern.test(source)) {
        // 철거 사실을 설명하는 문장(철거·이식 언급이 같은 파일에 있는 주석)만 허용한다.
        const lines = source.split('\n').filter((line) => pattern.test(line))
        const bad = lines.filter((line) => !/철거|이식|myTurnContract/.test(line))
        if (bad.length > 0) offenders.push(`${file}: ${label} — ${bad[0].trim().slice(0, 80)}`)
      }
    }
  }
  assert.deepEqual(offenders, [], `유령 참조가 남아 있다:\n  ${offenders.join('\n  ')}`)
})

test('6) 가드가 실패할 수 있는 계측인지 — 대조 대상이 0건이 아니다', () => {
  assert.ok(CHAPTERS.length >= 23, '진열 강이 23개 미만이면 위 대조가 반쪽이다')
  assert.ok(QA_STUBS.length > 100, '문항이 비면 4)·5) 가 공짜로 통과한다')
  // 음성 대조군 — 5) 의 금지 패턴이 실제로 잡는지.
  assert.ok(/챗봇 탭/.test('이 문의 💬 챗봇 탭을 연다'), '금지 패턴이 유령 참조를 못 잡는다')
})
