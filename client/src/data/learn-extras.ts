import { BASE_EXTRAS } from './base-extras';
import { VIBE_EXTRAS, type VibeExtras } from './vibe-stubs';

/**
 * 학습 화면의 부가 데이터(⚡사례 · 🚌견학 · ✋내 차례) 전체 등록부.
 *
 * 🔑 형판(탭형 화면)을 고르는 기준은 **«이 장에 extras 가 있는가»** 하나다.
 *    예전에는 카테고리(«바이브코딩»)로 갈랐는데, 그러면 1~10장을 옮기려면 카테고리를 바꿔야 하고
 *    그건 장 하나를 옮기는 일이 아니라 분류 체계를 건드리는 일이 된다.
 *    데이터 유무로 가르면 **장 단위로 옮겨 가고, 문제가 생기면 그 장 파일만 되돌리면 된다.**
 *
 * 🚨 탭은 데이터가 있을 때만 켜진다(VibeLearnLayout). 견학·사례만 있는 장에는 «내 차례» 탭이 생기지 않는다.
 */
export const ALL_EXTRAS: Record<string, VibeExtras> = {
  ...VIBE_EXTRAS,
  ...BASE_EXTRAS,
};

export function getExtras(qaId: string): VibeExtras | undefined {
  return ALL_EXTRAS[qaId];
}

/** qaId(`chNN_qMM`)에서 장 번호를 뽑는다. 모양이 다르면 NaN 이 되어 어느 장에도 안 붙는다. */
export function chapterIdOfQaId(qaId: string): number {
  const matched = /^ch(\d{2})_q\d{2}$/.exec(qaId);
  return matched ? Number(matched[1]) : Number.NaN;
}

/** extras 가 하나라도 있는 장 번호들 — 이 장들이 탭형 형판을 쓴다. */
export const EXTRAS_CHAPTER_IDS: ReadonlySet<number> = new Set(
  Object.keys(ALL_EXTRAS)
    .map(chapterIdOfQaId)
    .filter((id) => Number.isFinite(id)),
);

export function chapterUsesExtrasLayout(chapterId: number): boolean {
  return EXTRAS_CHAPTER_IDS.has(chapterId);
}
