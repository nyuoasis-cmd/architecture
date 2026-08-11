import { CH01_LESSON_PLAN } from './lesson-plan-ch01';
import { CH02_LESSON_PLAN } from './lesson-plan-ch02';
import { CH03_LESSON_PLAN } from './lesson-plan-ch03';
import { CH04_LESSON_PLAN } from './lesson-plan-ch04';
import { CH05_LESSON_PLAN } from './lesson-plan-ch05';
import { CH06_LESSON_PLAN } from './lesson-plan-ch06';
import { CH07_LESSON_PLAN } from './lesson-plan-ch07';
import { CH08_LESSON_PLAN } from './lesson-plan-ch08';
import { CH09_LESSON_PLAN } from './lesson-plan-ch09';
import { CH10_LESSON_PLAN } from './lesson-plan-ch10';
import { CH11_LESSON_PLAN } from './lesson-plan-ch11';
import { CH12_LESSON_PLAN } from './lesson-plan-ch12';
import { CH13_LESSON_PLAN } from './lesson-plan-ch13';
import { CH14_LESSON_PLAN } from './lesson-plan-ch14';
import { CH15_LESSON_PLAN } from './lesson-plan-ch15';
import { CH16_LESSON_PLAN } from './lesson-plan-ch16';
import { CH17_LESSON_PLAN } from './lesson-plan-ch17';

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
  [CH03_LESSON_PLAN.chapterId]: CH03_LESSON_PLAN,
  [CH04_LESSON_PLAN.chapterId]: CH04_LESSON_PLAN,
  [CH05_LESSON_PLAN.chapterId]: CH05_LESSON_PLAN,
  [CH06_LESSON_PLAN.chapterId]: CH06_LESSON_PLAN,
  [CH07_LESSON_PLAN.chapterId]: CH07_LESSON_PLAN,
  [CH08_LESSON_PLAN.chapterId]: CH08_LESSON_PLAN,
  [CH09_LESSON_PLAN.chapterId]: CH09_LESSON_PLAN,
  [CH10_LESSON_PLAN.chapterId]: CH10_LESSON_PLAN,
  [CH11_LESSON_PLAN.chapterId]: CH11_LESSON_PLAN,
  [CH12_LESSON_PLAN.chapterId]: CH12_LESSON_PLAN,
  [CH13_LESSON_PLAN.chapterId]: CH13_LESSON_PLAN,
  [CH14_LESSON_PLAN.chapterId]: CH14_LESSON_PLAN,
  [CH15_LESSON_PLAN.chapterId]: CH15_LESSON_PLAN,
  [CH16_LESSON_PLAN.chapterId]: CH16_LESSON_PLAN,
  [CH17_LESSON_PLAN.chapterId]: CH17_LESSON_PLAN,
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

/**
 * 교안 패널을 처음부터 펼쳐 둘 것인가.
 *
 * 🚨 «1장 = 1차시»가 기준이라 교안은 한 장짜리 세션을 전제로 만들었는데, **교사 화면의
 *    «새 세션 만들기»는 장을 고르는 칸이 없어 항상 17장을 담는다**(NewSessionModal 의
 *    `chapterIds: allChapterIds`). 그래서 전부 펼치면 45분짜리 교안 17개가 한 화면에 쌓여
 *    페이지가 24,000px(≈27 화면)이 된다 — 실측(2026-08-11 prod). 수업 중에 쓸 수 없는 화면이다.
 *
 * 🔑 그래서 «한 장일 때만» 펼친다. 여러 장이면 접어 두고 교사가 오늘 할 장만 펼친다.
 *    (근본 해결 = 세션 만들 때 장을 고르게 하는 것. 그건 교사 흐름을 바꾸는 결정이라 별건.)
 */
export function shouldExpandLessonPlanByDefault(chaptersWithPlanInSession: number): boolean {
  return chaptersWithPlanInSession === 1;
}

/**
 * 지금이 교안의 몇 번째 칸인가. 범위 밖이면 null.
 *
 * 왜 있는가(2026-08-11 prod QA, 신입샘 t3): 교안은 «0–4분 열기 / 4–13분 학습…»으로 시간을
 * 말하는데 교사 화면 어디에도 «지금 몇 분째»가 없었다. 교사가 45분 계획을 손에 들고도
 * 자기가 어디쯤인지 화면에서 못 읽었다.
 *
 * 🚨 이 함수는 «수업이 몇 분째인가»를 **모른다** — 받은 값으로만 고른다. 시각의 출처를
 *    화면 쪽에 두는 이유는, 이 앱에 «수업 시작» 이라는 기록이 없어서다(세션은 수업 전날
 *    만들어질 수도 있다). 지금 쓰는 근사값은 «첫 학생이 들어온 시각»이고, 근사라는 사실을
 *    화면에 그대로 적는다. 여기서 시각을 지어내면 교사가 틀린 «몇 분째»를 믿게 된다.
 */
export function findActiveSegmentIndex(plan: LessonPlan, elapsedMinutes: number): number | null {
  if (!Number.isFinite(elapsedMinutes) || elapsedMinutes < 0) {
    return null;
  }

  let start = 0;
  for (let index = 0; index < plan.segments.length; index += 1) {
    const end = start + plan.segments[index].minutes;
    if (elapsedMinutes < end) {
      return index;
    }
    start = end;
  }

  // 계획한 시간을 지났다 — 마지막 칸을 «지금»이라고 말하지 않는다(지난 건 지난 것이다).
  return null;
}
