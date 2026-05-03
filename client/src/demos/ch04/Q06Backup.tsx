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
  backup: {
    title: '먼저 사본을 남기기 — 백업',
    summary: '장애를 대비하려면 사고가 나기 전에 데이터를 다른 위치에 복제해 둬야 합니다. 백업은 복구 전략의 출발점입니다.',
    active: 0,
    lanes: [
      ['운영 DB 복제', '별도 저장소 보관'],
      ['스냅샷 또는 dump 생성', '주기 정책 설정'],
      ['복구 재료 확보'],
    ],
    note: '백업이 없으면 나머지 지표는 의미가 약해집니다. 먼저 사본을 안전하게 남긴 뒤, 얼마나 자주 만들지와 어디에 둘지를 정해야 합니다.',
    logs: [
      ['16:00:01', '일일 스냅샷 시작'],
      ['16:00:02', '원격 저장소 업로드'],
      ['16:00:03', '백업 검증 완료'],
    ],
  },
  rpo: {
    title: '얼마까지 잃어도 되는가 — RPO',
    summary: 'RPO는 장애가 났을 때 최근 얼마만큼의 데이터를 잃어도 되는지 정하는 기준입니다. 백업 간격이 길수록 허용 손실도 커집니다.',
    active: 1,
    lanes: [
      ['마지막 백업 시점', '지금과의 간격 계산'],
      ['허용 손실 시간 정의', '백업 주기 조정'],
      ['손실 범위 합의'],
    ],
    note: 'RPO는 기술보다 사업 우선순위와 연결됩니다. 몇 분 손실도 큰 서비스라면 복제 주기를 짧게 가져가야 합니다.',
    logs: [
      ['16:01:01', '백업 시점 T-10m 확인'],
      ['16:01:02', '허용 손실 임계치 비교'],
      ['16:01:03', '주기 단축 필요 알림'],
    ],
  },
  rto: {
    title: '얼마나 빨리 다시 열 것인가 — RTO',
    summary: 'RTO는 사고 뒤 서비스를 다시 열기까지 허용되는 시간을 뜻합니다. 복구 절차가 복잡할수록 RTO가 길어집니다.',
    active: 2,
    lanes: [
      ['대체 서버 준비', '복원 절차 실행'],
      ['복구 시간 목표 설정', '절차 자동화'],
      ['중단 시간 관리'],
    ],
    note: 'RTO는 복구 속도에 대한 약속입니다. 같은 백업이 있어도 복원 자동화 수준에 따라 실제 서비스 재개 시간은 크게 달라집니다.',
    logs: [
      ['16:02:01', '복구 대상 서버 기동'],
      ['16:02:02', '스냅샷 restore 진행'],
      ['16:02:03', '서비스 재개 시간 기록'],
    ],
  },
  drill: {
    title: '실제로 해 보며 검증하기 — 복구 훈련',
    summary: '문서만 있는 계획은 사고 때 자주 무너집니다. 정기 훈련을 해야 백업 파일과 절차, 사람의 역할이 모두 실제로 작동하는지 확인할 수 있습니다.',
    active: 3,
    lanes: [
      ['복구 절차 리허설', '역할별 체크'],
      ['RPO/RTO 실측', '병목 수정'],
      ['문서와 현실 일치'],
    ],
    note: '훈련은 지표를 숫자에서 행동으로 바꿉니다. 연습 없이 세운 DR 계획은 실제 장애에서 가장 먼저 흔들리는 경우가 많습니다.',
    logs: [
      ['16:03:01', '분기 DR 리허설 시작'],
      ['16:03:02', '복구 시간 실측 수집'],
      ['16:03:03', '절차 보완 항목 기록'],
    ],
  },
};

const TONE = getTone(4);

const METAPHOR = [
  { icon: <Icons.BackupMetaIcon />, label: '백업', sub: '미리 복제' },
  { icon: <Icons.LossIcon />, label: '손실', sub: '얼마까지' },
  { icon: <Icons.RecoverIcon />, label: '복구', sub: '얼마나 빨리' },
  { icon: <Icons.DrillIcon />, label: '훈련', sub: '주기적 검증' },
];

const IT = [
  { icon: <Icons.BackupItIcon />, label: '백업', sub: '데이터 사본' },
  { icon: <Icons.RpoIcon />, label: 'RPO', sub: '허용 손실 시간' },
  { icon: <Icons.RtoIcon />, label: 'RTO', sub: '허용 복구 시간' },
  { icon: <Icons.DrillItIcon />, label: '훈련', sub: 'DR 리허설' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q06Backup({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.backup;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="재해 복구 기준" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="재해 대비 4단계"
        itTitle="복구 지표"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">장애 대비 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['운영 장면', '복구 해석', '조직 효과'];
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

      <LogBox logs={scene.logs} variant="blue" title="복구 계획 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
