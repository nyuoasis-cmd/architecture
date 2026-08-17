// 「가짜 GitHub」의 계약 — SDD 결정 8·16 + 쉬움 3원칙 (목업 2 확정).
//
// 지키는 것: 연습용 표지 상시 · 단일 상태 기계 · 대본형(밖은 흐림+이유) · 도슨트 자막 필수 ·
//           새 영어 용어 ≤2 · 확정 버튼(Merge)은 학생 손.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (...rel: string[]) => readFileSync(path.join(ROOT, ...rel), 'utf8')
const loadClient = (rel: string) => require(path.resolve(ROOT, 'client', 'src', rel))

const sim = loadClient('lib/gh-sim') as typeof import('../../../client/src/lib/gh-sim')
const { GH_SCRIPTS } = loadClient('data/gh-scripts') as {
  GH_SCRIPTS: Record<number, import('../../../client/src/lib/gh-sim').GhScript>
}
const { EXPERIENCE_KIND_BY_CHAPTER } = loadClient('data/experience') as {
  EXPERIENCE_KIND_BY_CHAPTER: Record<number, string>
}

test('1) «연습용» 표지가 조건 없이 항상 떠 있다 — 진실성 장치이자 사칭 방지', () => {
  assert.ok(sim.GH_PRACTICE_BADGE.includes('연습용'), '표지 문구에 «연습용»이 없다')
  assert.ok(sim.GH_PRACTICE_BADGE.includes('아님'), '표지가 «진짜 아님»을 말하지 않는다')
  const tab = read('client', 'src', 'components', 'learn', 'GhSimTab.tsx')
  assert.ok(/\{GH_PRACTICE_BADGE\}/.test(tab), '렌더러가 표지를 안 그린다')
  assert.equal(
    /\?\s*GH_PRACTICE_BADGE|GH_PRACTICE_BADGE\s*:|&&\s*GH_PRACTICE_BADGE/.test(tab),
    false,
    '표지가 조건부다 — 항상 떠 있어야 한다',
  )
})

test('2) 상태 기계는 하나다 — 강마다 다른 것은 대본뿐 (SDD 결정 16)', () => {
  const tab = read('client', 'src', 'components', 'learn', 'GhSimTab.tsx')
  assert.ok(/foldGhState/.test(tab), '렌더러가 단일 리듀서(foldGhState)를 안 쓴다')
  // gh-sim 이 React·DOM 없이 순수한가 — lab-shell 과 같은 이유(서버 테스트가 행동을 검사한다).
  const lib = read('client', 'src', 'lib', 'gh-sim.ts')
  assert.equal(/from 'react'|document\.|window\./.test(lib), false, 'gh-sim 이 화면에 붙어 있다')
})

test('3) 대본 밖 요소는 몰래 막지 않는다 — 흐림 + 누르면 이유', () => {
  const reason = sim.outOfScriptReason(
    'issues',
    {
      scopeId: 'probe',
      repoName: 'r',
      bridge: { name: 'b', stages: ['1'] },
      newTerms: [],
      initial: { repo: 'r', files: [], issues: [], pr: null, pages: 'off', pagesUrl: null },
      steps: [{ id: 's1', docent: 'd', screen: 'code', action: { kind: 'next', label: 'n' } }],
      outro: 'o',
    },
    0,
  )
  assert.ok(/안 눌려요/.test(reason), '이유 설명이 «왜 안 눌리는지»를 말하지 않는다')
  assert.ok(/진짜 GitHub/.test(reason), '연습과 진짜의 차이를 말하지 않는다')
  const tab = read('client', 'src', 'components', 'learn', 'GhSimTab.tsx')
  assert.ok(/outOfScriptReason\(/.test(tab), '렌더러가 대본 밖 클릭에 이유를 안 띄운다')
})

test('4) 확정은 학생 손이 누른다 — 대본이 저절로 진행되는 자리가 없다', () => {
  const tab = read('client', 'src', 'components', 'learn', 'GhSimTab.tsx')
  assert.equal(/useEffect/.test(tab), false, '렌더러에 시간·마운트로 진행되는 자리가 있다 — 버튼만 진행한다')
  assert.ok(/onClick=\{\(\) => advance\(\)\}/.test(tab), '버튼이 진행을 안 시킨다 — 이 검사가 헛돈다')
})

test('5) 등록된 대본이 쉬움 3원칙을 지킨다 — 도슨트 필수 · 새 용어 ≤2 · 결정적 재생', () => {
  for (const [chapterId, script] of Object.entries(GH_SCRIPTS)) {
    const where = `ch${chapterId}`
    assert.ok(script.steps.length > 0, `${where}: 대본이 비었다`)
    assert.ok(script.newTerms.length <= 2, `${where}: 새 영어 용어가 ${script.newTerms.length}개 — 최대 2 (쉬움 3원칙)`)
    assert.ok(script.bridge.stages.length >= 2, `${where}: 비유 다리 단계가 없다`)
    for (const step of script.steps) {
      assert.ok(step.docent.trim().length > 0, `${where}/${step.id}: 도슨트 자막이 비었다 — 매 단계 필수`)
    }
    // 결정적 재생 — 어떤 입력이 와도 fold 가 죽지 않는다(진행 저장이 stepIndex+inputs 뿐이라서).
    const inputs: Record<string, string> = {}
    for (const step of script.steps) {
      if (step.action.kind === 'input') inputs[step.id] = '검사용 입력 — 충분히 긴 글.'
    }
    const state = sim.foldGhState(script, script.steps.length, inputs)
    assert.ok(state.repo.length > 0, `${where}: fold 가 상태를 잃었다`)
    // 등록 강이 지도의 github/composite 배정과 일치한다.
    const kind = EXPERIENCE_KIND_BY_CHAPTER[Number(chapterId)]
    assert.ok(
      kind === 'github' || kind === 'composite',
      `${where}: 유사 GitHub 대본이 ${kind} 강에 등록됐다 — 지도(MAP) 밖이다`,
    )
  }
})

test('6) 진행은 스토어에 산다 — 탭 한 번에 대본 진행이 날아가지 않게 (labSession 과 같은 사고 예방)', () => {
  const tab = read('client', 'src', 'components', 'learn', 'GhSimTab.tsx')
  assert.ok(/store\.ghSession/.test(tab) || /ghSession\b/.test(tab), '렌더러가 스토어 세션을 안 쓴다')
  assert.equal(
    /useState<\s*number\s*>\(0\)|useState\(\s*0\s*\)/.test(tab),
    false,
    '대본 진행(stepIndex)이 컴포넌트 안에 산다 — 읽기 탭 한 번에 날아간다',
  )
  const store = read('client', 'src', 'store', 'learn-store.ts')
  assert.ok(/ghSession/.test(store), '스토어에 ghSession 이 없다')
})
