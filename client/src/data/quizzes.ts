const QA_COUNTS = [7, 7, 7, 7, 7, 10, 6, 7, 6, 7] as const;

export type QuizQuestion = {
  question: string;
  options: string[];
};

export type QuizSet = {
  qaId: string;
  questions: QuizQuestion[];
};

function createPlaceholderQuiz(qaId: string): QuizSet {
  return {
    qaId,
    questions: [
      {
        question: '이 문항의 퀴즈는 후속 콘텐츠 PR에서 보강될 예정입니다. 지금은 준비중 문항으로 표시됩니다.',
        options: ['준비중', '준비중', '준비중', '준비중'],
      },
    ],
  };
}

function createQuizRecord(): Record<string, QuizSet> {
  const entries: Array<[string, QuizSet]> = [];

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
            questions: [
              {
                question: '프로그램, 프로세스, 프로세서의 차이로 옳은 것은?',
                options: [
                  '모두 같은 의미다.',
                  '프로그램은 디스크 파일, 프로세스는 실행 중 상태, 프로세서는 CPU다.',
                  '프로그램은 메모리이고 프로세서는 파일이다.',
                  '프로세스가 가장 큰 개념이다.',
                ],
              },
              {
                question: '같은 앱을 두 번 실행하면 어떻게 될까요?',
                options: ['프로세스 1개만 남는다.', '프로세스 2개가 생긴다.', '에러가 발생한다.', '두 번째 실행은 캐시로 처리된다.'],
              },
              {
                question: 'CPU는 무엇에 해당하나요?',
                options: ['프로그램', '프로세스', '프로세서', '메모리'],
              },
            ],
          },
        ]);
        return;
      }

      entries.push([qaId, createPlaceholderQuiz(qaId)]);
    });
  });

  return Object.fromEntries(entries);
}

export const QUIZZES: Record<string, QuizSet> = createQuizRecord();
