import { Hero, Icons, LogBox, PairMatch, StateChips, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  chips: Array<{ label: string; active?: boolean }>;
  note: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  percall: {
    title: '요청을 보낼 때마다 드는 기본 호출 비용은 사용 횟수와 함께 커진다',
    summary: '계산대에서 물건을 올릴 때마다 기본 처리 손이 가듯, API도 호출 자체가 많아지면 고정성 비용이 누적됩니다.',
    active: 0,
    chips: [
      { label: '요청 횟수', active: true },
      { label: '호출 단위' },
      { label: '반복 비용' },
    ],
    note: '호출 수가 많아지면 작은 요청도 합쳐서 큰 비용이 됩니다. 그래서 기능 설계 단계부터 불필요한 왕복을 줄이는 것이 중요합니다.',
    logs: [
      ['13:05:01', '요청 1건 접수'],
      ['13:05:02', '호출 단가 적용'],
      ['13:05:03', '일일 호출 수 집계 갱신'],
    ],
  },
  pertoken: {
    title: '입력과 출력이 길수록 토큰당 비용도 함께 증가한다',
    summary: '장문의 주문서를 읽고 긴 답을 적을수록 시간이 더 들듯, LLM 비용은 토큰 양에 비례해 커집니다.',
    active: 1,
    chips: [
      { label: '입력 길이', active: true },
      { label: '출력 길이' },
      { label: '분량 관리' },
    ],
    note: '비슷한 기능이라도 프롬프트와 응답을 짧게 다듬으면 비용 차이가 크게 납니다. 토큰은 곧 처리량이자 비용입니다.',
    logs: [
      ['13:06:01', 'input token 1450개 계산'],
      ['13:06:02', 'output token 예상치 반영'],
      ['13:06:03', '토큰 기준 비용 누적'],
    ],
  },
  cache: {
    title: '반복해서 쓰는 긴 앞부분은 캐시에 올려 두면 다시 계산하는 비용을 줄일 수 있다',
    summary: '자주 꺼내는 안내문을 매번 새로 쓰지 않듯, prompt cache는 반복되는 prefix를 재사용해 입력 비용을 절감합니다.',
    active: 2,
    chips: [
      { label: '캐시 재사용', active: true },
      { label: '중복 감소' },
      { label: '비용 절감' },
    ],
    note: '시스템 프롬프트나 챕터 컨텍스트처럼 반복되는 긴 입력은 캐시 효과가 큽니다. 같은 앞부분을 다시 쓰는 서비스일수록 절감 폭이 커집니다.',
    logs: [
      ['13:07:01', 'system prefix cache hit'],
      ['13:07:02', '재전송 토큰 수 감소'],
      ['13:07:03', '입력 비용 절감 반영'],
    ],
  },
  batch: {
    title: '여러 건을 한 번에 묶어 처리하면 배치 단가로 평균 비용을 더 낮출 수 있다',
    summary: '낱개 배송보다 묶음 배송이 효율적이듯, batch API는 많은 요청을 모아 실행해 단가를 줄이는 전략입니다.',
    active: 3,
    chips: [
      { label: '묶음 처리', active: true },
      { label: '지연 허용' },
      { label: '평균 단가' },
    ],
    note: '실시간성이 덜 중요한 작업은 배치가 유리합니다. 다만 기다렸다 모으는 시간이 생기므로 즉시 응답이 필요한 기능과는 분리해야 합니다.',
    logs: [
      ['13:08:01', '야간 작업 120건 배치 큐 적재'],
      ['13:08:02', '묶음 실행 요청 전송'],
      ['13:08:03', '배치 할인 단가 적용'],
    ],
  },
};

const TONE = getTone(10);

const METAPHOR = [
  { icon: <Icons.CallIcon />, label: '호출', sub: '요청 횟수' },
  { icon: <Icons.TokenMetaIcon />, label: '토큰', sub: '글자 분량' },
  { icon: <Icons.CacheCostIcon />, label: '캐시', sub: '재사용' },
  { icon: <Icons.BatchIcon />, label: '배치', sub: '한 번에' },
];

const IT = [
  { icon: <Icons.CallCostIcon />, label: '호출당', sub: 'per request' },
  { icon: <Icons.TokenCostIcon />, label: '토큰당', sub: 'per token' },
  { icon: <Icons.CacheSaveIcon />, label: '캐시 절감', sub: 'prompt cache' },
  { icon: <Icons.BatchSaveIcon />, label: '배치 절감', sub: 'batch API' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q06Cost({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.percall;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="AI 비용 구조" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="계산대 비유"
        itTitle="비용 최적화 포인트"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="비용 판단 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="blue" title="과금 로그" />
    </div>
  );
}
