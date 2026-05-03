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

export function StructuredIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="9" width="26" height="22" rx="2" />
      <path d="M7 16h26M7 23h26M15 9v22M25 9v22" />
    </svg>
  );
}

export function SemiStructuredIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M14 8h12" />
      <path d="M11 14h5v12h-5" />
      <path d="M24 14h5v12h-5" />
      <path d="M18 18h4M18 22h7" />
      <path d="M10 8c-3 2-4 4-4 8s1 6 4 8M30 8c3 2 4 4 4 8s-1 6-4 8" />
    </svg>
  );
}

export function UnstructuredIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="9" width="24" height="22" rx="3" />
      <path d="M13 24c3-8 7-10 14-8" />
      <path d="M13 18c2 2 4 3 6 3 3 0 4-2 8-2" />
      <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="25" cy="26" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DataChoiceIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M8 11h24v18H8z" />
      <path d="M14 17h12M14 22h8" />
      <path d="M25 27l3 3 5-5" />
    </svg>
  );
}

export function FetchIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="10" width="11" height="20" rx="2" />
      <rect x="22" y="10" width="11" height="20" rx="2" />
      <path d="M18 20h9" />
      <path d="m24 16 4 4-4 4" />
    </svg>
  );
}

export function DecodeIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="9" width="26" height="22" rx="2" />
      <path d="M12 15h16M12 20h10M12 25h6" />
      <path d="m24 24 3 3 5-6" />
    </svg>
  );
}

export function ExecuteItIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="9" y="7" width="22" height="26" rx="2" />
      <path d="M14 13h12" />
      <path d="M15 20h3M15 25h3M21 20h3M21 25h3" />
      <path d="M27 22h4M29 20v4" />
    </svg>
  );
}

export function StoreIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M9 8h18l4 4v20H9z" />
      <path d="M13 8v8h10V8" />
      <rect x="14" y="22" width="12" height="7" rx="1" />
      <path d="M26 24h4" />
    </svg>
  );
}

export function RegisterIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="14" width="26" height="12" rx="2" />
      <rect x="11" y="17" width="4" height="6" />
      <rect x="18" y="17" width="4" height="6" />
      <rect x="25" y="17" width="4" height="6" />
      <path d="M9 10h22" />
    </svg>
  );
}

export function ProgramIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="7" width="24" height="26" rx="2" />
      <path d="M8 13h24" />
      <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d="M13 19h14M13 24h10M13 29h6" />
    </svg>
  );
}

export function ProcessIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="10" width="10" height="20" rx="2" />
      <rect x="23" y="10" width="10" height="20" rx="2" />
      <path d="M17 20h6" />
      <path d="m20 16 3 4-3 4" />
    </svg>
  );
}

export function TerminateIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="12" />
      <path d="M16 16l8 8M24 16l-8 8" />
      <path d="M20 8v4" />
    </svg>
  );
}

export function RecentValueIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="12" />
      <path d="M20 13v7l4 3" />
      <path d="M12 10h6" />
    </svg>
  );
}

export function NearValueIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="13" width="8" height="14" rx="1" />
      <rect x="18" y="13" width="6" height="14" rx="1" />
      <rect x="26" y="13" width="6" height="14" rx="1" />
    </svg>
  );
}

export function CacheHitIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="9" y="10" width="22" height="20" rx="2" />
      <path d="M13 20l4 4 10-10" />
      <path d="M9 14h-3M9 20h-3M31 14h3M31 20h3" />
    </svg>
  );
}

export function CacheMissIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="9" y="10" width="22" height="20" rx="2" />
      <path d="M15 16l10 10M25 16 15 26" />
      <path d="M9 14h-3M9 20h-3M31 14h3M31 20h3" />
    </svg>
  );
}

export function CacheLevelIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="8" width="24" height="24" rx="2" />
      <rect x="12" y="12" width="16" height="16" />
      <rect x="16" y="16" width="8" height="8" />
      <path d="M9 10h4M9 15h3M31 10h-4M31 15h-3" />
    </svg>
  );
}

export function CsvIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="8" width="26" height="24" rx="2" />
      <path d="M7 16h26M7 24h26M16 8v24M24 8v24" />
      <path d="M11 12h1M19 12h1M27 12h1" />
    </svg>
  );
}

export function JsonIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M15 9c-3 1-4 3-4 6v3c0 2-1 3-3 4 2 1 3 2 3 4v3c0 3 1 5 4 6" />
      <path d="M25 9c3 1 4 3 4 6v3c0 2 1 3 3 4-2 1-3 2-3 4v3c0 3-1 5-4 6" />
      <path d="M18 16h4M18 24h4" />
    </svg>
  );
}

export function XmlIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="m13 16-5 4 5 4" />
      <path d="m27 16 5 4-5 4" />
      <path d="M22 12 18 28" />
      <path d="M15 10h10" />
    </svg>
  );
}

