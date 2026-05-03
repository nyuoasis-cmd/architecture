import { ICON_BASE } from './_base';

export function IaasIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 28h20a6 6 0 0 0 1-12 8 8 0 0 0-15-2 5 5 0 0 0-6 5 5 5 0 0 0 0 9z" />
      <rect x="12" y="18" width="5" height="7" rx="1" />
      <rect x="19" y="16" width="5" height="9" rx="1" />
      <rect x="26" y="20" width="3" height="5" rx="1" />
    </svg>
  );
}

export function PaasIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 28h20a6 6 0 0 0 1-12 8 8 0 0 0-15-2 5 5 0 0 0-6 5 5 5 0 0 0 0 9z" />
      <path d="M13 22h14" />
      <path d="M15 18h10" />
      <path d="M17 26h6" />
    </svg>
  );
}

export function SaasIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <path d="M10 28h20a6 6 0 0 0 1-12 8 8 0 0 0-15-2 5 5 0 0 0-6 5 5 5 0 0 0 0 9z" />
      <rect x="13" y="16" width="14" height="10" rx="2" />
      <path d="M17 29v2M23 29v2" />
    </svg>
  );
}

export function SubscriptionIcon() {
  return (
    <svg {...ICON_BASE} aria-hidden>
      <circle cx="20" cy="20" r="12" />
      <path d="M20 12v8l5 3" />
      <path d="M25 10l4 1-1 4" />
    </svg>
  );
}
