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
  duplicate: {
    title: '같은 정보가 여러 칸에 쌓이기 — 중복',
    summary: '같은 고객 이름과 주소가 주문마다 반복되면 입력은 쉬워 보여도 관리 비용이 커집니다. 겹치는 정보가 많을수록 나중에 더 비싸게 돌아옵니다.',
    active: 0,
    lanes: [
      ['주문1에 고객명', '주문2에 같은 고객명'],
      ['중복 컬럼 증가', '저장 낭비'],
      ['변경 시 여러 곳 수정 필요'],
    ],
    note: '중복은 처음엔 편하지만 시간이 지날수록 관리 포인트를 늘립니다. 특히 사람이 직접 입력하는 시스템에서는 오타와 불일치가 함께 늘어납니다.',
    logs: [
      ['13:40:01', 'customer_name 중복 1,240건 감지'],
      ['13:40:02', '주문 테이블 반복 컬럼 분석'],
      ['13:40:03', '정규화 후보 식별'],
    ],
  },
  anomaly: {
    title: '한쪽만 고쳐지는 문제 — 수정 이상',
    summary: '정보가 복사돼 있으면 어떤 행은 최신이고 어떤 행은 옛값인 상태가 생깁니다. 이 불일치가 바로 수정 이상입니다.',
    active: 1,
    lanes: [
      ['주소 변경 요청', '주문 행 일부만 수정'],
      ['행마다 값 충돌', '신뢰도 하락'],
      ['어느 값이 맞는지 다시 확인'],
    ],
    note: '수정 이상은 저장 공간보다 더 치명적입니다. 같은 고객이 서로 다른 주소를 갖는 순간 데이터 전체 신뢰가 흔들립니다.',
    logs: [
      ['13:41:01', '고객 주소 업데이트 시작'],
      ['13:41:02', '12개 행 중 9개만 반영'],
      ['13:41:03', '불일치 데이터 경고 발생'],
    ],
  },
  normalize: {
    title: '한 곳으로 분리해 정리 — 정규화',
    summary: '중복 정보를 별도 테이블로 분리하면 사실의 원본 위치가 하나로 줄어듭니다. 주문은 고객 ID만 들고, 상세 정보는 고객 테이블에서 읽으면 됩니다.',
    active: 2,
    lanes: [
      ['고객 정보 분리', '주문은 ID 참조'],
      ['한 곳에서 수정', '일관성 유지'],
      ['중복 제거', '관계 연결'],
    ],
    note: '정규화의 핵심은 한 사실을 한 곳에만 두는 것입니다. 쓰기 일관성이 중요한 업무 데이터에서 특히 강한 전략입니다.',
    logs: [
      ['13:42:01', 'customers 테이블 생성'],
      ['13:42:02', 'orders.customer_id FK 연결'],
      ['13:42:03', '중복 필드 제거 완료'],
    ],
  },
  balance: {
    title: '읽기 속도와 쓰기 규칙 사이 — 균형',
    summary: '분리를 너무 밀어붙이면 조회 시 조인이 많아집니다. 그래서 읽기 성능이 더 중요한 구간에서는 일부를 다시 붙여 두는 비정규화도 함께 고려합니다.',
    active: 3,
    lanes: [
      ['조인 비용 확인', '조회 패턴 측정'],
      ['핵심 화면 캐시', '요약 테이블'],
      ['쓰기 일관성', '읽기 속도 균형'],
    ],
    note: '정규화와 비정규화는 선악 구도가 아닙니다. 데이터의 진실은 지키되, 조회 병목이 큰 지점만 선택적으로 풀어 주는 균형 감각이 필요합니다.',
    logs: [
      ['13:43:01', '조회 지연 구간 확인'],
      ['13:43:02', '리포트용 요약 테이블 검토'],
      ['13:43:03', '읽기/쓰기 균형안 채택'],
    ],
  },
};

const TONE = getTone(4);

const METAPHOR = [
  { icon: <Icons.DuplicateIcon />, label: '중복', sub: '같은 정보' },
  { icon: <Icons.ConfusionIcon />, label: '혼선', sub: '갱신 충돌' },
  { icon: <Icons.SplitIcon />, label: '분리', sub: '한 곳 정리' },
  { icon: <Icons.BalanceMetaIcon />, label: '균형', sub: '읽기 vs 쓰기' },
];

const IT = [
  { icon: <Icons.DataDupIcon />, label: '중복', sub: '비효율' },
  { icon: <Icons.UpdateAnomalyIcon />, label: '수정 이상', sub: '갱신 위험' },
  { icon: <Icons.NormalizeIcon />, label: '분리', sub: '정규화' },
  { icon: <Icons.QueryBalanceIcon />, label: '조회 균형', sub: '비정규화' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q03DataDup({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.duplicate;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="데이터 중복 흐름" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="데이터 중복 흐름"
        itTitle="정규화 흐름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">정리 전후 비교</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['데이터 장면', 'DB 해석', '결과 영향'];
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

      <LogBox logs={scene.logs} variant="blue" title="정규화 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
