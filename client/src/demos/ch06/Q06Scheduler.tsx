import { Hero, Icons, LogBox, PairMatch, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  lanes: string[][];
  note: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  slice: {
    title: 'CPU 시간을 잘게 나눠 모두에게 한 입씩 준다',
    summary: '타임 슬라이스는 한 작업이 CPU를 오래 독점하지 못하게 막고, 여러 프로세스가 번갈아 실행되는 기반을 만듭니다.',
    active: 0,
    lanes: [
      ['작은 조각으로 나눔', '한 번에 조금씩 처리'],
      ['타임 슬라이스 배정', 'quantum 단위 실행'],
      ['응답성 유지', '독점 방지'],
    ],
    note: '멀티태스킹의 시작은 동시에 많이 돌리는 것이 아니라, 한정된 CPU 시간을 짧고 반복적으로 배분하는 데 있습니다.',
    logs: [
      ['17:00:01', 'pid 4201에 8ms 할당'],
      ['17:00:02', '타이머 만료 전까지 실행'],
      ['17:00:03', '다음 실행 후보 대기열 확인'],
    ],
  },
  switch: {
    title: '차례가 끝나면 상태를 바꿔 끼운다',
    summary: '문맥 교환은 현재 작업의 레지스터와 실행 위치를 저장하고, 다음 작업의 상태를 CPU에 다시 올리는 과정입니다.',
    active: 1,
    lanes: [
      ['자리 교대', '하던 일 표시 남김'],
      ['컨텍스트 저장/복원', 'switch 수행'],
      ['작업 전환 가능', '연속성 유지'],
    ],
    note: '문맥 교환은 멀티태스킹의 연결 장치입니다. 이 비용이 너무 커지면 오히려 CPU가 일보다 교대에 시간을 더 쓰게 됩니다.',
    logs: [
      ['17:01:01', 'pid 4201 레지스터 저장'],
      ['17:01:02', 'pid 4208 상태 로드'],
      ['17:01:03', '프로그램 카운터 새 위치 적용'],
    ],
  },
  priority: {
    title: '모든 작업을 똑같이 다루지는 않는다',
    summary: '운영체제는 입력 반응처럼 급한 작업을 더 먼저 실행하도록 우선순위를 고려합니다. 공정성만이 아니라 체감 반응도 함께 관리합니다.',
    active: 2,
    lanes: [
      ['먼저 처리할 일 표시', '급한 손님 우선'],
      ['우선순위 비교', 'ready queue 재정렬'],
      ['반응성 향상', '중요 작업 선처리'],
    ],
    note: '스케줄러는 단순 순번표가 아닙니다. 어떤 작업을 먼저 체감시킬지 계속 판단하는 정책 엔진에 가깝습니다.',
    logs: [
      ['17:02:01', '입력 이벤트 작업 priority 상승'],
      ['17:02:02', '백그라운드 작업 일시 후순위'],
      ['17:02:03', '다음 실행 대상을 pid 4310으로 교체'],
    ],
  },
  illusion: {
    title: '짧은 전환이 쌓여 동시에 움직이는 듯 보인다',
    summary: '한 코어가 모든 작업을 진짜 동시에 처리하는 것은 아니어도, 전환이 충분히 빠르면 사용자는 여러 앱이 함께 돌아간다고 느낍니다.',
    active: 3,
    lanes: [
      ['번갈아 서비스', '모두 진행 중처럼 보임'],
      ['동시 실행 체감', '빠른 스케줄링 환상'],
      ['멀티태스킹 경험', '끊김 감소'],
    ],
    note: '체감 동시성은 하드웨어 속도와 스케줄링 정책이 함께 만든 결과입니다. 사용자에게는 전환이 안 보이는 것이 중요합니다.',
    logs: [
      ['17:03:01', '브라우저, 음악, 채팅 앱 순환 실행'],
      ['17:03:02', '각 작업이 짧게 CPU 점유'],
      ['17:03:03', '사용자는 세 앱이 함께 반응한다고 인식'],
    ],
  },
};

const TONE = getTone(6);

const METAPHOR = [
  { icon: <Icons.SliceIcon />, label: '조각', sub: '시간 분할' },
  { icon: <Icons.SwapMetaIcon />, label: '교환', sub: '작업 전환' },
  { icon: <Icons.PriorityIcon />, label: '우선', sub: '먼저 처리' },
  { icon: <Icons.ConcurrencyIcon />, label: '동시감', sub: '느낌상 동시' },
];

const IT = [
  { icon: <Icons.TimeSliceIcon />, label: '타임 슬라이스', sub: 'quantum' },
  { icon: <Icons.ContextIcon />, label: '컨텍스트', sub: 'switch' },
  { icon: <Icons.PriorityItIcon />, label: '우선순위', sub: 'priority' },
  { icon: <Icons.ParallelIcon />, label: '동시 실행', sub: '환상' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q06Scheduler({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.slice;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="멀티태스킹" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="서비스 순번 감각"
        itTitle="스케줄러 동작"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">스케줄링 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['운영 장면', '운영체제 동작', '사용자 체감'];
            return (
              <div
                key={titles[index]}
                className="rounded-2xl border p-3 transition"
                style={{
                  minHeight: 120,
                  borderColor: active ? TONE.accent : 'var(--color-border)',
                  background: active ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
                }}
              >
                <p
                  className="m-0 text-[11px] font-bold"
                  style={{ color: active ? TONE.accent : 'var(--color-text-muted)' }}
                >
                  {titles[index]}
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {items.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border px-2.5 py-2 text-[11px] leading-[1.5]"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="mt-3 rounded-2xl border px-3 py-2.5 text-[12px] leading-[1.7]"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--demo-card-bg-alt)',
            color: 'var(--demo-summary-text-stone)',
          }}
        >
          {scene.note}
        </div>
      </section>

      <LogBox logs={scene.logs} variant="stone" title="스케줄러 로그" />
    </div>
  );
}
