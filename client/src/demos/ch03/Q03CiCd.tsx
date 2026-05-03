import { Hero, Icons, LogBox, PairFlow, StateChips, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  items: string[];
  focus: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  commit: {
    title: '커밋 감지 — 파이프라인 시작',
    summary: '변경이 올라오는 순간 자동 흐름이 시작되면, 누락 없이 같은 검증 규칙을 반복할 수 있습니다.',
    active: 0,
    items: ['push 감지', 'PR 이벤트', '자동 시작', '수작업 제거'],
    focus: '사람이 매번 버튼을 누르지 않아도 커밋 이벤트가 흐름을 깨우면, 검증 시작점이 표준화됩니다.',
    logs: [
      ['12:20:01', 'push event received'],
      ['12:20:02', 'workflow queued'],
      ['12:20:03', 'runner allocated'],
    ],
  },
  build: {
    title: '빌드 확인 — 산출물 점검',
    summary: '코드가 실제 실행 가능한 산출물로 묶이는지 먼저 확인해야 다음 단계의 검증도 의미가 있습니다.',
    active: 1,
    items: ['의존성 설치', '타입 검사', '번들 생성', '환경 확인'],
    focus: '빌드는 소스가 실제 결과물로 이어질 수 있는지 확인하는 관문입니다. 여기서 막히면 테스트 이전에 배포 가능성이 사라집니다.',
    logs: [
      ['12:20:04', 'npm ci complete'],
      ['12:20:05', 'vite build started'],
      ['12:20:06', 'artifact ready'],
    ],
  },
  test: {
    title: '테스트 게이트 — 자동 검증',
    summary: '테스트 단계는 변경이 기대한 동작을 지키는지 확인하며, 실패하면 다음 단계로 넘기지 않습니다.',
    active: 2,
    items: ['unit', 'integration', 'lint', 'gating'],
    focus: '자동 검증은 사람이 놓치기 쉬운 회귀를 막는 안전장치입니다. 실패한 변경을 바로 멈추게 해야 전체 흐름의 신뢰가 생깁니다.',
    logs: [
      ['12:20:07', '42 tests running'],
      ['12:20:08', '1 failure in payment flow'],
      ['12:20:09', 'pipeline marked failed'],
    ],
  },
  report: {
    title: '결과 보고 — 상태 공유',
    summary: '누가 보더라도 같은 상태를 이해할 수 있게 결과와 로그를 남기는 단계입니다.',
    active: 3,
    items: ['status badge', 'review gate', 'artifact link', 'failure trace'],
    focus: '리포트는 단순 알림이 아니라 팀의 공통 기준점입니다. 성공과 실패가 기록되어야 리뷰와 배포 판단이 같은 근거 위에 올라갑니다.',
    logs: [
      ['12:20:10', 'checks summary published'],
      ['12:20:11', 'review blocked until fix'],
      ['12:20:12', 'logs attached to PR'],
    ],
  },
};

const TONE = getTone(3);

const METAPHOR = [
  { icon: <Icons.CommitIcon />, label: '커밋', sub: '사용' },
  { icon: <Icons.BuildIcon />, label: '빌드', sub: '사용' },
  { icon: <Icons.TestIcon />, label: '테스트', sub: '사용' },
  { icon: <Icons.ReportIcon />, label: '보고', sub: '사용' },
];

const IT = [
  { icon: <Icons.CommitDetectIcon />, label: '커밋 감지', sub: '사용' },
  { icon: <Icons.ItBuildIcon />, label: '빌드', sub: '사용' },
  { icon: <Icons.ItTestIcon />, label: '테스트', sub: '사용' },
  { icon: <Icons.ReportLogIcon />, label: '리포트', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q03CiCd({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.commit;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="CI 파이프라인" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="제출 → 검수 흐름"
        itTitle="CI 파이프라인"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="지금 단계의 체크포인트" items={scene.items} tone={TONE} description={scene.focus} />

      <LogBox logs={scene.logs} variant="blue" title="파이프라인 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
