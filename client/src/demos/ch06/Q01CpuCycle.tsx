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
  fetch: {
    title: '명령을 먼저 읽어 오는 순간',
    summary: 'CPU는 다음에 무엇을 할지 먼저 가져와야 합니다. 프로그램 카운터가 가리키는 위치에서 명령을 읽는 단계가 시작점입니다.',
    active: 0,
    chips: ['프로그램 카운터 이동', '명령어 메모리 접근', '다음 순서 준비'],
    focus: 0,
    logs: [
      ['16:10:01', 'PC가 다음 주소 0x1040 지정'],
      ['16:10:02', '명령어 캐시에서 바이트 읽기'],
      ['16:10:03', '제어 장치 입력 버퍼 적재'],
    ],
  },
  decode: {
    title: '읽은 명령의 뜻을 해석하는 순간',
    summary: '가져온 비트열은 아직 행동이 아닙니다. 제어 장치가 이 값을 해석해 어떤 연산과 자원이 필요한지 결정합니다.',
    active: 1,
    chips: ['연산 종류 판별', '피연산자 위치 확인', '제어 신호 준비'],
    focus: 1,
    logs: [
      ['16:11:01', 'opcode 0x2A 해석 시작'],
      ['16:11:02', '레지스터 R1, R2 읽기 예약'],
      ['16:11:03', 'ALU add 제어 신호 생성'],
    ],
  },
  execute: {
    title: '실제 계산이 일어나는 순간',
    summary: '해석이 끝나면 ALU와 실행 유닛이 실제 연산을 수행합니다. 덧셈이든 비교든 CPU가 일하는 핵심 구간입니다.',
    active: 2,
    chips: ['ALU 입력 전달', '연산 결과 생성', '상태 플래그 갱신'],
    focus: 0,
    logs: [
      ['16:12:01', 'R1=12, R2=30 연산 시작'],
      ['16:12:02', 'ALU 결과 42 생성'],
      ['16:12:03', 'zero/sign 플래그 재계산'],
    ],
  },
  store: {
    title: '결과를 다시 남겨 두는 순간',
    summary: '연산이 끝나면 결과를 레지스터나 메모리에 다시 적어 둬야 다음 작업이 이어집니다. 저장 단계까지 끝나야 한 바퀴가 닫힙니다.',
    active: 3,
    chips: ['결과 레지스터 기록', '메모리 반영 가능', '다음 명령으로 이동'],
    focus: 2,
    logs: [
      ['16:13:01', '결과값을 R3에 기록'],
      ['16:13:02', '필요 시 메모리 쓰기 예약'],
      ['16:13:03', '다음 명령 fetch 재시작'],
    ],
  },
};

const TONE = getTone(6);

const METAPHOR = [
  { icon: <Icons.ReadIcon />, label: '읽기', sub: '명령 가져오기' },
  { icon: <Icons.InterpretIcon />, label: '해석', sub: '의미 파악' },
  { icon: <Icons.CalcIcon />, label: '계산', sub: '연산 수행' },
  { icon: <Icons.SaveIcon />, label: '저장', sub: '결과 보관' },
];

const IT = [
  { icon: <Icons.FetchIcon />, label: '읽기 인출', sub: 'Fetch' },
  { icon: <Icons.DecodeIcon />, label: '해석 디코드', sub: 'Decode' },
  { icon: <Icons.ExecuteItIcon />, label: '계산 실행', sub: 'Execute' },
  { icon: <Icons.StoreIcon />, label: '저장 반영', sub: 'Store' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q01CpuCycle({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.fetch;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="CPU 사이클" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="작업대 흐름"
        itTitle="CPU 명령 사이클"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="지금 일어나는 일"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="한 명령도 읽기에서 끝나지 않습니다. 해석과 실행, 저장까지 이어져야 다음 명령이 자연스럽게 연결됩니다."
      />

      <LogBox logs={scene.logs} variant="stone" title="CPU 내부 로그" />
    </div>
  );
}
