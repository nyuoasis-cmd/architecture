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
