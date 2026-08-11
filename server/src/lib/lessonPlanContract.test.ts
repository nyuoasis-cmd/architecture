// 교안(1장 = 1차시) 데이터의 계약.
//
// 🔑 교안은 **앱을 가리키는 문서**다. 교사가 수업 중에 보고 따라가므로, 교안이 가리키는 것이
//    앱에 없으면 교사는 학생 앞에서 헛짚는다. 그래서 여기서 막는 것은 «문장이 예쁜가»가 아니라
//    «가리킨 것이 실제로 있는가»다.
//
// 🚨 이 파일이 지키는 가장 중요한 것: 🚌 견학 칸은 진짜 견학이 있는 문항을, ✋「내 차례」 칸은
//    진짜 AI 판정이 붙은 문항을 가리켜야 한다. 「내 차례」는 12~17장에만 있는데 교안이 아무 장에나
//    그 칸을 적으면, 학생에게 없는 탭을 열라고 시키게 된다.
//
// 🚨 예외 목록을 두지 않는다. «아직 교안이 없는 장»은 등록부에 없으면 그만이고, 등록부에 있으면
//    완전해야 한다. 목록으로 면제해 주기 시작하면 그 목록이 면제권이 된다(⑤-b 사고).
import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const load = (rel: string) => require(path.resolve(ROOT, 'client', 'src', 'data', rel))

type LessonSegment = {
  minutes: number
  phase: string
  title: string
  studentDoes: string
  teacherSays: string
  qaIds?: string[]
}
type LessonPlan = {
  chapterId: number
  totalMinutes: number
  goal: string
  segments: LessonSegment[]
  pitfalls: string[]
  wrapUp: string
}

const { LESSON_PLANS, LESSON_PLAN_CHAPTER_IDS, getLessonPlan, hasLessonPlan } = load('lesson-plans') as {
  LESSON_PLANS: Record<number, LessonPlan>
  LESSON_PLAN_CHAPTER_IDS: ReadonlySet<number>
  getLessonPlan: (chapterId: number) => LessonPlan | undefined
  hasLessonPlan: (chapterId: number) => boolean
}
const { ALL_EXTRAS, chapterIdOfQaId } = load('learn-extras') as {
  ALL_EXTRAS: Record<string, { tour?: unknown[]; myTurn?: unknown }>
  chapterIdOfQaId: (qaId: string) => number
}
const { QA_STUBS, CHAPTERS } = load('qa-stubs') as {
  QA_STUBS: Array<{ id: string; chapterId: number }>
  CHAPTERS: Array<{ id: number; title: string }>
}

const plans = Object.values(LESSON_PLANS)
const qaIdsOfChapter = (chapterId: number) => QA_STUBS.filter((qa) => qa.chapterId === chapterId).map((qa) => qa.id)
const ALLOWED_PHASES = new Set(['열기', '학습', '견학', '내 차례', '퀴즈', '정리'])

// 한 차시의 길이. 이 범위를 벗어난 교안은 «1장 = 1차시»라는 기준을 스스로 깬 것이다.
const MIN_PERIOD_MINUTES = 40
const MAX_PERIOD_MINUTES = 50

test('① 등록부가 비어 있지 않다 — 형판만 있고 교안이 없는 상태 금지', () => {
  assert.ok(plans.length > 0, '교안 등록부가 비었다. 형판만 들어오고 내용이 안 들어온 것이다')
})

test('② 등록부의 key 와 교안의 chapterId 가 같다 — 엉뚱한 장에 걸린 교안 금지', () => {
  for (const [key, plan] of Object.entries(LESSON_PLANS)) {
    assert.equal(
      Number(key) === plan.chapterId,
      true,
      `등록부 key ${key} 에 chapterId ${plan.chapterId} 인 교안이 걸렸다 — 교사가 다른 장의 교안을 본다`,
    )
  }
})

test('③ 교안이 걸린 장은 실제로 있는 장이다', () => {
  const realChapterIds = new Set(CHAPTERS.map((chapter) => chapter.id))
  for (const plan of plans) {
    assert.equal(
      realChapterIds.has(plan.chapterId),
      true,
      `${plan.chapterId}장 교안이 있는데 그런 장이 앱에 없다`,
    )
  }
})

