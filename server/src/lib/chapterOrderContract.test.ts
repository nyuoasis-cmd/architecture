// 「N강」 진열 번호에 대한 계약.
//
// 🚨 이 앱은 **화면 번호와 속 이름표가 다르다.** 실습 6강이 주제별로 섞여 들어가는데 이름표까지
//    밀면 견학·사례·퀴즈·데모·학생 진도·공유된 링크가 전부 끊긴다. 그래서 이름표(chNN_qMM)는
//    고정이고, 바뀌는 것은 진열 순서와 그 순서에서 «센» 번호뿐이다(chapter-order.ts).
//
// 🔑 여기서 막는 것 셋:
//    ① 만들어 놓고 진열에 안 넣은 강 — 학생에게 영영 안 보인다(등록부엔 있으니 아무도 모른다)
//    ② 진열에는 적혔는데 아직 안 만든 강 — 번호가 조용히 밀린다. 이름을 불러 눈에 보이게 한다
//    ③ 화면이 속 이름표를 「N강」인 것처럼 찍는 것 — 교사가 없는 번호를 부르게 된다
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const load = (rel: string) => require(path.resolve(ROOT, 'client', 'src', 'data', rel))
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const { CHAPTERS } = load('qa-stubs') as { CHAPTERS: Array<{ id: number; lessonNo: number; title: string }> }
const { CHAPTER_DISPLAY_ORDER, orderChapters } = load('chapter-order') as {
  CHAPTER_DISPLAY_ORDER: readonly number[]
  orderChapters: <T extends { id: number }>(chapters: readonly T[]) => Array<T & { lessonNo: number }>
}

test('① 등록부의 모든 장이 진열 선언에 있다 — 빠지면 만들어 놓고 학생에게 안 보인다', () => {
  const declared = new Set(CHAPTER_DISPLAY_ORDER)
  const missing = CHAPTERS.filter((chapter) => !declared.has(chapter.id))
  assert.deepEqual(
    missing.map((chapter) => `${chapter.id}(${chapter.title})`),
    [],
    'chapter-order.ts 의 진열 선언에 없는 장 — 뒤에 붙긴 하지만 순서는 아무도 정하지 않은 상태다',
  )
})

test('② 진열 선언에 중복이 없다 — 같은 장이 두 번 서면 뒤 번호가 통째로 밀린다', () => {
  const seen = new Set<number>()
  const dupes: number[] = []
  for (const chapterId of CHAPTER_DISPLAY_ORDER) {
    if (seen.has(chapterId)) dupes.push(chapterId)
    seen.add(chapterId)
  }
  assert.deepEqual(dupes, [], `진열 선언에 두 번 적힌 장: ${dupes.join(', ')}`)
})

test('③ 아직 안 만든 강이 있으면 이름을 부른다 — 조용히 번호가 밀리는 대신 눈에 보이게', () => {
  const existing = new Set(CHAPTERS.map((chapter) => chapter.id))
  const notYet = CHAPTER_DISPLAY_ORDER.filter((chapterId) => !existing.has(chapterId))
  assert.deepEqual(
    notYet,
    [],
    `진열에는 적혔는데 아직 안 만든 장: ${notYet.join(', ')} — ` +
      '이 장들이 생기기 전까지 뒤 강의 번호는 최종 번호가 아니다(교사에게 나가는 번호가 나중에 바뀐다).',
  )
})

test('④ 번호는 1..N 으로 빈틈 없이 이어진다 — 번호는 선언이 아니라 «센» 값이어야 한다', () => {
  const numbers = CHAPTERS.map((chapter) => chapter.lessonNo)
  assert.deepEqual(
    numbers,
    CHAPTERS.map((_, index) => index + 1),
    '「N강」 번호가 배열 순서와 어긋난다 — 손으로 적힌 번호가 섞였을 가능성이 크다',
  )
})

test('⑤ 진열이 실제로 순서를 바꾼다 — 등록 순서를 그대로 내보내면 이 계약 전체가 장식이다', () => {
  // 🚨 반공백/양성 대조군. orderChapters 가 입력을 그대로 돌려주기만 해도 ①②④ 는 전부 초록이다.
  const probe = orderChapters([{ id: 12 }, { id: 11 }, { id: 18 }])
  assert.deepEqual(
    probe.map((chapter) => chapter.id),
    [11, 18, 12],
    '진열 선언(11 → 18 → 12)대로 재배열되지 않는다 — 실습 강이 제자리에 안 들어간다',
  )
  assert.deepEqual(probe.map((chapter) => chapter.lessonNo), [1, 2, 3], '번호는 재배열된 자리에서 세야 한다')

  // 선언에 없는 장도 버리지 않고 뒤에 붙는지(조용히 사라지면 만든 콘텐츠가 증발한다).
  const orphan = orderChapters([{ id: 999 }, { id: 11 }])
  assert.deepEqual(orphan.map((chapter) => chapter.id), [11, 999], '선언에 없는 장을 버리면 콘텐츠가 조용히 사라진다')
})

test('⑥ 화면이 속 이름표를 「N강」으로 찍지 않는다 — 교사가 없는 번호를 부르게 된다', () => {
  const SURFACES = [
    'client/src/components/learn/ChapterNavPanel.tsx',
    'client/src/components/learn/ContentPanel.tsx',
    'client/src/pages/LibraryPage.tsx',
  ]
  const offenders: string[] = []
  for (const rel of SURFACES) {
    const source = read(rel)
    for (const m of source.matchAll(/\{\s*\w+\.id\s*\}\s*(?:강|장)/g)) {
      offenders.push(`${rel}: «${m[0].trim()}»`)
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `화면이 속 이름표를 강/장 번호로 찍고 있다 — lessonNo 를 써야 한다: ${offenders.join(' / ')}`,
  )

  // 음성 대조군 — 탐지식이 실제로 그 모양을 잡는지.
  assert.equal(/\{\s*\w+\.id\s*\}\s*(?:강|장)/.test('{chapter.id}강'), true, '탐지식이 못 잡으면 ⑥ 은 실패할 수 없다')
})

test('⑦ 가드가 실패할 수 있는 계측인지 — 대조 대상이 비어 있지 않다', () => {
  assert.ok(CHAPTERS.length > 0, '장이 0개면 ①④ 가 아무것도 안 보고 통과한다')
  assert.ok(CHAPTER_DISPLAY_ORDER.length > 0, '진열 선언이 비면 ②③ 이 공짜로 통과한다')
  console.log(`[진열] ${CHAPTERS.length}강 · 선언 ${CHAPTER_DISPLAY_ORDER.length}칸`)
})
