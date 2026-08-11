import type { QuizAnswerSet } from './quiz-answers';

// 12강(속 ch18) «왜 하네스인가 · CLAUDE.md» 퀴즈 정답·해설.
// 선지 순서는 클라이언트 vibe-ch18.ts CH18_QUIZZES와 1:1 — 수정 시 양쪽을 함께 고친다.
// (어긋나면 server/src/lib/vibeQuizContract.test.ts 가 빨강을 낸다.)

export const CH18_QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
  ch18_q01: {
    qaId: 'ch18_q01',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '흔들린 것은 AI의 성의가 아니라 «내가 안 정한 칸»입니다. 길이·말투·이모지처럼 부탁문에 없던 것을 채우는 쪽이 매번 다르게 정한 것입니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '사람도 똑같습니다. 부탁에 없는 칸은 받은 사람이 자기가 아는 기준으로 채웁니다 — 그래서 세 장이 다 다릅니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '"왜 매번 다르지?"는 원망으로 끝나지만 "내가 안 정한 칸이 몇 개지?"는 할 일을 만듭니다. 흔들리는 칸을 찾아 한 번만 정해 두면 됩니다.',
      },
    ],
  },
  ch18_q02: {
    qaId: 'ch18_q02',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '다음에도 똑같이 말해야 한다면 규칙 칸으로 옮깁니다. 매번 명령으로 적으면 언젠가 한 번은 빠뜨리고, 그날 결과만 튑니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '"이번 안내문"은 한 번뿐입니다. 매번 그럴 리 없으니 규칙으로 만들 이유가 없습니다 — 이번 부탁문에만 적으면 됩니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '규칙이 너무 많으면 서로 부딪히고, 부딪히면 어느 쪽을 따를지 또 AI가 정합니다. 처음 문제로 되돌아갑니다. 지킬 수 있는 세 줄이 낫습니다.',
      },
    ],
  },
  ch18_q03: {
    qaId: 'ch18_q03',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '대상(어디에 적용되나) · 규칙(늘 지킬 것) · 예외(안 지켜도 되는 때) · 안 하는 것(이번엔 하지 않기로 정한 것). 뒤의 두 칸이 가장 자주 빠집니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '적지 않은 것은 금지가 아니라 침묵입니다. 침묵은 승낙으로 읽혀서, 안 정한 자리가 그대로 흔들립니다.',
      },
      {
        correctIdx: 3,
        explanation:
          '«친절하게·보기 좋게·성의 있게»는 누가 읽어도 같게 판정할 수 없습니다. 판정할 수 없는 문장은 규칙처럼 생겼을 뿐 규칙이 아닙니다.',
      },
    ],
  },
  ch18_q04: {
    qaId: 'ch18_q04',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '적히지 않은 규칙도 평소엔 잘 굴러갑니다. 드러나는 때는 새로 온 사람이 있을 때, 그리고 서로 다르게 기억할 때입니다.',
      },
      {
        correctIdx: 0,
        explanation:
          'AI는 언제나 새로 온 사람입니다. 대화가 끝나면 우리 사정을 다시 모릅니다 — 그래서 당연한 것도 적어야 합니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '빈칸이 나온 건 실패가 아니라 오늘의 교재입니다. 쿨타임이 없으니 바로 고쳐서 다시 낼 수 있습니다.',
      },
    ],
  },
};
