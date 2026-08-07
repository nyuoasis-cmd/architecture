import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type QrFullscreenModalProps = {
  code: string;
  onClose: () => void;
};

export default function QrFullscreenModal({ code, onClose }: QrFullscreenModalProps) {
  const joinUrl =
    typeof window === 'undefined'
      ? `https://architecture.teachermate.co.kr/join?code=${code}`
      : `${window.location.origin}/join?code=${code}`;

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-auto bg-black/40 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-labelledby="qr-fullscreen-title"
        aria-modal="true"
        className="relative m-auto max-w-[92vw] rounded-xl bg-white p-6 shadow-[0_30px_80px_rgba(28,25,23,0.24)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">Join Code</p>
            <h2 className="mt-2 text-2xl font-medium text-stone-900" id="qr-fullscreen-title">
              QR로 수업에 참여
            </h2>
          </div>
          <button
            aria-label="닫기"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-stone-700 hover:bg-stone-50"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-5">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <QRCodeSVG bgColor="#ffffff" className="block h-auto w-[min(70vw,70vh)] md:w-[min(45vw,45vh)]" fgColor="#111827" includeMargin value={joinUrl} />
          </div>

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">참여 코드</p>
            <div className="mt-2 rounded-2xl bg-stone-950 px-6 py-3 font-mono text-[clamp(96px,18vw,200px)] font-bold leading-none tracking-[0.12em] text-white">
              {code}
            </div>
          </div>

          <p className="text-center text-sm text-stone-600">
            QR을 스캔하거나 <span className="font-mono text-stone-900">{joinUrl}</span> 로 접속해 코드를 입력하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
