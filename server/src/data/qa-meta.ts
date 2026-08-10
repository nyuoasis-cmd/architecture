import { QA_CONTEXTS } from './chapter-content';

export type QaMetaEntry = {
  qaId: string;
  chapterId: number;
};

// 🚨 2026-08-11: 이 목록은 손나열이었고, 그래서 썩었다.
//    11·12·14~17장(바이브코딩 42문 중 36문)이 통째로 빠진 채 «정상»으로 보였다 —
//    빠진 문항은 getQaChapterId 가 null 을 주고, 교사 해설이 404 로 죽는다.
//    손나열은 콘텐츠가 늘 때마다 사람이 따라 적어야 하는데, 안 적어도 아무것도 빨개지지 않는다.
//    → 문항의 정본(QA_CONTEXTS)에서 **파생**시킨다. 이제 장을 추가하면 이 목록이 저절로 따라온다.
//    (아래 HAND_LISTED_LEGACY 는 파생 결과가 옛 손목록을 덮는지 확인하는 대조군으로만 남긴다.)
export const HAND_LISTED_LEGACY: QaMetaEntry[] = [
  { qaId: 'ch01_q01', chapterId: 1 },
  { qaId: 'ch01_q02', chapterId: 1 },
  { qaId: 'ch01_q03', chapterId: 1 },
  { qaId: 'ch01_q04', chapterId: 1 },
  { qaId: 'ch02_q01', chapterId: 2 },
  { qaId: 'ch02_q02', chapterId: 2 },
  { qaId: 'ch02_q03', chapterId: 2 },
  { qaId: 'ch02_q04', chapterId: 2 },
  { qaId: 'ch03_q01', chapterId: 3 },
  { qaId: 'ch03_q02', chapterId: 3 },
  { qaId: 'ch03_q03', chapterId: 3 },
  { qaId: 'ch03_q04', chapterId: 3 },
  { qaId: 'ch03_q05', chapterId: 3 },
  { qaId: 'ch03_q06', chapterId: 3 },
  { qaId: 'ch03_q07', chapterId: 3 },
  { qaId: 'ch04_q01', chapterId: 4 },
  { qaId: 'ch04_q02', chapterId: 4 },
  { qaId: 'ch04_q03', chapterId: 4 },
  { qaId: 'ch04_q04', chapterId: 4 },
  { qaId: 'ch04_q05', chapterId: 4 },
  { qaId: 'ch04_q06', chapterId: 4 },
  { qaId: 'ch04_q07', chapterId: 4 },
  { qaId: 'ch05_q01', chapterId: 5 },
  { qaId: 'ch05_q02', chapterId: 5 },
  { qaId: 'ch05_q03', chapterId: 5 },
  { qaId: 'ch05_q04', chapterId: 5 },
  { qaId: 'ch05_q05', chapterId: 5 },
  { qaId: 'ch05_q06', chapterId: 5 },
  { qaId: 'ch05_q07', chapterId: 5 },
  { qaId: 'ch06_q01', chapterId: 6 },
  { qaId: 'ch06_q02', chapterId: 6 },
  { qaId: 'ch06_q04', chapterId: 6 },
  { qaId: 'ch06_q05', chapterId: 6 },
  { qaId: 'ch06_q06', chapterId: 6 },
  { qaId: 'ch06_q07', chapterId: 6 },
  { qaId: 'ch06_q08', chapterId: 6 },
  { qaId: 'ch06_q09', chapterId: 6 },
  { qaId: 'ch06_q10', chapterId: 6 },
  { qaId: 'ch07_q01', chapterId: 7 },
  { qaId: 'ch07_q02', chapterId: 7 },
  { qaId: 'ch07_q03', chapterId: 7 },
  { qaId: 'ch07_q04', chapterId: 7 },
  { qaId: 'ch07_q05', chapterId: 7 },
  { qaId: 'ch07_q06', chapterId: 7 },
  { qaId: 'ch08_q01', chapterId: 8 },
  { qaId: 'ch08_q02', chapterId: 8 },
  { qaId: 'ch08_q03', chapterId: 8 },
  { qaId: 'ch08_q04', chapterId: 8 },
  { qaId: 'ch08_q05', chapterId: 8 },
  { qaId: 'ch08_q06', chapterId: 8 },
  { qaId: 'ch08_q07', chapterId: 8 },
  { qaId: 'ch09_q01', chapterId: 9 },
  { qaId: 'ch09_q02', chapterId: 9 },
  { qaId: 'ch09_q03', chapterId: 9 },
  { qaId: 'ch09_q04', chapterId: 9 },
  { qaId: 'ch09_q05', chapterId: 9 },
  { qaId: 'ch09_q06', chapterId: 9 },
  { qaId: 'ch10_q01', chapterId: 10 },
  { qaId: 'ch10_q02', chapterId: 10 },
  { qaId: 'ch10_q03', chapterId: 10 },
  { qaId: 'ch10_q04', chapterId: 10 },
  { qaId: 'ch10_q05', chapterId: 10 },
  { qaId: 'ch10_q06', chapterId: 10 },
  { qaId: 'ch10_q07', chapterId: 10 },
  { qaId: 'ch13_q01', chapterId: 13 },
  { qaId: 'ch13_q02', chapterId: 13 },
  { qaId: 'ch13_q03', chapterId: 13 },
  { qaId: 'ch13_q04', chapterId: 13 },
  { qaId: 'ch13_q05', chapterId: 13 },
  { qaId: 'ch13_q06', chapterId: 13 },
];

/**
 * 정본에서 파생한 qaId → chapterId 목록.
 * 🔑 QA_CONTEXTS 는 챕터 등록부(chapter-content.ts CHAPTERS + VIBE_CHAPTER_META)에서 만들어지므로,
 *    장·문항이 늘면 이 목록도 같이 는다. 사람이 따라 적을 것이 없다 = 썩을 곳이 없다.
 */
export const QA_META: QaMetaEntry[] = QA_CONTEXTS.map((qa) => ({
  qaId: qa.id,
  chapterId: qa.chapterId,
}));

const QA_CHAPTER_ID_MAP = new Map(QA_META.map((entry) => [entry.qaId, entry.chapterId]));

export function getQaChapterId(qaId: string): number | null {
  return QA_CHAPTER_ID_MAP.get(qaId) ?? null;
}
