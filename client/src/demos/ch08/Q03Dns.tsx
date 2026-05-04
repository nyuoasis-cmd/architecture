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
  cache: {
    title: '가까운 곳에 있으면 먼저 꺼내 쓰는 편이 빠르다',
    summary: 'DNS 조회도 항상 먼 서버부터 찾지 않습니다. 브라우저나 운영체제의 로컬 캐시에 답이 있으면 가장 먼저 그 값을 사용합니다.',
    active: 0,
    chips: ['브라우저 기록', 'OS 캐시', '가장 빠른 재사용'],
    focus: 0,
    logs: [
      ['20:30:01', '로컬 캐시 조회'],
      ['20:30:02', '만료 시간 검사'],
      ['20:30:03', '캐시 miss 판정'],
    ],
  },
  resolver: {
    title: '모르면 대신 물어봐 주는 안내 데스크가 필요하다',
    summary: '재귀 DNS 서버는 사용자를 대신해 여러 곳에 질문을 이어 갑니다. 클라이언트는 한 곳에만 물어보지만, 안쪽에서는 조회가 연쇄적으로 진행됩니다.',
    active: 1,
    chips: ['resolver 위임', '대신 조회', '중간 결과 저장'],
    focus: 1,
    logs: [
      ['20:31:01', 'resolver 요청 전달'],
      ['20:31:02', '상위 서버 질의 시작'],
      ['20:31:03', '중간 응답 캐시 저장'],
    ],
  },
  root: {
    title: '더 상위의 안내판은 다음에 어디를 물을지 알려 준다',
    summary: '루트와 TLD 같은 상위 서버는 최종 IP를 직접 주기보다, 다음에 물을 권한 있는 서버를 알려 주는 경우가 많습니다. 그래서 조회가 단계적으로 좁혀집니다.',
    active: 2,
    chips: ['루트 힌트', 'TLD/.kr', '권한 서버 안내'],
    focus: 2,
    logs: [
      ['20:32:01', '루트 서버 응답 수신'],
      ['20:32:02', '.kr 권한 서버 확인'],
      ['20:32:03', '최종 zone 질의 준비'],
    ],
  },
  answer: {
    title: '마지막에는 이름이 숫자 주소로 바뀌어 돌아온다',
    summary: '권한 서버에서 최종 레코드를 받으면 도메인은 실제 IP 주소로 해석됩니다. 이제 브라우저는 그 주소로 원하는 서버에 접속할 수 있습니다.',
    active: 3,
    chips: ['A record 수신', '캐시에 저장', '접속 주소 확정'],
    focus: 1,
    logs: [
      ['20:33:01', '권한 서버 응답 도착'],
      ['20:33:02', 'A record 203.0.113.20 저장'],
      ['20:33:03', '브라우저 연결 시작'],
    ],
  },
};

const TONE = getTone(8);

const METAPHOR = [
  { icon: <Icons.CacheMetaIcon />, label: '캐시', sub: '저장' },
  { icon: <Icons.RecursiveIcon />, label: '재귀', sub: '대신 찾음' },
  { icon: <Icons.UpstreamIcon />, label: '상위', sub: '권위 서버' },
  { icon: <Icons.RespondIcon />, label: '응답', sub: '주소 받음' },
];

const IT = [
  { icon: <Icons.LocalCacheIcon />, label: '로컬 캐시', sub: '브라우저' },
  { icon: <Icons.RecursiveServerIcon />, label: '재귀 서버', sub: 'resolver' },
  { icon: <Icons.UpstreamServerIcon />, label: '상위 서버', sub: 'TLD/.kr' },
  { icon: <Icons.FinalRespondIcon />, label: '최종 응답', sub: 'A record' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q03Dns({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.cache;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="DNS 조회 흐름" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="찾는 감각"
        itTitle="DNS 단계"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="조회 포인트"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="DNS는 한 번에 답을 아는 체계라기보다, 가까운 답을 먼저 찾고 모르면 더 적절한 곳으로 넘겨 가는 계층형 조회 체계입니다."
      />

      <LogBox logs={scene.logs} variant="blue" title="DNS 조회 로그" />
    </div>
  );
}
