// 교사 「내 수업」 목록이 §4 D안(현황 미니 대시보드)인가에 대한 계약.
//
// 🚨 왜 있는가(2026-08-14): 카드가 «바로가기 버튼»이었다 — 코드 한 덩이와 참여자 수 한 줄,
//    그리고 「수업 현황」 버튼. 교사는 반이 어떻게 돌아가는지 알려면 카드를 하나씩 열어야 했다.
//    §4 는 카드 자체가 현황판이기를 요구한다(통계 3셀 + 최근 활동 피드).
//
// 🔑 여기서 지키는 것은 픽셀이 아니라 **구조**다: 카드가 클릭 대상인가, 안의 버튼이
//    클릭을 삼키는가, 되돌릴 수 없는 일이 확인을 거치는가, 삭제가 진행 중 카드에 없는가.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { stripComments } from './strip-comments'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const CARD = 'client/src/components/teacher/SessionCard.tsx'
const LIST = 'client/src/pages/TeacherDashboardPage.tsx'

test('1) 카드 전체가 클릭 대상이다 — 「수업 현황으로」 버튼을 찾아 누르게 하지 않는다', () => {
  const source = read(CARD)
  assert.ok(/role="button"/.test(source), '카드에 role="button" 이 없다')
  assert.ok(/tabIndex=\{0\}/.test(source), '키보드로 카드에 닿을 수 없다')
  assert.ok(/'Enter' \|\| event\.key === ' '/.test(source), 'Enter/Space 로 열리지 않는다')
  assert.ok(/navigate\(`\/teacher\/session\/\$\{session\.id\}`\)/.test(source), '카드가 상세로 가지 않는다')
})

