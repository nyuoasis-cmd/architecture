// 🧭 체험 머리표의 계약 — «세 질문에 늘 답이 떠 있고, 그 답이 한 벌뿐인가».
//
// 🚨 왜 있는가(jery 요청 4, 2026-08-19): 체험 화면에서 학생이 명령을 쳐 봐도
//    «왜 하는지·언제 쓰는지»가 어디에도 없었다. 있던 한 줄조차 스크롤백 안에 살아서
//    몇 줄만 치면 위로 밀려 사라졌다. 머리표는 그 자리를 **고정으로** 메운다.
// 🚨 «모든 강에 머리표가 있다»는 걸지 않는다 — 없는 강은 없는 채로 둔다(교안 계약 ⑯ 의 실패).
//    여기서 보는 것은 **있는 것이 성한가**뿐이다.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const load = (rel: string) => require(path.resolve(ROOT, 'client', 'src', 'data', rel))
const read = (rel: string) => fs.readFileSync(path.resolve(ROOT, 'client', 'src', rel), 'utf8')

type Hat = { why: string; whenUsed: string; now: string }
const { HAT_BY_CHAPTER, HAT_BY_QA, getExperienceHat } = load('experience-hat') as {
  HAT_BY_CHAPTER: Record<number, Hat>
  HAT_BY_QA: Record<string, Partial<Hat>>
  getExperienceHat: (chapterId: number, qaId: string) => Hat | undefined
}
const { CHAPTERS, QA_STUBS } = load('qa-stubs') as {
  CHAPTERS: Array<{ id: number; lessonNo?: number }>
  QA_STUBS: Array<{ id: string; chapterId: number }>
}

const CHAPTER_IDS = new Set(CHAPTERS.map((chapter) => chapter.id))
const QA_BY_ID = new Map(QA_STUBS.map((qa) => [qa.id, qa]))

test('1) 머리표는 세 칸이 전부 차 있다 — 한 칸이 비면 그 질문에 답이 없는 화면이 된다', () => {
  const holes: string[] = []
  for (const [id, hat] of Object.entries(HAT_BY_CHAPTER)) {
    for (const key of ['why', 'whenUsed', 'now'] as const) {
      if (!hat[key] || hat[key].trim().length < 10) holes.push(`ch${id}.${key}`)
    }
  }
  assert.deepEqual(holes, [], `머리표에 빈 칸이 있다: ${holes.join(', ')}`)
})

test('2) 칸이 길어지지 않는다 — 머리표는 읽는 물건이 아니라 «떠 있는» 물건이다', () => {
  // 🔑 길어지면 세 칸이 화면을 먹고, 정작 체험(터미널·견학)이 아래로 밀린다.
  //    깊은 설명은 교사 노트 층 2 가 가져갔다 — 여기로 되돌아오면 안 된다.
  const LIMIT: Record<keyof Hat, number> = { why: 220, whenUsed: 220, now: 120 }
  const overs: string[] = []
  const check = (label: string, hat: Partial<Hat>) => {
    for (const key of ['why', 'whenUsed', 'now'] as const) {
      const value = hat[key]
      if (value && value.length > LIMIT[key]) overs.push(`${label}.${key} ${value.length}자 > ${LIMIT[key]}`)
    }
  }
  for (const [id, hat] of Object.entries(HAT_BY_CHAPTER)) check(`ch${id}`, hat)
  for (const [qaId, hat] of Object.entries(HAT_BY_QA)) check(qaId, hat)
  assert.deepEqual(overs, [], `머리표 칸이 상한을 넘었다: ${overs.join(' · ')}`)
})

test('3) 유령을 가리키지 않는다 — 없는 강·없는 문항에 머리표가 달려 있지 않다', () => {
  const ghostChapters = Object.keys(HAT_BY_CHAPTER)
    .map(Number)
    .filter((id) => !CHAPTER_IDS.has(id))
  assert.deepEqual(ghostChapters, [], `진열되지 않는 장에 머리표가 있다: ${ghostChapters.join(', ')}`)

  const ghostQas = Object.keys(HAT_BY_QA).filter((qaId) => !QA_BY_ID.has(qaId))
  assert.deepEqual(ghostQas, [], `없는 문항에 덮어쓰기가 있다: ${ghostQas.join(', ')}`)
})

test('4) 문항 덮어쓰기는 «기본이 있는 강»에만 붙는다 (D-1: 강 단위 + 튀는 문항만)', () => {
  // 🔑 기본 없는 강에 덮어쓰기만 있으면 그 문항은 여전히 머리표가 안 뜬다 — 쓴 사람만 썼다고 믿는다.
  const orphans = Object.keys(HAT_BY_QA).filter((qaId) => {
    const qa = QA_BY_ID.get(qaId)
    return qa ? !HAT_BY_CHAPTER[qa.chapterId] : false
  })
  assert.deepEqual(orphans, [], `강 기본 없이 문항 덮어쓰기만 있다: ${orphans.join(', ')}`)

  // 합쳐지는가 — 덮어쓴 칸은 바뀌고, 안 적은 칸은 강 기본이 그대로 온다.
  for (const [qaId, override] of Object.entries(HAT_BY_QA)) {
    const qa = QA_BY_ID.get(qaId)!
    const merged = getExperienceHat(qa.chapterId, qaId)!
    const base = HAT_BY_CHAPTER[qa.chapterId]!
    for (const key of ['why', 'whenUsed', 'now'] as const) {
      assert.equal(merged[key], override[key] ?? base[key], `${qaId}.${key} 합치기가 어긋났다`)
    }
  }
})

