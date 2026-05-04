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
  problem: {
    title: '패턴은 이름부터 외우기보다 어떤 문제가 반복되는지 먼저 봐야 쓸모가 생긴다',
    summary: '비슷한 문제가 자꾸 다시 생길 때 해결 틀을 떠올리듯, 디자인 패턴은 반복되는 설계 문제를 다루는 사고 도구입니다.',
    active: 0,
    chips: [
      { label: '문제 먼저', active: true },
      { label: '반복 맥락' },
      { label: '이름은 나중' },
    ],
    note: '패턴의 출발점은 문법이 아니라 맥락입니다. 무엇이 자주 꼬이는지 알아야 싱글톤이나 옵저버 같은 이름이 실제 설계 판단으로 이어집니다.',
    logs: [
      ['11:21:01', '중복 설계 문제 유형 수집'],
      ['11:21:02', '재발 조건과 제약 정리'],
      ['11:21:03', '맞는 패턴 후보 탐색 시작'],
    ],
  },
  singleton: {
    title: '하나만 있어야 하는 자원은 싱글톤으로 제어 지점을 좁힌다',
    summary: '건물의 중앙 전광판처럼 하나의 인스턴스만 유지해야 할 때, 싱글톤은 생성 경로를 한곳으로 제한합니다.',
    active: 1,
    chips: [
      { label: '하나만 유지', active: true },
      { label: '공유 접근' },
      { label: '남용 주의' },
    ],
    note: '싱글톤은 전역처럼 편하지만 범용 해법은 아닙니다. 정말 하나만 유지해야 하는 설정 관리자나 공통 자원에만 제한적으로 써야 효과가 있습니다.',
    logs: [
      ['11:22:01', '설정 관리자 인스턴스 존재 확인'],
      ['11:22:02', '기존 객체 재사용 경로 선택'],
      ['11:22:03', '중복 생성 요청 차단'],
    ],
  },
  observer: {
    title: '상태 변화가 여러 곳에 알려져야 하면 옵저버가 반응 경로를 정리한다',
    summary: '전광판 바뀜을 여러 안내판이 함께 구독하듯, 옵저버는 한 객체의 변화가 여러 구독자에게 퍼지게 합니다.',
    active: 2,
    chips: [
      { label: '변화 전파', active: true },
      { label: '구독 구조' },
      { label: '느슨한 연결' },
    ],
    note: '옵저버의 장점은 연결을 느슨하게 유지하는 데 있습니다. 발행자는 누가 반응하는지 몰라도 되고, 구독자는 필요한 변화만 받아 처리할 수 있습니다.',
    logs: [
      ['11:23:01', '이벤트 발행 source 상태 변경'],
      ['11:23:02', '구독자 3곳에 알림 전달'],
      ['11:23:03', '각 구독자가 독립 후속 처리'],
    ],
  },
  factory: {
    title: '생성 방식이 자주 바뀌면 팩토리가 조립 책임을 밖으로 꺼낸다',
    summary: '주문 종류에 따라 다른 조리 키트를 꺼내 주듯, 팩토리는 객체 생성 로직을 별도 경로로 분리해 선택을 단순화합니다.',
    active: 3,
    chips: [
      { label: '생성 분리', active: true },
      { label: '조립 캡슐화' },
      { label: '확장 용이' },
    ],
    note: '팩토리는 객체를 쓰는 코드가 구체 생성 세부를 몰라도 되게 만듭니다. 조건별 생성 로직이 늘어날수록 이 분리가 특히 유리합니다.',
    logs: [
      ['11:24:01', '요청 타입 기준 생성 경로 선택'],
      ['11:24:02', '구성 요소 조립 후 객체 반환'],
      ['11:24:03', '호출부는 공통 인터페이스만 사용'],
    ],
  },
};

const TONE = getTone(9);

const METAPHOR = [
  { icon: <Icons.QuestionIcon />, label: '문제', sub: '반복 상황' },
  { icon: <Icons.TableSingleIcon />, label: '단일', sub: '하나만 유지' },
  { icon: <Icons.SignalIcon />, label: '관찰', sub: '변화 구독' },
  { icon: <Icons.BuildIcon />, label: '생성', sub: '조립 경로' },
];

const IT = [
  { icon: <Icons.ContextIcon />, label: '문제 정의', sub: 'context' },
  { icon: <Icons.SharedIcon />, label: '싱글톤', sub: 'Singleton' },
  { icon: <Icons.NotificationIcon />, label: '옵저버', sub: 'Observer' },
  { icon: <Icons.ComponentIcon />, label: '팩토리', sub: 'Factory' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q03Pattern({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.problem;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="디자인 패턴" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="설계 감각"
        itTitle="패턴 이름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="패턴 선택 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="navy" title="설계 패턴 로그" />
    </div>
  );
}
