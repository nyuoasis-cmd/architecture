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
  os: {
    title: '가전 분류표 — 운영체제',
    summary: '집안에서 꼭 필요한 기본 가전처럼 운영체제는 다른 프로그램이 돌아갈 바닥을 먼저 제공합니다.',
    active: 0,
    lanes: [
      ['냉장고', '세탁기'],
      ['윈도우', 'macOS'],
      ['다른 도구가 기대는 기본 환경'],
    ],
    note: '운영체제는 컴퓨터 전체를 관리하는 바닥 소프트웨어라서 앱보다 먼저 준비되고, 다른 프로그램이 기대는 기준점이 됩니다.',
    logs: [
      ['09:20:01', '기본 환경 준비 시작'],
      ['09:20:02', '장치 제어 규칙 로드'],
      ['09:20:03', '앱 실행 기반 제공'],
    ],
  },
  driver: {
    title: '문구 맞춤 도구 — 드라이버',
    summary: '특정 펜이나 프린터 도구에 맞춰 연결법을 알려 주는 설명서가 드라이버 역할과 닮았습니다.',
    active: 1,
    lanes: [
      ['전용 펜심', '프린터 리필'],
      ['그래픽 드라이버', '프린터 드라이버'],
      ['장치별 동작 방식 연결'],
    ],
    note: '드라이버는 운영체제와 하드웨어 사이에서 “이 장치는 이렇게 다뤄야 한다”는 맞춤 규칙을 제공합니다.',
    logs: [
      ['09:20:04', '장치 식별 완료'],
      ['09:20:05', '전용 제어 규칙 연결'],
      ['09:20:06', '입출력 명령 전달'],
    ],
  },
  app: {
    title: '책 읽기 도구 — 앱',
    summary: '사람이 직접 쓰는 책, 메모, 계산 도구처럼 앱은 사용자가 목적을 이루기 위해 만나는 소프트웨어입니다.',
    active: 2,
    lanes: [
      ['전자책', '메모장'],
      ['문서 앱', '메신저 앱'],
      ['사용자가 바로 만나는 기능'],
    ],
    note: '앱은 운영체제 위에서 돌아가며 사용자가 직접 선택하고 실행하는 작업 도구에 가깝습니다.',
    logs: [
      ['09:20:07', '사용자 앱 실행 요청'],
      ['09:20:08', 'UI 화면 로드'],
      ['09:20:09', '기능 사용 시작'],
    ],
  },
  middleware: {
    title: '도구 사이 연결 — 미들웨어',
    summary: '여러 도구가 같은 규칙으로 대화하게 돕는 연결 부품처럼 미들웨어는 소프트웨어 사이를 이어 줍니다.',
    active: 3,
    lanes: [
      ['멀티탭', '연결 어댑터'],
      ['웹 서버', '메시지 브로커'],
      ['서로 다른 프로그램 연결'],
    ],
    note: '미들웨어는 앱과 앱, 앱과 시스템 사이에서 통신·인증·연결 같은 공통 기능을 맡아 복잡도를 줄입니다.',
    logs: [
      ['09:20:10', '연결 규칙 적용'],
      ['09:20:11', '서비스 간 요청 중계'],
      ['09:20:12', '공통 처리 완료'],
    ],
  },
};

const TONE = getTone(2);

const METAPHOR = [
  { icon: <Icons.HomeApplianceIcon />, label: '가전', sub: '사용' },
  { icon: <Icons.StationeryIcon />, label: '문구', sub: '사용' },
  { icon: <Icons.BookIcon />, label: '책', sub: '사용' },
  { icon: <Icons.ToolIcon />, label: '도구', sub: '사용' },
];

const IT = [
  { icon: <Icons.OsIcon />, label: '운영체제', sub: '사용' },
  { icon: <Icons.DriverIcon />, label: '드라이버', sub: '사용' },
  { icon: <Icons.AppIcon />, label: '앱', sub: '사용' },
  { icon: <Icons.MiddlewareIcon />, label: '미들웨어', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q01Software({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.os;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="소프트웨어 분류" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="생활 도구 분류"
        itTitle="소프트웨어 분류"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">분류 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['생활 비유', 'IT 분류', '핵심 의미'];
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

      <LogBox logs={scene.logs} variant="blue" title="분류 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
