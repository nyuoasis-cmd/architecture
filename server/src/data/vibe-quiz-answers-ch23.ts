import type { QuizAnswerSet } from './quiz-answers';

// 23강(속 ch23) «종합 = 졸업» 퀴즈 정답·해설.
// 선지 순서는 클라이언트 vibe-ch23.ts CH23_QUIZZES와 1:1 — 수정 시 양쪽을 함께 고친다.

export const CH23_QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
  ch23_q01: {
    qaId: 'ch23_q01',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '규칙 문서와 스킬은 한 번 만들면 계속 씁니다. 완료 조건·약속 문장·넘김 쪽지는 일마다 새로 씁니다 — 12강의 명령과 규칙 구분이 문서 층에서 그대로 나타납니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '규칙과 스킬이 있으면 새 일은 완료 조건부터 시작하면 됩니다. 매번 다섯 장을 처음부터 만들면 결국 아무도 안 씁니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '규칙은 «어떻게», 스킬은 «순서», 완료 조건은 «끝», 약속은 «판정 기준»을 미리 정합니다. 정해 두지 않은 칸은 매번 흔들립니다.',
      },
    ],
  },
  ch23_q02: {
    qaId: 'ch23_q02',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '스킬에는 «언제 쓰나»를 묻습니다. 이게 없으면 스킬이 쌓였을 때 아무도 못 고릅니다(13강).',
      },
      {
        correctIdx: 1,
        explanation:
          '약속 문장에는 «틀릴 수 있나»를 묻습니다. 뭘 해도 통과하는 약속은 아무것도 재지 않습니다(19강).',
      },
      {
        correctIdx: 2,
        explanation:
          '빈 칸은 사라지지 않습니다. 대개 남에게 넘긴 뒤나 수업 중처럼 가장 곤란한 자리에서 나타납니다.',
      },
    ],
  },
  ch23_q03: {
    qaId: 'ch23_q03',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '막힐 때마다 그 자리에서 한 줄씩입니다. «나중에 정리하자»는 12강에서 본 그 증발을 그대로 겪습니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '규칙끼리 부딪히면 어느 쪽을 따를지 또 AI가 정하게 됩니다 — 12강의 첫 문제로 되돌아갑니다. 그래서 가끔은 줄여야 합니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '«정해 두지 않으면 누군가가 대신 정한다.» 그 누군가는 AI일 수도, 옆 사람일 수도, 우연일 수도 있습니다. 정하는 사람이 되는 것이 이 과정 전부였습니다.',
      },
    ],
  },
  ch23_q04: {
    qaId: 'ch23_q04',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '있는 것까지 보내면 AI가 무엇이 비었는지 정확히 알려 줍니다. 비었다는 걸 아는 것 자체가 이 문항의 목적입니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '완성품이 아니라 첫 판입니다. 다음에 새 일을 하다가 막히는 자리가 나오면 그 자리에서 한 줄씩 더하면 됩니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '다섯 장의 내용보다 오래 남는 것은 «이건 어느 칸이 비어서 그런가»를 묻는 습관입니다. AI가 없어도 남는 기술입니다.',
      },
    ],
  },
};
