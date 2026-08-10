import type { DemoComponentProps } from '../types';
import PairCompare from './PairCompare';

// 12장 2문 시연 — 문제 한 문장이 있고 없고의 실제 차이.
// ① 없음: 도서관 «일반 규칙»(2권·2주·연체·손상)이 들어왔다.
// ② 있음: «누가 빌렸는지 보는 화면»과 «이름 입력»이 생겼다 — 사라지는 책이라는 문제를 직접 겨눈다.

export default function Q02ProblemSentence(_props: DemoComponentProps) {
  return (
    <PairCompare
      sharedAsk="학급문고 대출 앱 만들어줘."
      addedInfo="문제: 학급문고 책이 누구한테 갔는지 몰라서 자꾸 사라진다."
      left={{ pregenKey: 'ch12_q02_without', caption: '문제 문장 없이' }}
      right={{ pregenKey: 'ch12_q02_with', caption: '문제 문장을 붙여서' }}
      lookFor={
        <>
          두 결과의 <b className="font-semibold text-[var(--color-text-primary)]">화면 요소</b>를 비교해 보세요. 특히{' '}
          <b className="font-semibold text-rose-600">«누가 빌렸는지» 알 수 있는 화면</b>이 어느 쪽에 있는지 찾아보면
          됩니다.
        </>
      }
      verdict={
        <>
          ①에는 «대기 예약», «손상된 책 대출 제한» 같은 <b className="font-semibold">도서관 일반 규칙</b>이 들어왔습니다
          — 그럴듯하지만 우리 문제와는 상관없는 기능들이죠. ②에는 <b className="font-semibold">«누가 빌렸는지 보는
          화면»</b>과 <b className="font-semibold">«빌릴 때 이름 입력»</b>이 생겼고, 오래 안 돌아온 책을 빨간색으로
          표시하는 규칙까지 붙었습니다. 부탁한 사람은 기능을 하나도 지시하지 않았어요. 문제 한 문장을 적었을 뿐인데 AI의
          선택이 전부 문제 쪽으로 기울었습니다.
        </>
      }
    />
  );
}
