/**
 * 🧭 체험 부품 배정 — 강마다 체험 탭 안에 무엇이 사는가의 정본.
 *
 * 근거: docs/MAP-experience-23lessons-v1.md (jery 확정 2026-08-17) · SDD 결정 2·4.
 * 부품은 3종 + 복합 하나뿐이다:
 *   terminal  — 치는 체험 (실습실 계열)
 *   github    — 누르는 체험 (가짜 GitHub 단일 상태 기계, 짝 링크 필수)
 *   tour      — 보는 체험 (견학 키트. 터미널·유사 페이지가 없는 강의 기본 부품)
 *   composite — 23강 하나: 터미널 조립 + 가짜 GitHub 읽기 전용 졸업 전시
 *
 * 🚨 키는 **속 이름표**(chapter.id = chNN)다. 화면의 「N강」(진열 번호)이 아니다 —
 *    진열 순서는 chapter-order.ts 가 정본이고, 여기와 섞으면 12강(ch18) 같은 강에서 어긋난다.
 * 🚨 배정을 바꾸는 것은 지도(MAP) 개정이다 — 구현 사정으로 여기만 고치지 말 것.
 *    experienceTabContract 가 지도의 확정 목록과 1:1 로 대조한다.
 */
export type ExperienceKind = 'terminal' | 'github' | 'tour' | 'composite';

export const EXPERIENCE_KIND_BY_CHAPTER: Record<number, ExperienceKind> = {
  1: 'terminal', //  1강 ch01 — 첫 터미널 인사 (echo·date)
  2: 'tour', //      2강 ch02
  3: 'github', //    3강 ch03 — repo→Pages 배포 대본
  4: 'tour', //      4강 ch04
  5: 'terminal', //  5강 ch05 — «이 페이지 X-ray» (curl)
  6: 'tour', //      6강 ch06
  7: 'tour', //      7강 ch07 (v2 승격 1순위)
  8: 'terminal', //  8강 ch08 — ping·curl
  9: 'tour', //      9강 ch09
  10: 'tour', //    10강 ch10 — 목업 3 의 확정 화면
  11: 'terminal', //11강 ch11 — 같은 부탁 세 번 (AI 필수인 유일한 강)
  12: 'tour', //    14강 ch12
  13: 'tour', //    15강 ch13
  14: 'tour', //    17강 ch14
  15: 'tour', //    18강 ch15
  16: 'tour', //    20강 ch16
  17: 'tour', //    21강 ch17 (v2 승격 2순위)
  18: 'terminal', //12강 ch18 — 기존 실습실 (규칙 한 장)
  19: 'terminal', //13강 ch19 — 스킬 · /init
  20: 'github', //  16강 ch20 — 이슈·완료 조건(AC)
  21: 'terminal', //19강 ch21 — TDD 한 바퀴
  22: 'github', //  22강 ch22 — PR·Merge + 피싱 판별 미니 체험
  23: 'composite', //23강 ch23 — 묶음 조립 + 졸업 전시
};

export function getExperienceKind(chapterId: number): ExperienceKind {
  // 🔑 등록부에 없는 장은 견학형으로 답하지 않고 undefined 대신 tour 를 «지어내지» 않는다 —
  //    계약(experienceTabContract)이 전 장 등재를 강제하므로, 여기 도달하면 그 계약이 이미 빨갛다.
  return EXPERIENCE_KIND_BY_CHAPTER[chapterId] ?? 'tour';
}
