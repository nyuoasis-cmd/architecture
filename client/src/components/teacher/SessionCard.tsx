import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CHAPTERS } from '../../data/qa-stubs';
import { formatRelativeTime } from '../../lib/format';
import type { SessionRecord } from '../../lib/session-client';
import QrInline from '../common/QrInline';

type SessionCardProps = {
  session: SessionRecord;
};

export default function SessionCard({ session }: SessionCardProps) {
  const [showQr, setShowQr] = useState(false);
  const chapterLabels = session.chapter_ids
    .map((chapterId) => CHAPTERS.find((chapter) => chapter.id === chapterId)?.title)
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      className={`rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-sm ${
        session.status === 'ended' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-surface-hover)] px-2 py-1 text-[11px] font-medium text-[var(--color-text-body)]">
              {session.status === 'active' ? '진행 중' : '종료됨'}
            </span>
            <span className="text-xs text-[var(--color-text-quaternary)]">{formatRelativeTime(session.created_at)}</span>
          </div>
          <h3 className="text-xl font-medium text-[var(--color-text-primary)]">{session.name}</h3>
          <p className="mt-2 text-sm text-[var(--color-text-body)]">{chapterLabels}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-[var(--color-btn-primary-hover)] px-4 py-2 font-mono text-lg tracking-[0.35em] text-white">
              {session.code}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">참여자 {session.participant_count ?? 0}명</div>
          </div>
        </div>

        <div className="flex items-end gap-2 self-stretch lg:self-end">
          <button className="btn-ghost-sm" onClick={() => setShowQr((current) => !current)} type="button">
            {showQr ? 'QR 닫기' : 'QR 보기'}
          </button>
          <Link className="btn-primary-sm flex items-center justify-center" to={`/teacher/session/${session.id}`}>
            세션 진행으로
          </Link>
        </div>
      </div>

      {showQr ? <QrInline className="mt-4" code={session.code} /> : null}
    </article>
  );
}
