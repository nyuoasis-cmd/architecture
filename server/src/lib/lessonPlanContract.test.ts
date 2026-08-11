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
  phase: string
  title: string
  studentDoes: string
  teacherSays: string
  qaIds?: string[]
}
type LessonPlan = {
  chapterId: number
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

// 🚨 ④ 는 원래 «칸의 분 합이 totalMinutes 와 같은가»였고 ⑤⑥ 은 차시 길이·양수 분을 봤다.
//    2026-08-11 교안에서 시간을 전면 폐기하면서 셋 다 볼 것이 없어졌다. 지울 자리에
//    **되살아남을 잡는 계약**을 대신 넣는다 — 시간을 뺀 진짜 이유는 그 숫자를 지킬 수 없어서였고
//    (이 앱엔 「수업 시작」 기록이 없다), 누군가 편의로 minutes 를 다시 넣으면 화면이 다시
//    틀린 진도를 말하기 시작한다. 사람의 기억이 아니라 계약이 막는다.
const TIME_FIELDS = ['minutes', 'totalMinutes', 'durationMinutes', 'elapsedMinutes', 'startMinute']

test('④ 교안 데이터에 시간 필드가 없다 — 지킬 수 없는 약속을 되살리지 않는다', () => {
  const found: string[] = []

  for (const plan of plans) {
    for (const field of TIME_FIELDS) {
      if (field in (plan as unknown as Record<string, unknown>)) {
        found.push(`${plan.chapterId}장 교안에 ${field}`)
      }
    }
    for (const segment of plan.segments) {
      for (const field of TIME_FIELDS) {
        if (field in (segment as unknown as Record<string, unknown>)) {
          found.push(`${plan.chapterId}장 «${segment.title}» 칸에 ${field}`)
        }
      }
    }
  }

  assert.deepEqual(
    found,
    [],
    '교안에 시간 필드가 되살아났다 — 이 앱에는 「수업 시작」 기록이 없어서 «몇 분째»를 정직하게 셀 수 없다. ' +
      `진도는 교사가 눌러서 정한다:\n  ${found.join('\n  ')}`,
  )
})

test('⑤ 데이터 층이 시간으로 «지금 이 칸»을 고르는 함수를 다시 갖지 않는다', () => {
  const registry = load('lesson-plans') as Record<string, unknown>
  assert.equal(
    registry.findActiveSegmentIndex,
    undefined,
    'findActiveSegmentIndex 가 되살아났다 — 시계가 진도를 고르면 미리 만들어 둔 세션에서 통째로 틀린다',
  )
})

test('⑥ 칸의 순서가 곧 진행 순서다 — 순서 말고 진행을 말하는 다른 열쇠가 없다', () => {
  // 시간을 뺀 뒤로 «몇 번째 칸인가»가 유일한 진행 표시다. 배열이 비면 화면에 순서가 사라진다.
  for (const plan of plans) {
    assert.ok(Array.isArray(plan.segments), `${plan.chapterId}장: segments 가 배열이 아니다`)
    assert.ok(plan.segments.length > 0, `${plan.chapterId}장: 칸이 하나도 없다 — 진행할 순서가 없다`)
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

// 🔑 이 계약은 17장 전부에 교안이 들어온 **뒤에** 켰다(에픽 18/18).
//    쌓는 도중에 켜면 «아직 안 쓴 장» 예외 목록이 필요해지고, 그 목록은 반드시 면제권이 된다.
//    그래서 «완전해진 다음에 문을 잠그는» 순서를 택했다.
// 🚨 이제부터 장을 새로 만들면 교안 없이는 배포가 안 된다. 그게 이 계약의 목적이다.
test('⑯ 모든 장에 교안이 있다 — 장을 늘리면 교안도 따라와야 한다', () => {
  const missing = CHAPTERS.filter((chapter) => !LESSON_PLAN_CHAPTER_IDS.has(chapter.id))
  assert.deepEqual(
    missing.map((chapter) => chapter.id),
    [],
    `교안 없는 장: ${missing.map((chapter) => `${chapter.id}장 «${chapter.title}»`).join(', ')} — 이 장을 담은 수업에서 교사는 진행 안내를 못 본다`,
  )
})

test('⑮ 계약이 검사한 교안 수를 찍는다 — 0개를 검사하고 초록인 계측 금지', () => {
  const covered = plans.length
  const total = CHAPTERS.length
  console.log(`[교안 계약] 검사한 교안 ${covered}개 / 전체 ${total}장`)
  assert.ok(covered > 0 && covered <= total, `검사한 교안 ${covered}개, 전체 ${total}장 — 셈이 어긋났다`)
})

// ── 교사 화면 기본 펼침 규칙 ────────────────────────────────────────────
// 🚨 이 규칙이 없으면 45분짜리 교안 17개가 한 화면에 쌓인다(prod 실측 23,983px ≈ 27 화면).
//    교사 화면의 «새 세션 만들기»가 장을 고르는 칸 없이 항상 전 장을 담기 때문이다.
test('⑰ 교안 패널은 한 장일 때만 펼친다 — 여러 장이면 접는다', () => {
  const { shouldExpandLessonPlanByDefault } = load('lesson-plans') as {
    shouldExpandLessonPlanByDefault: (n: number) => boolean
  }
  assert.equal(shouldExpandLessonPlanByDefault(1), true, '한 장짜리 차시는 펼쳐야 바로 읽는다')
  assert.equal(shouldExpandLessonPlanByDefault(2), false, '두 장부터는 접어야 한다')
  assert.equal(
    shouldExpandLessonPlanByDefault(CHAPTERS.length),
    false,
    `전 장(${CHAPTERS.length}장)을 담은 세션에서 전부 펼치면 수업 중에 못 쓰는 화면이 된다`,
  )
  assert.equal(shouldExpandLessonPlanByDefault(0), false, '교안이 없으면 펼칠 것도 없다')
})
