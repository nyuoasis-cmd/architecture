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
  start: {
    title: '처음 들어왔을 때 어떻게 시작하나',
    summary: 'SPA는 초기 번들과 스크립트를 먼저 받아 준비하고, SSR은 서버가 만든 첫 HTML을 바로 보여 줍니다. 첫인상의 속도와 준비 방식이 여기서 갈립니다.',
    active: 0,
    lanes: [
      ['한 번에 준비', '초기 번들 적재'],
      ['브라우저 실행 대기', '클라이언트 주도 시작'],
      ['앱 같은 시작', '첫 로딩 비용 존재'],
    ],
    note: 'SPA의 시작은 준비를 한 번에 몰아서 하는 편이고, SSR의 시작은 첫 화면 노출을 앞당기는 쪽에 가깝습니다.',
    logs: [
      ['15:20:01', 'bundle.js 다운로드 시작'],
      ['15:20:02', 'hydrate 준비'],
      ['15:20:03', '클라이언트 앱 부팅 완료'],
    ],
  },
  move: {
    title: '이후 이동은 내부에서 얼마나 부드러운가',
    summary: 'SPA는 한 번 앱이 떠 있으면 내부 라우팅으로 필요한 부분만 바꾸기 쉽습니다. 전체 페이지를 다시 여는 부담이 적어 앱처럼 움직이는 감각이 강합니다.',
    active: 1,
    lanes: [
      ['자리에서 계속 이동', '화면 일부만 교체'],
      ['클라이언트 라우팅', '상태 유지'],
      ['빠른 전환', '앱 같은 반응'],
    ],
    note: '사용자 체감에서 SPA가 강한 지점은 두 번째 화면부터입니다. 이동이 부드럽고 상태를 이어 가기 좋습니다.',
    logs: [
      ['15:21:01', 'router.push 실행'],
      ['15:21:02', '새 데이터만 요청'],
      ['15:21:03', '전체 새로고침 없이 전환'],
    ],
  },
  respond: {
    title: '서버가 먼저 응답을 그려 주는 방식',
    summary: 'SSR은 요청마다 서버가 HTML을 만들어 보내므로 첫 내용 노출이 빠를 수 있습니다. 검색 엔진과 링크 미리보기에도 유리한 경우가 많습니다.',
    active: 2,
    lanes: [
      ['서버가 매번 준비', 'HTML 완성 후 전달'],
      ['요청마다 렌더', '콘텐츠 즉시 노출'],
      ['첫 화면 강점', '서버 부담 증가'],
    ],
    note: 'SSR은 첫 화면과 공개 콘텐츠에서 특히 강합니다. 대신 서버가 렌더링에 더 자주 참여해야 하므로 운영 복잡도는 커질 수 있습니다.',
    logs: [
      ['15:22:01', '서버 렌더 함수 호출'],
      ['15:22:02', 'HTML 응답 생성'],
      ['15:22:03', '브라우저가 즉시 마크업 표시'],
    ],
  },
  mix: {
    title: '상황에 맞게 섞는 하이브리드 전략',
    summary: '실무에서는 첫 화면은 SSR 계열로 빠르게 보여 주고, 이후 상호작용은 SPA처럼 부드럽게 처리하는 혼합 전략을 자주 씁니다. 핵심은 기술 이름보다 사용자 경험의 균형입니다.',
    active: 3,
    lanes: [
      ['상황별 운영', 'SSR + SPA 혼합'],
      ['ISR/SSG 활용', '중요 구간만 서버 선렌더'],
      ['첫 인상과 이동성 균형', '서비스 목적 최적화'],
    ],
    note: '하이브리드는 절충안이 아니라 목적에 맞는 조합입니다. 공개 페이지와 대시보드, 검색 페이지는 서로 다른 렌더 전략이 더 적합할 수 있습니다.',
    logs: [
      ['15:23:01', 'landing 은 SSR 선택'],
      ['15:23:02', 'dashboard 는 client route 유지'],
      ['15:23:03', '캐시 전략과 함께 혼합 배치'],
    ],
  },
};

const TONE = getTone(5);

const METAPHOR = [
  { icon: <Icons.StartIcon />, label: '시작', sub: '한 번에 준비' },
  { icon: <Icons.MoveIcon />, label: '이동', sub: '내부에서만' },
  { icon: <Icons.RespondIcon />, label: '응답', sub: '서버가 매번' },
  { icon: <Icons.MixIcon />, label: '혼합', sub: '상황별' },
];

const IT = [
  { icon: <Icons.SpaInitIcon />, label: 'SPA 시작', sub: '초기 번들' },
  { icon: <Icons.SpaNavIcon />, label: 'SPA 이동', sub: '클라 라우팅' },
  { icon: <Icons.SsrInitIcon />, label: 'SSR 시작', sub: '서버 렌더' },
  { icon: <Icons.HybridIcon />, label: '혼합 전략', sub: 'ISR/SSG' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q04SpaSsr({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.start;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="SPA vs SSR" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="극장 운영"
        itTitle="SPA vs SSR"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">렌더 전략 비교</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['운영 장면', '웹 해석', '체감 결과'];
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
                <p className="m-0 text-[11px] font-bold" style={{ color: active ? TONE.accent : 'var(--color-text-muted)' }}>
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

      <LogBox logs={scene.logs} variant="blue" title="렌더 전략 로그" />
    </div>
  );
}
