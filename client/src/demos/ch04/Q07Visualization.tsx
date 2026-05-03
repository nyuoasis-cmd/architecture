import { Hero, Icons, LogBox, PairFlow, StateChips, getTone, validatePairSet } from '../_shared';
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
  goal: {
    title: '무엇을 알고 싶은지 먼저 묻기 — 목표',
    summary: '좋은 차트는 예쁜 그림보다 질문에서 시작합니다. 먼저 무엇을 비교하고 싶은지 정해야 필요한 데이터와 표현 방식이 선명해집니다.',
    active: 0,
    chips: ['추세를 볼까', '비교를 할까', '구성을 볼까', '누가 읽을까'],
    focus: 0,
    logs: [
      ['16:30:01', '분석 질문 정의 시작'],
      ['16:30:02', '독자와 목적 정리'],
      ['16:30:03', '핵심 지표 후보 선택'],
    ],
  },
  chart: {
    title: '질문에 맞는 도형 고르기 — 차트 선택',
    summary: '비교에는 막대, 추세에는 선, 비중에는 누적 구조가 더 잘 맞습니다. 차트는 데이터보다 질문을 가장 잘 드러내는 형태를 골라야 합니다.',
    active: 1,
    chips: ['막대는 비교', '선은 흐름', '점은 관계', '표는 정확값'],
    focus: 1,
    logs: [
      ['16:31:01', '비교형 질문으로 분류'],
      ['16:31:02', '막대 차트 후보 채택'],
      ['16:31:03', '보조 차트 제외'],
    ],
  },
  axis: {
    title: '축과 범위를 바로 세우기 — 축 점검',
    summary: '축 시작점과 단위를 잘못 잡으면 같은 데이터도 과장되거나 축소돼 보입니다. 차트 해석의 신뢰는 축에서 크게 갈립니다.',
    active: 2,
    chips: ['0부터 시작할까', '단위는 같은가', '범위가 과장됐나', '비율 축인가'],
    focus: 2,
    logs: [
      ['16:32:01', 'Y축 시작값 확인'],
      ['16:32:02', '단위 일치 검증'],
      ['16:32:03', '왜곡 가능성 경고 제거'],
    ],
  },
  focus: {
    title: '핵심만 남기기 — 단순화',
    summary: '격자와 장식, 색을 과하게 쓰면 메시지가 오히려 흐려집니다. 전달하려는 비교 하나가 잘 보이도록 노이즈를 걷어내야 합니다.',
    active: 3,
    chips: ['장식 줄이기', '색 하나 강조', '라벨 최소화', '메시지 고정'],
    focus: 3,
    logs: [
      ['16:33:01', '불필요한 범례 제거'],
      ['16:33:02', '강조 색 1개만 유지'],
      ['16:33:03', '핵심 메시지 문장 확정'],
    ],
  },
};

const TONE = getTone(4);

const METAPHOR = [
  { icon: <Icons.QuestionIcon />, label: '질문', sub: '무엇을 알고 싶나' },
  { icon: <Icons.PickQuestionIcon />, label: '선택', sub: '맞는 차트' },
  { icon: <Icons.CheckAxisIcon />, label: '점검', sub: '축·범위' },
  { icon: <Icons.RestraintIcon />, label: '절제', sub: '핵심만' },
];

const IT = [
  { icon: <Icons.GoalIcon />, label: '목표', sub: '분석 의도' },
  { icon: <Icons.ChartIcon />, label: '차트', sub: '시각 형식' },
  { icon: <Icons.AxisIcon />, label: '축', sub: '척도 정합' },
  { icon: <Icons.SimplifyIcon />, label: '단순화', sub: '노이즈 제거' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q07Visualization({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.goal;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="시각화 흐름" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="시각화 사고 흐름"
        itTitle="데이터 시각화 흐름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="지금 점검할 질문"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
          color: scene.focus === idx ? 'var(--demo-chip-hot-orange-fg)' : undefined,
        }))}
        tone={TONE}
        description="좋은 차트는 더 많은 장식이 아니라 더 적은 오해를 목표로 합니다."
      />

      <LogBox logs={scene.logs} variant="stone" title="시각화 검토 로그" />
    </div>
  );
}
