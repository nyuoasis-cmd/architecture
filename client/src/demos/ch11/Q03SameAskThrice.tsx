import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH11 } from '../../data/vibe-pregen-ch11';
import PregenBlock from '../ch13/PregenBlock';

// 11장 3문 시연 — 완전히 같은 부탁문을 3번 보낸 실제 기록.
// 세 결과의 «투표 마감»이 전부 다르다: 오전 10시 / 오전 11시 30분 / 수요일 자정.
// 교훈: 한 번 잘 나온 것은 표본이지 비율이 아니다.

const RUNS = ['ch11_q03_run1', 'ch11_q03_run2', 'ch11_q03_run3'] as const;

export default function Q03SameAskThrice(_props: DemoComponentProps) {
  const entries = RUNS.map((key) => VIBE_PREGEN_CH11[key]).filter(Boolean);
  const stamp = entries[0];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">
          세 번 모두 똑같이 보낸 부탁문
        </p>
        <p className="mt-1 text-[13px] leading-[1.8] text-[var(--color-text-body)]">
          "우리 반 급식 메뉴 투표 앱 만들어줘."
        </p>
        <p className="mt-2 text-[12px] leading-[1.75] text-[var(--color-text-muted)]">
          글자 하나 바꾸지 않고 세 번 보냈습니다. 아래 세 결과의{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">«투표 규칙»</b>만 비교해 보세요 — 특히{' '}
          <b className="font-semibold text-rose-600">투표가 언제 끝나는지</b>를 찾아보면 됩니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {entries.map((entry, idx) => (
          <div
            key={RUNS[idx]}
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3.5 shadow-sm"
          >
            <p className="mb-2 text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">
              {idx + 1}번째 실행
            </p>
            <PregenBlock text={entry.text} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-amber-900">
          찾았나요? 마감이 <b className="font-semibold">오전 10시 · 오전 11시 30분 · 수요일 자정</b>으로 세 번 다
          다릅니다. 부탁한 사람은 마감을 말한 적이 없는데, 세 번 다 다른 값이 들어갔어요. 그래서 "내 부탁문으로 잘
          나왔다"는 <b className="font-semibold">이번 한 번</b>에 대한 이야기일 뿐입니다.
        </p>
      </div>

      {stamp ? (
        <p className="text-[10.5px] text-[var(--color-text-faint)]">
          실제 실행 기록 3회 · {stamp.model} · {stamp.generatedAt.slice(0, 10)} — 수업 중에는 저장본을 재생만 합니다
        </p>
      ) : null}
    </div>
  );
}
