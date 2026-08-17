import type { GhScript } from '../lib/gh-sim';

/**
 * 가짜 GitHub 대본 등록부 — 키는 속 이름표(chapter.id).
 *
 * 🔑 상태 기계는 하나(gh-sim)고, 강마다 다른 것은 **대본뿐**이다:
 *    ch03(배포) · ch20(이슈·완료 조건) · ch22(PR·Merge) · ch23(읽기 전용 졸업 전시).
 * 🚨 여기 등록되는 강은 experience.ts 의 github/composite 배정과 일치해야 한다(ghSimContract).
 *    대본이 아직 없는 github 강의 체험 탭은 견학이 대신 선다(ContentPanel 폴백).
 */
export const GH_SCRIPTS: Record<number, GhScript> = {};

export function getGhScript(chapterId: number): GhScript | undefined {
  return GH_SCRIPTS[chapterId];
}
