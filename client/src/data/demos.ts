export type DemoScenario = {
  id: string;
  label: string;
};

export type DemoMeta = {
  qaId: string;
  title: string;
  url: string;
  description: string;
  scenarios: DemoScenario[];
};

export const DEMOS: DemoMeta[] = [
  {
    qaId: 'ch06_q03',
    title: '카톡 프로세스 시뮬레이터',
    url: '/demos/ch06/q03.html',
    description: '디스크의 프로그램이 메모리의 프로세스가 되고 CPU가 처리하는 흐름을 보여줍니다.',
    scenarios: [
      { id: 'launch', label: '카톡 실행 — 프로세스 만들어지기' },
      { id: 'multi', label: '같은 앱 두 번 — 프로세스 2개' },
      { id: 'cpu', label: 'CPU가 일하는 모습' },
      { id: 'kill', label: '앱 종료 — 프로세스 사라지기' },
    ],
  },
];

export function getDemoByQaId(qaId: string) {
  return DEMOS.find((demo) => demo.qaId === qaId);
}
