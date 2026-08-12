// 🎬 시연작(B형)이 **B형인 채로 남아 있는가**에 대한 계약.
//
// 🚨 왜 있는가(2026-08-12, 에픽 6/6): architecture 는 오래 **C형**이었다 — 「수업 시연 시작」이
//    그냥 `/library` 목록으로 이동할 뿐이라 시연 세션도 QR 도 없었고, 그래서
//    `shared/demo-screen-qr-inventory.md` 에 «B형 신설 필요»로 등재돼 있었다.
//    B형의 정의는 «교사가 학생 경험 자체를 직접 밟아 보이고, 학생이 QR 로 그 자리에 들어온다».
//
// 🔑 여기서 지키는 것은 그 정의를 이루는 **세 가지 되돌아가기 쉬운 부분**이다:
//    ① 진입할 때마다 목록부터(직전 선택으로 직행 금지, §9.H-14 v1.8)
//    ② 들어올 때마다 새 시연 세션(기존 세션 재사용 = 지난 학생·진도 물려받기. plan 이 그렇게 터졌다)
//    ③ QR 은 조건부로 숨기지 않는다(미준비면 disabled)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const DEMO_PAGE = 'client/src/pages/TeacherDemoPage.tsx'
const LEARN_PAGE = 'client/src/pages/LearnPage.tsx'
const APP = 'client/src/App.tsx'

test('① 시연작 입구가 실제로 라우트에 걸려 있다 — 화면만 있고 못 들어가는 상태 금지', () => {
  const app = read(APP)
  assert.ok(/path="\/teacher\/demo"/.test(app), `${APP} 에 /teacher/demo 라우트가 없다 — 시연작에 들어갈 길이 없다`)
  assert.ok(
    /TeacherDemoPage/.test(app),
    `${APP} 이 TeacherDemoPage 를 걸지 않았다 — 라우트만 있고 그리는 화면이 없다`,
  )

  const dash = read('client/src/pages/TeacherDashboardPage.tsx')
  assert.ok(
    /to="\/teacher\/demo"/.test(dash),
    '교사 대시보드에 시연작으로 가는 링크가 없다 — 주소를 아는 사람만 쓸 수 있는 기능이 된다',
  )
})

test('② 진입할 때마다 목록부터 — 직전 선택을 기억하는 곳이 없다', () => {
  const source = read(DEMO_PAGE)

  // 고른 값은 컴포넌트 안에서만 산다. 화면 밖(localStorage·전역 스토어·URL)에 남으면
  // 다음 진입이 그 값으로 직행하게 되고, 그게 §9.H-14 v1.8 이 금지한 상태다.
  assert.ok(
    /useState<number \| null>\(null\)/.test(source),
    `${DEMO_PAGE} 의 선택 초기값이 null 이 아니다 — 들어오자마자 무언가 골라져 있으면 «목록부터»가 아니다`,
  )
  for (const [pattern, why] of [
    ['localStorage', '고른 강이 브라우저에 남으면 다음 진입이 그 강으로 직행한다'],
    ['sessionStorage', '위와 같다'],
    ['useLearnStore|useSessionStore\\(\\(state\\) => state\\.currentSession', '전역 상태에서 직전 선택을 되살리는 자리'],
  ]) {
    assert.equal(
      new RegExp(pattern).test(source),
      false,
      `${DEMO_PAGE} 가 직전 선택을 기억할 수 있는 자리를 갖고 있다 — ${why}`,
    )
  }

  // 음성 대조군 — 탐지식이 실제로 그 모양을 잡는지.
  assert.equal(/localStorage/.test("localStorage.getItem('x')"), true, '탐지식이 못 잡으면 ② 는 실패할 수 없다')
})

test('③ 들어올 때마다 새 시연 세션을 만든다 — 지난 시연의 학생·진도를 물려받지 않게', () => {
  const source = read(DEMO_PAGE)
  assert.ok(
    /createSession\(/.test(source),
    `${DEMO_PAGE} 가 세션을 새로 만들지 않는다 — 기존 세션을 재사용하면 지난 시연의 참여자와 진도가 그대로 딸려 온다`,
  )
  assert.ok(
    /chapterIds: \[selected\.id\]/.test(source),
    `${DEMO_PAGE} 가 고른 강 하나만 담지 않는다 — 시연은 «이 강 하나»를 보이는 일이다`,
  )
  assert.ok(
    /role=teacher&demo=1/.test(source),
    `${DEMO_PAGE} 가 시연 표시 없이 학습 화면으로 보낸다 — 시연 바(QR·끝내기)가 안 뜬다`,
  )
})

test('④ QR 은 조건부로 숨기지 않는다 — 미준비면 disabled 로 자리를 지킨다', () => {
  const source = read(LEARN_PAGE)
  const bar = source.match(/function DemoBar\([\s\S]*?\n\}\n/)
  assert.ok(bar, `${LEARN_PAGE} 에 시연 바가 없다 — 시연 중에 QR 도 끝내기도 없다`)

  assert.ok(
    /disabled=\{!code\}/.test(bar![0]),
    'QR 버튼이 «코드가 없으면 disabled» 가 아니다 — 버튼이 사라졌다 나타나면 교사는 QR 이 없는 앱으로 읽는다',
  )
  assert.equal(
    /\{code \? \([\s\S]{0,200}QR코드/.test(bar![0]),
    false,
    'QR 버튼이 코드 유무로 통째로 안 그려지고 있다 — 목업 S6 은 숨기지 말라고 못박았다',
  )
  assert.ok(/시연 끝내기/.test(bar![0]), '시연을 끝내는 버튼이 없다 — 교사가 시연 화면에서 못 빠져나온다')
})

test('⑤ 시연 표시가 문항을 옮겨도 따라온다 — 한 번 누르면 사라지는 바 금지', () => {
  const source = read(LEARN_PAGE)
  assert.ok(
    /isDemoMode \? '&demo=1' : ''/.test(source),
    `${LEARN_PAGE} 의 문항 이동 링크가 시연 표시를 안 싣는다 — 다음 문항으로 넘어가는 순간 QR·끝내기가 사라진다`,
  )
  assert.ok(
    /const isDemoMode = isTeacherPreview &&/.test(source),
    '시연 모드가 교사 미리 보기를 전제로 하지 않는다 — 학생 화면에 시연 바가 뜰 수 있다',
  )
})

test('⑥ 가드가 실패할 수 있는 계측인지 — 대조 대상 파일이 비어 있지 않다', () => {
  for (const rel of [DEMO_PAGE, LEARN_PAGE, APP]) {
    assert.ok(read(rel).length > 500, `${rel} 이 비어 있으면 위 검사들이 공짜로 통과한다`)
  }
})
