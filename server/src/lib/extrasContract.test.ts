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

import { QA_CONTEXTS } from '../data/chapter-content'

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
  QA_STUBS: Array<{ id: string; chapterId: number; order: number }>
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

// 🚨 확인 수단 없이 «떠올려 적어 봐»만 시키는 미션의 예외 목록 — **지금은 비어 있다.**
//    시작값은 2건(`ch13_q02_t2` · `ch13_q03_t1`)이었고, 13장을 채우는 PR 에서 두 미션에
//    실제로 눌러 볼 것을 붙여 목록을 비웠다. 이 목록은 줄어들기만 한다 —
//    비었다는 것은 «지금 규칙에 예외가 하나도 없다»는 뜻이고, 새 위반은 그 자리에서 빨개진다.
//    (느슨한 규칙은 위반을 영영 안 보이게 만든다. 예외를 다시 늘려야 한다면 이유를 여기 적을 것.)
const TOURS_WITHOUT_CONFIRMATION_STEP = new Set<string>([])

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
  const allTours = new Map(entries.flatMap(([, extras]) => (extras.tour ?? []).map((tour) => [tour.id, tour] as const)))
  const stale = [...TOURS_WITHOUT_CONFIRMATION_STEP].filter((id) => !allTours.has(id))
  assert.deepEqual(stale, [], `이 예외는 대상이 사라졌다. 목록에서 지워라: ${stale.join(', ')}`)

  // 🚨 «대상이 사라졌는가»만 보면 절반이다. 미션이 그대로 있으면서 **이미 확인 수단을 갖췄는데도**
  //    예외에 남아 있는 경우를 아무도 안 잡았다(변이 시험에서 초록으로 통과했다).
  //    그러면 고쳐 놓은 미션이 조용히 규칙 밖으로 빠져나가고, 나중에 누가 확인 수단을 도로
  //    지워도 빨개지지 않는다 — 예외 목록이 «면제권»이 되는 순간이다.
  const alreadyFixed = [...TOURS_WITHOUT_CONFIRMATION_STEP].filter((id) => {
    const tour = allTours.get(id)
    return tour ? Boolean(tour.steps?.length || tour.reveals?.length || tour.link) : false
  })
  assert.deepEqual(
    alreadyFixed,
    [],
    `이 미션들은 이미 확인 수단이 있다. 예외에서 지워야 규칙이 다시 이들을 지킨다: ${alreadyFixed.join(', ')}`,
  )
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

  // 🚨 양성 대조군 — 이게 없으면 chapterUsesExtrasLayout 이 **항상 false** 를 줘도 초록이다.
  //    (실제로 그 변이가 이 파일을 통과했다. «없는 장은 false» 만 보면 «있는 장은 true» 를 아무도 안 본다.)
  //    그러면 형판 전환이 통째로 죽고 1장은 옛 3컬럼 화면에 남는데, 검사는 아무 말도 안 한다.
  for (const chapterId of EXTRAS_CHAPTER_IDS) {
    assert.equal(
      chapterUsesExtrasLayout(chapterId),
      true,
      `${chapterId}장에 extras 가 있는데 형판을 안 쓴다고 하면, 만든 콘텐츠가 화면에 안 나온다`,
    )
  }

  // 음성 대조군 — 없는 장·이상한 qaId 가 «형판을 쓴다»고 나오면 판정이 헛돈다.
  assert.equal(chapterUsesExtrasLayout(99), false, '없는 장이 형판을 쓴다고 하면 선언이 의미를 잃는다')
  assert.ok(Number.isNaN(chapterIdOfQaId('엉터리')), 'qaId 모양이 아닌 것이 어느 장에 붙으면 안 된다')
})

// 🚨 아직 문항 전부를 덮지 못한 장. **줄어들기만 해야 하는 목록**이다 —
//    장 하나를 채우는 PR 이 여기서 그 번호를 지운다. 목록에 없는 장이 반쪽이면 그 자리에서 빨개진다.
//    (2026-08-11 시작값 = 13·15·16·17장. 12장·13장은 각각의 PR 에서 지웠다.)
const CHAPTERS_NOT_YET_FULLY_COVERED = new Set([15, 16, 17])

