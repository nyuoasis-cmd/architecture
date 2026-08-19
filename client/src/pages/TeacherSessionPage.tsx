import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../components/common/ConfirmModal';
import QrFullscreen from '../components/common/QrFullscreen';
import ParticipantList from '../components/teacher/ParticipantList';
import { CHAPTERS, getQasByChapterId } from '../data/qa-stubs';
import { formatRelativeTime } from '../lib/format';
import { endSession, getSession, getSessionParticipants, SessionClientError } from '../lib/session-client';
import { useSessionStore } from '../store/session-store';

export default function TeacherSessionPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [isConfirmingEnd, setIsConfirmingEnd] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isQrFullscreen, setIsQrFullscreen] = useState(false);
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

          setError(caught instanceof Error ? caught.message : '수업 정보를 불러오지 못했습니다.');
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
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 text-sm text-stone-500">
          {error ?? '수업 정보를 불러오는 중입니다.'}
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
  const openedQaCount = participants.reduce((sum, participant) => sum + participant.progress_count, 0);
  const inProgressCount = participants.filter(
    (participant) => participant.progress_count > 0 && participant.progress_count < totalQas,
  ).length;

  const isEnded = currentSession.status === 'ended';
  const primaryCta =
    'inline-flex h-10 items-center rounded-[10px] bg-stone-950 px-5 text-sm font-medium text-white disabled:bg-stone-300';
  const secondaryCta =
    'inline-flex h-10 items-center rounded-[10px] border border-[var(--color-border)] bg-white px-5 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60';
  // 🔤 §10 QR 버튼 치수 정본 — h-10 · radius **13** · px-3.5 · min-w 92 · 13px/600 · 아이콘 gap 6px.
  //    옆 버튼(radius 10)과 3px 다르지만, 치수를 적어 둔 표가 정본이라 표를 따른다.
  const qrCtaBase =
    'inline-flex h-10 min-w-[92px] items-center justify-center gap-1.5 rounded-[13px] px-3.5 text-[13px] font-semibold transition-[background-color,border-color] duration-150 disabled:cursor-not-allowed disabled:opacity-60';
  const qrCtaPrimary = `${qrCtaBase} bg-stone-950 text-white hover:bg-[var(--color-text-body)]`;
  const qrCtaSecondary = `${qrCtaBase} border border-[var(--color-border)] bg-white text-stone-800 hover:bg-stone-50`;

  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-8">
      {/*
        🚨 뒤로 링크 없이 브라우저 뒤로가기에만 기대지 않는다(§4-A 금지).
           교사는 수업 중에 QR 전체화면·시연작을 오가느라 히스토리가 엉켜 있고,
           그때 «목록으로 어떻게 돌아가지»가 화면에 없으면 새로고침으로 길을 찾는다.
      */}
      <Link className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900" to="/teacher">
        <span aria-hidden="true">←</span> 내 수업
      </Link>

      {/*
        🔑 헤더는 §4 카드와 **같은 말투**를 쓴다 — 같은 코드 뱃지, 같은 상태 뱃지.
           목록에서 상세로 들어왔을 때 «같은 수업을 계속 보고 있다»가 눈으로 이어져야 한다.
           예전엔 32px 검정 코드 블록 + 36px 제목 + Live Session 이라 화면이 갈아탄 것처럼 보였다.
      */}
      <section className="mt-4 rounded-[12px] border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-[22px] font-semibold text-stone-900">{currentSession.name}</h1>
              {isEnded ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-[3px] text-[11.5px] font-semibold text-stone-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                  종료
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-[3px] text-[11.5px] font-semibold text-[#059669]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  진행 중
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-500">
              <span className="inline-flex h-[34px] items-center rounded-xl bg-stone-50 px-3 text-sm font-bold tracking-[0.06em] text-stone-900">
                {currentSession.code}
              </span>
              <span>👤 {participants.length}명</span>
              <span>📄 {totalQas}개 문항</span>
            </div>
            <p className="mt-2 truncate text-[13px] text-stone-400" title={chapterLabels}>
              {formatRelativeTime(currentSession.created_at)} · {chapterLabels}
            </p>
          </div>

          {/*
            🚨 여기 132px QR 이미지가 박혀 있었다 — §10 금지 「카드에 QR 이미지 직접 표시」.
               작아서 프로젝터로는 못 쓰고, 그러면서 헤더 폭을 잡아먹어 수업 이름을 밀어냈다.
               QR 은 아래 「QR코드」 버튼이 여는 **전체화면** 하나로만 보여 준다.
          */}
        </div>

        {/*
          🚨 2026-08-16 신입샘 t2(sev 3): 여기가 「학생을 받은 뒤 **수업을 시작하세요**」라고 적혀 있었는데,
             학생이 들어온 뒤 교사가 누를 «시작»은 이 화면에 없다(있는 것은 시연하기·QR·종료 셋뿐).
             초임 교사는 「학생이 들어왔어요! 근데 수업을 어떻게 시작하지?」에서 멈췄다.
          🚨 **없는 버튼을 만들지 않는다.** 이 앱에서 학생은 코드로 들어오는 순간 각자 진행한다 —
             교사가 눌러야 열리는 문이 애초에 없다. 그러니 고칠 것은 화면이 아니라 **약속한 문구**다.
          🔑 그래서 학생이 들어온 뒤에도 한 줄을 남긴다. 「없다」를 말해 주지 않으면 교사는 계속 찾는다.
        */}
        {isEnded ? null : !hasParticipants ? (
          <p className="mt-5 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
            <span className="font-medium text-stone-900">아직 학생이 없어요.</span> QR을 교실 화면에 띄우면 학생이 코드로
            들어옵니다.
          </p>
        ) : (
          <p className="mt-5 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
            <span className="font-medium text-stone-900">학생이 들어오면 각자 진행합니다.</span> 따로 누를 «시작»은
            없어요 — 교사는 아래 현황만 보면 됩니다.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {/*
            🔑 순서가 곧 안내다 — 학생이 0명이면 QR 이 1차, 들어오면 시연하기가 1차가 된다.
            🚨 문구는 용어 정본(ui-glossary §H)의 **「시연작」 단일 계열**을 쓴다 — 명사=시연작 · 동작=시연하기.
               2026-08-11 QA(신입샘 t2)에서 「시연」이 두 가지로 읽힌 적이 있어 한동안 «학생 화면 미리 보기»로
               적어 두었으나, 2026-08-15 jery 가 **용어 단일화**를 택했다(앱마다 다른 말을 쓰는 비용이 더 크다).
               읽히는 문제는 낱말이 아니라 «누르면 무엇이 열리는지»를 옆에서 알려 주는 안내로 푼다.
          */}
          <button
            className={hasParticipants ? primaryCta : secondaryCta}
            disabled={isEnded}
            onClick={() => navigate(`/library?sessionId=${currentSession.id}`)}
            type="button"
          >
            🎬 시연하기
          </button>
          {/*
            🔤 문구는 §10 정본 **「QR코드」** 다 — 「📱 QR 전체화면」은 «전체화면»이라는 구현
               낱말을 교사에게 떠넘긴 것이었다. 아이콘은 15×15 QR 패턴 + 텍스트 병행
               (§10 금지 「QR 아이콘만 단독 사용」).
            ⚠️ **한 가지 의도된 예외**: §10 은 QR 버튼을 항상 Primary 로 두지만, 이 화면에서는
               학생이 들어온 뒤 1차 CTA 가 「🎬 시연하기」로 넘어간다(2026-08-16 신입샘 t2 수정).
               둘을 동시에 Primary 로 두면 «지금 무엇을 누르나»가 사라지므로, 순서·강조를
               바꾸는 그 규칙을 유지한다. 바꾼 것은 문구·아이콘·치수(h-10·radius 13·13px/600)다.
          */}
          <button
            className={hasParticipants ? qrCtaSecondary : qrCtaPrimary}
            disabled={isEnded}
            onClick={() => setIsQrFullscreen(true)}
            type="button"
          >
            <QrCode size={15} strokeWidth={1.9} />
            QR코드
          </button>
          <button
            className="ml-auto inline-flex h-10 items-center rounded-[10px] px-3.5 text-[13px] text-stone-500 hover:bg-stone-100 disabled:opacity-50"
            disabled={isEnding || isEnded}
            onClick={() => {
              setEndError(null);
              setIsConfirmingEnd(true);
            }}
            type="button"
          >
            {isEnded ? '종료됨' : '수업 종료'}
          </button>
        </div>

        {/*
          🚨 교사가 수업 중에 읽는 것은 **문항별 「📋 설명 노트」** 하나다(2026-08-12, 교안 철거).
             노트는 학생과 **같은 화면 안**에 있다 — 교사 화면 = 학생 화면의 상위집합
             (DESIGN-POLICY §9.H-14). 어디 있는지 적어 두지 않으면 교사는 수업 중에 찾아 헤맨다.
          🚨 «차시 순서»를 여기에 다시 만들지 않는다 — 수업 흐름은 교사가 정한다.
        */}
        <p className="mt-4 text-[13px] text-stone-500">
          «🎬 시연하기»를 누르면 <span className="font-medium text-stone-700">학생이 볼 화면이 그대로</span> 열립니다.
          문항마다 <span className="font-medium text-stone-700">📋 설명 노트</span>가 있어요 — 우측 콘텐츠의 같은 이름 탭.
        </p>
      </section>

      {error ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {/*
        🚨 §4-A 는 통계 3열을 요구하고 «참여자 수 누락»을 금지한다. 여기엔 참여자 pill 하나뿐이었다.
        🚨 「열어 본 문항」이지 「읽은 문항」이 아니다 — 진도 행은 학생이 문항 화면을 **여는 순간**
           생긴다(session-progress.ts). 「읽은」이라고 적으면 교사가 이해도까지 봤다고 오해한다.
        🔑 「진행 중」 = 하나라도 열었지만 아직 다 열지는 않은 학생. 0명이 아니라 «다 끝낸» 쪽과
           구분되는 숫자라서, 교사가 «지금 붙잡아야 할 사람이 몇인지»를 이 한 칸에서 읽는다.
      */}
      <section className="mt-8 grid grid-cols-3 gap-3">
        {([
          ['참여 학생', participants.length],
          ['열어 본 문항', openedQaCount],
          ['진행 중', inProgressCount],
        ] as const).map(([label, value]) => (
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 text-center" key={label}>
            <div
              className="text-[28px] font-bold leading-tight text-stone-900"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {value}
            </div>
            <div className="mt-1 text-xs font-medium text-stone-400">{label}</div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-stone-900">학생 현황</h2>
          <span className="text-sm text-stone-500">총 {totalQas}개 문항</span>
        </div>
        <ParticipantList participants={participants} totalQas={totalQas} />
      </section>

      {isQrFullscreen ? (
        <QrFullscreen
          code={currentSession.code}
          onClose={() => setIsQrFullscreen(false)}
          participantCount={participants.length}
          sessionName={currentSession.name}
        />
      ) : null}

      {isConfirmingEnd ? (
        <ConfirmModal
          confirmLabel="종료"
          description="학생들이 더 이상 참여할 수 없어요. 이미 저장된 학습 기록은 그대로 남아요."
          error={endError}
          isPending={isEnding}
          onClose={() => {
            if (!isEnding) {
              setIsConfirmingEnd(false);
            }
          }}
          onConfirm={async () => {
            setIsEnding(true);
            setEndError(null);
            try {
              const ended = await endSession(currentSession.id);
              setCurrentSession({ ...currentSession, ...ended });
              setIsConfirmingEnd(false);
            } catch (caught) {
              setEndError(caught instanceof Error ? caught.message : '수업을 종료하지 못했습니다.');
            } finally {
              setIsEnding(false);
            }
          }}
          pendingLabel="종료 중…"
          title="이 수업을 종료할까요?"
        />
      ) : null}
    </main>
  );
}
