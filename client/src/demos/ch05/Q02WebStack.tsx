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
  skeleton: {
    title: '웹의 뼈대를 세우기',
    summary: 'HTML은 화면에 무엇이 있는지 구조를 먼저 세웁니다. 제목과 버튼, 입력칸 같은 요소의 자리를 잡아 주는 단계입니다.',
    active: 0,
    lanes: [
      ['방과 복도 배치', '문 위치 정하기'],
      ['제목, 본문, 버튼', 'DOM 구조 생성'],
      ['콘텐츠 순서 명확', '접근성 기반 형성'],
    ],
    note: '구조가 먼저 잡혀야 꾸밈과 동작도 안정적으로 붙습니다. HTML은 화려함보다 의미 있는 뼈대를 만드는 역할에 가깝습니다.',
    logs: [
      ['15:10:01', 'section/header/button 구조 생성'],
      ['15:10:02', '문서 의미 태그 배치 완료'],
      ['15:10:03', '브라우저가 DOM 골격 구성'],
    ],
  },
  shape: {
    title: '같은 구조를 다른 분위기로 꾸미기',
    summary: 'CSS는 이미 세워진 구조를 어떤 색과 간격, 배치로 보여 줄지 정합니다. 같은 HTML이라도 CSS에 따라 전혀 다른 화면 경험이 됩니다.',
    active: 1,
    lanes: [
      ['벽지와 가구 선택', '여백 맞추기'],
      ['색상과 폰트', '레이아웃 정렬'],
      ['가독성 향상', '반응형 화면 구성'],
    ],
    note: 'CSS는 내용 자체를 바꾸지 않으면서 보이는 감각을 크게 바꿉니다. 그래서 구조와 스타일을 나누면 화면 실험이 쉬워집니다.',
    logs: [
      ['15:11:01', '카드 간격 토큰 적용'],
      ['15:11:02', '모바일 브레이크포인트 반영'],
      ['15:11:03', 'hover 상태 스타일 완성'],
    ],
  },
  react: {
    title: '사용자 행동에 반응 붙이기',
    summary: 'JavaScript는 클릭, 입력, 데이터 응답 같은 사건에 맞춰 화면이 다시 움직이도록 만듭니다. 정적인 문서를 도구처럼 바꾸는 단계입니다.',
    active: 2,
    lanes: [
      ['스위치 누르기', '문 열기'],
      ['이벤트 처리', '상태 변경'],
      ['화면 재반영', '사용자 반응 강화'],
    ],
    note: 'JavaScript의 핵심은 화면을 살아 움직이게 만드는 것입니다. 서버 응답과 사용자 입력을 연결하면서 웹을 앱처럼 느끼게 합니다.',
    logs: [
      ['15:12:01', 'click handler 등록'],
      ['15:12:02', '상태 값 업데이트'],
      ['15:12:03', '목록 UI 재렌더 완료'],
    ],
  },
  unite: {
    title: '셋이 합쳐져 하나의 웹페이지가 되기',
    summary: 'HTML, CSS, JavaScript는 각자 역할이 다르지만 브라우저 안에서 함께 작동합니다. 구조와 모양, 반응이 모두 있어야 비로소 완성된 웹 경험이 됩니다.',
    active: 3,
    lanes: [
      ['골조 + 인테리어 + 장치'],
      ['HTML + CSS + JS', '브라우저 렌더'],
      ['완성된 상호작용', '사용자 경험 형성'],
    ],
    note: '세 기술은 경쟁 관계가 아니라 협업 관계입니다. 역할을 분리해 이해하면 프론트엔드 문제를 더 정확히 진단할 수 있습니다.',
    logs: [
      ['15:13:01', 'DOM/CSSOM 결합'],
      ['15:13:02', '스크립트 이벤트 활성화'],
      ['15:13:03', '인터랙션 가능한 화면 출력'],
    ],
  },
};

const TONE = getTone(5);

const METAPHOR = [
  { icon: <Icons.SkeletonIcon />, label: '뼈대', sub: '구조' },
  { icon: <Icons.ShapeIcon />, label: '모양', sub: '꾸미기' },
  { icon: <Icons.ReactIcon />, label: '반응', sub: '동작' },
  { icon: <Icons.UniteIcon />, label: '합체', sub: '함께 동작' },
];

const IT = [
  { icon: <Icons.HtmlIcon />, label: '구조 HTML', sub: '마크업' },
  { icon: <Icons.CssIcon />, label: '스타일 CSS', sub: '꾸미기' },
  { icon: <Icons.JsIcon />, label: '동작 JS', sub: '인터랙션' },
  { icon: <Icons.IntegrationItIcon />, label: '통합', sub: '브라우저 렌더' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q02WebStack({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.skeleton;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="웹 3대장" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="집 짓기"
        itTitle="웹 3대장"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">역할 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['비유 장면', '웹 역할', '만들어지는 효과'];
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

      <LogBox logs={scene.logs} variant="blue" title="브라우저 조립 로그" />
    </div>
  );
}
