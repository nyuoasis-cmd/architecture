// 산출물 계보(architecture_lab_artifacts)의 계약 — SDD 체험 재구조화 결정 15.
//
// 계보 = 12강 규칙 → 13강 스킬 → 16강 완료 조건 → 19강 약속 문장 → 22강 넘김 쪽지 → 23강 묶음.
// 🚨 지키는 것 셋: 1) 테이블이 아직 없어도 수업(제출)이 죽지 않는다(5f6ed39 선례)
//                2) 조회 실패는 «없음»과 갈라 말한다(빈 200 은 23강의 거짓말이 된다)
//                3) 덧붙이기만 한다 — 고쳐 온 과정이 가치다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import { ARTIFACT_KINDS } from './lab-artifacts'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (...rel: string[]) => readFileSync(path.join(ROOT, ...rel), 'utf8')

test('1) 계보 여섯 칸이 SQL 과 코드에서 같다 — 한쪽만 늘면 저장은 되는데 못 읽거나 그 반대가 된다', () => {
  assert.deepEqual(
    [...ARTIFACT_KINDS],
    ['rules', 'skill', 'ac', 'promise', 'handoff', 'bundle'],
    '계보 kind 가 지도(12→13→16→19→22→23)와 다르다',
  )
  const migration = read('sql', '010_lab_artifacts.sql')
  for (const kind of ARTIFACT_KINDS) {
    assert.ok(migration.includes(`'${kind}'`), `SQL check 제약에 ${kind} 가 없다 — 저장이 DB 에서 튕긴다`)
  }
})

test('2) 테이블이 없어도 제출은 성공한다 — 계보 저장은 비치명이다 (5f6ed39 선례)', () => {
  const route = read('server', 'src', 'routes', 'lab.ts')
  const submitRoute = route.slice(route.indexOf("router.post('/submit'"), route.indexOf("router.get('/artifacts'"))
  // saveArtifact 가 자기만의 try/catch 안에 있고, 실패가 res 에 닿지 않는다.
  assert.ok(/try \{\s*await saveArtifact\(/.test(submitRoute), '계보 저장이 제출 성공 경로를 물고 있다')
  assert.ok(/artifact_save_skipped/.test(submitRoute), '계보 저장 실패가 로그도 없이 사라진다')
})

test('3) 계보 조회 실패는 503 이다 — 빈 200 으로 «아직 안 만들었네요»라고 거짓말하지 않는다', () => {
  const route = read('server', 'src', 'routes', 'lab.ts')
  const artifactsRoute = route.slice(route.indexOf("router.get('/artifacts'"), route.indexOf("router.get('/submission'"))
  assert.ok(/LabArtifactsUnavailableError/.test(artifactsRoute), '조회가 «못 읽음»을 따로 안 가른다')
  assert.ok(/503/.test(artifactsRoute), '«못 읽음»이 503 으로 안 나간다')
})

test('4) 덧붙이기만 한다 — update·delete 가 없다', () => {
  const lib = read('server', 'src', 'lib', 'lab-artifacts.ts')
  assert.equal(/\.update\(|\.delete\(|\.upsert\(/.test(lib), false, '계보가 이전 판을 고치거나 지운다')
  assert.ok(/revision/.test(lib) && /\+ 1/.test(lib), '새 판 번호를 안 쌓는다')
  // 동시 제출은 유일 인덱스 충돌(23505)로 한 번만 재시도한다.
  assert.ok(/23505/.test(lib), '동시 제출 충돌을 안 다룬다 — 두 탭이 같은 판 번호에서 그냥 죽는다')
})

test('5) 신원은 제출물과 같은 XOR — 참여자 토큰 또는 자습 브라우저 토큰', () => {
  const migration = read('sql', '010_lab_artifacts.sql')
  assert.ok(/participant_id uuid references architecture_participants\(id\) on delete cascade/.test(migration))
  assert.ok(/owner_xor/.test(migration), '참여자/자습 XOR 제약이 없다')
  assert.ok(/enable row level security/.test(migration), 'RLS 가 없다 — 클라 직접 접근이 열린다')
  // down 마이그레이션이 존재한다.
  assert.ok(read('sql', '010_lab_artifacts.down.sql').includes('drop table'), 'down 마이그레이션이 없다')
})

test('6) 실습실은 강 단위로 하나다 — 네 문항이 같은 실습실·같은 대표 이름표를 쓴다 (SDD 결정 21)', () => {
  const panel = read('client', 'src', 'components', 'learn', 'ContentPanel.tsx')
  assert.ok(/chapter\.id === LAB_CHAPTER_ID/.test(panel), '실습실이 강 단위가 아니라 문항 하나에 걸려 있다')
  assert.ok(/qaId=\{LAB_QA_ID\}/.test(panel), 'LabTab 에 대표 이름표가 아니라 지금 문항을 준다 — 문항을 옮기면 작업이 사라진다')
  assert.ok(/reportLabMission\(LAB_QA_ID/.test(panel), '진도 보고가 문항별로 흩어진다 — 교사 「실습 N/7」이 네 줄이 된다')

  const spans = require(path.resolve(ROOT, 'client', 'src', 'data', 'vibe-lab-ch18')) as {
    LAB_QA_MISSION_SPANS: Record<string, { from: number; to: number }>
    LAB_MISSIONS: unknown[]
  }
  // 구간이 미션 1~N 을 빈틈·겹침 없이 덮는다.
  const ranges = Object.values(spans.LAB_QA_MISSION_SPANS).sort((a, b) => a.from - b.from)
  assert.equal(ranges[0]!.from, 1, '미션 구간이 1에서 시작하지 않는다')
  for (let i = 1; i < ranges.length; i += 1) {
    assert.equal(ranges[i]!.from, ranges[i - 1]!.to + 1, '미션 구간에 빈틈이나 겹침이 있다')
  }
  assert.equal(ranges[ranges.length - 1]!.to, spans.LAB_MISSIONS.length, '마지막 구간이 미션 끝까지 안 닿는다')
})
