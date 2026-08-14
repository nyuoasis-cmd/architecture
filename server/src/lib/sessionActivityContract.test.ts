// 수업 카드의 숫자들이 «무엇을 세는가»에 대한 계약. BUILDER-UX-POLICY §4 Phase 2 스펙.
//
// 🚨 여기서 틀리면 교사가 화면을 믿고 잘못 움직인다. 대표적으로 «들어오기만 한 학생»을
//    활동으로 세면 피드가 「다들 하고 있다」고 거짓말하고, 교사는 붙잡아야 할 학생을 놓친다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { summarizeSessionActivity } from './session-activity'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

const PARTICIPANTS = [
  { id: 'p1', nickname: '김민수' },
  { id: 'p2', nickname: '이서연' },
  { id: 'p3', nickname: '박도윤' },
  { id: 'p4', nickname: '최하은' },
  { id: 'p5', nickname: '정우진' },
  { id: 'p6', nickname: '한지호' },
]

test('1) 들어오기만 한 학생은 활동으로 세지 않는다 — 세면 피드가 거짓말을 한다', () => {
  const activity = summarizeSessionActivity({
    participants: PARTICIPANTS,
    progressRows: [{ participant_id: 'p1', qa_id: 'ch01_q01', read_at: '2026-08-14T01:00:00Z' }],
    totalQas: 10,
  })

  assert.equal(activity.student_count, 6, '참여 학생은 들어온 사람 전부다')
  assert.equal(activity.activity_count, 1, '활동 학생은 진도 행이 있는 사람만이다')
})

test('2) 최근 활동 순 상위 4명만 나온다 — 아바타 자리가 4칸이고 +N 은 activity_count 에서 뺀다', () => {
  const rows = PARTICIPANTS.map((participant, index) => ({
    participant_id: participant.id,
    qa_id: 'ch01_q01',
    // 뒤에 있는 학생일수록 최근
    read_at: `2026-08-14T0${index}:00:00Z`,
  }))

  const activity = summarizeSessionActivity({ participants: PARTICIPANTS, progressRows: rows, totalQas: 10 })

  assert.deepEqual(activity.recent_students, ['한지호', '정우진', '최하은', '박도윤'])
  assert.equal(activity.activity_count, 6, '+N 뱃지는 6 - 4 = 2 가 되어야 한다')
})

test('3) 마지막 활동은 가장 최근 행이고, 퀴즈 점수가 있으면 「퀴즈 완료」다', () => {
  const activity = summarizeSessionActivity({
    participants: PARTICIPANTS,
    progressRows: [
      { participant_id: 'p1', qa_id: 'ch01_q01', read_at: '2026-08-14T01:00:00Z' },
      { participant_id: 'p2', qa_id: 'ch02_q03', read_at: '2026-08-14T03:00:00Z', quiz_score: 2 },
      { participant_id: 'p3', qa_id: 'ch03_q01', read_at: '2026-08-14T02:00:00Z' },
    ],
    totalQas: 10,
    titleOf: (qaId) => (qaId === 'ch02_q03' ? '서버는 왜 필요할까' : undefined),
  })

  assert.deepEqual(activity.last_activity, {
    student_name: '이서연',
    target_title: '서버는 왜 필요할까',
    action: '퀴즈 완료',
    timestamp: '2026-08-14T03:00:00Z',
  })
})

test('4) 제목을 못 찾으면 qa_id 라도 내보낸다 — 빈 따옴표("")를 교사에게 보이지 않게', () => {
  const activity = summarizeSessionActivity({
    participants: PARTICIPANTS,
    progressRows: [{ participant_id: 'p1', qa_id: 'ch99_q99', read_at: '2026-08-14T01:00:00Z' }],
    totalQas: 10,
  })

  assert.equal(activity.last_activity?.target_title, 'ch99_q99')
  assert.equal(activity.last_activity?.action, '읽음', '퀴즈 점수가 없으면 「읽음」이다')
})

