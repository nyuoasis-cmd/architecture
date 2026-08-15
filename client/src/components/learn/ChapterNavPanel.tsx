import { Link } from 'react-router-dom';
import type { Chapter, QaStub } from '../../data/qa-stubs';
import { getCategoryMeaning } from '../../data/category-meanings';
import { LAB_MISSIONS, LAB_QA_ID } from '../../data/vibe-lab-ch18';
import { useProgressMap } from '../../lib/progress';
import { useLearnStore } from '../../store/learn-store';

type ChapterNavPanelProps = {
  chapter: Chapter;
  currentQa: QaStub;
  /** 이 강의 문항만. 🚨 세션에 담긴 전체 문항을 여기 세우지 않는다 — §아래 주석 참조. */
  chapterQas: QaStub[];
  /** 학생이 이동할 수 있는 강 목록(자습=전체, 세션=그 수업에 담긴 강). 진열 순서 그대로. */
  availableChapters: Chapter[];
  progressMapOverride?: Record<string, { read: boolean; quizScore?: number }>;
  /** 「전체 강 목록」으로 돌아가는 곳. */
  libraryHref: string;
  onSelectQa: (qaId: string) => void;
  onSelectChapter: (chapterId: number) => void;
};

/**
 * 좌측 컬럼 — «지금 어느 장의 몇 번째인가»와 «어디로 갈 수 있는가».
 *
 * 🚨 여기에는 **이 강의 문항만** 세운다. 전체 강을 다 늘어놓으면 «지금 뭘 하고 있는지»가
 *    묻힌다(승인 목업 learn-3col-restore-v1.html S0). 고르는 일은 색인(LibraryPage)에서,
 *    배우는 일은 이 화면에서 — 대신 위의 「← 전체 강 목록」과 아래의 「← 이전 강 / 다음 강 →」로
 *    이동은 두 번의 클릭 안에 끝난다.
 */
