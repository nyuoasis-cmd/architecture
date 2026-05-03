import type { Tone } from './tone';

type HeroSummaryTone = 'orange' | 'slate' | 'stone';
type LogVariant = 'stone' | 'navy' | 'blue';
type StateItem = string | { label: string; active?: boolean; color?: string };

const HERO_TEXT_COLOR: Record<HeroSummaryTone, string> = {
  orange: 'var(--demo-summary-text-orange)',
  slate: 'var(--demo-summary-text-slate)',
  stone: 'var(--demo-summary-text-stone)',
};

const LOG_STYLE: Record<LogVariant, { bg: string; time: string }> = {
  stone: { bg: 'var(--demo-log-bg-stone)', time: 'var(--demo-log-time-stone)' },
  navy: { bg: 'var(--demo-log-bg-navy)', time: 'var(--demo-log-time-neutral)' },
  blue: { bg: 'var(--demo-log-bg-blue)', time: 'var(--demo-log-time-blue)' },
};

export function Hero({
  eyebrow,
  title,
  summary,
  tone,
  summaryTone = 'stone',
  accentMix = 'var(--demo-card-bg)',
}: {
  eyebrow: string;
  title: string;
  summary: string;
  tone: Tone;
  summaryTone?: HeroSummaryTone;
  accentMix?: string;
}) {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{
        borderColor: 'var(--color-border)',
        background: `linear-gradient(135deg, ${tone.accentSoft}, ${accentMix} 58%, var(--demo-card-bg))`,
      }}
    >
      <p className="m-0 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{eyebrow}</p>
      <h2 className="mt-1.5 text-[20px] font-semibold leading-snug" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      <p className="mt-2 text-[13px] leading-[1.7]" style={{ color: HERO_TEXT_COLOR[summaryTone] }}>
        {summary}
      </p>
    </section>
  );
}

export function PairConnector({ tone, label = '같은 원리' }: { tone: Tone; label?: string }) {
  return (
    <div className="my-1 flex items-center justify-center gap-2 text-[11px]" style={{ color: tone.accent }}>
      <svg width="32" height="14" viewBox="0 0 32 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M3 5q4-3 8 0t8 0 8 0" opacity="0.6" />
        <path d="M3 11q4-3 8 0t8 0 8 0" opacity="0.6" />
      </svg>
      <span className="font-medium">{label}</span>
      <svg width="32" height="14" viewBox="0 0 32 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M3 5q4-3 8 0t8 0 8 0" opacity="0.6" />
        <path d="M3 11q4-3 8 0t8 0 8 0" opacity="0.6" />
      </svg>
    </div>
  );
}

export function GroupBadge({ label, sub, tone }: { label: string; sub: string; tone: Tone }) {
  return (
    <div className="mb-2 flex items-baseline gap-2">
      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: tone.accentSoft, color: tone.accent }}>
        {label}
      </span>
      <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{sub}</span>
    </div>
  );
}

export function LogBox({
  logs,
  variant,
  title = '실시간 로그',
  lineTimeColor,
}: {
  logs: Array<[string, string]>;
  variant: LogVariant;
  title?: string;
  lineTimeColor?: string;
}) {
  const style = LOG_STYLE[variant];
  const timeColor = lineTimeColor ?? style.time;

  return (
    <section
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: 'var(--color-border)', background: style.bg, color: 'var(--demo-log-fg)' }}
    >
      <p className="m-0 text-[11px]" style={{ color: timeColor }}>
        {title}
      </p>
      {logs.map(([time, msg]) => (
        <div key={time} className="font-mono text-[11px] leading-[1.8]">
          <span style={{ color: timeColor, marginRight: 6 }}>{time}</span>
          {msg}
        </div>
      ))}
    </section>
  );
}

export function StateChips({
  items,
  tone,
  title = '현재 상태',
  description,
}: {
  items: StateItem[];
  tone: Tone;
  title?: string;
  description?: string;
}) {
  return (
    <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
      <h3 className="m-0 text-[14px] font-semibold">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item, index) => {
          const chip = typeof item === 'string' ? { label: item, active: index === 0 } : item;
          return (
            <span
              key={chip.label}
              className="rounded-full border px-3 py-1.5 text-[12px]"
              style={
                chip.active
                  ? {
                      background: tone.accentSoft,
                      borderColor: tone.accentBorder,
                      color: chip.color ?? 'var(--color-text-primary)',
                    }
                  : {
                      background: 'var(--demo-card-bg-alt)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-body)',
                    }
              }
            >
              {chip.label}
            </span>
          );
        })}
      </div>
      {description ? (
        <p className="mt-3 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>{description}</p>
      ) : null}
    </section>
  );
}
