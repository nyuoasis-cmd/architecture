// 22강 체험(가짜 GitHub PR 대본 + 피싱 판별)의 계약 — 카드 22강 · SDD 결정 20 · 목업 2.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (...rel: string[]) => readFileSync(path.join(ROOT, ...rel), 'utf8')
const loadClient = (rel: string) => require(path.resolve(ROOT, 'client', 'src', rel))

// 🚨 typeof import(클라)는 서버 tsc 를 TS6059 로 죽인다(CI 사고 2026-08-18) — 모양만 손으로 적는다.
type ProbeStep = {
  id: string
  action: { kind: string; artifactKind?: string }
  artifactOf?: (state: ProbeState, input: string) => string
}
type ProbeState = { pr: { state: string; body: string } | null }
type ProbeScript = { steps: ProbeStep[] }
const { GH_SCRIPTS } = loadClient('data/gh-scripts') as { GH_SCRIPTS: Record<number, ProbeScript> }
const sim = loadClient('lib/gh-sim') as {
  foldGhState: (script: ProbeScript, stepIndex: number, inputs: Record<string, string>) => ProbeState
}
const { PHISHING_CARDS, PHISHING_QA_ID } = loadClient('data/phishing-check') as {
  PHISHING_CARDS: Array<{ id: string; url: string; https: boolean; real: boolean; tells: string[] }>
  PHISHING_QA_ID: string
}

test('1) ch22 대본 — 쪽지(Open)→리뷰→고침→Merge 가 있고, 넘김 쪽지가 계보(handoff)로 저장된다', () => {
  const script = GH_SCRIPTS[22]
  assert.ok(script, '22강 대본이 등록돼 있지 않다')
  const kinds = script!.steps.map((step) => step.action.kind)
  assert.ok(kinds.includes('merge'), 'Merge 단계가 없다 — 문집 비유의 3단계가 비었다')
  const artifactSteps = script!.steps.filter(
    (step) => step.action.kind === 'input' && step.action.artifactKind === 'handoff',
  )
  assert.ok(artifactSteps.length >= 1, '넘김 쪽지가 계보(handoff)로 저장되지 않는다 — 23강 묶음의 5번째 칸이 빈다')

  // 대본을 끝까지 접었을 때 — 쪽지가 PR 본문에 들어가고(산출물 슬롯), 최종 상태는 merged 다.
  const inputs: Record<string, string> = {}
  for (const step of script!.steps) {
    if (step.action.kind === 'input') inputs[step.id] = `검사용 입력 ${step.id} — 넘김 쪽지의 본문입니다.`
  }
  const state = sim.foldGhState(script!, script!.steps.length, inputs)
  assert.equal(state.pr?.state, 'merged', '대본 끝의 PR 이 merged 가 아니다')
  assert.ok(state.pr!.body.includes('검사용 입력 open'), '학생이 쓴 쪽지가 PR 본문(산출물 슬롯)에 안 들어간다')

  // 고침 단계의 계보 저장은 «전체 쪽지 + 확인 줄»이다 — 부분만 저장하면 23강이 반쪽을 꺼낸다.
  const fixStep = script!.steps.find((step) => step.id === 'fix')
  assert.ok(fixStep?.artifactOf, '고침 단계가 계보에 덧붙임만 저장한다')
  const beforeFix = sim.foldGhState(script!, script!.steps.findIndex((step) => step.id === 'fix'), inputs)
  const saved = fixStep!.artifactOf!(beforeFix, '확인 줄')
  assert.ok(saved.includes('검사용 입력 open') && saved.includes('확인 줄'), 'artifactOf 가 전체 쪽지를 안 담는다')
})

test('2) 피싱 판별 — 진짜는 정확히 하나, 가짜마다 해부가 있다 (오답은 반드시 해부 씬)', () => {
  assert.equal(PHISHING_CARDS.filter((card) => card.real).length, 1, '진짜가 하나가 아니다')
  assert.ok(PHISHING_CARDS.length >= 5, '고를 화면이 너무 적다 — 찍어도 맞는 확률이 커진다')
  for (const card of PHISHING_CARDS.filter((item) => !item.real)) {
    assert.ok(card.tells.length >= 1, `가짜 ${card.id} 에 해부가 없다 — 틀린 학생이 이유를 못 본다`)
  }
  const real = PHISHING_CARDS.find((card) => card.real)!
  assert.equal(real.https, true, '진짜가 https 가 아니다 — 판별 기준 자체가 무너진다')
  assert.equal(real.tells.length, 0, '진짜에 해부가 붙어 있다')

  const component = read('client', 'src', 'components', 'learn', 'PhishingCheck.tsx')
  assert.ok(/해부/.test(component), '컴포넌트가 해부 씬을 안 그린다')
  // 🚨 로그인 «그림»이지 입력이 아니다 — 자격증명을 받는 칸을 만들지 않는다.
  assert.equal(/<input|onChange/.test(component), false, '피싱 카드가 실제 입력을 받는다 — 그림이어야 한다')
})

test('3) 22강 q3 의 체험이 피싱 판별로 갈린다 — 대본과 같은 강 안에서 문항 하나만 다르다', () => {
  assert.equal(PHISHING_QA_ID, 'ch22_q03')
  const panel = read('client', 'src', 'components', 'learn', 'ContentPanel.tsx')
  assert.ok(/qaId === PHISHING_QA_ID/.test(panel), 'ContentPanel 이 피싱 문항을 안 가른다')
  assert.ok(/getGhScript\(chapter\.id\)/.test(panel), 'ContentPanel 이 대본 등록부를 안 읽는다')
  assert.ok(/labSaveArtifact\(/.test(panel), '산출물이 계보로 안 나간다')
})

test('4) 본문이 비유 다리의 출발점을 심는다 — 읽기에서 심고 체험 위에서 재등장 (쉬움 3원칙 1)', () => {
  const data = read('client', 'src', 'data', 'vibe-ch22.ts')
  assert.ok(/학급 문집/.test(data), 'q1 본문에 문집 비유가 없다 — 체험의 비유 다리가 허공에서 시작한다')
  assert.ok(/🧭 체험/.test(data), '본문이 체험 탭을 가리키지 않는다')
})

test('5) 계보 쓰기 라우트 — 화면이 쌓을 수 있는 칸은 넷뿐이고, rules·bundle 은 각자 경로다', () => {
  const route = read('server', 'src', 'routes', 'lab.ts')
  const schema = route.match(/const artifactSchema[\s\S]*?\}\);/)
  assert.ok(schema, 'artifactSchema 가 없다')
  assert.ok(/'skill', 'ac', 'promise', 'handoff'/.test(schema![0]), '허용 kind 가 넷이 아니다')
  assert.equal(/'rules'|'bundle'/.test(schema![0]), false, "rules/bundle 을 화면이 직접 쌓을 수 있다 — 각자 경로여야 한다")
  const artifactRoute = route.slice(route.indexOf("router.post('/artifact'"), route.indexOf("router.get('/artifacts'"))
  assert.ok(/toLabActor\(resolveActorId\(req\)\)/.test(artifactRoute), '신원을 resolveActorId 로 안 잰다')
  assert.ok(/503/.test(artifactRoute), '테이블 부재가 503 으로 안 나간다')
})
