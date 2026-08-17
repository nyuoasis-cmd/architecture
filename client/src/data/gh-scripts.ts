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

export const GH_SCRIPTS: Record<number, GhScript> = {
  22: CH22_SCRIPT,
};

export function getGhScript(chapterId: number): GhScript | undefined {
  return GH_SCRIPTS[chapterId];
}
