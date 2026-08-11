import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildVerdict, MY_TURN_TASKS } from './vibe-my-turn';

const task = MY_TURN_TASKS.ch13_q01!;

test('buildVerdict: 정한 칸과 안 정한 칸을 클라이언트 계약으로 나눈다', () => {
  const verdict = buildVerdict(task, {
    slots: [
      { key: 'limit', covered: true, studentRule: '1인 1권', inventedValue: null },
      { key: 'due', covered: false, studentRule: null, inventedValue: '반납 기한 7일' },
      { key: 'overdue', covered: false, studentRule: null, inventedValue: null },
      { key: 'identity', covered: true, studentRule: '출석번호', inventedValue: null },
      { key: 'retention', covered: false, studentRule: null, inventedValue: '  ' },
    ],
    coach: '좋아, 두 칸을 정했네.',
  });

  assert.deepEqual(
    verdict.covered.map((slot) => slot.key),
    ['limit', 'identity'],
  );
  assert.deepEqual(
    verdict.invented.map((slot) => slot.key),
    ['due', 'overdue', 'retention'],
  );
  // 모델이 준 값이 있으면 그것을, 비었으면 문항의 대표 예시로 대체한다
  assert.equal(verdict.invented[0]!.example, '반납 기한 7일');
  assert.equal(verdict.invented[1]!.example, '연체 시 30일 대출 정지');
  assert.equal(verdict.invented[2]!.example, '대출 기록 무기한 보관');
  assert.equal(verdict.coach, '좋아, 두 칸을 정했네.');
});

test('buildVerdict: 모델이 칸을 통째로 빠뜨려도 «안 정함»으로 안전 처리한다', () => {
  const verdict = buildVerdict(task, { slots: [], coach: '' });
  assert.equal(verdict.covered.length, 0);
  assert.equal(verdict.invented.length, task.slots.length);
});

// ── 호출 통제의 «신원»과 «선언» — 둘 다 조용히 틀릴 수 있는 자리다 ────────────────
test('학생 키는 참여자 토큰에서 나온다 — IP 로 재면 교실 전체가 한 명이 된다', async () => {
  const { resolveActorId } = await import('../routes/vibe');

  const mk = (cookie?: string) =>
    ({
      ip: '1.2.3.4',
      socket: { remoteAddress: '1.2.3.4' },
      get: (name: string) => (name.toLowerCase() === 'cookie' ? cookie : undefined),
    }) as never;

  // 서명 비밀 없이도 «키를 어떻게 만드는가» 를 검사한다 — 검증 자체는 participant-token 의 몫.
  const fakeVerify = (token: string) => (token.startsWith('ok-') ? { participant_id: token.slice(3) } : null);

  assert.equal(resolveActorId(mk(), fakeVerify), 'ip:1.2.3.4', '토큰이 없으면 IP 로 떨어지고, 그 사실이 키에 남아야 한다');
  assert.equal(resolveActorId(mk('arch_pt=ok-alpha'), fakeVerify), 'pt:alpha');
  assert.notEqual(
    resolveActorId(mk('arch_pt=ok-alpha'), fakeVerify),
    resolveActorId(mk('arch_pt=ok-beta'), fakeVerify),
    '같은 IP(교실 공유 NAT)에서 온 두 학생이 같은 키를 받으면, 한 명이 쓰는 순간 반 전체가 쿨타임에 걸린다',
  );
  assert.equal(
    resolveActorId(mk('arch_pt=위조'), fakeVerify),
    'ip:1.2.3.4',
    '검증에 실패한 토큰을 신원으로 받아주면 아무나 남의 키를 주장할 수 있다',
  );
  // 기본 인자가 진짜 검증기인지 — 위조 토큰이 참여자 키로 통과하면 안 된다.
  assert.equal(resolveActorId(mk('arch_pt=위조')), 'ip:1.2.3.4');
});

test('/health 의 캡 선언이 실제 통제값과 같다 — 선언만 바뀌면 거짓말이 된다', async () => {
  const { classCheckBlock } = await import('./classCheck');
  const { MY_TURN_LIMITS } = await import('./vibe-my-turn');
  const saved = process.env.MYTURN_GUARD_ENABLED;
  // 🚨 기본값이 «켬»(2026-08-11 jery 2차 결정)이지만, 이 검사는 «켠 상태의 선언»을 보는 것이므로
  //    기본값에 기대지 않고 명시적으로 켠다 — 기본값이 또 바뀌어도 이 검사의 뜻은 그대로여야 한다.
  process.env.MYTURN_GUARD_ENABLED = '1';
  try {
    const block = classCheckBlock() as { capPolicy: string; caps: Record<string, number> };
    assert.equal(block.capPolicy, 'app-daily', '전역 일일 캡이 있는데 none 이라 말하면 여유를 과대평가하게 된다');
    assert.equal(block.caps.MYTURN_DAILY_CAP, MY_TURN_LIMITS.globalDaily);
    assert.equal(block.caps.MYTURN_PER_MIN, MY_TURN_LIMITS.globalPerMin);
    assert.equal(block.caps.MYTURN_ACTOR_DAILY_CAP, MY_TURN_LIMITS.actorDaily);
  } finally {
    if (saved === undefined) delete process.env.MYTURN_GUARD_ENABLED;
    else process.env.MYTURN_GUARD_ENABLED = saved;
  }
});

// 🚨 이 앱은 「내 차례」가 AI(Haiku 4.5)를 부른다. 통제를 켜고 끄는 것은 **결정**이고, 그 결정이
//    코드 어딘가에서 조용히 뒤집히면 그때는 사고다(끈 채로 «있다»고 말하는 것도 같은 사고).
//    그래서 «기본은 켜져 있다»와 «env 한 줄로 끌 수 있다»를 둘 다 계약으로 박아 둔다.
test('호출 통제: 기본은 켜져 있고, env 한 줄로 끌 수 있다', async () => {
  const { myTurnGuardEnabled } = await import('./vibe-my-turn');
  const saved = process.env.MYTURN_GUARD_ENABLED;
  try {
    delete process.env.MYTURN_GUARD_ENABLED;
    assert.equal(
      myTurnGuardEnabled(),
      true,
      'jery 2차 결정 = 넓히는 대신 상한을 건다. 이게 false 로 뒤집히면 지출 상한이 통째로 사라진다',
    );

    process.env.MYTURN_GUARD_ENABLED = '0';
    assert.equal(myTurnGuardEnabled(), false, 'env 한 줄로 «배포 없이» 꺼지지 않으면 수업 중 막혔을 때 손쓸 수가 없다');

    process.env.MYTURN_GUARD_ENABLED = '1';
    assert.equal(myTurnGuardEnabled(), true);
  } finally {
    if (saved === undefined) delete process.env.MYTURN_GUARD_ENABLED;
    else process.env.MYTURN_GUARD_ENABLED = saved;
  }
});