test('2) 카드 안의 버튼은 클릭을 삼킨다 — QR 을 누르려다 상세로 튀지 않게', () => {
  const source = read(CARD)
  const handlers = [...source.matchAll(/onClick=\{\(event\) => \{/g)].length
  const stops = [...source.matchAll(/event\.stopPropagation\(\)/g)].length
  assert.ok(handlers > 0, '카드 안에 버튼 핸들러가 없다 — 탐지가 헛돈다')
  assert.equal(stops, handlers, `버튼 ${handlers}개 중 ${stops}개만 stopPropagation 한다`)
})

test('3) 통계 3셀이 있다 — §4 「통계 영역 생략 불가」', () => {
  const source = read(CARD)
  assert.ok(/grid-cols-3/.test(source), '통계 3셀 그리드가 없다')
  for (const label of ['참여 학생', '열어 본 문항', '진행 중']) {
    assert.ok(source.includes(label), `통계 칸 「${label}」이 없다`)
  }
  assert.equal(
    stripComments(source).includes('읽은 문항'),
    false,
    '「읽은 문항」은 앱이 알 수 없는 것을 안다고 말하는 문구다 — 진도 행은 «열었다»만 뜻한다',
  )
})

test('4) 진행 중 pill 은 emerald + 뛰는 점이다 — 회색 pill 은 «지금 살아 있음»을 못 말한다', () => {
  const source = read(CARD)
  assert.ok(/bg-emerald-50/.test(source), '진행 중 pill 이 emerald 가 아니다')
  assert.ok(/#059669/.test(source), '진행 중 pill 글자색이 §4 값이 아니다')
  assert.ok(/animate-pulse/.test(source), '진행 중 dot 이 뛰지 않는다')
})

test('5) 삭제는 종료된 수업에만 있다 — 진행 중 카드에서 한 칸 차이로 반 기록이 날아가지 않게', () => {
  const source = read(CARD)
  const actions = source.slice(source.indexOf('{isActive ? ('), source.indexOf('</div>\n        </div>'))
  const deleteAt = actions.indexOf('삭제')
  const elseAt = actions.indexOf(') : (')
  assert.ok(deleteAt > 0, '삭제 버튼을 찾지 못했다')
  assert.ok(elseAt > 0 && deleteAt > elseAt, '삭제가 진행 중(isActive) 갈래에 있다')
})

test('6) 종료·삭제는 확인 모달을 거친다 — 인라인 펼침(§4 금지)도 confirm() 도 아니다', () => {
  const source = read(CARD)
  assert.equal([...source.matchAll(/<ConfirmModal/g)].length, 2, '종료·삭제 확인 모달이 둘 다 있어야 한다')
  const endAt = source.indexOf('endSession(')
  const deleteAt = source.indexOf('deleteSession(')
  assert.ok(endAt > 0 && deleteAt > 0, '종료·삭제 호출을 찾지 못했다')
  assert.equal(/window\.confirm\(/.test(source), false, 'confirm() 은 §6 금지다')
  assert.equal(
    /isConfirming(End|Delete) \? \(\s*<div/.test(source),
    false,
    '확인이 카드 안에서 펼쳐진다 — §4 는 아코디언/펼침을 금지한다',
  )
})

test('7) +N 뱃지는 activity_count 로 센다 — recent_students.length 로 재면 늘 0이다', () => {
  const source = read(CARD)
  assert.ok(
    /session\.activity_count \?\? recentStudents\.length\) - 4/.test(source),
    '+N 이 서버가 4명으로 잘라 보낸 목록 길이를 기준으로 계산되고 있다(dead code)',
  )
})

test('8) 목록 컨테이너·헤더가 §4 표준이다 (max-w-4xl · 「N개 수업 · 진행 중 M개」)', () => {
  const source = read(LIST)
  assert.ok(/max-w-4xl/.test(source), '컨테이너가 896px 이 아니다')
  assert.equal(/max-w-6xl/.test(source), false, '옛 6xl 컨테이너가 남아 있다')
  assert.ok(/개 수업 · 진행 중 \{activeSessions\.length\}개/.test(source), '헤더 서브텍스트가 숫자 한 줄이 아니다')
  assert.ok(/items-end/.test(source), '헤더 버튼이 서브텍스트 하단에 정렬되지 않는다')
  assert.ok(source.includes('수업 만들기'), 'CTA 문구가 「수업 만들기」가 아니다')
})

test('9) 빈 상태가 다음 할 일을 준다 (아이콘 + 두 줄 + 첫 수업 만들기)', () => {
  const source = read(LIST)
  for (const piece of ['아직 만든 수업이 없어요', '수업을 만들면 학생들이 참여할 수 있어요', '첫 수업 만들기']) {
    assert.ok(source.includes(piece), `빈 상태에 「${piece}」가 없다`)
  }
  assert.ok(/h-11 w-11/.test(source), '빈 상태 아이콘이 44px 이 아니다')
})

test('10) 상대 시간이 §4 표를 따르고 미래 시각을 clamp 한다', async () => {
  // 🔑 client 코드를 server tsconfig(rootDir=src) 안으로 import 하면 빌드가 깨진다.
  //    런타임에만 여는 이유가 그것이다 — 계약은 «문구»가 아니라 «동작»을 봐야 한다.
  const modulePath = path.join(ROOT, 'client/src/lib/format.ts')
  const { formatRelativeTime } = (await import(modulePath)) as {
    formatRelativeTime: (value: string | Date, options?: { mode?: 'default' | 'compact'; now?: Date }) => string
  }

  const now = new Date('2026-08-14T15:00:00')
  const at = (iso: string) => formatRelativeTime(new Date(iso), { now })

  assert.equal(at('2026-08-14T15:00:30'), '방금 시작', '미래 시각은 «방금 시작»으로 눌러야 한다(시계 오차)')
  assert.equal(at('2026-08-14T14:53:00'), '7분 전')
  // 1시간을 넘긴 «오늘»부터 시각으로 말한다 — 그 전에는 「N분 전」이 더 정확하다(§4 표).
  assert.equal(at('2026-08-14T09:30:00'), '오늘 09:30 시작')
  assert.equal(at('2026-08-13T09:00:00'), '어제')
  assert.equal(at('2026-08-11T09:00:00'), '3일 전')
  assert.equal(at('2026-07-14T09:00:00'), '7월 14일')
  assert.equal(
    formatRelativeTime(new Date('2026-08-14T09:30:00'), { now, mode: 'compact' }),
    '오늘 09:30',
    '활동 피드에서는 「시작」을 붙이지 않는다 — 시작한 것이 아니라 방금 일어난 일이다',
  )
})
