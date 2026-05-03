import { Hero, Icons, LogBox, PairMatch, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  values: Array<{ label: string; value: string; note: string }>;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  traffic: {
    title: '들어오는 양 보기 — 요청 수',
    summary: '먼저 얼마나 많은 요청이 들어오는지 알아야 정상 범위를 정하고 이후 지표의 맥락도 읽을 수 있습니다.',
    active: 0,
    values: [
      { label: '요청 수', value: '2.4k/min', note: '트래픽 기준선' },
      { label: '지연', value: '180ms', note: '응답 속도' },
      { label: '에러율', value: '0.2%', note: '실패 비율' },
      { label: '알림', value: '정상', note: '임계치 미만' },
    ],
    logs: [
      ['17:00:01', '분당 요청 수 집계 시작'],
      ['17:00:02', '평시 범위와 비교'],
      ['17:00:03', '트래픽 급증 여부 기록'],
    ],
  },
  latency: {
    title: '반응 속도 보기 — 지연',
    summary: '요청은 들어오지만 느리게 끝난다면 사용자는 이미 문제를 느낍니다. 지연은 체감 품질을 가장 빨리 드러냅니다.',
    active: 1,
    values: [
      { label: '요청 수', value: '2.3k/min', note: '유입은 유지' },
      { label: '지연', value: '820ms', note: '평시보다 상승' },
      { label: '에러율', value: '0.4%', note: '아직 낮음' },
      { label: '알림', value: '관찰', note: '주의 단계' },
    ],
    logs: [
      ['17:01:01', 'P95 응답 시간 상승'],
      ['17:01:02', '병목 구간 추적 시작'],
      ['17:01:03', '알림 임계치 근접'],
    ],
  },
  error: {
    title: '실패 비율 보기 — 에러율',
    summary: '요청과 지연이 유지돼도 실패 응답이 늘면 바로 신뢰가 떨어집니다. 에러율은 장애 감지의 핵심 경보선입니다.',
    active: 2,
    values: [
      { label: '요청 수', value: '2.1k/min', note: '약간 감소' },
      { label: '지연', value: '430ms', note: '중간 수준' },
      { label: '에러율', value: '4.8%', note: '즉시 대응 필요' },
      { label: '알림', value: '발생', note: '임계치 초과' },
    ],
    logs: [
      ['17:02:01', '5xx 비율 급증 감지'],
      ['17:02:02', '최근 배포와 상관관계 확인'],
      ['17:02:03', '롤백 검토 시작'],
    ],
  },
  alert: {
    title: '알려 줄 기준 만들기 — 알림',
    summary: '모든 수치를 계속 눈으로 볼 수는 없기 때문에, 운영팀은 지표가 선을 넘는 순간 자동으로 알려 주는 규칙을 둡니다.',
    active: 3,
    values: [
      { label: '요청 수', value: '2.0k/min', note: '평시 수준' },
      { label: '지연', value: '510ms', note: '주의 구간' },
      { label: '에러율', value: '2.2%', note: '상승 추세' },
      { label: '알림', value: 'Pager', note: '즉시 호출' },
    ],
    logs: [
      ['17:03:01', '복합 조건 알림 규칙 발동'],
      ['17:03:02', '담당자 호출 전송'],
      ['17:03:03', '운영 채널에 이벤트 기록'],
    ],
  },
};

const TONE = getTone(3);

const METAPHOR = [
  { icon: <Icons.FlowIcon />, label: '흐름', sub: '사용' },
  { icon: <Icons.DelayIcon />, label: '지연', sub: '사용' },
  { icon: <Icons.ErrorIcon />, label: '오류', sub: '사용' },
  { icon: <Icons.NotificationIcon />, label: '알림', sub: '사용' },
];

const IT = [
  { icon: <Icons.RequestCountIcon />, label: '요청 수', sub: '사용' },
  { icon: <Icons.LatencyIcon />, label: '지연', sub: '사용' },
  { icon: <Icons.ErrorRateIcon />, label: '에러율', sub: '사용' },
  { icon: <Icons.AlertIcon />, label: '알림', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q06Monitor({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.traffic;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="운영 모니터링" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="관찰 신호 4종"
        itTitle="관측 4 골든 시그널"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">운영 대시보드 스냅샷</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {scene.values.map((item, idx) => {
            const active = scene.active === idx;
            return (
              <div
                key={item.label}
                className="rounded-2xl border p-3 transition"
                style={{
                  borderColor: active ? TONE.accent : 'var(--color-border)',
                  background: active ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
                }}
              >
                <p
                  className="m-0 text-[11px] font-bold"
                  style={{ color: active ? TONE.accent : 'var(--color-text-muted)' }}
                >
                  {item.label}
                </p>
                <p className="mt-2 text-[18px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] leading-[1.5]" style={{ color: 'var(--color-text-muted)' }}>
                  {item.note}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <LogBox logs={scene.logs} variant="blue" title="모니터링 이벤트" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
