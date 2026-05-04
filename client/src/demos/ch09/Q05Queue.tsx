import { Hero, Icons, LogBox, PairFlow, StateChips, getTone, validatePairSet } from '../_shared';
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
  request: {
    title: '요청이 몰릴 때는 바로 처리하려 하기보다 받아 둘 줄 알아야 흐름이 버틴다',
    summary: '주문이 한꺼번에 들어오면 접수와 조리를 나누듯, 시스템도 요청을 먼저 받고 뒤에서 처리하면 응답 흐름과 작업 흐름을 분리할 수 있습니다.',
    active: 0,
    chips: [
      { label: '먼저 접수', active: true },
      { label: '흐름 분리' },
      { label: '폭주 대비' },
    ],
    note: '큐의 시작점은 요청을 받아 두는 일입니다. 모든 작업을 즉시 끝내려 하지 않으면 앞단 응답이 훨씬 안정됩니다.',
    logs: [
      ['14:10:01', '주문 요청 120건 유입'],
      ['14:10:02', '앞단은 접수 응답 먼저 반환'],
      ['14:10:03', '후속 작업은 대기열로 이동'],
    ],
  },
  enqueue: {
    title: '적재 단계는 순서를 보존하며 뒤 작업이 따라올 시간을 벌어 준다',
    summary: '접수된 주문표를 대기함에 쌓아 두면 주방이 속도에 맞춰 꺼내듯, 큐 적재는 요청 순서를 유지하며 처리량 차이를 흡수합니다.',
    active: 1,
    chips: [
      { label: '순서 보존', active: true },
      { label: '속도 완충' },
      { label: '분리 운영' },
    ],
    note: '큐 적재는 단순 저장이 아니라 완충 장치입니다. 앞단과 뒷단 속도가 달라도 시스템 전체가 바로 무너지지 않게 만듭니다.',
    logs: [
      ['14:11:01', '대기열 깊이 48건 기록'],
      ['14:11:02', '접수 속도가 처리 속도 초과'],
      ['14:11:03', '순서 유지 상태로 큐 적재 완료'],
    ],
  },
  worker: {
    title: '워커는 쌓인 작업을 하나씩 꺼내며 처리 부담을 뒤에서 나눠 가진다',
    summary: '주방 인력이 주문표를 한 장씩 꺼내 조리하듯, 워커는 큐에서 작업을 가져와 비동기 처리와 병렬 확장을 담당합니다.',
    active: 2,
    chips: [
      { label: '하나씩 처리', active: true },
      { label: '뒤단 분업' },
      { label: '확장 가능' },
    ],
    note: '워커를 두면 처리 책임을 응답 경로에서 떼어 낼 수 있습니다. 부하가 늘면 워커 수를 조정해 뒤단 처리량만 키우는 선택도 가능합니다.',
    logs: [
      ['14:12:01', '워커 1번 작업 가져오기'],
      ['14:12:02', '결제 후 알림 작업 처리'],
      ['14:12:03', '완료 이벤트 기록 후 다음 작업 대기'],
    ],
  },
  burst: {
    title: '버퍼는 폭주 순간을 흡수해 전체 장애로 번지지 않게 막는 안전판이다',
    summary: '잠깐 손님이 몰려도 대기표가 줄을 받아 주듯, 버퍼는 순간 급증을 흡수해 서비스가 바로 멈추지 않도록 시간을 벌어 줍니다.',
    active: 3,
    chips: [
      { label: '순간 흡수', active: true },
      { label: '장애 완화' },
      { label: '복구 시간' },
    ],
    note: '큐는 평상시 성능뿐 아니라 폭주 내성을 높입니다. 다만 버퍼가 무한하지 않으므로 길이와 처리 지연을 함께 관찰해야 합니다.',
    logs: [
      ['14:13:01', '이벤트 급증 5배 감지'],
      ['14:13:02', '버퍼가 초과 요청 임시 흡수'],
      ['14:13:03', '워커 처리율 회복 후 대기열 감소'],
    ],
  },
};

const TONE = getTone(9);

const METAPHOR = [
  { icon: <Icons.HandIcon />, label: '요청', sub: '들어옴' },
  { icon: <Icons.StorageBoxIcon />, label: '적재', sub: '대기열' },
  { icon: <Icons.ExecuteMetaIcon />, label: '처리', sub: '하나씩' },
  { icon: <Icons.NearbyIcon />, label: '버퍼', sub: '폭주 흡수' },
];

const IT = [
  { icon: <Icons.HttpRequestIcon />, label: '요청', sub: '먼저 받기' },
  { icon: <Icons.LayerIcon />, label: '큐 적재', sub: '순서 보존' },
  { icon: <Icons.ProcessIcon />, label: '워커', sub: '뒤단 처리' },
  { icon: <Icons.CacheIcon />, label: '버스트', sub: '급증 완충' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q05Queue({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.request;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="큐와 비동기 처리" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="주문 접수 비유"
        itTitle="큐 처리 흐름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="큐 설계 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="navy" title="큐 처리 로그" />
    </div>
  );
}
