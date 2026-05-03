import { Hero, Icons, LogBox, PairFlow, StateChips, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  items: string[];
  focus: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  dev: {
    title: '빠르게 확인 — dev',
    summary: '새 기능을 가장 먼저 시험해 보는 공간이라 빠르게 부수고 빨리 고치는 리듬이 중요합니다.',
    active: 0,
    items: ['로컬/개발 서버', '빠른 반복', '실험 허용', '즉시 수정'],
    focus: 'dev 환경은 가장 빠른 피드백을 위한 장소입니다. 실험과 수정이 자주 일어나므로 안정성보다 속도가 먼저 요구됩니다.',
    logs: [
      ['13:00:01', 'new feature deployed to dev'],
      ['13:00:02', 'UI glitch found'],
      ['13:00:03', 'hotfix commit pushed'],
    ],
  },
  staging: {
    title: '리허설 하기 — staging',
    summary: '운영과 비슷한 조건에서 마지막 점검을 해 보는 무대라서, 실제 배포 전 리허설 역할을 맡습니다.',
    active: 1,
    items: ['운영 유사 설정', 'QA 확인', '외부 연동', '배포 리허설'],
    focus: 'staging은 운영 직전 리허설 환경입니다. 설정과 외부 연동을 운영과 비슷하게 맞춰 최종 불안을 줄이는 데 쓰입니다.',
    logs: [
      ['13:00:04', 'payment sandbox connected'],
      ['13:00:05', 'release checklist complete'],
      ['13:00:06', 'staging sign-off'],
    ],
  },
  prod: {
    title: '실제 운영 — prod',
    summary: '실사용자가 접속하는 공간이라 변화는 가장 신중하게 다뤄야 하고, 안정성이 최우선이 됩니다.',
    active: 2,
    items: ['실사용자', '실데이터', '안정 우선', '모니터링 필수'],
    focus: 'prod는 실제 비즈니스가 일어나는 환경입니다. 그래서 작은 변경도 영향 범위를 넓게 보고 신중하게 올려야 합니다.',
    logs: [
      ['13:00:07', 'traffic switched to prod'],
      ['13:00:08', 'error budget within target'],
      ['13:00:09', 'release announced'],
    ],
  },
  cd: {
    title: '자동 승격 — CD',
    summary: '검증된 변경을 다음 환경으로 올리는 절차를 자동화하면 배포가 덜 흔들리고 재현 가능성이 높아집니다.',
    active: 3,
    items: ['재현 가능', '수작업 감소', '환경별 승격', '배포 기록'],
    focus: 'CD는 단순 자동 배포보다 넓은 개념입니다. 어떤 검증을 통과했을 때 어느 환경으로 올릴지 규칙화해 배포 흐름 전체를 안정시킵니다.',
    logs: [
      ['13:00:10', 'dev passed'],
      ['13:00:11', 'promoted to staging'],
      ['13:00:12', 'awaiting prod approval'],
    ],
  },
};

const TONE = getTone(3);

const METAPHOR = [
  { icon: <Icons.FastIcon />, label: '빠른', sub: '사용' },
  { icon: <Icons.RehearsalIcon />, label: '리허설', sub: '사용' },
  { icon: <Icons.RealIcon />, label: '실제', sub: '사용' },
  { icon: <Icons.AutoIcon />, label: '자동', sub: '사용' },
];

const IT = [
  { icon: <Icons.DevIcon />, label: 'dev', sub: '사용' },
  { icon: <Icons.StagingIcon />, label: 'staging', sub: '사용' },
  { icon: <Icons.ProdIcon />, label: 'prod', sub: '사용' },
  { icon: <Icons.CdIcon />, label: 'CD', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q04Deploy({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.dev;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="배포 환경 흐름" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="공연 단계 흐름"
        itTitle="배포 환경 흐름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="이 환경의 특징" items={scene.items} tone={TONE} description={scene.focus} />

      <LogBox logs={scene.logs} variant="stone" title="배포 로그" lineTimeColor="var(--demo-log-time-stone)" />
    </div>
  );
}
