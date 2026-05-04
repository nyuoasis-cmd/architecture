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
  desired: {
    title: '쿠버네티스의 출발점은 지금 모습이 아니라 유지하고 싶은 목표 상태를 적는 일이다',
    summary: '행사장 좌석 배치를 먼저 적어 두고 계속 그 상태를 맞추듯, 쿠버네티스는 원하는 상태를 선언하고 실제 상태를 거기에 맞춥니다.',
    active: 0,
    chips: [
      { label: '목표 선언', active: true },
      { label: '현재 비교' },
      { label: '자동 유지' },
    ],
    note: '쿠버네티스는 명령을 매번 직접 내리기보다 목표를 선언하게 합니다. 운영자는 무엇을 하고 싶은지 쓰고, 시스템은 그 상태를 계속 맞추려 합니다.',
    logs: [
      ['18:10:01', 'replicas=3 목표 상태 선언'],
      ['18:10:02', '실제 파드 수와 선언 값 비교'],
      ['18:10:03', '차이 감지 후 조정 루프 시작'],
    ],
  },
  heal: {
    title: '실행 중 하나가 깨져도 다시 맞추는 자가 복구가 기본 동작으로 들어 있다',
    summary: '자리 하나가 비면 안내 요원이 새 좌석을 채우듯, 쿠버네티스는 파드가 사라지면 다시 만들어 목표 상태를 회복합니다.',
    active: 1,
    chips: [
      { label: '자동 회복', active: true },
      { label: '차이 감지' },
      { label: '상태 복원' },
    ],
    note: '자가 복구는 장애가 아예 없는 것이 아니라 장애가 나도 원하는 상태로 되돌리는 능력입니다. 운영자가 손으로 일일이 복구하지 않아도 되는 지점이 핵심입니다.',
    logs: [
      ['18:11:01', '파드 1개 비정상 종료 감지'],
      ['18:11:02', '컨트롤러가 부족한 수량 계산'],
      ['18:11:03', '새 파드 재생성 후 상태 정상화'],
    ],
  },
  scale: {
    title: '부하가 바뀌면 수를 자동으로 늘리고 줄여 목표 성능을 맞출 수 있다',
    summary: '손님이 몰리는 시간에 창구를 더 열듯, 쿠버네티스는 지표를 보고 파드 수를 자동 확장해 처리량을 조절합니다.',
    active: 2,
    chips: [
      { label: '자동 증감', active: true },
      { label: '지표 기반' },
      { label: '부하 대응' },
    ],
    note: '자동 확장은 무조건 많이 띄우는 기능이 아니라 목표 지표를 유지하는 장치입니다. CPU나 요청량 같은 기준을 먼저 정해야 의미 있게 동작합니다.',
    logs: [
      ['18:12:01', 'CPU 사용률 임계치 초과 감지'],
      ['18:12:02', 'HPA가 파드 수 증설 결정'],
      ['18:12:03', '부하 완화 후 수량 재조정 대기'],
    ],
  },
  rollout: {
    title: '배포도 한 번에 갈아엎기보다 조금씩 바꿔 가며 위험을 낮추는 편이 안전하다',
    summary: '공연 조명을 한꺼번에 끄지 않고 줄씩 바꾸듯, 쿠버네티스는 점진 배포로 새 버전을 조금씩 섞으며 교체합니다.',
    active: 3,
    chips: [
      { label: '단계 배포', active: true },
      { label: '위험 축소' },
      { label: '되돌림 용이' },
    ],
    note: '점진 배포는 새 버전 리스크를 분산합니다. 일부부터 교체하면서 상태를 확인하면 전체 장애로 번지기 전에 멈추거나 되돌릴 수 있습니다.',
    logs: [
      ['18:13:01', '새 이미지 버전으로 롤링 시작'],
      ['18:13:02', '기존 파드 일부만 교체 후 상태 점검'],
      ['18:13:03', '오류 없으면 다음 묶음 순차 배포'],
    ],
  },
};

const TONE = getTone(10);

const METAPHOR = [
  { icon: <Icons.GoalIcon />, label: '원하는', sub: '목표 상태' },
  { icon: <Icons.RecoverIcon />, label: '복구', sub: '자동 회복' },
  { icon: <Icons.AutoIcon />, label: '확장', sub: '부하 따라' },
  { icon: <Icons.DeployMetaIcon />, label: '점진', sub: '단계 배포' },
];

const IT = [
  { icon: <Icons.GoalIcon />, label: '원하는 상태', sub: 'declarative' },
  { icon: <Icons.UpdateIcon />, label: '자가 복구', sub: 'reconcile' },
  { icon: <Icons.ParallelIcon />, label: '자동 확장', sub: 'HPA' },
  { icon: <Icons.DeployItIcon />, label: '점진 배포', sub: 'rolling' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q03K8s({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.desired;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="쿠버네티스 운영 원리" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="행사 운영 비유"
        itTitle="쿠버네티스 핵심"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="운영 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="blue" title="쿠버네티스 제어 로그" />
    </div>
  );
}
