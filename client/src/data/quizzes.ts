const QA_COUNTS = [4, 7, 7, 7, 7, 10, 6, 7, 6, 7] as const;

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

      if (qaId === 'ch01_q01') {
        entries.push([
          qaId,
          {
            qaId,
            questions: [
              {
                question: '컴퓨터의 가장 기본 흐름을 가장 잘 나타낸 것은 무엇인가요?',
                options: [
                  '입력 → 처리 → 출력',
                  '설치 → 삭제 → 종료',
                  '다운로드 → 로그인 → 결제',
                  '저장 → 복사 → 압축',
                ],
              },
              {
                question: '라면 끓이기 비유에서 메모리에 가까운 것은 무엇인가요?',
                options: ['마트 진열대', '냄비', '식탁 의자', '영수증'],
              },
              {
                question: '컴퓨터 안에서 사진과 문자, 소리가 결국 같은 방식으로 다뤄진다고 할 때 핵심 표현은 무엇인가요?',
                options: [
                  '모두 0과 1 형태로 바뀐다.',
                  '모두 같은 파일 크기를 가진다.',
                  '모두 인터넷을 거쳐야만 처리된다.',
                  '모두 화면에서만 사용할 수 있다.',
                ],
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch01_q02') {
        entries.push([
          qaId,
          {
            qaId,
            questions: [
              {
                question: '하드웨어를 가장 잘 설명한 것은 무엇인가요?',
                options: [
                  '컴퓨터가 따라야 할 규칙 문서',
                  '사용자가 저장한 사진 모음',
                  '손으로 만질 수 있는 실제 부품',
                  '앱 안에 들어 있는 설정 메뉴',
                ],
              },
              {
                question: '같은 노트북이 문서 작업용이 되기도 하고 게임기가 되기도 하는 가장 직접적인 이유는 무엇인가요?',
                options: [
                  '모니터 크기가 계속 바뀌기 때문에',
                  '설치된 소프트웨어가 다르게 동작을 지시하기 때문에',
                  '하드웨어가 스스로 목적을 바꾸기 때문에',
                  '전기 콘센트 종류가 달라지기 때문에',
                ],
              },
              {
                question: '무대와 대본 비유에서 소프트웨어에 해당하는 것은 무엇인가요?',
                options: [
                  '조명과 스피커',
                  '객석 배치도',
                  '배우의 의상 창고',
                  '장면 순서와 대사를 적은 대본',
                ],
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch01_q03') {
        entries.push([
          qaId,
          {
            qaId,
            questions: [
              {
                question: '운영체제의 역할로 가장 알맞은 것은 무엇인가요?',
                options: [
                  '컴퓨터를 꾸미는 배경 이미지를 저장한다.',
                  '하드웨어와 앱 사이에서 자원과 규칙을 조정한다.',
                  '인터넷 선의 길이를 측정한다.',
                  '모든 파일을 자동으로 삭제한다.',
                ],
              },
              {
                question: '여러 앱이 동시에 열려 있을 때 운영체제가 특히 신경 써야 하는 일은 무엇인가요?',
                options: [
                  '각 앱이 쓸 CPU 시간과 메모리를 나누는 일',
                  '모든 앱의 이름을 같은 길이로 맞추는 일',
                  '키보드를 더 무겁게 만드는 일',
                  '화면 밝기를 항상 최대로 고정하는 일',
                ],
              },
              {
                question: '식당 매니저 비유에서 운영체제의 파일 관리 역할과 가장 가까운 것은 무엇인가요?',
                options: [
                  '손님 수를 숨기는 일',
                  '주방 불을 모두 끄는 일',
                  '영수증과 예약 정보를 정리해 두는 일',
                  '식탁을 무조건 하나만 쓰게 하는 일',
                ],
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch01_q04') {
        entries.push([
          qaId,
          {
            qaId,
            questions: [
              {
                question: '컴퓨터에서 데이터를 처리할 때 일반적인 이동 순서로 가장 적절한 것은 무엇인가요?',
                options: [
                  'SSD → RAM → CPU',
                  'CPU → SSD → RAM',
                  'RAM → 전원 버튼 → SSD',
                  '모니터 → CPU → 키보드',
                ],
              },
              {
                question: 'RAM의 특징으로 옳은 것은 무엇인가요?',
                options: [
                  '느리지만 전원을 꺼도 남는다.',
                  '빠르게 작업하지만 전원이 꺼지면 내용이 사라진다.',
                  '항상 CPU보다 멀리 있어서 쓰이지 않는다.',
                  '파일 이름만 저장하고 데이터는 저장하지 않는다.',
                ],
              },
              {
                question: '캐시를 책상 위 포스트잇에 비유한 이유는 무엇인가요?',
                options: [
                  '자주 쓰는 정보를 가장 가까이에 두기 위해서',
                  '내용을 영구 보관하기 위해서',
                  'RAM보다 일부러 더 느리게 만들기 위해서',
                  '출력 장치를 대신하기 위해서',
                ],
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
