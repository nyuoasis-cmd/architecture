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
  virtual: {
    title: '프로그램은 넓고 정돈된 주소를 쓰는 것처럼 느낀다',
    summary: '가상 주소는 실제 RAM 배치를 그대로 보여 주지 않습니다. 프로그램은 자기만의 연속된 공간이 있다고 믿고 동작합니다.',
    active: 0,
    lanes: [
      ['문패만 보고 방 찾기', '안쪽 배치는 보이지 않음'],
      ['가상 주소 사용', 'VAS 기준 접근'],
      ['연속성 환상 제공', '배치 유연성 증가'],
    ],
    note: '가상 메모리는 프로그램에게 정돈된 주소 세계를 제공하고, 실제 물리 배치의 복잡성은 운영체제와 MMU가 숨깁니다.',
    logs: [
      ['17:10:01', '프로세스가 0x0040 페이지 요청'],
      ['17:10:02', '가상 주소 기준으로 접근 유지'],
      ['17:10:03', '페이지 테이블 조회 준비'],
    ],
  },
  physical: {
    title: '실제 RAM 안에서는 조각난 프레임에 흩어져 있을 수 있다',
    summary: '같은 프로그램의 메모리도 물리 메모리에서는 서로 떨어진 프레임에 배치될 수 있습니다. 가상 주소와 실제 위치는 다를 수 있습니다.',
    active: 1,
    lanes: [
      ['실제 객실 배정', '빈자리 기준 재배치'],
      ['물리 RAM 프레임', '실주소 매핑'],
      ['조각난 배치 허용', '공간 활용 최적화'],
    ],
    note: '프로그램이 보는 연속성과 하드웨어가 가진 실제 연속성은 별개입니다. 그 차이를 매핑하는 것이 가상 메모리의 핵심입니다.',
    logs: [
      ['17:11:01', '가상 페이지를 frame 18에 매핑'],
      ['17:11:02', '다음 페이지는 frame 41에 배치'],
      ['17:11:03', '프로세스는 연속된 주소처럼 인식'],
    ],
  },
  swap: {
    title: '당장 덜 쓰는 페이지는 잠시 디스크로 대피시킨다',
    summary: 'RAM이 부족하면 운영체제는 덜 쓰는 페이지를 스왑 공간으로 보내 자리를 확보합니다. 대신 다시 불러올 때는 훨씬 느립니다.',
    active: 2,
    lanes: [
      ['잠시 방 밖 보관', '나중에 다시 들임'],
      ['스왑 이동', 'page out 처리'],
      ['RAM 보완', '성능 저하 가능'],
    ],
    note: '스왑은 공간을 늘리는 마법이 아니라 느린 저장장치를 임시 대기실로 쓰는 절충안입니다. 자주 오가면 체감 성능이 급격히 떨어집니다.',
    logs: [
      ['17:12:01', '저활성 페이지 swap 영역으로 이동'],
      ['17:12:02', '빈 frame 확보 후 새 페이지 적재'],
      ['17:12:03', '재접근 시 page fault 처리 예정'],
    ],
  },
  protect: {
    title: '프로그램끼리 서로 메모리를 함부로 들여다보지 못한다',
    summary: '각 프로세스는 자기 주소 공간만 보이도록 분리됩니다. 이 격리가 있어야 한 프로그램의 오류가 다른 프로그램 메모리까지 쉽게 번지지 않습니다.',
    active: 3,
    lanes: [
      ['객실 간 출입 차단', '문패는 있어도 남의 방 불가'],
      ['프로세스 격리', '개별 주소 공간 보호'],
      ['안정성 향상', '오염 확산 방지'],
    ],
    note: '가상 메모리는 용량 관리 도구이면서 동시에 보호 장치입니다. 주소 공간 격리 덕분에 운영체제와 앱이 서로의 메모리를 구분할 수 있습니다.',
    logs: [
      ['17:13:01', 'pid 4201 주소 공간 권한 확인'],
      ['17:13:02', '다른 프로세스 페이지 접근 차단'],
      ['17:13:03', '보호 예외 없이 현재 작업 지속'],
    ],
  },
};

const TONE = getTone(6);

const METAPHOR = [
  { icon: <Icons.RoomIcon />, label: '호실', sub: '문패만' },
  { icon: <Icons.ActualIcon />, label: '실제', sub: '진짜 위치' },
  { icon: <Icons.EvacuateIcon />, label: '대피', sub: '잠시 옮김' },
  { icon: <Icons.IsolateMetaIcon />, label: '격리', sub: '서로 못 봄' },
];

const IT = [
  { icon: <Icons.VirtualAddrIcon />, label: '가상 주소', sub: 'VAS' },
  { icon: <Icons.RamIcon />, label: '물리 RAM', sub: 'frame' },
  { icon: <Icons.SwapIcon />, label: '스왑', sub: 'page out' },
  { icon: <Icons.IsolationIcon />, label: '격리', sub: 'process VM' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q07VirtualMemory({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.virtual;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="가상 메모리" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="호텔 배정 감각"
        itTitle="가상 메모리 동작"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">주소 공간 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['비유 장면', '메모리 동작', '의미'];
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

      <LogBox logs={scene.logs} variant="stone" title="메모리 매핑 로그" />
    </div>
  );
}
