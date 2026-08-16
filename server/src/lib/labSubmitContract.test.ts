// 실습실 제출(`lab-submissions.ts` · `lab-checker.ts` · `routes/lab.ts`)의 계약.
//
// 🚨 이 PR 의 핵심은 하나다: **점수는 서버가 저장된 본문으로 낸다.** 화면이 보낸 «통과했어요»는
//    근거가 아니다 — 채점 로그와 같은 이유로 위조된다.
//
// 🚨 그리고 그 대가로 **판정 규칙이 두 벌**이 됐다(클라 `lab-checker.ts` / 서버 `lab-checker.ts`).
//    두 벌이 어긋나면 학생 화면은 초록인데 교사 화면은 빨강이 된다 — 수업 중에 아무도 못 고친다.
//    1) 이 그 정합을 매번 대조한다. **규칙을 고칠 때는 두 파일을 같이 고친다.**
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import { buildVerdict, parseResult } from './lab-checker'
import { setLabDbResolverForTest, submit, toLabActor, type LabActor } from './lab-submissions'

const read = (...parts: string[]) => readFileSync(path.resolve(__dirname, ...parts), 'utf8')

/**
 * 🔑 **주석을 걷어낸 화면 문구.** 안 걷어내면 「이렇게 쓰지 말라」고 적어 둔 주석이
 *    그 금지어를 스스로 위반한 것으로 잡힌다(sessionWordingContract 가 쓰는 방식과 같다).
 */
const visibleText = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const clientChecker = require(
  path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'lib', 'lab-checker'),
) as { parseResult: (text: string) => { ok: boolean; reason?: string } }

/** 실제 수업에서 나오는 모양들 — 통과하는 것, 터지는 것, 애매한 것. */
const SAMPLES = [
  '할인율: 10%\n최종가: 9000',
  '할인율은 10% off 입니다. 최종가는 9,000원.',
  '{ "discount": 0.1, "final": 9000 }',
  '# 할인 계산\n\n**할인율:** 10%\n**최종가:** 9,000원',
  '할인율: 10%',
  '',
  '아무 말이나 적어 본 답',
  '할인율: 007%\n최종가: 9000',
]

test('1) 클라와 서버의 판정이 같다 — 어긋나면 학생 화면은 초록인데 교사 화면은 빨강이 된다', () => {
  for (const sample of SAMPLES) {
    const server = parseResult(sample)
    const client = clientChecker.parseResult(sample)
    assert.equal(
      server.ok,
      client.ok,
      `판정이 갈렸다 (서버 ${server.ok} / 클라 ${client.ok}):\n${JSON.stringify(sample)}`,
    )
    if (!server.ok && !client.ok) {
      assert.equal(server.reason, client.reason, `왜 터졌는지가 갈렸다:\n${JSON.stringify(sample)}`)
    }
  }

  // 음성 대조군 — 대조가 실제로 갈림을 잡는지.
  assert.notEqual(parseResult(SAMPLES[0]!).ok, parseResult(SAMPLES[1]!).ok, '표본이 전부 같은 답이면 1) 은 공짜다')
})

test('2) 판정에 결과 원문이 같이 남는다 — 없으면 「왜 이렇게 나왔나」를 아무도 재현 못 한다', () => {
  const verdict = buildVerdict(['할인율: 10%\n최종가: 9000', '10퍼센트 할인입니다'])
  assert.deepEqual(verdict.outputs, ['할인율: 10%\n최종가: 9000', '10퍼센트 할인입니다'], '결과 원문이 안 남는다')
  assert.equal(verdict.passed, 1)
  assert.equal(verdict.total, 2)
  assert.equal(verdict.rows[1]?.ok, false)
  assert.ok(verdict.rows[1]?.reason, '왜 터졌는지가 안 남는다 — 교사가 읽을 것이 사라진다')
})

test('3) 서버가 저장된 본문으로 다시 돌린다 — 화면이 보낸 판정을 저장하지 않는다', () => {
  const route = read('..', 'routes', 'lab.ts')
  // 제출 본문에 판정이 들어올 자리가 없어야 한다.
  const schema = route.slice(route.indexOf('const submitSchema'), route.indexOf('const submitSchema') + 200)
  for (const forbidden of ['verdict', 'passed', 'outputs', 'rows']) {
    assert.equal(schema.includes(forbidden), false, `제출 본문이 화면의 판정(${forbidden})을 받고 있다`)
  }
  const store = read('lab-submissions.ts')
  assert.ok(/const verdict = buildVerdict\(outputs\)/.test(store), '서버가 스스로 판정하지 않는다')
  assert.ok(/const outputs = await runRules\(trimmed\)/.test(store), '서버가 **저장할 본문**으로 안 돌린다')
})

