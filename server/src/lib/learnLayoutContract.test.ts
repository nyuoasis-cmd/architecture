// 학습 화면이 **한 종류뿐인가**에 대한 계약.
//
// 🚨 왜 있는가(2026-08-11, 에픽 2/6): 화면 골격이 «이 장에 extras 가 있는가»로 갈려 있었다.
//    승인된 골격이 있는데, 견학 데이터가 107/107 문항에 붙자 그 조건이 17/17 장을 참으로
//    만들어 **승인된 골격이 도달 불가 죽은 코드**가 됐다. 좌측 문항 목록 컬럼이 통째로
//    안 그려졌고, 몇 주 동안 아무도 안 알려 줬다. 콘텐츠를 채우는 일이 화면 골격을
//    조용히 뒤집은 것이다.
//
// 🔑 2026-08-17 체험 재구조화(SDD-experience-first-restructure) 개정: 골격은 이제
//    **2컬럼(문항 목록 · 콘텐츠) + 학생 탭 «읽기 → 체험 → 퀴즈»** 다. 철거된 것 —
//    좌측 AI 챗봇 컬럼 · ✋ 내 차례 탭 · 🧪 실습 현황 탭 · 🚌 견학 탭(체험으로 흡수).
//    여기서 막는 것은 «화면이 예쁜가»가 아니라 **«분기·철거물이 되살아났는가»**이다.
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import { stripComments } from './strip-comments'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const LEARN_PAGE = 'client/src/pages/LearnPage.tsx'
const CONTENT_PANEL = 'client/src/components/learn/ContentPanel.tsx'
const NAV_PANEL = 'client/src/components/learn/ChapterNavPanel.tsx'
const LEARN_STORE = 'client/src/store/learn-store.ts'

test('1) 학습 화면에 두 컬럼이 전부 살아 있다 — 하나라도 빠지면 학생이 못 보는 기능이 생긴다', () => {
  const source = read(LEARN_PAGE)
  for (const [component, why] of [
    ['ChapterNavPanel', '좌측 문항 목록이 없으면 학생이 이 장의 어디쯤인지 모른다'],
    ['ContentPanel', '읽기·체험·퀴즈가 전부 여기 있다'],
  ]) {
    assert.ok(
      new RegExp(`<${component}\\b`).test(source),
      `${LEARN_PAGE} 가 <${component}> 을 그리지 않는다 — ${why}`,
    )
  }

  // 음성 대조군 — 정규식이 무엇이든 통과시키면 위 둘은 공짜다.
  assert.equal(/<NotARealPanel\b/.test(source), false, '없는 컴포넌트가 «있다»고 나오면 탐지가 헛돈다')
})

test('2) 형판을 가르는 분기가 없다 — 죽은 컬럼을 만든 그 조건이 되살아나지 않게', () => {
  const source = read(LEARN_PAGE)
  // 🚨 «데이터가 있으면 다른 화면»이 이 사고의 형태였다. 이름이 무엇으로 바뀌든,
  //    LearnPage 가 두 번째 형판 컴포넌트를 들고 있으면 같은 사고가 다시 난다.
  const layoutImports = [...source.matchAll(/import\s+(\w*(?:Layout|Learn\w*Layout))\s+from/g)].map((m) => m[1])
  assert.deepEqual(
    layoutImports,
    [],
    `LearnPage 가 별도 형판 컴포넌트를 들여왔다 — 화면이 둘로 갈리는 자리다: ${layoutImports.join(', ')}`,
  )

  assert.equal(
    /chapterUsesExtrasLayout|EXTRAS_CHAPTER_IDS/.test(source),
    false,
    'LearnPage 가 extras 유무로 무언가를 가르고 있다 — extras 는 탭 안의 부품만 정해야 한다',
  )

  // 음성 대조군 — 탐지식이 실제로 그런 import 를 잡는지.
  assert.equal(
    /import\s+(\w*(?:Layout|Learn\w*Layout))\s+from/.test("import VibeLearnLayout from './x'"),
    true,
    '탐지 정규식이 형판 import 를 못 잡으면 2) 는 실패할 수 없는 계측이다',
  )
})

