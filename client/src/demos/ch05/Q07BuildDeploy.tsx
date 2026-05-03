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
  dev: {
    title: '개발 중에는 바로 보이는 속도가 중요하다',
    summary:
      '개발 단계에서는 화면을 저장하자마자 다시 확인할 수 있어야 생각의 흐름이 끊기지 않습니다. 그래서 개발 서버는 빠른 재실행과 즉시 반영에 집중합니다.',
    active: 0,
    lanes: [
      ['시제품을 바로 꺼내 봄', '수정 후 즉시 비교'],
      ['개발 서버 구동', 'HMR로 빠른 반영'],
      ['실험 속도 상승', '피드백 즉시 확인'],
    ],
    note:
      '빌드 도구의 첫 역할은 배포가 아니라 개발 리듬을 지키는 것입니다. 저장 직후 결과가 보여야 작은 수정도 계속 이어갈 수 있습니다.',
    logs: [
      ['15:40:01', 'Vite dev server 시작'],
      ['15:40:02', 'Button.tsx 변경 감지'],
      ['15:40:03', 'HMR 패치 적용 완료'],
    ],
  },
  bundle: {
    title: '배포 전에는 흩어진 파일을 한 흐름으로 묶는다',
    summary:
      '개발 중에는 파일이 나뉘어 있어도 되지만, 서비스로 내보낼 때는 브라우저가 읽기 좋은 단위로 정리해야 합니다. 이때 번들링이 여러 자원을 연결합니다.',
    active: 1,
    lanes: [
      ['부품을 상자별로 포장', '배송 순서 맞춤'],
      ['JS/CSS 의존성 그래프 정리', '엔트리 기준 묶음 생성'],
      ['전송 단순화', '실행 준비 완료'],
    ],
    note:
      '번들링은 파일을 무조건 하나로 합치는 작업이 아닙니다. 무엇이 함께 로드돼야 하는지 계산해 브라우저가 이해하기 쉬운 묶음으로 재구성하는 과정입니다.',
    logs: [
      ['15:41:01', 'entry graph 분석 시작'],
      ['15:41:02', 'vendor chunk 분리'],
      ['15:41:03', '번들 출력물 생성 완료'],
    ],
  },
  optimize: {
    title: '실서비스용으로 더 가볍고 빠르게 다듬는다',
    summary:
      '개발 편의성을 위한 정보는 운영 번들에서 줄이고, 캐시와 분할을 고려해 더 빨리 내려받을 수 있게 다듬어야 실제 사용자 경험이 좋아집니다.',
    active: 2,
    lanes: [
      ['불필요한 포장 제거', '무게와 동선 정리'],
      ['minify와 split 적용', '캐시 가능한 자산 분리'],
      ['초기 로드 개선', '네트워크 비용 절감'],
    ],
    note:
      '최적화는 단순 압축보다 전달 전략에 가깝습니다. 어떤 코드를 지금 보내고, 어떤 코드를 나중에 부를지 정하는 것이 체감 성능을 크게 바꿉니다.',
    logs: [
      ['15:42:01', 'tree shaking 결과 반영'],
      ['15:42:02', 'dynamic import chunk 분리'],
      ['15:42:03', 'minify 크기 38% 감소'],
    ],
  },
  ship: {
    title: '마지막에는 어디에 올릴지까지 정리해야 끝난다',
    summary:
      '번들이 만들어졌다고 바로 서비스가 되는 것은 아닙니다. CDN이나 서버에 어떤 자산을 어디서 제공할지, 캐시와 경로를 어떻게 둘지까지 맞춰야 배포 준비가 완료됩니다.',
    active: 3,
    lanes: [
      ['출고 전 라벨과 경로 확인', '보낼 위치 결정'],
      ['정적 자산 업로드', 'CDN/Server 배치'],
      ['서비스 오픈 준비', '배포 리스크 감소'],
    ],
    note:
      '배포 준비는 빌드 산출물을 운영 환경과 연결하는 마지막 정리입니다. 경로와 캐시 정책을 잘못 두면 좋은 번들도 실제 서비스에서 힘을 못 씁니다.',
    logs: [
      ['15:43:01', 'dist 자산 업로드 시작'],
      ['15:43:02', 'CDN 캐시 헤더 점검'],
      ['15:43:03', '운영 배포 체크리스트 통과'],
    ],
  },
};

const TONE = getTone(5);

const METAPHOR = [
  { icon: <Icons.DevMetaIcon />, label: '개발', sub: '코딩' },
  { icon: <Icons.BundleMetaIcon />, label: '묶기', sub: '하나로' },
  { icon: <Icons.OptimizeIcon />, label: '최적화', sub: '빠르게' },
  { icon: <Icons.DeployMetaIcon />, label: '배포', sub: '서비스로' },
];

const IT = [
  { icon: <Icons.DevServerIcon />, label: '개발 dev', sub: 'HMR' },
  { icon: <Icons.BundleItIcon />, label: '번들', sub: 'Vite/Webpack' },
  { icon: <Icons.OptimizeItIcon />, label: '최적화', sub: 'minify/split' },
  { icon: <Icons.DeployItIcon />, label: '배포 준비', sub: 'CDN/Server' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q07BuildDeploy({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.dev;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="빌드와 배포" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="제품 출시 흐름"
        itTitle="빌드 & 배포"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">출시 단계 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['출시 장면', '빌드 해석', '운영 효과'];
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

      <LogBox logs={scene.logs} variant="blue" title="빌드 파이프라인 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
