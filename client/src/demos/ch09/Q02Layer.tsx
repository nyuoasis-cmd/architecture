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
  ui: {
    title: '화면 계층은 입력을 받고 보여 주는 접점에 집중한다',
    summary: '매장 화면이 손님 주문을 받아 보여 주듯, UI 계층은 사용자 입력과 출력에 집중하고 내부 규칙은 아래 계층에 넘깁니다.',
    active: 0,
    chips: [
      { label: '입력 수집', active: true },
      { label: '표시 책임' },
      { label: '규칙 분리' },
    ],
    note: 'UI 계층은 예쁘게 보여 주는 일만이 아니라 사용자와 시스템의 첫 접점입니다. 다만 비즈니스 규칙까지 품으면 수정 범위가 빠르게 커집니다.',
    logs: [
      ['10:11:01', '사용자 클릭 이벤트 수신'],
      ['10:11:02', '입력값 검증 후 서비스 요청 준비'],
      ['10:11:03', '응답 결과를 화면 상태로 반영'],
    ],
  },
  service: {
    title: '서비스 계층은 화면 뒤에서 규칙을 모아 판단을 내린다',
    summary: '매장 운영 규칙이 주문 가능 여부와 할인 적용을 결정하듯, 서비스 계층은 비즈니스 로직을 모아 흐름을 통제합니다.',
    active: 1,
    chips: [
      { label: '규칙 판단', active: true },
      { label: '흐름 제어' },
      { label: '층 분리' },
    ],
    note: '서비스 계층은 화면도 데이터 저장도 아닌 중간 판단층입니다. 변경이 잦은 정책을 여기에 모아 두면 다른 층의 흔들림을 줄일 수 있습니다.',
    logs: [
      ['10:12:01', '주문 가능 시간 정책 조회'],
      ['10:12:02', '할인 조건과 재고 상태 함께 판단'],
      ['10:12:03', '저장 요청을 데이터 계층에 위임'],
    ],
  },
  data: {
    title: '데이터 계층은 저장과 조회를 안정적으로 맡아 준다',
    summary: '창고 담당이 재고를 꺼내고 다시 넣는 일을 맡듯, 데이터 계층은 영속 저장소와의 읽기·쓰기를 담당합니다.',
    active: 2,
    chips: [
      { label: '저장 책임', active: true },
      { label: '조회 최적화' },
      { label: '영속성 담당' },
    ],
    note: '데이터 계층은 비즈니스 결정을 내리기보다 데이터를 안정적으로 보관하고 가져오는 데 집중해야 합니다. 그래야 저장소가 바뀌어도 상위 계층 수정이 줄어듭니다.',
    logs: [
      ['10:13:01', '주문 엔터티 저장 쿼리 실행'],
      ['10:13:02', '상품 조회 결과 매핑 완료'],
      ['10:13:03', '트랜잭션 종료 후 결과 반환'],
    ],
  },
  flow: {
    title: '요청은 위에서 아래로 흐르고 결과는 다시 올라온다',
    summary: '손님 주문이 화면에서 규칙을 거쳐 창고로 내려갔다가 결과가 다시 올라오듯, 계층형 구조는 책임 순서를 따라 요청 흐름을 정리합니다.',
    active: 3,
    chips: [
      { label: '위에서 아래', active: true },
      { label: '책임 순서' },
      { label: '변경 범위 축소' },
    ],
    note: '계층을 나누는 목적은 예쁜 다이어그램이 아니라 변경 통제입니다. 요청이 어느 층을 지나야 하는지 분명할수록 장애와 수정 지점을 빠르게 찾을 수 있습니다.',
    logs: [
      ['10:14:01', 'UI 계층에서 요청 객체 생성'],
      ['10:14:02', '서비스 계층이 정책 검증 수행'],
      ['10:14:03', '데이터 계층 응답이 화면까지 복귀'],
    ],
  },
};

const TONE = getTone(9);

const METAPHOR = [
  { icon: <Icons.MonitorIcon />, label: '화면', sub: '입력과 표시' },
  { icon: <Icons.RuleIcon />, label: '규칙', sub: '판단과 통제' },
  { icon: <Icons.WarehouseIcon />, label: '데이터', sub: '저장과 조회' },
  { icon: <Icons.FlowIcon />, label: '흐름', sub: '순서 있는 전달' },
];

const IT = [
  { icon: <Icons.FrontendIcon />, label: 'UI 계층', sub: 'presentation' },
  { icon: <Icons.MiddlewareIcon />, label: '서비스', sub: 'business' },
  { icon: <Icons.StoreIcon />, label: '데이터', sub: 'persistence' },
  { icon: <Icons.HttpRequestIcon />, label: '요청 흐름', sub: 'top-down' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q02Layer({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.ui;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="계층형 아키텍처" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="매장 비유"
        itTitle="계층 구조"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="계층 설계 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="blue" title="계층 요청 로그" />
    </div>
  );
}
