// 견학(🚌)·사례(⚡) 데이터의 계약.
//
// 🔑 이 앱은 «extras 가 있는 장»만 탭형 형판으로 넘긴다(client/src/data/learn-extras.ts).
//    그래서 데이터가 틀어지면 **화면 구조 자체가 틀어진다** — 탭은 떴는데 안이 비거나,
//    형판은 바뀌었는데 보여 줄 게 없거나. 그 둘을 여기서 막는다.
//
// 🚨 이 파일이 지키는 가장 중요한 것: «형판을 쓰는 장에 실제로 내용이 있는가».
//    선언(어느 장이 형판을 쓴다)과 내용(그 장에 무엇이 있다)이 어긋나면 학생은 빈 탭을 본다.
import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const load = (rel: string) => require(path.resolve(ROOT, 'client', 'src', 'data', rel))

const { ALL_EXTRAS, EXTRAS_CHAPTER_IDS, chapterIdOfQaId, chapterUsesExtrasLayout } = load('learn-extras') as {
  ALL_EXTRAS: Record<string, Extras>
  EXTRAS_CHAPTER_IDS: ReadonlySet<number>
  chapterIdOfQaId: (qaId: string) => number
  chapterUsesExtrasLayout: (chapterId: number) => boolean
}
const { BASE_EXTRAS } = load('base-extras') as { BASE_EXTRAS: Record<string, Extras> }
const { QA_STUBS, CHAPTERS } = load('qa-stubs') as {
  QA_STUBS: Array<{ id: string; chapterId: number }>
  CHAPTERS: Array<{ id: number; qaCount: number }>
}

type Tour = {
  id: string
  badge: string
  title: string
  description: string
  observationPlaceholder: string
  feedback: string
  steps?: string[]
  reveals?: Array<{ label: string; answer: string }>
  link?: { label: string; url: string }
}
type Extras = {
  qaId: string
  incident?: { period: string; title: string; body: string }
  tour?: Tour[]
  myTurn?: unknown
}

const entries = Object.entries(ALL_EXTRAS)

test('① 형판을 쓰는 장은 실제로 보여 줄 내용이 있다 — 빈 탭 금지', () => {
  for (const chapterId of EXTRAS_CHAPTER_IDS) {
    const owned = entries.filter(([qaId]) => chapterIdOfQaId(qaId) === chapterId)
    assert.ok(owned.length > 0, `${chapterId}장이 형판을 쓴다고 선언됐는데 extras 가 하나도 없다`)
    const withContent = owned.filter(([, extras]) => extras.incident || extras.tour?.length || extras.myTurn)
    assert.ok(
      withContent.length > 0,
      `${chapterId}장의 extras 가 전부 껍데기다 — 형판만 바뀌고 학생에게 보여 줄 게 없다`,
    )
  }
})

test('② extras 의 키와 안에 적힌 qaId 가 같다 — 어긋나면 엉뚱한 문항에 붙는다', () => {
  for (const [key, extras] of entries) {
    assert.equal(extras.qaId, key, `등록 키(${key})와 내부 qaId(${extras.qaId})가 다르면 조회가 헛돈다`)
  }
})

test('③ extras 가 붙은 문항이 실제로 존재한다 — 없는 문항에 붙으면 영영 안 보인다', () => {
  const realQaIds = new Set(QA_STUBS.map((qa) => qa.id))
  const ghosts = entries.map(([key]) => key).filter((key) => !realQaIds.has(key))
  assert.deepEqual(ghosts, [], `이 extras 는 존재하지 않는 문항에 붙어 있다: ${ghosts.join(', ')}`)
})

test('④ 견학 미션에 «전달할 문장»(feedback)이 비어 있지 않다', () => {
  // 견학의 규칙 ③ — 전달하려는 문장은 숨기지 말고 feedback 에 대놓고 쓴다.
  // 비어 있으면 학생은 «뭘 보라는 건지» 확인만 하고 아무것도 못 얻고 나온다.
  const empty: string[] = []
  for (const [key, extras] of entries) {
    for (const tour of extras.tour ?? []) {
      if (!tour.feedback?.trim()) empty.push(`${key}/${tour.id}`)
      if (!tour.observationPlaceholder?.trim()) empty.push(`${key}/${tour.id} (관찰 칸 안내)`)
      if (!tour.description?.trim()) empty.push(`${key}/${tour.id} (설명)`)
    }
  }
  assert.deepEqual(empty, [], `견학 미션의 필수 문구가 비었다: ${empty.join(', ')}`)
})

// 🚨 이미 들어와 있는 예외 2건. 둘 다 «떠올려 적어 봐» 형태라 확인 수단 없이 회상만 시킨다.
//    조용히 규칙을 느슨하게 하는 대신 **이름을 적어** 남긴다 — 이 목록은 줄어들기만 해야 하고,
//    여기 없는 새 위반은 그 자리에서 빨개진다. (느슨한 규칙은 위반을 영영 안 보이게 만든다.)
const TOURS_WITHOUT_CONFIRMATION_STEP = new Set(['ch13_q02_t2', 'ch13_q03_t1'])

test('⑤ 견학 미션에 «눌러서 볼 것»이 하나는 있다 — 안내만 있고 확인할 게 없으면 견학이 아니다', () => {
  const bare: string[] = []
  for (const [key, extras] of entries) {
    for (const tour of extras.tour ?? []) {
      if (TOURS_WITHOUT_CONFIRMATION_STEP.has(tour.id)) continue
      if (!(tour.steps?.length || tour.reveals?.length || tour.link)) bare.push(`${key}/${tour.id}`)
    }
  }
  assert.deepEqual(bare, [], `이 미션들은 «무엇을 보게 될지» 말한 뒤 확인할 수단이 없다: ${bare.join(', ')}`)
})

