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
  request: {
    title: '무엇을 부탁하는지 먼저 적기',
    summary: 'REST 호출은 먼저 무엇을 원하는지 요청으로 시작합니다. 요청 안에는 대상과 방식, 필요한 정보가 함께 담겨야 합니다.',
    active: 0,
    chips: ['필요한 작업 설명', '요청 본문 또는 쿼리', '클라이언트 출발'],
    focus: 0,
    logs: [
      ['15:15:01', '클라이언트가 요청 생성'],
      ['15:15:02', '헤더와 payload 조립'],
      ['15:15:03', 'HTTP 전송 시작'],
    ],
  },
  resource: {
    title: '대상이 누구인지 자원으로 가리키기',
    summary: 'REST는 처리 대상을 자원으로 봅니다. 사용자, 주문, 게시글처럼 다루는 대상을 URI로 또렷하게 가리키는 것이 핵심입니다.',
    active: 1,
    chips: ['URI 로 대상 표현', '/orders/42', '명확한 대상 식별'],
    focus: 1,
    logs: [
      ['15:16:01', '/orders/42 경로 해석'],
      ['15:16:02', 'order 자원 매핑'],
      ['15:16:03', '대상 레코드 조회 준비'],
    ],
  },
  method: {
    title: '행동은 메서드로 구분하기',
    summary: '같은 자원이라도 무엇을 할지는 메서드가 알려 줍니다. 가져오기, 만들기, 수정하기, 삭제하기를 HTTP 메서드로 나눠 읽기 쉬운 규칙을 만듭니다.',
    active: 2,
    chips: ['GET 조회', 'POST 생성', 'PATCH/DELETE 변경'],
    focus: 2,
    logs: [
      ['15:17:01', 'HTTP method = GET 확인'],
      ['15:17:02', '읽기 핸들러 선택'],
      ['15:17:03', '응답 본문 직렬화'],
    ],
  },
  stateless: {
    title: '한 번의 요청만으로 처리하기',
    summary: 'REST는 가능한 한 각 요청이 독립적으로 이해되길 기대합니다. 서버가 이전 대화를 길게 기억하지 않아도 현재 요청만으로 처리할 수 있어야 확장과 교체가 쉬워집니다.',
    active: 3,
    chips: ['이전 상태 최소화', '요청마다 정보 충분', '서버 확장 단순화'],
    focus: 0,
    logs: [
      ['15:18:01', '인증 토큰으로 사용자 확인'],
      ['15:18:02', '세션 의존 없이 요청 처리'],
      ['15:18:03', '다른 서버 인스턴스도 동일 응답'],
    ],
  },
};

const TONE = getTone(5);

const METAPHOR = [
  { icon: <Icons.RequestMetaIcon />, label: '요청', sub: '무엇을' },
  { icon: <Icons.ResourceIcon />, label: '자원', sub: '대상' },
  { icon: <Icons.MethodIcon />, label: '메서드', sub: '동사' },
  { icon: <Icons.StatelessIcon />, label: '단발', sub: '독립 호출' },
];

const IT = [
  { icon: <Icons.HttpRequestIcon />, label: '요청', sub: 'HTTP request' },
  { icon: <Icons.RestResourceIcon />, label: '자원', sub: 'URI' },
  { icon: <Icons.HttpMethodIcon />, label: '메서드', sub: 'GET/POST/...' },
  { icon: <Icons.StatelessItIcon />, label: '무상태', sub: '세션 X' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q03Rest({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.request;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="API와 REST" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="주문 양식"
        itTitle="REST 호출"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="현재 호출 포인트"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="REST는 주소만 예쁘게 짓는 규칙이 아니라, 요청과 대상, 행동, 독립성을 함께 정리해 프론트엔드와 백엔드의 대화를 단순하게 만드는 방식입니다."
      />

      <LogBox logs={scene.logs} variant="stone" title="REST 처리 로그" />
    </div>
  );
}
