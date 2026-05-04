import { Hero, Icons, LogBox, PairMatch, getTone, validatePairSet } from '../_shared';
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
  atomic: {
    title: '전부 성공하거나 전부 취소하기 — 원자성',
    summary: '계좌 이체는 돈을 빼기만 하고 넣지 못한 중간 상태로 끝나면 안 됩니다. 트랜잭션은 묶인 작업을 전부 완료하거나 아예 없던 일로 돌립니다.',
    active: 0,
    lanes: [
      ['출금 성공', '입금 실패면 전체 취소'],
      ['하나의 트랜잭션', 'commit 또는 rollback'],
      ['반쪽 결과 방지'],
    ],
    note: '원자성은 여러 단계 작업을 한 덩어리로 취급합니다. 그래서 장애가 나도 반쯤 반영된 기록이 남지 않습니다.',
    logs: [
      ['18:30:01', 'A 계좌 출금 예약'],
      ['18:30:02', 'B 계좌 입금 실패 감지'],
      ['18:30:03', '전체 rollback 실행'],
    ],
  },
  consistent: {
    title: '항상 규칙 안에 머물기 — 일관성',
    summary: '이체 전후 총합과 제약 조건이 항상 맞아야 시스템을 믿을 수 있습니다. 트랜잭션이 끝난 뒤 데이터는 정해진 규칙을 계속 만족해야 합니다.',
    active: 1,
    lanes: [
      ['잔액 음수 금지', '합계 규칙 유지'],
      ['제약 조건 검사', '유효 상태만 commit'],
      ['깨진 규칙 차단'],
    ],
    note: '일관성은 비즈니스 규칙과 제약을 지키는 약속입니다. 성공한 트랜잭션 뒤에는 데이터가 언제나 유효한 상태여야 합니다.',
    logs: [
      ['18:31:01', '잔액 제약 조건 점검'],
      ['18:31:02', '참조 무결성 확인'],
      ['18:31:03', '유효 상태로 commit'],
    ],
  },
  isolated: {
    title: '서로의 중간 상태를 보지 않기 — 고립성',
    summary: '동시에 들어온 두 거래가 서로 엉켜 중간 계산을 읽어 버리면 결과가 흔들립니다. 각 트랜잭션은 다른 작업이 끝나기 전의 미완성 상태를 보지 않도록 격리됩니다.',
    active: 2,
    lanes: [
      ['동시 이체 요청', '중간 잔액 숨김'],
      ['잠금 또는 버전 관리', '간섭 차단'],
      ['경합에도 안정 유지'],
    ],
    note: '고립성은 동시성 문제를 줄이는 장치입니다. 서로의 중간 상태를 차단해 순서가 바뀌어도 결과가 어긋나지 않게 합니다.',
    logs: [
      ['18:32:01', '두 번째 이체 요청 대기'],
      ['18:32:02', '미완료 행 잠금 유지'],
      ['18:32:03', 'commit 후 다음 거래 진행'],
    ],
  },
  durable: {
    title: '끝난 결과는 남겨 두기 — 지속성',
    summary: '거래 완료 응답을 보낸 뒤 서버가 꺼져도 결과는 사라지면 안 됩니다. commit 된 데이터는 로그와 저장 장치에 남아 다시 살아나야 합니다.',
    active: 3,
    lanes: [
      ['완료 응답 전 기록', '재시작 후 복원'],
      ['WAL/redo log 저장', '디스크 반영'],
      ['장애 뒤에도 결과 유지'],
    ],
    note: '지속성은 성공했다고 말한 결과를 끝까지 책임지는 성질입니다. 장애 뒤 재기동에도 완료된 거래는 그대로 복구돼야 합니다.',
    logs: [
      ['18:33:01', 'commit log flush 완료'],
      ['18:33:02', '디스크 반영 확인'],
      ['18:33:03', '재시작 복구 지점 기록'],
    ],
  },
};

const TONE = getTone(7);

const METAPHOR = [
  { icon: <Icons.AllIcon />, label: '전부', sub: '모두 또는 없음' },
  { icon: <Icons.RuleIcon />, label: '규칙', sub: '항상 유효' },
  { icon: <Icons.BlockMetaIcon />, label: '차단', sub: '동시 간섭 X' },
  { icon: <Icons.PreserveIcon />, label: '보존', sub: '결과 유지' },
];

const IT = [
  { icon: <Icons.AtomicityIcon />, label: '원자성', sub: 'Atomicity' },
  { icon: <Icons.ConsistencyIcon />, label: '일관성', sub: 'Consistency' },
  { icon: <Icons.IsolationIcon />, label: '고립성', sub: 'Isolation' },
  { icon: <Icons.DurabilityIcon />, label: '지속성', sub: 'Durability' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q03Acid({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.atomic;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="트랜잭션 4원칙" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="약속 4가지"
        itTitle="ACID 트랜잭션"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">이체 장면 비교</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['생활 장면', '데이터베이스 동작', '핵심 효과'];
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

      <LogBox logs={scene.logs} variant="blue" title="트랜잭션 로그" />
    </div>
  );
}