test('4) 낸 것을 덮어쓰지 않는다 — 판을 쌓는다', () => {
  const sql = read('..', '..', '..', 'sql', '008_lab_submissions.sql')
  assert.ok(/revision int not null/.test(sql), '판 번호가 없다')
  assert.equal(/on conflict.*update/i.test(sql), false, 'upsert 로 덮어쓰고 있다 — 고쳐 온 과정이 사라진다')
  const store = read('lab-submissions.ts')
  assert.ok(/\.insert\(/.test(store), 'insert 가 아니다')
  assert.equal(/\.update\(|\.upsert\(/.test(store), false, '제출물을 고쳐 쓰고 있다')
})

test('5) 두 탭에서 동시에 내도 학생에게 「다시 눌러 주세요」를 시키지 않는다', () => {
  const store = read('lab-submissions.ts')
  assert.ok(/'23505'/.test(store), '판 번호 충돌을 안 다룬다')
  assert.ok(/for \(let attempt = 0; attempt < 3/.test(store), '충돌 시 다시 읽어 이어 붙이지 않는다')
})

test('6) 제출은 조용히 성공한 척하지 않는다 — DB 가 없으면 실패로 말한다', async () => {
  // 🚨 성공한 척하면 학생은 냈다고 믿고 교사는 아무것도 못 본다.
  // 🚨 «DB 없음»을 **주변 환경에 기대지 않고** 여기서 직접 만든다.
  //    2026-08-15 까지 이 시험은 「이 환경에는 DB 가 없다」를 전제했는데, 개발 기계의 레포 루트
  //    `.env` 에는 운영 자격증명이 있다. 그래서 CI 는 초록·로컬은 빨강이었고, 그보다 나쁘게
  //    로컬에서 `npm test` 를 돌릴 때마다 **운영 테이블에 제출물이 한 판씩 쌓였다.**
  const actor: LabActor = { ownerToken: 'ip:test' }
  setLabDbResolverForTest(() => null)
  try {
    await assert.rejects(
      () => submit(actor, 'ch18_q04', 'x'.repeat(50), async () => ['할인율: 10%\n최종가: 9000']),
      /no_database/,
      'DB 없이도 제출이 «성공»했다',
    )
  } finally {
    setLabDbResolverForTest(null)
  }

  const route = read('..', 'routes', 'lab.ts')
  assert.ok(/LabSubmitUnavailableError/.test(route), '라우트가 제출 실패를 갈라 답하지 않는다')
})

test('6-a) 시험이 만든 «DB 없음»이 우회되지 않는다 — DB 를 읽는 자리가 손잡이 하나뿐이다', () => {
  // 🔑 6) 이 다시 환경 의존으로 돌아가는 유일한 길 = 어떤 함수가 손잡이를 건너뛰고
  //    `getSupabaseAdminClient()` 를 직접 부르는 것. 그러면 그 경로만 조용히 운영 DB 로 나간다.
  const store = read('lab-submissions.ts')
  assert.equal(
    (store.match(/getSupabaseAdminClient/g) ?? []).length,
    2,
    'DB 손잡이(defaultDb)를 건너뛰고 직접 부르는 자리가 생겼다 — 그 경로는 시험에서 운영 DB 로 나간다',
  )
  assert.equal(
    (store.match(/const supabase = resolveDb\(\)/g) ?? []).length,
    3,
    'DB 를 읽는 함수가 손잡이를 안 쓴다',
  )
})

test('7) 신원이 수업 참여자와 자습을 가른다 — IP 로 학생을 세면 교실 전체가 한 명이 된다', () => {
  assert.deepEqual(toLabActor('pt:abc-123'), { participantId: 'abc-123' })
  assert.deepEqual(toLabActor('ip:10.0.0.1'), { ownerToken: 'ip:10.0.0.1' })

  const sql = read('..', '..', '..', 'sql', '008_lab_submissions.sql')
  assert.ok(/lab_submissions_owner_xor/.test(sql), '참여자와 자습이 동시에 들어갈 수 있다')
})

test('8) 「냈다」는 서버가 판 번호를 준 뒤에만 기록된다 — 보낸 시점이 아니다', () => {
  const tab = readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'components', 'learn', 'LabTab.tsx'),
    'utf8',
  )
  const submitFn = tab.slice(tab.indexOf('const runSubmit'), tab.indexOf('const saveEditor'))
  const okAt = submitFn.indexOf('if (!result.ok)')
  const markAt = submitFn.indexOf('markSubmitted')
  assert.ok(okAt > 0 && markAt > okAt, '서버 응답을 보기 전에 «냈다»고 기록한다')

  const shell = require(
    path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'lib', 'lab-shell'),
  ) as {
    INITIAL_LAB_STATE: { submittedRevision: number }
    markSubmitted: (state: unknown, revision: number) => { submittedRevision: number }
  }
  assert.equal(shell.INITIAL_LAB_STATE.submittedRevision, 0, '처음부터 낸 것으로 되어 있다')
  assert.equal(shell.markSubmitted(shell.INITIAL_LAB_STATE, 3).submittedRevision, 3)
})

test('9) 낸 뒤에도 몇 번이고 고쳐 낼 수 있다고 말한다 — 한 번뿐이라고 읽히면 학생이 안 낸다', () => {
  const tab = readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'components', 'learn', 'LabTab.tsx'),
    'utf8',
  )
  assert.ok(/고쳐서 또 내도 됩니다/.test(tab), '실패했을 때 다시 낼 수 있다고 안 말한다')
  assert.equal(/제출은 한 번|다시 낼 수 없/.test(tab), false, '한 번뿐이라고 말하고 있다')
})