test('⑨ 형판을 쓰는 장은 그 장의 문항 «전부»를 덮는다 — 반만 옮기면 문항마다 화면이 달라진다', () => {
  // 🚨 형판은 장 단위로 걸린다. 그 장의 문항 중 일부만 extras 가 있으면, 나머지 문항은
  //    본문·퀴즈·챗봇 탭만 있는 «옅은» 화면이 된다. 화면이 깨지지는 않지만,
  //    학생 입장에서는 문항을 넘길 때마다 있던 탭이 사라진다.
  //
  // 🔑 예전에는 이 검사가 **기초 장(base-extras.ts 등재분)에만** 걸렸다. 그래서 바이브코딩 장의
  //    공백 13문항이 아무 검사도 받지 않은 채 몇 주를 흘렀다. 지금은 **모든 장**에 걸고,
  //    아직 못 채운 장만 위 목록으로 예외를 둔다 — 예외는 이름이 적혀 있어 눈에 보이고, 줄어든다.
  const partial: string[] = []
  for (const chapterId of EXTRAS_CHAPTER_IDS) {
    if (CHAPTERS_NOT_YET_FULLY_COVERED.has(chapterId)) continue
    const chapterQaIds = QA_STUBS.filter((qa) => qa.chapterId === chapterId).map((qa) => qa.id)
    // 🔑 «extras 가 있는가»가 아니라 «🚌 견학이 있는가»로 잰다. extras 껍데기만 있고 견학이 없으면
    //    학생 화면에서는 탭이 그냥 사라진다 — 사용자가 겪는 결함은 똑같다.
    const missing = chapterQaIds.filter((qaId) => !ALL_EXTRAS[qaId]?.tour?.length)
    if (missing.length > 0) partial.push(`${chapterId}장: ${missing.join(', ')}`)
  }
  assert.deepEqual(
    partial,
    [],
    `형판을 쓰는 장인데 견학이 없는 문항이 있다 — 그 문항만 탭이 사라진다: ${partial.join(' / ')}`,
  )
})

test('⑨-b 예외 목록이 «이미 채워진 장»을 붙들고 있지 않다 — 죽은 예외는 검사를 몰래 갉아먹는다', () => {
  // 🚨 목록에 이름이 남아 있으면 그 장은 앞으로도 영영 검사받지 않는다. 채운 PR 이 지우는 것을
  //    잊으면, 다음 사람이 그 장을 반쪽으로 되돌려도 아무도 안 알려 준다.
  const stale = [...CHAPTERS_NOT_YET_FULLY_COVERED].filter((chapterId) => {
    const chapterQaIds = QA_STUBS.filter((qa) => qa.chapterId === chapterId).map((qa) => qa.id)
    return chapterQaIds.length > 0 && chapterQaIds.every((qaId) => ALL_EXTRAS[qaId]?.tour?.length)
  })
  assert.deepEqual(stale, [], `이 장들은 이미 다 채워졌다. 예외 목록에서 지워라: ${stale.join(', ')}장`)

  // 존재하지 않는 장 번호가 목록에 남아 있어도 같은 종류의 죽은 예외다.
  const unknown = [...CHAPTERS_NOT_YET_FULLY_COVERED].filter(
    (chapterId) => !CHAPTERS.some((chapter) => chapter.id === chapterId),
  )
  assert.deepEqual(unknown, [], `없는 장이 예외 목록에 있다: ${unknown.join(', ')}`)

  // 🚨 양성 대조군 — 기초 장이 형판 대상에서 빠지면 ⑨ 가 아무 장도 안 돌 수 있다.
  const baseChapterIds = [...new Set(Object.keys(BASE_EXTRAS).map(chapterIdOfQaId))]
  assert.ok(baseChapterIds.length > 0, 'BASE_EXTRAS 가 비면 ⑨ 의 대상이 통째로 사라진다')
  for (const chapterId of baseChapterIds) {
    assert.ok(EXTRAS_CHAPTER_IDS.has(chapterId), `${chapterId}장이 형판 대상에서 빠졌다 — ⑨ 가 그 장을 안 본다`)
    assert.ok(!CHAPTERS_NOT_YET_FULLY_COVERED.has(chapterId), `기초 ${chapterId}장은 예외 대상이 아니다`)
  }
})

