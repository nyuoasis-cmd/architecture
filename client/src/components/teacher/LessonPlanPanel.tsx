import { useState } from 'react';
import { getLessonPlan, type LessonPhase, type LessonPlan } from '../../data/lesson-plans';
import { getChapterById } from '../../data/qa-stubs';

/**
 * 교안 칸 ↔ 학생 진도를 잇는 데 필요한 것. 둘 다 «없을 수 있음»이 기본값이다 —
 * 학생이 아직 없으면 시각도 도달 수도 없고, 그때는 아무것도 그리지 않는다.
 */
export type ClassProgress = {
  /** 문항 id → 그 문항을 연 학생 수 */
  qaCompletion: Record<string, number>;
  participantCount: number;
};

/**
 * 「📋 교안」 — 학습 화면 우측 콘텐츠 컬럼의 **교사 전용 탭** 본문.
 *
 * 🚨 2026-08-12(에픽 6/6)에 교사 세션 화면에서 여기로 **옮겨 왔다**. 옮기면서 «세션에 담긴 장을
 *    전부 세우는» 아코디언은 없앴다 — 전 장을 담은 세션에서 교안 23개가 한 화면에 쌓여
 *    페이지가 24,000px 이 되던 그 화면이다(2026-08-11 prod 실측). 이제 **한 번에 한 장**,
 *    교사가 지금 보고 있는 그 장만 그린다. 규칙으로 접는 대신 구조로 못 쌓이게 했다.
 *
 * 🔑 교사는 수업 중에 이 화면을 띄워 둔 채로 진행한다. 학생이 무엇을 하는지가 먼저 보이고,
 *    교사 주석은 그 아래 붙는다.
 * 🚨 교안이 없는 장은 아무것도 그리지 않는다 — «준비 중» 같은 빈 상자를 띄우면 교사가
 *    수업 중에 그걸 열어 보느라 시간을 쓴다.
 *
 * 🚨 **「지금 이 칸」은 시계가 아니라 교사가 정한다**(2026-08-11 jery 확정). 예전에는 첫 학생이
 *    들어온 시각으로 «몇 분째»를 세어 칸을 자동으로 켰는데, 그 근사값은 미리 만들어 둔 세션에서
 *    통째로 틀렸다. 이제 교사가 칸을 눌러 켜고, 아무것도 안 눌렀으면 **아무 칸도 «지금»이 아니다** —
 *    화면이 진도를 지어내지 않는다.
 */

const PHASE_STYLE: Record<LessonPhase, { icon: string; chip: string }> = {
  열기: { icon: '🔔', chip: 'bg-amber-100 text-amber-900' },
  학습: { icon: '📖', chip: 'bg-stone-200 text-stone-800' },
  견학: { icon: '🚌', chip: 'bg-sky-100 text-sky-900' },
  '내 차례': { icon: '✋', chip: 'bg-violet-100 text-violet-900' },
  퀴즈: { icon: '🧪', chip: 'bg-emerald-100 text-emerald-900' },
  정리: { icon: '🧵', chip: 'bg-stone-100 text-stone-700' },
};

function PlanBody({ plan, progress }: { plan: LessonPlan; progress?: ClassProgress }) {
  // 🚨 «지금 이 칸»은 **교사가 눌러서** 정한다. 아무것도 안 눌렀으면 null — 화면이 진도를
  //    지어내지 않는다. (예전엔 첫 참여 시각으로 «몇 분째»를 세어 자동으로 켰는데, 미리
  //    만들어 둔 세션에서 그 근사가 통째로 틀렸다. 틀린 진도는 없는 것보다 나쁘다.)
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="mt-4">
      <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
        <span className="font-medium text-stone-900">이 차시가 끝나면 </span>
        {plan.goal}
      </p>

      <p className="mt-3 text-sm text-stone-500">
        {activeIndex === null
          ? '지금 하고 있는 칸을 눌러 두면 수업 중에 눈으로 찾기 쉬워집니다.'
          : `지금 «${plan.segments[activeIndex].title}» 칸입니다. 다음 칸으로 넘어가면 그 칸을 눌러 주세요.`}
      </p>

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
                <span className="font-mono text-xs text-stone-500">{index + 1}번째 칸</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.chip}`}>
                  {style.icon} {segment.phase}
                </span>
                <span className="text-sm font-medium text-stone-900">{segment.title}</span>
                {/* 🚨 교사가 누르는 자리. 켜져 있을 때 다시 누르면 꺼진다 — 잘못 눌러도 되돌릴 수 있어야 한다. */}
                <button
                  aria-pressed={isActive}
                  className={`ml-auto inline-flex min-h-11 items-center rounded-full px-3 text-xs font-medium ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'border border-[var(--color-border)] bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                  onClick={() => setActiveIndex((current) => (current === index ? null : index))}
                  type="button"
                >
                  {isActive ? '지금 이 칸 · 끄기' : '여기부터'}
                </button>
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

/**
 * 학습 화면 우측 「📋 교안」 탭의 본문 — **지금 보고 있는 그 장 하나**만 그린다.
 *
 * 🔑 왜 아코디언이 아닌가: 여기서는 교사가 이미 장을 골라 들어와 있다. 세션에 담긴 장을
 *    전부 세워 두면 «지금 이 장»을 다시 찾아야 한다 — 목록을 고르는 일은 좌측 컬럼이 한다.
 * 🚨 교안이 없는 장은 «준비 중» 상자를 띄우지 않는다. 대신 탭 자체가 안 켜진다(ContentPanel).
 *    이 컴포넌트는 만약을 대비해 null 을 돌려줄 뿐, 그 상태를 화면에 설명하지 않는다.
 */
export function LessonPlanTab({ chapterId, progress }: { chapterId: number; progress?: ClassProgress }) {
  const plan = getLessonPlan(chapterId);
  const chapter = getChapterById(chapterId);

  if (!plan) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">이 차시 진행</span>
        {chapter ? (
          <span className="text-sm font-medium text-stone-900">
            {chapter.emoji} {chapter.lessonNo}강 {chapter.title}
          </span>
        ) : null}
        <span className="ml-auto rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
          {plan.segments.length}칸
        </span>
      </div>
      <PlanBody plan={plan} progress={progress} />
    </div>
  );
}
