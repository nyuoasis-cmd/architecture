import { useState } from 'react';
import { CHAPTERS } from '../../data/qa-stubs';
import { createSession, type SessionRecord } from '../../lib/session-client';

// 🚨 2026-08-11: 서버가 chapter_ids 를 1~10 으로 막던 것을 풀었다(등록부 전체 허용).
//    이제 바이브코딩 강도 수업 세션으로 열린다 — 그전에는 라이브러리 자습으로만 닿았다.
// 🔑 강 수도 문항 수도 손으로 적지 않는다. 둘 다 챕터 데이터에서 계산한다 —
//    예전에 손으로 적힌 문항 수가 실제(64개)와 어긋난 채 교사에게 그대로 보여지고 있었다.
//    서버 등록부와 이 값이 어긋나지 않는지는 qaCountCopy.test.ts 가 «평가해서» 대조한다.
// 🚨 교사에게 말하는 것은 «강 수»(진열 번호의 끝)이지 속 이름표의 최댓값이 아니다.
//    둘은 실습 강이 섞여 들어와도 우연히 같을 수 있어, 같다고 믿고 쓰면 조용히 어긋난다.
const SESSION_LESSON_COUNT = CHAPTERS.length;
const SESSION_QA_COUNT = CHAPTERS.reduce((sum, chapter) => sum + chapter.qaCount, 0);

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
      setError(caught instanceof Error ? caught.message : '수업을 만들지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(28,25,23,0.24)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium text-stone-900">수업 만들기</h2>
            <p className="mt-2 text-sm text-stone-500">수업 이름을 입력하면 참여 코드가 자동 발급돼요</p>
          </div>
          <button aria-label="닫기" className="btn-ghost-sm" onClick={onClose} type="button">
            닫기
          </button>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">수업 이름</span>
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
              📚 수업에서 열리는 강: 1강~{SESSION_LESSON_COUNT}강 · {SESSION_QA_COUNT}개 Q&A.
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
