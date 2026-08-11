/**
 * 학생·교사에게 보이는 **진열 순서**. 값은 «속 이름표»(chapter.id)다.
 *
 * 🚨 화면의 번호(「N강」)와 속 이름표(chNN_qMM)는 **다르다.** 실습 6강은 주제별로 섞여 들어가는데,
 *    이름표까지 밀면 견학 107 · 사례 70 · 퀴즈 · 데모 103개 · 학생 진도 기록 · 공유된 링크가 전부
 *    끊긴다. 그래서 **이름표는 그대로 두고 진열 순서만** 바꾼다(jery 확정 2026-08-11, 목업 S3).
 *
 * 🔑 「장」이 아니라 「강」을 쓰는 이유 — 옛 번호(12장)와 새 번호(14)가 같은 단위로 겹치면
 *    교사도 작업자도 헷갈린다. 단위를 바꾸면 «14강»은 새 체계에만 있는 말이라 오인할 수가 없다.
 *    (본문 산문 안의 «4장·6장» 같은 상호참조는 옛 단위를 그대로 쓴다 — 그건 속 이름표를 가리킨다.)
 *
 * 🚨 이 배열이 정본이다. 여기 없는 장은 학생에게 안 보인다(등록부에 있어도).
 *    반대로 여기 적혔는데 등록부에 없으면 계약이 «아직 안 만든 강»으로 이름을 불러 준다 —
 *    조용히 번호가 밀리는 대신 눈에 보이게.
 */
export const CHAPTER_DISPLAY_ORDER: readonly number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, // 1–10강 · 컴퓨터의 큰 그림 → 클라우드와 AI
  11, //          11강 · AI에게 일을 시킨다는 것        (속 ch11)
  18, //          12강 · 왜 하네스인가 · CLAUDE.md      (실습)
  19, //          13강 · 나만의 스킬 · /init            (실습)
  12, //          14강 · 만들 것을 정하는 법            (속 ch12)
  13, //          15강 · 아무도 안 적는 세 칸           (속 ch13)
  20, //          16강 · 기획 · 요구사항·이슈·AC        (실습)
  14, //          17강 · 일 시키는 순서                 (속 ch14)
  15, //          18강 · 믿지 않고 확인하는 법          (속 ch15)
  21, //          19강 · TDD 한 바퀴                    (실습)
  16, //          20강 · 합격, 불합격, 그리고 거짓말     (속 ch16)
  17, //          21강 · 재고, 지키고, 운영하기          (속 ch17)
  22, //          22강 · 커밋·PR·보안                   (실습)
  23, //          23강 · 종합 = 졸업                    (실습)
];

/**
 * 진열 순서대로 정렬하고 「N강」 번호를 붙인다.
 * 🔑 번호는 **선언하지 않고 센다** — 배열에서 몇 번째인가가 곧 번호다. 손으로 적으면
 *    순서를 바꿀 때 번호가 안 따라오고, 그때 교사가 보는 번호와 진짜 순서가 어긋난다.
 */
export function orderChapters<T extends { id: number }>(chapters: readonly T[]): Array<T & { lessonNo: number }> {
  const byId = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const ordered: Array<T & { lessonNo: number }> = [];

  for (const chapterId of CHAPTER_DISPLAY_ORDER) {
    const chapter = byId.get(chapterId);
    if (!chapter) {
      continue; // 아직 안 만든 강 — 계약이 이름을 불러 준다(chapterOrderContract.test.ts)
    }
    byId.delete(chapterId);
    ordered.push({ ...chapter, lessonNo: ordered.length + 1 });
  }

  // 🚨 진열 선언에 빠진 장도 **버리지 않고 뒤에 붙인다.** 조용히 사라지면 «만들었는데 학생에게
  //    안 보이는» 콘텐츠가 생기고, 그건 아무도 안 알려 준다. 계약이 이 상태를 빨갛게 잡는다.
  for (const chapter of byId.values()) {
    ordered.push({ ...chapter, lessonNo: ordered.length + 1 });
  }

  return ordered;
}
