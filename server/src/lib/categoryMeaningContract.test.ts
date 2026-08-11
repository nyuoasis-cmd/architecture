// 학습 화면 상단 «묶음» 배지의 뜻 한 줄에 대한 계약.
//
// 왜 있는가(2026-08-11 prod QA, 새내기 f3): 배지에 «바이브코딩»이 모든 화면에 떠 있는데 앱 어디에도
// 그 말의 뜻이 없었다. 학생이 «이게 수업 이름인가 기술 이름인가»에서 멈췄다.
//
// 🔑 이 계약이 지키는 것은 문장의 «있음»이 아니라 **끊기지 않음**이다. 끊길 수 있는 자리가 셋이다:
//    ① 새 묶음을 만들고 뜻을 안 적는다 → 그 장 학생만 설명 없는 배지를 본다(①)
//    ② 묶음 이름을 바꾸고 사전을 안 고친다 → 사전에 아무도 안 쓰는 항목이 남는다(③ = 사문)
//    ③ 화면에서 사전 호출을 지운다 → 사전은 멀쩡한데 학생에겐 아무것도 안 뜬다(⑤)
// 🚨 ⑤ 가 없으면 ①~③ 이 전부 초록인 채로 «화면에는 없는» 상태가 될 수 있다.
//    이 레포는 그 형태(랜딩 상한 근거가 사문으로 남아 학생에게 앱이 작아 보인 일)를 이미 겪었다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const load = (rel: string) => require(path.resolve(ROOT, 'client', 'src', 'data', rel))

const { CATEGORY_MEANINGS } = load('category-meanings') as { CATEGORY_MEANINGS: Record<string, string> }
const { CHAPTERS } = load('qa-stubs') as { CHAPTERS: Array<{ id: number; category: string }> }

// 🔑 배지는 이제 **모든 장**에 뜬다 — 학습 화면이 하나뿐이라(2026-08-11, 에픽 2/6) «어떤 장은 배지가
//    안 보인다»는 상태가 존재하지 않는다. 예전에는 형판 판정(chapterUsesExtrasLayout)으로 대상을
//    골랐는데, 그 판정이 사라졌으므로 노출 대상 = 등록부의 모든 묶음이다.
const shownCategories = (): string[] => [...new Set(CHAPTERS.map((chapter) => chapter.category))]

test('① 학생 화면에 배지로 나가는 모든 묶음에 뜻 한 줄이 있다', () => {
  const missing = shownCategories()
    .filter((category) => !CATEGORY_MEANINGS[category]?.trim())
    .sort()

  assert.deepEqual(
    missing,
    [],
    '배지에는 뜨는데 뜻이 없는 묶음 — 학생은 설명 없는 낱말을 계속 보게 된다:\n  ' +
      `${missing.join('\n  ')}\n` +
      'client/src/data/category-meanings.ts 에 한 줄 적을 것.',
  )
})

test('② 뜻 문장이 그 낱말로 시작한다 — 학생이 배지와 눈으로 잇는다', () => {
  const broken = Object.entries(CATEGORY_MEANINGS)
    .filter(([category, meaning]) => !meaning.startsWith(`${category} =`))
    .map(([category, meaning]) => `${category} → ${meaning}`)
    .sort()

  assert.deepEqual(
    broken,
    [],
    '배지에서 읽은 말로 시작하지 않는 뜻 문장 — 학생이 어느 낱말의 설명인지 못 잇는다:\n  ' +
      `${broken.join('\n  ')}`,
  )
})

test('③ 사전에 «어느 장도 안 쓰는» 항목이 없다 (사문 방지)', () => {
  const shown = new Set(shownCategories())
  const orphans = Object.keys(CATEGORY_MEANINGS)
    .filter((category) => !shown.has(category))
    .sort()

  assert.deepEqual(
    orphans,
    [],
    '어느 장의 배지에도 안 나오는 뜻 문장 — 묶음 이름이 바뀌었는데 사전만 남았을 가능성이 크다:\n  ' +
      `${orphans.join('\n  ')}\n` +
      '이름이 바뀐 거라면 사전 열쇠를 같이 고치고, 정말 없어진 묶음이면 지울 것.',
  )
})

test('④ 이 계측이 실패할 수 있는가 — 대조 대상이 비어 있지 않다', () => {
  // 🚨 ①·③ 은 «명단이 비어 있음»을 단언한다. 대조 대상이 0 이면 그 단언은 아무것도 안 보고도 참이 된다.
  assert.ok(CHAPTERS.length > 0, '장 목록이 비었다 — ①·③ 이 아무것도 안 보고 통과하는 상태다.')
  assert.ok(
    shownCategories().length > 0,
    '배지로 나가는 묶음이 0개다 — 장 데이터가 안 실렸다. ① 은 이 상태에서도 초록이다.',
  )
  assert.ok(
    Object.keys(CATEGORY_MEANINGS).length > 0,
    '사전이 비었다 — ② ·③ 이 아무것도 안 보고 통과하는 상태다.',
  )
})

test('⑤ 화면이 실제로 이 사전을 쓴다 — 사전만 살고 화면에서 사라지는 걸 막는다', () => {
  // 🚨 그리는 자리가 옮겨 가면 여기 경로도 같이 옮겨야 한다. 안 옮기면 «파일이 없다»로 죽는데,
  //    그건 조용히 초록이 되는 것보다 낫다 — 사전만 살고 화면에서 사라지는 게 이 검사가 막는 결함이다.
  const rel = 'client/src/components/learn/ChapterNavPanel.tsx'
  const source = readFileSync(path.join(ROOT, rel), 'utf8')

  assert.ok(
    /getCategoryMeaning\s*\(\s*chapter\.category\s*\)/.test(source),
    `${rel} 이 getCategoryMeaning(chapter.category) 를 부르지 않는다 — ` +
      '사전은 멀쩡한데 학생 화면에는 뜻이 안 뜨는 상태다(①~③ 은 전부 초록이다).',
  )
  assert.ok(
    /categoryMeaning/.test(source.split('return (')[1] ?? ''),
    `${rel} 이 뜻을 계산만 하고 화면에 그리지 않는다 — 부르는 것과 그리는 것은 다르다.`,
  )
})
