import type { ReactNode } from 'react';

export type Tone = {
  accent: string;       // hex
  accentSoft: string;   // hex (soft bg)
  accentBorder: string; // hex (active border accent)
};

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
      className="flex flex-col items-center rounded-2xl border p-3 text-center transition"
      style={{
        borderColor: active ? tone.accent : 'var(--color-border)',
        background: active ? tone.accentSoft : '#fff',
        boxShadow: active ? `0 8px 22px ${tone.accent}1f` : undefined,
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
      {sub && (
        <div className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function ArrowRight() {
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
      <span
        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
        style={{ background: tone.accentSoft, color: tone.accent }}
      >
        {label}
      </span>
      <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        {sub}
      </span>
    </div>
  );
}

const ICON_BASE = {
  width: 40,
  height: 40,
  viewBox: '0 0 40 40',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
} as const;

/* ───── 라면 메타포 ───── */
export function IngredientsIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <ellipse cx="20" cy="27" rx="14" ry="2.5" />
      <path d="M6 27q14 11 28 0" />
      <path d="M11 18q4-3 9 0t9 0" />
      <path d="M11 14q4-3 9 0t9 0" />
      <circle cx="29" cy="11" r="2.5" />
    </svg>
  );
}
export function PotIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M2 16h4M34 16h4" />
      <path d="M6 16h28v14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" />
      <path d="M12 10c0 3 1 4 2 6M20 8c0 3 1 4 2 6M28 10c0 3 1 4 2 6" />
    </svg>
  );
}
export function FlameIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M20 6c-6 6-9 12-7 18a9 9 0 0 0 14 0c2-7-1-13-7-18z" />
      <path d="M20 18c-2 3-3 6-2 9a4 4 0 0 0 4 0c1-3 0-6-2-9z" />
    </svg>
  );
}
export function BowlIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M14 8c0 4 1 5 2 6M20 6c0 4 1 5 2 6M26 8c0 4 1 5 2 6" />
      <ellipse cx="20" cy="22" rx="14" ry="2.5" />
      <path d="M6 22q14 16 28 0" />
      <path d="M11 22q9-3 18 0" />
    </svg>
  );
}

/* ───── 컴퓨터 (q01) ───── */
export function KeyboardIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="22" width="28" height="12" rx="2" />
      <path d="M10 26h3M16 26h3M22 26h3M28 26h2M11 30h18" />
      <path d="M20 16V8m-4 4 4-4 4 4" />
    </svg>
  );
}
export function RamIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="4" y="14" width="32" height="12" rx="1" />
      <rect x="8" y="17" width="3.5" height="6" />
      <rect x="14" y="17" width="3.5" height="6" />
      <rect x="20" y="17" width="3.5" height="6" />
      <rect x="26" y="17" width="3.5" height="6" />
      <path d="M7 26v4M13 26v4M19 26v4M25 26v4M31 26v4" />
    </svg>
  );
}
export function CpuIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="10" y="10" width="20" height="20" rx="1" />
      <rect x="15" y="15" width="10" height="10" />
      <path d="M6 14h4M6 20h4M6 26h4M30 14h4M30 20h4M30 26h4" />
      <path d="M14 6v4M20 6v4M26 6v4M14 30v4M20 30v4M26 30v4" />
    </svg>
  );
}
export function MonitorIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="4" y="8" width="32" height="20" rx="2" />
      <path d="M16 28v4M24 28v4M12 32h16" />
      <path d="M9 14h12M9 18h8M9 22h14" />
    </svg>
  );
}

/* ───── 무대-대본 (q02) ───── */
export function StageIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M4 6v22M36 6v22" />
      <path d="M4 6c4 1 8 2 16 2s12-1 16-2" />
      <path d="M8 6q1 8 2 18M14 6q1 9 1 18M20 6v18M26 6q-1 9-1 18M32 6q-1 8-2 18" />
      <path d="M2 30h36" />
    </svg>
  );
}
export function ScriptIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M9 4h18l4 4v28H9z" />
      <path d="M27 4v4h4" />
      <path d="M13 14h14M13 18h14M13 22h10M13 26h12" />
    </svg>
  );
}
export function HardwareIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="6" width="28" height="28" rx="2" />
      <rect x="11" y="11" width="8" height="8" />
      <rect x="22" y="11" width="7" height="4" />
      <rect x="22" y="17" width="7" height="2" />
      <path d="M11 23h18M11 27h18M11 30h12" />
    </svg>
  );
}
export function SoftwareIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="5" y="7" width="30" height="26" rx="2" />
      <path d="M5 13h30" />
      <circle cx="9" cy="10" r="0.8" fill="currentColor" />
      <circle cx="12" cy="10" r="0.8" fill="currentColor" />
      <circle cx="15" cy="10" r="0.8" fill="currentColor" />
      <path d="M11 19l-3 3 3 3M17 19l3 3-3 3M14 27l4-9" />
    </svg>
  );
}

