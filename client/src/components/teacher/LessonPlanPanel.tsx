import { useState } from 'react';
import {
  findActiveSegmentIndex,
  getLessonPlan,
  shouldExpandLessonPlanByDefault,
  type LessonPhase,
  type LessonPlan,
} from '../../data/lesson-plans';
import { getChapterById } from '../../data/qa-stubs';

/**
 * 교안 칸 ↔ 학생 진도를 잇는 데 필요한 것. 둘 다 «없을 수 있음»이 기본값이다 —
 * 학생이 아직 없으면 시각도 도달 수도 없고, 그때는 아무것도 그리지 않는다.
 */
type ClassProgress = {
  /** 문항 id → 그 문항을 연 학생 수 */
  qaCompletion: Record<string, number>;
  participantCount: number;
  /** 수업 시작 근사값 = 첫 학생이 들어온 시각(ISO). 없으면 «몇 분째»를 말하지 않는다. */
  startedAt?: string;
  /** 지금까지 흐른 분. startedAt 이 있을 때만 값이 있다. */
  elapsedMinutes?: number;
};

/**
 * 교사 세션 화면의 «이 차시 진행» 패널.
 *
 * 🔑 교사는 수업 중에 이 화면을 띄워 둔 채로 진행한다. 그래서 기본은 **펼친 상태**고,
 *    한 칸이 몇 분인지·학생이 무엇을 하는지가 먼저 보이고, 교사 주석은 그 아래 붙는다.
 * 🚨 교안이 없는 장은 아무것도 그리지 않는다 — «준비 중» 같은 빈 상자를 띄우면 교사가
 *    수업 중에 그걸 열어 보느라 시간을 쓴다.
 */

const PHASE_STYLE: Record<LessonPhase, { icon: string; chip: string }> = {
  열기: { icon: '🔔', chip: 'bg-amber-100 text-amber-900' },
  학습: { icon: '📖', chip: 'bg-stone-200 text-stone-800' },
  견학: { icon: '🚌', chip: 'bg-sky-100 text-sky-900' },
  '내 차례': { icon: '✋', chip: 'bg-violet-100 text-violet-900' },
  퀴즈: { icon: '🧪', chip: 'bg-emerald-100 text-emerald-900' },
  정리: { icon: '🧵', chip: 'bg-stone-100 text-stone-700' },
};

function elapsedLabel(segments: LessonPlan['segments'], index: number): string {
  const start = segments.slice(0, index).reduce((sum, segment) => sum + segment.minutes, 0);
  return `${start}–${start + segments[index].minutes}분`;
}

