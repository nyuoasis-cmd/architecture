import {
  CacheIcon,
  CheckBookIcon,
  CpuIcon,
  DeskIcon,
  GroupBadge,
  PenIcon,
  RamIcon,
  ResultIcon,
  ShelfIcon,
  StickyIcon,
  StorageDiskIcon,
  type Tone,
} from './_shared';
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

const TONE: Tone = {
  accent: '#7c3aed',
  accentSoft: '#f5f3ff',
  accentBorder: '#c4b5fd',
};

const PAIRS: Array<{
  metaIcon: React.ReactNode;
  metaLabel: string;
  metaSub: string;
  itIcon: React.ReactNode;
  itLabel: string;
  itSub: string;
}> = [
  {
    metaIcon: <ShelfIcon />,
    metaLabel: '책장',
    metaSub: '오래 보관',
    itIcon: <StorageDiskIcon />,
    itLabel: '저장소',
    itSub: 'SSD·HDD',
  },
  {
    metaIcon: <DeskIcon />,
    metaLabel: '책상',
    metaSub: '지금 펼친 자료',
    itIcon: <RamIcon />,
    itLabel: 'RAM',
    itSub: '작업 메모리',
  },
  {
    metaIcon: <StickyIcon />,
    metaLabel: '포스트잇',
    metaSub: 'CPU 가까이',
    itIcon: <CacheIcon />,
    itLabel: '캐시',
    itSub: 'L1·L2·L3',
  },
  {
    metaIcon: <PenIcon />,
    metaLabel: '펜',
    metaSub: '실제 계산',
    itIcon: <CpuIcon />,
    itLabel: 'CPU',
    itSub: '연산·판단',
  },
  {
    metaIcon: <CheckBookIcon />,
    metaLabel: '다시 꽂기',
    metaSub: '결과 보관·출력',
    itIcon: <ResultIcon />,
    itLabel: '결과 저장',
    itSub: '저장·화면',
  },
];

export default function Q04Bookshelf({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.storage;

  return (
    <div className="flex flex-col gap-3">
      <section
        className="rounded-2xl border p-5"
        style={{
          borderColor: 'var(--color-border)',
          background: 'linear-gradient(135deg, #f5f3ff, #ffffff)',
        }}
      >
        <p className="m-0 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          데이터 흐름
        </p>
        <h2 className="mt-1.5 text-[20px] font-semibold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
          {scene.title}
        </h2>
        <p className="mt-2 text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          {scene.summary}
        </p>
      </section>

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: '#fff' }}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
          <div>
            <GroupBadge label="도서관 작업" sub="비유" tone={TONE} />
          </div>
          <div />
          <div>
            <GroupBadge label="컴퓨터 메모리" sub="실제" tone={TONE} />
          </div>

          {PAIRS.map((pair, idx) => {
            const active = scene.active === idx;
            return (
              <FragmentRow
                key={pair.metaLabel}
                pair={pair}
                active={active}
                tone={TONE}
                showDivider={idx < PAIRS.length - 1}
              />
            );
          })}
        </div>
      </section>

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: '#fff' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">현재 상태</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {scene.chips.map((chip, idx) => {
            const hot = scene.hot === idx;
            return (
              <span
                key={chip}
                className="rounded-full border px-3 py-1.5 text-[11px]"
                style={
                  hot
                    ? { background: TONE.accentSoft, borderColor: TONE.accentBorder, color: '#5b21b6' }
                    : { background: '#fff', borderColor: 'var(--color-border)' }
                }
              >
                {chip}
              </span>
            );
          })}
        </div>
      </section>

      <section
        className="rounded-2xl border px-4 py-3"
        style={{ borderColor: 'var(--color-border)', background: '#111827', color: '#f8fafc' }}
      >
        <p className="m-0 text-[11px]" style={{ color: '#c4b5fd' }}>
          흐름 로그
        </p>
        {scene.logs.map(([time, msg]) => (
          <div key={time} className="font-mono text-[11px] leading-[1.8]">
            <span style={{ color: '#c4b5fd', marginRight: 6 }}>{time}</span>
            {msg}
          </div>
        ))}
      </section>
    </div>
  );
}

function FragmentRow({
  pair,
  active,
  tone,
}: {
  pair: {
    metaIcon: React.ReactNode;
    metaLabel: string;
    metaSub: string;
    itIcon: React.ReactNode;
    itLabel: string;
    itSub: string;
  };
  active: boolean;
  tone: Tone;
  showDivider: boolean;
}) {
  const cellStyle: React.CSSProperties = {
    borderColor: active ? tone.accent : 'var(--color-border)',
    background: active ? tone.accentSoft : '#fff',
    boxShadow: active ? `0 8px 18px ${tone.accent}1f` : undefined,
  };
  const labelColor = active ? tone.accent : 'var(--color-text-primary)';

  return (
    <>
      <div className="rounded-2xl border px-3 py-2.5 transition" style={cellStyle}>
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center"
            style={{ color: active ? tone.accent : 'var(--color-text-muted)' }}
          >
            {pair.metaIcon}
          </span>
          <div className="min-w-0">
            <p className="m-0 text-[12px] font-bold leading-tight" style={{ color: labelColor }}>
              {pair.metaLabel}
            </p>
            <p className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
              {pair.metaSub}
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-center text-[14px] font-bold"
        style={{ color: active ? tone.accent : 'var(--color-text-faint)' }}
        aria-hidden
      >
        ≈
      </div>

      <div className="rounded-2xl border px-3 py-2.5 transition" style={cellStyle}>
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center"
            style={{ color: active ? tone.accent : 'var(--color-text-muted)' }}
          >
            {pair.itIcon}
          </span>
          <div className="min-w-0">
            <p className="m-0 text-[12px] font-bold leading-tight" style={{ color: labelColor }}>
              {pair.itLabel}
            </p>
            <p className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
              {pair.itSub}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