test('⑩ 장 문항 수 선언이 실제 문항 수와 같다 — 손으로 적은 숫자는 콘텐츠를 안 따라온다', () => {
  const mismatched: string[] = []
  for (const chapter of CHAPTERS) {
    const actual = QA_STUBS.filter((qa) => qa.chapterId === chapter.id).length
    if (actual !== chapter.qaCount) mismatched.push(`${chapter.id}장: 선언 ${chapter.qaCount} ≠ 실제 ${actual}`)
  }
  assert.deepEqual(mismatched, [], `장 문항 수 선언이 어긋난다: ${mismatched.join(' / ')}`)
})

test('⑪ 각 장의 문항 순번이 1..N 으로 빈틈·중복 없이 이어진다', () => {
  // 🚨 order 는 표시용 숫자가 아니라 **이동에 쓰인다** — 이전/다음 버튼이 `chapterQas[order - 2]`,
  //    `chapterQas[order]` 로 이웃을 집는다(GuidePanel). 그래서 순번이 겹치거나 비면
  //    «다음»이 자기 자신으로 가거나 문항 하나를 건너뛴다. 화면은 멀쩡해 보이고 아무도 안 알려 준다.
  // 🔑 2026-08-11 ch06_q03 을 채우며 q04~q10 순번을 한 칸씩 밀었다. 그때 밀다 만 상태를
  //    잡아 줄 것이 아무것도 없었다(변이 시험에서 초록으로 통과했다).
  const broken: string[] = []
  const byChapter = new Map<number, number[]>()
  for (const qa of QA_STUBS) {
    const list = byChapter.get(qa.chapterId) ?? []
    list.push(qa.order)
    byChapter.set(qa.chapterId, list)
  }
  for (const [chapterId, orders] of byChapter) {
    const sorted = [...orders].sort((a, b) => a - b)
    const expected = Array.from({ length: sorted.length }, (_, idx) => idx + 1)
    if (JSON.stringify(sorted) !== JSON.stringify(expected)) {
      broken.push(`${chapterId}장: ${sorted.join(',')} (기대 ${expected.join(',')})`)
    }
  }
  assert.deepEqual(broken, [], `순번이 어긋나면 이전/다음 이동이 조용히 어긋난다: ${broken.join(' / ')}`)

  assert.ok(byChapter.size > 0, '장이 0개면 이 검사가 공짜로 통과한다')
})

test('⑫ 학생에게 열린 모든 문항이 챗봇 맥락에 등재돼 있다', () => {
  // 🚨 챗봇은 문항 맥락을 서버에서 찾는다. 없으면 그 문항 챗봇은 404 로 죽는다 —
  //    화면은 멀쩡하고, 그 문항을 여는 학생만 «답이 안 와요»를 겪는다.
  // 🔑 바이브코딩 장에는 같은 검사가 있었지만(vibeQuizContract ⑤) **기초 1~10장에는 없었다.**
  //    실제로 ch06_q03 은 서버에만 있고 학생 화면엔 없는 채로 남아 있었고, 아무것도 빨개지지 않았다.
  const contextIds = new Set(QA_CONTEXTS.map((qa) => qa.id))
  const missing = QA_STUBS.filter((qa) => !contextIds.has(qa.id)).map((qa) => qa.id)
  assert.deepEqual(missing, [], `이 문항들은 챗봇이 맥락을 못 찾는다(404): ${missing.join(', ')}`)

  // 반대 방향 — 서버에만 있고 학생은 못 여는 문항. 콘텐츠를 써 놓고 안 내보내는 상태다.
  const stubIds = new Set(QA_STUBS.map((qa) => qa.id))
  const unreachable = QA_CONTEXTS.filter((qa) => !stubIds.has(qa.id)).map((qa) => qa.id)
  assert.deepEqual(unreachable, [], `서버에는 있는데 학생 화면에 없는 문항: ${unreachable.join(', ')}`)

  // 반공백 — 양쪽이 다 비면 위 둘이 공짜로 통과한다.
  assert.ok(contextIds.size > 0 && stubIds.size > 0, '양쪽 중 하나가 0건이면 이 검사는 의미가 없다')
})
