import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH13 } from '../../data/vibe-pregen-ch13';
import PregenBlock from './PregenBlock';

// 13장 1문 시연 «누가 정했을까?» — 같은 앱을 두 부탁문으로 실제 생성해 저장한 결과를 비교한다.
// 시나리오 v1 = 규칙 없는 부탁문(규칙 전부 [내가 정함]), v2 = 정책 5줄 부탁문([부탁문] 태그 등장).

const REQUESTS: Record<string, { label: string; text: string; lesson: string }> = {
  v1: {
    label: '민지가 AI에게 보낸 부탁문',
    text: '"우리 반 도서 대출 앱 만들어줘. 학생이 책을 빌리고 반납할 수 있으면 돼."',
    lesson:
      '아래는 이 부탁문으로 실제로 만든 결과입니다(미리 실행해 저장). «앱에 들어간 규칙»을 보세요 — 빨간 «내가 정함»이 몇 개인지 세어 보세요. 민지는 규칙을 하나도 안 정했는데, 앱에는 규칙이 가득합니다.',
  },
  v2: {
    label: '정책 5줄을 추가한 두 번째 부탁문',
    text: '"우리 반 도서 대출 앱 만들어줘. 학생이 책을 빌리고 반납할 수 있으면 돼. 한 명이 1권만 빌릴 수 있어. 반납은 매주 금요일에 다 같이 해. 연체 벌칙은 없어. 이름 대신 출석번호로 입장해. 빌린 기록은 학기 말에 지워."',
    lesson:
      '같은 앱, 부탁문만 바꿨습니다. 이제 초록 «부탁문» 태그가 보이죠 — 민지가 정한 규칙이 그대로 들어갔습니다. 그래도 «내가 정함»이 남아 있는 줄에 주목하세요. 정책을 적어도 못 다 적은 칸은 여전히 AI가 채웁니다.',
  },
};

const SCENARIO_TO_PREGEN: Record<string, string> = {
  v1: 'ch13_q01_v1',
  v2: 'ch13_q01_v2',
};

export default function Q01WhoDecided({ scenarioId }: DemoComponentProps) {
  const key = SCENARIO_TO_PREGEN[scenarioId] ? scenarioId : 'v1';
  const request = REQUESTS[key]!;
  const pregen = VIBE_PREGEN_CH13[SCENARIO_TO_PREGEN[key]!];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">{request.label}</p>
          <p className="mt-1 text-[13px] leading-[1.8] text-[var(--color-text-body)]">{request.text}</p>
        </div>
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">{request.lesson}</p>
        {pregen ? (
          <p className="text-[10.5px] text-[var(--color-text-faint)]">
            실제 실행 기록 · {pregen.model} · {pregen.generatedAt.slice(0, 10)} — 수업 중에는 이 저장본을 재생만 합니다
          </p>
        ) : null}
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3.5 shadow-sm">
        {pregen ? <PregenBlock text={pregen.text} /> : <p className="text-[12.5px]">재료 없음</p>}
      </div>
    </div>
  );
}
