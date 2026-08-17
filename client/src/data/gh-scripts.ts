import type { GhScript } from '../lib/gh-sim';

/**
 * 가짜 GitHub 대본 등록부 — 키는 속 이름표(chapter.id).
 *
 * 🔑 상태 기계는 하나(gh-sim)고, 강마다 다른 것은 **대본뿐**이다:
 *    ch03(배포) · ch20(이슈·완료 조건) · ch22(PR·Merge) · ch23(읽기 전용 졸업 전시).
 * 🚨 여기 등록되는 강은 experience.ts 의 github/composite 배정과 일치해야 한다(ghSimContract).
 *    대본이 아직 없는 github 강의 체험 탭은 견학이 대신 선다(ContentPanel 폴백).
 */

/**
 * 22강(ch22) — 커밋·PR·보안. 비유 = 학급 문집에 글 싣기 (카드·목업 2 확정).
 * 흐름: 쪽지 쓰기(Open) → 리뷰 받기 → 고치기 → Merge(학생 손).
 * 산출물 = 넘김 쪽지 → 계보 'handoff' (23강 묶음의 5번째 칸).
 */
const CH22_SCRIPT: GhScript = {
  scopeId: 'ch22',
  repoName: '우리반-1모둠 / 급식-알리미',
  bridge: {
    name: '학급 문집에 글 싣기',
    stages: ['쪽지 내기 = Open', '선생님 검토 = Review', '문집에 싣기 = Merge'],
  },
  newTerms: ['PR', 'Merge'],
  initial: {
    repo: '우리반-1모둠 / 급식-알리미',
    files: [
      { name: 'menu-alert.js', summary: '아침 8시에 급식 메뉴를 알려 주는 기능 (내가 만든 것)' },
      { name: 'school-menu.txt', summary: '메뉴 데이터 — 이 파일을 지우면 안 돼요' },
    ],
    issues: [],
    pr: null,
    pages: 'off',
    pagesUrl: null,
  },
  steps: [
    {
      id: 'look',
      docent: '내가 만든 기능이 저장소에 파일로 들어 있어요. 이걸 다음 사람에게 «넘기는» 게 오늘 할 일이에요.',
      screen: 'code',
      action: { kind: 'next', label: '다음 — 넘김 쪽지를 쓰러 가요' },
    },
    {
      id: 'open',
      docent:
        '내가 만든 걸 다음 사람에게 넘기는 «쪽지»를 내는 중이에요. GitHub 는 이 쪽지를 Pull request(PR)라고 불러요.',
      bridgeStage: 1,
      screen: 'pr',
      action: {
        kind: 'input',
        label: '쪽지 내기 (Open pull request)',
        artifactKind: 'handoff',
        minChars: 30,
        placeholder: '한 것: 무엇을 만들었는지, 안 열어 봐도 그림이 그려지게\n안 한 것: 일부러 미룬 것\n다음 사람에게: 조심할 것 한 가지',
      },
      apply: (state, input) => ({
        ...state,
        pr: {
          number: 4,
          title: '급식 메뉴 알림 기능 넘김',
          body: input ?? '',
          state: 'open',
          review: null,
          checks: 'pending',
        },
      }),
    },
    {
      id: 'review',
      docent: '선생님(리뷰어)이 쪽지를 검토했어요 — 좋은 점과 고칠 곳을 알려 줘요. 문집도 검토 없이 실리지 않죠.',
      bridgeStage: 2,
      screen: 'pr',
      action: { kind: 'next', label: '리뷰 읽었어요 — 확인 방법을 붙이러 가요' },
      apply: (state) => ({
        ...state,
        pr: state.pr
          ? {
              ...state.pr,
              review: {
                who: 'reviewer-bot',
                body: '「안 한 것」을 적어 준 덕분에 다음 사람이 헛수고를 안 하겠어요. 👍\n한 가지만 — «어떻게 확인했는지»가 없어요. 확인 방법 한 줄을 붙이면 승인할게요.',
                approved: false,
              },
            }
          : state.pr,
      }),
    },
    {
      id: 'fix',
      docent: '리뷰가 짚은 것을 붙여서 쪽지를 고쳐요 — 고쳐서 다시 내는 건 부끄러운 일이 아니라 원래 절차예요.',
      screen: 'pr',
      action: {
        kind: 'input',
        label: '고쳐서 다시 올리기',
        artifactKind: 'handoff',
        minChars: 10,
        placeholder: '확인한 것: 무엇을 어떻게 확인했는지 한 줄 (예: 아침 8시에 알림이 실제로 오는지 직접 봤어요)',
      },
      // 🔑 계보에는 «쪽지 전체 + 확인 줄»을 새 판으로 — 덧붙임만 저장하면 23강이 반쪽을 꺼낸다.
      artifactOf: (state, input) => `${state.pr?.body ?? ''}\n\n확인한 것: ${input}`,
      apply: (state, input) => ({
        ...state,
        pr: state.pr
          ? {
              ...state.pr,
              body: `${state.pr.body}\n\n확인한 것: ${input ?? ''}`,
              review: state.pr.review ? { ...state.pr.review, approved: true } : null,
              checks: 'pass',
            }
          : state.pr,
      }),
    },
    {
      id: 'merge',
      docent: '검사 통과 · 리뷰 승인 — 이제 문집에 싣는 버튼을 내 손으로 눌러요. GitHub 는 이걸 Merge 라고 불러요.',
      bridgeStage: 3,
      screen: 'pr',
      action: { kind: 'merge', label: 'Merge pull request' },
      apply: (state) => ({
        ...state,
        pr: state.pr ? { ...state.pr, state: 'merged' } : state.pr,
      }),
    },
  ],
  outro: '실었어요! 내 쪽지가 기록으로 남았어요 — 진짜 GitHub 에서도 이 흐름 그대로예요. 쪽지는 저장돼서 23강(졸업)에서 다시 만나요.',
};

