export interface GlossaryEntry {
  term: string;
  aliases?: string[];
  oneline: string;
  category?: 'hw' | 'sw' | 'net' | 'data' | 'cloud';
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'CPU',
    aliases: ['cpu', '중앙처리장치'],
    oneline: '컴퓨터의 두뇌처럼 계산과 명령 실행을 맡는 부품',
    category: 'hw',
  },
  {
    term: 'RAM',
    aliases: ['ram', '램'],
    oneline: '책상 위 작업 공간처럼 잠깐 올려두는 빠른 저장소',
    category: 'hw',
  },
  {
    term: 'SSD',
    aliases: ['ssd', '에스에스디'],
    oneline: '자료를 오래 보관하는 서랍 같은 저장 장치',
    category: 'hw',
  },
  {
    term: 'GPU',
    aliases: ['gpu', '그래픽처리장치'],
    oneline: '그림과 대량 계산을 잘하는 병렬 작업 전용 칩',
    category: 'hw',
  },
  {
    term: 'ALU',
    aliases: ['alu', '산술논리장치'],
    oneline: '덧셈과 비교를 맡는 CPU 안쪽 계산 코너',
    category: 'hw',
  },
  {
    term: '레지스터',
    aliases: ['register', 'Register'],
    oneline: 'CPU 바로 옆에 있는 초미니 메모리 칸',
    category: 'hw',
  },
  {
    term: '캐시',
    aliases: ['cache', 'Cache'],
    oneline: '자주 쓰는 값을 앞자리에 두는 빠른 임시 보관함',
    category: 'hw',
  },
  {
    term: '메모리',
    aliases: ['memory', 'Memory'],
    oneline: '지금 쓰는 데이터를 잠시 들고 있는 작업 공간',
    category: 'hw',
  },
  {
    term: '버스',
    aliases: ['bus', 'Bus'],
    oneline: '부품끼리 데이터가 오가는 공동 도로',
    category: 'hw',
  },
  {
    term: '인터럽트',
    aliases: ['interrupt', 'Interrupt'],
    oneline: '급한 일이 생기면 하던 일을 멈추게 하는 신호',
    category: 'hw',
  },
  {
    term: 'OS',
    aliases: ['os', '운영체제'],
    oneline: '하드웨어와 앱 사이를 정리하는 총관리자',
    category: 'sw',
  },
  {
    term: '커널',
    aliases: ['kernel', 'Kernel'],
    oneline: '운영체제의 핵심 엔진으로 자원 배분을 맡는 부분',
    category: 'sw',
  },
  {
    term: '프로세스',
    aliases: ['process', 'Process'],
    oneline: '실행 중인 프로그램 한 덩어리라고 보면 돼요',
    category: 'sw',
  },
  {
    term: '스레드',
    aliases: ['thread', 'Thread'],
    oneline: '프로세스 안에서 실제로 움직이는 작업 줄기',
    category: 'sw',
  },
  {
    term: '컨테이너',
    aliases: ['container', 'Container'],
    oneline: '앱과 실행 환경을 함께 담아 옮기는 상자',
    category: 'sw',
  },
  {
    term: 'API',
    aliases: ['api', '에이피아이'],
    oneline: '프로그램끼리 요청과 응답을 주고받는 약속 창구',
    category: 'net',
  },
  {
    term: 'REST',
    aliases: ['rest', '레스트'],
    oneline: '자원을 URL로 다루자는 웹 통신 설계 방식',
    category: 'net',
  },
  {
    term: 'HTTP',
    aliases: ['http'],
    oneline: '웹에서 문서를 주고받는 기본 대화 규칙',
    category: 'net',
  },
  {
    term: 'HTTPS',
    aliases: ['https'],
    oneline: 'HTTP에 자물쇠를 더한 암호화 통신 방식',
    category: 'net',
  },
  {
    term: 'DNS',
    aliases: ['dns', '도메인네임시스템'],
    oneline: '사이트 이름을 숫자 주소로 바꿔주는 안내소',
    category: 'net',
  },
  {
    term: 'DB',
    aliases: ['db', '데이터베이스'],
    oneline: '정보를 규칙 있게 쌓아두고 찾는 저장 창고',
    category: 'data',
  },
  {
    term: 'SQL',
    aliases: ['sql', '에스큐엘'],
    oneline: '데이터베이스에 질문하고 수정하는 표준 언어',
    category: 'data',
  },
  {
    term: '인덱스',
    aliases: ['index', 'Index'],
    oneline: '책 맨뒤 찾아보기처럼 검색을 빠르게 돕는 표식',
    category: 'data',
  },
  {
    term: '트랜잭션',
    aliases: ['transaction', 'Transaction'],
    oneline: '여러 작업을 한 묶음으로 처리하는 안전 장치',
    category: 'data',
  },
  {
    term: 'ACID',
    aliases: ['acid'],
    oneline: '트랜잭션이 믿을 만하게 끝나도록 지키는 원칙',
    category: 'data',
  },
  {
    term: 'CDN',
    aliases: ['cdn', '콘텐츠전송네트워크'],
    oneline: '가까운 지점에서 파일을 보내 속도를 높이는 망',
    category: 'cloud',
  },
  {
    term: '도커',
    aliases: ['Docker', 'docker'],
    oneline: '컨테이너를 만들고 배포하기 쉽게 돕는 도구',
    category: 'cloud',
  },
  {
    term: 'IaaS',
    aliases: ['iaas', '서비스형인프라'],
    oneline: '서버와 네트워크를 빌려 쓰는 클라우드 방식',
    category: 'cloud',
  },
  {
    term: 'AI',
    aliases: ['ai', '인공지능'],
    oneline: '데이터를 바탕으로 판단과 예측을 흉내 내는 기술',
    category: 'cloud',
  },
  {
    term: 'LLM',
    aliases: ['llm', '거대언어모델'],
    oneline: '많은 글을 학습해 문장을 이해하고 만드는 모델',
    category: 'cloud',
  },
];
