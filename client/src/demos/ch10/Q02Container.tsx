import { Hero, Icons, LogBox, PairFlow, StateChips, getTone, validatePairSet } from '../_shared';
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
  bundle: {
    title: '앱을 필요한 것과 함께 묶어 두면 환경 차이보다 실행 단위가 먼저 보이기 시작한다',
    summary: '출장 가방에 옷과 세면도구를 함께 챙기듯, 컨테이너 접근은 앱 실행에 필요한 요소를 한 꾸러미로 보는 감각에서 출발합니다.',
    active: 0,
    chips: [
      { label: '함께 묶기', active: true },
      { label: '이동 쉬움' },
      { label: '환경 축소' },
    ],
    note: '컨테이너의 출발점은 앱 하나만이 아니라 실행 맥락 전체를 묶는 것입니다. 이렇게 해야 어디서 돌리든 같은 단위로 다룰 수 있습니다.',
    logs: [
      ['17:10:01', '앱 코드와 의존성 목록 수집'],
      ['17:10:02', '실행 파일과 설정을 하나로 패키징'],
      ['17:10:03', '배포 가능한 단일 단위 생성'],
    ],
  },
  image: {
    title: '이미지는 실행 전 설계도라서 같은 내용을 반복해서 같은 방식으로 꺼내 쓸 수 있다',
    summary: '도시락 레시피 카드를 미리 적어 두듯, 이미지는 앱이 어떤 파일과 명령으로 준비되는지 고정된 정의로 남깁니다.',
    active: 1,
    chips: [
      { label: '설계도', active: true },
      { label: '반복 가능' },
      { label: '버전 관리' },
    ],
    note: '이미지는 실행 중 인스턴스가 아니라 준비된 청사진입니다. 같은 이미지를 여러 환경에 반복 적용할 수 있어 배포 재현성이 높아집니다.',
    logs: [
      ['17:11:01', 'Dockerfile 단계별 빌드 시작'],
      ['17:11:02', '라이브러리와 실행 명령 이미지에 기록'],
      ['17:11:03', '버전 태그와 함께 이미지 저장'],
    ],
  },
  run: {
    title: '컨테이너는 설계도를 실제로 켜 둔 실행 인스턴스에 가깝다',
    summary: '레시피 카드로 만든 도시락 한 개가 실제 식사 단위가 되듯, 컨테이너는 이미지를 바탕으로 실행되는 살아 있는 인스턴스입니다.',
    active: 2,
    chips: [
      { label: '실행 단위', active: true },
      { label: '빠른 기동' },
      { label: '격리 유지' },
    ],
    note: '이미지와 컨테이너를 같은 말로 섞지 않는 것이 중요합니다. 이미지는 정의이고, 컨테이너는 그 정의를 실행한 결과입니다.',
    logs: [
      ['17:12:01', '이미지 기반 컨테이너 인스턴스 기동'],
      ['17:12:02', '환경 변수와 포트 매핑 적용'],
      ['17:12:03', '애플리케이션 프로세스 실행 시작'],
    ],
  },
  share: {
    title: '가벼운 이유는 각 상자가 운영체제 전체를 품지 않고 커널을 함께 쓰기 때문이다',
    summary: '한 건물의 공용 전기와 수도를 함께 쓰되 방은 나눠 쓰듯, 컨테이너는 호스트 커널을 공유하면서 사용자 공간만 분리합니다.',
    active: 3,
    chips: [
      { label: '커널 공유', active: true },
      { label: '격리 구획' },
      { label: '자원 절약' },
    ],
    note: '컨테이너가 VM보다 가벼운 핵심 이유는 커널 공유입니다. 완전한 머신 복제가 아니라 네임스페이스와 제어 그룹으로 구획을 나눕니다.',
    logs: [
      ['17:13:01', '호스트 커널 공유 상태 확인'],
      ['17:13:02', '네임스페이스와 cgroup 격리 적용'],
      ['17:13:03', '자원 사용량 제한값 반영 완료'],
    ],
  },
};

const TONE = getTone(10);

const METAPHOR = [
  { icon: <Icons.BundleMetaIcon />, label: '묶기', sub: '앱 패키징' },
  { icon: <Icons.BookIcon />, label: '설계', sub: '이미지 정의' },
  { icon: <Icons.ExecuteMetaIcon />, label: '실행', sub: '인스턴스' },
  { icon: <Icons.ShareIcon />, label: '공유', sub: '커널' },
];

const IT = [
  { icon: <Icons.PackageIcon />, label: '앱 묶기', sub: 'package' },
  { icon: <Icons.BundleItIcon />, label: '이미지', sub: 'docker image' },
  { icon: <Icons.BoxIcon />, label: '컨테이너', sub: 'runtime' },
  { icon: <Icons.KernelItIcon />, label: '커널 공유', sub: 'cgroup/ns' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q02Container({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.bundle;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="컨테이너와 이미지" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="도시락 준비 비유"
        itTitle="컨테이너 흐름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="이해 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="navy" title="컨테이너 실행 로그" />
    </div>
  );
}
