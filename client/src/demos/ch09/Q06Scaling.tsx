import { Hero, Icons, LogBox, PairMatch, StateChips, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  chips: Array<{ label: string; active?: boolean }>;
  note: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  measure: {
    title: '확장은 장비부터 늘리기보다 어디가 막혔는지 먼저 재는 일에서 시작한다',
    summary: '줄이 긴 창구를 먼저 찾듯, 성능 문제도 병목 지점을 측정해야 수직 확장과 수평 확장 중 무엇이 맞는지 판단할 수 있습니다.',
    active: 0,
    chips: [
      { label: '먼저 측정', active: true },
      { label: '병목 확인' },
      { label: '근거 판단' },
    ],
    note: '확장 전략은 감으로 고르면 비용만 늘 수 있습니다. 어느 자원이 먼저 막히는지 확인해야 다음 선택이 의미를 가집니다.',
    logs: [
      ['15:21:01', '응답 지연 구간 측정 시작'],
      ['15:21:02', '계산 구간 사용률 급등 확인'],
      ['15:21:03', '병목 지점 후보 2곳 추림'],
    ],
  },
  'scale-up': {
    title: '한 대가 너무 약하면 먼저 키워서 같은 구조로 버티게 할 수 있다',
    summary: '창구 하나를 더 빠른 장비로 바꾸듯, 수직 확장은 서버 한 대의 자원을 키워 같은 구조 안에서 처리량을 높이는 방식입니다.',
    active: 1,
    chips: [
      { label: '한 대 강화', active: true },
      { label: '구조 유지' },
      { label: '한계 존재' },
    ],
    note: '수직 확장은 적용이 단순하고 빠르지만 한 대에 기대는 한계가 남습니다. 장비 상한과 장애 영향 범위도 함께 봐야 합니다.',
    logs: [
      ['15:22:01', '기존 서버 자원 상향 적용'],
      ['15:22:02', '같은 구조에서 처리량 증가'],
      ['15:22:03', '단일 장비 의존도는 유지'],
    ],
  },
  'scale-out': {
    title: '요청이 꾸준히 많다면 여러 대로 나눠 부담을 분산하는 편이 낫다',
    summary: '창구를 여러 개 열어 손님을 나누듯, 수평 확장은 여러 인스턴스로 트래픽을 분산해 처리량과 가용성을 함께 높입니다.',
    active: 2,
    chips: [
      { label: '여러 대 추가', active: true },
      { label: '분산 처리' },
      { label: '가용성 향상' },
    ],
    note: '수평 확장은 부하 분산과 장애 내성에 강하지만 세션 처리와 데이터 공유처럼 분산 운영 규칙이 더 필요해집니다.',
    logs: [
      ['15:23:01', '인스턴스 3대로 분산 시작'],
      ['15:23:02', '부하 분산기로 요청 재배치'],
      ['15:23:03', '한 대 장애에도 전체 응답 유지'],
    ],
  },
  mix: {
    title: '실전에서는 한 번의 정답보다 상황별 혼합 전략이 더 자주 쓰인다',
    summary: '주요 창구는 장비를 키우고 혼잡 시간엔 창구 수를 늘리듯, 혼합 전략은 병목 성격에 따라 수직 확장과 수평 확장을 함께 씁니다.',
    active: 3,
    chips: [
      { label: '혼합 전략', active: true },
      { label: '상황별 선택' },
      { label: '비용 균형' },
    ],
    note: '대부분의 시스템은 한 가지 확장만으로 끝나지 않습니다. 계산 구간, 저장소, 트래픽 패턴을 나눠 보고 조합하는 편이 현실적입니다.',
    logs: [
      ['15:24:01', '저장소는 수직 확장 유지'],
      ['15:24:02', '웹 계층은 수평 확장 추가'],
      ['15:24:03', '구간별 혼합안 운영 시작'],
    ],
  },
};

const TONE = getTone(9);

const METAPHOR = [
  { icon: <Icons.CalcIcon />, label: '측정', sub: '병목 찾기' },
  { icon: <Icons.HomeApplianceIcon />, label: '키우기', sub: '한 대 강화' },
  { icon: <Icons.SpreadIcon />, label: '늘리기', sub: '여러 대' },
  { icon: <Icons.BalanceIcon />, label: '혼합', sub: '상황별' },
];

const IT = [
  { icon: <Icons.LatencyIcon />, label: '병목 측정', sub: '지점 확인' },
  { icon: <Icons.CpuIcon />, label: '수직 확장', sub: '자원 상향' },
  { icon: <Icons.ParallelIcon />, label: '수평 확장', sub: '분산 처리' },
  { icon: <Icons.StrategyIcon />, label: '혼합 전략', sub: '조합 운영' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q06Scaling({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.measure;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="확장 전략" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="창구 운영 비유"
        itTitle="확장 선택"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="확장 판단 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="blue" title="확장 판단 로그" />
    </div>
  );
}
