import {
  ArrowRight,
  BowlIcon,
  CpuIcon,
  FlameIcon,
  GroupBadge,
  IconCard,
  IngredientsIcon,
  KeyboardIcon,
  MonitorIcon,
  PairConnector,
  PotIcon,
  RamIcon,
  type Tone,
} from './_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  items: string[];
  focus: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  input: {
    title: '재료 받기 — 입력',
    summary: '사용자가 건네는 재료가 입력입니다. 아직 조리되기 전의 값이 들어오는 단계입니다.',
    active: 0,
    items: ['면', '물', '스프', '계란'],
    focus: '키보드, 마우스, 센서처럼 바깥에서 들어오는 신호가 모두 입력에 해당합니다.',
    logs: [
      ['10:10:01', '사용자 요청 수신'],
      ['10:10:02', '재료 목록 확인'],
      ['10:10:03', '조리 준비 단계로 전달'],
    ],
  },
  memory: {
    title: '냄비 준비 — 메모리',
    summary: '당장 쓸 재료를 냄비와 조리대에 올려두는 장면은 메모리와 비슷합니다.',
    active: 1,
    items: ['냄비 속 물', '올려둔 면', '곧 넣을 스프'],
    focus: '메모리는 작업 중 재료를 잠깐 붙잡아 두는 공간이라 빠르지만 영구 보관 창고는 아닙니다.',
    logs: [
      ['10:10:04', '작업대에 재료 배치'],
      ['10:10:05', '냄비에 물 채움'],
      ['10:10:06', '즉시 사용할 재료 유지'],
    ],
  },
  cpu: {
    title: '불로 익히기 — 처리',
    summary: '실제로 변화를 만들어내는 단계가 처리입니다. CPU가 규칙에 따라 계산하는 순간과 닮았습니다.',
    active: 2,
    items: ['끓는 물', '익는 면', '섞이는 스프'],
    focus: 'CPU는 메모리에 올라온 재료를 읽어 순서대로 계산하고 상태를 바꿉니다.',
    logs: [
      ['10:10:07', '불 점화'],
      ['10:10:08', '조리 순서 실행'],
      ['10:10:09', '결과 상태 갱신'],
    ],
  },
  output: {
    title: '그릇에 담기 — 출력',
    summary: '완성된 결과를 사람이 바로 확인할 수 있는 형태로 내놓는 단계가 출력입니다.',
    active: 3,
    items: ['완성된 라면', '김 나는 그릇', '먹을 준비 완료'],
    focus: '화면, 스피커, 프린터처럼 결과를 밖으로 드러내는 장치가 출력 역할을 맡습니다.',
    logs: [
      ['10:10:10', '완성 결과 생성'],
      ['10:10:11', '그릇에 담기'],
      ['10:10:12', '사용자에게 제공'],
    ],
  },
};

const TONE: Tone = {
  accent: '#ea580c',
  accentSoft: '#fff7ed',
  accentBorder: '#fdba74',
};

const RAMEN_PAIR = [
  { icon: <IngredientsIcon />, label: '재료', sub: '면·물·스프' },
  { icon: <PotIcon />, label: '냄비', sub: '잠깐 올려두기' },
  { icon: <FlameIcon />, label: '불', sub: '익혀서 변화' },
  { icon: <BowlIcon />, label: '그릇', sub: '담아 내놓기' },
];

const COMPUTER_PAIR = [
  { icon: <KeyboardIcon />, label: '입력', sub: '바깥에서 들어옴' },
  { icon: <RamIcon />, label: '메모리', sub: '작업 중 보관' },
  { icon: <CpuIcon />, label: '처리', sub: 'CPU가 계산' },
  { icon: <MonitorIcon />, label: '출력', sub: '화면·스피커' },
];

export default function Q01Ramen({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.input;

  return (
    <div className="flex flex-col gap-3">
      <section
        className="rounded-2xl border p-5"
        style={{
          borderColor: 'var(--color-border)',
          background: 'linear-gradient(135deg, #fff7ed, #ffedd5 58%, #ffffff)',
        }}
      >
        <p className="m-0 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          컴퓨터의 큰 그림
        </p>
        <h2 className="mt-1.5 text-[20px] font-semibold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
          {scene.title}
        </h2>
        <p className="mt-2 text-[13px] leading-[1.7]" style={{ color: '#7c2d12' }}>
          {scene.summary}
        </p>
      </section>

      <section
        className="rounded-2xl border p-5"
        style={{ borderColor: 'var(--color-border)', background: '#fff' }}
      >
        <GroupBadge label="라면 만들기" sub="비유" tone={TONE} />
        <div className="grid grid-cols-4 items-stretch gap-2">
          {RAMEN_PAIR.map((step, idx) => (
            <RowCell key={step.label} step={step} active={scene.active === idx} tone={TONE} showArrow={idx < 3} />
          ))}
        </div>

        <PairConnector tone={TONE} />

        <GroupBadge label="컴퓨터의 동작" sub="실제" tone={TONE} />
        <div className="grid grid-cols-4 items-stretch gap-2">
          {COMPUTER_PAIR.map((step, idx) => (
            <RowCell key={step.label} step={step} active={scene.active === idx} tone={TONE} showArrow={idx < 3} />
          ))}
        </div>
      </section>

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: '#fff' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">지금 화면의 재료</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {scene.items.map((item, idx) => (
            <span
              key={item}
              className="rounded-full border px-3 py-1.5 text-[12px]"
              style={
                idx === 0
                  ? { background: TONE.accentSoft, borderColor: TONE.accentBorder, color: '#9a3412' }
                  : { background: '#f8fafc', borderColor: 'var(--color-border)' }
              }
            >
              {item}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[12px] leading-[1.7]" style={{ color: '#475569' }}>
          {scene.focus}
        </p>
      </section>

      <section
        className="rounded-2xl border px-4 py-3"
        style={{ borderColor: 'var(--color-border)', background: '#111827', color: '#f8fafc' }}
      >
        <p className="m-0 text-[11px]" style={{ color: '#94a3b8' }}>
          실시간 로그
        </p>
        {scene.logs.map(([time, msg]) => (
          <div key={time} className="font-mono text-[11px] leading-[1.8]">
            <span style={{ color: '#94a3b8', marginRight: 6 }}>{time}</span>
            {msg}
          </div>
        ))}
      </section>
    </div>
  );
}

function RowCell({
  step,
  active,
  tone,
  showArrow,
}: {
  step: { icon: React.ReactNode; label: string; sub?: string };
  active: boolean;
  tone: Tone;
  showArrow: boolean;
}) {
  return (
    <div className="relative flex flex-col">
      <IconCard icon={step.icon} label={step.label} sub={step.sub} active={active} tone={tone} />
      {showArrow && (
        <div
          className="pointer-events-none absolute right-[-13px] top-1/2 -translate-y-1/2"
          style={{ color: 'var(--color-text-faint)' }}
          aria-hidden
        >
          <ArrowRight />
        </div>
      )}
    </div>
  );
}
