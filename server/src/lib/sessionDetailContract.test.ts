// 수업 현황 상세 화면이 «되돌릴 수 없는 일 앞에 서는가»에 대한 계약. BUILDER-UX-POLICY §4-A·§6.
//
// 🚨 왜 있는가(2026-08-14): 「수업 종료」가 **아무것도 묻지 않고 즉시** 실행됐다.
//    confirm() 조차 없었다 — 그래서 오히려 더 나빴다. 진행 중인 수업이 오클릭 한 번에 끝나고,
//    그 순간부터 학생은 못 들어온다. 되돌리는 길은 없다(새 수업을 만들고 코드를 다시 나눠 줘야 한다).
//
// 🔑 그래서 여기서 지키는 것은 «모달이 예쁜가»가 아니라 **endSession 호출이 확인 뒤에만 있는가**이다.
//    버튼 onClick 에 직결되는 순간 계약이 빨개진다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { stripComments } from './strip-comments'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const DETAIL = 'client/src/pages/TeacherSessionPage.tsx'
const MODAL = 'client/src/components/common/ConfirmModal.tsx'

test('1) 수업 종료는 확인 모달을 거친다 — 버튼 onClick 에 직결되지 않는다', () => {
  const source = read(DETAIL)

  assert.ok(/<ConfirmModal\b/.test(source), `${DETAIL} 에 확인 모달이 없다 — 종료가 오클릭 한 번에 실행된다`)

  const calls = [...source.matchAll(/endSession\(/g)].map((match) => match.index ?? -1)
  assert.equal(calls.length, 1, `endSession 호출이 ${calls.length}곳이다 — 확인을 거치지 않는 통로가 생겼는지 볼 것`)

  const modalAt = source.indexOf('<ConfirmModal')
  assert.ok(
    calls[0] > modalAt,
    'endSession 이 확인 모달보다 앞에서 불린다 — 모달 밖에서 종료가 실행되는 자리다',
  )
})

test('2) confirm()·alert() 로 확인을 때우지 않는다 (§6 금지)', () => {
  const source = read(DETAIL)
  for (const banned of ['window.confirm(', 'window.alert(']) {
    assert.equal(source.includes(banned), false, `${DETAIL} 이 ${banned} 를 쓴다 — §6 은 커스텀 모달을 요구한다`)
  }
})

test('3) 「← 내 수업」 뒤로 링크가 있다 — 브라우저 뒤로가기에만 기대지 않는다 (§4-A 금지)', () => {
  const source = read(DETAIL)
  assert.ok(/to="\/teacher"/.test(source), `${DETAIL} 에 목록으로 돌아가는 링크가 없다`)
  assert.ok(source.includes('내 수업'), `${DETAIL} 의 뒤로 링크 문구가 「내 수업」이 아니다`)
})

test('4) 통계 3열이 있고 참여자 수가 그 안에 있다 (§4-A 「통계에 참여자 수 누락」 금지)', () => {
  const source = read(DETAIL)
  assert.ok(/grid-cols-3/.test(source), `${DETAIL} 에 3열 통계 그리드가 없다`)
  for (const label of ['참여 학생', '열어 본 문항', '진행 중']) {
    assert.ok(source.includes(label), `통계 칸 「${label}」이 없다`)
  }
  // 🚨 「읽은 문항」으로 되돌리지 말 것 — 진도 행은 문항을 **여는 순간** 생긴다(session-progress.ts).
  //    「읽은」이라고 적으면 교사가 이해도까지 봤다고 오해한다.
  assert.equal(stripComments(source).includes('읽은 문항'), false, '「읽은 문항」은 앱이 알 수 없는 것을 안다고 말하는 문구다')
})

test('5) 확인 모달을 닫는 길이 셋이다(백드롭·ESC·X) + 파괴 버튼이 자동 포커스되지 않는다', () => {
  const source = read(MODAL)
  assert.ok(/onClick=\{onClose\}/.test(source), '백드롭 클릭으로 닫히지 않는다')
  assert.ok(/'Escape'/.test(source), 'ESC 로 닫히지 않는다')
  assert.ok(/aria-label="닫기"/.test(source), 'X 버튼이 없다')
  assert.ok(/document\.body\.style\.overflow/.test(source), '모달 뒤 본문이 같이 스크롤된다')
  assert.ok(
    /cancelRef\.current\?\.focus\(\)/.test(source),
    '포커스가 「취소」에 있지 않다 — 열자마자 Enter 를 누르면 수업이 끝난다',
  )
})

test('6) 상세 헤더가 §4-A 형태다 — 900px · 22px 제목 · 목록과 같은 상태/코드 뱃지', () => {
  const source = read(DETAIL)
  assert.ok(/max-w-\[900px\]/.test(source), '컨테이너가 900px 이 아니다')
  assert.equal(/max-w-6xl/.test(source), false, '옛 6xl 컨테이너가 남아 있다')
  assert.ok(/text-\[22px\] font-semibold/.test(source), '제목이 22px semibold 가 아니다(36px 짜리가 남았는지)')
  assert.ok(/bg-emerald-50/.test(source) && /animate-pulse/.test(source), '진행 중 상태 뱃지가 §4 카드와 다르다')
  assert.equal(
    /font-mono text-\[32px\]/.test(source),
    false,
    '32px 검정 코드 블록이 남아 있다 — 목록에서 들어오면 화면이 갈아탄 것처럼 보인다',
  )
  // 주석에 적힌 경위(«예전엔 …Live Session 이라»)는 남겨 둔다 — 화면 문구만 본다.
  assert.equal(/Live Session/.test(stripComments(source)), false, 'eyebrow 「Live Session」이 남아 있다')
})

test('7) 학생 목록이 §4-A 표준 행이다 — 상태 뱃지 세 종 + 컨테이너 하나', () => {
  const source = read('client/src/components/teacher/ParticipantList.tsx')
  for (const label of ['완성', '진행 중', '대기']) {
    assert.ok(source.includes(`'${label}'`), `상태 뱃지 「${label}」이 없다`)
  }
  assert.ok(/overflow-hidden rounded-xl border/.test(source), '행들이 컨테이너 하나 안에 있지 않다')
  assert.equal(/style=\{\{ width: `\$\{ratio\}%` \}\}/.test(source), false, '카드마다 진도바를 그리던 형태가 남아 있다')
  assert.ok(source.includes('아직 들어온 학생이 없어요'), '빈 상태 문구가 §9 형태가 아니다')
})

test('8) 시연작 입구를 밖에 다시 만들지 않았다 — 2026-08-14 철거분이 되살아나면 빨개진다', () => {
  const app = read('client/src/App.tsx')
  assert.equal(/teacher\/demo/.test(app), false, '/teacher/demo 라우트가 되살아났다(CLAUDE.md 🎬 항목을 읽을 것)')
  assert.equal(/TeacherDemoPage/.test(app), false, 'TeacherDemoPage 가 되살아났다')

  const learn = read('client/src/pages/LearnPage.tsx')
  assert.equal(/DemoBar|isDemoMode|demo=1/.test(learn), false, '시연 바가 되살아났다 — 「시연 끝내기」가 수업을 끝냈다')

  // 지금 있는 시연작 = 수업 현황 상세의 「🎬 시연하기」. 이게 사라지면 시연이 없어진다.
  assert.ok(read(DETAIL).includes('🎬 시연하기'), '시연 입구(시연하기)가 사라졌다')
})

test('9) 시연 문구가 용어 정본(ui-glossary §H) 한 계열이다 — 명사=시연작 · 동작=시연하기 · 모드=시연 모드', () => {
  // 🚨 2026-08-15 jery: 앱마다 다른 말을 쓰는 비용이 «낱말이 두 가지로 읽히는» 비용보다 크다.
  //    한동안 «학생 화면 미리 보기»로 적어 두었던 것을 단일 용어로 되돌렸다.
  for (const file of [DETAIL, 'client/src/pages/LibraryPage.tsx']) {
    const body = stripComments(read(file))
    assert.equal(
      /미리\s?보기/.test(body),
      false,
      `${file} 에 「미리 보기」가 남아 있다 — §H 는 시연작/시연하기/시연 모드 한 계열만 쓴다`,
    )
  }

  const library = stripComments(read('client/src/pages/LibraryPage.tsx'))
  assert.ok(library.includes('시연작'), '시연작 진입 화면 제목이 §H 용어가 아니다')
  assert.ok(library.includes('시연 모드'), '시연 중임을 알리는 표시가 §H 용어가 아니다')
})

test('10) 없는 버튼을 약속하지 않는다 — 「수업을 시작하세요」 금지 (2026-08-16 신입샘 t2)', () => {
  // 🚨 이 화면에 있는 버튼은 시연하기·QR 전체화면·수업 종료 셋뿐이다. «시작»은 없고, 없는 게 맞다 —
  //    학생은 코드로 들어오는 순간 각자 진행한다. 그런데 문구가 시작을 약속하면 초임 교사는
  //    「학생이 들어왔어요! 근데 수업을 어떻게 시작하지?」에서 멈춘다(신입샘 s3 vs s5).
  // 🔑 그래서 검사는 «버튼이 있는가»가 아니라 **«없는 것을 약속하지 않는가»**를 본다.
  const body = stripComments(read(DETAIL))
  assert.equal(
    /수업을\s?시작(하세요|합니다|해)/.test(body),
    false,
    `${DETAIL} 이 「수업을 시작하세요」라고 약속한다 — 누를 버튼이 없는데 있다고 말하는 셈이다`,
  )

  // 학생이 들어온 뒤에도 «누를 것이 없다»를 말해 준다. 안 말하면 교사는 계속 찾는다.
  assert.ok(
    body.includes('각자 진행'),
    `${DETAIL} 이 «학생이 각자 진행한다»를 안 말한다 — 교사가 없는 시작 버튼을 찾게 된다`,
  )

  // 🚨 음성 대조군 — 검사가 실제로 문구를 보고 있는가. 화면에 실제로 있는 버튼 셋은 그대로여야 한다.
  for (const label of ['🎬 시연하기', '📱 QR 전체화면', '수업 종료']) {
    assert.ok(body.includes(label), `${DETAIL} 에서 «${label}» 이 사라졌다 — 이 검사가 헛돌고 있다`)
  }
})
