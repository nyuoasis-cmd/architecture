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
  cdn: {
    title: '멀리 있는 사용자에게는 엣지 캐시가 가장 먼저 체감 속도를 바꾼다',
    summary: '도시 입구 창고에 인기 물건을 미리 두듯, 엣지 CDN은 사용자 가까운 위치에서 정적 응답을 먼저 돌려줍니다.',
    active: 0,
    chips: [
      { label: '가까운 응답', active: true },
      { label: '정적 자산' },
      { label: '원본 감소' },
    ],
    note: '엣지 캐시는 거리 비용을 먼저 줄입니다. 이미지나 정적 파일처럼 자주 바뀌지 않는 응답일수록 효과가 크고, 원본 서버 부하도 함께 낮아집니다.',
    logs: [
      ['12:31:01', '서울 엣지에서 정적 자산 hit'],
      ['12:31:02', '원본 서버 요청 없이 바로 응답'],
      ['12:31:03', '대륙 간 왕복 지연 감소'],
    ],
  },
  app: {
    title: '앱 안 메모리 캐시는 같은 프로세스 안에서 재계산을 줄인다',
    summary: '계산기를 손에 쥔 채 최근 답을 바로 다시 보는 것처럼, 앱 메모리 캐시는 자주 쓰는 결과를 프로세스 안에 잠시 보관합니다.',
    active: 1,
    chips: [
      { label: '프로세스 안', active: true },
      { label: '빠른 재사용' },
      { label: '재시작에 약함' },
    ],
    note: '앱 메모리 캐시는 매우 빠르지만 인스턴스 바깥으로 공유되기 어렵습니다. 여러 서버가 동시에 돌면 각자 다른 캐시를 가질 수 있다는 점도 함께 봐야 합니다.',
    logs: [
      ['12:32:01', '최근 계산 결과 메모리 hit'],
      ['12:32:02', '데이터베이스 조회 생략'],
      ['12:32:03', '프로세스 재시작 시 캐시 초기화'],
    ],
  },
  db: {
    title: '원본 저장소 앞에 캐시를 두면 비싼 조회를 먼저 걸러 낼 수 있다',
    summary: '창고 앞 진열대에 자주 찾는 물건을 두듯, 데이터 앞 캐시는 원본 저장소에 가기 전 반복 조회를 먼저 흡수합니다.',
    active: 2,
    chips: [
      { label: '원본 앞단', active: true },
      { label: '반복 조회 흡수' },
      { label: '조회 부하 절감' },
    ],
    note: '데이터 앞 캐시는 조회 부담이 큰 환경에서 특히 유리합니다. 다만 원본과 캐시의 값 차이가 생기지 않도록 갱신 정책을 함께 설계해야 합니다.',
    logs: [
      ['12:33:01', '상품 상세 요청 캐시 먼저 조회'],
      ['12:33:02', 'miss 시 원본 조회 후 캐시 적재'],
      ['12:33:03', '반복 요청이 캐시에서 흡수됨'],
    ],
  },
  invalidate: {
    title: '캐시는 저장보다 지우는 규칙이 더 중요할 때가 많다',
    summary: '진열대 물건을 바꿨으면 오래된 안내표도 함께 치워야 하듯, 무효화는 캐시가 낡은 값을 오래 들고 있지 않게 만드는 규칙입니다.',
    active: 3,
    chips: [
      { label: '만료 규칙', active: true },
      { label: '변경 연동' },
      { label: '일관성 관리' },
    ],
    note: '캐시 전략은 어디에 둘지보다 언제 비울지가 더 어렵습니다. TTL, 키 삭제, 이벤트 연동 같은 무효화 규칙이 없으면 빠르지만 틀린 데이터를 돌려주기 쉽습니다.',
    logs: [
      ['12:34:01', '상품 가격 변경 이벤트 수신'],
      ['12:34:02', '연관 키 무효화 실행'],
      ['12:34:03', '다음 조회부터 새 값 재적재'],
    ],
  },
};

const TONE = getTone(9);

const METAPHOR = [
  { icon: <Icons.EdgeKrIcon />, label: '엣지', sub: '가까운 위치' },
  { icon: <Icons.RecentIcon />, label: '메모리', sub: '앱 안 보관' },
  { icon: <Icons.LayerIcon />, label: '앞단', sub: '원본 앞 진열' },
  { icon: <Icons.DeleteIcon />, label: '무효화', sub: '낡은 값 제거' },
];

const IT = [
  { icon: <Icons.DistEffectIcon />, label: '엣지 CDN', sub: 'edge cache' },
  { icon: <Icons.CacheIcon />, label: '앱 메모리', sub: 'in-memory' },
  { icon: <Icons.CacheMetaIcon />, label: '데이터 앞', sub: 'cache-aside' },
  { icon: <Icons.UpdateIcon />, label: '무효화', sub: 'TTL key' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q04Cache({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.cdn;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="캐시 위치와 무효화" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="창고 비유"
        itTitle="캐시 계층"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="캐시 설계 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="blue" title="캐시 운영 로그" />
    </div>
  );
}
