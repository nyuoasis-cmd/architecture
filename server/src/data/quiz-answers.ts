const QA_COUNTS = [7, 7, 7, 7, 7, 10, 6, 7, 6, 7] as const;

export type QuizAnswer = {
  correctIdx: number;
  explanation: string;
};

export type QuizAnswerSet = {
  qaId: string;
  answers: QuizAnswer[];
};

function createPlaceholderAnswers(qaId: string): QuizAnswerSet {
  return {
    qaId,
    answers: [{ correctIdx: 0, explanation: '이 문항의 해설은 준비중입니다.' }],
  };
}

function createAnswerRecord(): Record<string, QuizAnswerSet> {
  const entries: Array<[string, QuizAnswerSet]> = [];

  QA_COUNTS.forEach((count, chapterIndex) => {
    const chapterId = chapterIndex + 1;
    Array.from({ length: count }, (_, index) => {
      const order = index + 1;
      const qaId = `ch${String(chapterId).padStart(2, '0')}_q${String(order).padStart(2, '0')}`;

      if (qaId === 'ch06_q03') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '프로그램은 저장된 파일이고, 프로세스는 메모리에서 실행 중인 상태이며, 프로세서는 CPU 같은 처리 부품입니다.',
              },
              {
                correctIdx: 1,
                explanation: '같은 앱을 두 번 실행하면 메모리에는 서로 독립된 프로세스 두 개가 만들어집니다.',
              },
              {
                correctIdx: 2,
                explanation: 'CPU는 명령을 실제로 처리하는 프로세서입니다.',
              },
            ],
          },
        ]);
        return;
      }

      entries.push([qaId, createPlaceholderAnswers(qaId)]);
    });
  });

  return Object.fromEntries(entries);
}

export const QUIZ_ANSWERS: Record<string, QuizAnswerSet> = createAnswerRecord();
