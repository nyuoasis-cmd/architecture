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
  request: {
    title: '앱의 요구는 먼저 운영체제의 공통 요청으로 들어온다',
    summary: '프로그램은 장치마다 다른 전기 신호를 직접 다루지 않고, 운영체제에 읽기나 출력 같은 공통 요청을 보냅니다.',
    active: 0,
    chips: ['system call 시작', '공통 인터페이스', '장치 세부사항 숨김'],
    focus: 0,
    logs: [
      ['17:30:01', '앱이 프린터 출력 요청'],
      ['17:30:02', '운영체제 I/O 요청 큐 등록'],
      ['17:30:03', '해당 장치 드라이버 탐색'],
    ],
  },
  translate: {
    title: '드라이버는 공통 요청을 장치별 언어로 바꾼다',
    summary: '같은 출력 요청도 프린터와 그래픽 카드, 디스크는 받는 방식이 다릅니다. 드라이버가 그 차이를 흡수합니다.',
    active: 1,
    chips: ['장치별 제어 방식', '명령 변환', '세부 프로토콜 처리'],
    focus: 1,
    logs: [
      ['17:31:01', '출력 요청을 장치 명령으로 변환'],
      ['17:31:02', '버퍼 주소와 제어 값 설정'],
      ['17:31:03', '하드웨어 인터럽트 준비'],
    ],
  },
  device: {
    title: '번역된 명령을 받은 장치가 실제 동작을 수행한다',
    summary: '드라이버가 준비한 명령은 디스크 회전, 화면 출력, 네트워크 송신 같은 실제 하드웨어 동작으로 이어집니다.',
    active: 2,
    chips: ['실제 I/O 발생', '하드웨어 동작', '장치 고유 처리'],
    focus: 2,
    logs: [
      ['17:32:01', '장치 제어 레지스터 갱신'],
      ['17:32:02', '하드웨어 동작 시작'],
      ['17:32:03', '완료 또는 오류 신호 대기'],
    ],
  },
  feedback: {
    title: '끝난 결과는 다시 운영체제를 거쳐 사용자에게 돌아온다',
    summary: '장치가 끝났다고 알려 주면 운영체제는 성공이나 오류 결과를 정리해 원래 프로그램과 사용자에게 전달합니다.',
    active: 3,
    chips: ['완료 통지', '오류 정리', '사용자 결과 반환'],
    focus: 1,
    logs: [
      ['17:33:01', '장치 완료 인터럽트 수신'],
      ['17:33:02', '운영체제가 결과 상태 정리'],
      ['17:33:03', '앱에 성공 응답 전달'],
    ],
  },
};

const TONE = getTone(6);

const METAPHOR = [
  { icon: <Icons.RequestQ09Icon />, label: '요청', sub: '필요 발생' },
  { icon: <Icons.TranslateIcon />, label: '번역', sub: '장치 언어' },
  { icon: <Icons.RunActionIcon />, label: '실행', sub: '하드웨어 동작' },
  { icon: <Icons.RespondIcon />, label: '응답', sub: '결과 전달' },
];

const IT = [
  { icon: <Icons.OsRequestIcon />, label: '운영체제 요청', sub: 'system call' },
  { icon: <Icons.DriverItIcon />, label: '드라이버', sub: 'device driver' },
  { icon: <Icons.DeviceIcon />, label: '장치', sub: 'I/O' },
  { icon: <Icons.ResultIcon />, label: '결과', sub: '사용자에게' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q09Driver({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.request;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="드라이버" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="통역 부스 흐름"
        itTitle="장치 제어 흐름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="드라이버가 필요한 이유"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="드라이버는 운영체제가 공통 인터페이스를 유지한 채 다양한 하드웨어를 제어할 수 있게 만드는 번역 계층입니다."
      />

      <LogBox logs={scene.logs} variant="stone" title="드라이버 처리 로그" />
    </div>
  );
}
