import { useState } from 'react';
import { CHAPTERS } from '../../data/qa-stubs';
import { createSession, type SessionRecord } from '../../lib/session-client';

// 🚨 서버가 세션의 chapter_ids 를 1~10 으로 막는다(server/src/routes/sessions.ts).
//    즉 11장 이후(바이브코딩)는 수업 세션으로 열 수 없고 라이브러리 자습으로만 닿는다.
//    이 상한이 바뀌면 여기 문구도 함께 움직여야 한다 — 예전에는 문항 수가 손으로 적혀 있었고,
//    실제(64개)와 어긋난 채 교사에게 그대로 보여지고 있었다.
const SESSION_MAX_CHAPTER_ID = 10;
const SESSION_QA_COUNT = CHAPTERS.filter((chapter) => chapter.id <= SESSION_MAX_CHAPTER_ID).reduce(
  (sum, chapter) => sum + chapter.qaCount,
  0,
);

type NewSessionModalProps = {
  onClose: () => void;
  onCreated: (session: SessionRecord) => void;
};

export default function NewSessionModal({ onClose, onCreated }: NewSessionModalProps) {
  const [name, setName] = useState('');
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
        maxParticipants: 100,
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
              📚 수업에서 열리는 챕터: 1장~{SESSION_MAX_CHAPTER_ID}장 · {SESSION_QA_COUNT}개 Q&A.
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