export function FormatChoiceIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="9" width="24" height="22" rx="3" />
      <path d="M13 15h14M13 20h10M13 25h7" />
      <circle cx="28" cy="27" r="5" />
      <path d="M28 24v6M25 27h6" />
    </svg>
  );
}

export function UnitIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="10" y="10" width="20" height="20" rx="3" />
      <path d="M16 16h8v8h-8z" />
      <path d="M20 6v4M20 30v4M6 20h4M30 20h4" />
    </svg>
  );
}

export function IntegrationIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="12" width="10" height="10" rx="2" />
      <rect x="24" y="12" width="10" height="10" rx="2" />
      <rect x="15" y="24" width="10" height="10" rx="2" />
      <path d="M16 17h8M20 22v2" />
    </svg>
  );
}

export function E2EIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="5" y="10" width="30" height="20" rx="3" />
      <path d="M10 20h20" />
      <path d="M26 16l4 4-4 4" />
      <path d="M14 16l-4 4 4 4" />
    </svg>
  );
}

export function BalanceItIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M20 7v24" />
      <path d="M11 13h18" />
      <path d="M12 13l-4 8h8z" />
      <path d="M28 13l-4 8h8z" />
      <path d="M13 21a4 2.5 0 0 1-6 0" />
      <path d="M27 21a4 2.5 0 0 1-6 0" />
      <path d="M14 33h12" />
    </svg>
  );
}

export function DataDupIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="11" width="13" height="13" rx="2" />
      <rect x="18" y="16" width="14" height="14" rx="2" />
      <path d="M21 21h6M21 25h6" />
    </svg>
  );
}

export function UpdateAnomalyIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="11" width="10" height="18" rx="2" />
      <rect x="22" y="11" width="10" height="18" rx="2" />
      <path d="M18 20h4" />
      <path d="m18 16 4 4-4 4" />
    </svg>
  );
}

export function NormalizeIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="9" width="9" height="22" rx="2" />
      <rect x="19" y="9" width="14" height="9" rx="2" />
      <rect x="19" y="22" width="14" height="9" rx="2" />
      <path d="M16 20h3M26 18v4" />
    </svg>
  );
}

export function QueryBalanceIcon() {
  return <BalanceItIcon />;
}

export function FullScanIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="9" width="26" height="22" rx="2" />
      <path d="M12 15h16M12 20h16M12 25h11" />
      <path d="m25 25 3 3 5-5" opacity="0.5" />
    </svg>
  );
}

export function IndexIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M11 8h18v24l-5-3-4 3-4-3-5 3z" />
      <path d="M15 14h10M15 19h10M15 24h7" />
    </svg>
  );
}

export function SeekIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="17" cy="17" r="7" />
      <path d="m22 22 7 7" />
      <path d="M17 14v6M14 17h6" />
    </svg>
  );
}

export function IndexCostIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M11 9h18v18H11z" />
      <path d="M15 15h10M15 20h6" />
      <circle cx="28" cy="28" r="7" />
      <path d="M28 24v8M24 28h8" />
    </svg>
  );
}

export function RedTestIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="12" />
      <path d="M15 15l10 10M25 15 15 25" />
      <path d="M20 8v2" />
    </svg>
  );
}

export function GreenTestIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="12" />
      <path d="M14 20l4 4 8-8" />
      <path d="M20 8v2" />
    </svg>
  );
}

export function RefactorIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 12h14l-3-3" />
      <path d="M30 28H16l3 3" />
      <path d="M26 9v6" />
      <path d="M14 25v6" />
      <rect x="16" y="16" width="8" height="8" rx="2" />
    </svg>
  );
}

export function LoopIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="11" />
      <path d="M20 9a11 11 0 0 1 10 7" />
      <path d="M30 16v-5h-5" />
      <path d="M20 31a11 11 0 0 1-10-7" />
      <path d="M10 24v5h5" />
    </svg>
  );
}

export function CommitDetectIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="11" cy="20" r="3" />
      <circle cx="21" cy="20" r="3" />
      <path d="M14 20h4" />
      <path d="M24 20h5" />
      <path d="M27 16l4 4-4 4" />
    </svg>
  );
}

export function ItBuildIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="10" width="24" height="20" rx="3" />
      <path d="M14 20h12" />
      <path d="M17 15l-3 5 3 5" />
      <path d="M23 15l3 5-3 5" />
    </svg>
  );
}

export function ItTestIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="9" y="8" width="22" height="26" rx="3" />
      <path d="M14 15h12M14 20h8" />
      <path d="M15 26l3 3 7-7" />
    </svg>
  );
}

export function ReportLogIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="9" y="7" width="22" height="26" rx="3" />
      <path d="M14 15h12M14 20h12M14 25h7" />
      <path d="M24 24l2 2 4-5" />
    </svg>
  );
}

