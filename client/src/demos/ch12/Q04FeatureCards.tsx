import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 12장 4문 시연 — 떠오른 기능을 문제 문장으로 걸러 «1차 목록»과 «나중에 목록»으로 나눈다.
// 🔑 정답은 «좋은 기능/나쁜 기능»이 아니라 «이 문제를 푸느냐»다. 판정 근거를 카드마다 함께 보여 준다.

const PROBLEM = '학급문고 책이 누구한테 갔는지 몰라서 자꾸 사라진다.';

type Card = {
  id: string;
  text: string;
  solves: boolean;
  why: string;
};

const CARDS: Card[] = [
  { id: 'borrow', text: '학생이 책을 빌릴 수 있다', solves: true, why: '누가 가져갔는지 기록이 생긴다 — 문제의 핵심' },
  { id: 'return', text: '학생이 책을 반납할 수 있다', solves: true, why: '돌아온 책과 안 돌아온 책이 갈린다' },
  { id: 'who', text: '누가 어떤 책을 빌렸는지 볼 수 있다', solves: true, why: '"몰라서"를 정면으로 없앤다' },
  { id: 'search', text: '학생이 책을 검색할 수 있다', solves: false, why: '있으면 편하지만, 없어도 책은 안 사라진다' },
  { id: 'star', text: '학생이 책에 별점을 줄 수 있다', solves: false, why: '재미는 있지만 사라지는 책과 무관하다' },
  { id: 'recommend', text: 'AI가 다음에 읽을 책을 추천한다', solves: false, why: '멋지지만 문제와 상관없다 — 대표적인 «장식»' },
  { id: 'ranking', text: '많이 읽은 사람 순위를 보여 준다', solves: false, why: '독서 장려용이지 분실 방지용이 아니다' },
];

export default function Q04FeatureCards(_props: DemoComponentProps) {
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [graded, setGraded] = useState(false);

  const decidedCount = Object.keys(picked).length;
  const allDecided = decidedCount === CARDS.length;
  const hits = CARDS.filter((card) => picked[card.id] === card.solves).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">심판이 될 문제 한 문장</p>
        <p className="mt-1 text-[13px] font-medium leading-[1.8] text-[var(--color-text-body)]">{PROBLEM}</p>
        <p className="mt-2 text-[12px] leading-[1.75] text-[var(--color-text-muted)]">
          떠오른 기능 7개입니다. 각 카드에 대해 물어보세요 —{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">"이게 없으면 이 문제가 안 풀리나?"</b>
        </p>
      </div>

      <div className="space-y-2">
        {CARDS.map((card) => {
          const choice = picked[card.id];
          const isRight = graded && choice === card.solves;
          const isWrong = graded && choice !== undefined && choice !== card.solves;
          return (
            <div
              key={card.id}
              className={`rounded-lg border px-3.5 py-2.5 ${
                isRight
                  ? 'border-emerald-200 bg-emerald-50'
                  : isWrong
                    ? 'border-rose-200 bg-rose-50'
                    : 'border-[var(--color-border)] bg-white'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] text-[var(--color-text-primary)]">{card.text}</p>
                <div className="flex gap-1.5">
                  <button
                    className={`rounded-md border px-2.5 py-1 text-[12px] font-medium ${
                      choice === true
                        ? 'border-[#2d4a3e] bg-[#C9E0D4] text-[#2d4a3e]'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]'
                    }`}
                    onClick={() => setPicked((prev) => ({ ...prev, [card.id]: true }))}
                    type="button"
                  >
                    1차 목록
                  </button>
                  <button
                    className={`rounded-md border px-2.5 py-1 text-[12px] font-medium ${
                      choice === false
                        ? 'border-amber-400 bg-amber-100 text-amber-900'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]'
                    }`}
                    onClick={() => setPicked((prev) => ({ ...prev, [card.id]: false }))}
                    type="button"
                  >
                    나중에
                  </button>
                </div>
              </div>
              {graded ? (
                <p className="mt-1.5 text-[12px] leading-[1.7] text-[var(--color-text-muted)]">
                  {card.solves ? '✓ 1차 목록' : '→ 나중에 목록'} · {card.why}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {graded ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-[12.5px] leading-[1.8] text-amber-900">
            {hits}/{CARDS.length} 일치. 걸러낸 4개는 <b className="font-semibold">나쁜 기능이 아닙니다</b> — 이번 문제와
            상관없을 뿐이에요. 버리지 말고 «나중에 목록»에 두었다가, 앱이 돌아가기 시작하면 하나씩 올리면 됩니다. 처음부터
            7개를 다 넣으려는 욕심이 앱을 늦게, 이상하게, 결국 못 만들게 만듭니다.
          </p>
        </div>
      ) : (
        <button
          className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)] disabled:opacity-45"
          disabled={!allDecided}
          onClick={() => setGraded(true)}
          type="button"
        >
          {allDecided ? '🔍 걸러 보기' : `아직 ${CARDS.length - decidedCount}개 남았어요`}
        </button>
      )}
    </div>
  );
}