test('④ 칸의 분 합이 totalMinutes 와 같다 — 손으로 적은 총합이 어긋나면 시간표가 거짓말이 된다', () => {
  for (const plan of plans) {
    const sum = plan.segments.reduce((acc, segment) => acc + segment.minutes, 0)
    assert.equal(
      sum,
      plan.totalMinutes,
      `${plan.chapterId}장: 칸 합 ${sum}분인데 totalMinutes 는 ${plan.totalMinutes}분이라고 적혀 있다`,
    )
  }
})

test('⑤ 1차시 길이 범위 안에 있다', () => {
  for (const plan of plans) {
    assert.equal(
      plan.totalMinutes >= MIN_PERIOD_MINUTES && plan.totalMinutes <= MAX_PERIOD_MINUTES,
      true,
      `${plan.chapterId}장: ${plan.totalMinutes}분 — 1차시(${MIN_PERIOD_MINUTES}~${MAX_PERIOD_MINUTES}분)를 벗어났다`,
    )
  }
})

test('⑥ 모든 칸의 분이 양수다 — 0분짜리 칸은 안 하는 일이다', () => {
  for (const plan of plans) {
    for (const segment of plan.segments) {
      assert.equal(
        Number.isInteger(segment.minutes) && segment.minutes > 0,
        true,
        `${plan.chapterId}장 «${segment.title}» 칸이 ${segment.minutes}분이다`,
      )
    }
  }
})

test('⑦ phase 는 정해진 여섯 가지뿐이다', () => {
  for (const plan of plans) {
    for (const segment of plan.segments) {
      assert.equal(
        ALLOWED_PHASES.has(segment.phase),
        true,
        `${plan.chapterId}장 «${segment.title}» 의 phase «${segment.phase}» 는 화면이 모르는 종류다`,
      )
    }
  }
})

test('⑧ 교사가 읽을 칸이 비어 있지 않다 — 껍데기 교안 금지', () => {
  for (const plan of plans) {
    assert.ok(plan.goal.trim().length >= 10, `${plan.chapterId}장: goal 이 비었거나 너무 짧다`)
    assert.ok(plan.wrapUp.trim().length >= 10, `${plan.chapterId}장: wrapUp 이 비었거나 너무 짧다`)
    assert.ok(plan.pitfalls.length > 0, `${plan.chapterId}장: pitfalls 가 비었다 — 막히는 곳이 없는 수업은 없다`)
    for (const pitfall of plan.pitfalls) {
      assert.ok(pitfall.trim().length >= 10, `${plan.chapterId}장: 빈 pitfall 항목이 있다`)
    }
    assert.ok(plan.segments.length >= 3, `${plan.chapterId}장: 칸이 ${plan.segments.length}개뿐이다`)
    for (const segment of plan.segments) {
      assert.ok(segment.title.trim().length >= 2, `${plan.chapterId}장: 제목 없는 칸이 있다`)
      assert.ok(
        segment.studentDoes.trim().length >= 10,
        `${plan.chapterId}장 «${segment.title}»: 학생이 무엇을 하는지 안 적혀 있다`,
      )
      assert.ok(
        segment.teacherSays.trim().length >= 10,
        `${plan.chapterId}장 «${segment.title}»: 교사 주석이 안 적혀 있다`,
      )
    }
  }
})

test('⑨ 교안이 가리키는 문항이 전부 실존한다 — 없는 문항으로 학생을 보내지 않는다', () => {
  const realQaIds = new Set(QA_STUBS.map((qa) => qa.id))
  for (const plan of plans) {
    for (const segment of plan.segments) {
      for (const qaId of segment.qaIds ?? []) {
        assert.equal(
          realQaIds.has(qaId),
          true,
          `${plan.chapterId}장 «${segment.title}» 가 ${qaId} 를 가리키는데 그런 문항이 없다`,
        )
      }
    }
  }
})

