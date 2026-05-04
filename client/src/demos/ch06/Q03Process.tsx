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
  execute: {
    title: '프로그램을 눌러 실행하는 순간',
    summary: '디스크에 저장돼 있던 프로그램은 실행 명령을 받아야 비로소 메모리로 올라옵니다. 코드 파일이 곧바로 일하는 것은 아닙니다.',
    active: 0,
    chips: ['실행 요청', '프로그램 파일 로드', '초기 자원 준비'],
    focus: 0,
    logs: [
      ['16:30:01', '메신저.exe 실행 요청 수신'],
      ['16:30:02', '실행 파일과 라이브러리 적재'],
      ['16:30:03', '프로세스 제어 블록 생성 준비'],
    ],
  },
  clone: {
    title: '같은 앱도 여러 프로세스로 복제될 수 있다',
    summary: '같은 프로그램을 두 번 실행하면 파일은 같아도 실행 인스턴스는 따로 생깁니다. 각 프로세스는 자기 메모리와 상태를 가집니다.',
    active: 1,
    chips: ['프로세스 ID 분리', '각자 메모리 공간', '독립 상태 유지'],
    focus: 1,
    logs: [
      ['16:31:01', 'pid 4201 생성'],
      ['16:31:02', '동일 앱으로 pid 4208 추가 생성'],
      ['16:31:03', '각 프로세스 스택 분리 완료'],
    ],
  },
  task: {
    title: 'CPU가 시간을 나눠 실제 일을 처리한다',
    summary: '프로세스가 생겼다고 바로 동시에 다 돌지는 않습니다. CPU가 스케줄링 순서에 따라 각 프로세스에 실행 시간을 나눠 줍니다.',
    active: 2,
    chips: ['스케줄링', '연산 수행', '실행 상태 전환'],
    focus: 2,
    logs: [
      ['16:32:01', 'pid 4201 실행 상태 진입'],
      ['16:32:02', 'CPU time slice 8ms 할당'],
      ['16:32:03', '입력 대기 후 다음 프로세스로 전환'],
    ],
  },
  end: {
    title: '종료되면 프로세스 자원도 회수된다',
    summary: '앱을 끄면 프로세스가 쓰던 메모리와 핸들, 스케줄링 정보도 함께 정리됩니다. 프로그램 파일 자체는 디스크에 남고 실행 흔적만 사라집니다.',
    active: 3,
    chips: ['메모리 해제', '핸들 정리', '프로세스 종료 코드 기록'],
    focus: 1,
    logs: [
      ['16:33:01', '종료 이벤트 수신'],
      ['16:33:02', '열린 리소스 핸들 정리'],
      ['16:33:03', 'pid 4201 terminated 상태 기록'],
    ],
  },
};

const TONE = getTone(6);

const METAPHOR = [
  { icon: <Icons.ExecuteMetaIcon />, label: '실행', sub: '시작 명령' },
  { icon: <Icons.CloneIcon />, label: '복제', sub: '인스턴스 생성' },
  { icon: <Icons.TaskIcon />, label: '작업', sub: '실제 수행' },
  { icon: <Icons.EndIcon />, label: '종료', sub: '자원 회수' },
];

const IT = [
  { icon: <Icons.ProgramIcon />, label: '프로그램', sub: '코드 정의' },
  { icon: <Icons.ProcessIcon />, label: '프로세스', sub: '실행 인스턴스' },
  { icon: <Icons.CpuIcon />, label: '처리기 CPU', sub: '연산 수행' },
  { icon: <Icons.TerminateIcon />, label: '종료 처리', sub: 'exit 정리' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q03Process({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.execute;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="프로그램과 프로세스" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="앱 실행 흐름"
        itTitle="프로세스 생성 흐름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="구분 포인트"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="프로그램은 저장된 설계이고, 프로세스는 지금 CPU와 메모리를 받아 실제로 움직이는 실행 단위입니다."
      />

      <LogBox logs={scene.logs} variant="stone" title="프로세스 로그" />
    </div>
  );
}