test('5) 머리표가 수업 흐름·진행 시간을 지시하지 않는다 — 그건 교안이고 철거됐다', () => {
  // 🔑 겨냥하는 것은 «진행 지시»다(N분째·총 N분·다음 차시). 내용으로서의 「분」은 통과해야 한다.
  const BANNED = [/\d+\s*분째/, /총\s*\d+\s*분/, /소요\s*시간/, /\d+\s*분\s*(?:동안\s*)?(?:진행|수업|활동)/, /차시/]
  const hits: string[] = []
  const scan = (label: string, hat: Partial<Hat>) => {
    for (const key of ['why', 'whenUsed', 'now'] as const) {
      const value = hat[key]
      if (value && BANNED.some((pattern) => pattern.test(value))) hits.push(`${label}.${key}`)
    }
  }
  for (const [id, hat] of Object.entries(HAT_BY_CHAPTER)) scan(`ch${id}`, hat)
  for (const [qaId, hat] of Object.entries(HAT_BY_QA)) scan(qaId, hat)
  assert.deepEqual(hits, [], `머리표가 수업 진행을 지시한다: ${hits.join(', ')}`)
})

test('6) 머리표를 미는 자리는 한 곳뿐이다 — 부품마다 각자 만들면 강마다 화면이 달라진다 (D-5)', () => {
  const callers = ['components/learn', 'components', 'pages']
    .flatMap((dir) => {
      const abs = path.resolve(ROOT, 'client', 'src', dir)
      return fs.existsSync(abs) ? fs.readdirSync(abs).map((name) => path.join(dir, name)) : []
    })
    .filter((rel) => rel.endsWith('.tsx'))
    .filter((rel) => !rel.endsWith('ExperienceHat.tsx'))
    .filter((rel) => /from '.*ExperienceHat'/.test(read(rel)))
  assert.deepEqual(callers, ['components/learn/ContentPanel.tsx'], `머리표를 미는 자리가 늘었다: ${callers.join(', ')}`)
})

test('7) 머리표는 스크롤로 사라지지 않는다 — 그게 요청 4 의 진원이었다', () => {
  const panel = read('components/learn/ContentPanel.tsx')
  const at = panel.indexOf('<ExperienceHat')
  assert.ok(at > 0, 'ContentPanel 이 머리표를 그리지 않는다')
  const around = panel.slice(Math.max(0, at - 400), at)
  assert.match(around, /sticky/, '머리표가 고정되지 않는다 — 몇 줄만 치면 위로 밀려 사라진다')
})

test('8) 데이터가 없는 강은 머리표 없이 뜬다 — «전 강에 머리표»를 요구하지 않는다', () => {
  const bare = CHAPTERS.map((chapter) => chapter.id).find((id) => !HAT_BY_CHAPTER[id])
  if (bare !== undefined) {
    assert.equal(getExperienceHat(bare, `ch${String(bare).padStart(2, '0')}_q01`), undefined)
  }
  const hat = read('components/learn/ExperienceHat.tsx')
  assert.match(hat, /if \(!hat\) return null/, '머리표가 데이터 없이도 무언가를 그리려 한다')
})

test('9) 도슨트 띠가 되살아나지 않는다 — 머리표가 흡수했다 (결정 D-2)', () => {
  // 🚨 안 정하면 화면 위에 띠가 세 줄로 쌓인다(비유 다리 + 도슨트 + 머리표).
  //    도슨트 **데이터**(GhScriptStep.docent)는 그대로 산다 — 없어진 것은 «자기 띠»뿐이다.
  const tab = read('components/learn/GhSimTab.tsx')
  assert.doesNotMatch(tab, /지금 하는 일/, '유사 GitHub 에 도슨트 띠가 되살아났다 — 띠가 세 줄로 쌓인다')
  assert.doesNotMatch(tab, /step\.docent/, '도슨트를 부품이 다시 그린다 — 머리표와 두 곳에서 말한다')

  // 흡수한 쪽이 실제로 말하는가 — 머리표의 「지금 할 일」이 도슨트를 받는다.
  const panel = read('components/learn/ContentPanel.tsx')
  assert.match(panel, /docent/, '머리표가 도슨트를 받지 않는다 — 흡수해 놓고 아무도 말하지 않는 자막이 된다')
})

test('10) 유사 GitHub 의 비유 다리는 살아 있다 (D-2 는 도슨트만 흡수했다)', () => {
  const tab = read('components/learn/GhSimTab.tsx')
  assert.match(tab, /아까 읽은 비유/, '비유 다리까지 없앴다 — 읽기 탭에서 심은 비유가 화면과 끊긴다')
  assert.match(tab, /새 용어는/, '새 용어 안내가 도슨트 띠와 함께 사라졌다')
})
