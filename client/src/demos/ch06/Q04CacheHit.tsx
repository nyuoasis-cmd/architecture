import {
  GroupBadge,
  Hero,
  IconCard,
  Icons,
  LogBox,
  PairConnector,
  StateChips,
  getTone,
  validatePairSet,
} from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  chips: string[];
  focus: number;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  recent: {
    title: '방금 쓴 값을 다시 찾을 때 더 빠른 이유',
    summary: '방금 접근한 값은 곧 다시 쓸 가능성이 높습니다. 캐시는 이 최근값을 가까이에 남겨 두어 같은 주소 재접근을 빠르게 만듭니다.',
    active: 0,
    chips: ['시간 지역성', '최근 접근 재사용', '짧은 왕복'],
    focus: 0,
    logs: [
      ['16:40:01', '같은 변수 주소 재접근 요청'],
      ['16:40:02', '최근 캐시 라인 우선 조회'],
      ['16:40:03', '메모리 왕복 없이 값 반환'],
    ],
  },
  nearby: {
    title: '근처 데이터도 함께 빨라지는 이유',
    summary: '배열처럼 연속된 값을 읽을 때는 바로 옆 주소를 이어서 볼 가능성이 큽니다. 캐시는 주변 데이터를 한 줄로 묶어 함께 가져옵니다.',
    active: 1,
    chips: ['공간 지역성', '연속 주소 묶음', '배열 순회 최적화'],
    focus: 1,
    logs: [
      ['16:41:01', 'arr[8] 읽기 요청'],
      ['16:41:02', '인접 주소 포함 캐시 라인 적재'],
      ['16:41:03', 'arr[9], arr[10] 접근 준비'],
    ],
  },
  hit: {
    title: '필요한 값이 캐시에 있으면 적중이다',
    summary: '찾는 데이터가 이미 가까운 계층에 있으면 캐시 히트가 발생합니다. CPU는 느린 RAM까지 내려가지 않고 바로 계산을 이어 갑니다.',
    active: 2,
    chips: ['cache hit', '지연 감소', 'CPU 대기 축소'],
    focus: 0,
    logs: [
      ['16:42:01', 'L1 조회 성공'],
      ['16:42:02', '대상 데이터 즉시 반환'],
      ['16:42:03', '파이프라인 stall 없이 진행'],
    ],
  },
  miss: {
    title: '캐시에 없으면 아래 계층까지 내려간다',
    summary: '캐시 미스가 나면 더 큰 아래 계층에서 값을 다시 가져와야 합니다. 그 사이 CPU는 기다리거나 다른 일을 하며 지연을 감수합니다.',
    active: 3,
    chips: ['cache miss', 'RAM 재조회', '대기 시간 증가'],
    focus: 2,
    logs: [
      ['16:43:01', 'L1, L2 조회 실패'],
      ['16:43:02', 'RAM으로 접근 경로 확장'],
      ['16:43:03', '가져온 뒤 캐시에 새로 적재'],
    ],
  },
  levels: {
    title: 'L1에서 L3까지 계층을 나눠 속도를 조절한다',
    summary: '가장 가까운 L1은 작고 빠르고, L2와 L3로 갈수록 커지지만 조금씩 느려집니다. 여러 층을 두어 속도와 용량의 균형을 맞춥니다.',
    active: 4,
    chips: ['L1 최속', 'L2 중간', 'L3 공유 완충'],
    focus: 1,
    logs: [
      ['16:44:01', 'L1 miss, L2 조회'],
      ['16:44:02', 'L2 miss, L3 공유 캐시 조회'],
      ['16:44:03', '상위 계층으로 값 재배치'],
    ],
  },
};

const TONE = getTone(6);

const METAPHOR = [
  { icon: <Icons.RecentIcon />, label: '방금', sub: '최근 접근' },
  { icon: <Icons.NearbyIcon />, label: '근처', sub: '인접 데이터' },
  { icon: <Icons.HitIcon />, label: '적중', sub: '캐시에 있음' },
  { icon: <Icons.MissIcon />, label: '미스', sub: '없어서 다시' },
  { icon: <Icons.LayerIcon />, label: '계층', sub: 'L1→L2→L3' },
];

const IT = [
  { icon: <Icons.RecentValueIcon />, label: '최근값', sub: '시간 지역성' },
  { icon: <Icons.NearValueIcon />, label: '인접값', sub: '공간 지역성' },
  { icon: <Icons.CacheHitIcon />, label: '캐시 적중', sub: 'cache hit' },
  { icon: <Icons.CacheMissIcon />, label: '재조회 미스', sub: 'cache miss' },
  { icon: <Icons.CacheLevelIcon />, label: 'L1-L3캐시', sub: '계층별' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

function FiveStepPairFlow({
  metaphorTitle,
  itTitle,
  activeIndex,
}: {
  metaphorTitle: string;
  itTitle: string;
  activeIndex: number;
}) {
  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
      <GroupBadge label={metaphorTitle} sub="비유" tone={TONE} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {METAPHOR.map((item, idx) => (
          <IconCard key={`meta-${item.label}`} icon={item.icon} label={item.label} sub={item.sub} active={activeIndex === idx} tone={TONE} />
        ))}
      </div>
      <PairConnector tone={TONE} />
      <GroupBadge label={itTitle} sub="실제" tone={TONE} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {IT.map((item, idx) => (
          <IconCard key={`it-${item.label}`} icon={item.icon} label={item.label} sub={item.sub} active={activeIndex === idx} tone={TONE} />
        ))}
      </div>
    </section>
  );
}

export default function Q04CacheHit({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.recent;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="캐시 적중" title={scene.title} summary={scene.summary} tone={TONE} />

      <FiveStepPairFlow metaphorTitle="찾기 감각" itTitle="캐시 지역성" activeIndex={scene.active} />

      <StateChips
        title="속도 차이를 만드는 조건"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="캐시는 무작정 큰 메모리가 아니라, 최근성과 인접성을 이용해 자주 필요한 값을 CPU 가까이에 두는 전략입니다."
      />

      <LogBox logs={scene.logs} variant="blue" title="캐시 계층 로그" />
    </div>
  );
}
