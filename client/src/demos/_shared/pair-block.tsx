import { Fragment, type ReactNode } from 'react';
import { IconCard, ZonePanel } from './card';
import { GroupBadge, PairConnector } from './chrome';
import type { Tone } from './tone';

export type PairItem = {
  icon: ReactNode;
  label: string;
  sub?: string;
};

export type PairFlowProps = {
  metaphorTitle: string;
  itTitle: string;
  metaphor: PairItem[];
  it: PairItem[];
  activeIndex: number;
  tone: Tone;
};

export type PairBinaryProps = {
  metaphorTitle: string;
  itTitle: string;
  metaphorLeft: PairItem & { cards?: string[] };
  metaphorRight: PairItem & { cards?: string[] };
  itLeft: PairItem;
  itRight: PairItem;
  leftActive: boolean;
  rightActive: boolean;
  tone: Tone;
};

export type PairMatchProps = PairFlowProps;

export type PairVerticalProps = {
  metaphorTitle: string;
  itTitle: string;
  pairs: Array<{ metaphor: PairItem; it: PairItem }>;
  activeIndex: number;
  tone: Tone;
};

function ArrowRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

function StepRow({
  items,
  activeIndex,
  tone,
}: {
  items: PairItem[];
  activeIndex: number;
  tone: Tone;
}) {
  return (
    <div className="grid items-stretch gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((step, idx) => (
        <div key={`${step.label}-${idx}`} className="relative flex flex-col">
          <IconCard icon={step.icon} label={step.label} sub={step.sub} active={activeIndex === idx} tone={tone} />
          {idx < items.length - 1 ? (
            <div
              className="pointer-events-none absolute right-[-13px] top-1/2 z-10 hidden -translate-y-1/2 sm:block"
              style={{ color: 'var(--color-text-faint)' }}
              aria-hidden
            >
              <ArrowRight />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PairFlow({ metaphorTitle, itTitle, metaphor, it, activeIndex, tone }: PairFlowProps) {
  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
      <GroupBadge label={metaphorTitle} sub="비유" tone={tone} />
      <StepRow items={metaphor} activeIndex={activeIndex} tone={tone} />
      <PairConnector tone={tone} />
      <GroupBadge label={itTitle} sub="실제" tone={tone} />
      <StepRow items={it} activeIndex={activeIndex} tone={tone} />
    </section>
  );
}

export function PairBinary({
  metaphorTitle,
  itTitle,
  metaphorLeft,
  metaphorRight,
  itLeft,
  itRight,
  leftActive,
  rightActive,
  tone,
}: PairBinaryProps) {
  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
      <GroupBadge label={metaphorTitle} sub="비유" tone={tone} />
      <div className="grid grid-cols-2 gap-3">
        <ZonePanel icon={metaphorLeft.icon} title={metaphorLeft.label} cards={metaphorLeft.cards ?? []} active={leftActive} tone={tone} />
        <ZonePanel icon={metaphorRight.icon} title={metaphorRight.label} cards={metaphorRight.cards ?? []} active={rightActive} tone={tone} />
      </div>
      <PairConnector tone={tone} />
      <GroupBadge label={itTitle} sub="실제" tone={tone} />
      <div className="grid grid-cols-2 gap-3">
        <IconCard icon={itLeft.icon} label={itLeft.label} sub={itLeft.sub} active={leftActive} tone={tone} />
        <IconCard icon={itRight.icon} label={itRight.label} sub={itRight.sub} active={rightActive} tone={tone} />
      </div>
    </section>
  );
}

export function PairMatch(props: PairMatchProps) {
  return <PairFlow {...props} />;
}

export function PairVertical({ metaphorTitle, itTitle, pairs, activeIndex, tone }: PairVerticalProps) {
  return (
    <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        <div>
          <GroupBadge label={metaphorTitle} sub="비유" tone={tone} />
        </div>
        <div />
        <div>
          <GroupBadge label={itTitle} sub="실제" tone={tone} />
        </div>

        {pairs.map((pair, idx) => {
          const active = activeIndex === idx;
          const cellStyle = {
            borderColor: active ? tone.accent : 'var(--color-border)',
            background: active ? tone.accentSoft : 'var(--demo-card-bg)',
            boxShadow: active ? `0 8px 18px color-mix(in srgb, ${tone.accent} 18%, transparent)` : undefined,
          };

          return (
            <Fragment key={`${pair.metaphor.label}-${pair.it.label}-${idx}`}>
              <div className="rounded-2xl border px-3 py-2.5 transition" style={cellStyle}>
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center"
                    style={{ color: active ? tone.accent : 'var(--color-text-muted)' }}
                  >
                    {pair.metaphor.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-[12px] font-bold leading-tight" style={{ color: active ? tone.accent : 'var(--color-text-primary)' }}>
                      {pair.metaphor.label}
                    </p>
                    {pair.metaphor.sub ? (
                      <p className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>{pair.metaphor.sub}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-center text-[14px] font-bold"
                style={{ color: active ? tone.accent : 'var(--demo-arrow-purple)' }}
                aria-hidden
              >
                ≈
              </div>

              <div className="rounded-2xl border px-3 py-2.5 transition" style={cellStyle}>
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center"
                    style={{ color: active ? tone.accent : 'var(--color-text-muted)' }}
                  >
                    {pair.it.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-[12px] font-bold leading-tight" style={{ color: active ? tone.accent : 'var(--color-text-primary)' }}>
                      {pair.it.label}
                    </p>
                    {pair.it.sub ? (
                      <p className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>{pair.it.sub}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
