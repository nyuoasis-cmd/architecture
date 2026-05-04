import { Hero, Icons, LogBox, PairMatch, StateChips, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  chips: string[];
  focus: number;
  note: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  gatekeeper: {
    title: '문지기는 허용할 사람과 막을 사람을 먼저 가른다',
    summary: '건물 입구 문지기가 출입 여부를 판단하듯, 방화벽은 네트워크 경계에서 들어오고 나가는 연결을 규칙으로 검사합니다.',
    active: 0,
    chips: ['경계 검사', '허용 규칙', '차단 우선'],
    focus: 0,
    note: '방화벽의 핵심은 통과 여부 판단입니다. 누가 어떤 포트와 규칙으로 드나들 수 있는지 경계에서 먼저 선별합니다.',
    logs: [
      ['20:52:01', 'inbound 443 허용 규칙 확인'],
      ['20:52:02', '의심 IP 차단 목록 대조'],
      ['20:52:03', '경계 검사 통과 요청만 전달'],
    ],
  },
  tunnel: {
    title: '안전한 통로는 멀리 있는 사람도 안쪽으로 이어 준다',
    summary: '외부 도로에서 바로 건물 내부를 드러내지 않고 보호된 통로를 지나 들어오듯, VPN은 암호화된 터널로 원격 접속을 안전하게 이어 줍니다.',
    active: 1,
    chips: ['암호 터널', '원격 접속', '외부 연결'],
    focus: 1,
    note: 'VPN의 핵심은 보호된 통로입니다. 멀리 있는 사용자나 지사가 공용 인터넷 위에서도 내부망에 안전하게 닿도록 돕습니다.',
    logs: [
      ['20:53:01', '원격 사용자 VPN handshake 시작'],
      ['20:53:02', '암호 터널 세션 수립'],
      ['20:53:03', '내부 자원 접근 경로 연결'],
    ],
  },
  together: {
    title: '문지기와 통로는 함께 써야 보호와 연결을 동시에 챙긴다',
    summary: '출입 통제를 하는 문지기와 보호된 통로가 함께 있어야 외부 연결도 안전하게 열 수 있습니다. 방화벽과 VPN도 서로 다른 역할을 합쳐 보안을 완성합니다.',
    active: 2,
    chips: ['복합 보호', '안전 연결', '외부 협업'],
    focus: 2,
    note: '원격 근무 환경에서는 VPN만으로 충분하지 않고, 방화벽만으로도 연결 편의가 부족합니다. 둘을 함께 써야 보호와 접근이 균형을 이룹니다.',
    logs: [
      ['20:54:01', 'VPN 사용자 세션 식별'],
      ['20:54:02', '방화벽이 허용 대역 재검사'],
      ['20:54:03', '정책 통과 후 내부 서비스 연결'],
    ],
  },
  separate: {
    title: '역할을 분리해서 봐야 어떤 도구가 부족한지 헷갈리지 않는다',
    summary: '문지기는 출입 통제를, 통로는 안전한 이동을 맡듯 두 도구의 질문이 다릅니다. 방화벽과 VPN을 구분해서 이해해야 운영 사고를 줄일 수 있습니다.',
    active: 3,
    chips: ['역할 구분', '정책 분리', '운영 판단'],
    focus: 1,
    note: '방화벽은 연결을 허용할지 묻고, VPN은 연결을 어떻게 안전하게 만들지 묻습니다. 같은 보안 영역에 있어도 해결하는 문제가 다릅니다.',
    logs: [
      ['20:55:01', '원인 분석: 차단 규칙 누락'],
      ['20:55:02', '원인 분석: VPN 터널 미수립'],
      ['20:55:03', '역할 분리 후 장애 지점 식별'],
    ],
  },
};

const TONE = getTone(8);

const METAPHOR = [
  { icon: <Icons.CheckIcon />, label: '문지기', sub: '출입 판단' },
  { icon: <Icons.PathIcon />, label: '통로', sub: '안전 이동' },
  { icon: <Icons.ShareIcon />, label: '함께', sub: '둘 다 필요' },
  { icon: <Icons.SeparateIcon />, label: '분리', sub: '질문이 다름' },
];

const IT = [
  { icon: <Icons.OsLockIcon />, label: '방화벽', sub: '경계 보호' },
  { icon: <Icons.TlsIcon />, label: '통로 VPN', sub: '암호 터널' },
  { icon: <Icons.SharedIcon />, label: '함께 사용', sub: '원격 보호' },
  { icon: <Icons.TeamRuleIcon />, label: '역할 분리', sub: '정책 매핑' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q05Firewall({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.gatekeeper;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="방화벽과 VPN" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="출입 비유"
        itTitle="보안 도구"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="보안 판단 포인트"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description={scene.note}
      />

      <LogBox logs={scene.logs} variant="blue" title="원격 접속 보안 로그" />
    </div>
  );
}
