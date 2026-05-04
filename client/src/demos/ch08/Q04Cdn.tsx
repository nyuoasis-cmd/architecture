import { Hero, Icons, LogBox, PairVertical, StateChips, getTone, validatePairSet } from '../_shared';
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
  origin: {
    title: '원본 서버만 멀리 있으면 모두가 긴 길을 돌아가야 한다',
    summary: '콘텐츠가 한 곳의 원본 서버에만 있으면 멀리 있는 사용자일수록 지연이 커집니다. 모든 요청이 본사까지 가는 구조이기 때문입니다.',
    active: 0,
    chips: ['원본 한 곳', '장거리 왕복', '부하 집중'],
    focus: 0,
    logs: [
      ['20:40:01', 'origin 서버 요청 집중'],
      ['20:40:02', '국가 간 왕복 시간 증가'],
      ['20:40:03', '원본 부하 상승'],
    ],
  },
  'edge-kr': {
    title: '가까운 서울 엣지는 국내 사용자에게 먼저 응답한다',
    summary: '한국 사용자는 서울 PoP에서 파일을 받으면 훨씬 짧은 거리로 응답받을 수 있습니다. 자주 찾는 콘텐츠를 가까운 곳에 복제해 둔 효과입니다.',
    active: 1,
    chips: ['서울 PoP', '국내 사용자', '지연 감소'],
    focus: 1,
    logs: [
      ['20:41:01', 'KR edge 캐시 hit'],
      ['20:41:02', '서울 PoP 응답 반환'],
      ['20:41:03', 'origin 우회 완료'],
    ],
  },
  'edge-eu': {
    title: '유럽 사용자도 가까운 엣지에서 같은 파일을 받을 수 있다',
    summary: '해외 사용자에게도 가장 가까운 엣지가 응답하면 원본까지 가지 않아도 됩니다. 같은 서비스라도 지역별 체감 속도를 고르게 만들 수 있습니다.',
    active: 2,
    chips: ['런던 PoP', '해외 사용자', '거리 단축'],
    focus: 1,
    logs: [
      ['20:42:01', 'EU edge 라우팅 선택'],
      ['20:42:02', '런던 PoP에서 응답'],
      ['20:42:03', '대서양 왕복 회피'],
    ],
  },
  balance: {
    title: '분산 효과는 속도와 원본 보호를 동시에 만든다',
    summary: 'CDN은 단순히 빠르게만 하는 기술이 아닙니다. 요청을 여러 엣지에 분산해 원본 서버 부하도 줄이고, 장애 확산도 완화합니다.',
    active: 3,
    chips: ['캐시 분산', '원본 보호', '지역별 최적화'],
    focus: 2,
    logs: [
      ['20:43:01', '엣지별 트래픽 분산'],
      ['20:43:02', 'origin 요청량 감소'],
      ['20:43:03', '지역 지연 평균 하락'],
    ],
  },
};

const TONE = getTone(8);

const METAPHOR = [
  { icon: <Icons.OriginIcon />, label: '원본', sub: '본사 위치' },
  { icon: <Icons.SeoulIcon />, label: '서울', sub: '국내 사용자' },
  { icon: <Icons.EuropeIcon />, label: '유럽', sub: '해외 사용자' },
  { icon: <Icons.SpreadIcon />, label: '분산', sub: '효과' },
];

const IT = [
  { icon: <Icons.OriginServerIcon />, label: '원본 서버', sub: 'origin' },
  { icon: <Icons.EdgeKrIcon />, label: '엣지 KR', sub: '서울 PoP' },
  { icon: <Icons.EdgeEuIcon />, label: '엣지 EU', sub: '런던 PoP' },
  { icon: <Icons.DistEffectIcon />, label: '분산 효과', sub: '지연 ↓' },
];

validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' });

export default function Q04Cdn({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.origin;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="CDN과 분산 전달" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairVertical
        metaphorTitle="위치 감각"
        itTitle="CDN 구성"
        pairs={METAPHOR.map((metaphor, index) => ({ metaphor, it: IT[index] }))}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="분산 포인트"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="CDN은 콘텐츠를 여러 지역에 가까이 두어 사용자 거리와 원본 부담을 함께 줄이는 구조입니다."
      />

      <LogBox logs={scene.logs} variant="blue" title="CDN 전달 로그" />
    </div>
  );
}