test('5) 「진행 중」은 하나라도 열었지만 전부는 아닌 학생이다 — 0명도 다 끝낸 사람도 빼고', () => {
  const activity = summarizeSessionActivity({
    participants: PARTICIPANTS.slice(0, 3),
    progressRows: [
      // p1 = 3/3 다 열었다 → 진행 중 아님
      { participant_id: 'p1', qa_id: 'a', read_at: '2026-08-14T01:00:00Z' },
      { participant_id: 'p1', qa_id: 'b', read_at: '2026-08-14T01:01:00Z' },
      { participant_id: 'p1', qa_id: 'c', read_at: '2026-08-14T01:02:00Z' },
      // p2 = 1/3 → 진행 중
      { participant_id: 'p2', qa_id: 'a', read_at: '2026-08-14T01:03:00Z' },
      // p3 = 0개 → 진행 중 아님(들어오기만 했다)
    ],
    totalQas: 3,
  })

  assert.equal(activity.in_progress_count, 1)
  assert.equal(activity.opened_qa_count, 4, '열어 본 문항은 행의 총합이다')
})

test('6) 남의 수업 행·주인 없는 행은 어느 숫자에도 안 들어간다', () => {
  const activity = summarizeSessionActivity({
    participants: PARTICIPANTS.slice(0, 2),
    progressRows: [
      { participant_id: null, qa_id: 'a', read_at: '2026-08-14T09:00:00Z' },
      { participant_id: 'other-session-participant', qa_id: 'a', read_at: '2026-08-14T09:00:00Z' },
      { participant_id: 'p1', qa_id: 'a', read_at: '2026-08-14T01:00:00Z' },
    ],
    totalQas: 3,
  })

  assert.equal(activity.opened_qa_count, 1)
  assert.equal(activity.activity_count, 1)
  assert.equal(activity.last_activity?.student_name, '김민수', '남의 행이 최신이라고 피드에 올라오면 안 된다')
})

test('7) 목록 라우트가 수업 수만큼 쿼리를 날리지 않는다 — 교사가 가장 자주 새로고침하는 화면이다', () => {
  const source = read('server/src/routes/sessions.ts')
  const listRoute = source.slice(source.indexOf("router.get('/',"), source.indexOf("router.get('/:id'"))

  assert.equal(
    /for \(const session of sessions\)[\s\S]{0,200}await listParticipantsWithProgress/.test(listRoute),
    false,
    '수업마다 참여자 조회를 부르고 있다 — N+1 이 돌아왔다',
  )
  assert.ok(/selectAllPaged<[\s\S]{0,200}sessionIds,/.test(listRoute), '참여자를 수업 목록 전체에 대해 한 번에 가져오지 않는다')
  assert.ok(/summarizeSessionActivity\(/.test(listRoute), '목록이 활동 집계를 내보내지 않는다')
})

test('8) 구 이름 participant_count 를 계속 내보낸다 — 배포 시차 동안 카드가 0명으로 보이지 않게', () => {
  const source = read('server/src/routes/sessions.ts')
  assert.ok(/participant_count: activity\.student_count/.test(source), 'participant_count 가 사라졌다')
})

test('9) 목록 조회가 조용히 잘리지 않는다 — id 는 쪼개고 페이지는 끝까지 넘긴다', () => {
  const source = read('server/src/routes/sessions.ts')

  // 🚨 잘림은 에러가 아니라 «더 작은 숫자»로 나온다. 200명짜리 수업 몇 개면 참여자만으로
  //    PostgREST 기본 행 상한(1,000)을 넘고, 교사 화면이 조용히 덜 센다.
  assert.ok(/const ROW_PAGE = 1000/.test(source), '행 상한을 넘길 페이지 개념이 없다')
  assert.ok(/\.range\(from, to\)/.test(source), '페이지를 넘기지 않는다 — 첫 1,000행만 세게 된다')
  assert.ok(/ids\.slice\(index, index \+ ID_CHUNK\)/.test(source), 'IN 목록을 쪼개지 않는다 — 요청 길이가 터진다')

  const listRoute = source.slice(source.indexOf("router.get('/',"), source.indexOf("router.get('/:id'"))
  assert.equal(
    [...listRoute.matchAll(/selectAllPaged</g)].length,
    2,
    '참여자·진도 두 조회가 모두 페이지 처리를 거쳐야 한다',
  )
})
