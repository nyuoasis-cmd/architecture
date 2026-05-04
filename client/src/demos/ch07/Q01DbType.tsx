import { Hero, Icons, LogBox, PairVertical, StateChips, getTone, validatePairSet } from '../_shared';
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
  rdbms: {
    title: '칸을 먼저 맞추면 규칙 있는 데이터에 강하다',
    summary: 'RDBMS는 표 구조와 관계를 먼저 정해 두고 데이터를 넣습니다. 주문, 결제처럼 규칙이 엄격한 업무에서 안정적으로 쓰기 좋습니다.',
    active: 0,
    chips: ['스키마 먼저', '관계 제약', '정합성 유지'],
    focus: 0,
    logs: [
      ['18:10:01', 'orders 테이블 스키마 확인'],
      ['18:10:02', '외래 키 제약 검사'],
      ['18:10:03', '유효한 행만 저장'],
    ],
  },
  document: {
    title: '문서처럼 유연하면 모양이 달라도 담기 쉽다',
    summary: 'NoSQL 문서 저장소는 항목마다 필드가 조금 달라도 수용하기 쉽습니다. 속성이 자주 바뀌는 서비스에서 빠르게 확장하기 좋습니다.',
    active: 1,
    chips: ['문서 구조', '필드 가변', '변화 대응'],
    focus: 1,
    logs: [
      ['18:11:01', '상품 문서에 새 속성 추가'],
      ['18:11:02', '기존 문서 구조 변경 없이 저장'],
      ['18:11:03', '앱에서 필요한 필드만 조회'],
    ],
  },
  join: {
    title: '관계를 걸어 두면 떨어진 표도 함께 답할 수 있다',
    summary: 'RDBMS는 고객 표와 주문 표처럼 나뉜 데이터를 JOIN으로 다시 묶어 질문할 수 있습니다. 중복을 줄이면서도 복합 조회를 가능하게 합니다.',
    active: 2,
    chips: ['테이블 분리', '키 연결', '복합 조회'],
    focus: 2,
    logs: [
      ['18:12:01', 'customers 와 orders 키 매칭'],
      ['18:12:02', 'JOIN 실행 계획 생성'],
      ['18:12:03', '한 결과로 묶어 반환'],
    ],
  },
  shard: {
    title: '양이 커지면 여러 대로 나눠 맡기는 선택이 나온다',
    summary: '분산 저장은 데이터를 여러 서버에 나눠 두어 용량과 처리량을 키웁니다. 대신 어디에 무엇이 있는지 관리하는 복잡도도 함께 늘어납니다.',
    active: 3,
    chips: ['수평 분산', '노드 추가', '운영 복잡도'],
    focus: 1,
    logs: [
      ['18:13:01', 'user_id 기준 샤드 선택'],
      ['18:13:02', 'shard-03 노드로 요청 전달'],
      ['18:13:03', '분산 결과 집계'],
    ],
  },
};

const TONE = getTone(7);

const METAPHOR = [
  { icon: <Icons.HouseIcon />, label: '칸', sub: '정해진 자리' },
  { icon: <Icons.DocIcon />, label: '문서', sub: '자유로운 모양' },
  { icon: <Icons.LinkDbIcon />, label: '연결', sub: '관계로 합침' },
  { icon: <Icons.DistributedDbIcon />, label: '분산', sub: '여러 대에 나눔' },
];

const IT = [
  { icon: <Icons.RdbmsIcon />, label: 'RDBMS', sub: '관계형' },
  { icon: <Icons.NoSqlIcon />, label: 'NoSQL', sub: '문서·키값' },
  { icon: <Icons.JoinIcon />, label: 'JOIN', sub: '테이블 결합' },
  { icon: <Icons.ShardIcon />, label: '샤딩', sub: '수평 분산' },
];

validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' });

export default function Q01DbType({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.rdbms;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="데이터베이스 유형 비교" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairVertical
        metaphorTitle="보관 감각"
        itTitle="데이터베이스 선택지"
        pairs={METAPHOR.map((metaphor, index) => ({ metaphor, it: IT[index] }))}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="선택 기준"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="데이터 구조를 엄격히 맞출지, 변화와 분산을 더 우선할지에 따라 RDBMS와 NoSQL의 선택 기준이 갈립니다."
      />

      <LogBox logs={scene.logs} variant="blue" title="데이터베이스 선택 로그" />
    </div>
  );
}
