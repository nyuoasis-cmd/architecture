import { Hero, Icons, LogBox, PairMatch, StateChips, getTone, validatePairSet } from '../_shared';
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
  select: {
    title: '찾기는 필요한 행만 정확히 골라 오는 요청이다',
    summary: 'SELECT는 표 전체를 보여 달라는 말이 아니라, 어떤 조건의 어떤 열을 가져올지 지정하는 조회 문장입니다.',
    active: 0,
    chips: ['조건 지정', '열 선택', '조회 결과'],
    focus: 0,
    logs: [
      ['18:20:01', 'SELECT name FROM students 시작'],
      ['18:20:02', 'score >= 90 조건 필터'],
      ['18:20:03', '대상 행만 반환'],
    ],
  },
  insert: {
    title: '추가는 새 레코드를 표 안에 등록하는 일이다',
    summary: 'INSERT는 새로운 행을 추가합니다. 필수 칼럼과 제약을 만족해야 데이터베이스가 안전하게 받아들입니다.',
    active: 1,
    chips: ['새 행 생성', '필수 값 확인', '제약 검사'],
    focus: 1,
    logs: [
      ['18:21:01', 'INSERT 주문 요청 수신'],
      ['18:21:02', 'NOT NULL 제약 확인'],
      ['18:21:03', '새 레코드 저장 완료'],
    ],
  },
  update: {
    title: '수정은 이미 있는 값을 조건에 맞게 바꾸는 일이다',
    summary: 'UPDATE는 특정 행을 골라 값을 바꿉니다. WHERE 조건이 빠지면 너무 넓은 범위를 건드릴 수 있어 특히 조심해야 합니다.',
    active: 2,
    chips: ['대상 지정', '값 변경', '영향 범위'],
    focus: 2,
    logs: [
      ['18:22:01', 'UPDATE stock = stock - 1'],
      ['18:22:02', 'WHERE product_id = 42 적용'],
      ['18:22:03', '수정 건수 1 확인'],
    ],
  },
  delete: {
    title: '삭제는 필요 없는 행을 안전하게 지우는 일이다',
    summary: 'DELETE는 조건에 맞는 행을 제거합니다. 실무에서는 잘못 지운 뒤 복구가 어려울 수 있어 트랜잭션과 백업 감각이 함께 필요합니다.',
    active: 3,
    chips: ['행 제거', '조건 필수', '복구 고려'],
    focus: 1,
    logs: [
      ['18:23:01', 'DELETE 요청 사전 검토'],
      ['18:23:02', '취소 주문만 필터 적용'],
      ['18:23:03', '트랜잭션 commit 완료'],
    ],
  },
};

const TONE = getTone(7);

const METAPHOR = [
  { icon: <Icons.FindIcon />, label: '찾기', sub: '읽기' },
  { icon: <Icons.AddIcon />, label: '추가', sub: '신규' },
  { icon: <Icons.EditDbIcon />, label: '수정', sub: '변경' },
  { icon: <Icons.DeleteIcon />, label: '삭제', sub: '제거' },
];

const IT = [
  { icon: <Icons.SelectIcon />, label: 'SELECT', sub: '조회' },
  { icon: <Icons.InsertIcon />, label: 'INSERT', sub: '레코드 추가' },
  { icon: <Icons.UpdateDbIcon />, label: 'UPDATE', sub: '컬럼 변경' },
  { icon: <Icons.DeleteDbIcon />, label: 'DELETE', sub: '레코드 제거' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q02Crud({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.select;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="SQL 기본 명령" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="주문서 작업"
        itTitle="SQL CRUD"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="문장 읽는 포인트"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="SQL은 조회와 변경을 각각 다른 문장으로 다루게 해 줍니다. 그래서 무엇을 읽고 무엇을 바꾸는지 의도를 분명히 적는 습관이 중요합니다."
      />

      <LogBox logs={scene.logs} variant="blue" title="SQL 실행 로그" />
    </div>
  );
}
