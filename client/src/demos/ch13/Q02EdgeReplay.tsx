import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH13 } from '../../data/vibe-pregen-ch13';
import PregenBlock from './PregenBlock';

// 13장 2문 시연 — 각본 없는 부탁문으로 만든 앱에 세 가지 어긋난 입력을 실제로 넣어 본 기록.
// 반응이 «그럴듯해 보인다»는 것 자체가 교훈: 전부 AI가 정한 각본이고, 검토한 사람은 없다.

export default function Q02EdgeReplay(_props: DemoComponentProps) {
  const pregen = VIBE_PREGEN_CH13.ch13_q02_noplan;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">부탁문 (예외 각본 없음)</p>
          <p className="mt-1 text-[13px] leading-[1.8] text-[var(--color-text-body)]">
            "우리 반 도서 대출 앱 만들어줘. 학생이 책을 빌리고 반납할 수 있으면 돼."
          </p>
        </div>
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          이 앱에 어긋난 입력 세 가지를 실제로 넣어 봤습니다(미리 실행해 저장). 오른쪽 반응을 읽어 보세요 — 꽤
          그럴듯하죠? 그런데 <b className="font-semibold text-rose-600">세 반응 모두 부탁문에 없습니다.</b> 전부 AI가
          그 자리에서 정한 각본입니다. 우리 교실에 맞는 반응인지는 아무도 검토한 적이 없어요. 예를 들어 ③에서 «첫
          번째 대출만 완료»가 아니라 «선생님에게 알림»이 맞는 교실도 있습니다.
        </p>
        {pregen ? (
          <p className="text-[10.5px] text-[var(--color-text-faint)]">
            실제 실행 기록 · {pregen.model} · {pregen.generatedAt.slice(0, 10)}
          </p>
        ) : null}
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3.5 shadow-sm">
        {pregen ? <PregenBlock text={pregen.text} /> : <p className="text-[12.5px]">재료 없음</p>}
      </div>
    </div>
  );
}
