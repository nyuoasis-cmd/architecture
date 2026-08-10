import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 17장 7문 시연 — 30명 교실에서 캐시를 켜고 끄며 «호출 수»를 세어 본다.
// 🔑 마지막에 «내 대출 현황»(사람마다 달라야 하는 질문)을 섞는다. 캐시를 켠 채로 두면 남의 답이 나온다.
//    캐시의 이득과 사고가 같은 화면에서 나오게 하는 게 요점이다.

type Q = { id: string; text: string; askers: number; shared: boolean };

const QUESTIONS: Q[] = [
  { id: 'q1', text: '"대출 기간이 며칠인가요?"', askers: 12, shared: true },
  { id: 'q2', text: '"한 번에 몇 권까지 빌려요?"', askers: 9, shared: true },
  { id: 'q3', text: '"연체하면 어떻게 되나요?"', askers: 6, shared: true },
  { id: 'q4', text: '"내가 빌린 책 알려 줘"', askers: 3, shared: false },
];

export default function Q07Cache(_props: DemoComponentProps) {
  const [cache, setCache] = useState<'off' | 'all' | 'shared'>('off');

  const total = QUESTIONS.reduce((s, q) => s + q.askers, 0);
  const calls =
    cache === 'off'
      ? total
      : cache === 'all'
        ? QUESTIONS.length
        : QUESTIONS.reduce((s, q) => s + (q.shared ? 1 : q.askers), 0);
  const leak = cache === 'all';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          30명 교실에서 도우미에게 던진 질문들입니다(합 {total}번).{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">캐시를 어떻게 켤지</b> 골라 보세요.
        </p>
      </div>

      <div className="space-y-1.5">
        {QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5"
          >
            <p className="text-[12.5px] text-[var(--color-text-primary)]">{q.text}</p>
            <span className="shrink-0 text-[12px] tabular-nums text-[var(--color-text-muted)]">{q.askers}명이 물음</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {(
          [
            { key: 'off', label: '캐시 없음' },
            { key: 'all', label: '전부 캐시' },
            { key: 'shared', label: '누가 물어도 같은 답만 캐시' },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setCache(opt.key)}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-[12.5px] ${
              cache === opt.key
                ? 'border-[var(--color-accent)] bg-white font-medium'
                : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-input)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-center">
          <p className="text-[11.5px] text-[var(--color-text-muted)]">실제 AI 호출</p>
          <p className="text-[15px] font-semibold tabular-nums text-[var(--color-text-primary)]">{calls}번</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-center">
          <p className="text-[11.5px] text-[var(--color-text-muted)]">아낀 호출</p>
          <p className="text-[15px] font-semibold tabular-nums text-[var(--color-text-primary)]">{total - calls}번</p>
        </div>
      </div>

      <div
        className={`space-y-2 rounded-xl border px-4 py-3 text-[12.5px] leading-[1.8] ${
          leak ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-amber-300 bg-amber-50 text-amber-900'
        }`}
      >
        {cache === 'off' && (
          <p>
            {total}번 물으면 {total}번 계산합니다. 이미 만든 적 있는 답을{' '}
            <b className="font-semibold">{total - QUESTIONS.length}번 다시 만든</b> 셈이에요 — 느리고, 그만큼 돈이
            나갑니다.
          </p>
        )}
        {cache === 'all' && (
          <>
            <p>
              <b className="font-semibold">호출은 4번으로 줄었습니다. 그런데 사고가 났어요.</b>
            </p>
            <p>
              «내가 빌린 책 알려 줘»의 답까지 저장해서 나눠 줬습니다. 먼저 물은 한 명의 대출 목록이,{' '}
              <b className="font-semibold">나중에 물은 두 명에게 그대로 나갔습니다.</b> 남의 정보가 샌 것입니다.
            </p>
            <p>급식 반찬은 나눠도 되지만, 이름 적힌 도시락을 다른 사람에게 주면 안 되죠.</p>
          </>
        )}
        {cache === 'shared' && (
          <>
            <p>
              <b className="font-semibold">호출 {calls}번 — 24번을 아꼈고, 새는 정보는 없습니다.</b>
            </p>
            <p>
              «내가 빌린 책»만 사람마다 새로 계산했어요. 나머지 세 질문은 누가 물어도 답이 같으니 처음 한 명만 계산하고
              나머지는 저장본으로 해결됩니다.
            </p>
            <p>
              그래서 캐시 설계의 첫 질문은 성능이 아니라 이것입니다 —{' '}
              <b className="font-semibold">«이 답은 누가 물어도 같은가?»</b> 같으면 캐시, 다르면 금지. 이 구분 하나가 전부예요.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
