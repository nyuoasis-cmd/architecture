import { Hero, Icons, LogBox, PairFlow, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  lanes: string[][];
  note: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  dirty: {
    title: '더티 읽기는 아직 확정되지 않은 값을 먼저 본다',
    summary: '다른 트랜잭션이 commit 하기 전 값을 읽어 버리면, 나중에 rollback 되었을 때 존재하지 않았어야 할 정보를 기준으로 판단하게 됩니다.',
    active: 0,
    lanes: [
      ['옆 창구 메모를 먼저 봄', '아직 확정 전 내용'],
      ['미확정 값 읽기', 'rollback 가능 상태'],
      ['판단 흔들림', '잘못된 계산 위험'],
    ],
    note: '더티 읽기는 가장 느슨한 격리 감각입니다. 빠를 수는 있지만, 나중에 사라질 값까지 믿어 버릴 수 있습니다.',
    logs: [
      ['19:20:01', 'tx-B가 미확정 잔액 읽음'],
      ['19:20:02', 'tx-A rollback 대기'],
      ['19:20:03', '더티 읽기 경고 기록'],
    ],
  },
  committed: {
    title: '커밋 읽기는 확정된 값만 보지만 다시 읽으면 달라질 수 있다',
    summary: 'Read Committed는 commit 된 값만 읽게 막아 더티 읽기를 피합니다. 대신 같은 조회를 두 번 했을 때 중간에 다른 트랜잭션이 commit 하면 결과가 달라질 수 있습니다.',
    active: 1,
    lanes: [
      ['도장 찍힌 문서만 확인', '확정본만 읽기'],
      ['commit 후 공개', '더티 읽기 차단'],
      ['재조회 시 변화 가능', '중간 갱신 반영'],
    ],
    note: '커밋 읽기는 실무에서 널리 쓰이는 기본선입니다. 더티 읽기를 막되, 완전한 재현성까지는 보장하지 않습니다.',
    logs: [
      ['19:21:01', 'tx-B가 commit 완료 행만 조회'],
      ['19:21:02', '미확정 변경은 숨김 유지'],
      ['19:21:03', '다음 조회에서 새 commit 반영'],
    ],
  },
  repeatable: {
    title: '반복 읽기는 같은 행을 다시 봐도 같은 값을 유지한다',
    summary: 'Repeatable Read는 한 트랜잭션 안에서 이미 읽은 행의 값이 중간에 바뀌어 보이지 않게 합니다. 그래서 같은 계산을 다시 해도 기준 값이 흔들리지 않습니다.',
    active: 2,
    lanes: [
      ['같은 영수증 재확인', '처음 본 값 유지'],
      ['읽은 행 버전 고정', '반복 조회 안정'],
      ['계산 재현성 상승', '중간 변경 차단'],
    ],
    note: '반복 읽기는 더 강한 일관성을 주지만, 동시에 움직이는 작업 수가 많을수록 잠금이나 버전 관리 비용이 더 필요합니다.',
    logs: [
      ['19:22:01', 'tx-B가 첫 조회 스냅샷 생성'],
      ['19:22:02', '같은 행 재조회 값 유지'],
      ['19:22:03', '반복 읽기 보장 확인'],
    ],
  },
  serial: {
    title: '직렬화는 동시에 온 작업도 한 줄로 세운 것처럼 다룬다',
    summary: 'Serializable은 트랜잭션이 실제로는 동시에 시작돼도, 결과만큼은 순서대로 하나씩 실행한 것처럼 맞추려는 가장 강한 격리 수준입니다.',
    active: 3,
    lanes: [
      ['창구 한 줄 세우기', '순서대로 처리'],
      ['직렬 실행처럼 보장', '충돌 전 차단'],
      ['가장 안전', '대기 비용 증가'],
    ],
    note: '직렬화는 가장 안전하지만 가장 비쌉니다. 충돌 위험이 큰 핵심 작업에 선택적으로 쓰는 이유가 여기에 있습니다.',
    logs: [
      ['19:23:01', 'tx-C가 선행 트랜잭션 완료 대기'],
      ['19:23:02', '충돌 가능 작업 순서 재조정'],
      ['19:23:03', '직렬화 검증 통과'],
    ],
  },
};

const TONE = getTone(7);

const METAPHOR = [
  { icon: <Icons.DirtyIcon />, label: '더티', sub: '미확정 읽음' },
  { icon: <Icons.CommitIcon />, label: '커밋', sub: '확정 읽음' },
  { icon: <Icons.RepeatableIcon />, label: '반복', sub: '같은 결과' },
  { icon: <Icons.SerialIcon />, label: '직렬', sub: '한 줄로' },
];

const IT = [
  { icon: <Icons.DirtyReadIcon />, label: '더티 읽기', sub: 'Dirty Read' },
  { icon: <Icons.ReadCommittedIcon />, label: '커밋 읽기', sub: 'Read Committed' },
  { icon: <Icons.RepeatableReadIcon />, label: '반복 읽기', sub: 'Repeatable Read' },
  { icon: <Icons.SerializableIcon />, label: '직렬화', sub: 'Serializable' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q06IsolationLevel({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.dirty;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="데이터베이스 격리 수준" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="충돌 감각"
        itTitle="격리 수준 구조"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">격리 수준 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['생활 장면', '데이터베이스 동작', '결과 영향'];
            return (
              <div
                key={titles[index]}
                className="rounded-2xl border p-3 transition"
                style={{
                  minHeight: 120,
                  borderColor: active ? TONE.accent : 'var(--color-border)',
                  background: active ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
                }}
              >
                <p
                  className="m-0 text-[11px] font-bold"
                  style={{ color: active ? TONE.accent : 'var(--color-text-muted)' }}
                >
                  {titles[index]}
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {items.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border px-2.5 py-2 text-[11px] leading-[1.5]"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="mt-3 rounded-2xl border px-3 py-2.5 text-[12px] leading-[1.7]"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--demo-card-bg-alt)',
            color: 'var(--demo-summary-text-stone)',
          }}
        >
          {scene.note}
        </div>
      </section>

      <LogBox logs={scene.logs} variant="blue" title="격리 수준 로그" />
    </div>
  );
}