/**
 * 3강(ch03) — 코드를 세상에 내보내는 길. 비유 = 학교 게시판에 작품 걸기 (카드 3강).
 * 흐름: 저장소의 내 작품 → Pages 켜기 → 배포 중 → 초록불(주소 생김).
 * 산출물 없음(구경·조작 체험). 새 용어 = 저장소·배포 둘.
 */
const CH03_SCRIPT: GhScript = {
  scopeId: 'ch03',
  repoName: '우리반-1모둠 / 소개-페이지',
  bridge: {
    name: '학교 게시판에 작품 걸기',
    stages: ['작품 완성 = 내 컴퓨터', '게시판에 걸기 = 배포', '전교생이 봄 = 주소'],
  },
  newTerms: ['저장소', '배포'],
  initial: {
    repo: '우리반-1모둠 / 소개-페이지',
    files: [
      { name: 'index.html', summary: '내가 만든 우리 반 소개 페이지 (내 작품)' },
      { name: '사진.png', summary: '교실 사진' },
    ],
    issues: [],
    pr: null,
    pages: 'off',
    pagesUrl: null,
  },
  steps: [
    {
      id: 'look',
      docent: '내 작품(파일)이 저장소에 올라와 있어요. 그런데 아직은 나만 봐요 — 교실 서랍 속 작품이에요.',
      bridgeStage: 1,
      screen: 'code',
      action: { kind: 'next', label: '다음 — 게시판에 걸러 가요' },
    },
    {
      id: 'switch',
      docent: 'Pages 스위치를 켜는 순간이에요 — 서랍 속 작품을 게시판에 거는 버튼이에요.',
      bridgeStage: 2,
      screen: 'pages',
      action: { kind: 'next', label: 'Pages 켜기' },
      apply: (state) => ({ ...state, pages: 'building' }),
    },
    {
      id: 'building',
      docent: '배포하는 중 — 저장소의 파일을 누구나 볼 수 있는 웹 페이지로 바꾸고 있어요. 잠깐이면 돼요.',
      screen: 'pages',
      action: { kind: 'next', label: '새로고침' },
      apply: (state) => ({
        ...state,
        pages: 'live',
        pagesUrl: 'https://우리반-1모둠.github.io/소개-페이지/',
      }),
    },
    {
      id: 'live',
      docent: '초록불! 내 페이지 주소가 생겼어요 — 이제 이 주소만 알면 전교생이, 아니 전 세계가 볼 수 있어요.',
      bridgeStage: 3,
      screen: 'pages',
      action: { kind: 'next', label: '주소 확인했어요' },
    },
  ],
  outro:
    '걸었어요! «내 컴퓨터에만 있던 것»이 «주소가 있는 것»이 됐어요 — 이게 배포예요. 견학 카드의 ai.teachermate.co.kr 도 실제로 이렇게 걸린 페이지예요.',
};

/**
 * 16강(ch20) — 기획 · 요구사항·이슈·완료 조건. 비유 = 심부름 쪽지 (카드 16강).
 * 흐름: 나쁜 이슈 구경 → 내 완료 조건 등록 → reviewer-bot 이 빠진 칸 짚음 → 고쳐서 완성.
 * 산출물 = 완료 조건(AC) → 계보 'ac' (23강 묶음의 3번째 칸). 새 용어 = 이슈 하나.
 */
