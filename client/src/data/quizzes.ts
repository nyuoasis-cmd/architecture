import { CH01_QUIZZES } from './base-quiz-ch01';
import { CH02_QUIZZES } from './base-quiz-ch02';
import { CH03_QUIZZES } from './base-quiz-ch03';
import { CH04_QUIZZES } from './base-quiz-ch04';
import { CH05_QUIZZES } from './base-quiz-ch05';
import { CH06_QUIZZES } from './base-quiz-ch06';
import { CH07_QUIZZES } from './base-quiz-ch07';
import { CH08_QUIZZES } from './base-quiz-ch08';
import { CH09_QUIZZES } from './base-quiz-ch09';
import { CH10_QUIZZES } from './base-quiz-ch10';
import { VIBE_QUIZZES } from './vibe-stubs';

export type QuizQuestion = {
  question: string;
  options: string[];
};

export type QuizSet = {
  qaId: string;
  questions: QuizQuestion[];
};

// 1~10장은 장별 파일(base-quiz-chNN.ts), 11~17장은 vibe-stubs 에서 온다.
// 예전에는 이 파일 안에 장별 Record + createQuizRecord 인라인 분기 + «준비중» 자리표시자가 뒤섞여 있었다.
// 인라인 분기 탓에 소스를 훑는 집계가 ch03~05 를 «준비중»으로 잘못 세는 일이 있었고,
// 자리표시자 경로는 도달하는 문항이 하나도 없는 죽은 코드였다 — 둘 다 걷어냈다.
export const QUIZZES: Record<string, QuizSet> = {
  ...CH01_QUIZZES,
  ...CH02_QUIZZES,
  ...CH03_QUIZZES,
  ...CH04_QUIZZES,
  ...CH05_QUIZZES,
  ...CH06_QUIZZES,
  ...CH07_QUIZZES,
  ...CH08_QUIZZES,
  ...CH09_QUIZZES,
  ...CH10_QUIZZES,
  ...VIBE_QUIZZES,
};
