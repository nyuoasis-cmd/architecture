import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type QrFullscreenProps = {
  code: string;
  onClose: () => void;
};

export default function QrFullscreen({ code, onClose }: QrFullscreenProps) {
  const joinUrl =
    typeof window === 'undefined'
      ? `https://architecture.teachermate.co.kr/join?code=${code}`
      : `${window.location.origin}/join?code=${code}`;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex overflow-auto bg-black/70 px-4 py-6"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="relative m-auto flex max-w-[92vw] flex-col items-center gap-5 rounded-3xl bg-white p-8 shadow-[0_30px_80px_rgba(28,25,23,0.32)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="닫기"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-lg">
          <QRCodeSVG bgColor="#ffffff" className="block h-auto w-[min(70vw,70vh)] md:w-[min(45vw,45vh)]" fgColor="#111827" includeMargin value={joinUrl} />
        </div>
        <p className="text-xs text-stone-400">QR 코드를 스캔하거나 코드를 입력하세요</p>
        <div className="text-center">
          <div className="font-mono text-[clamp(96px,18vw,200px)] font-bold leading-none tracking-[0.12em] text-stone-950">{code}</div>
          <div className="mt-2 break-all text-xs text-stone-500">{joinUrl}</div>
        </div>
      </div>
    </div>
  );
}
