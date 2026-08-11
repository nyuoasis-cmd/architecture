// 학습 화면이 **한 종류뿐인가**에 대한 계약.
//
// 🚨 왜 있는가(2026-08-11, 에픽 2/6): 화면 골격이 «이 장에 extras 가 있는가»로 갈려 있었다.
//    3컬럼(문항 목록 · AI 챗봇 · 콘텐츠)이 승인된 골격인데, 견학 데이터가 107/107 문항에 붙자
//    그 조건이 17/17 장을 참으로 만들어 **3컬럼이 도달 불가 죽은 코드**가 됐다.
//    좌측 문항 목록과 챗봇 컬럼이 통째로 안 그려졌고, 몇 주 동안 아무도 안 알려 줬다.
//    콘텐츠를 채우는 일이 화면 골격을 조용히 뒤집은 것이다.
//
// 🔑 그래서 여기서 막는 것은 «3컬럼이 예쁜가»가 아니라 **«분기가 다시 생겼는가»**이다.
//    데이터의 많고 적음은 우측 탭 개수로만 나타나야 한다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const LEARN_PAGE = 'client/src/pages/LearnPage.tsx'
const CONTENT_PANEL = 'client/src/components/learn/ContentPanel.tsx'
const NAV_PANEL = 'client/src/components/learn/ChapterNavPanel.tsx'

test('① 학습 화면에 세 컬럼이 전부 살아 있다 — 하나라도 빠지면 학생이 못 보는 기능이 생긴다', () => {
  const source = read(LEARN_PAGE)
  for (const [component, why] of [
    ['ChapterNavPanel', '좌측 문항 목록이 없으면 학생이 이 장의 어디쯤인지 모른다'],
    ['ChatPanel', 'AI 챗봇은 학생이 막혔을 때 물어볼 유일한 통로다'],
    ['ContentPanel', '읽기·시연·견학·내 차례·퀴즈가 전부 여기 있다'],
  ]) {
    assert.ok(
      new RegExp(`<${component}\\b`).test(source),
      `${LEARN_PAGE} 가 <${component}> 을 그리지 않는다 — ${why}`,
    )
  }

  // 음성 대조군 — 정규식이 무엇이든 통과시키면 위 셋은 공짜다.
  assert.equal(/<NotARealPanel\b/.test(source), false, '없는 컴포넌트가 «있다»고 나오면 탐지가 헛돈다')
})

test('② 형판을 가르는 분기가 없다 — 죽은 컬럼을 만든 그 조건이 되살아나지 않게', () => {
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
    'LearnPage 가 extras 유무로 무언가를 가르고 있다 — extras 는 탭 개수만 정해야 한다',
  )

  // 음성 대조군 — 탐지식이 실제로 그런 import 를 잡는지.
  assert.equal(
    /import\s+(\w*(?:Layout|Learn\w*Layout))\s+from/.test("import VibeLearnLayout from './x'"),
    true,
    '탐지 정규식이 형판 import 를 못 잡으면 ② 는 실패할 수 없는 계측이다',
  )
})

test('③ 우측 탭은 데이터가 있을 때만 켜진다 — 빈 탭도, 안 켜지는 콘텐츠도 막는다', () => {
  const source = read(CONTENT_PANEL)
  assert.ok(/getExtras\(/.test(source), `${CONTENT_PANEL} 이 extras 를 안 읽으면 견학·내 차례가 영영 안 뜬다`)
  for (const [guard, tab] of [
    ['extras\\?\\.tour\\?\\.length', '🚌 견학'],
    ['extras\\?\\.myTurn', '✋ 내 차례'],
  ]) {
    assert.ok(
      new RegExp(guard).test(source),
      `${CONTENT_PANEL} 이 ${tab} 탭을 데이터 없이 켜거나 데이터가 있어도 안 켠다`,
    )
  }
})

test('④ 폭 예외가 코드에 살아 있다 — 3컬럼은 1440px 로 연다', () => {
  // 🚨 DESIGN-POLICY §9.D-5 의 기본 폭(1184)으로 줄이면 3컬럼에서 콘텐츠가 584px 밖에 안 남아
  //    코드 블록이 있는 장이 답답해진다. 그래서 이 화면만 예외다(정책 본문에 명문화됨, 2026-08-11).
  assert.ok(
    /max-w-\[1440px\]/.test(read(LEARN_PAGE)),
    `${LEARN_PAGE} 의 폭 예외가 사라졌다 — 정책 본문(§9.D-5)과 코드가 어긋난다`,
  )
})

test('⑤ 좌측은 «이 장의 문항»만 세운다 — 전 장을 늘어놓으면 지금 위치가 묻힌다', () => {
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

test('⑥ 가드가 실패할 수 있는 계측인지 — 대조 대상 파일이 비어 있지 않다', () => {
  for (const rel of [LEARN_PAGE, CONTENT_PANEL, NAV_PANEL]) {
    assert.ok(read(rel).length > 500, `${rel} 이 비어 있으면 위 검사들이 공짜로 통과한다`)
  }
})
