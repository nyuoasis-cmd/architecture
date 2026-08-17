// 12강 실습 문항이 «오늘 무엇을 만드는가»를 학생에게 먼저 말하는가에 대한 계약.
//
// 🚨 왜 있는가(새내기 f6 2026-08-16 · g1 2026-08-17): 학생이 「터미널을 배우는 건지, 규칙 문서 제출
//    과정의 일부인지 헷갈려요」 「설명이 너무 길어요. 뭘 어떻게 해야 할지 안 보여서 모르겠어요」 라고 했다.
//    길을 잃은 게 아니라 **도착지를 모르는 것**이다.
//
// 🔑 진원은 문구가 아니라 **본문이 다른 자리를 가리키던 것**이었다. 이 문항에는 규칙을 쓰는 자리가
//    둘 있다(✋ 내 차례 = 연습 · 🧪 실습 = 파일로 써서 낸다). 그런데 본문은 「다 쓰면 아래 ✋내 차례에
//    넣고 보내세요」로 끝나 실습을 **한 번도 가리키지 않았다** — 학생이 둘의 관계를 알 방법이 없었다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { stripComments } from './strip-comments'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')
const clientPath = (...parts: string[]) => path.resolve(ROOT, 'client', 'src', ...parts)

type Qa = { id: string; body: string }
const qas: Qa[] = require(clientPath('data', 'vibe-ch18')).CH18_QAS ?? require(clientPath('data', 'vibe-ch18')).default
const labQaId: string = require(clientPath('data', 'vibe-lab-ch18')).LAB_QA_ID

const labQa = () => {
  const found = (Array.isArray(qas) ? qas : []).find((q) => q.id === labQaId)
  assert.ok(found, `실습 문항(${labQaId})을 데이터에서 못 찾았다 — 이 계약이 헛돈다`)
  return found!
}

test('1) 본문이 내는 곳을 가리킨다 — 🧭 체험의 실습실', () => {
  // 🔑 2026-08-17 체험 재구조화: 연습 자리(✋ 내 차례)는 철거됐고, 쓰는 곳도 내는 곳도
  //    실습실 하나다. 본문이 그 한 자리를 분명히 가리키는지 본다(f6 의 진원 = 도착지 부재).
  const body = labQa().body
  assert.ok(/체험/.test(body), '본문이 🧭 체험 탭을 안 가리킨다')
  assert.ok(/실습실/.test(body), '본문이 «실제로 쓰고 내는 자리»(실습실)를 한 번도 안 가리킨다')
  assert.equal(/내 차례/.test(body), false, '본문이 철거된 ✋ 내 차례를 아직 가리킨다')
})

test('2) 도착지가 본문 «앞쪽»에 온다 — 형식 설명보다 먼저', () => {
  const body = labQa().body
  const destAt = body.indexOf('만들 것')
  const formAt = body.indexOf('대상 한 줄')
  assert.ok(destAt >= 0, '본문에 «오늘 만들 것»이 없다')
  assert.ok(formAt >= 0, '본문에 네 칸 형식 설명이 없다 — 이 검사가 헛돈다')
  assert.ok(
    destAt < formAt,
    '형식 설명(대상 한 줄/…)이 «무엇을 만드는가»보다 먼저 온다 — 학생은 아직 그 산출물이 무엇인지 모른다(g1)',
  )
  // 첫 단락 안에 있어야 «먼저»다. 뒤쪽 어딘가에 있는 것으로는 안 된다.
  assert.ok(destAt < body.indexOf('\n\n'), '«오늘 만들 것»이 첫 단락에 없다')
})

test('3) 미션판 머리에 도착지 한 줄이 있고, 미션마다 이유를 붙이지 않았다', () => {
  const panel = stripComments(read('client/src/components/learn/ChapterNavPanel.tsx'))
  assert.ok(panel.includes('도착지 —'), '미션판에 도착지 한 줄이 없다 — 학생이 무엇을 향해 가는지 모른다')
  // 🚨 f6 처방의 금지항: 미션마다 이유를 붙이면 7줄이 7문단이 되고 아무도 안 읽는다.
  const occurrences = panel.split('도착지 —').length - 1
  assert.equal(occurrences, 1, `도착지 줄이 ${occurrences}개다 — 한 줄뿐이어야 한다`)
  assert.equal(
    /LAB_MISSIONS\.map[\s\S]{0,600}도착지/.test(panel),
    false,
    '미션 목록 안에서 도착지를 반복한다 — 7줄이 7문단이 된다',
  )
})