function PlanBody({ plan, progress }: { plan: LessonPlan; progress?: ClassProgress }) {
  // 🚨 «지금 이 칸»은 시각을 알 때만 말한다. 모르면 아무 칸도 «지금»이라고 하지 않는다 —
  //    틀린 «몇 분째»는 없는 것보다 나쁘다(교사가 그걸 믿고 진도를 당기거나 늦춘다).
  const activeIndex =
    progress?.elapsedMinutes === undefined ? null : findActiveSegmentIndex(plan, progress.elapsedMinutes);
  const isOvertime = progress?.elapsedMinutes !== undefined && activeIndex === null;

  return (
    <div className="mt-4">
      <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
        <span className="font-medium text-stone-900">이 차시가 끝나면 </span>
        {plan.goal}
      </p>

      {progress?.elapsedMinutes !== undefined ? (
        <p className="mt-3 rounded-2xl bg-stone-900 px-4 py-3 text-sm text-white">
          첫 학생이 들어온 뒤 <b className="font-semibold">{progress.elapsedMinutes}분째</b>
          {isOvertime ? ` · 계획한 ${plan.totalMinutes}분을 지났어요` : ' · 아래에서 「지금 이 칸」을 보세요'}
          <span className="mt-1 block text-xs text-stone-400">
            이 앱에는 「수업 시작」 기록이 없어서 첫 참여 시각으로 셉니다 — 미리 만들어 둔 세션이면 어긋날 수 있어요.
          </span>
        </p>
      ) : null}

      <ol className="mt-4 space-y-3">
        {plan.segments.map((segment, index) => {
          const style = PHASE_STYLE[segment.phase];
          const isActive = index === activeIndex;
          return (
            <li
              className={`rounded-2xl border p-4 ${
                isActive ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900' : 'border-[var(--color-border)]'
              }`}
              key={`${plan.chapterId}-${index}-${segment.title}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-stone-500">{elapsedLabel(plan.segments, index)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.chip}`}>
                  {style.icon} {segment.phase}
                </span>
                <span className="text-sm font-medium text-stone-900">{segment.title}</span>
                {isActive ? (
                  <span className="rounded-full bg-stone-900 px-2 py-0.5 text-xs font-medium text-white">지금 이 칸</span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-stone-700">
                <span className="text-stone-500">학생 </span>
                {segment.studentDoes}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                <span className="text-stone-500">교사 </span>
                {segment.teacherSays}
              </p>
              {segment.qaIds?.length ? (
                progress && progress.participantCount > 0 ? (
                  // 🔑 «연 학생»이라고 적는다 — 진도 행은 학생이 그 문항 화면을 열 때 생긴다.
                  //    «끝낸»이라고 쓰면 교사가 이해도까지 봤다고 오해한다(퀴즈 점수는 별개다).
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-stone-500">이 칸 문항을 연 학생</span>
                    {segment.qaIds.map((qaId) => {
                      const opened = progress.qaCompletion[qaId] ?? 0;
                      return (
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                            opened === 0 ? 'bg-stone-100 text-stone-400' : 'bg-emerald-50 text-emerald-800'
                          }`}
                          key={qaId}
                        >
                          {qaId} {opened}/{progress.participantCount}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 font-mono text-xs text-stone-400">{segment.qaIds.join(' · ')}</p>
                )
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-rose-700">자주 막히는 곳</p>
        <ul className="mt-2 space-y-1.5">
          {plan.pitfalls.map((pitfall) => (
            <li className="text-sm text-rose-900" key={pitfall}>
              · {pitfall}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm text-stone-700">
        <span className="text-stone-500">마무리 </span>
        {plan.wrapUp}
      </p>
    </div>
  );
}

function ChapterPlan({
  chapterId,
  defaultOpen,
  progress,
}: {
  chapterId: number;
  defaultOpen: boolean;
  progress?: ClassProgress;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const plan = getLessonPlan(chapterId);
  const chapter = getChapterById(chapterId);

  if (!plan) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span>
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">이 차시 진행</span>
          <span className="mt-1 block text-lg font-medium text-stone-900">
            {chapter ? `${chapter.emoji} ${chapter.id}장 ${chapter.title}` : `${chapterId}장`}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">{plan.totalMinutes}분</span>
          <span className="text-sm text-stone-500">{isOpen ? '접기' : '펼치기'}</span>
        </span>
      </button>
      {isOpen ? <PlanBody plan={plan} progress={progress} /> : null}
    </div>
  );
}

export default function LessonPlanPanel({
  chapterIds,
  progress,
}: {
  chapterIds: number[];
  progress?: ClassProgress;
}) {
  const withPlan = chapterIds.filter((chapterId) => getLessonPlan(chapterId) !== undefined);

  if (withPlan.length === 0) {
    return null;
  }

  // 🚨 한 장일 때만 펼친다. 세션이 17장을 담고 있으면(교사 화면 기본값) 전부 펼칠 경우
  //    페이지가 24,000px 가 된다 — prod 실측. 규칙은 데이터 층의 순수 함수에 두고 계약이 지킨다.
  const defaultOpen = shouldExpandLessonPlanByDefault(withPlan.length);

  return (
    <section className="mt-8 space-y-4">
      {withPlan.length > 1 ? (
        <p className="text-sm text-stone-500">
          이 수업에 담긴 장이 {withPlan.length}개입니다. 오늘 할 장을 펼쳐 보세요.
        </p>
      ) : null}
      {withPlan.map((chapterId) => (
        <ChapterPlan chapterId={chapterId} defaultOpen={defaultOpen} key={chapterId} progress={progress} />
      ))}
    </section>
  );
}
