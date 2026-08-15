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
