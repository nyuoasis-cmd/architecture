import { useState } from 'react';
import {
  getLessonPlan,
  shouldExpandLessonPlanByDefault,
  type LessonPhase,
  type LessonPlan,
} from '../../data/lesson-plans';
import { getChapterById } from '../../data/qa-stubs';

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

function PlanBody({ plan }: { plan: LessonPlan }) {
  return (
    <div className="mt-4">
      <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
        <span className="font-medium text-stone-900">이 차시가 끝나면 </span>
        {plan.goal}
      </p>

      <ol className="mt-4 space-y-3">
        {plan.segments.map((segment, index) => {
          const style = PHASE_STYLE[segment.phase];
          return (
            <li
              className="rounded-2xl border border-[var(--color-border)] p-4"
              key={`${plan.chapterId}-${index}-${segment.title}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-stone-500">{elapsedLabel(plan.segments, index)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.chip}`}>
                  {style.icon} {segment.phase}
                </span>
                <span className="text-sm font-medium text-stone-900">{segment.title}</span>
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
                <p className="mt-2 font-mono text-xs text-stone-400">{segment.qaIds.join(' · ')}</p>
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

function ChapterPlan({ chapterId, defaultOpen }: { chapterId: number; defaultOpen: boolean }) {
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
      {isOpen ? <PlanBody plan={plan} /> : null}
    </div>
  );
}

export default function LessonPlanPanel({ chapterIds }: { chapterIds: number[] }) {
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
        <ChapterPlan chapterId={chapterId} defaultOpen={defaultOpen} key={chapterId} />
      ))}
    </section>
  );
}