test('3) 🧭 체험 탭은 전 문항에 있다 — 강마다 탭이 출렁이지 않는다 (SDD 결정 4)', () => {
  const source = read(CONTENT_PANEL)
  // 체험 탭은 조건 없이 켜진다. 조건이 붙는 순간 «어떤 문항엔 체험이 없는» 화면이 된다.
  const pushes = [...source.matchAll(/list\.push\('exp'\)/g)]
  assert.equal(pushes.length, 1, `체험 탭을 켜는 자리가 ${pushes.length} 곳이다 — 한 곳이어야 한다`)
  const guard = source.match(/if \(teacherPanel\) \{([\s\S]*?)\n {4}\}/)
  assert.ok(guard, `${CONTENT_PANEL} 에 «if (teacherPanel)» 블록이 없다`)
  assert.equal(
    guard![1].includes("list.push('exp')"),
    false,
    '체험 탭이 교사 전용 블록 안에서 켜지고 있다 — 학생 화면에 체험이 안 뜬다',
  )
  // 체험 탭을 켜는 줄 앞뒤로 if 조건이 붙어 있지 않은지 — 줄 단위로 본다.
  const lines = source.split('\n')
  const expLine = lines.findIndex((line) => line.includes("list.push('exp')"))
  assert.ok(expLine >= 0)
  const before = lines.slice(Math.max(0, expLine - 2), expLine).join('\n')
  assert.equal(
    /if\s*\(/.test(before.replace(/\/\/.*$/gm, '')),
    false,
    "list.push('exp') 바로 앞에 조건이 붙었다 — 체험 탭은 전 문항에 무조건 있어야 한다",
  )

  // 🎮 시연은 여전히 데이터가 있을 때만.
  assert.ok(/if \(inlineMeta\)/.test(source), '🎮 시연 탭이 데이터 유무와 무관하게 켜지거나 사라졌다')
})

test('4) 폭 예외가 코드에 살아 있다 — 이 화면은 1440px 로 연다', () => {
  // 🚨 DESIGN-POLICY §9.D-5 의 기본 폭(1184)으로 줄이면 콘텐츠 컬럼에 코드 블록·터미널이
  //    답답해진다. 그래서 이 화면만 예외다(정책 본문에 명문화됨, 2026-08-11).
  assert.ok(
    /max-w-\[1440px\]/.test(read(LEARN_PAGE)),
    `${LEARN_PAGE} 의 폭 예외가 사라졌다 — 정책 본문(§9.D-5)과 코드가 어긋난다`,
  )
})

test('5) 좌측은 «이 장의 문항»만 세운다 — 전 장을 늘어놓으면 지금 위치가 묻힌다', () => {
  const source = read(NAV_PANEL)
  assert.ok(
    /chapterQas\.map\(/.test(source),
    `${NAV_PANEL} 이 이 장의 문항 목록을 안 그린다 — 학생이 장 안에서 이동할 방법이 없다`,
  )
  assert.equal(
    /QA_STUBS|allSessionQas\.map\(/.test(source),
    false,
    `${NAV_PANEL} 이 장 밖의 문항까지 세우고 있다 — 고르는 일은 색인(LibraryPage)의 몫이다`,
  )
})

test('7) 교사 전용 탭은 교사에게만 켜진다 — 학생 화면에 교사 대본이 새지 않게', () => {
  // 🚨 왜 있는가(2026-08-12, 에픽 6/6): 교사 전용 탭이 교사 세션 화면에서 학생과 **같은 화면**의
  //    탭으로 들어왔다(§9.H-14 = 교사 화면은 학생 화면의 상위집합). 같은 화면을 쓴다는 것은
  //    한 줄만 어긋나도 학생이 교사 대본을 읽게 된다는 뜻이다 — 그리고 그건 학생 계정으로
  //    열어 보기 전까지 아무도 안 알려 준다.
  // 🔑 교사 전용 탭은 「📋 설명 노트」 하나다. **계약은 지운 게 아니라 대상이 준 것이다.**
  const source = read(CONTENT_PANEL)

  const guard = source.match(/if \(teacherPanel\) \{([\s\S]*?)\n {4}\}/)
  assert.ok(guard, `${CONTENT_PANEL} 에 «if (teacherPanel)» 블록이 없다 — 교사 전용 탭을 가르는 자리가 사라졌다`)

  for (const [tab, label] of [['explain', '📋 설명 노트']]) {
    const pushes = [...source.matchAll(new RegExp(`list\\.push\\('${tab}'\\)`, 'g'))].length
    assert.equal(
      pushes,
      1,
      `${CONTENT_PANEL} 이 ${label} 탭을 ${pushes} 곳에서 켜고 있다 — 켜는 자리는 «if (teacherPanel)» 한 곳뿐이어야 한다`,
    )
    assert.ok(
      guard![1].includes(`list.push('${tab}')`),
      `${label} 탭이 «if (teacherPanel)» 블록 밖에서 켜지고 있다 — 학생 화면에 샌다`,
    )
  }

  // 🚨 교안이 되살아나는 것도 여기서 잡는다. 「수업을 어떤 순서로 하라」를 앱이 다시 말하기
  //    시작하면 P4(수업 흐름은 교사가 정한다)가 무너지고, 그건 화면을 열기 전까지 안 보인다.
  //    🔑 `lessonNo`(진열 「N강」)까지 물지 않게 표적을 좁힌다 — 그건 chapterOrderContract ⑥ 이
  //       **요구하는** 것이다. 넓은 정규식은 남의 계약을 깨뜨린다.
  assert.equal(
    /'lesson'|LessonPlan|교안/.test(source),
    false,
    `${CONTENT_PANEL} 에 교안이 되살아났다 — 2026-08-12 에 철거한 것이다(HANDOFF-lesson-plan-teardown)`,
  )

  // 음성 대조군 — 블록 추출식이 실제로 블록 안팎을 가르는지.
  const probe = "    if (teacherPanel) {\n      list.push('quiz');\n    }\n    list.push('explain');"
  const probeGuard = probe.match(/if \(teacherPanel\) \{([\s\S]*?)\n {4}\}/)
  assert.equal(
    probeGuard![1].includes("list.push('explain')"),
    false,
    '추출식이 블록 밖의 push 를 블록 안으로 세면 7) 은 실패할 수 없는 계측이다',
  )
})

test('8) 철거된 것이 되살아나지 않는다 — 챗봇 컬럼 · 내 차례 탭 · 실습 현황 탭 · 견학 탭', () => {
  // 🚨 왜 있는가(2026-08-17 체험 재구조화): 화면 골격에서 넷을 철거했다.
  //    · 좌측 AI 챗봇 컬럼 — AI 보조는 체험(실습실 ai▸ 목소리) 안에 산다 (SDD 결정 5)
  //    · ✋ 내 차례 탭 — 역할(짧게 써서 AI 피드백)은 체험 안 미션으로 흡수
  //    · 🧪 실습 현황 탭 — 필요분만 «수업 현황» 대시보드로 이관
  //    · 🚌 견학 탭 — 체험 탭 앞부분으로 흡수(탭으로서만 철거, 데이터·화면은 체험 안에 산다)
  //    철거물이 탭 하나로 슬쩍 돌아오면 «학생 세 걸음» 골격이 다시 여섯 탭으로 불어난다.
  const page = read(LEARN_PAGE)
  const panel = read(CONTENT_PANEL)
  const store = read(LEARN_STORE)

  assert.equal(/ChatPanel|chat-client|tabHidesChat/.test(page), false, `${LEARN_PAGE} 에 챗봇 컬럼이 되살아났다`)
  for (const gone of ["'myturn'", "'labclass'", "'tour'", "'lab'"]) {
    assert.equal(
      new RegExp(`list\\.push\\(${gone}\\)`).test(panel),
      false,
      `${CONTENT_PANEL} 이 철거된 탭 ${gone} 을 다시 켜고 있다`,
    )
  }
  assert.equal(/MyTurnTab|LabClassTab/.test(panel), false, `${CONTENT_PANEL} 이 철거된 컴포넌트를 들고 있다`)

  // 스토어의 탭 enum 도 세 걸음 + 시연 + 교사 노트뿐이다.
  const enumLine = store.match(/export type ContentTab = ([^\n]+)/)
  assert.ok(enumLine, `${LEARN_STORE} 에 ContentTab 이 없다`)
  assert.deepEqual(
    [...enumLine![1].matchAll(/'(\w+)'/g)].map((m) => m[1]).sort(),
    ['demo', 'exp', 'explain', 'quiz', 'read'],
    'ContentTab 에 철거된 탭이 남아 있거나 새 탭이 몰래 늘었다',
  )

  // 철거된 컴포넌트 파일 자체가 없다 — import 없이 파일만 남으면 다음 사람이 «있는 기능»으로 읽는다.
  for (const rel of [
    'client/src/components/learn/ChatPanel.tsx',
    'client/src/components/learn/MyTurnTab.tsx',
    'client/src/components/learn/LabClassTab.tsx',
    'client/src/lib/chat-client.ts',
    'server/src/routes/chat.ts',
    'server/src/lib/chat-service.ts',
  ]) {
    assert.equal(existsSync(path.join(ROOT, rel)), false, `철거된 파일이 남아 있다: ${rel}`)
  }
})

test('9) 체험 탭은 학생 탭이다 — 교사 블록 안으로 들어가면 학생이 실습을 못 한다', () => {
  const source = read(CONTENT_PANEL)
  const guard = source.match(/if \(teacherPanel\) \{([\s\S]*?)\n {4}\}/)
  assert.ok(guard, `${CONTENT_PANEL} 에 «if (teacherPanel)» 블록이 없다`)
  assert.equal(
    guard![1].includes("list.push('exp')"),
    false,
    '🧭 체험이 교사 전용 블록 안에서 켜지고 있다 — 학생 화면에 체험 탭이 안 뜬다',
  )
  // 실습실(LabTab)은 체험 탭 안에서 그려진다 — 렌더 자리가 사라지면 12강 실습이 통째로 죽는다.
  assert.ok(/<LabTab\b/.test(source), `${CONTENT_PANEL} 이 실습실(LabTab)을 그리지 않는다`)
})

test('10) 🎮 시연의 단계 선택은 그림 «위»에 온다 — 어느 폭에서든', () => {
  // 🚨 왜 있는가(2026-08-19 jery): 시연 탭의 자식 순서는 [시연 그림, 단계 선택]인데
  //    감싼 div 가 `flex-col-reverse … sm:flex-col` 이었다. 그래서 폰에서는 버튼이 위,
  //    **PC에서만 그림 아래**로 내려갔다 — 교사가 시연하는 화면이 정확히 그 갈래라,
  //    다음 단계로 넘길 버튼을 화면 아래에서 찾아야 했다.
  // 🔑 여기서 막는 것은 «reverse 를 다시 쓰는 것»과 «DOM 순서가 다시 뒤집히는 것» 둘이다.
  //    한쪽만 보면 나머지 하나로 같은 증상이 돌아온다.
  // 🔑 주석을 걷어내고 본다 — 이 계약은 「무엇이 되살아났나」를 낱말로 잡기 때문에,
  //    «전에는 flex-col-reverse 였다»고 적은 주석 한 줄이 계약을 빨갛게 만든다.
  const source = stripComments(read(CONTENT_PANEL))

  const demoBlock = source.match(/activeTab === 'demo' && InlineComponent \? \(([\s\S]*?)\n {8}\) : null}/)
  assert.ok(demoBlock, `${CONTENT_PANEL} 에서 🎮 시연 탭 렌더 블록을 찾지 못했다`)
  const block = demoBlock![1]

  const pickerAt = block.indexOf('<ScenarioPicker')
  const inlineAt = block.indexOf('<InlineComponent')
  assert.ok(pickerAt >= 0, '시연 탭에 단계 선택(ScenarioPicker)이 없다')
  assert.ok(inlineAt >= 0, '시연 탭에 시연 그림(InlineComponent)이 없다')
  assert.ok(
    pickerAt < inlineAt,
    '단계 선택이 시연 그림보다 뒤에 있다 — PC에서 버튼이 그림 아래로 내려간다(2026-08-19 jery)',
  )

  assert.equal(
    /flex-col-reverse/.test(block),
    false,
    '시연 탭에 flex-col-reverse 가 되살아났다 — 폭에 따라 순서가 뒤집히면 같은 증상이 돌아온다',
  )

  // 음성 대조군 — 블록 추출·순서 비교가 실제로 뒤집힌 순서를 잡는지.
  const probe = '<div><InlineComponent /><ScenarioPicker /></div>'
  assert.equal(
    probe.indexOf('<ScenarioPicker') < probe.indexOf('<InlineComponent'),
    false,
    '순서 비교가 뒤집힌 순서를 통과시키면 10) 은 실패할 수 없는 계측이다',
  )
})

test('6) 가드가 실패할 수 있는 계측인지 — 대조 대상 파일이 비어 있지 않다', () => {
  for (const rel of [LEARN_PAGE, CONTENT_PANEL, NAV_PANEL]) {
    assert.ok(read(rel).length > 500, `${rel} 이 비어 있으면 위 검사들이 공짜로 통과한다`)
  }
})
