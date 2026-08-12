import { CHAPTERS, getQasByChapterId, type Chapter, type QaStub } from '../../data/qa-stubs';

export type NextQuestionDoorTarget = {
  chapter: Chapter;
  qa: QaStub;
};

/**
 * 진열 순서에서 현재 문항 바로 뒤의 목적지를 찾습니다.
 * 세션 문항 목록을 받으면 그 범위 안에서만 찾되, 목록 자체의 순서는 믿지 않습니다.
 */
export function getNextQuestionDoorTarget(
  currentQaId: string,
  availableQaIds?: readonly string[],
): NextQuestionDoorTarget | undefined {
  const available = availableQaIds ? new Set(availableQaIds) : undefined;
  const orderedQas = CHAPTERS.flatMap((chapter) => getQasByChapterId(chapter.id)).filter(
    (candidate) => !available || available.has(candidate.id),
  );
  const currentIndex = orderedQas.findIndex((candidate) => candidate.id === currentQaId);
  const nextQa = currentIndex >= 0 ? orderedQas[currentIndex + 1] : undefined;

  if (!nextQa) {
    return undefined;
  }

  const nextChapter = CHAPTERS.find((candidate) => candidate.id === nextQa.chapterId);
  return nextChapter ? { chapter: nextChapter, qa: nextQa } : undefined;
}
