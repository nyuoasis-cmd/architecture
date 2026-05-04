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
  folders: {
    title: '폴더는 파일을 사람이 찾기 쉽게 묶어 주는 입구다',
    summary: '디렉터리는 저장 장치의 실제 위치를 그대로 보여 주지 않고, 사람이 기억하기 쉬운 이름과 계층 구조를 제공합니다.',
    active: 0,
    chips: ['이름 기반 분류', '계층 구조', '찾기 쉬운 입구'],
    focus: 0,
    logs: [
      ['17:20:01', '/project/docs 경로 조회'],
      ['17:20:02', '디렉터리 엔트리에서 파일 이름 탐색'],
      ['17:20:03', '다음 메타데이터 위치 확인'],
    ],
  },
  inode: {
    title: '이름표 뒤에는 파일의 실제 정보 카드가 따로 있다',
    summary: 'inode 같은 메타데이터 구조는 파일 크기, 권한, 수정 시각, 블록 위치처럼 이름 외의 핵심 정보를 들고 있습니다.',
    active: 1,
    chips: ['크기와 권한', '수정 시각', '블록 위치 포인터'],
    focus: 1,
    logs: [
      ['17:21:01', 'inode 2481 로드'],
      ['17:21:02', '권한과 크기 정보 확인'],
      ['17:21:03', '데이터 블록 포인터 목록 준비'],
    ],
  },
  blocks: {
    title: '실제 내용은 여러 블록 조각에 나뉘어 저장될 수 있다',
    summary: '파일 데이터는 저장 장치의 블록 단위 공간에 기록됩니다. 파일이 커질수록 여러 블록을 이어 붙여 실제 내용을 구성합니다.',
    active: 2,
    chips: ['블록 단위 저장', '조각 연결', '실제 데이터 위치'],
    focus: 2,
    logs: [
      ['17:22:01', 'block 821 읽기 시작'],
      ['17:22:02', '다음 데이터 블록 연속 조회'],
      ['17:22:03', '파일 내용 버퍼 조립 완료'],
    ],
  },
  journal: {
    title: '갑자기 꺼져도 복구하려면 변경 기록을 먼저 남긴다',
    summary: '저널링은 중요한 변경 내용을 먼저 기록해 두어 장애가 나도 어디까지 반영됐는지 추적하고 복구를 돕습니다.',
    active: 3,
    chips: ['변경 먼저 기록', '장애 복구 단서', '손상 범위 축소'],
    focus: 1,
    logs: [
      ['17:23:01', '메타데이터 변경 예정 항목 기록'],
      ['17:23:02', '저널 커밋 후 실제 블록 반영'],
      ['17:23:03', '재시작 시 복구 절차 기준 확보'],
    ],
  },
};

const TONE = getTone(6);

const METAPHOR = [
  { icon: <Icons.FolderIcon />, label: '폴더', sub: '묶음' },
  { icon: <Icons.CardIcon />, label: '카드', sub: '메타정보' },
  { icon: <Icons.BlockMetaIcon />, label: '블록', sub: '실제 조각' },
  { icon: <Icons.RecordIcon />, label: '기록', sub: '변경 로그' },
];

const IT = [
  { icon: <Icons.DirectoryIcon />, label: '디렉터리', sub: 'tree' },
  { icon: <Icons.InodeIcon />, label: 'inode', sub: 'metadata' },
  { icon: <Icons.BlockItIcon />, label: '블록', sub: 'data block' },
  { icon: <Icons.JournalIcon />, label: '저널', sub: 'crash 회복' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q08FileSystem({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.folders;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="파일 시스템" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="서류 보관 감각"
        itTitle="파일 시스템 구조"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="저장 장치를 질서 있게 쓰는 요소"
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.focus === idx,
        }))}
        tone={TONE}
        description="파일 시스템은 이름표, 메타데이터, 실제 저장 조각, 복구 기록을 분리해 저장 장치를 검색 가능하고 복구 가능한 구조로 만듭니다."
      />

      <LogBox logs={scene.logs} variant="stone" title="파일 시스템 로그" />
    </div>
  );
}