// ─── 5b — 교사 실습 현황 ───

test('10) 실습 현황은 교사 전용이다 — 학생 화면에 반 전체 작업물이 새면 안 된다', () => {
  const panel = readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'components', 'learn', 'ContentPanel.tsx'),
    'utf8',
  )
  // 🚨 «if (teacherPanel)» 블록 **안에서만** 켜져야 한다(learnLayoutContract ⑦ 과 같은 이유).
  const guard = panel.match(/if \(teacherPanel\) \{([\s\S]*?)\n {4}\}/)
  assert.ok(guard, 'ContentPanel 에 «if (teacherPanel)» 블록이 없다')
  assert.ok(guard![1].includes("list.push('labclass')"), '🧪 실습 현황이 교사 블록 밖에서 켜진다')
  const pushes = [...panel.matchAll(/list\.push\('labclass'\)/g)].length
  assert.equal(pushes, 1, `🧪 실습 현황을 ${pushes} 곳에서 켜고 있다 — 켜는 자리는 하나여야 한다`)
  // 그리는 자리에서도 한 번 더 본다 — 탭 목록만 막으면 URL 로 열릴 수 있다.
  assert.ok(
    /activeTab === 'labclass' && teacherPanel \?/.test(panel),
    '실습 현황을 그릴 때 교사인지 다시 안 본다',
  )
})

test('11) 서버가 «이 수업의 교사인가»까지 본다 — 로그인만 보면 남의 수업을 들여다본다', () => {
  const route = read('..', 'routes', 'lab.ts')
  const classRoute = route.slice(route.indexOf("router.get('/class'"))
  assert.ok(/getRequestUser/.test(classRoute), '로그인 확인이 없다')
  assert.ok(/session\.teacher_id !== user\.id/.test(classRoute), '«이 수업의 교사인가»를 안 본다')
  assert.ok(/res\.status\(401\)/.test(classRoute), '로그인 없음을 401 로 답하지 않는다')
  assert.ok(/res\.status\(403\)/.test(classRoute), '남의 수업을 403 으로 막지 않는다')
  // 🚨 없는 수업과 남의 수업을 갈라 답하면 어떤 수업이 존재하는지가 새어 나간다.
  assert.ok(/if \(!session \|\| session\.teacher_id !== user\.id\)/.test(classRoute), '없는 수업과 남의 수업을 갈라 답한다')
})

test('12) 안 낸 학생도 줄에 세운다 — 낸 학생만 보이면 교사는 「다 냈다」고 오해한다', () => {
  const store = read('lab-submissions.ts')
  const classFn = store.slice(store.indexOf('export async function classStatus'))
  assert.ok(/roster\.map\(/.test(classFn), '참여자 전체가 아니라 제출한 학생만 세우고 있다')
  assert.ok(/revision: mine\?\.revision \?\? 0/.test(classFn), '안 낸 학생의 자리가 없다')
})

test('13) 「N분째 진전 없음」 알림을 만들지 않는다 — 멀쩡히 쓰는 학생을 쫓아가게 만든다', () => {
  // 🚨 CLAUDE.md 의 «앱은 수업 진행 시간을 말하지 않는다»와 같은 이유다. 우리가 아는 것은
  //    «낸 시각»뿐이고, 안 낸 것이 막힌 것인지 쓰는 중인지는 이 데이터로 알 수 없다.
  const tab = readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'components', 'learn', 'LabClassTab.tsx'),
    'utf8',
  )
  assert.equal(
    /분째|진전 없음|정체|막힘 알림/.test(visibleText(tab)),
    false,
    '「N분째 진전 없음」이 되살아났다',
  )
  // 대신 «모르는 것»을 화면이 말해야 한다.
  assert.ok(/막혔다는 뜻이 아니라/.test(tab), '「안 냄」이 「막혔다」로 읽히는 것을 막는 문장이 없다')
})

test('14) 상대 시간은 «마지막으로 낸 뒤»다 — 수업이 몇 분째인지가 아니다', () => {
  const tab = readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'components', 'learn', 'LabClassTab.tsx'),
    'utf8',
  )
  assert.ok(/lastSubmittedAt/.test(tab), '무엇을 기준으로 재는지가 없다')
  assert.ok(/아직 안 냄/.test(tab), '낸 적 없는 학생의 시간을 지어내고 있다')
})

test('15) 오류 상위는 «여럿이 같은 데서 터진 것»만 모은다 — 통과한 줄을 세면 신호가 아니다', () => {
  const store = read('lab-submissions.ts')
  const classFn = store.slice(store.indexOf('export async function classStatus'))
  assert.ok(/if \(row\.ok \|\| !row\.reason\) continue/.test(classFn), '통과한 줄까지 오류로 세고 있다')
  assert.ok(/\.slice\(0, 3\)/.test(classFn), '상위 3개로 안 자른다 — 다 보여 주면 교사가 못 읽는다')
})