test('⑩ 교안은 자기 장의 문항만 가리킨다', () => {
  for (const plan of plans) {
    for (const segment of plan.segments) {
      for (const qaId of segment.qaIds ?? []) {
        assert.equal(
          chapterIdOfQaId(qaId),
          plan.chapterId,
          `${plan.chapterId}장 교안이 남의 장 문항 ${qaId} 를 가리킨다`,
        )
      }
    }
  }
})

test('⑪ 그 장의 모든 문항이 최소 한 칸에 나온다 — 교안이 문항을 빠뜨리지 않는다', () => {
  for (const plan of plans) {
    const covered = new Set(plan.segments.flatMap((segment) => segment.qaIds ?? []))
    for (const qaId of qaIdsOfChapter(plan.chapterId)) {
      assert.equal(
        covered.has(qaId),
        true,
        `${plan.chapterId}장 교안이 ${qaId} 를 한 번도 다루지 않는다 — 45분 안에 안 다룰 문항이면 장에서 빼야 한다`,
      )
    }
  }
})

test('⑫ 🚌 견학 칸은 진짜 견학이 있는 문항만 가리킨다', () => {
  for (const plan of plans) {
    for (const segment of plan.segments.filter((item) => item.phase === '견학')) {
      const qaIds = segment.qaIds ?? []
      assert.ok(qaIds.length > 0, `${plan.chapterId}장 «${segment.title}»: 견학 칸인데 문항을 안 가리킨다`)
      for (const qaId of qaIds) {
        assert.equal(
          (ALL_EXTRAS[qaId]?.tour?.length ?? 0) > 0,
          true,
          `${plan.chapterId}장 «${segment.title}» 가 ${qaId} 를 견학이라고 적었는데 그 문항엔 견학이 없다`,
        )
      }
    }
  }
})

test('⑬ ✋「내 차례」 칸은 진짜 AI 판정이 붙은 문항만 가리킨다 — 없는 탭을 열라고 시키지 않는다', () => {
  for (const plan of plans) {
    for (const segment of plan.segments.filter((item) => item.phase === '내 차례')) {
      const qaIds = segment.qaIds ?? []
      assert.ok(qaIds.length > 0, `${plan.chapterId}장 «${segment.title}»: 「내 차례」 칸인데 문항을 안 가리킨다`)
      for (const qaId of qaIds) {
        assert.equal(
          Boolean(ALL_EXTRAS[qaId]?.myTurn),
          true,
          `${plan.chapterId}장 «${segment.title}» 가 ${qaId} 를 「내 차례」라고 적었는데 그 문항엔 「내 차례」가 없다 — 학생에게 없는 탭이 보인다`,
        )
      }
    }
  }
})

test('⑭ 파생 집합·조회 함수가 등록부와 일치한다 — 화면이 «있다»고 본 장에 교안이 없는 일 금지', () => {
  assert.equal(
    LESSON_PLAN_CHAPTER_IDS.size,
    plans.length,
    '파생 집합의 크기가 등록부와 다르다 — 같은 장이 두 번 걸렸을 수 있다',
  )
  for (const chapter of CHAPTERS) {
    const declared = hasLessonPlan(chapter.id)
    assert.equal(
      declared,
      LESSON_PLAN_CHAPTER_IDS.has(chapter.id),
      `${chapter.id}장: hasLessonPlan 과 파생 집합의 판단이 다르다`,
    )
    assert.equal(
      declared,
      getLessonPlan(chapter.id) !== undefined,
      `${chapter.id}장: 교안이 «있다»고 하는데 꺼내면 없다(또는 그 반대)`,
    )
  }
})

test('⑮ 계약이 검사한 교안 수를 찍는다 — 0개를 검사하고 초록인 계측 금지', () => {
  const covered = plans.length
  const total = CHAPTERS.length
  console.log(`[교안 계약] 검사한 교안 ${covered}개 / 전체 ${total}장`)
  assert.ok(covered > 0 && covered <= total, `검사한 교안 ${covered}개, 전체 ${total}장 — 셈이 어긋났다`)
})
