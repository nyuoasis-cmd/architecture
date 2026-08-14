import { useEffect, useState } from 'react';
import NewSessionModal from '../components/teacher/NewSessionModal';
import SessionCard from '../components/teacher/SessionCard';
import { listTeacherSessions } from '../lib/session-client';
import { useSessionStore } from '../store/session-store';

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
            진행 중인 수업을 한곳에서 확인하고, 새 수업을 만들 수 있어요. 종료한 수업은 아래에 따로 모입니다.
          </p>
        </div>
        {/*
          🚨 시연작 입구를 여기 두지 않는다(2026-08-14 철거). 시연은 «수업을 하고 있는 자리»에서 켜는 것이라
             입구는 **수업 현황 상세**에 있다(DESIGN-POLICY §9.H-14 v1.10). 목록에 두면 «수업 밖에서 켜는 것»이 되고,
             실제로 그렇게 지었더니 누를 때마다 참여 코드가 붙은 새 방이 하나씩 이 목록에 쌓였다.
        */}
        <div className="flex items-end gap-2">
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

      {/*
        🔑 「종료된 세션」은 **있을 때만** 자리를 차지한다(결정 16, 2026-08-11).
           0개인데도 «종료된 세션이 아직 없습니다» 카드가 늘 떠 있어, 교사가 처음 들어온 화면에서
           빈 상자 두 개를 먼저 읽었다. 종료한 수업이 실제로 생기기 전까지는 안 보인다.
        🚨 통째로 지우지는 않았다 — 지난 수업을 다시 열어 볼 다른 통로가 아직 없기 때문이다.
           별도 「지난 수업」 화면이 생기는 날 이 섹션을 그리로 옮긴다(에픽 6/6).
      */}
      {endedSessions.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-stone-900">종료된 세션</h2>
            <span className="text-sm text-stone-500">{endedSessions.length}개</span>
          </div>
          <div className="space-y-4">
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
