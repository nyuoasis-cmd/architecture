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
  red: {
    title: '빨강 먼저 보기 — Red',
    summary: '원하는 동작을 테스트로 먼저 적어 실패를 확인하면 목표가 더 선명해집니다.',
    active: 0,
    items: ['실패 허용', '요구사항 명확화', '출발점', '빈칸 확인'],
    focus: 'Red 단계는 아직 구현이 없다는 사실을 일부러 드러내는 시간입니다. 무엇을 만들지 먼저 합의하고 출발할 수 있습니다.',
    logs: [
      ['11:10:01', 'expect(totalPrice(2, 5000)).toBe(10000)'],
      ['11:10:02', 'ReferenceError: totalPrice is not defined'],
      ['11:10:03', '목표 동작 확정'],
    ],
  },
  green: {
    title: '초록 만들기 — Green',
    summary: '테스트를 통과할 만큼만 최소 구현을 넣어 과한 설계를 막고 리듬을 유지합니다.',
    active: 1,
    items: ['최소 구현', '빠른 통과', '작은 성공', '과잉 설계 방지'],
    focus: 'Green 단계에서는 완벽함보다 통과가 우선입니다. 지금 약속한 행동을 맞추는 데 집중해야 다음 정리가 쉬워집니다.',
    logs: [
      ['11:10:04', 'function totalPrice(q, p) { return q * p; }'],
      ['11:10:05', '1 passed, 0 failed'],
      ['11:10:06', '다음 개선 후보 기록'],
    ],
  },
  refactor: {
    title: '정리하기 — Refactor',
    summary: '동작은 유지한 채 이름과 구조를 다듬어 다음 변경이 쉬운 코드 상태를 만듭니다.',
    active: 2,
    items: ['중복 제거', '이름 개선', '구조 정리', '안전망 유지'],
    focus: '테스트가 안전망이 되어 주기 때문에 내부 구조를 더 자신 있게 정리할 수 있습니다. 겉보기 동작은 그대로 두고 내부만 다듬습니다.',
    logs: [
      ['11:10:07', 'discount 계산 함수 분리'],
      ['11:10:08', '변수명 orderTotal로 변경'],
      ['11:10:09', 'tests still green'],
    ],
  },
  loop: {
    title: '다시 반복 — Loop',
    summary: '작은 기능 하나가 끝나면 곧바로 다음 요구를 향해 같은 리듬을 반복합니다.',
    active: 3,
    items: ['작게 반복', '설계 리듬', '확장 용이', '예측 가능'],
    focus: 'TDD는 한 번의 이벤트가 아니라 반복되는 박자입니다. 실패를 보고, 통과시키고, 정리한 뒤 다시 작은 실패로 돌아가는 흐름이 핵심입니다.',
    logs: [
      ['11:10:10', '쿠폰 기능 테스트 추가'],
      ['11:10:11', '다시 실패 확인'],
      ['11:10:12', '새 사이클 시작'],
    ],
  },
};

const TONE = getTone(3);

const METAPHOR = [
  { icon: <Icons.RedDotIcon />, label: '빨강', sub: '사용' },
  { icon: <Icons.GreenDotIcon />, label: '초록', sub: '사용' },
  { icon: <Icons.TidyIcon />, label: '정리', sub: '사용' },
  { icon: <Icons.RepeatIcon />, label: '반복', sub: '사용' },
];

const IT = [
  { icon: <Icons.RedTestIcon />, label: 'Red', sub: '사용' },
  { icon: <Icons.GreenTestIcon />, label: 'Green', sub: '사용' },
  { icon: <Icons.RefactorIcon />, label: 'Refactor', sub: '사용' },
  { icon: <Icons.LoopIcon />, label: 'Loop', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q02TddCycle({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.red;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="TDD 사이클" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="신호등 점검 사이클"
        itTitle="TDD 사이클"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="지금 단계의 포인트" items={scene.items} tone={TONE} description={scene.focus} />

      <LogBox logs={scene.logs} variant="blue" title="실행 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
