import { useEffect, useState } from 'react';
import NewSessionModal from '../components/teacher/NewSessionModal';
import SessionCard from '../components/teacher/SessionCard';
import { useAuth } from '../lib/auth';
import { listTeacherSessions } from '../lib/session-client';
import { useSessionStore } from '../store/session-store';

export default function TeacherDashboardPage() {
  const auth = useAuth();
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
          setError(caught instanceof Error ? caught.message : '세션 목록을 불러오지 못했습니다.');
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

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">Teacher Dashboard</p>
          <h1 className="mt-3 text-4xl font-medium text-stone-950">내 세션 관리</h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            {(auth.displayName ?? '교사')} 계정의 세션을 관리합니다. 진행 중 세션을 먼저 보여주고, 종료 세션은 아래로
            분리합니다.
          </p>
        </div>
        <div className="flex items-end">
          <button
            className="inline-flex min-h-11 items-center rounded-2xl bg-stone-950 px-5 text-sm font-medium text-white"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            + 새 세션 만들기
          </button>
        </div>
      </header>

      {error ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-stone-900">진행 중</h2>
          <span className="text-sm text-stone-500">{activeSessions.length}개</span>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 text-sm text-stone-500">
              세션 목록을 불러오는 중입니다.
            </div>
          ) : activeSessions.length > 0 ? (
            activeSessions.map((session) => <SessionCard key={session.id} session={session} />)
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-white p-5 text-sm text-stone-500">
              진행 중 세션이 없습니다. 새 세션을 만들어 수업을 시작하세요.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-stone-900">종료된 세션</h2>
          <span className="text-sm text-stone-500">{endedSessions.length}개</span>
        </div>
        <div className="space-y-4">
          {endedSessions.length > 0 ? (
            endedSessions.map((session) => <SessionCard key={session.id} session={session} />)
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-white p-5 text-sm text-stone-500">
              종료된 세션이 아직 없습니다.
            </div>
          )}
        </div>
      </section>

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
