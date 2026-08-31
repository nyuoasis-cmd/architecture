import { useEffect, useState } from 'react';
import NewSessionModal from '../components/teacher/NewSessionModal';
import SessionCard from '../components/teacher/SessionCard';
import { listTeacherSessions } from '../lib/session-client';
import { useSessionStore } from '../store/session-store';

/**
 * 교사 「내 수업」 목록. BUILDER-UX-POLICY §4 D안.
 *
 * 🔑 헤더는 산문이 아니라 **숫자 한 줄**이다 — 「5개 수업 · 진행 중 2개」.
 *    3줄짜리 설명은 처음 한 번만 유용하고, 그다음부터는 매번 읽어야 할 벽이 된다.
 * 🚨 시연작 입구를 여기 두지 않는다(2026-08-14 철거). 시연은 «수업을 하고 있는 자리»에서
 *    켜는 것이라 입구는 수업 현황 상세에 있다(DESIGN-POLICY §9.H-14 v1.10). 목록에 두면
 *    누를 때마다 참여 코드가 붙은 새 방이 이 목록에 쌓인다 — 실제로 그렇게 됐었다.
 */
export default function TeacherDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const teacherSessions = useSessionStore((state) => state.teacherSessions);
  const prependTeacherSession = useSessionStore((state) => state.prependTeacherSession);
  const setTeacherSessions = useSessionStore((state) => state.setTeacherSessions);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    listTeacherSessions()
      .then((sessions) => {
        if (!cancelled) {
          setTeacherSessions(sessions);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : '수업 목록을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setTeacherSessions]);

  const activeSessions = teacherSessions.filter((session) => session.status === 'active');
  const endedSessions = teacherSessions.filter((session) => session.status === 'ended');
  const isEmpty = !isLoading && teacherSessions.length === 0;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-medium leading-tight tracking-tight text-stone-950">내 수업</h1>
          <p className="mt-2 text-sm text-stone-500">
            {teacherSessions.length}개 수업 · 진행 중 {activeSessions.length}개
          </p>
        </div>
        <button
          className="inline-flex h-11 flex-shrink-0 items-center gap-1.5 rounded-[10px] bg-stone-950 px-5 text-sm font-medium text-white hover:bg-stone-800"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
            viewBox="0 0 16 16"
            width="14"
          >
            <path d="M8 3 L8 13 M3 8 L13 8" />
          </svg>
          수업 만들기
        </button>
      </header>

      {error ? <div className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {isLoading ? (
        <div className="rounded-[12px] border border-[var(--color-border)] bg-white p-5 text-sm text-stone-500">
          수업 목록을 불러오는 중입니다.
        </div>
      ) : null}

      {/*
        🔑 빈 상태는 «없다»고만 말하지 않는다(DESIGN-POLICY §8) — 다음에 할 일을 버튼으로 준다.
           점선 상자 한 줄이던 시절, 처음 들어온 교사가 무엇부터 눌러야 할지 몰라 멈췄다.
      */}
      {isEmpty ? (
        <div className="flex flex-col items-center rounded-[12px] border border-dashed border-[var(--color-border)] bg-white px-6 py-14 text-center">
          {/*
            🚨 이모지(📚) 를 쓰지 않는다(BUILDER-UX §8 D12) — 기기마다 크기·모양이 달라
               화면이 장난스러워지고, 폰트가 없는 기기에서는 두부(□)로 뜬다. 선 아이콘만.
          */}
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-400" aria-hidden="true">
            <svg
              fill="none"
              height="20"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
              width="20"
            >
              <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5h-5A1.5 1.5 0 0 1 4 16z" />
              <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 0 20 16z" />
            </svg>
          </div>
          <p className="mt-4 text-base font-medium text-stone-900">아직 만든 수업이 없어요</p>
          <p className="mt-1 text-sm text-stone-500">수업을 만들면 학생들이 참여할 수 있어요</p>
          <button
            className="mt-5 inline-flex h-11 items-center rounded-[10px] bg-stone-950 px-5 text-sm font-medium text-white hover:bg-stone-800"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            첫 수업 만들기
          </button>
        </div>
      ) : null}

      {activeSessions.length > 0 ? (
        <section className="flex flex-col gap-3">
          {activeSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </section>
      ) : null}

      {/*
        🔑 「종료됨」 묶음은 **있을 때만** 자리를 차지한다(결정 16, 2026-08-11).
           0개인데도 «아직 없습니다» 카드가 늘 떠 있어 교사가 빈 상자부터 읽었다.
        🚨 통째로 지우지는 않았다 — 지난 수업을 다시 열어 볼 다른 통로가 아직 없다.
           별도 「지난 수업」 화면이 생기는 날 이 묶음을 그리로 옮긴다.
      */}
      {endedSessions.length > 0 ? (
        <section className={activeSessions.length > 0 ? 'mt-10' : ''}>
          {/* 상태 낱말 5종 고정(D11) — 「종료됨」은 폐기, 「종료」로 통일한다. */}
          <p className="mb-3 text-xs tracking-[0.05em] text-stone-400">종료</p>
          <div className="flex flex-col gap-3">
            {endedSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </section>
      ) : null}

      {isModalOpen ? (
        <NewSessionModal
          onClose={() => setIsModalOpen(false)}
          onCreated={(session) => {
            prependTeacherSession(session);
          }}
        />
      ) : null}
    </main>
  );
}
