import { Hero, Icons, LogBox, PairFlow, StateChips, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  items: string[];
  focus: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  pr: {
    title: '처음 올리기 — PR 제출',
    summary: '코드 리뷰는 변경 내용을 PR로 묶어 공유하는 순간부터 시작합니다. 무엇을 왜 바꿨는지가 먼저 보여야 합니다.',
    active: 0,
    items: ['변경 설명 작성', '관련 이슈 연결', '리뷰어 지정'],
    focus: '리뷰 품질은 첫 설명의 명확성에 크게 좌우됩니다.',
    logs: [
      ['18:10:01', 'feature 브랜치 푸시'],
      ['18:10:02', 'PR 본문 작성 완료'],
      ['18:10:03', '리뷰 요청 전송'],
    ],
  },
  comment: {
    title: '의견 남기기 — 코멘트',
    summary: '리뷰어는 코드의 위험, 의도, 대안을 코멘트로 남기며 작성자와 같은 문맥 위에서 대화를 시작합니다.',
    active: 1,
    items: ['버그 지적', '질문 남기기', '대안 제안'],
    focus: '좋은 코멘트는 막연한 취향이 아니라 동작과 근거를 함께 남깁니다.',
    logs: [
      ['18:11:01', '라인 단위 코멘트 등록'],
      ['18:11:02', '동작 리스크 설명 추가'],
      ['18:11:03', '수정 방향 합의'],
    ],
  },
  revise: {
    title: '반영하기 — 수정',
    summary: '작성자는 코멘트를 반영해 코드를 고치고, 왜 그렇게 바꿨는지 다시 연결해 리뷰 대화를 이어 갑니다.',
    active: 2,
    items: ['수정 커밋 추가', '답글로 맥락 공유', '테스트 재실행'],
    focus: '수정 자체보다 “이 코멘트가 어떻게 해결됐는지”를 분명히 남기는 것이 중요합니다.',
    logs: [
      ['18:12:01', '리뷰 반영 커밋 생성'],
      ['18:12:02', '테스트 재실행 성공'],
      ['18:12:03', '코멘트별 답변 정리'],
    ],
  },
  merge: {
    title: '승인 후 합치기 — 머지',
    summary: '모든 우려가 해소되면 승인을 받고 메인 흐름으로 합칩니다. 리뷰는 배포 전 마지막 품질 게이트입니다.',
    active: 3,
    items: ['승인 확인', '최신 main 동기화', '머지 완료'],
    focus: '머지는 끝이 아니라, 검토된 변경을 팀의 기준 안으로 편입시키는 단계입니다.',
    logs: [
      ['18:13:01', '리뷰 승인 수신'],
      ['18:13:02', '충돌 없는지 최종 확인'],
      ['18:13:03', 'merge 완료'],
    ],
  },
};

const TONE = getTone(3);

const METAPHOR = [
  { icon: <Icons.SubmitIcon />, label: '제출', sub: '사용' },
  { icon: <Icons.CommentIcon />, label: '코멘트', sub: '사용' },
  { icon: <Icons.EditIcon />, label: '수정', sub: '사용' },
  { icon: <Icons.ApproveIcon />, label: '승인', sub: '사용' },
];

const IT = [
  { icon: <Icons.PullRequestIcon />, label: 'PR', sub: '사용' },
  { icon: <Icons.CodeCommentIcon />, label: '코멘트', sub: '사용' },
  { icon: <Icons.CodeEditIcon />, label: '수정', sub: '사용' },
  { icon: <Icons.MergeIcon />, label: '머지', sub: '사용' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q07CodeReview({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.pr;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="리뷰와 승인" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairFlow
        metaphorTitle="결재 흐름"
        itTitle="코드 리뷰 흐름"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips
        title="현재 단계의 핵심 행동"
        items={scene.items.map((item, idx) => ({
          label: item,
          active: idx === 0,
          color: idx === 0 ? 'var(--demo-chip-hot-orange-fg)' : undefined,
        }))}
        tone={TONE}
        description={scene.focus}
      />

      <LogBox logs={scene.logs} variant="blue" title="리뷰 타임라인" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
