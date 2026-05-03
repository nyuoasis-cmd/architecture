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
  cell: {
    title: '칸이 고정된 표 — 정형 데이터',
    summary: '모든 값이 정해진 칸에 들어가면 검색과 집계가 빨라집니다. 그래서 거래 내역처럼 규칙이 분명한 데이터는 표 형태가 잘 맞습니다.',
    active: 0,
    chips: ['고객 ID', '주문일', '결제 금액', '상태 코드'],
    focus: 1,
    logs: [
      ['11:04:01', 'orders 테이블 스키마 확인'],
      ['11:04:02', '행 단위 입력 규칙 검증'],
      ['11:04:03', '정형 조회 계획 수립'],
    ],
  },
  frame: {
    title: '틀은 있지만 자유가 남는 문서 — 반정형 데이터',
    summary: '공통 틀은 유지하되 세부 항목 수가 조금씩 달라지는 데이터는 반정형이 자연스럽습니다. API 응답이나 설정 파일이 여기에 가깝습니다.',
    active: 1,
    chips: ['id', 'profile', 'tags[]', 'extra'],
    focus: 2,
    logs: [
      ['11:05:01', 'JSON payload 필드 스캔'],
      ['11:05:02', '선택 필드 존재 여부 확인'],
      ['11:05:03', '유연 스키마 처리 완료'],
    ],
  },
  free: {
    title: '형태가 제각각인 자료 — 비정형 데이터',
    summary: '이미지, 음성, 긴 문서는 처음부터 같은 칸으로 맞추기 어렵습니다. 내용 자체를 해석해야 가치가 드러나기 때문에 형태보다 원본 보관이 우선입니다.',
    active: 2,
    chips: ['회의 녹음', '계약서 PDF', '현장 사진', '영상 클립'],
    focus: 0,
    logs: [
      ['11:06:01', '원본 파일 메타데이터 저장'],
      ['11:06:02', '본문 추출 작업 대기'],
      ['11:06:03', '검색용 보조 인덱스 분리'],
    ],
  },
  choice: {
    title: '용도에 맞춰 고르는 구조 — 상황별 결정',
    summary: '데이터는 한 가지 모양이 정답이 아닙니다. 조회 방식, 변경 빈도, 보관 대상에 따라 정형·반정형·비정형을 섞어 쓰는 판단이 필요합니다.',
    active: 3,
    chips: ['조회 중심', '유연 입력', '원본 보관', '혼합 설계'],
    focus: 3,
    logs: [
      ['11:07:01', '서비스 요구사항 비교 시작'],
      ['11:07:02', '형태별 저장 전략 후보 정리'],
      ['11:07:03', '도메인별 데이터 모양 확정'],
    ],
  },
};

const TONE = getTone(4);

const METAPHOR = [
  { icon: <Icons.CellIcon />, label: '칸', sub: '정해진 자리' },
  { icon: <Icons.FrameIcon />, label: '틀', sub: '느슨한 구조' },
  { icon: <Icons.FreestyleIcon />, label: '자유', sub: '형태 없음' },
  { icon: <Icons.PickIcon />, label: '선택', sub: '상황별 결정' },
];

const IT = [
  { icon: <Icons.StructuredIcon />, label: '정형', sub: 'RDB · 표' },
  { icon: <Icons.SemiStructuredIcon />, label: '반정형', sub: 'JSON · XML' },
  { icon: <Icons.UnstructuredIcon />, label: '비정형', sub: '문서 · 영상' },
  { icon: <Icons.DataChoiceIcon />, label: '상황별', sub: '용도 기반' },
];

validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' });

export default function Q01DataShape({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.cell;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="데이터 모양" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairVertical
        metaphorTitle="데이터 모양"
        itTitle="데이터 형태"
        pairs={METAPHOR.map((metaphor, index) => ({ metaphor, it: IT[index] }))}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="지금 보이는 예시"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
          color: scene.focus === idx ? 'var(--demo-chip-hot-orange-fg)' : undefined,
        }))}
        tone={TONE}
        description="저장 구조를 먼저 고르면 이후 조회 방식과 검증 규칙도 같이 정리됩니다."
      />

      <LogBox logs={scene.logs} variant="stone" title="데이터 분류 로그" />
    </div>
  );
}
