import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH15 } from '../../data/vibe-pregen-ch15';
import PairCompare from '../ch12/PairCompare';

// 15장 5문 시연 — 한 대화가 만들고, 만든 과정을 모르는 다른 대화가 기준 문서만 들고 검사한 실제 기록.
// 🔑 검사한 쪽은 "어긋난 것: 없음"이라고 썼다. 그런데 «보고만으로는 확인할 수 없는 것» 3개를 따로 냈다.
//    그게 이 데모의 진짜 교보재다 — 보고서를 통과했다는 것과 앱이 통과했다는 것은 다른 일이다.

export default function Q05CrossCheck(_props: DemoComponentProps) {
  return (
    <PairCompare
      source={VIBE_PREGEN_CH15}
      sharedAsk="한 장 문서: 우리책방(학급문고 대출 앱) / 기능 4개 / 정책 «한 사람 1권» / 예외 «빌려간 책은 못 빌린다» / 안 만드는 것 «로그인·연체료·예약»"
      addedInfo="너는 이 앱을 만들지 않았다. 기준 문서와 다른 사람의 완성 보고만 보고 검사하라."
      left={{ pregenKey: 'ch15_q05_build', caption: '만든 쪽 — 완성 보고' }}
      right={{ pregenKey: 'ch15_q05_review', caption: '검사한 쪽 — 기준 문서만 들고' }}
      lookFor={
        <>
          검사한 쪽의 첫 칸은 «어긋난 것: 없음»입니다. 그런데{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">그 아래 두 칸</b>을 읽어 보세요. 통과라고 해
          놓고도 무엇을 따로 적었는지가 핵심입니다.
        </>
      }
      verdict={
        <>
          검사한 쪽은 «어긋난 것 없음»이라고 했지만, 동시에{' '}
          <b className="font-semibold">«보고만으로는 확인할 수 없는 것» 3개</b>와{' '}
          <b className="font-semibold">«직접 눌러 볼 것» 3개</b>를 냈습니다. 즉 이 통과는{' '}
          <b className="font-semibold">"보고서에는 문제가 없다"</b>는 뜻이지 <b className="font-semibold">"앱이 규칙을
          지킨다"</b>는 뜻이 아닙니다.
          <br />
          <br />
          만든 쪽에게 "잘 됐지?"라고 물었으면 이 목록은 나오지 않았을 겁니다. 만든 대화는 자기가 무엇을 의도했는지 알고
          있어서, 화면에 실제로 있는 것 대신 <b className="font-semibold">의도를 읽습니다</b>. 내가 쓴 글의 오타가 내 눈에
          안 보이는 것과 같아요.
          <br />
          <br />
          그래서 교차 검사의 산출물은 «합격 도장»이 아니라{' '}
          <b className="font-semibold">«직접 눌러 볼 것» 목록</b>입니다. 그 목록이 다음 5분에 할 일이 됩니다.
        </>
      }
    />
  );
}
