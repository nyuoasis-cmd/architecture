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
  module: {
    title: '블록 나누기 — 모듈',
    summary: '큰 구조를 작은 블록으로 나누면 각 부분의 역할이 또렷해지듯, 모듈은 기능을 쪼개 관리하기 쉽게 만듭니다.',
    active: 0,
    items: ['로그인 블록', '결제 블록', '알림 블록'],
    focus: '모듈은 기능을 나눈 기본 단위입니다. 하나의 큰 코드를 역할별로 쪼개면 이해와 수정이 쉬워집니다.',
    logs: [
      ['11:40:01', '기능 단위 분해 시작'],
      ['11:40:02', '역할별 블록 생성'],
      ['11:40:03', '모듈 경계 정의 완료'],
    ],
  },
  package: {
    title: '박스에 묶기 — 패키지',
    summary: '관련 블록을 한 박스에 담아 정리하면 관리가 쉬워지듯, 패키지는 여러 모듈을 묶어 제공합니다.',
    active: 1,
    items: ['auth 박스', 'ui 박스', 'payment 박스'],
    focus: '패키지는 서로 관련된 모듈을 이름 있는 묶음으로 관리하는 단위입니다.',
    logs: [
      ['11:40:04', '관련 모듈 수집'],
      ['11:40:05', '패키지 메타데이터 작성'],
      ['11:40:06', '배포 단위 정리'],
    ],
  },
  dependency: {
    title: '서로 연결 — 의존성',
    summary: '한 박스가 다른 박스를 필요로 하면 연결 관계를 적어 둬야 하듯, 의존성은 필요한 패키지 사이의 연결 정보입니다.',
    active: 2,
    items: ['ui -> core', 'payment -> auth', 'app -> shared'],
    focus: '의존성은 “이 기능이 동작하려면 무엇이 먼저 필요하다”는 관계를 뜻합니다.',
    logs: [
      ['11:40:07', '필수 패키지 탐색'],
      ['11:40:08', '버전 제약 기록'],
      ['11:40:09', '연결 그래프 갱신'],
    ],
  },
  install: {
    title: '설치해서 사용 — 설치',
    summary: '필요한 박스를 실제 작업대에 가져다 놓아야 쓰듯, 설치는 의존 패키지를 프로젝트 안으로 가져오는 과정입니다.',
    active: 3,
    items: ['패키지 내려받기', '폴더 배치', '실행 준비 완료'],
    focus: '설치는 선언된 의존성을 실제 환경에 받아 두고 연결까지 마쳐 바로 사용할 수 있게 만드는 단계입니다.',
    logs: [
      ['11:40:10', '패키지 다운로드'],
      ['11:40:11', '의존성 설치 완료'],
      ['11:40:12', '프로젝트 연결 반영'],
    ],
  },
};

const TONE = getTone(2);

const METAPHOR = [
  { icon: <Icons.BlockIcon />, label: '블록', sub: '사용' },
  { icon: <Icons.BoxIcon />, label: '박스', sub: '사용' },
  { icon: <Icons.LinkIcon />, label: '연결', sub: '사용' },
  { icon: <Icons.InstallIcon />, label: '설치', sub: '사용' },
];

const IT = [
  { icon: <Icons.ModuleIcon />, label: '모듈', sub: '사용' },
  { icon: <Icons.PackageIcon />, label: '패키지', sub: '사용' },
  { icon: <Icons.DependencyIcon />, label: '의존성', sub: '사용' },
  { icon: <Icons.ItInstallIcon />, label: '설치', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q03Module({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.module;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="모듈과 패키지" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="조립 비유"
        itTitle="소프트웨어 구성"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="지금 단계의 결과"
        items={scene.items.map((item, idx) => ({
          label: item,
          active: idx === 0,
          color: idx === 0 ? 'var(--demo-chip-hot-orange-fg)' : undefined,
        }))}
        tone={TONE}
        description={scene.focus}
      />

      <LogBox logs={scene.logs} variant="stone" title="구성 로그" />
    </div>
  );
}
