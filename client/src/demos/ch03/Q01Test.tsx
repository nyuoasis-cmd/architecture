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
  unit: {
    title: '부품 확인 — 단위 테스트',
    summary: '가장 작은 부품부터 확인하면 실패 원인을 빨리 좁힐 수 있어 테스트의 출발점이 선명해집니다.',
    active: 0,
    lanes: [
      ['기어 하나', '나사 한 묶음'],
      ['함수 한 개', '계산 규칙 한 개'],
      ['문제가 생긴 지점이 바로 드러남'],
    ],
    note: '단위 테스트는 가장 작은 조각을 빨리 확인해 수정 비용을 낮춥니다. 그래서 테스트 피라미드의 바닥을 넓게 깔아 두는 전략이 유리합니다.',
    logs: [
      ['10:00:01', 'tax(10000) => 11000 통과'],
      ['10:00:02', 'formatDate() 경계값 확인'],
      ['10:00:03', 'discount 함수 실패 위치 고정'],
    ],
  },
  integration: {
    title: '연결 확인 — 통합 테스트',
    summary: '각 부품이 따로는 멀쩡해도 연결부에서 데이터가 어긋날 수 있어, 통합 지점을 따로 확인해야 합니다.',
    active: 1,
    lanes: [
      ['축과 톱니 맞물림', '전선 연결'],
      ['API 호출', 'DB 저장'],
      ['경계에서 생기는 충돌을 탐지'],
    ],
    note: '통합 테스트는 연결 지점의 계약을 검증합니다. 단위 테스트보다 느리지만, 실제로 많이 깨지는 부분이어서 핵심 연결은 꼭 포함해야 합니다.',
    logs: [
      ['10:00:04', '로그인 후 세션 저장 확인'],
      ['10:00:05', '주문 생성과 결제 연동 점검'],
      ['10:00:06', '응답 형식 mismatch 감지'],
    ],
  },
  e2e: {
    title: '사용 흐름 확인 — E2E 테스트',
    summary: '사용자 입장에서 처음부터 끝까지 따라가며 전체 여정이 끊기지 않는지 확인하는 단계입니다.',
    active: 2,
    lanes: [
      ['완성품 시동', '전체 동작 시연'],
      ['회원가입', '결제 완료'],
      ['사용자 여정 전체를 검증'],
    ],
    note: 'E2E 테스트는 가장 넓은 범위를 다루므로 수가 많을수록 유지 비용이 커집니다. 그래서 핵심 경로만 골라 좁고 깊게 배치하는 편이 좋습니다.',
    logs: [
      ['10:00:07', '회원가입 폼 입력 자동화'],
      ['10:00:08', '인증 메일 확인 단계 통과'],
      ['10:00:09', '완료 화면 렌더 실패 감지'],
    ],
  },
  balance: {
    title: '균형 잡기 — 테스트 피라미드',
    summary: '빠른 단위 테스트를 많이, 무거운 E2E는 핵심만 두어 전체 검증 비용과 속도의 균형을 맞춥니다.',
    active: 3,
    lanes: [
      ['작은 부품 다수', '연결 확인 소수'],
      ['단위 테스트 다수', 'E2E 핵심만 유지'],
      ['속도와 신뢰를 함께 확보'],
    ],
    note: '테스트 전략의 핵심은 많이 돌려도 버티는 구조입니다. 아래층은 넓게, 위층은 가볍게 유지해야 개발 흐름을 방해하지 않으면서 품질을 지킬 수 있습니다.',
    logs: [
      ['10:00:10', '단위 180건 유지'],
      ['10:00:11', '통합 24건으로 연결 보강'],
      ['10:00:12', 'E2E 6건으로 핵심 경로 고정'],
    ],
  },
};

const TONE = getTone(3);

const METAPHOR = [
  { icon: <Icons.PartIcon />, label: '부품', sub: '사용' },
  { icon: <Icons.LinkIcon />, label: '연결', sub: '사용' },
  { icon: <Icons.UseIcon />, label: '사용', sub: '사용' },
  { icon: <Icons.BalanceIcon />, label: '균형', sub: '사용' },
];

const IT = [
  { icon: <Icons.UnitIcon />, label: '단위', sub: '사용' },
  { icon: <Icons.IntegrationIcon />, label: '통합', sub: '사용' },
  { icon: <Icons.E2EIcon />, label: 'E2E', sub: '사용' },
  { icon: <Icons.BalanceItIcon />, label: '균형', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q01Test({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.unit;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="테스트 단계" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="품질 점검 단계"
        itTitle="테스트 단계"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">점검 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['메타포 장면', 'IT 장면', '핵심 의미'];
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

      <LogBox logs={scene.logs} variant="stone" title="검증 로그" />
    </div>
  );
}
