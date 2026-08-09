import { useEffect, useState } from 'react';
import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH13 } from '../../data/vibe-pregen-ch13';
import PregenBlock from './PregenBlock';

// 13장 6문 시연 — AI가 실제로 써 준 기획서(저장본)를 세 칸 검사표로 훑는다.
// 학생이 검사 버튼을 누르면, 그 칸에 해당하는 내용이 기획서에 몇 곳 있는지 판정이 열린다.

const PROBES = [
  {
    key: 'policy',
    label: '정책(규칙)이 있나?',
    verdict:
      '0곳 — 하루에 몇 개까지 보낼 수 있는지, 자기 자신에게 보내도 되는지, 같은 친구에게 몰아줘도 되는지… 규칙이 한 줄도 없습니다.',
  },
  {
    key: 'edge',
    label: '예외의 각본이 있나?',
    verdict: '0곳 — 칭찬 이유를 비워서 보내면? 욕설을 적어 보내면? 잘못 보낸 스티커는 취소되나? 각본이 없습니다.',
  },
  {
    key: 'data',
    label: '데이터 이야기가 있나?',
    verdict:
      '0곳 — 누가 누구에게 보냈는지 어디에 저장되는지, 학기가 끝나면 지워지는지… 저장과 삭제 이야기가 없습니다.',
  },
] as const;

export default function Q06PlanGaps(_props: DemoComponentProps) {
  const pregen = VIBE_PREGEN_CH13.ch13_q06_plan;
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpened({});
  }, []);

  const openedCount = PROBES.filter((probe) => opened[probe.key]).length;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">부탁문</p>
          <p className="mt-1 text-[13px] leading-[1.8] text-[var(--color-text-body)]">
            "우리 반 칭찬 스티커 앱 기획서를 써 줘."
          </p>
        </div>
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          오른쪽이 AI가 실제로 써 준 기획서입니다(미리 실행해 저장). 신나 보이죠? 이제 세 칸 검사표를 하나씩 눌러
          보세요.
        </p>
        <div className="space-y-2">
          {PROBES.map((probe) => {
            const isOpen = Boolean(opened[probe.key]);
            return (
              <div key={probe.key}>
                <button
                  className={`w-full rounded-lg border px-3.5 py-2 text-left text-[13px] font-medium ${
                    isOpen
                      ? 'border-rose-200 bg-rose-50 text-rose-800'
                      : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]'
                  }`}
                  onClick={() => setOpened((prev) => ({ ...prev, [probe.key]: true }))}
                  type="button"
                >
                  {isOpen ? `⚠ ${probe.verdict}` : `🔍 ${probe.label}`}
                </button>
              </div>
            );
          })}
        </div>
        {openedCount === PROBES.length ? (
          <p className="rounded-lg bg-[#C9E0D4] px-3.5 py-2.5 text-[12.5px] font-medium leading-[1.8] text-[#2d4a3e]">
            세 칸이 전부 비어 있습니다. 실망할 일이 아니라 <b>내 차례가 왔다는 신호</b>예요 — 세 칸은 우리 교실을 아는
            사람만 채울 수 있는 칸이니까요.
          </p>
        ) : null}
        {pregen ? (
          <p className="text-[10.5px] text-[var(--color-text-faint)]">
            실제 실행 기록 · {pregen.model} · {pregen.generatedAt.slice(0, 10)}
          </p>
        ) : null}
      </div>
      <div className="max-h-[480px] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-white px-4 py-3.5 shadow-sm">
        {pregen ? <PregenBlock text={pregen.text} /> : <p className="text-[12.5px]">재료 없음</p>}
      </div>
    </div>
  );
}
