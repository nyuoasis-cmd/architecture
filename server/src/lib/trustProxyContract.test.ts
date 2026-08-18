// req.ip 가 «진짜 클라이언트»를 가리키는가에 대한 계약.
//
// 🚨 왜 있는가(2026-08-18 prod 실측): Render 프록시 뒤에서 trust proxy 미설정이면 req.ip 가
//    내부 홉 IP(10.x, 요청마다 다름)가 된다. actor-id 의 ip: 갈래가 요청마다 새 통이 되어
//    자습 이어쓰기(제출·계보)와 «공유 통» 연타 한도가 전부 헛돌았다 — 계보 저장 직후 되읽기가
//    비는 것으로 발각됐다. pt: 참여자 갈래(수업)는 무관하다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const source = readFileSync(path.resolve(__dirname, '..', 'index.ts'), 'utf8')

test('1) trust proxy 가 켜져 있다 — 없으면 ip: 신원이 요청마다 다른 통이 된다', () => {
  assert.ok(/app\.set\('trust proxy',/.test(source), 'trust proxy 설정이 사라졌다 — 자습 신원·연타 한도가 헛돈다')
})

test("2) 값은 홉 수(숫자)다 — true 는 남의 IP 통을 사칭해 읽는 문을 연다", () => {
  // 🚨 true 면 클라이언트가 지어낸 X-Forwarded-For 맨 앞을 믿는다 — ip:<남의IP> 통(자습 산출물)을
  //    골라 읽을 수 있게 된다. 숫자(홉 수)는 프록시가 붙인 항만 믿는다.
  assert.equal(/app\.set\('trust proxy', true\)/.test(source), false, "trust proxy 가 true 다 — 홉 수로 적어라")
  assert.ok(/app\.set\('trust proxy', \d+\)/.test(source), 'trust proxy 값이 홉 수(숫자)가 아니다')
})
