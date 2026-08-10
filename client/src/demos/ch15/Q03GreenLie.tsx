import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 15장 3문 시연 — 초록불 3개를 열어 «몇 개를 봤는지» 확인한다.
// 🔑 셋 다 «통과»라고 적혀 있다. 열어 보기 전에는 구분할 방법이 없다는 것이 이 데모의 요점이다.
//    실화 기반: 검사 대상이 0개인데 "전부 통과"라고 보고하던 검사가 실제로 있었다.

type Check = {
  id: string;
  name: string;
  reported: string;
  looked: number;
  total: number;
  trustworthy: boolean;
  detail: string;
};

const CHECKS: Check[] = [
  {
    id: 'a',
    name: '규칙 검사',
    reported: '✅ 전부 통과',
    looked: 0,
    total: 3,
    trustworthy: false,
    detail:
      '검사할 목록이 비어 있었어요. 검사는 «빈 목록»을 정확히 다 훑고 통과라고 보고했습니다. 거짓말이 아니라, 아무것도 안 보면서 참을 말한 거예요.',
  },
  {
    id: 'b',
    name: '화면 검사',
    reported: '✅ 전부 통과',
    looked: 1,
    total: 3,
    trustworthy: false,
    detail:
      '화면 3개 중 1개만 목록에 있었습니다. 나머지 2개는 한 번도 검사된 적이 없어요. «전부»가 무엇에 대한 전부인지 아무도 세지 않은 겁니다.',
  },
  {
    id: 'c',
    name: '대출 규칙 검사',
    reported: '✅ 전부 통과',
    looked: 3,
    total: 3,
    trustworthy: true,
    detail:
      '규칙 3개를 모두 검사했고, 그중 2개는 «막혀야 하는 장면»을 확인하는 검사였습니다. 이 초록불은 믿을 수 있어요.',
  },
];

export default function Q03GreenLie(_props: DemoComponentProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [guess, setGuess] = useState<string | null>(null);

  const open = (id: string) => setOpened((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const allOpen = opened.length === CHECKS.length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          검사 3개가 전부 초록불입니다. 이 중{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">믿어도 되는 초록불은 몇 개일까요?</b> 먼저
          찍어 보고, 하나씩 열어 보세요.
        </p>
      </div>

      {guess === null && (
        <div className="flex gap-2">
          {['3개 다', '2개', '1개'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setGuess(label)}
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[12.5px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {CHECKS.map((check) => {
          const isOpen = opened.includes(check.id);
          return (
            <div
              key={check.id}
              className={`rounded-lg border px-3.5 py-3 ${
                isOpen
                  ? check.trustworthy
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-rose-300 bg-rose-50'
                  : 'border-[var(--color-border)] bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{check.name}</p>
                <span className="text-[12px] text-emerald-700">{check.reported}</span>
              </div>
              {isOpen ? (
                <div className="mt-2 space-y-1.5">
                  <p className="text-[12.5px] font-semibold tabular-nums text-[var(--color-text-primary)]">
                    실제로 검사한 개수: {check.looked} / {check.total}
                  </p>
                  <p className="text-[12.5px] leading-[1.75] text-[var(--color-text-muted)]">{check.detail}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => open(check.id)}
                  className="mt-2 rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]"
                >
                  열어서 «몇 개를 봤는지» 확인
                </button>
              )}
            </div>
          );
        })}
      </div>

      {allOpen && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            <b className="font-semibold">초록불 3개 중 믿을 수 있는 것은 1개였습니다.</b>
            {guess && guess !== '1개' && <> 처음에 «{guess}»라고 찍었죠 — 겉면만 보면 셋은 완전히 똑같이 생겼습니다.</>}
          </p>
          <p>
            셋의 겉면은 전부 «✅ 전부 통과»였어요. 구분한 것은 딱 하나,{' '}
            <b className="font-semibold">«몇 개 중 몇 개를 봤나»</b>입니다. 그래서 초록불 앞에서 던질 질문은 "통과했나?"가
            아니라 <b className="font-semibold">"이 검사는 실패할 수 있었나?"</b>입니다.
          </p>
          <p>다음 문에서는 그걸 확인하는 방법 — 일부러 망가뜨려 보기 — 을 해 봅니다.</p>
        </div>
      )}
    </div>
  );
}