const CH20_SCRIPT: GhScript = {
  scopeId: 'ch20',
  repoName: '우리반-1모둠 / 급식-알리미',
  bridge: {
    name: '심부름 쪽지',
    stages: ['나쁜 쪽지 구경', '내 쪽지 쓰기 = 이슈 등록', '빠진 칸 채우기'],
  },
  newTerms: ['이슈'],
  initial: {
    repo: '우리반-1모둠 / 급식-알리미',
    files: [{ name: 'menu-alert.js', summary: '급식 알림 기능 (만드는 중)' }],
    issues: [
      {
        id: 12,
        title: '급식 알림 만들어 주세요',
        body: '잘 부탁해요!',
        state: 'open',
        comments: [
          { who: 'reviewer-bot', body: '이 쪽지로는 시작을 못 해요 — 무엇을, 언제, 어떻게 되면 성공인지가 없어요. «라면 사 와»만 적힌 심부름 쪽지 같아요.' },
        ],
      },
    ],
    pr: null,
    pages: 'off',
    pagesUrl: null,
  },
  steps: [
    {
      id: 'bad',
      docent: '먼저 «나쁜 쪽지»를 구경해요 — 12번 이슈는 무엇이 빠져서 시작을 못 할까요?',
      bridgeStage: 1,
      screen: 'issues',
      action: { kind: 'next', label: '다음 — 내 쪽지를 쓰러 가요' },
    },
    {
      id: 'write',
      docent: '이번엔 내 차례 — 완료 조건을 이슈 양식에 채워요. 무엇을 · 되면 성공 · 안 하는 것, 세 칸이에요.',
      bridgeStage: 2,
      screen: 'issues',
      action: {
        kind: 'input',
        label: '이슈 등록하기',
        artifactKind: 'ac',
        minChars: 30,
        placeholder: '무엇을: 급식 알림 기능\n되면 성공: (눈으로 확인할 수 있는 장면으로)\n안 하는 것: (이번엔 일부러 안 할 것)',
      },
      apply: (state, input) => ({
        ...state,
        issues: [
          ...state.issues,
          { id: 13, title: '급식 알림 — 완료 조건', body: input ?? '', state: 'open', comments: [] },
        ],
      }),
    },
    {
      id: 'review',
      docent: 'reviewer-bot 이 빠진 칸을 짚었어요 — 쪽지는 부끄러운 게 아니라 고치라고 있는 거예요.',
      screen: 'issues',
      action: { kind: 'next', label: '리뷰 읽었어요 — 고치러 가요' },
      apply: (state) => ({
        ...state,
        issues: state.issues.map((issue) =>
          issue.id === 13
            ? {
                ...issue,
                comments: [
                  {
                    who: 'reviewer-bot',
                    body: '「안 하는 것」을 적은 건 아주 좋아요 👍\n한 가지만 — «되면 성공»이 눈으로 확인할 수 있는 장면인가요? 숫자나 장면이 하나 들어가면 판정이 사람마다 안 갈려요.',
                  },
                ],
              }
            : issue,
        ),
      }),
    },
    {
      id: 'fix',
      docent: '짚힌 «되면 성공» 칸을 장면이 보이게 고쳐요 — 이 한 칸이 «다 됐어요»의 기준이 돼요.',
      bridgeStage: 3,
      screen: 'issues',
      action: {
        kind: 'input',
        label: '고쳐서 다시 등록',
        artifactKind: 'ac',
        minChars: 15,
        placeholder: '되면 성공(고침): 아침 8시에 알림이 오고, 오늘 메뉴 3가지가 보이면 성공',
      },
      // 🔑 계보에는 «완료 조건 전체 + 고침»을 새 판으로.
      artifactOf: (state, input) => {
        const mine = state.issues.find((issue) => issue.id === 13);
        return `${mine?.body ?? ''}\n\n${input}`;
      },
      apply: (state, input) => ({
        ...state,
        issues: state.issues.map((issue) =>
          issue.id === 13 ? { ...issue, body: `${issue.body}\n\n${input ?? ''}` } : issue,
        ),
      }),
    },
  ],
  outro:
    '등록했어요! 이 완료 조건은 저장돼서 19강(약속 문장 — 이걸 기계가 확인할 수 있게 바꾸는 법)과 23강(졸업)에서 다시 만나요.',
};

export const GH_SCRIPTS: Record<number, GhScript> = {
  3: CH03_SCRIPT,
  20: CH20_SCRIPT,
  22: CH22_SCRIPT,
};

export function getGhScript(chapterId: number): GhScript | undefined {
  return GH_SCRIPTS[chapterId];
}
