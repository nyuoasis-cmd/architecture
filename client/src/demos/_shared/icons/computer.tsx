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

export function OsIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="7" width="28" height="26" rx="3" />
      <path d="M6 13h28" />
      <circle cx="11" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d="M12 19h8M12 24h16M12 29h12" />
    </svg>
  );
}

export function DriverIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="13" width="26" height="14" rx="2" />
      <path d="M11 13V9h18v4" />
      <path d="M13 20h4M23 20h4" />
      <path d="M16 27v4M24 27v4" />
    </svg>
  );
}

export function AppIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="8" width="24" height="24" rx="5" />
      <path d="M15 14h10v10H15z" />
      <path d="M15 27h10" />
    </svg>
  );
}

export function MiddlewareIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="8" width="24" height="7" rx="2" />
      <rect x="8" y="17" width="24" height="7" rx="2" />
      <rect x="8" y="26" width="24" height="7" rx="2" />
      <path d="M20 15v2M20 24v2" />
    </svg>
  );
}

export function OpenSourceIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M20 8a8 8 0 0 0-8 8c0 6 8 16 8 16s8-10 8-16a8 8 0 0 0-8-8z" />
      <path d="M20 13v8M16 17h8" />
    </svg>
  );
}

export function CommercialIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="12" />
      <path d="M24 15c-1-1-2.5-2-4.5-2-2.5 0-4.5 1.3-4.5 3.5s1.8 3 4.4 3.6 4.6 1.3 4.6 3.9-2.3 4-5 4c-2 0-3.9-.7-5.1-2" />
      <path d="M20 11v18" />
    </svg>
  );
}

export function GplIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M8 14a10 10 0 1 1 4 18" />
      <path d="M20 20h7" />
      <path d="M20 15h8" />
      <path d="M20 25h5" />
    </svg>
  );
}

export function StudentLicenseIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M7 14h26v18H7z" />
      <path d="M11 14V9h18v5" />
      <path d="M13 23h7M13 27h11" />
      <circle cx="27" cy="24" r="3" />
    </svg>
  );
}

export function ModuleIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="8" width="10" height="10" rx="1" />
      <rect x="22" y="8" width="10" height="10" rx="1" />
      <rect x="15" y="22" width="10" height="10" rx="1" />
      <path d="M18 13h4M20 18v4" />
    </svg>
  );
}

export function PackageIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M20 7 31 13v14L20 33 9 27V13z" />
      <path d="M20 7v12M9 13l11 6 11-6" />
      <path d="M20 19v14" />
    </svg>
  );
}

export function DependencyIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="10" width="9" height="9" rx="1" />
      <rect x="24" y="10" width="9" height="9" rx="1" />
      <rect x="15" y="23" width="10" height="9" rx="1" />
      <path d="M16 14h8M20 19v4" />
    </svg>
  );
}

export function ItInstallIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M20 8v14" />
      <path d="M14 16l6 6 6-6" />
      <rect x="9" y="25" width="22" height="7" rx="2" />
      <path d="M15 28h10" />
    </svg>
  );
}

export function RollbackIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M13 14H7v-6" />
      <path d="M8 13a13 13 0 1 1-1 12" />
      <path d="M20 14v7l5 3" />
    </svg>
  );
}

export function BlueGreenIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="11" width="11" height="18" rx="2" />
      <rect x="23" y="11" width="11" height="18" rx="2" />
      <path d="M17 20h6" />
      <path d="M11 16h1M11 20h1M11 24h1" />
      <path d="M28 16h1M28 20h1M28 24h1" />
    </svg>
  );
}

export function CanaryIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M11 27c0-7 4-12 10-12 5 0 8 3 8 7 0 6-5 10-11 10h-7z" />
      <path d="M29 22h4l-2 2" />
      <circle cx="24" cy="17" r="1.2" fill="currentColor" stroke="none" />
      <path d="M12 17l-4-3" />
    </svg>
  );
}

export function StrategyIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 9h20v22H10z" />
      <path d="M15 15h10M15 20h7M15 25h10" />
      <path d="m24 28 3 3 5-6" />
    </svg>
  );
}

export function RequestCountIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="22" width="4" height="8" rx="1" />
      <rect x="18" y="16" width="4" height="14" rx="1" />
      <rect x="28" y="11" width="4" height="19" rx="1" />
      <path d="M8 32h24" />
    </svg>
  );
}

export function LatencyIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M8 27c3-8 8-12 12-12s7 2 12 10" />
      <path d="M20 20l6-6" />
      <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ErrorRateIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M9 29 18 20l5 5 8-11" />
      <path d="M28 14h6v6" />
      <circle cx="18" cy="20" r="2" />
      <circle cx="23" cy="25" r="2" />
    </svg>
  );
}

export function AlertIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M20 8a9 9 0 0 1 9 9v4l3 4H8l3-4v-4a9 9 0 0 1 9-9z" />
      <path d="M16 30a4 4 0 0 0 8 0" />
      <path d="M29 11h4M31 9v4" />
    </svg>
  );
}

export function PullRequestIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="12" cy="10" r="3" />
      <circle cx="28" cy="30" r="3" />
      <circle cx="28" cy="10" r="3" />
      <path d="M12 13v17a5 5 0 0 0 5 5h8" />
      <path d="M25 10H17a5 5 0 0 0-5 5v3" />
    </svg>
  );
}

export function CodeCommentIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M8 10h24v14H18l-6 6v-6H8z" />
      <path d="m16 16-3 2 3 2M24 16l3 2-3 2" />
    </svg>
  );
}

export function CodeEditIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="9" width="16" height="20" rx="2" />
      <path d="M13 15h6M13 20h6" />
      <path d="m24 24 8-8 3 3-8 8-5 1z" />
    </svg>
  );
}

export function MergeIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="12" cy="10" r="3" />
      <circle cx="12" cy="30" r="3" />
      <circle cx="28" cy="20" r="3" />
      <path d="M12 13v10c0 4 3 7 7 7h6" />
      <path d="M12 27v-6c0-4 3-7 7-7h6" />
    </svg>
  );
}
