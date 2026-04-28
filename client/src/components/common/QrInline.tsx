import { QRCodeSVG } from 'qrcode.react';

type QrInlineProps = {
  code: string;
  size?: number;
  className?: string;
};

export default function QrInline({ code, size = 132, className }: QrInlineProps) {
  const joinUrl =
    typeof window === 'undefined'
      ? `https://architecture.teachermate.co.kr/join?code=${code}`
      : `${window.location.origin}/join?code=${code}`;

  return (
    <div
      className={`inline-flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-4 ${className ?? ''}`.trim()}
    >
      <QRCodeSVG bgColor="#ffffff" fgColor="#111827" includeMargin size={size} value={joinUrl} />
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Join URL</div>
        <div className="mt-1 text-xs text-stone-600">{joinUrl}</div>
      </div>
    </div>
  );
}
