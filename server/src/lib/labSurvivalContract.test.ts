// 실습 작업이 **화면보다 오래 사는가**에 대한 계약.
//
// 🚨 왜 있는가(2026-08-15 Codex 리뷰): 실습 상태가 `LabTab` 컴포넌트 안에 있었다.
//    우측 탭은 조건부 렌더라, 학생이 📖 읽기 탭에 한 번 들렀다 오는 것만으로 컴포넌트가
//    unmount 되면서 **규칙·터미널 기록·AI 결과가 통째로 사라졌다.** 저장도 경고도 없었다.
//    90분짜리 작업이 탭 한 번에 날아가는 자리였고, 화면을 열어 보기 전까지 아무도 안 알려 준다.
//
// 🔑 그래서 검사하는 것은 «상태가 예쁜가»가 아니라 **«작업이 컴포넌트 밖에 사는가»**이다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const CLIENT = (...parts: string[]) => path.resolve(__dirname, '..', '..', '..', 'client', 'src', ...parts)
const read = (...parts: string[]) => readFileSync(CLIENT(...parts), 'utf8')

const LAB_TAB = ['components', 'learn', 'LabTab.tsx']
const STORE = ['store', 'learn-store.ts']

type LabState = { env: { widthPx: number; canPaste: boolean }; [key: string]: unknown }
type LabSession = { qaId: string; state: LabState; lines: unknown[]; history: string[] }
type LabSessionUpdate = LabSession | null | ((current: LabSession | null) => LabSession | null)
type LearnStoreApi = {
  getState: () => {
    labSession: LabSession | null
    setLabSession: (update: LabSessionUpdate) => void
  }
}

test('1) 실습 작업이 스토어에 산다 — 컴포넌트가 사라져도 남아 있어야 한다', () => {
  const store = read(...STORE)
  assert.ok(/labSession:/.test(store), '스토어에 실습 세션이 없다 — 작업이 컴포넌트와 함께 죽는다')
  for (const field of ['state', 'lines', 'history']) {
    assert.ok(
      new RegExp(`${field}:`).test(store.slice(store.indexOf('labSession:'), store.indexOf('labSession:') + 300)),
      `실습 세션에 ${field} 가 없다 — 그 부분만 조용히 사라진다`,
    )
  }
})

test('2) LabTab 이 자기 안에 작업을 들고 있지 않다 — 들고 있으면 탭 전환에 날아간다', () => {
  const source = read(...LAB_TAB)
  for (const forbidden of [
    'useState<LabState>',
    'useState<LabEvent\\[\\]>',
  ]) {
    assert.equal(
      new RegExp(forbidden).test(source),
      false,
      `LabTab 이 ${forbidden} 로 작업을 자기 안에 들고 있다 — 탭을 옮기면 사라진다`,
    )
  }
  assert.ok(/store\.labSession/.test(source), 'LabTab 이 스토어의 세션을 안 읽는다')

  // 음성 대조군 — 탐지식이 실제로 그런 useState 를 잡는지.
  assert.equal(/useState<LabState>/.test('const [s, set] = useState<LabState>(X)'), true, '탐지식이 헛돈다')
})

test('3) 문항이 바뀌면 버리고, 같은 문항이면 이어 쓴다 — 둘을 헷갈리면 남의 출력이 섞이거나 내 작업이 날아간다', () => {
  const source = read(...LAB_TAB)
  assert.ok(
    /if \(session\?\.qaId === qaId\) return;/.test(source),
    '같은 문항으로 돌아왔을 때 그대로 이어 쓰지 않는다 — 탭 전환마다 초기화된다',
  )
  assert.ok(/setSession\(\{ qaId,/.test(source), '문항이 바뀌었을 때 새 세션을 안 만든다')
})

test('4) 우측 탭은 여전히 조건부 렌더다 — 이 계약이 그것을 전제로 서 있다', () => {
  // 🔑 렌더 방식을 바꿔 «항상 mount» 로 만들면 위 계약들의 이유가 사라진다.
  //    그때는 이 파일을 지우는 게 아니라 **왜 바꿨는지**를 여기 적어야 한다.
  const panel = read('components', 'learn', 'ContentPanel.tsx')
  assert.ok(/activeTab === 'lab' \?/.test(panel), 'ContentPanel 의 실습 탭 렌더 방식이 바뀌었다 — 이 계약을 다시 읽을 것')
})

test('5) 첫 출력 뒤 늦은 커밋이 와도 state·lines·history 를 서로 덮지 않는다', () => {
  const { useLearnStore } = require(CLIENT(...STORE)) as { useLearnStore: LearnStoreApi }
  const shell = require(CLIENT('lib', 'lab-shell')) as {
    INITIAL_LAB_STATE: LabState
    openingEvents: () => unknown[]
  }
  const setSession = useLearnStore.getState().setLabSession
  const qaId = 'ch18_q04'
  const opening = shell.openingEvents()

  try {
    // 마운트 초기화 다음에 폭 측정이 늦게 오는 실제 순서다.
    setSession({ qaId, state: shell.INITIAL_LAB_STATE, lines: opening, history: [] })
    setSession((current) =>
      current?.qaId === qaId
        ? { ...current, state: { ...current.state, env: { widthPx: 390, canPaste: false } } }
        : current,
    )

    const measured = useLearnStore.getState().labSession
    assert.ok(measured && typeof measured !== 'function', 'updater 가 최신 세션에 적용되지 않고 세션 값이 되어 버렸다')
    assert.deepEqual(measured.lines, opening, '폭 측정 커밋이 처음 출력 lines 를 지웠다')
    assert.deepEqual(measured.history, [], 'state 커밋이 history 를 바꿨다')
    assert.equal(measured.state.env.widthPx, 390, '폭 측정 state 가 저장되지 않았다')

    setSession((current) => (current?.qaId === qaId ? { ...current, history: ['ls'] } : current))
    setSession((current) =>
      current?.qaId === qaId ? { ...current, lines: [...current.lines, { kind: 'line', text: 'late' }] } : current,
    )
    const finished = useLearnStore.getState().labSession
    assert.ok(finished)
    assert.equal(finished.state.env.widthPx, 390, 'lines 커밋이 최신 state 를 되돌렸다')
    assert.deepEqual(finished.history, ['ls'], 'lines 커밋이 최신 history 를 되돌렸다')
    assert.equal(finished.lines.length, opening.length + 1, '늦은 lines 커밋이 처음 출력을 이어 붙이지 않았다')

    // React effect 자체는 Node 에서 못 돌리므로, 화면이 실제 updater 경로를 쓰는지만 텍스트로 잇는다.
    const source = read(...LAB_TAB)
    assert.ok(/setSession\(\(current\) =>/.test(source), 'LabTab 커밋이 스토어의 최신 세션을 읽지 않는다')
    assert.equal(
      /setSession\(\{ qaId, state, lines, history, \.\.\.next \}\)/.test(source),
      false,
      'LabTab 커밋이 렌더 시점의 state·lines·history 를 다시 저장한다',
    )
  } finally {
    setSession(null)
  }
})
