import { useState } from 'react';
import { PairBinary, PairFlow, PairMatch, PairVertical, getTone, Icons } from '../_shared';

const tone = getTone(1);

const flowMetaphor = [
  { icon: <Icons.IngredientsIcon />, label: '재료', sub: '들어오는 값' },
  { icon: <Icons.PotIcon />, label: '냄비', sub: '작업 공간' },
  { icon: <Icons.FlameIcon />, label: '불', sub: '계산 수행' },
  { icon: <Icons.BowlIcon />, label: '그릇', sub: '결과 제시' },
];

const flowIt = [
  { icon: <Icons.KeyboardIcon />, label: '입력', sub: '바깥 신호' },
  { icon: <Icons.RamIcon />, label: '메모리', sub: '잠깐 보관' },
  { icon: <Icons.CpuIcon />, label: '처리', sub: '규칙 실행' },
  { icon: <Icons.MonitorIcon />, label: '출력', sub: '화면 반영' },
];

const verticalPairs = [
  {
    metaphor: { icon: <Icons.ShelfIcon />, label: '책장', sub: '오래 보관' },
    it: { icon: <Icons.StorageDiskIcon />, label: '저장소', sub: 'SSD·HDD' },
  },
  {
    metaphor: { icon: <Icons.DeskIcon />, label: '책상', sub: '바로 펼침' },
    it: { icon: <Icons.RamIcon />, label: 'RAM', sub: '작업 메모리' },
  },
  {
    metaphor: { icon: <Icons.StickyIcon />, label: '포스트잇', sub: '가까운 메모' },
    it: { icon: <Icons.CacheIcon />, label: '캐시', sub: 'L1·L2·L3' },
  },
  {
    metaphor: { icon: <Icons.PenIcon />, label: '펜', sub: '실제 계산' },
    it: { icon: <Icons.CpuIcon />, label: 'CPU', sub: '연산 장치' },
  },
];

export default function ShowcasePage() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <main className="mx-auto flex w-full max-w-[860px] flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">_shared Pair Block Showcase</h1>
        <p className="text-sm text-(--color-text-body)">PR-12 공용 계약 시각 기준점. 활성 단계는 4개 변형 모두에 동기화됩니다.</p>
      </header>

      <label className="flex items-center gap-3 text-sm">
        <span>활성 단계</span>
        <input
          type="range"
          min="0"
          max="3"
          value={activeIndex}
          onChange={(event) => setActiveIndex(Number(event.target.value))}
          className="w-full"
        />
        <span className="w-6 text-right">{activeIndex + 1}</span>
      </label>

      <PairFlow metaphorTitle="라면 만들기" itTitle="컴퓨터의 동작" metaphor={flowMetaphor} it={flowIt} activeIndex={activeIndex} tone={tone} />

      <PairBinary
        metaphorTitle="공연장"
        itTitle="컴퓨터"
        metaphorLeft={{ icon: <Icons.StageIcon />, label: '무대', cards: ['조명 장치', '스피커', '무대 바닥'] }}
        metaphorRight={{ icon: <Icons.ScriptIcon />, label: '대본', cards: ['장면 순서', '배우 동선', '음악 타이밍'] }}
        itLeft={{ icon: <Icons.HardwareIcon />, label: '하드웨어', sub: '실체 있는 장비' }}
        itRight={{ icon: <Icons.SoftwareIcon />, label: '소프트웨어', sub: '명령의 묶음' }}
        leftActive={activeIndex % 2 === 0}
        rightActive={activeIndex % 2 === 1}
        tone={{ accent: 'var(--demo-accent-q02)', accentSoft: 'var(--demo-accent-soft-q02)', accentBorder: 'var(--demo-accent-border-q02)' }}
      />

      <PairMatch
        metaphorTitle="식당 운영"
        itTitle="운영체제"
        metaphor={[
          { icon: <Icons.SeatsIcon />, label: '자리 배치', sub: '좌석 배정' },
          { icon: <Icons.OrdersIcon />, label: '주문 나누기', sub: '순서 조정' },
          { icon: <Icons.StorageBoxIcon />, label: '영수증 보관', sub: '기록 정리' },
          { icon: <Icons.CheckoutIcon />, label: '결제 확인', sub: '승인 점검' },
        ]}
        it={[
          { icon: <Icons.OsAllocateIcon />, label: '자원 분배', sub: 'CPU·RAM' },
          { icon: <Icons.OsScheduleIcon />, label: '작업 조정', sub: '스케줄링' },
          { icon: <Icons.OsFileIcon />, label: '파일 관리', sub: '저장 규칙' },
          { icon: <Icons.OsLockIcon />, label: '권한·UI', sub: '승인·창' },
        ]}
        activeIndex={activeIndex}
        tone={{ accent: 'var(--demo-accent-q03)', accentSoft: 'var(--demo-accent-soft-q03)', accentBorder: 'var(--demo-accent-border-q03)' }}
      />

      <PairVertical
        metaphorTitle="도서관 작업"
        itTitle="컴퓨터 메모리"
        pairs={verticalPairs}
        activeIndex={activeIndex}
        tone={{ accent: 'var(--demo-accent-q04)', accentSoft: 'var(--demo-accent-soft-q04)', accentBorder: 'var(--demo-accent-border-q04)' }}
      />
    </main>
  );
}
