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
  input: {
    title: '재료 받기 — 입력',
    summary: '사용자가 건네는 재료가 입력입니다. 아직 조리되기 전의 값이 들어오는 단계입니다.',
    active: 0,
    items: ['면', '물', '스프', '계란'],
    focus: '키보드, 마우스, 센서처럼 바깥에서 들어오는 신호가 모두 입력에 해당합니다.',
    logs: [
      ['10:10:01', '사용자 요청 수신'],
      ['10:10:02', '재료 목록 확인'],
      ['10:10:03', '조리 준비 단계로 전달'],
    ],
  },
  memory: {
    title: '냄비 준비 — 메모리',
    summary: '당장 쓸 재료를 냄비와 조리대에 올려두는 장면은 메모리와 비슷합니다.',
    active: 1,
    items: ['냄비 속 물', '올려둔 면', '곧 넣을 스프'],
    focus: '메모리는 작업 중 재료를 잠깐 붙잡아 두는 공간이라 빠르지만 영구 보관 창고는 아닙니다.',
    logs: [
      ['10:10:04', '작업대에 재료 배치'],
      ['10:10:05', '냄비에 물 채움'],
      ['10:10:06', '즉시 사용할 재료 유지'],
    ],
  },
  cpu: {
    title: '불로 익히기 — 처리',
    summary: '실제로 변화를 만들어내는 단계가 처리입니다. CPU가 규칙에 따라 계산하는 순간과 닮았습니다.',
    active: 2,
    items: ['끓는 물', '익는 면', '섞이는 스프'],
    focus: 'CPU는 메모리에 올라온 재료를 읽어 순서대로 계산하고 상태를 바꿉니다.',
    logs: [
      ['10:10:07', '불 점화'],
      ['10:10:08', '조리 순서 실행'],
      ['10:10:09', '결과 상태 갱신'],
    ],
  },
  output: {
    title: '그릇에 담기 — 출력',
    summary: '완성된 결과를 사람이 바로 확인할 수 있는 형태로 내놓는 단계가 출력입니다.',
    active: 3,
    items: ['완성된 라면', '김 나는 그릇', '먹을 준비 완료'],
    focus: '화면, 스피커, 프린터처럼 결과를 밖으로 드러내는 장치가 출력 역할을 맡습니다.',
    logs: [
      ['10:10:10', '완성 결과 생성'],
      ['10:10:11', '그릇에 담기'],
      ['10:10:12', '사용자에게 제공'],
    ],
  },
};

const TONE = getTone(1);

const RAMEN_PAIR = [
  { icon: <Icons.IngredientsIcon />, label: '재료', sub: '면·물·스프' },
  { icon: <Icons.PotIcon />, label: '냄비', sub: '잠깐 올려두기' },
  { icon: <Icons.FlameIcon />, label: '불', sub: '익혀서 변화' },
  { icon: <Icons.BowlIcon />, label: '그릇', sub: '담아 내놓기' },
];

const COMPUTER_PAIR = [
  { icon: <Icons.KeyboardIcon />, label: '입력', sub: '바깥에서 들어옴' },
  { icon: <Icons.RamIcon />, label: '메모리', sub: '작업 중 보관' },
  { icon: <Icons.CpuIcon />, label: '처리', sub: 'CPU가 계산' },
  { icon: <Icons.MonitorIcon />, label: '출력', sub: '화면·스피커' },
];

validatePairSet(RAMEN_PAIR, COMPUTER_PAIR, { layout: 'wide', subPolicy: 'all' });

export default function Q01Ramen({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.input;

  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="입력·처리·출력 사이클"
        title={scene.title}
        summary={scene.summary}
        tone={TONE}
        summaryTone="orange"
        accentMix="var(--demo-card-bg-soft-orange)"
      />

      <PairFlow
        metaphorTitle="라면 만들기"
        itTitle="컴퓨터의 동작"
        metaphor={RAMEN_PAIR}
        it={COMPUTER_PAIR}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="지금 화면의 재료"
        items={scene.items.map((item, idx) => ({
          label: item,
          active: idx === 0,
          color: idx === 0 ? 'var(--demo-chip-hot-orange-fg)' : undefined,
        }))}
        tone={TONE}
        description={scene.focus}
      />

      <LogBox logs={scene.logs} variant="stone" title="실시간 로그" />
    </div>
  );
}
