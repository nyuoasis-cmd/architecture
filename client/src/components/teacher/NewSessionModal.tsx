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
  const [maxParticipants, setMaxParticipants] = useState<(typeof MAX_PARTICIPANT_OPTIONS)[number]>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChapterIds = CHAPTERS.map((chapter) => chapter.id);
  const canSubmit = name.trim().length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const session = await createSession({
        name: name.trim(),
        chapterIds: allChapterIds,
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
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">New Session</p>
            <h2 className="mt-2 text-2xl font-medium text-stone-900">새 세션 만들기</h2>
          </div>
          <button className="btn-ghost-sm" onClick={onClose} type="button">
            닫기
          </button>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">세션명</span>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-stone-50 px-4 py-3 outline-none focus:border-stone-400"
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="예: 운영체제 3교시"
              value={name}
            />
          </label>

          <section>
            <div className="rounded-2xl bg-stone-50 px-4 py-3 text-xs text-stone-600">
              📚 모든 챕터(1장~10장 · 71개 Q&A)가 학생들에게 열립니다.
            </div>
          </section>

          <section>
            <div className="mb-2 text-sm font-medium text-stone-700">최대 인원</div>
            <div className="flex gap-2">
              {MAX_PARTICIPANT_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={`rounded-full px-4 py-2 text-sm ${
                    maxParticipants === option
                      ? 'bg-stone-900 text-white'
                      : 'border border-[var(--color-border)] bg-white text-stone-700'
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
            className="min-h-11 rounded-2xl bg-stone-950 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-300"
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
