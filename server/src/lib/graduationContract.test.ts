// 19강(약속 문장)·23강(졸업 묶음·전시)의 계약 — 카드 19·23강 · MAP §배정 원리 4(산출물 계보).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (...rel: string[]) => readFileSync(path.join(ROOT, ...rel), 'utf8')
const loadClient = (rel: string) => require(path.resolve(ROOT, 'client', 'src', rel))

// 🚨 typeof import(클라)는 서버 tsc 를 TS6059 로 죽인다(CI 사고 2026-08-18) — 모양만 손으로 적는다.
type ProbeState = { flags: Record<string, string | number | boolean> }
type ProbeRun = { effect?: { kind: string; artifactKind?: string }; flags?: Record<string, unknown> }
type ProbeLab = { commands: Array<{ name: string; run: (args: string, state: ProbeState) => ProbeRun }> }
const engine = loadClient('lib/mini-lab') as { INITIAL_MINI_STATE: ProbeState }
const { MINI_LABS } = loadClient('data/mini-labs') as { MINI_LABS: Record<number, ProbeLab> }

test('1) 19강 — 약속 문장이 계보 promise 로 가고, 순서(채점표 먼저 → 빨강 → 만들기 → 초록)가 지켜진다', () => {
  const lab = MINI_LABS[21]
  assert.ok(lab, '19강(ch21) 미니 실습실이 없다')
  const promiseCommand = lab!.commands.find((command) => command.name === 'promise')!
  const editor = promiseCommand.run('', engine.INITIAL_MINI_STATE).effect
  assert.equal(editor?.kind, 'editor')
  assert.equal(
    (editor as { artifactKind?: string }).artifactKind,
    'promise',
    '약속 문장이 계보 promise 칸으로 안 간다 — 23강 묶음의 4번째 칸이 빈다',
  )

  // 순서 강제 — 채점표 없이 build 는 안 된다(«채점표 먼저»가 이 강의 전부다).
  const build = lab!.commands.find((command) => command.name === 'build')!
  const early = build.run('', engine.INITIAL_MINI_STATE)
  assert.equal(early.flags?.built, undefined, '채점표 없이 build 가 됐다 — TDD 순서가 무너진다')
  // 빨강을 안 보고 build 도 안 된다.
  const withPromise = { ...engine.INITIAL_MINI_STATE, flags: { promiseText: '넣는 것: … 나와야 하는 것: … 왜: … 막혀야: …' } }
  const beforeRed = build.run('', withPromise)
  assert.equal(beforeRed.flags?.built, undefined, '빨강을 안 보고 build 가 됐다 — 초록이 약속 덕인지 알 수 없어진다')
  // 정상 경로 — 빨강 → build → 초록.
  const check = lab!.commands.find((command) => command.name === 'check')!
  const red = check.run('', withPromise)
  assert.equal(red.flags?.sawRed, true, '만들기 전 check 가 빨강을 안 보여 준다')
  const afterRed = { ...withPromise, flags: { ...withPromise.flags, sawRed: true } }
  const built = build.run('', afterRed)
  assert.equal(built.flags?.built, true)
  const green = check.run('', { ...afterRed, flags: { ...afterRed.flags, built: true } })
  assert.equal(green.flags?.sawGreen, true, 'build 후 check 가 초록을 안 보여 준다')
})

test('2) 23강 묶음 — 내용은 서버가 조립한다. 화면은 내용을 보내지 않는다', () => {
  const route = read('server', 'src', 'routes', 'lab.ts')
  const bundleRoute = route.slice(route.indexOf("router.post('/bundle'"), route.indexOf("// GET /api/lab/artifacts"))
  assert.ok(/latestArtifacts\(actor\)/.test(bundleRoute), '서버가 저장된 계보를 안 읽는다')
  assert.ok(/saveArtifact\(actor, 'bundle'/.test(bundleRoute), '완성된 묶음이 계보 bundle 로 안 쌓인다')
  assert.equal(/req\.body/.test(bundleRoute), false, '묶음 라우트가 화면이 보낸 내용을 받는다 — 판정은 서버 것이어야 한다')
  // 빠진 칸은 오류가 아니라 «돌아갈 문» — 200 으로 답한다.
  assert.ok(/res\.json\(\{ missing \}\)/.test(bundleRoute), '빠진 칸이 오류로 나간다 — 문이 아니라 벽이 된다')
  assert.ok(/503/.test(bundleRoute), '계보를 «못 읽음»이 «빈 것»과 안 갈린다')

  const api = read('client', 'src', 'lib', 'lab-api.ts')
  assert.ok(/post<\{ missing: string\[\]; revision\?: number \}>\('\/api\/lab\/bundle', \{\}\)/.test(api), '화면이 묶음에 내용을 실어 보낸다')
})

test('3) 전시 잠금 해제는 서버 판정(missing 0)일 때만 — 화면이 지어내지 않는다', () => {
  const tab = read('client', 'src', 'components', 'learn', 'MiniLabTab.tsx')
  const bundleBlock = tab.slice(tab.indexOf("effect.kind === 'bundle'"), tab.indexOf("if (busy) {"))
  assert.ok(
    /missing\.length === 0 \? \{ exhibitOpen: true \} : \{\}/.test(bundleBlock),
    '전시 잠금 해제가 missing 판정에 안 묶여 있다 — 다섯 장이 열쇠라는 연출이 거짓이 된다',
  )
  assert.ok(/못 읽는» 거예요/.test(bundleBlock), '«못 읽음»과 «빈 것»을 학생에게 안 가른다')

  // exhibit 명령도 잠금을 지킨다.
  const lab = MINI_LABS[23]!
  const exhibit = lab.commands.find((command) => command.name === 'exhibit')!
  const locked = exhibit.run('', engine.INITIAL_MINI_STATE)
  assert.equal(locked.flags?.exhibitViewed, undefined, '잠긴 전시가 열렸다')
  const open = exhibit.run('', { ...engine.INITIAL_MINI_STATE, flags: { exhibitOpen: true } })
  assert.equal(open.flags?.exhibitViewed, true)
})

test('4) 졸업 전시는 읽기 전용 + 연습용 표지 + 진짜 내용', () => {
  const exhibit = read('client', 'src', 'components', 'learn', 'GraduationExhibit.tsx')
  assert.equal(/<input|<textarea/.test(exhibit), false, '전시에 입력 칸이 생겼다 — 보여 주는 자리지 고치는 자리가 아니다')
  assert.ok(/GH_PRACTICE_BADGE/.test(exhibit), '전시에 «연습용» 표지가 없다')
  assert.ok(/\/api\/lab\/artifacts/.test(exhibit), '전시가 서버 계보를 안 읽는다 — 내용을 지어내는 자리가 된다')
  assert.ok(/사라진 게 아니에요/.test(exhibit), '전시 로드 실패가 «없음»처럼 읽힌다')
  // 화면 배선 — 전시 자리는 exhibitOpen 뒤에만 선다.
  const panel = read('client', 'src', 'components', 'learn', 'ContentPanel.tsx')
  assert.ok(/exhibitOpen/.test(panel), 'ContentPanel 전시 자리가 잠금과 무관하게 선다')
})
