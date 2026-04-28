export type QaStatus = 'done' | 'current' | 'todo';

export type QaStub = {
  id: string;
  chapterId: number;
  order: number;
  title: string;
  summary: string;
  body: string;
  keywords: string[];
  checkpoint: string;
  demoQaId?: string;
  status?: QaStatus;
};

export type ChapterStub = {
  id: number;
  category: string;
  emoji: string;
  title: string;
  qaCount: number;
  firstQaId: string;
};

export const CHAPTERS: ChapterStub[] = [
  { id: 1, category: '컴퓨터 기초', emoji: '🧭', title: '컴퓨터의 큰 그림', qaCount: 7, firstQaId: 'ch01_q01' },
  { id: 2, category: '개발', emoji: '🛠️', title: '소프트웨어 개발', qaCount: 7, firstQaId: 'ch02_q01' },
  { id: 3, category: '개발', emoji: '🧪', title: '테스트와 배포', qaCount: 7, firstQaId: 'ch03_q01' },
  { id: 4, category: '데이터', emoji: '🗂️', title: '데이터 다루기', qaCount: 7, firstQaId: 'ch04_q01' },
  { id: 5, category: '개발', emoji: '🧩', title: '프론트엔드와 백엔드', qaCount: 7, firstQaId: 'ch05_q01' },
  { id: 6, category: '컴퓨터 기초', emoji: '💻', title: '컴퓨터 구조와 운영체제', qaCount: 10, firstQaId: 'ch06_q01' },
  { id: 7, category: '데이터', emoji: '🗄️', title: '데이터베이스', qaCount: 6, firstQaId: 'ch07_q01' },
  { id: 8, category: '네트워크', emoji: '🌐', title: '네트워크와 인터넷', qaCount: 7, firstQaId: 'ch08_q01' },
  { id: 9, category: '아키텍처', emoji: '🏗️', title: '아키텍처와 설계', qaCount: 6, firstQaId: 'ch09_q01' },
  { id: 10, category: 'AI', emoji: '🤖', title: '클라우드와 AI', qaCount: 7, firstQaId: 'ch10_q01' },
];

const QA_COUNTS = CHAPTERS.map((chapter) => chapter.qaCount);

const FULL_QA_ID = 'ch06_q03';

const FULL_QA: QaStub = {
  id: FULL_QA_ID,
  chapterId: 6,
  order: 3,
  title: '프로그램, 프로세스, 프로세서의 차이가 뭔가요?',
  summary: '파일 상태, 실행 상태, 실제 처리 부품의 차이를 한 번에 구분합니다.',
  body: '세 단어는 이름이 비슷하지만 역할이 다릅니다. 프로그램은 디스크에 저장된 실행 파일이고, 프로세스는 그 파일이 메모리에 올라와 실제로 움직이는 상태입니다. 프로세서는 CPU처럼 그 일을 계산하는 부품을 뜻합니다.',
  keywords: ['프로그램', '프로세스', '프로세서', 'CPU'],
  checkpoint: '프로그램·프로세스·프로세서를 한 줄씩 구분해 설명할 수 있다.',
  demoQaId: FULL_QA_ID,
  status: 'current',
};

function createStubQa(chapterId: number, order: number): QaStub {
  const id = `ch${String(chapterId).padStart(2, '0')}_q${String(order).padStart(2, '0')}`;
  const chapter = CHAPTERS.find((item) => item.id === chapterId);
  return {
    id,
    chapterId,
    order,
    title: `${chapter?.title ?? '학습'} Q&A ${order}`,
    summary: `PR #2~#11에서 ${chapter?.title ?? '학습'} 본문이 채워질 예정입니다.`,
    body: '이 문항의 본문과 시연, 퀴즈는 후속 콘텐츠 PR에서 연결됩니다.',
    keywords: ['준비중'],
    checkpoint: '후속 PR에서 체크포인트가 연결됩니다.',
    status: chapterId === 6 && order < 3 ? 'done' : chapterId === 6 && order > 3 && order <= 10 ? 'todo' : 'todo',
  };
}

export const QA_STUBS: QaStub[] = QA_COUNTS.flatMap((count, chapterIndex) => {
  const chapterId = chapterIndex + 1;
  return Array.from({ length: count }, (_, idx) => {
    const order = idx + 1;
    if (chapterId === 6 && order === 3) {
      return FULL_QA;
    }

    const stub = createStubQa(chapterId, order);
    if (chapterId === 6 && order <= 2) {
      return { ...stub, status: 'done' };
    }
    if (chapterId === 6 && order === 4) {
      return { ...stub, status: 'todo' };
    }
    return stub;
  });
});

export function getQaById(qaId: string) {
  return QA_STUBS.find((qa) => qa.id === qaId);
}

export function getChapterById(chapterId: number) {
  return CHAPTERS.find((chapter) => chapter.id === chapterId);
}

export function getQasByChapterId(chapterId: number) {
  return QA_STUBS.filter((qa) => qa.chapterId === chapterId).sort((a, b) => a.order - b.order);
}
