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
  power: {
    title: '전원을 넣으면 먼저 하드웨어가 기본 점검을 시작한다',
    summary: '부팅의 첫 단계는 단순히 화면이 켜지는 일이 아니라, 시스템이 최소한의 하드웨어 상태를 확인할 준비를 하는 과정입니다.',
    active: 0,
    chips: ['전원 공급', 'POST 시작', '기본 점검'],
    focus: 0,
    logs: [
      ['17:40:01', '전원 버튼 입력 감지'],
      ['17:40:02', '메인보드 전원 안정화'],
      ['17:40:03', 'POST 자가진단 시작'],
    ],
  },
  firmware: {
    title: '펌웨어는 어떤 장치로 부팅할지 결정할 준비를 한다',
    summary: 'BIOS나 UEFI 같은 펌웨어는 CPU와 메모리, 저장장치를 초기화하고 부팅 가능한 대상을 찾습니다.',
    active: 1,
    chips: ['장치 초기화', '부팅 순서 확인', '펌웨어 제어'],
    focus: 1,
    logs: [
      ['17:41:01', '메모리와 저장장치 초기화'],
      ['17:41:02', '부팅 순서 목록 조회'],
      ['17:41:03', '선택된 저장장치에서 다음 단계 탐색'],
    ],
  },
  bootloader: {
    title: '부트로더가 운영체제를 메모리에 올릴 준비를 맡는다',
    summary: '부트로더는 어떤 커널을 실행할지 고르고, 필요한 초기 정보와 함께 메모리에 적재한 뒤 제어를 넘깁니다.',
    active: 2,
    chips: ['커널 선택', '메모리 적재', '제어권 전달'],
    focus: 2,
    logs: [
      ['17:42:01', '부트 메뉴 또는 기본 항목 선택'],
      ['17:42:02', '커널 이미지와 초기 데이터 적재'],
      ['17:42:03', '커널 진입점으로 점프'],
    ],
  },
  kernel: {
    title: '커널이 올라오면 비로소 운영체제가 실제 준비를 시작한다',
    summary: '커널은 드라이버를 올리고 파일 시스템을 연결하며 사용자 공간 프로세스를 시작할 기반을 만듭니다.',
    active: 3,
    chips: ['드라이버 로딩', '파일 시스템 연결', '프로세스 준비'],
    focus: 1,
    logs: [
      ['17:43:01', '커널 메모리 초기화'],
      ['17:43:02', '핵심 드라이버와 루트 파일 시스템 준비'],
      ['17:43:03', 'init/systemd 시작'],
    ],
  },
  login: {
    title: '마지막에야 로그인 셸이나 화면이 사용자 앞에 나타난다',
    summary: '사용자가 보는 로그인 화면은 부팅의 출발점이 아니라, 긴 초기화 단계가 끝난 뒤에야 도착하는 마지막 진입 지점입니다.',
    active: 4,
    chips: ['사용자 공간 진입', '인증 시작', '작업 가능 상태'],
    focus: 2,
    logs: [
      ['17:44:01', '로그인 서비스 실행'],
      ['17:44:02', 'getty 또는 디스플레이 매니저 준비'],
      ['17:44:03', '사용자 입력 대기 시작'],
    ],
  },
};

const TONE = getTone(6);

const METAPHOR = [
  { icon: <Icons.PowerIcon />, label: '전원', sub: '공급' },
  { icon: <Icons.FirmwareIcon />, label: '펌웨어', sub: '내장 소프트' },
  { icon: <Icons.BootIcon />, label: '부트', sub: 'OS 적재' },
  { icon: <Icons.KernelIcon />, label: '커널', sub: 'OS 핵심' },
  { icon: <Icons.LoginIcon />, label: '로그인', sub: '사용자 진입' },
];

const IT = [
  { icon: <Icons.PostIcon />, label: 'POST 진단', sub: '하드 점검' },
  { icon: <Icons.BiosIcon />, label: 'BIOS 펌웨어', sub: '부팅 프로그램' },
  { icon: <Icons.BootloaderIcon />, label: '부트로더', sub: 'GRUB/LILO' },
  { icon: <Icons.KernelItIcon />, label: '커널 적재', sub: 'kernel load' },
  { icon: <Icons.LoginItIcon />, label: '로그인 셸', sub: 'getty/PAM' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q10BootSequence({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.power;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="부팅 순서" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="시작 이어달리기"
        itTitle="부팅 단계"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="부팅에서 이어지는 책임"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="부팅은 전원, 펌웨어, 부트로더, 커널, 로그인 단계가 순서대로 제어권을 넘겨야만 안정적으로 완성됩니다."
      />

      <LogBox logs={scene.logs} variant="stone" title="부팅 단계 로그" />
    </div>
  );
}
