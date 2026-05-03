import { Hero, Icons, LogBox, PairVertical, StateChips, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  chips: string[];
  hot: number;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  iaas: {
    title: '직접 조립 — IaaS',
    summary: '기본 장비만 빌리고 나머지는 직접 꾸리는 방식은 IaaS처럼 자유도가 높지만 손이 많이 갑니다.',
    active: 0,
    chips: ['서버 선택', 'OS 설치', '직접 설정'],
    hot: 0,
    logs: [
      ['14:10:01', '가상 서버 생성'],
      ['14:10:02', '운영체제 직접 설치'],
      ['14:10:03', '네트워크 규칙 구성'],
    ],
  },
  paas: {
    title: '기반 빌리기 — PaaS',
    summary: '기초 공구와 작업대가 이미 준비된 환경을 빌리면, 사용자는 서비스 코드에 더 집중할 수 있습니다.',
    active: 1,
    chips: ['런타임 제공', '배포 버튼', '운영 단순화'],
    hot: 1,
    logs: [
      ['14:10:04', '플랫폼 템플릿 선택'],
      ['14:10:05', '코드 배포 시작'],
      ['14:10:06', '실행 환경 자동 구성'],
    ],
  },
  saas: {
    title: '완제품 사용 — SaaS',
    summary: '완성된 앱을 바로 켜서 쓰는 방식은 SaaS와 같아서 가장 빠르게 시작할 수 있습니다.',
    active: 2,
    chips: ['로그인', '기능 사용', '업데이트 자동 반영'],
    hot: 2,
    logs: [
      ['14:10:07', '서비스 계정 로그인'],
      ['14:10:08', '기능 즉시 사용'],
      ['14:10:09', '운영사 업데이트 적용'],
    ],
  },
  subscription: {
    title: '구독 유지 — 구독',
    summary: '한 번 사서 끝나는 것이 아니라 계속 비용을 내며 최신 상태를 유지하는 점이 클라우드 구독 모델의 특징입니다.',
    active: 3,
    chips: ['월 사용료', '자동 갱신', '사용량 확인'],
    hot: 1,
    logs: [
      ['14:10:10', '요금제 갱신'],
      ['14:10:11', '사용량 집계'],
      ['14:10:12', '계정 유지 완료'],
    ],
  },
};

const TONE = getTone(2);

const METAPHOR = [
  { icon: <Icons.HandIcon />, label: '직접', sub: '사용' },
  { icon: <Icons.RentIcon />, label: '빌리기', sub: '사용' },
  { icon: <Icons.CompleteIcon />, label: '완성', sub: '사용' },
  { icon: <Icons.SubscribeIcon />, label: '구독', sub: '사용' },
];

const IT = [
  { icon: <Icons.IaasIcon />, label: 'IaaS', sub: '사용' },
  { icon: <Icons.PaasIcon />, label: 'PaaS', sub: '사용' },
  { icon: <Icons.SaasIcon />, label: 'SaaS', sub: '사용' },
  { icon: <Icons.SubscriptionIcon />, label: '구독', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' });

export default function Q04Cloud({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.iaas;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="클라우드 제공 형태" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairVertical
        metaphorTitle="서비스 이용 방식"
        itTitle="클라우드 모델"
        pairs={METAPHOR.map((metaphor, index) => ({ metaphor, it: IT[index] }))}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        items={scene.chips.map((chip, idx) => ({
          label: chip,
          active: scene.hot === idx,
          color: scene.hot === idx ? 'var(--demo-chip-hot-purple-fg)' : undefined,
        }))}
        tone={TONE}
      />

      <LogBox logs={scene.logs} variant="stone" title="클라우드 로그" lineTimeColor="var(--demo-log-time-purple)" />
    </div>
  );
}
