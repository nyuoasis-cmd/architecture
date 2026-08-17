// 실습실 미션 진행도가 «학생 → 서버 → 교사» 세 자리에서 어긋나지 않는가에 대한 계약.
//
// 🚨 왜 있는가(2026-08-16 신입샘 t1, sev 3): 12강에서 90분이 흘러가는 곳은 4번 문항 **안**의
//    미션 7단계인데, 교사 화면의 진행 단위는 «문항»뿐이었다. 25명이 전부 미션 2 에 몰려 있어도
//    전원이 「1/7 문항」으로 똑같이 보였다 — 「오늘 제보를 교사가 못 보는 이유」가 이것이었다.
//
// 🚨 이 기능은 **DB 칸을 새로 쓴다.** 그래서 첫 계약이 «코드가 읽는 칸이 마이그레이션에 있는가»다.
//    이게 없으면 마이그레이션을 prod 에 안 올린 채 머지하는 날 학생 진도 저장이 통째로 깨진다 —
//    수업 중에.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { stripComments } from './strip-comments'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const COLUMNS = ['lab_mission_index', 'lab_earned_index'] as const
const MIGRATION = 'sql/009_lab_mission_progress.sql'

test('1) 코드가 읽는 칸이 마이그레이션에 선언돼 있다 — 안 올리고 머지하면 수업 중에 깨진다', () => {
  const migration = read(MIGRATION)
  for (const column of COLUMNS) {
    assert.ok(
      new RegExp(`add column if not exists ${column}\\b`).test(migration),
      `${MIGRATION} 이 ${column} 를 만들지 않는다 — 서버는 그 칸을 읽는다`,
    )
  }
  // 되돌릴 길이 있는가. 없으면 잘못 올렸을 때 손으로 SQL 을 짜게 된다.
  const down = read('sql/009_lab_mission_progress.down.sql')
  for (const column of COLUMNS) {
    assert.ok(down.includes(column), `down 마이그레이션이 ${column} 를 되돌리지 않는다`)
  }
  // 🚨 기존 행을 건드리는 마이그레이션이 아니어야 한다 — 라이브 테이블이다.
  assert.equal(/\b(update|delete|drop table|alter column)\b/i.test(migration), false, '기존 데이터를 건드린다')
})

test('2) 교사 화면이 미션 «이름»까지 적는다 — 숫자만으로는 무엇을 하고 있는지 모른다', () => {
  const body = stripComments(read('client/src/components/teacher/ParticipantList.tsx'))
  assert.ok(body.includes('LAB_MISSIONS'), '미션 이름의 정본(LAB_MISSIONS)을 안 쓴다 — 이름을 손으로 적으면 갈라진다')
  assert.ok(/실습 \$\{/.test(body), '학생 줄에 실습 진행 표기가 없다')
  // 🚨 미션 개수를 손으로 적지 않는다. 콘텐츠가 정하는 값이라, 7 을 박으면 미션을 늘리는 날 거짓이 된다.
  assert.equal(/\/7\b/.test(body), false, '미션 개수 7 이 화면에 박혀 있다 — 데이터에서 세야 한다')
})

test('3) 실습에 안 들어온 학생에게는 실습 표기를 붙이지 않는다', () => {
  const body = stripComments(read('client/src/components/teacher/ParticipantList.tsx'))
  // 🔑 undefined 를 돌려주고 문항 단위로 되돌아가는 갈림길이 살아 있는가.
  assert.ok(/undefined/.test(body), '실습 표기를 «없음»으로 돌려주는 길이 없다 — 전원에게 「실습 1/7」이 붙는다')
  assert.ok(/문항/.test(body), '실습 밖 학생에게 보여 줄 문항 단위 표기가 사라졌다')
})

test('4) 학생이 값을 보고하지만, 값이 달라졌을 때만 보낸다', () => {
  const progress = stripComments(read('client/src/lib/progress.ts'))
  assert.ok(progress.includes('reportLabMission'), '보고 경로가 없다 — 교사 화면이 읽을 값이 안 생긴다')
  // 🚨 매 상태 갱신마다 보내면 학생 한 명이 90분에 수백 번을 보낸다. «달라졌을 때만»의 자리가 있는가.
  assert.ok(
    /lastLabReport/.test(progress),
    '같은 값을 다시 보내는 것을 막는 자리가 없다 — 수업 중 쓸데없는 트래픽이 학생 수만큼 곱해진다',
  )
})

test('5) 교사가 시연할 때는 학생 줄에 섞이지 않는다', () => {
  const panel = stripComments(read('client/src/components/learn/ContentPanel.tsx'))
  // 🔑 import 줄이 아니라 **부르는 자리**를 본다 — indexOf 는 import 를 먼저 집는다.
  const at = panel.lastIndexOf('reportLabMission(')
  assert.ok(at > 0, 'ContentPanel 이 미션 자리를 보고하지 않는다')
  // 🔑 교사 화면 = 학생 화면의 상위집합이라(§9.H-14), 교사도 같은 실습실을 밟는다.
  //    그 밟은 것이 진도로 올라가면 교사가 자기 수업의 학생 줄에 나타난다.
  const around = panel.slice(Math.max(0, at - 200), at + 80)
  assert.ok(/teacherPanel/.test(around), '교사 시연분을 가르는 조건이 보고 자리에 없다')
})

test('6) 서버가 미션 개수를 알고 있지 않다 — 알면 미션을 늘리는 날 수업 중에 400 이 뜬다', () => {
  const route = stripComments(read('server/src/routes/progress.ts'))
  assert.ok(/lab_mission_index/.test(route), '라우트가 미션 자리를 받지 않는다')
  assert.equal(/max\(7\)/.test(route), false, '서버 스키마가 미션 개수 7 을 알고 있다 — 콘텐츠가 정할 값이다')
})
