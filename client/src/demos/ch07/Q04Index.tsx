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
  scan: {
    title: '찾는 규칙이 없으면 처음부터 끝까지 훑게 된다',
    summary: '전체 스캔은 원하는 행을 찾기 위해 표를 순서대로 읽는 방식입니다. 데이터가 적을 때는 단순하지만 커질수록 비용이 급격히 커집니다.',
    active: 0,
    chips: ['순차 읽기', '행 수 증가', '응답 지연'],
    focus: 2,
    logs: [
      ['18:40:01', 'WHERE user_id = 42 검색 시작'],
      ['18:40:02', '전체 테이블 순차 스캔'],
      ['18:40:03', '비교 횟수 증가 감지'],
    ],
  },
  btree: {
    title: '가지 구조를 두면 범위를 점점 좁혀 갈 수 있다',
    summary: 'B-tree 인덱스는 정렬된 가지를 따라 내려가며 후보 범위를 줄입니다. 그래서 필요한 위치 근처까지 적은 비교로 도달할 수 있습니다.',
    active: 1,
    chips: ['루트부터 분기', '정렬 키 유지', '탐색 범위 축소'],
    focus: 0,
    logs: [
      ['18:41:01', 'B-tree 루트 노드 확인'],
      ['18:41:02', '중간 가지로 범위 축소'],
      ['18:41:03', '리프 페이지 도달'],
    ],
  },
  range: {
    title: '정렬된 길잡이가 있으면 구간 조회도 빨라진다',
    summary: '인덱스는 한 건 찾기뿐 아니라 범위 검색에도 강합니다. 시작 위치를 빠르게 잡은 뒤 필요한 구간만 이어서 읽을 수 있습니다.',
    active: 2,
    chips: ['시작점 탐색', '구간 순회', 'BETWEEN 최적화'],
    focus: 1,
    logs: [
      ['18:42:01', 'BETWEEN 100 AND 200 조건 수신'],
      ['18:42:02', '시작 키 위치 탐색 완료'],
      ['18:42:03', '구간 레코드만 순회'],
    ],
  },
  cost: {
    title: '읽기가 빨라진 대신 쓸 때는 정리 비용이 붙는다',
    summary: '인덱스는 INSERT나 UPDATE 때도 함께 갱신되어야 합니다. 그래서 인덱스를 많이 둘수록 쓰기 비용과 저장 공간이 늘어납니다.',
    active: 3,
    chips: ['인덱스 갱신', '쓰기 지연', '공간 사용'],
    focus: 0,
    logs: [
      ['18:43:01', '새 주문 INSERT 감지'],
      ['18:43:02', '보조 인덱스 2개 재정렬'],
      ['18:43:03', '쓰기 비용 상승 기록'],
    ],
  },
};

const TONE = getTone(7);

const METAPHOR = [
  { icon: <Icons.BrowseDbIcon />, label: '훑기', sub: '처음부터 끝' },
  { icon: <Icons.BranchIcon />, label: '가지', sub: '계층 탐색' },
  { icon: <Icons.RangeIcon />, label: '범위', sub: '구간 조회' },
  { icon: <Icons.WriteCostIcon />, label: '비용', sub: '갱신 부담' },
];

const IT = [
  { icon: <Icons.FullScanIcon />, label: '전체 스캔', sub: '느림' },
  { icon: <Icons.BTreeIcon />, label: 'B-tree', sub: '계층 색인' },
  { icon: <Icons.RangeIcon />, label: '범위', sub: 'BETWEEN' },
  { icon: <Icons.WriteCostIcon />, label: '쓰기 비용', sub: '인덱스 갱신' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q04Index({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.scan;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="DB 인덱스 흐름" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="찾는 감각"
        itTitle="인덱스 구조"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="성능 판단 포인트"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="인덱스는 읽기 성능을 크게 올려 주지만, 모든 경우에 공짜는 아닙니다. 자주 찾는 조건과 쓰기 빈도를 함께 보고 결정해야 합니다."
      />

      <LogBox logs={scene.logs} variant="blue" title="인덱스 조회 로그" />
    </div>
  );
}
