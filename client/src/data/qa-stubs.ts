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
  { id: 1, category: '컴퓨터 기초', emoji: '🧭', title: '컴퓨터의 큰 그림', qaCount: 4, firstQaId: 'ch01_q01' },
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
const CHAPTER_ONE_QAS: QaStub[] = [
  {
    id: 'ch01_q01',
    chapterId: 1,
    order: 1,
    title: '컴퓨터는 결국 무슨 일을 하나요?',
    summary: '입력과 저장, 처리와 출력을 한 흐름으로 묶어 컴퓨터의 기본 동작을 잡습니다.',
    body:
      '컴퓨터를 거창하게 볼 필요는 없습니다. 바깥에서 어떤 정보를 받아들이고, 필요한 동안 붙잡아 두고, 계산하거나 정리한 뒤, 다시 사람이 이해할 수 있는 형태로 내보내는 기계라고 보면 큰 그림이 잡힙니다. 키보드로 글자를 치고 화면에 결과가 뜨는 일도 이 흐름 안에 들어갑니다.\n\n이 흐름을 자주 입력, 처리, 출력이라고 부릅니다. 입력은 마우스 클릭이나 센서 값처럼 바깥에서 들어오는 신호이고, 처리는 CPU가 규칙에 따라 계산하는 과정입니다. 출력은 화면, 스피커, 프린터처럼 결과를 다시 밖으로 보여 주는 단계입니다.\n\n중간에 잠깐 붙잡아 두는 공간도 중요합니다. 폰 노이만 구조에서는 CPU와 메모리, 입출력 장치가 역할을 나눠 맡습니다. 메모리는 지금 처리할 재료를 올려 두는 작업대 역할을 하고, CPU는 그 작업대 위에서 순서를 따라 일을 진행합니다.\n\n라면을 끓이는 장면으로 비유하면 이해가 쉽습니다. 재료를 꺼내는 일은 입력이고, 냄비에 물과 면을 올려 두는 자리는 메모리이며, 불이 실제로 익히는 과정이 처리입니다. 마지막에 그릇에 담겨 먹을 수 있는 상태가 되면 출력이 된 셈입니다.\n\n겉으로는 사진, 소리, 문장처럼 복잡해 보여도 안쪽에서는 모두 0과 1의 조합으로 바뀝니다. 전기가 흐르느냐 끊기느냐 같은 단순한 차이를 아주 빠르게 이어 붙여서, 컴퓨터는 복잡한 일을 해내는 것처럼 보이게 만드는 것입니다.',
    keywords: ['입력', '처리', '출력', '폰 노이만'],
    checkpoint: '컴퓨터의 동작을 입력·처리·출력 사이클로 한 줄로 설명할 수 있다.',
    demoQaId: 'ch01_q01',
  },
  {
    id: 'ch01_q02',
    chapterId: 1,
    order: 2,
    title: '하드웨어와 소프트웨어의 차이는?',
    summary: '손으로 만질 수 있는 부품과 그 부품에 일을 시키는 명령을 분리해 이해합니다.',
    body:
      '컴퓨터를 이루는 요소를 크게 둘로 나누면 하드웨어와 소프트웨어가 됩니다. 하드웨어는 손으로 만질 수 있는 실제 부품이고, 소프트웨어는 그 부품들이 어떤 순서로 움직일지 적어 둔 명령의 묶음입니다. 둘은 항상 함께 움직이지만, 같은 것이 아닙니다.\n\n하드웨어에는 CPU, RAM, SSD, 모니터, 키보드처럼 물리적으로 존재하는 장치가 들어갑니다. 전기를 흘리고 신호를 주고받는 실체가 있어야 화면이 켜지고 파일이 저장됩니다. 그래서 하드웨어는 컴퓨터가 무엇을 할 수 있는지의 범위를 정하는 바닥 설비에 가깝습니다.\n\n소프트웨어는 그 설비 위에서 어떤 일을 시킬지 결정합니다. 운영체제는 부품을 전반적으로 관리하고, 메신저 앱은 대화를 보여 주고, 게임은 그래픽과 규칙을 실행합니다. 같은 노트북이라도 어떤 소프트웨어를 올리느냐에 따라 전혀 다른 도구처럼 보이는 이유가 여기에 있습니다.\n\n무대와 대본의 관계로 생각해 보면 구분이 쉽습니다. 무대 조명, 스피커, 의상 창고처럼 실제로 설치된 것이 하드웨어라면, 배우가 언제 등장하고 어떤 대사를 할지 적어 둔 대본이 소프트웨어입니다. 무대만 있어도 공연은 시작되지 않고, 대본만 있어도 관객 앞에서 장면을 만들 수 없습니다.\n\n결국 하드웨어는 할 수 있는 힘을 제공하고, 소프트웨어는 그 힘을 어디에 쓸지 지시합니다. 컴퓨터를 배울 때 둘을 헷갈리지 않으면 성능 문제와 기능 문제를 따로 바라볼 수 있어서 훨씬 수월해집니다.',
    keywords: ['하드웨어', '소프트웨어', '물리', '명령'],
    checkpoint: '하드웨어와 소프트웨어를 무대와 대본 비유로 구분할 수 있다.',
    demoQaId: 'ch01_q02',
  },
  {
    id: 'ch01_q03',
    chapterId: 1,
    order: 3,
    title: '운영체제는 무슨 역할을 하나요?',
    summary: 'OS가 사용자와 부품 사이에서 자원을 배분하고 규칙을 세우는 이유를 설명합니다.',
    body:
      '운영체제는 컴퓨터를 켜자마자 가장 먼저 전체 질서를 잡는 소프트웨어입니다. 사람은 아이콘이나 버튼을 보고 명령을 내리고, 하드웨어는 전기 신호와 주소만 이해하는데, 운영체제가 그 둘 사이에서 말을 맞춰 줍니다. 그래서 운영체제는 통역자이면서 현장 감독에 가깝습니다.\n\n가장 중요한 일 중 하나는 자원 분배입니다. 여러 앱이 동시에 열려 있을 때 누가 CPU 시간을 얼마나 쓰고, 누가 메모리를 얼마나 가져갈지 조정하지 않으면 서로 부딪히게 됩니다. 운영체제는 보이지 않는 교통정리처럼 이 순서를 계속 나눠 줍니다.\n\n파일 관리도 운영체제의 핵심 역할입니다. 사진을 어디에 저장할지, 이미 만든 문서를 어떤 이름으로 찾을지, 삭제한 파일을 어떻게 처리할지 같은 규칙을 운영체제가 제공합니다. 사용자는 폴더와 파일만 보지만, 뒤에서는 저장 장치를 일정한 방식으로 정리하고 있습니다.\n\n사용자 인터페이스와 보안 역시 운영체제가 맡습니다. 창을 띄우고 닫는 방식, 비밀번호 확인, 앱별 권한 제한 같은 공통 규칙이 있어야 컴퓨터를 안정적으로 쓸 수 있습니다. Windows, macOS, Linux, Android, iOS가 모두 운영체제인 이유도 이런 공통 질서를 제공하기 때문입니다.\n\n식당 매니저를 떠올리면 감이 옵니다. 손님을 자리로 안내하고, 주문을 주방에 나눠 보내고, 계산 순서를 맞추는 사람이 없으면 식당은 금방 혼란스러워집니다. 운영체제도 앱과 하드웨어 사이에서 같은 식으로 질서를 유지합니다.',
    keywords: ['운영체제', '자원', '관리', '인터페이스'],
    checkpoint: 'OS의 핵심 역할 3가지(자원 분배·파일 관리·UI)를 들 수 있다.',
    demoQaId: 'ch01_q03',
  },
  {
    id: 'ch01_q04',
    chapterId: 1,
    order: 4,
    title: '컴퓨터 안에서 데이터는 어떻게 흐르나요?',
    summary: '저장소, 메모리, CPU, 캐시가 어떤 순서로 협력하는지 흐름 중심으로 설명합니다.',
    body:
      '컴퓨터 안의 데이터는 한 자리에 가만히 있지 않습니다. 보통 저장소에 오래 보관돼 있다가, 실제로 일을 시작할 때 메모리로 올라오고, CPU가 그 값을 읽어 계산한 뒤 결과를 다시 메모리나 저장소, 화면 같은 출력 장치로 보냅니다. 이 이동 순서를 이해하면 성능 이야기도 훨씬 쉬워집니다.\n\nSSD나 HDD 같은 저장소는 용량이 크고 전원을 꺼도 내용이 남습니다. 대신 CPU가 바로 꺼내 쓰기에는 상대적으로 느립니다. 그래서 지금 당장 사용할 데이터만 RAM으로 옮겨 놓고, CPU는 그 RAM을 중심으로 빠르게 계산합니다.\n\nRAM은 작업 중인 재료를 넓게 펼쳐 두는 책상과 비슷합니다. 책장에 모든 자료를 다시 가지러 가는 대신, 오늘 볼 자료를 책상 위에 올려 두면 손이 덜 가는 것과 같습니다. 하지만 전원을 끄면 책상 위 메모가 치워지듯, RAM의 내용은 사라집니다.\n\nCPU는 그 책상을 보며 실제로 계산하는 손이나 펜 역할을 합니다. 더 자주 쓰는 값은 CPU에 더 가까운 캐시에 잠깐 보관되는데, 이것은 책상 위 포스트잇처럼 가장 바로 손이 닿는 자리에 두는 메모라고 볼 수 있습니다. 자주 쓰는 정보일수록 가까이 둬야 전체 속도가 빨라집니다.\n\n정리하면 데이터는 저장소에서 출발해 RAM으로 옮겨지고, CPU와 캐시를 거치며 처리된 뒤 다시 저장되거나 출력됩니다. 컴퓨터 성능을 높인다는 말은 결국 이 이동 거리를 줄이거나, 더 자주 쓰는 데이터를 더 가까운 곳에 두는 방법을 찾는 일과 이어집니다.',
    keywords: ['RAM', '저장소', '캐시', '데이터 흐름'],
    checkpoint: '데이터가 SSD→RAM→CPU 순서로 이동하는 이유를 비유로 설명할 수 있다.',
    demoQaId: 'ch01_q04',
  },
];

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
    if (chapterId === 1) {
      return CHAPTER_ONE_QAS[order - 1]!;
    }
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
