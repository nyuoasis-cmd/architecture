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
  process.env.HMAC_SECRET = process.env.HMAC_SECRET || 'test-secret-for-participant-token';
  const { resolveActorId } = await import('../routes/vibe');
  const { signParticipantToken } = await import('./participant-token');

  const mk = (cookie?: string) =>
    ({
      ip: '1.2.3.4',
      socket: { remoteAddress: '1.2.3.4' },
      get: (name: string) => (name.toLowerCase() === 'cookie' ? cookie : undefined),
    }) as never;

  assert.equal(resolveActorId(mk()), 'ip:1.2.3.4', '토큰이 없으면 IP 로 떨어지고, 그 사실이 키에 남아야 한다');

  const t1 = signParticipantToken({ participantId: 'p-1', sessionId: 's-1' });
  const t2 = signParticipantToken({ participantId: 'p-2', sessionId: 's-1' });
  assert.equal(resolveActorId(mk(`arch_pt=${t1}`)), 'pt:p-1');
  assert.notEqual(
    resolveActorId(mk(`arch_pt=${t1}`)),
    resolveActorId(mk(`arch_pt=${t2}`)),
    '같은 IP(교실 공유 NAT)에서 온 두 학생이 같은 키를 받으면, 한 명이 쓰는 순간 반 전체가 쿨타임에 걸린다',
  );
});

test('/health 의 캡 선언이 실제 통제값과 같다 — 선언만 바뀌면 거짓말이 된다', async () => {
  const { classCheckBlock } = await import('./classCheck');
  const { MY_TURN_LIMITS } = await import('./vibe-my-turn');
  const block = classCheckBlock() as { capPolicy: string; caps: Record<string, number> };
  assert.equal(block.capPolicy, 'app-daily', '전역 일일 캡이 있는데 none 이라 말하면 여유를 과대평가하게 된다');
  assert.equal(block.caps.MYTURN_DAILY_CAP, MY_TURN_LIMITS.globalDaily);
  assert.equal(block.caps.MYTURN_PER_MIN, MY_TURN_LIMITS.globalPerMin);
  assert.equal(block.caps.MYTURN_ACTOR_DAILY_CAP, MY_TURN_LIMITS.actorDaily);
});
