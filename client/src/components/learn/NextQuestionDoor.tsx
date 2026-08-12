import type { NextQuestionDoorTarget } from './next-question-door';

type NextQuestionDoorProps = NextQuestionDoorTarget & {
  onOpen: () => void;
};

/** 마지막 학생 탭 아래에 열어 두는 수동 이동 통로. 클릭하기 전에는 아무 일도 하지 않습니다. */
export default function NextQuestionDoor({ chapter, qa, onOpen }: NextQuestionDoorProps) {
  return (
    <nav aria-label="다음 문항" className="mt-8 border-t border-[var(--color-border)] pt-6">
      <button
        className="group flex min-h-12 w-full items-center gap-4 rounded-[10px] border border-[var(--color-border)] bg-white px-4 py-3 text-left transition hover:border-stone-300 hover:bg-stone-50"
        onClick={onOpen}
        type="button"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-[var(--color-text-muted)]">다음 문항</span>
          <span className="mt-1 block text-sm font-semibold text-[var(--color-text-primary)]">
            {chapter.lessonNo}강 · {qa.order}번
          </span>
          <span className="mt-0.5 block truncate text-sm text-[var(--color-text-body)]">{qa.title}</span>
        </span>
        <span aria-hidden="true" className="text-lg text-[var(--color-text-muted)] group-hover:text-stone-900">
          →
        </span>
      </button>
    </nav>
  );
}