test('⑤-b 예외 목록이 «이미 고쳐진 것»을 붙들고 있지 않다 — 죽은 예외는 규칙을 몰래 갉아먹는다', () => {
  const allTourIds = new Set(entries.flatMap(([, extras]) => (extras.tour ?? []).map((tour) => tour.id)))
  const stale = [...TOURS_WITHOUT_CONFIRMATION_STEP].filter((id) => !allTourIds.has(id))
  assert.deepEqual(stale, [], `이 예외는 대상이 사라졌다. 목록에서 지워라: ${stale.join(', ')}`)
})

test('⑥ 견학 미션 id 가 중복되지 않는다 — 겹치면 React 가 한쪽을 삼킨다', () => {
  const seen = new Map<string, string>()
  for (const [key, extras] of entries) {
    for (const tour of extras.tour ?? []) {
      const prev = seen.get(tour.id)
      assert.equal(prev, undefined, `견학 id «${tour.id}» 가 ${prev} 와 ${key} 에서 겹친다`)
      seen.set(tour.id, key)
    }
  }
})

test('⑦ 사례(⚡)의 세 칸이 모두 채워져 있다', () => {
  const broken: string[] = []
  for (const [key, extras] of entries) {
    if (!extras.incident) continue
    const { period, title, body } = extras.incident
    if (!period?.trim() || !title?.trim() || !body?.trim()) broken.push(key)
    // 너무 짧은 본문은 «있는 척»이다 — 한 줄짜리 사례는 학생에게 아무 장면도 안 남긴다.
    else if (body.trim().length < 80) broken.push(`${key} (본문 ${body.trim().length}자)`)
  }
  assert.deepEqual(broken, [], `사례가 비었거나 너무 짧다: ${broken.join(', ')}`)
})

test('⑧ 가드가 실패할 수 있는 계측인지 — 대조 대상이 0건이 아니다 (반공백)', () => {
  // 🚨 이게 없으면 위 검사 전부가 «순회할 것이 없어서» 공짜로 통과한다.
  assert.ok(entries.length > 0, 'extras 가 0건이면 ①~⑦ 이 전부 무의미하다')
  assert.ok(EXTRAS_CHAPTER_IDS.size > 0, '형판을 쓰는 장이 0개면 형판 전환 자체가 안 일어난 것이다')
  const tourCount = entries.reduce((sum, [, extras]) => sum + (extras.tour?.length ?? 0), 0)
  assert.ok(tourCount > 0, '견학이 0건이면 ④⑤⑥ 이 공짜로 통과한다')
  const incidentCount = entries.filter(([, extras]) => extras.incident).length
  assert.ok(incidentCount > 0, '사례가 0건이면 ⑦ 이 공짜로 통과한다')

  // 음성 대조군 — 없는 장·이상한 qaId 가 «형판을 쓴다»고 나오면 판정이 헛돈다.
  assert.equal(chapterUsesExtrasLayout(99), false, '없는 장이 형판을 쓴다고 하면 선언이 의미를 잃는다')
  assert.ok(Number.isNaN(chapterIdOfQaId('엉터리')), 'qaId 모양이 아닌 것이 어느 장에 붙으면 안 된다')
})

test('⑨ 기초 장을 형판으로 옮기면 그 장의 문항 «전부»를 덮는다 — 반만 옮기면 문항마다 화면이 달라진다', () => {
  // 🚨 형판은 장 단위로 걸린다. 그 장의 문항 중 일부만 extras 가 있으면, 나머지 문항은
  //    본문·퀴즈·챗봇 탭만 있는 «옅은» 화면이 된다. 화면이 깨지지는 않지만,
  //    학생 입장에서는 문항을 넘길 때마다 있던 탭이 사라진다.
  //
  // 🔑 이 검사는 **이번 에픽이 옮기는 기초 장(base-extras.ts 등재분)** 에만 건다.
  //    바이브코딩 장에는 extras 없는 문항이 이미 13개 있고(12·13·15·16·17장),
  //    그건 이 에픽의 범위가 아니다 — 지금 같이 묶으면 1장 PR 이 남의 장 13개를 인질로 잡는다.
  //    (그 13개는 아침 보고에 «알려진 공백»으로 올린다.)
  const baseChapterIds = new Set(Object.keys(BASE_EXTRAS).map(chapterIdOfQaId))
  const partial: string[] = []
  for (const chapterId of baseChapterIds) {
    const chapterQaIds = QA_STUBS.filter((qa) => qa.chapterId === chapterId).map((qa) => qa.id)
    const missing = chapterQaIds.filter((qaId) => !ALL_EXTRAS[qaId])
    if (missing.length > 0) partial.push(`${chapterId}장: ${missing.join(', ')}`)
  }
  assert.deepEqual(
    partial,
    [],
    `형판을 쓰는 장인데 extras 가 없는 문항이 있다 — 그 문항은 반쪽 화면이 된다: ${partial.join(' / ')}`,
  )
})

test('⑩ 장 문항 수 선언이 실제 문항 수와 같다 — 손으로 적은 숫자는 콘텐츠를 안 따라온다', () => {
  const mismatched: string[] = []
  for (const chapter of CHAPTERS) {
    const actual = QA_STUBS.filter((qa) => qa.chapterId === chapter.id).length
    if (actual !== chapter.qaCount) mismatched.push(`${chapter.id}장: 선언 ${chapter.qaCount} ≠ 실제 ${actual}`)
  }
  assert.deepEqual(mismatched, [], `장 문항 수 선언이 어긋난다: ${mismatched.join(' / ')}`)
})
