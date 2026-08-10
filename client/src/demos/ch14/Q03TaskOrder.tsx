import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 14장 3문 시연 — 설계에서 쪼개 나온 작업 카드 6장을 «만들 수 있는 순서»로 세운다.
// 🔑 정답 순서를 외우는 데모가 아니다. 규칙은 하나뿐 —
//    "이 작업이 끝났는지 눈으로 확인하려면, 먼저 있어야 하는 것이 무엇인가."
//    앞이 없으면 만들 수는 있어도 «확인»할 수 없고, 확인 못 한 작업은 끝난 게 아니다.

type Task = {
  id: string;
  text: string;
  /** 이 작업을 눌러 확인하려면 먼저 끝나 있어야 하는 작업 */
  needs: string[];
  why: string;
};

const TASKS: Task[] = [
  { id: 'shell', text: '화면 뼈대 만들기', needs: [], why: '아무것도 없어도 시작할 수 있는 유일한 작업이야.' },
  { id: 'list', text: '책 목록 보여주기', needs: ['shell'], why: '목록을 띄울 화면이 없으면 나온 걸 볼 수가 없어.' },
  { id: 'borrow', text: '대출 버튼 만들기', needs: ['list'], why: '빌릴 책이 화면에 없으면 버튼을 누를 대상이 없어.' },
  { id: 'return', text: '반납 버튼 만들기', needs: ['borrow'], why: '빌린 기록이 있어야 반납이 됐는지 확인할 수 있어.' },
  { id: 'who', text: '누가 빌렸는지 현황 보기', needs: ['borrow'], why: '대출 기록이 하나도 없으면 현황판이 늘 비어 있어.' },
  { id: 'search', text: '책 검색하기', needs: ['list'], why: '찾을 목록이 먼저 있어야 검색 결과가 맞는지 알 수 있어.' },
];

// 학생이 마주하는 첫 화면은 «AI가 뱉은 대로»의 뒤섞인 순서다.
const INITIAL_ORDER = ['search', 'return', 'shell', 'who', 'list', 'borrow'];

function taskOf(id: string): Task {
  return TASKS.find((task) => task.id === id) as Task;
}

export default function Q03TaskOrder(_props: DemoComponentProps) {
  const [order, setOrder] = useState<string[]>(INITIAL_ORDER);
  const [checked, setChecked] = useState(false);

  const move = (idx: number, delta: number) => {
    const next = idx + delta;
    if (next < 0 || next >= order.length) return;
    const copy = [...order];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    setOrder(copy);
    setChecked(false);
  };

  const problems = order.flatMap((id, idx) => {
    const task = taskOf(id);
    return task.needs
      .filter((needId) => order.indexOf(needId) > idx)
      .map((needId) => ({
        id,
        text: `${idx + 1}번 «${task.text}»는 «${taskOf(needId).text}»보다 앞에 있어요 — ${task.why}`,
      }));
  });
  const blockedIds = new Set(problems.map((problem) => problem.id));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          설계가 승인돼서 작업 카드 6장이 나왔습니다. 그런데 나온 순서 그대로 시키면 곤란해요. 기준은 하나입니다 —{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">
            "하나 끝날 때마다 내가 눌러서 확인할 수 있는가."
          </b>{' '}
          ▲▼로 순서를 바꿔 보세요.
        </p>
      </div>

      <div className="space-y-2">
        {order.map((id, idx) => {
          const task = taskOf(id);
          const bad = checked && blockedIds.has(id);
          return (
            <div
              key={id}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 ${
                bad ? 'border-rose-300 bg-rose-50' : 'border-[var(--color-border)] bg-white'
              }`}
            >
              <p className="text-[13px] text-[var(--color-text-primary)]">
                <span
                  className={`mr-2 inline-block min-w-[1.4rem] rounded-md px-1.5 py-0.5 text-center text-[11.5px] font-bold tabular-nums ${
                    bad ? 'bg-rose-200 text-rose-800' : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {idx + 1}
                </span>
                {task.text}
              </p>
              <div className="flex gap-1.5">
                <button
                  className="rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)] disabled:opacity-35"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  type="button"
                  aria-label={`${task.text} 위로`}
                >
                  ▲
                </button>
                <button
                  className="rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)] disabled:opacity-35"
                  disabled={idx === order.length - 1}
                  onClick={() => move(idx, 1)}
                  type="button"
                  aria-label={`${task.text} 아래로`}
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {checked ? (
        problems.length === 0 ? (
          <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
            <p>
              <b className="font-semibold">이 순서면 하나씩 눌러 확인하며 갈 수 있습니다.</b> 이제 이 목록이 부탁문이
              됩니다 — "1번부터 하나씩 해 줘. 하나 끝나면 멈추고 알려 줘."
            </p>
            <p>
              그리고 오늘 수업이 여기서 끝나면, 다음에는 «6개 중 3번까지 끝났어. 4번부터 이어서 해 줘»라고 말하면 됩니다.
              번호가 하는 일이 이것입니다.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3">
            <p className="text-[12.5px] font-semibold text-rose-900">
              아직 {problems.length}곳이 «만들어도 확인할 수 없는» 자리에 있어요.
            </p>
            {problems.map((problem) => (
              <p key={problem.text} className="text-[12.5px] leading-[1.75] text-rose-800">
                · {problem.text}
              </p>
            ))}
          </div>
        )
      ) : (
        <button
          className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
          onClick={() => setChecked(true)}
          type="button"
        >
          ✅ 이 순서로 시켜도 되는지 확인하기
        </button>
      )}
    </div>
  );
}
