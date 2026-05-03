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
  register: {
    title: '손안처럼 바로 잡히는 레지스터',
    summary: '레지스터는 CPU 안에 붙어 있어 가장 빠르게 접근할 수 있습니다. 당장 계산할 값을 손에 쥔 상태에 가깝습니다.',
    active: 0,
    chips: ['속도 최상', '용량 최소', '현재 연산값'],
    focus: 0,
    logs: [
      ['16:20:01', 'R1, R2 값 즉시 읽기'],
      ['16:20:02', 'ALU 입력으로 바로 전달'],
      ['16:20:03', '클럭 안에서 결과 반영'],
    ],
  },
  cache: {
    title: '눈앞 책상처럼 가까운 캐시',
    summary: '캐시는 방금 쓰거나 곧 다시 쓸 가능성이 높은 데이터를 CPU 가까이에 붙여 둡니다. 레지스터보다는 크고 RAM보다는 훨씬 빠릅니다.',
    active: 1,
    chips: ['최근 데이터', '반복 접근 대비', 'L1·L2·L3 계층'],
    focus: 1,
    logs: [
      ['16:21:01', 'L1 캐시에 최근 값 적중'],
      ['16:21:02', 'RAM 왕복 없이 재사용'],
      ['16:21:03', '지연 시간 크게 감소'],
    ],
  },
  ram: {
    title: '작업용 책상처럼 넓은 RAM',
    summary: 'RAM은 실행 중인 프로그램과 데이터를 넓게 펼쳐 두는 공간입니다. 캐시보다 느리지만 훨씬 많은 내용을 담습니다.',
    active: 2,
    chips: ['실행 중 데이터', '용량 넓음', '전원 끄면 사라짐'],
    focus: 2,
    logs: [
      ['16:22:01', '프로세스 힙 메모리 할당'],
      ['16:22:02', '파일 일부를 RAM으로 적재'],
      ['16:22:03', '캐시 미스 후 값 전달'],
    ],
  },
  disk: {
    title: '창고처럼 멀지만 오래 남는 디스크',
    summary: '디스크는 속도는 가장 느리지만 프로그램과 파일을 오래 보관합니다. 필요할 때 RAM으로 꺼내 와야 다시 계산에 쓸 수 있습니다.',
    active: 3,
    chips: ['영구 저장', '용량 최대', '접근 속도 최하'],
    focus: 1,
    logs: [
      ['16:23:01', 'SSD에서 실행 파일 읽기'],
      ['16:23:02', '페이지 폴트 후 디스크 접근'],
      ['16:23:03', 'RAM 적재 뒤 실행 재개'],
    ],
  },
};

const TONE = getTone(6);

const METAPHOR = [
  { icon: <Icons.HandIcon />, label: '손 안', sub: '즉시' },
  { icon: <Icons.DeskIcon />, label: '책상', sub: '눈앞' },
  { icon: <Icons.StickyIcon />, label: '캐시', sub: '가까이' },
  { icon: <Icons.WarehouseIcon />, label: '창고', sub: '멀리' },
];

const IT = [
  { icon: <Icons.RegisterIcon />, label: '레지스터', sub: 'CPU 내부' },
  { icon: <Icons.CacheIcon />, label: '캐시', sub: 'L1·L2·L3' },
  { icon: <Icons.RamIcon />, label: '주기억 RAM', sub: '실행 데이터' },
  { icon: <Icons.StorageDiskIcon />, label: '디스크', sub: '영구 저장' },
];

validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' });

export default function Q02MemoryHierarchy({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.register;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="메모리 계층" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairVertical
        metaphorTitle="작업 자리"
        itTitle="메모리 계층"
        pairs={METAPHOR.map((metaphor, index) => ({ metaphor, it: IT[index] }))}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="속도와 용량의 교환"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="가까울수록 빠르지만 작고, 멀수록 크지만 느립니다. 메모리 계층은 이 상반된 요구를 층으로 나눠 해결합니다."
      />

      <LogBox logs={scene.logs} variant="blue" title="메모리 접근 로그" />
    </div>
  );
}
