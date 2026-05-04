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
  http: {
    title: '평문 연결은 내용이 그대로 보일 수 있다',
    summary: 'HTTP만 사용할 때는 중간에서 내용을 읽거나 바꾸기 쉽습니다. 연결은 되지만 보호막이 없는 상태에 가깝습니다.',
    active: 0,
    chips: ['내용 노출 가능', 'port 80 관례', '보호 장치 없음'],
    focus: 0,
    logs: [
      ['20:20:01', 'HTTP 요청 생성'],
      ['20:20:02', '평문 헤더 전송'],
      ['20:20:03', '중간 구간 보호 없음'],
    ],
  },
  tls: {
    title: '암호화는 내용을 읽지 못하게 감싸는 단계다',
    summary: 'TLS는 통신 내용을 암호화해 중간에서 보더라도 이해하기 어렵게 만듭니다. 먼저 서로 안전하게 대화할 방법을 맞춰 보는 절차가 필요합니다.',
    active: 1,
    chips: ['handshake 수행', '세션 키 합의', '내용 암호화'],
    focus: 1,
    logs: [
      ['20:21:01', 'ClientHello 전송'],
      ['20:21:02', '암호 스위트 합의'],
      ['20:21:03', '세션 키 설정'],
    ],
  },
  cert: {
    title: '인증서는 지금 대화 중인 서버가 맞는지 확인하게 한다',
    summary: '암호화만으로는 상대가 진짜인지 충분하지 않습니다. 인증서는 공개키와 신원 정보를 묶어 서버 확인 단계를 보강합니다.',
    active: 2,
    chips: ['X.509 확인', '도메인 일치', '서버 신원 검증'],
    focus: 2,
    logs: [
      ['20:22:01', '서버 인증서 수신'],
      ['20:22:02', '발급 체인 검증'],
      ['20:22:03', '도메인 이름 일치 확인'],
    ],
  },
  full: {
    title: '전체 보호는 연결과 신원 확인이 함께 있을 때 완성된다',
    summary: 'HTTPS는 HTTP 위에 TLS와 인증서 검증을 올려 보호를 완성한 상태입니다. 단순 암호화가 아니라 신뢰 가능한 상대와의 안전한 통신에 가깝습니다.',
    active: 3,
    chips: ['HTTP + TLS', '인증서 검증', '브라우저 자물쇠'],
    focus: 1,
    logs: [
      ['20:23:01', 'HTTPS 연결 시작'],
      ['20:23:02', 'TLS handshake 완료'],
      ['20:23:03', '보호된 응답 수신'],
    ],
  },
};

const TONE = getTone(8);

const METAPHOR = [
  { icon: <Icons.PlainIcon />, label: '평문', sub: '보호 X' },
  { icon: <Icons.CipherIcon />, label: '암호', sub: '내용 보호' },
  { icon: <Icons.VerifyIcon />, label: '인증', sub: '서버 확인' },
  { icon: <Icons.CompleteIcon />, label: '완성', sub: '신뢰 통신' },
];

const IT = [
  { icon: <Icons.HttpIcon />, label: '평문 HTTP', sub: 'port 80' },
  { icon: <Icons.TlsIcon />, label: '암호 TLS', sub: 'handshake' },
  { icon: <Icons.CertIcon />, label: '인증서', sub: 'X.509' },
  { icon: <Icons.FullProtectIcon />, label: '전체 보호', sub: 'HTTPS' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q02Tls({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.http;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="웹 보안 연결" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="보호 감각"
        itTitle="웹 연결 보안"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="현재 보호 포인트"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="HTTPS는 단순히 주소창에 s가 붙는 문제가 아니라, 내용 보호와 상대 확인이 함께 갖춰졌는지를 의미합니다."
      />

      <LogBox logs={scene.logs} variant="blue" title="보호 연결 로그" />
    </div>
  );
}