export function DevIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="9" width="28" height="22" rx="3" />
      <path d="M12 20l4-4-4-4M20 24h8" />
    </svg>
  );
}

export function StagingIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M8 30V12l12-6 12 6v18H8z" />
      <path d="M14 22h12M14 17h12" />
      <path d="M20 6v24" />
    </svg>
  );
}

export function ProdIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M9 30V14l11-7 11 7v16H9z" />
      <path d="M15 30v-8h10v8" />
      <path d="M17 17h6" />
    </svg>
  );
}

export function CdIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="11" width="8" height="18" rx="2" />
      <rect x="17" y="16" width="8" height="13" rx="2" />
      <rect x="28" y="8" width="6" height="21" rx="2" />
      <path d="M10 8V5M21 13v-3M31 5V3" />
    </svg>
  );
}

export function AtomicityIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="14" cy="20" r="5" />
      <circle cx="26" cy="20" r="5" />
      <path d="M19 20h2M12 20h4M24 20h4" />
    </svg>
  );
}

export function ConsistencyIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 10h20v20H10z" />
      <path d="M16 16h8M16 21h8M16 26h8" />
      <path d="M13 16h1M13 21h1M13 26h1" />
    </svg>
  );
}

export function IsolationIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="10" width="9" height="20" rx="2" />
      <rect x="23" y="10" width="9" height="20" rx="2" />
      <path d="M17 20h6" />
      <path d="M19 14v12" />
      <path d="M21 14v12" />
    </svg>
  );
}

export function DurabilityIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 11h20v18H10z" />
      <path d="M15 11V8h10v3" />
      <path d="M15 24l3 3 7-7" />
    </svg>
  );
}

export function BackupItIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <ellipse cx="20" cy="11" rx="9" ry="3.5" />
      <path d="M11 11v12a9 3.5 0 0 0 18 0V11" />
      <path d="M20 16v8" />
      <path d="m16 20 4 4 4-4" />
    </svg>
  );
}

export function RpoIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="12" />
      <path d="M20 14v7l4 2" />
      <path d="M11 11l3 3M29 11l-3 3" />
    </svg>
  );
}

export function RtoIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="17" cy="17" r="7" />
      <path d="m22 22 7 7" />
      <path d="M17 14v4l3 2" />
      <path d="M28 11v6h-6" />
    </svg>
  );
}

export function DrillItIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M9 30V13l11-5 11 5v17H9z" />
      <path d="M15 20h10M20 15v10" />
      <path d="M14 30v-5h12v5" />
    </svg>
  );
}

export function GoalIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="11" />
      <circle cx="20" cy="20" r="6" />
      <circle cx="20" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <path d="M29 11l-4 4" />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 30V12" />
      <path d="M10 30h20" />
      <rect x="14" y="20" width="3" height="10" />
      <rect x="19" y="16" width="3" height="14" />
      <rect x="24" y="12" width="3" height="18" />
    </svg>
  );
}

export function AxisIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 30V11" />
      <path d="M10 30h20" />
      <path d="M14 25l4-6 4 3 5-8" />
      <path d="M13 15h2M13 20h2M18 29v-2M23 29v-2" />
    </svg>
  );
}

export function SimplifyIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 13h20" />
      <path d="M10 20h14" />
      <path d="M10 27h8" />
      <path d="m24 25 3 3 5-6" />
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

export function FrontendIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="8" width="28" height="20" rx="3" />
      <path d="M14 28v4M26 28v4M11 32h18" />
      <path d="m15 15-4 5 4 5M25 15l4 5-4 5" />
    </svg>
  );
}

export function BackendIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <ellipse cx="20" cy="11" rx="11" ry="4" />
      <path d="M9 11v18a11 4 0 0 0 22 0V11" />
      <path d="M9 19a11 4 0 0 0 22 0M9 25a11 4 0 0 0 22 0" />
    </svg>
  );
}

export function ApiIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="10" width="10" height="20" rx="2" />
      <rect x="23" y="10" width="10" height="20" rx="2" />
      <path d="M17 20h6" />
      <path d="m19 16 4 4-4 4" />
      <path d="M11 17h2M27 23h2" />
    </svg>
  );
}

export function SeparationIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="12" width="10" height="16" rx="2" />
      <rect x="23" y="12" width="10" height="16" rx="2" />
      <path d="M20 8v24" />
      <path d="M11 20h2M27 20h2" />
    </svg>
  );
}

export function HtmlIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 8h20l-2 24H12z" />
      <path d="m16 15-4 5 4 5M24 15l4 5-4 5" />
    </svg>
  );
}

export function CssIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 8h20l-2 24H12z" />
      <path d="M15 15h10M14 20h12M15 25h8" />
    </svg>
  );
}

