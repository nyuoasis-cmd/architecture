import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 17장 4문 시연 — 작업 기록을 눌러 성적표 세 숫자를 직접 만들어 본다.
// 🔑 «수정 횟수»는 AI 성적이 아니라 부탁문 성적이라는 걸 보이려고, 부탁문이 나쁜 주와 좋은 주를 나란히 뒀다.

type Job = { id: string; label: string; tries: number; ask: string };

const WEEK1: Job[] = [
  { id: 'w1a', label: '대출 버튼 만들기', tries: 3, ask: '"대출 기능 좀 만들어 줘"' },
  { id: 'w1b', label: '반납 기능', tries: 4, ask: '"반납도 되게 해 줘"' },
  { id: 'w1c', label: '현황판', tries: 2, ask: '"누가 빌렸는지 보이게"' },
  { id: 'w1d', label: '검색', tries: 3, ask: '"검색 넣어 줘"' },
];

const WEEK2: Job[] = [
  {
    id: 'w2a',
    label: '연장 기능',
    tries: 1,
    ask: '"연장 버튼을 만들어 줘. 완성 판정: 1회만 되고, 반납일 지난 뒤엔 눌리지 않는다"',
  },
  { id: 'w2b', label: '반납 알림', tries: 1, ask: '"반납 하루 전 알림. 완성 판정: 오늘 빌리면 13일 뒤 알림이 잡힌다"' },
  { id: 'w2c', label: '분실 처리', tries: 2, ask: '"분실 표시 기능. 완성 판정: 표시하면 그 책이 목록에서 대출 불가로 바뀐다"' },
  { id: 'w2d', label: '통계 화면', tries: 2, ask: '"이번 달 대출 수를 보여 줘. 완성 판정: 빌린 만큼 숫자가 오른다"' },
];

function score(jobs: Job[]) {
  const once = jobs.filter((j) => j.tries === 1).length;
  const avgFix = jobs.reduce((sum, j) => sum + (j.tries - 1), 0) / jobs.length;
  return { count: jobs.length, once, avgFix: Math.round(avgFix * 10) / 10 };
}

export default function Q04ReportCard(_props: DemoComponentProps) {
  const [week, setWeek] = useState<1 | 2>(1);
  const [openAsk, setOpenAsk] = useState(false);

  const jobs = week === 1 ? WEEK1 : WEEK2;
  const s = score(jobs);
  const s1 = score(WEEK1);
  const s2 = score(WEEK2);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          두 주 동안 AI에게 맡긴 일의 기록입니다.{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">세 숫자로 성적표</b>를 내 보고, 두 주가 왜
          다른지 찾아보세요.
        </p>
      </div>

      <div className="flex gap-2">
        {([1, 2] as const).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWeek(w)}
            className={`flex-1 rounded-lg border px-3 py-2 text-[12.5px] ${
              week === w
                ? 'border-[var(--color-accent)] bg-white font-medium'
                : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-input)]'
            }`}
          >
            {w}주차 기록
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {jobs.map((j) => (
          <div
            key={j.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5"
          >
            <p className="text-[12.5px] text-[var(--color-text-primary)]">{j.label}</p>
            <span className="shrink-0 text-[12px] tabular-nums text-[var(--color-text-muted)]">
              시도 {j.tries}번 {j.tries === 1 ? '(한 번에 통과)' : `(수정 ${j.tries - 1}번)`}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '맡긴 일', value: `${s.count}건` },
          { label: '한 번에 통과', value: `${s.once}건` },
          { label: '평균 수정', value: `${s.avgFix}번` },
        ].map((box) => (
          <div key={box.label} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-center">
            <p className="text-[11.5px] text-[var(--color-text-muted)]">{box.label}</p>
            <p className="text-[15px] font-semibold tabular-nums text-[var(--color-text-primary)]">{box.value}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpenAsk(!openAsk)}
        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[12.5px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
      >
        {openAsk ? '부탁문 숨기기' : '🔍 두 주의 부탁문을 나란히 보기'}
      </button>

      {openAsk && (
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { title: '1주차 부탁문', jobs: WEEK1, s: s1 },
            { title: '2주차 부탁문', jobs: WEEK2, s: s2 },
          ].map((col) => (
            <div key={col.title} className="space-y-1.5 rounded-xl border border-[var(--color-border)] bg-white px-3 py-3">
              <p className="text-[12px] font-semibold text-[var(--color-text-primary)]">
                {col.title} · 평균 수정 {col.s.avgFix}번
              </p>
              {col.jobs.map((j) => (
                <p key={j.id} className="text-[11.5px] leading-[1.7] text-[var(--color-text-muted)]">
                  · {j.ask}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {openAsk && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            <b className="font-semibold">
              평균 수정 {s1.avgFix}번 → {s2.avgFix}번. 한 번에 통과 {s1.once}건 → {s2.once}건.
            </b>
          </p>
          <p>
            AI는 두 주 다 같은 AI였습니다. 달라진 것은 부탁문이에요 — 2주차에는 전부{' '}
            <b className="font-semibold">«완성 판정»이 붙어 있습니다</b>(15장에서 배운 그것). 목표가 구체적이니 결과도
            구체적으로 맞았고, 맞았는지 바로 확인할 수 있으니 수정이 줄었습니다.
          </p>
          <p>
            그래서 이 성적표는 AI의 성적이 아니라 <b className="font-semibold">내 시키는 기술의 거울</b>입니다. 숫자가
            나빠지면 AI를 바꾸기 전에 내 부탁문부터 봅니다.
          </p>
        </div>
      )}
    </div>
  );
}
