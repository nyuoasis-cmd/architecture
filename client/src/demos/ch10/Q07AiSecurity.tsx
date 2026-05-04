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
  iam: {
    title: '누가 무엇을 할 수 있는지 먼저 나눠야 AI 시스템의 문이 함부로 열리지 않는다',
    summary: '출입 권한표를 먼저 확인해야 민감한 구역을 나눌 수 있듯, IAM은 사용자와 서비스의 접근 범위를 역할별로 제한합니다.',
    active: 0,
    chips: [
      { label: '역할 분리', active: true },
      { label: '최소 권한' },
      { label: '접근 제어' },
    ],
    note: '보안은 암호화만으로 끝나지 않습니다. 누가 어떤 리소스를 읽고 실행할 수 있는지부터 명확히 나눠야 사고 범위를 줄일 수 있습니다.',
    logs: [
      ['15:40:01', 'service role 권한 범위 확인'],
      ['15:40:02', '불필요한 admin 권한 차단'],
      ['15:40:03', '접근 정책 적용 완료'],
    ],
  },
  encrypt: {
    title: '데이터는 저장될 때와 이동할 때 모두 암호화되어야 내용 노출 위험을 줄일 수 있다',
    summary: '봉인된 상자처럼 내용을 감싸 두면 중간에서 보더라도 바로 읽을 수 없듯, 암호화는 데이터 자체를 보호합니다.',
    active: 1,
    chips: [
      { label: '저장 보호', active: true },
      { label: '전송 보호' },
      { label: '키 관리' },
    ],
    note: '암호화는 신원을 확인하는 층이 아니라 내용 보호 층입니다. 특히 키를 어디서 관리하느냐가 실제 안전성에 큰 영향을 줍니다.',
    logs: [
      ['15:41:01', '저장 데이터 KMS 키 연결'],
      ['15:41:02', '전송 구간 TLS 암호화 확인'],
      ['15:41:03', '복호화 권한 검증 완료'],
    ],
  },
  segment: {
    title: '민감한 자원은 같은 네트워크에 아무나 닿지 못하도록 격리 구역을 나눠야 한다',
    summary: '서버와 데이터베이스를 같은 복도에 다 열어 두지 않듯, VPC와 subnet 격리는 침입 범위를 줄이고 가로 이동을 어렵게 만듭니다.',
    active: 2,
    chips: [
      { label: '구역 분리', active: true },
      { label: '직접 차단' },
      { label: '확산 억제' },
    ],
    note: '네트워크 격리는 한 지점이 뚫려도 전체가 연쇄적으로 보이지 않게 만드는 장치입니다. 내부 통신 경로도 최소화해야 효과가 큽니다.',
    logs: [
      ['15:42:01', 'db subnet 외부 접근 차단'],
      ['15:42:02', '앱 서버만 내부 포트 허용'],
      ['15:42:03', '가로 이동 경로 점검 완료'],
    ],
  },
  monitor: {
    title: '이상 징후는 나중에 추측하지 말고 로그와 감시 체계로 바로 잡아내야 한다',
    summary: '문이 언제 열렸는지 기록이 남아야 사고를 추적할 수 있듯, CloudWatch나 SIEM 같은 감시 체계는 이상 행동을 빠르게 드러냅니다.',
    active: 3,
    chips: [
      { label: '로그 수집', active: true },
      { label: '이상 감지' },
      { label: '추적 가능' },
    ],
    note: '보안은 예방만이 아니라 관측도 중요합니다. 기록이 남아야 원인 분석과 대응 자동화가 가능하고, 반복 사고도 줄일 수 있습니다.',
    logs: [
      ['15:43:01', '권한 실패 이벤트 수집'],
      ['15:43:02', '이상 접근 패턴 알림 발송'],
      ['15:43:03', '보안 로그 대시보드 갱신'],
    ],
  },
};

const TONE = getTone(10);

const METAPHOR = [
  { icon: <Icons.PermitIcon />, label: '권한', sub: '누가 무엇을' },
  { icon: <Icons.EncryptMetaIcon />, label: '암호', sub: '내용 보호' },
  { icon: <Icons.NetIsolateIcon />, label: '격리', sub: '네트워크 분리' },
  { icon: <Icons.WatchIcon />, label: '감시', sub: '로그 분석' },
];

const IT = [
  { icon: <Icons.IamIcon />, label: '권한 IAM', sub: 'identity access' },
  { icon: <Icons.EncryptIcon />, label: '암호화', sub: 'KMS' },
  { icon: <Icons.NetIsolateItIcon />, label: '네트워크 격리', sub: 'VPC/subnet' },
  { icon: <Icons.LogWatchIcon />, label: '로그 감시', sub: 'CloudWatch/SIEM' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q07AiSecurity({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.iam;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="AI·클라우드 보안" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="보호 구역 비유"
        itTitle="보안 운영 원칙"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="운영 체크포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="blue" title="보안 운영 로그" />
    </div>
  );
}
