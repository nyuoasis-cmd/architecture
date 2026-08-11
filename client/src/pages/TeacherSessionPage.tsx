import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import QrFullscreenModal from '../components/common/QrFullscreenModal';
import QrInline from '../components/common/QrInline';
import LessonPlanPanel from '../components/teacher/LessonPlanPanel';
import ParticipantList from '../components/teacher/ParticipantList';
import { CHAPTERS, getQasByChapterId } from '../data/qa-stubs';
import { endSession, getSession, getSessionParticipants, SessionClientError } from '../lib/session-client';
import { useSessionStore } from '../store/session-store';

export default function TeacherSessionPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isQrFullscreen, setIsQrFullscreen] = useState(false);
  const [qaCompletion, setQaCompletion] = useState<Record<string, number>>({});
  const [now, setNow] = useState(() => Date.now());
  const currentSession = useSessionStore((state) => state.currentSession);
  const participants = useSessionStore((state) => state.participants);
  const setCurrentSession = useSessionStore((state) => state.setCurrentSession);
  const setParticipants = useSessionStore((state) => state.setParticipants);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    getSession(id)
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
          setQaCompletion(payload.qa_completion ?? {});
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

  // 「몇 분째」는 30초마다만 다시 센다 — 1초짜리 시계는 수업 중 교사 화면에서 시선을 끈다.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (isForbidden) {
    return <Navigate replace to="/forbidden" />;
  }

  if (!currentSession || currentSession.id !== id) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 text-sm text-stone-500">
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

  // 🚨 학생이 0명이면 「수업 시작」이 아직 일어나지 않은 것이다 — 순서를 화면이 말해 준다.
  //    2026-08-11 prod QA(신입샘 t2): 참여자 0명인데도 「▶ 수업 시연 시작」이 1차 CTA 라
  //    신입 교사가 «QR 을 먼저 띄워야 하나, 시연을 먼저 눌러야 하나»에서 멈췄다.
  const hasParticipants = participants.length > 0;

  // 이 앱에는 「수업 시작」 기록이 없다. 첫 학생이 들어온 시각을 근사값으로 쓰되,
  // 근사라는 사실을 교안 패널이 화면에 그대로 적는다(지어낸 시각을 믿게 하지 않는다).
  // 참여자는 서버가 joined_at 오름차순으로 준다 — 첫 항목이 가장 먼저 들어온 학생이다.
  const startedAtIso = participants[0]?.joined_at;
  const startedAtMs = startedAtIso ? Date.parse(startedAtIso) : Number.NaN;
  const elapsedMinutes = Number.isFinite(startedAtMs)
    ? Math.max(0, Math.floor((now - startedAtMs) / 60_000))
    : undefined;

  const primaryCta =
    'inline-flex min-h-11 items-center rounded-2xl bg-stone-950 px-5 text-sm font-medium text-white disabled:bg-stone-300';
  const secondaryCta =
    'inline-flex min-h-11 items-center rounded-2xl border border-[var(--color-border)] bg-white px-5 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">Live Session</p>
          <h1 className="mt-3 text-4xl font-medium text-stone-950">{currentSession.name}</h1>
          <p className="mt-3 text-sm text-stone-600">{chapterLabels}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-[18px] bg-stone-950 px-5 py-3 font-mono text-[32px] tracking-[0.5em] text-white">
              {currentSession.code}
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
              참여자 {participants.length}명
            </span>
          </div>
          {!hasParticipants && currentSession.status !== 'ended' ? (
            <p className="mt-5 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
              <span className="font-medium text-stone-900">아직 학생이 없어요.</span> QR을 교실 화면에 띄워 학생을 받은
              뒤 수업을 시작하세요.
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {/*
              🔑 순서가 곧 안내다 — 학생이 0명이면 QR 이 1차, 들어오면 학생 화면 보기가 1차가 된다.
                 「시연」은 교사에게 «학생에게 보여 주기»로도 «내가 미리 보기»로도 읽혀서,
                 실제 동작(=학생이 볼 화면을 교사가 role=teacher 로 미리 여는 것)대로 다시 적었다.
            */}
            <button
              className={hasParticipants ? primaryCta : secondaryCta}
              disabled={currentSession.status === 'ended'}
              onClick={() => navigate(`/library?sessionId=${currentSession.id}`)}
              type="button"
            >
              👀 학생 화면 미리 보기
            </button>
            <button
              className={hasParticipants ? secondaryCta : primaryCta}
              disabled={currentSession.status === 'ended'}
              onClick={() => setIsQrFullscreen(true)}
              type="button"
            >
              📱 QR 전체화면
            </button>
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

      <LessonPlanPanel
        chapterIds={currentSession.chapter_ids}
        progress={{
          participantCount: participants.length,
          qaCompletion,
          startedAt: startedAtIso,
          elapsedMinutes,
        }}
      />

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-stone-900">참여자 진도</h2>
          <span className="text-sm text-stone-500">총 {totalQas}개 문항</span>
        </div>
        <ParticipantList participants={participants} totalQas={totalQas} />
      </section>

      {isQrFullscreen ? (
        <QrFullscreenModal code={currentSession.code} onClose={() => setIsQrFullscreen(false)} />
      ) : null}
    </main>
  );
}
