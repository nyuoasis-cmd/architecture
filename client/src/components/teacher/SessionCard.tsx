import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CHAPTERS } from '../../data/qa-stubs';
import { formatRelativeTime } from '../../lib/format';
import { deleteSession, SessionClientError, type SessionRecord } from '../../lib/session-client';
import { useSessionStore } from '../../store/session-store';
import QrInline from '../common/QrInline';

type SessionCardProps = {
  session: SessionRecord;
};

export default function SessionCard({ session }: SessionCardProps) {
  const [showQr, setShowQr] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const removeTeacherSession = useSessionStore((state) => state.removeTeacherSession);

  const chapterLabels = session.chapter_ids
    .map((chapterId) => CHAPTERS.find((chapter) => chapter.id === chapterId)?.title)
    .filter(Boolean)
    .join(' · ');

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteSession(session.id);
      removeTeacherSession(session.id);
    } catch (caught) {
      setIsDeleting(false);
      const message =
        caught instanceof SessionClientError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : '세션을 삭제하지 못했습니다.';
      setDeleteError(message);
    }
  };

  return (
    <article
      className={`rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-sm ${
        session.status === 'ended' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600">
              {session.status === 'active' ? '진행 중' : '종료됨'}
            </span>
            <span className="text-xs text-stone-400">{formatRelativeTime(session.created_at)}</span>
          </div>
          <h3 className="text-xl font-medium text-stone-900">{session.name}</h3>
          <p className="mt-2 text-sm text-stone-600">{chapterLabels}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-stone-950 px-4 py-2 font-mono text-lg tracking-[0.35em] text-white">
              {session.code}
            </div>
            <div className="text-sm text-stone-500">참여자 {session.participant_count ?? 0}명</div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2 self-stretch lg:self-end">
          <button className="btn-ghost-sm" onClick={() => setShowQr((current) => !current)} type="button">
            {showQr ? 'QR 닫기' : 'QR 보기'}
          </button>
          <button
            className="btn-ghost-sm text-rose-700 hover:bg-rose-50"
            onClick={() => {
              setIsConfirmingDelete(true);
              setDeleteError(null);
            }}
            type="button"
          >
            삭제
          </button>
          <Link className="btn-primary-sm flex items-center justify-center" to={`/teacher/session/${session.id}`}>
            세션 진행으로
          </Link>
        </div>
      </div>

      {isConfirmingDelete ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-900">이 세션을 삭제할까요?</p>
          <p className="mt-1 text-sm text-rose-800">
            참여자 명단과 학습 진도 기록도 함께 영구 삭제됩니다. 되돌릴 수 없어요.
          </p>
          {deleteError ? <p className="mt-2 text-sm text-rose-700">{deleteError}</p> : null}
          <div className="mt-3 flex gap-2">
            <button
              className="inline-flex min-h-9 items-center rounded-xl bg-rose-600 px-3 text-sm font-medium text-white disabled:opacity-60"
              disabled={isDeleting}
              onClick={handleDelete}
              type="button"
            >
              {isDeleting ? '삭제 중…' : '삭제하기'}
            </button>
            <button
              className="inline-flex min-h-9 items-center rounded-xl border border-rose-200 bg-white px-3 text-sm font-medium text-rose-800 disabled:opacity-60"
              disabled={isDeleting}
              onClick={() => {
                setIsConfirmingDelete(false);
                setDeleteError(null);
              }}
              type="button"
            >
              취소
            </button>
          </div>
        </div>
      ) : null}

      {showQr ? <QrInline className="mt-4" code={session.code} /> : null}
    </article>
  );
}
