import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 11장 4문 시연 — «AI의 기억은 서랍이 아니라 책상 위»를 손으로 밀어 보는 도구.
// 책상 칸이 차면 가장 오래된 서류가 떨어지고, 떨어진 서류의 지시는 더 이상 반영되지 않는다.

const DESK_SIZE = 5;

const RULE = { id: 0, label: '규칙: 대답은 항상 두 줄로', rule: true };

const MESSAGES = [
  '급식 투표 앱 만들어줘',
  '메뉴는 네 개로 해줘',
  '그래프도 넣어줘',
  '색을 좀 밝게 바꿔줘',
  '버튼을 크게 해줘',
  '제목 글씨를 바꿔줘',
  '결과 화면도 만들어줘',
  '투표 마감 시간을 보여줘',
];

export default function Q04ContextDesk(_props: DemoComponentProps) {
  const [turn, setTurn] = useState(0);

  const all = [RULE, ...MESSAGES.slice(0, turn).map((label, i) => ({ id: i + 1, label, rule: false }))];
  const onDesk = all.slice(Math.max(0, all.length - DESK_SIZE));
  const fallen = all.slice(0, Math.max(0, all.length - DESK_SIZE));
  const ruleFell = fallen.some((doc) => doc.rule);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTurn((t) => Math.min(MESSAGES.length, t + 1))}
          disabled={turn >= MESSAGES.length}
          className="rounded-lg bg-[var(--color-text-primary)] px-3.5 py-2 text-[13px] font-bold text-white disabled:opacity-40"
        >
          대화 한 번 더 하기
        </button>
        <button
          type="button"
          onClick={() => setTurn(0)}
          className="rounded-lg border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-bold text-[var(--color-text-body)]"
        >
          새 대화로 처음부터
        </button>
        <span className="text-[12px] tabular-nums text-[var(--color-text-faint)]">
          주고받은 횟수 {turn} · 책상 칸 {DESK_SIZE}개
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-4 shadow-sm">
          <p className="mb-3 text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">
            AI의 책상 위 (지금 읽을 수 있는 것)
          </p>
          <div className="space-y-1.5">
            {onDesk.map((doc) => (
              <div
                key={doc.id}
                className={`rounded-lg border px-3 py-2 text-[12.5px] ${
                  doc.rule
                    ? 'border-emerald-300 bg-emerald-50 font-bold text-emerald-800'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-body)]'
                }`}
              >
                {doc.label}
              </div>
            ))}
            {Array.from({ length: Math.max(0, DESK_SIZE - onDesk.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="rounded-lg border border-dashed border-[var(--color-border)] px-3 py-2 text-[12.5px] text-[var(--color-text-faint)]"
              >
                빈 자리
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-4">
          <p className="mb-3 text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">
            책상에서 떨어진 것 ({fallen.length})
          </p>
          {fallen.length === 0 ? (
            <p className="text-[12.5px] text-[var(--color-text-muted)]">아직 아무것도 안 떨어졌어요.</p>
          ) : (
            <div className="space-y-1.5">
              {fallen.map((doc) => (
                <div
                  key={doc.id}
                  className={`rounded-lg border px-3 py-2 text-[12.5px] line-through ${
                    doc.rule
                      ? 'border-rose-300 bg-rose-50 font-bold text-rose-700'
                      : 'border-[var(--color-border)] text-[var(--color-text-faint)]'
                  }`}
                >
                  {doc.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`rounded-xl border px-4 py-3 text-[12.5px] leading-[1.8] ${
          ruleFell ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
        }`}
      >
        {ruleFell ? (
          <>
            <b className="font-semibold">규칙이 책상에서 떨어졌습니다.</b> 지금부터 AI에게 물으면 «두 줄로» 규칙은
            지켜지지 않습니다. 대화창에는 그 말이 그대로 남아 있는데도요 — 남아 있는 것과 읽히는 것은 다릅니다. 그래서
            중요한 규칙은 맨 앞에 한 번이 아니라 <b className="font-semibold">부탁할 때마다</b> 담아야 합니다.
          </>
        ) : (
          <>«대화 한 번 더 하기»를 눌러 보세요. 규칙 서류(초록)가 언제 밀려 떨어지는지 지켜보면 됩니다.</>
        )}
      </div>
    </div>
  );
}