export default function ChapterNavPanel({
  chapter,
  currentQa,
  chapterQas,
  availableChapters,
  progressMapOverride,
  libraryHref,
  onSelectQa,
  onSelectChapter,
}: ChapterNavPanelProps) {
  const localProgressMap = useProgressMap();
  const progressMap = progressMapOverride ?? localProgressMap;
  const categoryMeaning = getCategoryMeaning(chapter.category);
  // 🔑 미션은 «실습 탭을 보고 있을 때만» 편다. 다른 탭에서 목차가 미션으로 채워지면
  //    학생이 이 장의 문항 목록을 잃는다.
  const isLabTab = useLearnStore((state) => state.contentTab) === 'lab';

  const chapterIndex = availableChapters.findIndex((item) => item.id === chapter.id);
  const previousChapter = chapterIndex > 0 ? availableChapters[chapterIndex - 1] : undefined;
  const nextChapter = chapterIndex >= 0 ? availableChapters[chapterIndex + 1] : undefined;

  const isDone = (qaId: string) => {
    const entry = progressMap[qaId];
    if (!entry) {
      return false;
    }
    return entry.quizScore !== undefined ? entry.quizScore >= 2 : entry.read;
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-shrink-0 border-b border-[var(--color-border)] px-3 py-3">
        <Link
          className="mb-3 inline-flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          to={libraryHref}
        >
          ← 전체 강 목록
        </Link>

        <div className="flex items-start gap-2">
          <span className="text-[15px] leading-none">{chapter.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-[var(--color-text-muted)]">{chapter.lessonNo}강</p>
            <h2
              className="mt-0.5 text-[14px] font-semibold leading-[1.4] text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {chapter.title}
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
            {chapter.category}
          </span>
        </div>

        {/*
          🔑 배지의 뜻 한 줄은 **화면에 반드시 남아 있어야 한다**. 사전(category-meanings.ts)만
             살고 화면에서 사라지면 학생은 설명 없는 낱말을 계속 본다 — 계약 ⑤ 가 이 자리를 본다.
        */}
        {categoryMeaning ? (
          <p className="mt-2 text-[11px] leading-[1.6] text-[var(--color-text-faint)]">{categoryMeaning}</p>
        ) : null}
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-faint)]">
            이 강의 문항
          </p>
          <span className="font-mono text-[11px] text-[var(--color-text-faint)]">
            {currentQa.order}/{chapterQas.length}
          </span>
        </div>

        <ul className="space-y-1">
          {chapterQas.map((item) => {
            const isCurrent = item.id === currentQa.id;
            const done = isDone(item.id);

            return (
              <li key={item.id}>
                <button
                  aria-current={isCurrent ? 'true' : undefined}
                  className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                    isCurrent
                      ? 'bg-[var(--color-accent-soft)]'
                      : 'hover:bg-[var(--color-bg-input)]'
                  }`}
                  onClick={() => onSelectQa(item.id)}
                  type="button"
                >
                  <span
                    className={`mt-[1px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[var(--color-accent)] text-white'
                        : done
                          ? 'bg-[var(--color-success)] text-white'
                          : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {done && !isCurrent ? '✓' : item.order}
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-[12.5px] leading-[1.5] ${
                      isCurrent
                        ? 'font-semibold text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-body)]'
                    }`}
                  >
                    {item.title}
                  </span>
                </button>
                {/*
                  🚨 미션은 실습 문항의 **하위 목록**이다. 목차와 미션은 둘 다 «지금 어디쯤인가»에
                     답하므로, 화면에 진도 표시를 둘 두지 않는다(2026-08-15 jery: 미션판 컬럼 폐지).
                  🔑 장 밖의 문항을 세우는 것이 아니라 이 문항 안을 펴는 것이라 계약 5) 를 안 깬다.
                */}
                {isCurrent && item.id === LAB_QA_ID && isLabTab ? <LabMissionList /> : null}
              </li>
            );
          })}
        </ul>

        {isLabTab ? (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-[11px] text-[var(--color-text-faint)]">
            <span>AI 남은 횟수</span>
            {/* 🚨 아직 AI 를 부르는 명령이 없다. 「3 / 3」 이라 적으면 있는 기능처럼 보인다. */}
            <span className="font-semibold text-[var(--color-text-muted)]">아직 안 열림</span>
          </div>
        ) : null}

        {nextChapter ? (
          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-faint)]">다음 강</p>
            <button
              className="mt-1 text-left text-[12px] font-medium leading-[1.5] text-[var(--color-text-primary)] hover:underline"
              onClick={() => onSelectChapter(nextChapter.id)}
              type="button"
            >
              {nextChapter.emoji} {nextChapter.lessonNo}강 · {nextChapter.title}
            </button>
          </div>
        ) : null}
      </div>

      {/*
        🔑 장 사이 이동은 여기서 끝난다 — 좌측에 전 장을 세우지 않는 대신 이 두 버튼을 둔다.
           세션에서는 «그 수업에 담긴 장»만 이웃이 된다(학생이 안 열린 장으로 새지 않게).
      */}
      <div className="flex flex-shrink-0 gap-2 border-t border-[var(--color-border)] p-3">
        {previousChapter ? (
          <button
            className="btn-ghost-sm flex flex-1 items-center justify-center"
            onClick={() => onSelectChapter(previousChapter.id)}
            type="button"
          >
            ← {previousChapter.lessonNo}강
          </button>
        ) : (
          <button className="btn-ghost-sm flex-1" disabled type="button">
            ← 이전 강
          </button>
        )}

        {nextChapter ? (
          <button
            className="btn-primary-sm flex flex-1 items-center justify-center"
            onClick={() => onSelectChapter(nextChapter.id)}
            type="button"
          >
            {nextChapter.lessonNo}강 →
          </button>
        ) : (
          <button className="btn-primary-sm flex-1" disabled type="button">
            다음 강 →
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 실습 문항 아래에 펴는 미션 목록.
 * 🚨 아직 판정하지 않는 미션은 «곧 열림»이 아니라 **«잠김»**으로 적는다 —
 *    앱이 못 하는 일을 할 수 있는 것처럼 적으면 학생이 그 앞에서 기다린다.
 */
function LabMissionList() {
  const missionIndex = useLearnStore((state) => state.labMissionIndex);
  const current = LAB_MISSIONS[missionIndex];

  return (
    <div className="mb-1 ml-[26px] mt-0.5 border-l-2 border-[var(--color-accent)] pl-2.5">
      <ol className="space-y-[3px]">
        {LAB_MISSIONS.map((mission, index) => {
          const done = index < missionIndex;
          const now = index === missionIndex;
          return (
            <li
              key={mission.label}
              className={`flex items-baseline gap-1.5 text-[12px] leading-[1.45] ${
                now
                  ? 'font-semibold text-[var(--color-text-primary)]'
                  : done
                    ? 'text-[var(--color-text-body)]'
                    : 'text-[var(--color-text-faint)]'
              }`}
            >
              <span aria-hidden className="w-[13px] shrink-0 text-center font-mono text-[10px]">
                {done ? '✓' : mission.live ? index + 1 : '·'}
              </span>
              <span className="min-w-0 flex-1">
                {mission.label}
                {/* 🚨 색만으로 «잠김»을 말하지 않는다 — 문자를 같이 적는다(접근성). */}
                {!mission.live ? <span className="ml-1 text-[10px] text-[var(--color-text-faint)]">(잠김)</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
      {current ? (
        <p className="mt-2 border-t border-[var(--color-border)] pt-2 text-[12px] leading-[1.5] text-[var(--color-text-body)]">
          지금 할 일 — {current.goal}
        </p>
      ) : null}
    </div>
  );
}
