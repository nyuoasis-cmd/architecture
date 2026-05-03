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
  repeat: {
    title: '같은 화면을 계속 복사하면 금방 지친다',
    summary:
      '비슷한 버튼과 카드, 폼을 화면마다 복사해 두면 처음엔 빨라 보여도 수정 지점이 늘어나면서 프론트엔드 유지 비용이 빠르게 커집니다.',
    active: 0,
    lanes: [
      ['비슷한 자재를 매번 다시 자름', '작업 흔적이 여기저기 남음'],
      ['같은 UI 코드 반복', '중복 마크업 증가'],
      ['수정 누락 위험', '속도 저하'],
    ],
    note:
      '반복 코드는 기능보다 관리 비용을 먼저 키웁니다. 한 화면 고친 뒤 비슷한 화면을 또 찾아다녀야 한다면 이미 재사용 포인트가 생긴 상태입니다.',
    logs: [
      ['15:30:01', '동일 버튼 코드 6곳 감지'],
      ['15:30:02', '스타일 수정 범위 확대'],
      ['15:30:03', '중복 제거 후보 표시'],
    ],
  },
  component: {
    title: '부품으로 나누면 다시 조립할 수 있다',
    summary:
      '반복되는 조각을 컴포넌트로 분리하면 구조와 스타일, 동작을 한 번 정리한 뒤 여러 화면에서 같은 기준으로 재사용할 수 있습니다.',
    active: 1,
    lanes: [
      ['자주 쓰는 부품 따로 보관', '필요할 때 조립'],
      ['버튼과 카드 컴포넌트화', 'props로 차이만 전달'],
      ['재사용 증가', '수정 지점 축소'],
    ],
    note:
      '컴포넌트는 단순 복붙 절약을 넘어 팀의 표현 방식을 통일합니다. 같은 역할을 하는 UI를 같은 이름으로 다루기 시작하면 구조 이해도도 함께 좋아집니다.',
    logs: [
      ['15:31:01', 'Button 컴포넌트 분리'],
      ['15:31:02', 'Card props 설계 완료'],
      ['15:31:03', '공통 스타일 재사용 시작'],
    ],
  },
  choice: {
    title: '맞는 부품을 골라 끼워야 흐름이 산다',
    summary:
      '컴포넌트가 많아지면 아무거나 쓰는 대신 상황에 맞는 조합을 고르는 기준이 필요합니다. 재사용은 단순 개수보다 선택 규칙이 중요합니다.',
    active: 2,
    lanes: [
      ['작업 목적에 맞는 부품 선택', '크기와 역할 확인'],
      ['용도별 컴포넌트 매핑', 'variant 선택'],
      ['화면 일관성 확보', '오용 감소'],
    ],
    note:
      '재사용은 많이 만드는 것보다 제대로 고르는 쪽이 더 중요합니다. 선택 기준이 없으면 같은 문제를 여러 방식으로 푸는 새 중복이 생깁니다.',
    logs: [
      ['15:32:01', 'Primary/Secondary variant 정의'],
      ['15:32:02', '폼 전용 입력 컴포넌트 선택'],
      ['15:32:03', '중복 패턴 통합 결정'],
    ],
  },
  team: {
    title: '팀 규칙이 있어야 재사용이 오래 간다',
    summary:
      '컴포넌트 이름과 props, 상태 처리 방식이 제각각이면 부품은 있어도 공유가 어렵습니다. 문서와 리뷰 기준이 함께 있어야 재사용이 팀 자산이 됩니다.',
    active: 3,
    lanes: [
      ['공용 보관함 규칙 정리', '누가 봐도 같은 이름 사용'],
      ['Storybook과 리뷰 룰 적용', '문서와 예시 축적'],
      ['온보딩 단축', '품질 일관성 유지'],
    ],
    note:
      '재사용은 기술만으로 완성되지 않습니다. 팀이 같은 규칙으로 컴포넌트를 만들고 리뷰해야 비로소 새 화면에서도 자연스럽게 이어집니다.',
    logs: [
      ['15:33:01', 'Storybook 예시 추가'],
      ['15:33:02', 'props 네이밍 규칙 합의'],
      ['15:33:03', '리뷰 체크리스트 업데이트'],
    ],
  },
};

const TONE = getTone(5);

const METAPHOR = [
  { icon: <Icons.RepeatMetaIcon />, label: '반복', sub: '같은 코드' },
  { icon: <Icons.PartMetaIcon />, label: '부품', sub: '쪼갠 단위' },
  { icon: <Icons.PickComponentIcon />, label: '선택', sub: '맞는 부품' },
  { icon: <Icons.TeamIcon />, label: '팀', sub: '공유 규칙' },
];

const IT = [
  { icon: <Icons.DryIcon />, label: '반복 줄임', sub: 'DRY' },
  { icon: <Icons.ComponentIcon />, label: '컴포넌트', sub: '재사용 단위' },
  { icon: <Icons.PickItIcon />, label: '선택', sub: '용도 매핑' },
  { icon: <Icons.TeamRuleIcon />, label: '팀 규칙', sub: 'Storybook' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q06ComponentReuse({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.repeat;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="컴포넌트 재사용" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="재사용 4단계"
        itTitle="컴포넌트 패턴"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">재사용 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['작업 장면', '프론트엔드 해석', '팀 효과'];
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

      <LogBox logs={scene.logs} variant="blue" title="재사용 설계 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
