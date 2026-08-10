import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 17장 3문 시연 — 정답지 6문으로 «못 찾음»과 «잘못 말함»을 나눠 본다.
// 🔑 학생에게 «AI가 무엇을 꺼내 왔는지»를 함께 보여 준다. 답만 보면 두 실패가 똑같아 보이지만,
//    꺼내 온 자료를 보면 고칠 곳이 서로 다르다는 게 한눈에 갈린다.

type Case = {
  id: string;
  q: string;
  fetched: string;
  answer: string;
  truth: 'notfound' | 'misread' | 'ok';
  why: string;
};

const CASES: Case[] = [
  {
    id: 'c1',
    q: '책은 며칠까지 빌릴 수 있나요?',
    fetched: '§3 대출 기간 — 2주(14일)',
    answer: '2주(14일)까지 빌릴 수 있어요.',
    truth: 'ok',
    why: '맞는 자료를 꺼냈고, 그대로 말했습니다.',
  },
  {
    id: 'c2',
    q: '한 번에 몇 권까지 빌릴 수 있나요?',
    fetched: '§3 대출 기간 — 2주(14일)',
    answer: '2주 동안 원하는 만큼 빌릴 수 있습니다.',
    truth: 'notfound',
    why: '권수 규칙(§4)이 문서에 있는데 기간 문단을 꺼내 왔습니다. 답이 이상한 게 아니라 자료가 틀렸어요.',
  },
  {
    id: 'c3',
    q: '연체하면 어떻게 되나요?',
    fetched: '§5 연체 — 반납할 때까지 새로 빌릴 수 없음',
    answer: '연체하면 하루에 100원씩 내야 해요.',
    truth: 'misread',
    why: '자료는 정확히 꺼냈는데 없는 내용(100원)을 만들어 말했습니다.',
  },
  {
    id: 'c4',
    q: '빌린 책은 어디에 반납하나요?',
    fetched: '(꺼내 온 자료 없음)',
    answer: '교실 뒤 반납함에 넣어 주세요.',
    truth: 'notfound',
    why: '문서에 반납 장소가 있는데 아무것도 못 찾았고, 그 상태로 그럴듯하게 답했습니다.',
  },
  {
    id: 'c5',
    q: '다른 사람이 빌린 책도 빌릴 수 있나요?',
    fetched: '§4 대출 권수 — 1인 1권',
    answer: '한 사람은 한 권까지만 빌릴 수 있어요.',
    truth: 'notfound',
    why: '질문은 «남이 빌린 책»인데 «내가 몇 권»을 꺼냈습니다. 비슷해 보이는 문단이 함정이었어요.',
  },
  {
    id: 'c6',
    q: '대출 기간을 연장할 수 있나요?',
    fetched: '§6 연장 — 1회 가능, 반납 예정일 전에만',
    answer: '네, 한 번 연장할 수 있어요. 반납일이 지나기 전에 신청해야 합니다.',
    truth: 'ok',
    why: '맞는 자료를 꺼냈고, 조건까지 옮겼습니다.',
  },
];

const LABEL: Record<Case['truth'], string> = {
  notfound: '못 찾음',
  misread: '잘못 말함',
  ok: '정상',
};

export default function Q03FindOrSay(_props: DemoComponentProps) {
  const [picked, setPicked] = useState<Record<string, Case['truth']>>({});

  const done = Object.keys(picked).length === CASES.length;
  const correct = CASES.filter((c) => picked[c.id] === c.truth).length;
  const notfound = CASES.filter((c) => c.truth === 'notfound').length;
  const misread = CASES.filter((c) => c.truth === 'misread').length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          학급 규칙 문서에서 답을 찾아 주는 도우미를 정답지 6문으로 검사했습니다. 각 건이{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">못 찾음 / 잘못 말함 / 정상</b> 중 무엇인지
          골라 보세요. 힌트는 «꺼내 온 자료»에 있습니다.
        </p>
      </div>

      {CASES.map((c) => {
        const mine = picked[c.id];
        return (
          <div key={c.id} className="space-y-2 rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3">
            <p className="text-[12.5px] text-[var(--color-text-primary)]">
              <b className="font-semibold">질문</b> — {c.q}
            </p>
            <p className="text-[12px] text-[var(--color-text-muted)]">
              <b className="font-semibold">꺼내 온 자료</b> — {c.fetched}
            </p>
            <p className="text-[12.5px] text-[var(--color-text-primary)]">
              <b className="font-semibold">AI 답</b> — {c.answer}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(['notfound', 'misread', 'ok'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPicked((prev) => ({ ...prev, [c.id]: k }))}
                  className={`rounded-md border px-2.5 py-1 text-[12px] ${
                    mine === k
                      ? mine === c.truth
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-rose-300 bg-rose-50 text-rose-800'
                      : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]'
                  }`}
                >
                  {LABEL[k]}
                </button>
              ))}
            </div>
            {mine && (
              <p className="text-[12px] leading-[1.7] text-[var(--color-text-muted)]">
                {mine === c.truth ? '✅ ' : `⛔ 정답은 «${LABEL[c.truth]}» — `}
                {c.why}
              </p>
            )}
          </div>
        );
      })}

      {done && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            <b className="font-semibold">6문 중 {correct}개를 맞혔습니다.</b> 이 도우미의 성적표는 이렇게 됩니다 — 못 찾음{' '}
            {notfound}건, 잘못 말함 {misread}건.
          </p>
          <p>
            두 숫자를 나눠 적는 이유가 여기 있습니다. <b className="font-semibold">못 찾음이 많으면 고칠 곳은 서가</b>입니다
            — 문서를 잘게 나누고 제목을 달아 주는 일이요. <b className="font-semibold">잘못 말함이 많으면 고칠 곳은
            부탁문</b>이고요(«가져온 자료에 없는 내용은 쓰지 마»).
          </p>
          <p>
            나누지 않고 «답이 이상해»라고만 하면, 대개 AI를 바꾸거나 부탁문만 다듬다가 시간을 씁니다. 실제로는 엉뚱한 책을
            꺼내 온 경우가 더 많습니다.
          </p>
        </div>
      )}
    </div>
  );
}
