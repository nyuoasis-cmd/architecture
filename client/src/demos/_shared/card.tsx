import { type ReactNode } from 'react';
import type { Tone } from './tone';

export function IconCard({
  icon,
  label,
  sub,
  active,
  tone,
}: {
  icon: ReactNode;
  label: string;
  sub?: string;
  active: boolean;
  tone: Tone;
}) {
  return (
    <div
      className="flex min-w-0 flex-col items-center break-words rounded-2xl border p-3 text-center transition"
      style={{
        borderColor: active ? tone.accent : 'var(--color-border)',
        background: active ? tone.accentSoft : 'var(--demo-card-bg)',
        boxShadow: active ? `0 8px 22px color-mix(in srgb, ${tone.accent} 18%, transparent)` : undefined,
      }}
    >
      <div
        className="mb-2 inline-flex h-10 w-10 items-center justify-center"
        style={{ color: active ? tone.accent : 'var(--color-text-muted)' }}
      >
        {icon}
      </div>
      <div
        className="text-[12px] font-semibold leading-tight"
        style={{ color: active ? tone.accent : 'var(--color-text-primary)' }}
      >
        {label}
      </div>
      {sub ? (
        <div className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

export function ZonePanel({
  icon,
  title,
  cards,
  active,
  tone,
}: {
  icon: ReactNode;
  title: string;
  cards: string[];
  active: boolean;
  tone: Tone;
}) {
  return (
    <div
      className="rounded-2xl border p-3 transition"
      style={{
        borderColor: active ? tone.accent : 'var(--color-border)',
        background: active ? tone.accentSoft : 'var(--demo-card-bg)',
        boxShadow: active ? `0 8px 22px color-mix(in srgb, ${tone.accent} 18%, transparent)` : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center"
          style={{ color: active ? tone.accent : 'var(--color-text-muted)' }}
        >
          {icon}
        </span>
        <span className="text-[14px] font-semibold" style={{ color: active ? tone.accent : 'var(--color-text-primary)' }}>
          {title}
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        {cards.map((card) => (
          <div
            key={card}
            className="min-w-0 break-words rounded-xl border px-3 py-1.5 text-[12px] leading-tight"
            style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
          >
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}
