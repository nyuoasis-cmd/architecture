import { CH01_ANSWERS } from './base-quiz-answers-ch01';
import { CH02_ANSWERS } from './base-quiz-answers-ch02';
import { CH03_ANSWERS } from './base-quiz-answers-ch03';
import { CH04_ANSWERS } from './base-quiz-answers-ch04';
import { CH05_ANSWERS } from './base-quiz-answers-ch05';
import { CH06_ANSWERS } from './base-quiz-answers-ch06';
import { CH07_ANSWERS } from './base-quiz-answers-ch07';
import { CH08_ANSWERS } from './base-quiz-answers-ch08';
import { CH09_ANSWERS } from './base-quiz-answers-ch09';
import { CH10_ANSWERS } from './base-quiz-answers-ch10';
import { VIBE_QUIZ_ANSWERS } from './vibe-quiz-answers';

export type QuizAnswer = {
  correctIdx: number;
  explanation: string;
};

export type QuizAnswerSet = {
  qaId: string;
  answers: QuizAnswer[];
};

// 1~10장은 장별 파일(base-quiz-answers-chNN.ts), 11~17장은 vibe-quiz-answers 에서 온다.
// 정답 자리는 scripts/rebalance-base-quiz.mjs 가 흩어 놓았다 — 손으로 고칠 때도 한 문에 같은 자리를 몰지 말 것.
export const QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
  ...CH01_ANSWERS,
  ...CH02_ANSWERS,
  ...CH03_ANSWERS,
  ...CH04_ANSWERS,
  ...CH05_ANSWERS,
  ...CH06_ANSWERS,
  ...CH07_ANSWERS,
  ...CH08_ANSWERS,
  ...CH09_ANSWERS,
  ...CH10_ANSWERS,
  ...VIBE_QUIZ_ANSWERS,
};
