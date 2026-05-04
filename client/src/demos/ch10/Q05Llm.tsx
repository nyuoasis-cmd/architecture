import { Hero, Icons, LogBox, PairFlow, StateChips, getTone, validatePairSet } from '../_shared';
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
  context: {
    title: 'LLM은 먼저 앞에 놓인 문맥을 읽고 지금 어떤 말을 이어야 할지 범위를 좁힌다',
    summary: '대화의 앞문장과 지시를 함께 읽어야 다음 말을 자연스럽게 고를 수 있듯, LLM도 입력 창 안의 문맥을 기준으로 생성 방향을 정합니다.',
    active: 0,
    chips: [
      { label: '입력 창', active: true },
      { label: '앞문장 반영' },
      { label: '질문 해석' },
    ],
    note: '문맥이 비면 답변도 흔들립니다. 그래서 같은 모델이라도 어떤 지시와 예시를 앞에 두었는지가 결과를 크게 바꿉니다.',
    logs: [
      ['11:20:01', 'system 지시와 사용자 질문 읽기'],
      ['11:20:02', '입력 window 안에서 관련 단서 추출'],
      ['11:20:03', '다음 토큰 후보 분포 준비'],
    ],
  },
  predict: {
    title: '생성의 한 걸음은 항상 다음 토큰을 무엇으로 둘지 고르는 예측이다',
    summary: '문장을 한 번에 통째로 꺼내는 것이 아니라, 바로 다음에 올 글자를 고르듯 한 토큰씩 이어 붙이며 답을 만듭니다.',
    active: 1,
    chips: [
      { label: '다음 후보', active: true },
      { label: '확률 분포' },
      { label: '한 칸 전진' },
    ],
    note: 'LLM의 핵심은 정답 검색보다 확률 예측입니다. 지금까지 나온 문맥을 바탕으로 가장 그럴듯한 다음 토큰을 계속 선택합니다.',
    logs: [
      ['11:21:01', '후보 토큰 점수 계산'],
      ['11:21:02', '가장 적절한 다음 토큰 선택'],
      ['11:21:03', '문장 상태를 갱신하고 다음 단계 준비'],
    ],
  },
  repeat: {
    title: '한 번의 예측으로 끝나지 않고, 같은 과정을 여러 번 반복해 문장이 길어진다',
    summary: '한 단어를 고른 뒤 그 결과를 다시 문맥에 붙여 다음 단어를 고르듯, 생성은 반복 루프 속에서 점차 완성됩니다.',
    active: 2,
    chips: [
      { label: '토큰 누적', active: true },
      { label: '문장 확장' },
      { label: '반복 루프' },
    ],
    note: '토큰이 하나 추가될 때마다 다음 판단 기준도 바뀝니다. 그래서 생성은 한 번의 판단이 아니라 짧은 예측의 연속입니다.',
    logs: [
      ['11:22:01', '선택된 토큰을 응답 버퍼에 추가'],
      ['11:22:02', '업데이트된 문맥으로 다음 토큰 재예측'],
      ['11:22:03', '종료 조건까지 반복 생성'],
    ],
  },
  limit: {
    title: '그럴듯한 문장을 만들 수 있어도 사실 검증까지 자동으로 끝나는 것은 아니다',
    summary: '말이 자연스럽다고 항상 맞는 말은 아니듯, LLM은 표현은 유창해도 근거가 약하거나 없는 내용을 낼 수 있어 검증이 필요합니다.',
    active: 3,
    chips: [
      { label: '그럴듯함', active: true },
      { label: '근거 확인' },
      { label: '사실 검증' },
    ],
    note: 'LLM은 다음 토큰을 잘 잇는 모델이지, 세계의 사실을 스스로 보증하는 장치가 아닙니다. 중요한 답은 반드시 별도 검증이 따라야 합니다.',
    logs: [
      ['11:23:01', '자연스러운 문장 생성 완료'],
      ['11:23:02', '근거 출처 없음 경고 필요'],
      ['11:23:03', '사용자 검증 단계로 전달'],
    ],
  },
};

const TONE = getTone(10);

const METAPHOR = [
  { icon: <Icons.ContextIcon />, label: '문맥', sub: '입력 흐름' },
  { icon: <Icons.PredictIcon />, label: '예측', sub: '다음 단어' },
  { icon: <Icons.LoopIconLlm />, label: '반복', sub: '여러 번 생성' },
  { icon: <Icons.LimitIcon />, label: '한계', sub: '검증 필요' },
];

const IT = [
  { icon: <Icons.ContextItIcon />, label: '문맥', sub: 'input window' },
  { icon: <Icons.NextTokenIcon />, label: '다음 토큰', sub: 'next token' },
  { icon: <Icons.RepeatGenIcon />, label: '반복 생성', sub: 'iterative' },
  { icon: <Icons.VerifyLimitIcon />, label: '검증 한계', sub: 'hallucination' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q05Llm({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.context;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="LLM 생성 흐름" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="문장 이어 쓰기 비유"
        itTitle="LLM 생성 원리"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="이해 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="navy" title="생성 단계 로그" />
    </div>
  );
}
