import { Hero, Icons, LogBox, PairMatch, StateChips, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  checklist: string[];
  highlight: number;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  rollback: {
    title: '문제 발생 직후 — 즉시 롤백',
    summary: '가장 빠른 대응은 방금 올린 변경을 바로 되돌려 사용자를 안정 상태로 되돌리는 것입니다.',
    active: 0,
    checklist: ['오류 감지', '직전 버전 복귀', '원인 조사 분리'],
    highlight: 1,
    logs: [
      ['16:20:01', '배포 직후 결제 오류 급증'],
      ['16:20:02', '직전 릴리스로 즉시 복귀'],
      ['16:20:03', '사용자 영향 범위 축소 완료'],
    ],
  },
  bluegreen: {
    title: '새 무대 전환 — 블루그린',
    summary: '기존 환경과 새 환경을 나란히 준비해 두고, 확인이 끝나면 트래픽 스위치를 한 번에 옮깁니다.',
    active: 1,
    checklist: ['기존 환경 유지', '새 환경 리허설', '전환 실패 시 즉시 복귀'],
    highlight: 1,
    logs: [
      ['16:21:01', 'green 환경 검증 시작'],
      ['16:21:02', '트래픽 스위치 전환'],
      ['16:21:03', '이상 시 blue 환경으로 복귀 대기'],
    ],
  },
  canary: {
    title: '시범 공개 — 카나리',
    summary: '새 버전을 일부 사용자에게만 먼저 열어 반응을 본 뒤, 이상이 없을 때 점진적으로 확대합니다.',
    active: 2,
    checklist: ['5% 사용자 노출', '지표 비교', '안전 시 점진 확대'],
    highlight: 0,
    logs: [
      ['16:22:01', '트래픽 5% 신규 버전 연결'],
      ['16:22:02', '에러율·지연 비교 관찰'],
      ['16:22:03', '문제 없으면 25%로 확대'],
    ],
  },
  decision: {
    title: '상황별 선택 — 전략 결정',
    summary: '배포 전략은 한 가지가 정답이 아니라, 서비스 위험도와 전환 비용에 따라 맞는 방식을 고르는 문제입니다.',
    active: 3,
    checklist: ['장애 비용 확인', '전환 시간 확인', '자동화 수준 평가'],
    highlight: 2,
    logs: [
      ['16:23:01', '변경 영향도 검토'],
      ['16:23:02', '복귀 속도와 비용 비교'],
      ['16:23:03', '배포 전략 최종 선택'],
    ],
  },
};

const TONE = getTone(3);

const METAPHOR = [
  { icon: <Icons.EmergencyIcon />, label: '비상', sub: '사용' },
  { icon: <Icons.NewStageIcon />, label: '새 무대', sub: '사용' },
  { icon: <Icons.DemoIcon />, label: '시범', sub: '사용' },
  { icon: <Icons.DecisionIcon />, label: '결정', sub: '사용' },
];

const IT = [
  { icon: <Icons.RollbackIcon />, label: '즉시 롤백', sub: '사용' },
  { icon: <Icons.BlueGreenIcon />, label: '블루그린', sub: '사용' },
  { icon: <Icons.CanaryIcon />, label: '카나리', sub: '사용' },
  { icon: <Icons.StrategyIcon />, label: '전략', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q05Rollback({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.rollback;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="배포 실패 대응" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="비상 대응 단계"
        itTitle="롤백 전략"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="지금 확인할 체크포인트"
        items={scene.checklist.map((item, idx) => ({
          label: item,
          active: scene.highlight === idx,
          color: scene.highlight === idx ? 'var(--demo-chip-hot-orange-fg)' : undefined,
        }))}
        tone={TONE}
        description="복귀 속도와 영향 범위를 먼저 줄인 뒤, 원인 분석은 분리해서 진행해야 운영 중 혼선을 줄일 수 있습니다."
      />

      <LogBox logs={scene.logs} variant="blue" title="배포 대응 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
