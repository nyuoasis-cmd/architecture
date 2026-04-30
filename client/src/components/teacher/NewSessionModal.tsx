import { useState } from 'react';
import { CHAPTERS } from '../../data/qa-stubs';
import { createSession, type SessionRecord } from '../../lib/session-client';

type NewSessionModalProps = {
  onClose: () => void;
  onCreated: (session: SessionRecord) => void;
};

const MAX_PARTICIPANT_OPTIONS = [50, 100, 200] as const;

export default function NewSessionModal({ onClose, onCreated }: NewSessionModalProps) {
  const [name, setName] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<number[]>([6]);
  const [maxParticipants, setMaxParticipants] = useState<(typeof MAX_PARTICIPANT_OPTIONS)[number]>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && selectedChapters.length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const session = await createSession({
        name: name.trim(),
        chapterIds: selectedChapters,
        maxParticipants,
      });
      onCreated(session);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '세션 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(28,25,23,0.24)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-quaternary)]">New Session</p>
            <h2 className="mt-2 text-2xl font-medium text-[var(--color-text-primary)]">새 세션 만들기</h2>
          </div>
          <button className="btn-ghost-sm" onClick={onClose} type="button">
            닫기
          </button>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--color-text-body)]">세션명</span>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 outline-none focus:border-[var(--color-text-quaternary)]"
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="예: 운영체제 3교시"
              value={name}
            />
          </label>

          <section>
            <div className="mb-2 text-sm font-medium text-[var(--color-text-body)]">챕터 선택</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CHAPTERS.map((chapter) => {
                const checked = selectedChapters.includes(chapter.id);
                return (
                  <label
                    key={chapter.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 ${
                      checked ? 'border-[var(--color-text-primary)] bg-[var(--color-btn-primary-hover)] text-white' : 'border-[var(--color-border)] bg-white'
                    }`}
                  >
                    <input
                      checked={checked}
                      className="h-4 w-4"
                      onChange={() =>
                        setSelectedChapters((current) =>
                          checked
                            ? current.filter((item) => item !== chapter.id)
                            : [...current, chapter.id].sort((a, b) => a - b),
                        )
                      }
                      type="checkbox"
                    />
                    <span className="text-sm">
                      {chapter.emoji} {chapter.id}장 {chapter.title}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-2 text-sm font-medium text-[var(--color-text-body)]">최대 인원</div>
            <div className="flex gap-2">
              {MAX_PARTICIPANT_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={`rounded-full px-4 py-2 text-sm ${
                    maxParticipants === option
                      ? 'bg-[var(--color-btn-primary)] text-white'
                      : 'border border-[var(--color-border)] bg-white text-[var(--color-text-body)]'
                  }`}
                  onClick={() => setMaxParticipants(option)}
                  type="button"
                >
                  {option}명
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-sm text-rose-600">{error}</div>
          <button
            className="min-h-11 rounded-2xl bg-[var(--color-btn-primary-hover)] px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[var(--color-border-hover)]"
            disabled={!canSubmit}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? '만드는 중...' : '만들기'}
          </button>
        </div>
      </div>
    </div>
  );
}
