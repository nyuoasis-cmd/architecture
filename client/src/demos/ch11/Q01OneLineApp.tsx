import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH11 } from '../../data/vibe-pregen-ch11';
import PregenBlock from '../ch13/PregenBlock';

// 11장 1문 시연 — 한 줄 부탁으로 앱이 나오는 장면을 실물로 보여 준다.
// 교훈은 «와 나온다»가 아니라, 나온 것 안에 아무도 안 정한 규칙이 이미 들어차 있다는 것.

export default function Q01OneLineApp(_props: DemoComponentProps) {
  const pregen = VIBE_PREGEN_CH11.ch11_q03_run1;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">보낸 부탁문 — 딱 한 줄</p>
          <p className="mt-1 text-[13px] leading-[1.8] text-[var(--color-text-body)]">
            "우리 반 급식 메뉴 투표 앱 만들어줘."
          </p>
        </div>
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          코드는 한 글자도 쓰지 않았습니다. 한국어 한 줄로 오른쪽 결과가 나왔어요. 여기까지가 AI가 한 일입니다.
          그런데 오른쪽 <b className="font-semibold text-[var(--color-text-primary)]">«투표 규칙»</b>을 읽어 보세요.
          투표 마감 시각, 중복 투표 처리 — 이런 건 부탁문에 없었습니다.{' '}
          <b className="font-semibold text-rose-600">누가 정했을까요?</b>
        </p>
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          이게 이 카테고리 전체의 출발점입니다. 만드는 일은 쉬워졌고, 남은 일은 «정하는 일»입니다.
        </p>
        {pregen ? (
          <p className="text-[10.5px] text-[var(--color-text-faint)]">
            실제 실행 기록 · {pregen.model} · {pregen.generatedAt.slice(0, 10)} — 수업 중에는 이 저장본을 재생만 합니다
          </p>
        ) : null}
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3.5 shadow-sm">
        {pregen ? <PregenBlock text={pregen.text} /> : <p className="text-[12.5px]">재료 없음</p>}
      </div>
    </div>
  );
}
