import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import ConfirmModal from '../common/ConfirmModal';
import QrFullscreen from '../common/QrFullscreen';
import { CHAPTERS } from '../../data/qa-stubs';
import { formatRelativeTime } from '../../lib/format';
import { deleteSession, endSession, SessionClientError, type SessionRecord } from '../../lib/session-client';
import { useSessionStore } from '../../store/session-store';

/**
 * 수업 카드 = **현황 미니 대시보드**(BUILDER-UX-POLICY §4 D안). 바로가기 버튼이 아니다.
 *
 * 🔑 교사가 카드를 열지 않고도 «몇 명 들어왔고, 얼마나 봤고, 방금 무슨 일이 있었는지»를
 *    읽을 수 있어야 한다. 그게 안 되면 교사는 수업 중에 카드를 하나씩 열어 보게 된다.
 *
 * 🚨 카드 전체가 클릭 대상이다(§4). 안에 있는 버튼들은 반드시 stopPropagation 한다 —
 *    QR 을 누르려다 상세로 튀면 프로젝터 앞에서 교사가 당황한다.
 * 🚨 삭제는 **종료된 수업에만** 둔다(2026-08-14 결정). 진행 중 카드에 삭제가 있으면
 *    종료 옆 한 칸 차이로 «수업 중인 반의 기록»이 통째로 사라진다.
 */
type SessionCardProps = {
  session: SessionRecord;
};

