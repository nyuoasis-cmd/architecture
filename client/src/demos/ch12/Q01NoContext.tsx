import { useState } from 'react';
import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH12 } from '../../data/vibe-pregen-ch12';
import PregenBlock from '../ch13/PregenBlock';

// 12장 1문 시연 — "앱 만들어줘." 한 줄만 보낸 실제 기록.
// 🔑 AI는 만들지 못하고 «되물었다». 되물은 세 칸(용도·사용 대상·주요 기능)이 이 장의 목차와 같다.

const ASKED = [
  { label: '📱 앱의 용도', answer: '무엇을 하는 앱인가 — 2문 «문제 한 문장»에서 다룬다' },
  { label: '👥 사용 대상', answer: '누가 쓰는가 — 3문 «사용자 정하기»에서 다룬다' },
  { label: '⭐ 주요 기능', answer: '무엇을 할 수 있어야 하는가 — 4문 «기능 목록»에서 다룬다' },
] as const;

export default function Q01NoContext(_props: DemoComponentProps) {
  const pregen = VIBE_PREGEN_CH12.ch12_q01_bare;
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const openedCount = ASKED.filter((item) => opened[item.label]).length;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">보낸 부탁문 (전부)</p>
          <p className="mt-1 text-[13px] leading-[1.8] text-[var(--color-text-body)]">"앱 만들어줘."</p>
        </div>
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          오른쪽이 AI의 실제 답입니다. 앱이 나오지 않았어요 — 대신{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">되물었습니다</b>. 무엇을 물어봤는지 하나씩 눌러
          보세요.
        </p>
        <div className="space-y-2">
          {ASKED.map((item) => {
            const isOpen = Boolean(opened[item.label]);
            return (
              <button
                key={item.label}
                className={`w-full rounded-lg border px-3.5 py-2 text-left text-[13px] font-medium ${
                  isOpen
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]'
                }`}
                onClick={() => setOpened((prev) => ({ ...prev, [item.label]: true }))}
                type="button"
              >
                {isOpen ? `→ ${item.answer}` : `${item.label} — AI가 물어본 것`}
              </button>
            );
          })}
        </div>
        {openedCount === ASKED.length ? (
          <p className="rounded-lg bg-[#C9E0D4] px-3.5 py-2.5 text-[12.5px] font-medium leading-[1.8] text-[#2d4a3e]">
            AI가 되물은 세 가지가 이 장에서 배울 목차와 그대로 겹칩니다. 즉 "앱 만들어줘"가 실패한 건 AI가 못해서가
            아니라 <b>이 칸들이 비어 있었기</b> 때문이에요.
          </p>
        ) : null}
        {pregen ? (
          <p className="text-[10.5px] text-[var(--color-text-faint)]">
            실제 실행 기록 · {pregen.model} · {pregen.generatedAt.slice(0, 10)} — 수업 중에는 저장본을 재생만 합니다
          </p>
        ) : null}
      </div>
      <div className="max-h-[480px] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-white px-4 py-3.5 shadow-sm">
        {pregen ? <PregenBlock text={pregen.text} /> : <p className="text-[12.5px]">재료 없음</p>}
      </div>
    </div>
  );
}
