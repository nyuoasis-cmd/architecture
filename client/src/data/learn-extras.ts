import { BASE_EXTRAS } from './base-extras';
import { VIBE_EXTRAS, type VibeExtras } from './vibe-stubs';

/**
 * 학습 화면의 부가 데이터(⚡사례 · 🚌견학 · ✋내 차례) 전체 등록부.
 *
 * 🚨 이 데이터는 **화면 종류를 고르지 않는다.** 2026-08-11 까지는 «이 장에 extras 가 있는가»가
 *    3컬럼 ↔ 5탭 형판을 갈랐는데, 견학이 107/107 문항에 붙자 조건이 17/17 장을 참으로 만들어
 *    3컬럼이 통째로 죽었다 — 콘텐츠가 늘었다는 이유로 화면 골격이 조용히 뒤집힌 것이다.
 *    지금은 화면이 하나뿐이고, extras 는 **우측 탭이 몇 개 켜지는가**에만 관여한다(ContentPanel).
 *
 * 🚨 탭은 데이터가 있을 때만 켜진다. 견학·사례만 있는 문항에는 «내 차례» 탭이 생기지 않는다.
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

/**
 * extras 가 하나라도 있는 장 번호들.
 * 🔑 «이 장은 콘텐츠가 채워졌다»는 뜻일 뿐, 화면 종류와는 무관하다. 계약 ⑨(장의 문항 전부를 덮는가)가
 *    이 묶음을 대상으로 돈다 — 반쪽으로 채우면 문항을 넘길 때마다 탭이 생겼다 사라진다.
 */
export const EXTRAS_CHAPTER_IDS: ReadonlySet<number> = new Set(
  Object.keys(ALL_EXTRAS)
    .map(chapterIdOfQaId)
    .filter((id) => Number.isFinite(id)),
);

/** 그 장에 extras 가 하나라도 있는가. 🚨 화면 분기에 쓰지 말 것 — 위 주석의 사고가 그렇게 났다. */
export function chapterHasExtras(chapterId: number): boolean {
  return EXTRAS_CHAPTER_IDS.has(chapterId);
}