export default function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate();
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isConfirmingEnd, setIsConfirmingEnd] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const removeTeacherSession = useSessionStore((state) => state.removeTeacherSession);
  const updateTeacherSession = useSessionStore((state) => state.updateTeacherSession);

  const isActive = session.status === 'active';
  const chapterCount = session.chapter_ids.length;
  const chapterLabels = session.chapter_ids
    .map((chapterId) => CHAPTERS.find((chapter) => chapter.id === chapterId)?.title)
    .filter(Boolean)
    .join(' · ');

  const studentCount = session.student_count ?? session.participant_count ?? 0;
  const openedQaCount = session.opened_qa_count ?? 0;
  const inProgressCount = session.in_progress_count ?? 0;
  const recentStudents = session.recent_students ?? [];
  const activity = session.last_activity ?? null;
  // 아바타를 그릴지 «아직 아무도 없어요»를 그릴지의 갈림길. 활동이 없어도 들어온 학생이 있으면 그린다.
  const hasStudents = recentStudents.length > 0 || studentCount > 0;
  // 🔑 +N 은 recent_students.length 로 재지 않는다 — 서버가 4명으로 잘라 보내므로 늘 0이 된다(dead code).
  const overflow = (session.activity_count ?? recentStudents.length) - 4;

  const openDetail = () => navigate(`/teacher/session/${session.id}`);

  const handleEnd = async () => {
    setIsEnding(true);
    setEndError(null);
    try {
      const updated = await endSession(session.id);
      updateTeacherSession(updated);
      setIsConfirmingEnd(false);
    } catch (caught) {
      setEndError(
        caught instanceof SessionClientError || caught instanceof Error
          ? caught.message
          : '수업을 종료하지 못했습니다.',
      );
    } finally {
      setIsEnding(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteSession(session.id);
      removeTeacherSession(session.id);
    } catch (caught) {
      setIsDeleting(false);
      setDeleteError(
        caught instanceof SessionClientError || caught instanceof Error
          ? caught.message
          : '수업을 삭제하지 못했습니다.',
      );
    }
  };

  return (
    <>
      <article
        aria-label={`${session.name} 수업 현황 열기`}
        className={`flex cursor-pointer flex-col gap-3.5 rounded-[12px] border border-[var(--color-border)] bg-white p-5 transition-all duration-200 hover:border-stone-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.05)] ${
          isActive ? '' : 'opacity-55 hover:opacity-75'
        }`}
        onClick={openDetail}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetail();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-[50px] w-[82px] flex-shrink-0 items-center justify-center rounded-xl bg-stone-50 text-[15px] font-bold tracking-[0.06em] ${
              isActive ? 'text-stone-900' : 'text-stone-400'
            }`}
          >
            {session.code}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-stone-900">{session.name}</h3>
              {isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-[3px] text-[11.5px] font-semibold text-[#059669]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  진행 중
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-[3px] text-[11.5px] font-semibold text-stone-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                  종료
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-[13px] text-stone-500" title={chapterLabels}>
              {formatRelativeTime(session.created_at)} · {chapterCount}개 강
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            {isActive ? (
              <>
                {/*
                  🚨 아이콘 하나만 있던 버튼이다 — §10 금지 「QR 아이콘만 단독 사용 — 반드시
                     텍스트 병행」. 시니어 교사 비중이 높은 사용자층이라 아이콘만으로는
                     «이게 QR 인가 설정인가»에서 멈춘다. §10 정본 = 채움 스타일 + 「QR코드」.
                  🔤 치수도 §10 표 — h-11(44px, D9) · radius 13 · px-3.5 · min-w 92 · 13px/600 · 아이콘 15×15.
                */}
                <button
                  className="inline-flex h-11 min-w-[92px] items-center justify-center gap-1.5 rounded-[13px] bg-stone-950 px-3.5 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-[var(--color-text-body)]"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsQrOpen(true);
                  }}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="15"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    width="15"
                  >
                    <rect height="6" rx="1" width="6" x="3" y="3" />
                    <rect height="6" rx="1" width="6" x="15" y="3" />
                    <rect height="6" rx="1" width="6" x="3" y="15" />
                    <path d="M15 12 L21 12 M15 15 L18 15 L18 21 L15 21 L15 18" />
                  </svg>
                  QR코드
                </button>
                <button
                  /* §10-A: 종료 = 테두리 중립 텍스트 버튼 · h44 · radius 10 · 1px border · text-muted.
                     테두리가 없으면 «누를 수 있는 것»으로 안 읽혀 교사가 카드를 열어 종료를 찾는다. */
                  className="inline-flex h-11 items-center rounded-[10px] border border-[var(--color-border)] px-3.5 text-[13px] text-stone-500 hover:bg-stone-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    setEndError(null);
                    setIsConfirmingEnd(true);
                  }}
                  type="button"
                >
                  종료
                </button>
              </>
            ) : (
              <button
                className="inline-flex h-11 items-center rounded-[10px] px-3.5 text-[13px] text-rose-700 hover:bg-rose-50"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteError(null);
                  setIsConfirmingDelete(true);
                }}
                type="button"
              >
                삭제
              </button>
            )}
          </div>
        </div>

        {/*
          🚨 「열어 본 문항」이지 「읽은 문항」이 아니다 — 진도 행은 문항 화면을 여는 순간 생긴다.
             「읽은」이라고 적으면 교사가 이해도까지 봤다고 오해한다.
        */}
        <div className="grid grid-cols-3 border-y border-stone-100 py-3">
          {(
            [
              ['참여 학생', studentCount],
              ['열어 본 문항', openedQaCount],
              ['진행 중', inProgressCount],
            ] as const
          ).map(([label, value], index) => (
            <div className={`text-center ${index > 0 ? 'border-l border-stone-100' : ''}`} key={label}>
              <div
                className="text-[20px] font-semibold leading-tight text-stone-900"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {value}
              </div>
              <div className="mt-0.5 text-[11.5px] font-medium text-stone-400">{label}</div>
            </div>
          ))}
        </div>

        {hasStudents ? (
          <div className="flex items-center gap-3 text-[13px] text-stone-500">
            <div className="flex items-center">
              {recentStudents.slice(0, 4).map((name, index) => (
                <Avatar className={index > 0 ? '-ml-2' : ''} key={`${name}-${index}`} name={name} />
              ))}
              {overflow > 0 ? (
                <span className="-ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-stone-100 text-[10.5px] font-medium text-stone-500">
                  +{overflow}
                </span>
              ) : null}
            </div>
            {activity ? (
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate">
                  <strong className="font-semibold text-stone-900">{activity.student_name}</strong>님이 「
                  {activity.target_title}」 {activity.action}
                </span>
                <span className="flex-shrink-0 text-xs text-stone-400">
                  {formatRelativeTime(activity.timestamp, { mode: 'compact' })}
                </span>
              </div>
            ) : (
              <span className="truncate">{studentCount}명 참여 중</span>
            )}
          </div>
        ) : isActive ? (
          <p className="text-[12.5px] text-stone-400">QR 코드를 학생에게 보여 주면 여기에 활동이 표시돼요</p>
        ) : (
          <p className="text-[12.5px] text-stone-400">종료된 수업이에요</p>
        )}
      </article>

      {/*
        🚨 참여자 수는 **넘기지 않는다** — 「내 수업」 목록은 폴링하지 않아서 열 때의 숫자로 굳는다.
           프로젝터에 굳은 숫자를 「참여 N명」으로 띄우면 교사가 «아직 3명뿐»으로 잘못 읽는다.
           살아 있는 숫자가 필요하면 수업 상세(6초 폴링)에서 열면 된다.
      */}
      {isQrOpen ? (
        <QrFullscreen code={session.code} onClose={() => setIsQrOpen(false)} sessionName={session.name} />
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
          onConfirm={handleEnd}
          pendingLabel="종료 중…"
          title="이 수업을 종료할까요?"
        />
      ) : null}

      {isConfirmingDelete ? (
        <ConfirmModal
          confirmLabel="삭제"
          description="참여자 명단과 학습 기록도 함께 영구 삭제됩니다. 되돌릴 수 없어요."
          error={deleteError}
          isPending={isDeleting}
          onClose={() => {
            if (!isDeleting) {
              setIsConfirmingDelete(false);
            }
          }}
          onConfirm={handleDelete}
          pendingLabel="삭제 중…"
          title="이 수업을 삭제할까요?"
          tone="destructive"
        />
      ) : null}
    </>
  );
}
