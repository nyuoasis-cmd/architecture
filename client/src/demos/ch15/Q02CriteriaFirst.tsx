import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH15 } from '../../data/vibe-pregen-ch15';
import PairCompare from '../ch12/PairCompare';

// 15장 2문 시연 — 같은 기능을 «완성 판정» 문장 없이 / 있게 시킨 두 번의 실제 실행.
// 🔑 달라진 것은 «만든 것»이 아니라 «이렇게 확인하세요» 칸이다.
//    판정 문장이 없으면 확인 항목이 전부 되는 장면이고, 붙이면 거절되는 장면이 들어온다.

export default function Q02CriteriaFirst(_props: DemoComponentProps) {
  return (
    <PairCompare
      source={VIBE_PREGEN_CH15}
      sharedAsk="학급문고 대출 앱에 «책 빌리기» 버튼을 만들어 줘."
      addedInfo="완성 판정: (1) 빌리면 내 현황에 나타난다 (2) 두 권째는 거절되고 이유가 뜬다 (3) 남이 빌려간 책은 눌리지 않는다."
      left={{ pregenKey: 'ch15_q02_nocriteria', caption: '판정 문장 없이 시켰을 때' }}
      right={{ pregenKey: 'ch15_q02_withcriteria', caption: '판정 문장을 붙여 시켰을 때' }}
      lookFor={
        <>
          «만든 것» 칸이 아니라 <b className="font-semibold text-[var(--color-text-primary)]">«이렇게 확인하세요» 칸</b>을
          비교하세요. 두 쪽의 확인 항목 중 <b className="font-semibold text-[var(--color-text-primary)]">«안 되어야 하는
          장면»</b>이 몇 개씩인지 세어 보면 됩니다.
        </>
      }
      verdict={
        <>
          ① 판정 문장이 없는 쪽의 확인 항목은 <b className="font-semibold">전부 되는 장면</b>입니다 — 빌려 보고, 성공
          메시지 보고, 목록에 뜨는지 보기. 규칙이 하나도 안 들어갔어도 이 셋은 전부 통과합니다.
          <br />
          <br />② 판정 문장을 붙인 쪽에는 <b className="font-semibold">거절되는 장면·눌리지 않는 장면</b>이 확인 항목으로
          들어왔습니다. 부탁문 한 칸을 채웠을 뿐인데 검사의 질이 달라진 겁니다.
          <br />
          <br />
          그래서 «완성 판정»은 AI에게 주는 지시이자 <b className="font-semibold">나중에 내가 쓸 검사 목록</b>입니다. 만든
          뒤에 검사를 생각하면, 이미 만들어진 모습에 눈이 끌려 ① 쪽 목록이 나옵니다.
        </>
      }
    />
  );
}
