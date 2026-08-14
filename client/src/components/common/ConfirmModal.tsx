import { useEffect, useRef } from 'react';

/**
 * 되돌릴 수 없는 일(수업 종료·삭제) 앞에 서는 확인 모달. BUILDER-UX-POLICY §6.
 *
 * 🚨 왜 있는가(2026-08-14): 수업 현황 화면의 「수업 종료」가 **확인 없이 즉시** 실행됐다.
 *    confirm() 도 아니고 아예 아무것도 묻지 않았다 — 진행 중인 수업이 오클릭 한 번에 끝났다.
 *    학생들은 그 순간부터 못 들어온다.
 *
 * 🔑 닫는 길은 셋이다(백드롭·ESC·X). 하나만 두면 «어떻게 무르지»에서 교사가 멈춘다.
 *    파괴적 확인 버튼은 절대 자동 포커스하지 않는다 — Enter 한 번에 수업이 끝난다.
 */
export type ConfirmModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  /** 진행 중 라벨. 없으면 confirmLabel 을 그대로 쓴다. */
  pendingLabel?: string;
  cancelLabel?: string;
  /** 파괴적(삭제)이면 rose, 아니면 stone. 종료는 되돌릴 수 없지만 기록은 남아 stone 이다. */
  tone?: 'destructive' | 'default';
  error?: string | null;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel = '취소',
  tone = 'default',
  error = null,
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // 🔑 포커스는 「취소」에 둔다 — 열자마자 Enter 를 눌러도 아무 일도 일어나지 않게.
    cancelRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const confirmClass =
    tone === 'destructive'
      ? 'inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60'
      : 'inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        aria-modal="true"
        className="w-full max-w-[400px] rounded-t-2xl bg-white p-6 shadow-lg sm:w-[90%] sm:rounded-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[17px] font-semibold text-stone-900">{title}</h2>
          <button
            aria-label="닫기"
            className="-mr-1 -mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-50 hover:text-stone-700"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
            disabled={isPending}
            onClick={onClose}
            ref={cancelRef}
            type="button"
          >
            {cancelLabel}
          </button>
          <button className={confirmClass} disabled={isPending} onClick={onConfirm} type="button">
            {isPending ? (pendingLabel ?? confirmLabel) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
