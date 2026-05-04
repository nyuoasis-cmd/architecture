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
  polling: {
    title: '끝났는지 계속 확인하면 CPU 시간이 샌다',
    summary: '폴링은 장치 상태를 반복해서 묻는 방식이라, 아무 일도 없어도 CPU가 확인 루프를 계속 돌게 됩니다.',
    active: 0,
    chips: ['반복 확인', '대기 중에도 CPU 사용', '응답은 단순하지만 비효율'],
    focus: 0,
    logs: [
      ['16:50:01', '입출력 완료 여부 확인'],
      ['16:50:02', '아직 미완료라 다음 루프 대기'],
      ['16:50:03', '동일 장치 상태 재조회'],
    ],
  },
  bell: {
    title: '사건이 생긴 순간만 신호를 보내면 된다',
    summary: '인터럽트는 장치가 이벤트를 직접 알리므로 CPU가 계속 감시하지 않아도 됩니다. 평소엔 다른 일을 하고, 필요할 때만 주의를 돌립니다.',
    active: 1,
    chips: ['이벤트 기반', '장치가 먼저 알림', 'CPU 낭비 감소'],
    focus: 1,
    logs: [
      ['16:51:01', '디스크 읽기 완료 신호 발생'],
      ['16:51:02', '인터럽트 라인 활성화'],
      ['16:51:03', 'CPU가 현재 작업 중단 준비'],
    ],
  },
  handler: {
    title: '정해진 처리 루틴으로 잠깐 우회한다',
    summary: '인터럽트가 들어오면 CPU는 현재 상태를 저장하고 ISR 같은 처리 루틴으로 이동해 필요한 대응만 빠르게 끝냅니다.',
    active: 2,
    chips: ['컨텍스트 저장', '핸들러 실행', '필요한 일만 처리'],
    focus: 2,
    logs: [
      ['16:52:01', '프로그램 카운터와 레지스터 저장'],
      ['16:52:02', '인터럽트 벡터로 분기'],
      ['16:52:03', '입력 버퍼 읽기 완료'],
    ],
  },
  resume: {
    title: '처리를 끝내면 원래 작업으로 자연스럽게 이어진다',
    summary: '핸들러가 끝나면 저장해 둔 상태를 복원하고 원래 프로그램 위치로 돌아갑니다. 인터럽트는 새 흐름이 아니라 기존 흐름의 잠깐 끼어들기입니다.',
    active: 3,
    chips: ['상태 복원', '원래 위치 복귀', '작업 흐름 이어짐'],
    focus: 1,
    logs: [
      ['16:53:01', 'ISR 종료 명령 실행'],
      ['16:53:02', '저장했던 레지스터 값 복원'],
      ['16:53:03', '중단 지점 다음 명령 재개'],
    ],
  },
};

const TONE = getTone(6);

const METAPHOR = [
  { icon: <Icons.CheckIcon />, label: '확인', sub: '주기적 점검' },
  { icon: <Icons.SignalIcon />, label: '신호', sub: '발생 알림' },
  { icon: <Icons.HandleIcon />, label: '처리', sub: '대응 동작' },
  { icon: <Icons.ReturnIcon />, label: '복귀', sub: '원래 작업' },
];

const IT = [
  { icon: <Icons.PollingIcon />, label: '폴링', sub: 'busy-wait' },
  { icon: <Icons.InterruptIcon />, label: '인터럽트', sub: '비동기 알림' },
  { icon: <Icons.HandlerIcon />, label: '핸들러', sub: 'ISR 실행' },
  { icon: <Icons.ResumeIcon />, label: '복귀', sub: '컨텍스트 복원' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q05Interrupt({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.polling;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="인터럽트" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="호출벨 흐름"
        itTitle="인터럽트 처리 흐름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="핵심 차이"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="인터럽트의 핵심은 CPU가 주변 상태를 계속 감시하지 않고, 사건이 생겼을 때만 짧게 대응한 뒤 원래 작업으로 되돌아오는 데 있습니다."
      />

      <LogBox logs={scene.logs} variant="stone" title="인터럽트 로그" />
    </div>
  );
}
