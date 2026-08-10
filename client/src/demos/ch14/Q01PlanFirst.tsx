import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH14 } from '../../data/vibe-pregen-ch14';
import PairCompare from '../ch12/PairCompare';

// 14장 1문 시연 — 같은 부탁문에 «아직 만들지 마, 계획부터» 한 줄만 더 붙인 두 번의 실제 실행.
// 🔑 통짜 쪽에는 아무도 시키지 않은 기능(별점·인기 순위·선생님 승인)이 섞여 들어왔고,
//    그 상태로 «다 만들어진» 뒤에는 빼자고 말할 지점이 없다.

export default function Q01PlanFirst(_props: DemoComponentProps) {
  return (
    <PairCompare
      source={VIBE_PREGEN_CH14}
      sharedAsk="학급문고 대출 앱 만들어줘. 문제: 학급문고 책이 누구한테 갔는지 몰라서 자꾸 사라진다. 주 사용자: 초등 5학년 학생."
      addedInfo="아직 만들지 말고, 어떻게 만들지 계획을 먼저 보여줘."
      left={{ pregenKey: 'ch14_q01_bulk', caption: '통짜로 시켰을 때 — «만든 결과» 보고' }}
      right={{ pregenKey: 'ch14_q01_staged', caption: '계획부터 시켰을 때 — 화면·데이터·작업 순서' }}
      lookFor={
        <>
          두 답에 <b className="font-semibold text-[var(--color-text-primary)]">각각 무엇이 들어 있는지</b>를 보세요.
          특히 ① 쪽 «들어간 기능» 목록에서, 부탁문에 한 번도 나오지 않은 것이 몇 개인지 세어 보면 됩니다.
        </>
      }
      verdict={
        <>
          ① 통짜 쪽에는 아무도 시키지 않은 기능이 최소 세 개 섞여 있습니다 —{' '}
          <b className="font-semibold">별점·인기 책 순위·선생님 승인</b>. AI가 잘못한 게 아니라 친절이 지나친 것이고,
          문제는 그게 <b className="font-semibold">«이미 만들어진 것»으로 보고됐다</b>는 점입니다. 빼려면 만든 걸 되돌려야
          해요.
          <br />
          <br />② 계획 쪽에는 화면 목록·데이터 표·번호 붙은 작업 순서가 나왔습니다. 여기서 «별점은 이번엔 안 해»라고
          말하는 데 드는 비용은 글 한 줄입니다. 순서를 바꾼 게 아니라, 되돌리기가 싼 지점을 하나 만든 것입니다.
        </>
      }
    />
  );
}
