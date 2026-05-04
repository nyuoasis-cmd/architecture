import { Hero, Icons, LogBox, PairFlow, getTone, validatePairSet } from '../_shared';
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
  mixed: {
    title: '주문과 고객 정보를 한 표에 몰아넣으면 중복이 쌓인다',
    summary: '한 테이블에 모든 정보를 넣으면 처음엔 단순해 보이지만, 같은 고객 정보가 주문마다 반복됩니다. 반복은 저장 낭비를 넘어 이후 수정 비용까지 키웁니다.',
    active: 0,
    lanes: [
      ['주문마다 이름 반복', '주소도 행마다 복사'],
      ['한 표에 전부 저장', '중복 컬럼 증가'],
      ['입력은 쉽지만 관리 포인트 증가'],
    ],
    note: '미정규 상태는 빠르게 적어 넣기에는 편하지만, 같은 사실을 여러 번 써야 한다는 구조적 약점을 안고 시작합니다.',
    logs: [
      ['19:10:01', 'orders_all 테이블 분석 시작'],
      ['19:10:02', 'customer_name 중복 84건 감지'],
      ['19:10:03', '분리 후보 컬럼 표시'],
    ],
  },
  split: {
    title: '테이블을 나누면 사실의 원본 위치가 줄어든다',
    summary: '고객 정보는 customers, 주문 정보는 orders로 나누면 같은 사실을 한 곳에서 관리할 수 있습니다. 주문은 고객 ID만 들고 관계로 연결됩니다.',
    active: 1,
    lanes: [
      ['고객표와 주문표 분리', '주문은 고객 ID 참조'],
      ['관계 정리', '중복 컬럼 제거'],
      ['한 곳 수정', '재사용 쉬움'],
    ],
    note: '정규화의 첫 효과는 저장 공간보다 책임 위치를 줄이는 데 있습니다. 무엇을 어디서 고쳐야 하는지가 분명해집니다.',
    logs: [
      ['19:11:01', 'customers 테이블 생성'],
      ['19:11:02', 'orders.customer_id 연결'],
      ['19:11:03', '반복 컬럼 제거 완료'],
    ],
  },
  anomaly: {
    title: '복사된 정보를 따로 고치면 갱신 이상이 생긴다',
    summary: '중복된 고객 주소를 여러 행에서 관리하면 일부만 바뀐 상태가 생깁니다. 같은 고객이 서로 다른 값을 갖는 순간 데이터 신뢰가 흔들립니다.',
    active: 2,
    lanes: [
      ['주소 변경 요청', '주문 행 일부만 수정'],
      ['행마다 값 충돌', '최신 값 불명확'],
      ['갱신 이상 발생', '운영 혼선 확대'],
    ],
    note: '갱신 이상은 정규화가 필요한 가장 실질적인 이유입니다. 문제는 저장량보다 불일치와 재검증 비용입니다.',
    logs: [
      ['19:12:01', '고객 주소 변경 요청 수신'],
      ['19:12:02', '12개 행 중 9개만 반영'],
      ['19:12:03', '불일치 경고 기록'],
    ],
  },
  normal3: {
    title: '3정규형은 사실을 나눠 두고 관계로 읽어 오는 상태다',
    summary: '3정규형은 한 테이블에 억지로 모든 의미를 담지 않고, 필요한 사실을 분리한 뒤 관계로 조합하는 방식입니다. 그래서 쓰기 일관성을 지키기 쉬워집니다.',
    active: 3,
    lanes: [
      ['핵심 사실 분리', '테이블 책임 명확화'],
      ['3NF 구조 유지', '관계로 다시 조합'],
      ['정합성 상승', '쓰기 안정성 확보'],
    ],
    note: '3정규형은 조인을 감수하더라도 한 사실을 한 곳에 두려는 선택입니다. 업무 데이터의 진실을 지키는 기본선으로 자주 쓰입니다.',
    logs: [
      ['19:13:01', '3NF 점검 시작'],
      ['19:13:02', '이행적 종속 제거 확인'],
      ['19:13:03', '정규화 점검 통과'],
    ],
  },
};

const TONE = getTone(7);

const METAPHOR = [
  { icon: <Icons.TableSingleIcon />, label: '한 표', sub: '모든 데이터' },
  { icon: <Icons.SeparateIcon />, label: '분리', sub: '테이블 나눔' },
  { icon: <Icons.AnomalyIcon />, label: '이상', sub: '갱신 위험' },
  { icon: <Icons.NormalFormIcon />, label: '3정규형', sub: '정규화 결과' },
];

const IT = [
  { icon: <Icons.UnnormalizedIcon />, label: '미정규', sub: '중복 多' },
  { icon: <Icons.NormalizeIcon />, label: '분리', sub: '관계 정리' },
  { icon: <Icons.UpdateAnomalyIcon />, label: '갱신 이상', sub: 'update anomaly' },
  { icon: <Icons.ThirdNfIcon />, label: '3NF', sub: 'third normal' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q05Normalization({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.mixed;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="데이터베이스 정규화 흐름" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="정리 감각"
        itTitle="정규화 구조"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">정규화 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['생활 장면', '데이터 구조', '결과 영향'];
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

      <LogBox logs={scene.logs} variant="blue" title="정규화 로그" />
    </div>
  );
}
