import type { QuizAnswerSet } from './quiz-answers';

// 19강(속 ch21) «TDD 한 바퀴» 퀴즈 정답·해설.
// 선지 순서는 클라이언트 vibe-ch21.ts CH21_QUIZZES와 1:1 — 수정 시 양쪽을 함께 고친다.

export const CH21_QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
  ch21_q01: {
    qaId: 'ch21_q01',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '조건이 세 개일 땐 매번 세 번 눌러 보면 되지만 서른 개가 되면 그럴 수 없습니다. 사람은 자연스럽게 «방금 고친 데»만 보게 됩니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '눈으로 안 본 조건은 대개 수업 중에, 학생 앞에서 드러납니다. 가장 나쁜 자리에서 가장 늦게 아는 것입니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '사람이 못 하는 일을 대신 하는 게 아닙니다. 매번 전부 확인하는 일은 사람이 지겨워서 안 하게 되는 일이라 기계가 맡습니다.',
      },
    ],
  },
  ch21_q02: {
    qaId: 'ch21_q02',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '앞이 넣는 것, 뒤가 나와야 하는 것입니다. 둘이 분명해야 기계가 넣어 보고 비교할 수 있습니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '이유 없는 약속은 나중에 아무도 못 건드립니다 — 왜 있는지 모르니 고치기도 지우기도 무섭습니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '틀릴 수 없는 약속은 아무것도 지키지 못합니다. 16강의 «어떤 결과가 나와도 성공이라 말할 수 있으면 기준이 아니다»와 같은 이야기입니다.',
      },
    ],
  },
  ch21_q03: {
    qaId: 'ch21_q03',
    answers: [
      {
        correctIdx: 3,
        explanation:
          '오히려 반대입니다. 한 번에 약속 하나만 쓰니 앞을 다 계획할 필요가 없습니다 — 다음 약속은 이번 것이 초록이 된 뒤에 생각하면 됩니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '처음부터 초록인 약속은 아무것도 안 재고 있을 가능성이 큽니다. 빨강이 초록으로 바뀌는 것을 봐야 그 약속이 무언가를 재고 있음을 압니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '«한 번에 하나»가 리듬입니다. 열 개를 한꺼번에 시키면 어디가 왜 안 되는지 알 수가 없습니다.',
      },
    ],
  },
  ch21_q04: {
    qaId: 'ch21_q04',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '값이 없으면 기계가 무엇을 넣을지 모르고, 사람도 그 장면이 눈에 안 그려집니다. «어린 왕자»를 «김하늘»이처럼 실제 값으로 적으세요.',
      },
      {
        correctIdx: 1,
        explanation:
          '«무언가 표시된다»는 뭘 해도 통과합니다. 어디에 무엇이 어떻게 되는지까지 적어야 틀릴 수 있는 약속이 됩니다.',
      },
      {
        correctIdx: 0,
        explanation:
          '«왜 그게 맞나»가 통째로 비는 경우, 그리고 나와야 하는 것이 흐려서 뭘 해도 통과하는 경우입니다.',
      },
    ],
  },
};
