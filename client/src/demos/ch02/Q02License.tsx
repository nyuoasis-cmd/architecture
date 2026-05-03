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
  open: {
    title: '자유 사용 — 오픈소스',
    summary: '누구나 읽고 고치고 나눌 수 있는 자유 사용 규칙은 오픈소스 라이선스의 핵심과 가깝습니다.',
    active: 0,
    lanes: [
      ['열어 보고 바꾸기', '함께 나누기'],
      ['소스 공개', '공동 개선'],
      ['자유가 큰 대신 규칙 확인 필요'],
    ],
    note: '오픈소스는 “마음대로 써도 됨”이 아니라, 자유를 주는 대신 어떤 방식으로 공유해야 하는지 조건을 함께 제시합니다.',
    logs: [
      ['10:30:01', '공개 저장소 접근 허용'],
      ['10:30:02', '수정 이력 기록'],
      ['10:30:03', '재배포 규칙 확인'],
    ],
  },
  commercial: {
    title: '구입 후 사용 — 상용',
    summary: '돈을 내고 정해진 범위에서 쓰는 규칙은 상용 소프트웨어 라이선스와 가장 비슷합니다.',
    active: 1,
    lanes: [
      ['결제 후 사용', '계약 범위 확인'],
      ['좌석 수 제한', '기간 제한'],
      ['권한은 넓지 않지만 지원 제공'],
    ],
    note: '상용 라이선스는 기능 사용 권한을 계약으로 정하고, 복제·재배포 같은 행동은 대체로 강하게 제한합니다.',
    logs: [
      ['10:30:04', '구매 키 확인'],
      ['10:30:05', '사용 좌석 수 검증'],
      ['10:30:06', '지원 정책 연결'],
    ],
  },
  gpl: {
    title: '의무 포함 자유 — GPL',
    summary: '자유롭게 쓰되 다시 나눌 때 같은 규칙을 지키라는 의무가 붙는 점이 GPL의 대표 특징입니다.',
    active: 2,
    lanes: [
      ['써도 됨', '고쳐도 됨'],
      ['같이 공개해야 함', '같은 규칙 유지'],
      ['자유와 의무가 동시에 존재'],
    ],
    note: 'GPL은 자유를 주지만, 수정본이나 결합 결과를 배포할 때 같은 라이선스로 공개해야 한다는 의무가 핵심입니다.',
    logs: [
      ['10:30:07', '변경본 생성'],
      ['10:30:08', '배포 조건 재검토'],
      ['10:30:09', '동일 라이선스 유지 확인'],
    ],
  },
  student: {
    title: '학생 전용 혜택 — 학생용',
    summary: '특정 신분에게만 할인 또는 무료를 주는 규칙은 학생용 라이선스와 닮았습니다.',
    active: 3,
    lanes: [
      ['학교 인증', '학습 목적 제한'],
      ['기간 한정', '상업 사용 제한'],
      ['대상은 좁지만 비용 부담 완화'],
    ],
    note: '학생용 라이선스는 교육 목적을 돕기 위해 제공되지만, 상업 사용 금지나 인증 유지 같은 조건이 함께 붙는 경우가 많습니다.',
    logs: [
      ['10:30:10', '학적 인증 요청'],
      ['10:30:11', '교육용 권한 부여'],
      ['10:30:12', '만료일 등록'],
    ],
  },
};

const TONE = getTone(2);

const METAPHOR = [
  { icon: <Icons.FreedomIcon />, label: '자유', sub: '사용' },
  { icon: <Icons.PurchaseIcon />, label: '구입', sub: '사용' },
  { icon: <Icons.DutyIcon />, label: '의무', sub: '사용' },
  { icon: <Icons.StudentIcon />, label: '학생', sub: '사용' },
];

const IT = [
  { icon: <Icons.OpenSourceIcon />, label: '오픈소스', sub: '사용' },
  { icon: <Icons.CommercialIcon />, label: '상용', sub: '사용' },
  { icon: <Icons.GplIcon />, label: 'GPL', sub: '사용' },
  { icon: <Icons.StudentLicenseIcon />, label: '학생용', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q02License({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.open;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="라이선스 성격" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="사용 규칙 비유"
        itTitle="소프트웨어 라이선스"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">조건 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['생활 규칙', '라이선스 규칙', '해석'];
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

      <LogBox logs={scene.logs} variant="blue" title="라이선스 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