/* ───── 식당-OS (q03) ───── */
export function SeatsIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="11" cy="14" r="3" />
      <circle cx="29" cy="14" r="3" />
      <path d="M5 32c0-4 2-7 6-7s6 3 6 7M23 32c0-4 2-7 6-7s6 3 6 7" />
    </svg>
  );
}
export function OrdersIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M9 4h18l3 3v25l-4-2-4 2-4-2-4 2-4-2-4 2V7z" />
      <path d="M14 12h11M14 17h11M14 22h7" />
    </svg>
  );
}
export function StorageBoxIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M6 12h28v22H6z" />
      <path d="M6 12 9 6h22l3 6" />
      <path d="M16 18h8" />
    </svg>
  );
}
export function CheckoutIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="5" y="13" width="30" height="18" rx="2" />
      <path d="M5 19h30" />
      <path d="M11 25h6" />
      <rect x="11" y="6" width="14" height="6" rx="1" />
    </svg>
  );
}
export function OsAllocateIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="5" y="10" width="30" height="20" rx="2" />
      <path d="M15 10v20M25 10v20" />
      <path d="M9 16h2M9 20h2M19 16h2M19 24h2M29 18h2" />
    </svg>
  );
}
export function OsScheduleIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="13" />
      <path d="M20 12v8l5 3" />
      <circle cx="20" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}
export function OsFileIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M5 10h11l3 4h16v18H5z" />
      <path d="M11 22h18" />
    </svg>
  );
}
export function OsLockIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="9" y="18" width="22" height="16" rx="2" />
      <path d="M14 18v-5a6 6 0 0 1 12 0v5" />
      <circle cx="20" cy="26" r="1.5" />
      <path d="M20 28v3" />
    </svg>
  );
}

/* ───── 도서관-메모리 (q04) ───── */
export function ShelfIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="5" y="6" width="30" height="28" rx="1" />
      <path d="M5 16h30M5 26h30" />
      <path d="M9 8v6M13 8v6M17 8v6M21 8v6M25 8v6M29 8v6" />
      <path d="M9 18v6M13 18v6M17 18v6M21 18v6" />
      <path d="M9 28v4M13 28v4M17 28v4" />
    </svg>
  );
}
export function DeskIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M5 18h30v3H5z" />
      <path d="M8 21v13M32 21v13M14 21v8M26 21v8" />
      <rect x="14" y="10" width="14" height="8" />
      <path d="M16 13h10M16 16h6" />
    </svg>
  );
}
export function StickyIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M8 6h20l4 4v24H8z" />
      <path d="M28 6v4h4" />
      <path d="M13 18h12M13 22h9M13 26h11" />
    </svg>
  );
}
export function PenIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M30 6l4 4-20 20-6 2 2-6z" />
      <path d="M26 10l4 4" />
      <path d="M10 32l2-2" />
    </svg>
  );
}
export function CheckBookIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M8 6h22a4 4 0 0 1 4 4v24l-5-3-5 3-5-3-5 3-6-3z" />
      <path d="M14 16l4 4 8-9" />
    </svg>
  );
}
export function StorageDiskIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <ellipse cx="20" cy="11" rx="12" ry="4" />
      <path d="M8 11v18a12 4 0 0 0 24 0V11" />
      <path d="M8 20a12 4 0 0 0 24 0" />
      <path d="M8 26a12 4 0 0 0 24 0" />
    </svg>
  );
}
export function CacheIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="11" y="11" width="18" height="18" rx="1" />
      <rect x="15" y="15" width="10" height="10" />
      <path d="M7 14h4M7 20h4M7 26h4M29 14h4M29 20h4M29 26h4" />
      <text x="20" y="23" fontSize="6" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="700">
        L1
      </text>
    </svg>
  );
}
export function ResultIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="6" width="28" height="20" rx="2" />
      <path d="M14 26v4M26 26v4M10 30h20" />
      <path d="M13 16l4 4 10-9" />
    </svg>
  );
}
