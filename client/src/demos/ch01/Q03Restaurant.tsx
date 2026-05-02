import {
  CheckoutIcon,
  GroupBadge,
  IconCard,
  OrdersIcon,
  OsAllocateIcon,
  OsFileIcon,
  OsLockIcon,
  OsScheduleIcon,
  PairConnector,
  SeatsIcon,
  StorageBoxIcon,
  type Tone,
} from './_shared';
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
  seats: {
    title: '자리 배치 — 자원 분배',
    summary: '운영체제는 여러 앱이 동시에 몰려와도 CPU와 메모리 자리를 나눠 줍니다.',
    active: 0,
    lanes: [
      ['브라우저 손님', '메신저 손님'],
      ['CPU 좌석 2개 배정', 'RAM 1.2GB 사용'],
      ['대기 손님 없음'],
    ],
    note: '앱마다 필요한 자원이 다르기 때문에 운영체제는 누가 먼저 앉고 얼마나 오래 쓸지 계속 조정합니다.',
    logs: [
      ['13:05:01', '브라우저 앱 입장'],
      ['13:05:02', '메신저 앱 입장'],
      ['13:05:03', 'CPU 시간과 메모리 배정 완료'],
    ],
  },
  orders: {
    title: '주문 나누기 — 작업 조정',
    summary: '운영체제는 어떤 앱 작업을 먼저 처리할지 순서를 조정해 전체 흐름을 맞춥니다.',
    active: 1,
    lanes: [
      ['사진 편집 요청', '음악 재생 유지'],
      ['CPU 작업 분배', '입출력 대기 조정'],
      ['백그라운드 업데이트 대기'],
    ],
    note: '모든 앱이 동시에 "나부터"를 외치면 느려집니다. 운영체제는 짧은 시간 단위로 차례를 돌리며 체감상 동시에 움직이게 만듭니다.',
    logs: [
      ['13:05:04', '사진 편집 큐 등록'],
      ['13:05:05', '음악 재생 우선 유지'],
      ['13:05:06', '백그라운드 작업 지연 배치'],
    ],
  },
  storage: {
    title: '영수증 보관 — 파일 관리',
    summary: '운영체제는 파일을 저장하고 찾는 규칙을 정해 사용자가 일관된 방식으로 문서를 다루게 합니다.',
    active: 2,
    lanes: [
      ['영수증 묶음', '예약 장부'],
      ['폴더 규칙 정리', '이름표 붙이기'],
      ['필요 시 다시 찾기'],
    ],
    note: '파일 관리가 없으면 같은 문서를 어디에 저장했는지 찾기 어려워집니다. 운영체제는 저장소를 사용할 공통 질서를 제공합니다.',
    logs: [
      ['13:05:07', 'report.pdf 저장 요청'],
      ['13:05:08', '문서 폴더 경로 확인'],
      ['13:05:09', '파일 목록 갱신 완료'],
    ],
  },
  checkout: {
    title: '결제 확인 — 권한과 인터페이스',
    summary: '운영체제는 누가 무엇을 열 수 있는지 확인하고, 사람에게는 버튼과 창으로 결과를 보여 줍니다.',
    active: 3,
    lanes: [
      ['앱 권한 확인', '로그인 상태 점검'],
      ['결제 버튼 표시', '확인 창 띄우기'],
      ['허용 또는 차단 결과 전달'],
    ],
    note: '사용자 인터페이스와 권한 관리는 따로 노는 기능이 아닙니다. 사용자가 안전하게 명령을 내릴 수 있게 만드는 운영체제의 중요한 역할입니다.',
    logs: [
      ['13:05:10', '카메라 권한 요청 수신'],
      ['13:05:11', '사용자 승인 창 표시'],
      ['13:05:12', '허용 결과 앱에 전달'],
    ],
  },
};

const TONE: Tone = {
  accent: '#0f766e',
  accentSoft: '#ecfeff',
  accentBorder: '#5eead4',
};

const RESTAURANT_PAIR = [
  { icon: <SeatsIcon />, label: '자리 배치', sub: '손님에게 좌석 배정' },
  { icon: <OrdersIcon />, label: '주문 나누기', sub: '먼저·나중 순서 조정' },
  { icon: <StorageBoxIcon />, label: '영수증 보관', sub: '폴더에 정리' },
  { icon: <CheckoutIcon />, label: '결제 확인', sub: '권한·승인' },
];

const OS_PAIR = [
  { icon: <OsAllocateIcon />, label: '자원 분배', sub: 'CPU·메모리 나눔' },
  { icon: <OsScheduleIcon />, label: '작업 조정', sub: '스케줄링' },
  { icon: <OsFileIcon />, label: '파일 관리', sub: '저장소 규칙' },
  { icon: <OsLockIcon />, label: '권한·UI', sub: '승인·인터페이스' },
];

export default function Q03Restaurant({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.seats;
  const lastIdx = Math.min(scene.active, RESTAURANT_PAIR.length - 1);

  return (
    <div className="flex flex-col gap-3">
      <section
        className="rounded-2xl border p-5"
        style={{
          borderColor: 'var(--color-border)',
          background: 'linear-gradient(135deg, #f0fdfa, #ffffff)',
        }}
      >
        <p className="m-0 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          운영체제의 역할
        </p>
        <h2 className="mt-1.5 text-[20px] font-semibold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
          {scene.title}
        </h2>
        <p className="mt-2 text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          {scene.summary}
        </p>
      </section>

      <section
        className="rounded-2xl border p-5"
        style={{ borderColor: 'var(--color-border)', background: '#fff' }}
      >
        <GroupBadge label="식당 운영" sub="비유" tone={TONE} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RESTAURANT_PAIR.map((step, idx) => (
            <IconCard
              key={step.label}
              icon={step.icon}
              label={step.label}
              sub={step.sub}
              active={lastIdx === idx}
              tone={TONE}
            />
          ))}
        </div>

        <PairConnector tone={TONE} />

        <GroupBadge label="운영체제" sub="실제" tone={TONE} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {OS_PAIR.map((step, idx) => (
            <IconCard
              key={step.label}
              icon={step.icon}
              label={step.label}
              sub={step.sub}
              active={lastIdx === idx}
              tone={TONE}
            />
          ))}
        </div>
      </section>

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: '#fff' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">식당 흐름 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['앱 손님', '매니저 조정', '결과'];
            return (
              <div
                key={titles[index]}
                className="rounded-2xl border p-3 transition"
                style={{
                  minHeight: 120,
                  borderColor: active ? TONE.accent : 'var(--color-border)',
                  background: active ? TONE.accentSoft : '#f8fafc',
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
                      className="rounded-xl border bg-white px-2.5 py-2 text-[11px] leading-[1.5]"
                      style={{ borderColor: 'var(--color-border)' }}
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
          style={{ borderColor: 'var(--color-border)', background: '#f8fafc', color: '#334155' }}
        >
          {scene.note}
        </div>
      </section>

      <section
        className="rounded-2xl border px-4 py-3"
        style={{ borderColor: 'var(--color-border)', background: '#102a43', color: '#f8fafc' }}
      >
        <p className="m-0 text-[11px]" style={{ color: '#bfdbfe' }}>
          매니저 로그
        </p>
        {scene.logs.map(([time, msg]) => (
          <div key={time} className="font-mono text-[11px] leading-[1.8]">
            <span style={{ color: '#93c5fd', marginRight: 6 }}>{time}</span>
            {msg}
          </div>
        ))}
      </section>
    </div>
  );
}
