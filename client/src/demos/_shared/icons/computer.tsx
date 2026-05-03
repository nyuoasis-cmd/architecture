import { ICON_BASE } from './_base';

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
