import { CH01_LESSON_PLAN } from './lesson-plan-ch01';
import { CH02_LESSON_PLAN } from './lesson-plan-ch02';

/**
 * 교안(1장 = 1차시) 등록부.
 *
 * 🔑 «1장 = 1차시»가 기준이다(2026-08-11 jery 확정). 한 장의 문항을 한 차시 안에서
 *    어떤 순서로 몇 분씩 다루는지, 학생은 무엇을 하고 교사는 무엇을 말하는지를 한 벌로 적는다.
 *
 * 🚨 교안은 **앱을 설명하는 문서가 아니라 앱을 가리키는 문서**다. 그래서 칸마다 실제 문항 id 를
 *    달고, 계약 테스트(server/src/lib/lessonPlanContract.test.ts)가 그 id 가 진짜 있는지,
 *    🚌 견학 칸이 정말 견학이 있는 문항을 가리키는지, ✋「내 차례」칸이 정말 AI 판정이 붙은
 *    문항을 가리키는지 잡는다. 교안이 없는 것을 있다고 적으면 교사가 수업 중에 헛짚는다.
 *
 * 🔑 등록부에 «어느 장이 교안을 갖는가»를 따로 선언하지 않는다 — 데이터에서 파생한다
 *    (learn-extras 의 EXTRAS_CHAPTER_IDS 와 같은 방식). 선언과 내용이 어긋날 자리를 아예 없앤다.
 */

/** 한 칸이 무슨 종류의 활동인가. 화면의 색·아이콘도 여기서 갈린다. */
export type LessonPhase = '열기' | '학습' | '견학' | '내 차례' | '퀴즈' | '정리';

export type LessonSegment = {
  /** 이 칸에 쓰는 분 */
  minutes: number;
  phase: LessonPhase;
  /** 이 칸에서 하는 일 한 줄 */
  title: string;
  /** 학생용 한 벌 — 학생이 실제로 하는 행동 */
  studentDoes: string;
  /** 교사용 주석 — 이때 교사가 던지는 발문·할 말 */
  teacherSays: string;
  /** 이 칸이 다루는 문항. 실존해야 하고, 그 장의 문항이어야 한다 */
  qaIds?: string[];
};

export type LessonPlan = {
  chapterId: number;
  /** segments 의 분 합과 같아야 한다 — 손으로 적은 값이 어긋나면 계약이 잡는다 */
  totalMinutes: number;
  /** 이 차시가 끝나면 학생이 할 수 있게 되는 것 */
  goal: string;
  segments: LessonSegment[];
  /** 교사용 — 이 차시에서 실제로 자주 막히는 곳 */
  pitfalls: string[];
  /** 마무리에 교사가 남기는 한 마디 */
  wrapUp: string;
};

export const LESSON_PLANS: Record<number, LessonPlan> = {
  [CH01_LESSON_PLAN.chapterId]: CH01_LESSON_PLAN,
  [CH02_LESSON_PLAN.chapterId]: CH02_LESSON_PLAN,
};

/** 교안이 있는 장 번호들 — 등록부에서 파생한다(따로 선언하지 않는다). */
export const LESSON_PLAN_CHAPTER_IDS: ReadonlySet<number> = new Set(
  Object.values(LESSON_PLANS).map((plan) => plan.chapterId),
);

export function getLessonPlan(chapterId: number): LessonPlan | undefined {
  return LESSON_PLANS[chapterId];
}

export function hasLessonPlan(chapterId: number): boolean {
  return LESSON_PLAN_CHAPTER_IDS.has(chapterId);
}
