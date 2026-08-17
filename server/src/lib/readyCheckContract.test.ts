// 준비 점검 화면의 계약 — SDD 결정 19 (목차 밖 1화면, 앱은 수업을 막지 않는다).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (...rel: string[]) => readFileSync(path.join(ROOT, ...rel), 'utf8')

const COMPONENT = read('client', 'src', 'components', 'learn', 'ReadyCheck.tsx')
const LEARN_PAGE = read('client', 'src', 'pages', 'LearnPage.tsx')

test('1) 점검 네 가지가 다 있다 — 브라우저 · 한글 입력 · 새 탭 · 외부 링크', () => {
  for (const item of ['브라우저', '한글 입력', '새 탭', '외부 링크']) {
    assert.ok(COMPONENT.includes(item), `준비 점검에 «${item}» 항목이 없다`)
  }
})

test('2) 앱이 수업을 막지 않는다 — 건너뛰기가 있고, 시작 버튼에 잠금 조건이 없다', () => {
  assert.ok(COMPONENT.includes('건너뛰기'), '건너뛰기가 없다 — 점검이 수업의 문턱이 된다')
  // 시작·건너뛰기 버튼이 disabled 조건에 매여 있지 않다.
  const start = COMPONENT.slice(COMPONENT.indexOf('수업 시작') - 400, COMPONENT.indexOf('수업 시작'))
  assert.equal(/disabled=/.test(start), false, '수업 시작이 점검 결과에 잠겨 있다 — 앱이 발맞춤을 강제한다 (결정 9)')
})

test('3) 외부 링크 «안 열려요»는 실패가 아니라 관측이다 — 스냅샷 안내가 뜬다', () => {
  assert.ok(/안 열려요/.test(COMPONENT), '차단 관측 버튼이 없다')
  assert.ok(/스냅샷/.test(COMPONENT), '차단 시 스냅샷 안내가 없다 — 학생이 «내 자리만 고장»으로 읽는다')
})

test('4) 한 수업당 한 번 · 학생만 · 목차 밖', () => {
  assert.ok(/localStorage/.test(COMPONENT), '한 번 봤다는 기억이 없다 — 새로고침마다 뜬다')
  assert.ok(/ready-check:\$\{sessionId\}/.test(COMPONENT), '기억 키가 수업 단위가 아니다')
  assert.ok(
    /readyCheckOpen && !isTeacherPreview/.test(LEARN_PAGE),
    '교사 시연에도 점검이 뜬다 — 리허설은 시연 모드 + 노트가 맡는다 (SDD 결정 19)',
  )
  // 목차 밖 — 새 라우트를 만들지 않았다(«0강»을 세우지 않는다).
  const app = read('client', 'src', 'App.tsx')
  assert.equal(/ready/i.test(app.replace(/\/\/.*$/gm, '').match(/path=("|')[^"']*("|')/g)?.join(' ') ?? ''), false, '준비 점검이 라우트(0강)가 됐다')
})
