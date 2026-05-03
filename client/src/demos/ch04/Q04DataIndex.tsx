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
  scan: {
    title: '끝까지 넘겨 보기 — 전체 스캔',
    summary: '찾는 위치를 모르면 처음부터 끝까지 읽어야 합니다. 행 수가 적을 때는 버틸 수 있지만 데이터가 커질수록 속도가 급격히 떨어집니다.',
    active: 0,
    chips: ['모든 페이지 확인', '행 수 증가', '응답 지연'],
    focus: 2,
    logs: [
      ['14:30:01', 'where user_id=42 검색 시작'],
      ['14:30:02', '전체 테이블 순차 스캔'],
      ['14:30:03', '응답 시간 증가 감지'],
    ],
  },
  index: {
    title: '찾는 목록을 미리 만들기 — 색인',
    summary: '자주 찾는 기준을 따로 정리해 두면 본문 전체를 뒤질 필요가 줄어듭니다. 책의 색인처럼 DB도 검색용 구조를 따로 유지합니다.',
    active: 1,
    chips: ['user_id 정렬', '검색 키 저장', '탐색 경로 준비'],
    focus: 0,
    logs: [
      ['14:31:01', 'B-tree 인덱스 생성'],
      ['14:31:02', '검색 키 정렬 완료'],
      ['14:31:03', '탐색 경로 캐시'],
    ],
  },
  seek: {
    title: '바로 해당 위치로 이동 — 위치 점프',
    summary: '색인이 있으면 원하는 범위 근처로 먼저 점프한 뒤 필요한 행만 읽습니다. 그래서 대량 데이터에서도 체감 속도가 크게 좋아집니다.',
    active: 2,
    chips: ['루트 탐색', '리프 이동', '대상 행 읽기'],
    focus: 1,
    logs: [
      ['14:32:01', '인덱스 루트 노드 접근'],
      ['14:32:02', '리프 페이지 도달'],
      ['14:32:03', '대상 레코드 즉시 조회'],
    ],
  },
  cost: {
    title: '정리해 둔 목록을 유지하기 — 쓰기 비용',
    summary: '색인은 공짜가 아닙니다. 데이터가 바뀔 때마다 색인도 같이 정리해야 해서 저장 공간과 쓰기 비용이 늘어납니다.',
    active: 3,
    chips: ['insert 시 갱신', 'update 시 재정렬', 'storage 증가'],
    focus: 0,
    logs: [
      ['14:33:01', '새 주문 insert 감지'],
      ['14:33:02', '보조 인덱스 2개 갱신'],
      ['14:33:03', '쓰기 비용 상승 기록'],
    ],
  },
};

const TONE = getTone(4);

const METAPHOR = [
  { icon: <Icons.BrowseIcon />, label: '훑기', sub: '처음부터 끝' },
  { icon: <Icons.BookmarkIcon />, label: '색인', sub: '미리 정리' },
  { icon: <Icons.JumpIcon />, label: '점프', sub: '바로 위치' },
  { icon: <Icons.CostIcon />, label: '비용', sub: '관리 부담' },
];

const IT = [
  { icon: <Icons.FullScanIcon />, label: '전체 스캔', sub: '느림' },
  { icon: <Icons.IndexIcon />, label: '색인', sub: 'B-tree' },
  { icon: <Icons.SeekIcon />, label: '위치 점프', sub: '빠름' },
  { icon: <Icons.IndexCostIcon />, label: '정리 비용', sub: '쓰기 ↑' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q04DataIndex({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.scan;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="DB 색인 흐름" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="책에서 찾기"
        itTitle="DB 색인 흐름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="현재 핵심 포인트"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
          color: scene.focus === idx ? 'var(--demo-chip-hot-orange-fg)' : undefined,
        }))}
        tone={TONE}
        description="검색 속도만 보면 색인이 항상 좋아 보이지만, 쓰기 빈도와 저장 비용까지 같이 봐야 올바른 선택이 됩니다."
      />

      <LogBox logs={scene.logs} variant="stone" title="조회 경로 로그" />
    </div>
  );
}
