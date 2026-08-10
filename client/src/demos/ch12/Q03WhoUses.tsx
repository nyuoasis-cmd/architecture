import type { DemoComponentProps } from '../types';
import PairCompare from './PairCompare';

// 12장 3문 시연 — 사용자를 정하고 안 정하고의 실제 차이.
// ① 무지정: 검색 화면·반납 예정일·2권 14일 — 어른 사무용 앱의 평균.
// ② 1학년 지정: 큼직한 그림·누르기 쉬운 버튼·한 권만·선생님 도움 — 화면 «개수»까지 달라졌다.

export default function Q03WhoUses(_props: DemoComponentProps) {
  return (
    <PairCompare
      sharedAsk="학급문고 대출 앱 만들어줘."
      addedInfo="주 사용자: 초등학교 1학년 학생이 혼자 쓴다."
      left={{ pregenKey: 'ch12_q03_unspecified', caption: '사용자를 안 정하고' }}
      right={{ pregenKey: 'ch12_q03_grade1', caption: '«1학년이 혼자 쓴다»를 붙여서' }}
      lookFor={
        <>
          글자 크기 이야기 말고 <b className="font-semibold text-rose-600">규칙</b>을 비교해 보세요. 한 번에 몇 권까지
          빌릴 수 있고, 반납은 며칠인지가 어떻게 달라졌나요?
        </>
      }
      verdict={
        <>
          ①은 <b className="font-semibold">2권 · 14일 · 반납 하루 전 알림</b>, ②는{' '}
          <b className="font-semibold">한 권만 · 일주일 · 잃어버리면 선생님께 말하기</b>입니다. 사용자를 한 줄 적었을
          뿐인데 화면(큼직한 그림, 누르기 쉬운 버튼), 기능(«선생님 도움»이 새로 생김), 규칙(숫자가 통째로 바뀜)이 전부
          따라 움직였어요. 그래서 사용자 한 줄은 <b className="font-semibold">짧지만 앱 전체를 정하는 문장</b>입니다.
        </>
      }
    />
  );
}
