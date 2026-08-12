import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CHAPTERS, getQasByChapterId } from '../data/qa-stubs';
import { createSession, SessionClientError } from '../lib/session-client';
import { useSessionStore } from '../store/session-store';

/**
 * 🎬 시연작 — 교사가 **학생이 겪는 것을 그대로 밟아 보이고**, 학생은 QR 로 그 자리에 들어와
 * 옆에서 따라오는 화면(B형. `shared/demo-screen-qr-inventory.md` §0).
 *
 * 여기는 그 첫 칸 = **무엇을 시연할지 고르는 목록**이다.
 *
 * 🚨 **매번 목록부터**(DESIGN-POLICY §9.H-14 v1.8). 직전에 고른 강으로 바로 들어가지 않는다 —
 *    시연은 «지난번 하던 것 이어서»가 아니라 그때그때 다른 것을 보여 주는 일이라, 이어받기는
 *    교사가 원치 않는 화면을 띄운다. 그래서 이 화면은 아무것도 기억하지 않는다(고른 값은
 *    이 컴포넌트 안에서만 살고, 나갈 때 사라진다).
 * 🚨 **들어올 때마다 새 시연 세션을 만든다.** 기존 세션을 재사용하면 지난 시연에 들어와 있던
 *    학생과 그 진도를 물려받는다(plan 앱이 실제로 그렇게 터졌다 — §1-B). 새로 만들면
 *    교사 신원만 그대로이고 진행은 0 에서 시작하며, **수업 세션의 학생 진도는 손대지 않는다.**
 */
export default function TeacherDemoPage() {
  const navigate = useNavigate();
  const prependTeacherSession = useSessionStore((state) => state.prependTeacherSession);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = CHAPTERS.find((chapter) => chapter.id === selectedChapterId);

  const start = async () => {
    if (!selected) {
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      // 🔑 이름에 「시연」을 박아 둔다 — 교사 대시보드에서 수업 세션과 섞여도 한눈에 갈린다.
      const session = await createSession({
        name: `🎬 시연 · ${selected.lessonNo}강 ${selected.title}`,
        chapterIds: [selected.id],
        maxParticipants: 100,
      });
      prependTeacherSession(session);
      navigate(`/learn/${session.id}?role=teacher&demo=1&qa=${getQasByChapterId(selected.id)[0]?.id ?? ''}`);
    } catch (caught) {
      setError(
        caught instanceof SessionClientError || caught instanceof Error
          ? caught.message
          : '시연을 시작하지 못했습니다.',
      );
      setIsStarting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-10">
      <Link
        className="inline-flex min-h-9 items-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
        to="/teacher"
      >
        ← 내 세션 관리
      </Link>

      <header className="mt-6">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">Teacher Demo</p>
        <h1 className="mt-3 text-4xl font-medium text-stone-950">🎬 시연작</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          학생이 겪을 화면을 교사가 직접 밟아 보이는 자리입니다. 강을 하나 고르면 시연용 참여 코드가 새로 만들어지고,
          학생은 QR로 같은 자리에 들어와 옆에서 따라올 수 있어요.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          시연은 <span className="font-medium text-stone-700">진행 중인 수업과 따로</span> 돕니다 — 학생들이 하고 있는 수업의
          진도는 건드리지 않습니다.
        </p>
      </header>

      {error ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="mt-8">
        <h2 className="text-lg font-medium text-stone-900">무엇을 시연할까요?</h2>
        <p className="mt-1 text-sm text-stone-500">들어올 때마다 처음부터 고릅니다. 지난번에 고른 강으로 바로 가지 않아요.</p>

        <ul className="mt-4 space-y-2">
          {CHAPTERS.map((chapter) => {
            const isSelected = chapter.id === selectedChapterId;
            return (
              <li key={chapter.id}>
                <button
                  aria-pressed={isSelected}
                  className={`flex w-full min-h-11 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                      : 'border-[var(--color-border)] bg-white hover:bg-stone-50'
                  }`}
                  onClick={() => setSelectedChapterId(chapter.id)}
                  type="button"
                >
                  <span className="text-lg">{chapter.emoji}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-stone-900">
                      {chapter.lessonNo}강 · {chapter.title}
                    </span>
                    <span className="block text-xs text-stone-500">
                      {chapter.category} · 문항 {getQasByChapterId(chapter.id).length}개
                    </span>
                  </span>
                  {isSelected ? <span className="ml-auto text-sm font-medium text-stone-900">선택됨</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="sticky bottom-4 mt-6">
        <button
          className="inline-flex w-full min-h-11 items-center justify-center rounded-2xl bg-stone-950 px-5 text-sm font-medium text-white disabled:bg-stone-300"
          disabled={!selected || isStarting}
          onClick={() => void start()}
          type="button"
        >
          {isStarting
            ? '시연 준비 중...'
            : selected
              ? `이 강으로 시연 시작 — ${selected.lessonNo}강`
              : '시연할 강을 고르세요'}
        </button>
      </div>
    </main>
  );
}
