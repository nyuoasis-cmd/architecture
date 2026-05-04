import { Hero, Icons, LogBox, PairVertical, StateChips, getTone, validatePairSet } from '../_shared';
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
  ai: {
    title: 'AI는 가장 바깥 목표를 가리키는 큰 말이라 안쪽의 여러 방법을 함께 품는다',
    summary: '문제를 풀겠다는 큰 프로젝트 아래 여러 팀이 들어가듯, AI는 기계가 지능적으로 보이는 일을 하게 하려는 넓은 목표를 뜻합니다.',
    active: 0,
    chips: [
      { label: '가장 큰 범위', active: true },
      { label: '여러 방법 포함' },
      { label: '문제 해결' },
    ],
    note: 'AI는 특정 알고리즘 이름이 아니라 큰 목적에 가깝습니다. 그래서 그 안에 규칙 기반 접근도, 학습 기반 접근도 함께 들어갈 수 있습니다.',
    logs: [
      ['19:10:01', '지능적 기능 요구사항 정의'],
      ['19:10:02', '규칙 기반과 학습 기반 대안 비교'],
      ['19:10:03', '상위 목표 범위 AI로 분류'],
    ],
  },
  ml: {
    title: 'ML은 규칙을 모두 손으로 적기보다 데이터에서 패턴을 배우게 하는 접근이다',
    summary: '정답 예시를 많이 보여 주며 감을 익히게 하듯, ML은 데이터를 바탕으로 모델이 패턴을 학습하도록 만드는 방식입니다.',
    active: 1,
    chips: [
      { label: '데이터 기반', active: true },
      { label: '패턴 학습' },
      { label: '규칙 축소' },
    ],
    note: 'ML은 AI 안의 한 갈래입니다. 사람이 규칙을 모두 손으로 쓰지 않고 데이터로 경향을 배우게 한다는 점이 핵심 차이입니다.',
    logs: [
      ['19:11:01', '학습 데이터셋 준비 시작'],
      ['19:11:02', '모델이 입력과 정답 패턴 학습'],
      ['19:11:03', '새 입력에 대한 예측 결과 생성'],
    ],
  },
  dl: {
    title: 'DL은 학습 안에서도 층이 깊은 신경망으로 복잡한 표현을 스스로 쌓아 올린다',
    summary: '여러 단계의 필터를 거치며 특징을 더 정교하게 잡아내듯, DL은 깊은 층의 신경망으로 복잡한 패턴을 학습합니다.',
    active: 2,
    chips: [
      { label: '깊은 층', active: true },
      { label: '표현 학습' },
      { label: '복잡 패턴' },
    ],
    note: 'DL은 ML 안에 포함되는 더 좁은 범주입니다. 특징을 사람이 직접 설계하기보다 신경망이 여러 층을 거치며 스스로 표현을 쌓는 경향이 강합니다.',
    logs: [
      ['19:12:01', '다층 신경망 구조 선택'],
      ['19:12:02', '은닉층을 거치며 특징 표현 학습'],
      ['19:12:03', '복잡한 입력 분류 정확도 향상'],
    ],
  },
  scope: {
    title: '세 용어를 헷갈릴 때는 포함 관계를 먼저 보면 범위 차이가 빠르게 정리된다',
    summary: '큰 원 안에 중간 원과 작은 원이 들어가듯, AI 안에 ML이 있고 ML 안에 DL이 있어 범위가 점점 좁아집니다.',
    active: 3,
    chips: [
      { label: '범위 정리', active: true },
      { label: '포함 관계' },
      { label: '용어 구분' },
    ],
    note: 'AI, ML, DL을 서로 같은 말처럼 쓰면 개념이 흐려집니다. 가장 큰 범위에서 가장 좁은 범위로 내려가는 포함 관계를 먼저 기억하는 편이 안정적입니다.',
    logs: [
      ['19:13:01', 'AI 상위 범주로 도식화 시작'],
      ['19:13:02', 'ML을 학습 기반 하위 범주로 배치'],
      ['19:13:03', 'DL을 신경망 중심 세부 범주로 정리'],
    ],
  },
};

const TONE = getTone(10);

const METAPHOR = [
  { icon: <Icons.GoalIcon />, label: '큰 목표', sub: '문제 풀기' },
  { icon: <Icons.StudentIcon />, label: '학습', sub: '데이터 기반' },
  { icon: <Icons.LayerIcon />, label: '신경망', sub: '깊은 층' },
  { icon: <Icons.BoxMetaIcon />, label: '포함', sub: '계층 구조' },
];

const IT = [
  { icon: <Icons.GoalIcon />, label: 'AI 큰 목표', sub: 'smart systems' },
  { icon: <Icons.ToolPickIcon />, label: '학습 ML', sub: 'pattern learn' },
  { icon: <Icons.SharedIcon />, label: '신경망 DL', sub: 'deep nets' },
  { icon: <Icons.HybridIcon />, label: '포함 관계', sub: 'AI⊃ML⊃DL' },
];

validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' });

export default function Q04AiHierarchy({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.ai;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="AI와 ML과 DL" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairVertical
        metaphorTitle="범위 감각 비유"
        itTitle="AI 계층 구조"
        pairs={METAPHOR.map((metaphor, index) => ({ metaphor, it: IT[index] }))}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="용어 구분 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="blue" title="AI 개념 정리 로그" />
    </div>
  );
}
