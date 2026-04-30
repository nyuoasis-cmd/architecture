import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import QrInline from '../components/common/QrInline';
import ParticipantList from '../components/teacher/ParticipantList';
import { CHAPTERS, getQasByChapterId } from '../data/qa-stubs';
import { endSession, getSession, getSessionParticipants, SessionClientError } from '../lib/session-client';
import { useSessionStore } from '../store/session-store';

export default function TeacherSessionPage() {
  const { id = '' } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const currentSession = useSessionStore((state) => state.currentSession);
  const participants = useSessionStore((state) => state.participants);
  const setCurrentSession = useSessionStore((state) => state.setCurrentSession);
  const setParticipants = useSessionStore((state) => state.setParticipants);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    getSession(id, { teacher: true })
      .then((session) => {
        if (!cancelled) {
          setCurrentSession(session);
          setError(null);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          if (caught instanceof SessionClientError && caught.status === 403) {
            setIsForbidden(true);
            return;
          }

          setError(caught instanceof Error ? caught.message : '세션 정보를 불러오지 못했습니다.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, setCurrentSession]);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const tick = async () => {
      if (document.visibilityState === 'hidden') {
        timer = window.setTimeout(tick, 6_000);
        return;
      }

      try {
        const payload = await getSessionParticipants(id);
        if (!cancelled) {
          setParticipants(payload.participants);
        }
      } catch {
        if (!cancelled) {
          setError('참여자 목록을 새로고침하지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          timer = window.setTimeout(tick, 6_000);
        }
      }
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [id, setParticipants]);

  if (isForbidden) {
    return <Navigate replace to="/forbidden" />;
  }

  if (!currentSession || currentSession.id !== id) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 text-sm text-[var(--color-text-muted)]">
          {error ?? '세션 정보를 불러오는 중입니다.'}
        </div>
      </main>
    );
  }

  const chapterLabels = currentSession.chapter_ids
    .map((chapterId) => CHAPTERS.find((chapter) => chapter.id === chapterId)?.title)
    .filter(Boolean)
    .join(' · ');
  const totalQas = currentSession.chapter_ids.reduce((sum, chapterId) => sum + getQasByChapterId(chapterId).length, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-quaternary)]">Live Session</p>
          <h1 className="mt-3 text-4xl font-medium text-[var(--color-text-primary)]">{currentSession.name}</h1>
          <p className="mt-3 text-sm text-[var(--color-text-body)]">{chapterLabels}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-[18px] bg-[var(--color-btn-primary-hover)] px-5 py-3 font-mono text-[32px] tracking-[0.5em] text-white">
              {currentSession.code}
            </span>
            <span className="rounded-full bg-[var(--color-surface-hover)] px-3 py-1 text-sm text-[var(--color-text-body)]">
              참여자 {participants.length}명
            </span>
          </div>
          <div className="mt-6">
            <button
              className="inline-flex min-h-11 items-center rounded-2xl bg-rose-600 px-5 text-sm font-medium text-white"
              disabled={isEnding || currentSession.status === 'ended'}
              onClick={async () => {
                setIsEnding(true);
                try {
                  const ended = await endSession(currentSession.id);
                  setCurrentSession({ ...currentSession, ...ended });
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : '세션 종료에 실패했습니다.');
                } finally {
                  setIsEnding(false);
                }
              }}
              type="button"
            >
              {currentSession.status === 'ended' ? '종료됨' : isEnding ? '종료 중...' : '세션 종료'}
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <QrInline code={currentSession.code} size={220} />
        </div>
      </section>

      {error ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[var(--color-text-primary)]">참여자 진도</h2>
          <span className="text-sm text-[var(--color-text-muted)]">총 {totalQas}개 문항</span>
        </div>
        <ParticipantList participants={participants} totalQas={totalQas} />
      </section>
    </main>
  );
}