export function JsIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="9" y="9" width="22" height="22" rx="3" />
      <path d="M15 15v9c0 2-1 3-3 3" />
      <path d="M23 15c2 0 4 1 4 3s-2 3-4 3-4 1-4 3 2 3 4 3" />
    </svg>
  );
}

export function IntegrationItIcon() {
  return <IntegrationIcon />;
}

export function HttpRequestIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="12" width="17" height="16" rx="2" />
      <path d="M25 20h7" />
      <path d="m28 16 4 4-4 4" />
      <path d="M12 18h7M12 22h9" />
    </svg>
  );
}

export function RestResourceIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 10h20v20H10z" />
      <path d="M14 16h12M14 21h9M14 26h6" />
      <circle cx="26" cy="14" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HttpMethodIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 29h20" />
      <rect x="11" y="14" width="4" height="10" rx="1" />
      <rect x="18" y="10" width="4" height="14" rx="1" />
      <rect x="25" y="17" width="4" height="7" rx="1" />
    </svg>
  );
}

export function StatelessItIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="12" width="10" height="16" rx="2" />
      <rect x="23" y="12" width="10" height="16" rx="2" />
      <path d="m18 20 4-4M18 20l4 4" />
      <path d="M12 17h0M28 23h0" />
    </svg>
  );
}

export function SpaInitIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="8" width="26" height="24" rx="3" />
      <path d="m16 15 8 5-8 5z" />
      <path d="M11 12h18" />
    </svg>
  );
}

export function SpaNavIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="10" width="28" height="18" rx="3" />
      <path d="M12 19h12" />
      <path d="m22 15 5 4-5 4" />
      <path d="M12 14h2M12 24h2" />
    </svg>
  );
}

export function SsrInitIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="10" width="14" height="18" rx="2" />
      <rect x="23" y="10" width="10" height="18" rx="2" />
      <path d="M13 16h2M13 22h4" />
      <path d="m21 19 2 2 4-4" />
    </svg>
  );
}

export function HybridIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="10" width="10" height="18" rx="2" />
      <rect x="23" y="10" width="10" height="18" rx="2" />
      <path d="M17 19h6" />
      <path d="M20 14v10" />
    </svg>
  );
}

export function LocalIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="10" width="26" height="18" rx="3" />
      <path d="M13 28v4M27 28v4M11 32h18" />
      <path d="M12 18h10M12 22h6" />
    </svg>
  );
}

export function SharedIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M11 11h18v18H11z" />
      <path d="M15 15h10M15 20h10M15 25h6" />
      <path d="M7 15h4M29 20h4M20 29v4" />
    </svg>
  );
}

export function UpdateIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M11 18a9 9 0 0 1 15-5" />
      <path d="M29 22a9 9 0 0 1-15 5" />
      <path d="M24 9h3v3" />
      <path d="M13 28h3v3" />
    </svg>
  );
}

export function ToolPickIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="6" y="9" width="28" height="22" rx="3" />
      <path d="M12 16h10M12 21h7" />
      <path d="m24 24 3 3 6-6" />
    </svg>
  );
}

export function DryIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="10" width="10" height="16" rx="2" />
      <rect x="22" y="10" width="10" height="16" rx="2" />
      <path d="M18 18h4" />
      <path d="m17 14 3 4-3 4" />
    </svg>
  );
}

export function ComponentIcon() {
  return <IntegrationIcon />;
}

export function PickItIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="7" y="9" width="26" height="22" rx="2" />
      <path d="M14 16h12M14 21h8" />
      <path d="M25 25l3 3 5-5" />
    </svg>
  );
}

export function TeamRuleIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="13" cy="14" r="3" />
      <circle cx="27" cy="14" r="3" />
      <path d="M8 30c0-4 2-7 5-7s5 3 5 7" />
      <path d="M22 30c0-4 2-7 5-7s5 3 5 7" />
      <path d="M18 10h4M20 8v4" />
    </svg>
  );
}

export function DevServerIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <rect x="8" y="8" width="24" height="24" rx="3" />
      <path d="M14 19l4-4-4-4M23 24h5" />
      <path d="M23 15h3" />
    </svg>
  );
}

export function BundleItIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M20 7 31 13v14L20 33 9 27V13z" />
      <path d="M20 7v12M9 13l11 6 11-6" />
      <path d="M20 19v14" />
    </svg>
  );
}

export function OptimizeItIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="10" />
      <path d="M20 20l6-8" />
      <path d="M20 10v10l6 4" />
      <path d="M20 20h8" />
    </svg>
  );
}

export function DeployItIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M20 8v13" />
      <path d="M14 16l6 6 6-6" />
      <rect x="8" y="25" width="24" height="7" rx="2" />
      <path d="M14 28h12" />
    </svg>
  );
}
