import { Hero, Icons, LogBox, PairVertical, StateChips, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  chips: string[];
  hot: number;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  storage: {
    title: '책장에서 찾기 — 저장소',
    summary: '오래 보관된 파일은 SSD 같은 저장소에 있습니다. 필요할 때 먼저 여기서 꺼냅니다.',
    active: 0,
    chips: ['report.docx', 'photo.png', 'music.mp3'],
    hot: -1,
    logs: [
      ['15:42:01', '저장소에서 report.docx 검색'],
      ['15:42:02', '파일 블록 읽기 시작'],
      ['15:42:03', 'RAM으로 전송 준비'],
    ],
  },
  ram: {
    title: '책상에 펼치기 — RAM',
    summary: '지금 작업할 자료를 책상 위에 펴 두듯, 저장소의 일부 데이터를 RAM으로 올립니다.',
    active: 1,
    chips: ['문서 본문', '현재 편집 위치', '열린 창 상태'],
    hot: 0,
    logs: [
      ['15:42:04', 'RAM 32MB 할당'],
      ['15:42:05', '작업 데이터 적재'],
      ['15:42:06', 'CPU 읽기 대기'],
    ],
  },
  cache: {
    title: '포스트잇 붙이기 — 캐시',
    summary: '방금 쓴 정보는 CPU 가까이에 더 작은 메모로 붙여 둬서 다음 접근을 빠르게 만듭니다.',
    active: 2,
    chips: ['방금 읽은 제목', '자주 쓰는 숫자', '최근 계산 결과'],
    hot: 1,
    logs: [
      ['15:42:07', '최근 접근 데이터 캐시에 적중'],
      ['15:42:08', 'RAM 재탐색 생략'],
      ['15:42:09', '응답 지연 감소'],
    ],
  },
  cpu: {
    title: '펜으로 계산 — CPU',
    summary: 'CPU는 RAM과 캐시에서 값을 읽어 실제 계산과 판단을 수행합니다.',
    active: 3,
    chips: ['수식 계산', '문장 정렬', '화면 갱신 요청'],
    hot: 2,
    logs: [
      ['15:42:10', '명령 해석 시작'],
      ['15:42:11', '연산 결과 생성'],
      ['15:42:12', '결과를 RAM에 기록'],
    ],
  },
  save: {
    title: '다시 꽂기 — 결과 저장',
    summary: '완성된 결과는 다시 저장소에 기록되거나 화면으로 출력돼 사용자가 확인합니다.',
    active: 4,
    chips: ['수정된 report.docx', '자동 저장 완료', '화면 반영'],
    hot: 0,
    logs: [
      ['15:42:13', '수정 내용 RAM에서 저장소로 반영'],
      ['15:42:14', '자동 저장 타임스탬프 갱신'],
      ['15:42:15', '화면에 최신 결과 출력'],
    ],
  },
};

const TONE = getTone(1);

const METAPHOR = [
  {
    icon: <Icons.ShelfIcon />,
    label: '책장',
    sub: '오래 보관',
  },
  {
    icon: <Icons.DeskIcon />,
    label: '책상',
    sub: '지금 펼친 자료',
  },
  {
    icon: <Icons.StickyIcon />,
    label: '포스트잇',
    sub: 'CPU 가까이',
  },
  {
    icon: <Icons.PenIcon />,
    label: '펜',
    sub: '실제 계산',
  },
  {
    icon: <Icons.CheckBookIcon />,
    label: '다시 꽂기',
    sub: '결과 보관·출력',
  },
];

const IT = [
  {
    icon: <Icons.StorageDiskIcon />,
    label: '저장소',
    sub: 'SSD·HDD',
  },
  {
    icon: <Icons.RamIcon />,
    label: 'RAM',
    sub: '작업 메모리',
  },
  {
    icon: <Icons.CacheIcon />,
    label: '캐시',
    sub: 'L1·L2·L3',
  },
  {
    icon: <Icons.CpuIcon />,
    label: 'CPU',
    sub: '연산·판단',
  },
  {
    icon: <Icons.ResultIcon />,
    label: '결과 저장',
    sub: '저장·화면',
  },
];

validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' });

export default function Q04Bookshelf({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.storage;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="데이터 흐름" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairVertical
        metaphorTitle="도서관 작업"
        itTitle="컴퓨터 메모리"
        pairs={METAPHOR.map((metaphor, index) => ({ metaphor, it: IT[index] }))}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.hot === idx,
          color: scene.hot === idx ? 'var(--demo-chip-hot-purple-fg)' : undefined,
        }))}
        tone={TONE}
      />

      <LogBox logs={scene.logs} variant="stone" title="흐름 로그" lineTimeColor="var(--demo-log-time-purple)" />
    </div>
  );
}
