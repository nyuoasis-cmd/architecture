import { useState } from 'react';
import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH17 } from '../../data/vibe-pregen-ch17';
import PregenBlock from '../ch13/PregenBlock';

// 17장 5문 시연 — 실제로 돌아온 답 3개를 출구 검사에 통과시켜 본다.
// 🔑 검사 목록을 학생이 켜고 끈다. «잘림»만 켜면 겉보기 멀쩡한 답(앱에 없는 «연체료»를 덧붙인 답)이 그대로 나간다.
//    검사의 값은 있고 없고가 아니라 «무엇을 보는가»에서 갈린다는 걸 손으로 확인하게 하는 게 요점이다.

type Answer = {
  key: string;
  label: string;
  /** 이 답이 걸리는 검사 항목 (없으면 정상) */
  fails: string[];
  note: string;
};

const ANSWERS: Answer[] = [
  {
    key: 'ch17_q05_ok',
    label: '① 겉보기 멀쩡한 답',
    fails: ['norule'],
    note: '잘리지도, 거절되지도 않았습니다. 그런데 앱이 알려준 규칙은 «2주»뿐인데 답에는 «연체료가 부과될 수 있으니»가 붙어 있어요. 우리 앱에는 연체료가 없습니다.',
  },
  {
    key: 'ch17_q05_truncated',
    label: '② 끊긴 답',
    fails: ['cut'],
    note: '«그때 학급문고에 방문하여»에서 문장이 끝났습니다. 오류가 아니라서 앱은 정상으로 봅니다.',
  },
  {
    key: 'ch17_q05_invented',
    label: '③ 앱에 없는 것을 물었을 때',
    fails: [],
    note: '이번 실행에서는 «접근할 수 없습니다»라고 거절했습니다. 검사에 걸릴 것이 없네요 — 다만 이건 1회 표본입니다.',
  },
];

const CHECKS = [
  { key: 'cut', label: '문장이 끊기지 않았는가' },
  { key: 'norule', label: '앱에 없는 규칙을 말하지 않았는가' },
];

export default function Q05ExitGate(_props: DemoComponentProps) {
  const [on, setOn] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const toggle = (k: string) => {
    setOn((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
    setSent(false);
  };

  const blocked = (a: Answer) => a.fails.some((f) => on.includes(f));
  const leaked = ANSWERS.filter((a) => a.fails.length > 0 && !blocked(a));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          학급문고 도우미에게 실제로 물어서 돌아온 답 3개입니다. 학생 화면으로 내보내기 전에{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">출구 검사에 무엇을 넣을지</b> 골라 보세요.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {CHECKS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => toggle(c.key)}
            className={`flex-1 rounded-lg border px-3.5 py-2.5 text-left text-[12.5px] ${
              on.includes(c.key)
                ? 'border-[var(--color-accent)] bg-white font-medium'
                : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-input)]'
            }`}
          >
            {on.includes(c.key) ? '🛡️ ' : '⬜ '}
            {c.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setSent(true)}
        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
      >
        📤 이 검사로 세 답 내보내기 {on.length === 0 && '(검사 없이)'}
      </button>

      {sent && (
        <div className="space-y-2">
          {ANSWERS.map((a) => {
            const entry = VIBE_PREGEN_CH17[a.key];
            const stop = blocked(a);
            return (
              <div
                key={a.key}
                className={`rounded-xl border px-3.5 py-3 ${
                  stop
                    ? 'border-emerald-300 bg-emerald-50'
                    : a.fails.length > 0
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-[var(--color-border)] bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">{a.label}</p>
                  <span className={`text-[12px] font-semibold ${stop ? 'text-emerald-700' : 'text-[var(--color-text-muted)]'}`}>
                    {stop ? '🛑 걸림 — 학생에게 안 나감' : '➡️ 통과 — 학생 화면에 뜸'}
                  </span>
                </div>
                <div className="mt-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5">
                  <PregenBlock text={entry.text} />
                </div>
                <p className="mt-1.5 text-[12px] leading-[1.7] text-[var(--color-text-muted)]">{a.note}</p>
              </div>
            );
          })}

          <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
            {leaked.length === 0 ? (
              <p>
                <b className="font-semibold">이상한 답 2개가 모두 문 앞에서 걸렸습니다.</b> 검사 항목 두 줄이 한 일이에요.
                목록이 짧아도 문이 있는 것과 없는 것의 차이는 이만큼 큽니다.
              </p>
            ) : (
              <p>
                <b className="font-semibold">{leaked.length}개가 그대로 나갔습니다.</b>{' '}
                {leaked.map((l) => l.label).join(', ')} — 지금 켠 검사로는 이 답을 볼 수 없어요.
              </p>
            )}
            <p>
              특히 ①이 이 시연의 핵심입니다. 잘리지도 않았고 거절되지도 않았는데,{' '}
              <b className="font-semibold">앱에 없는 «연체료»를 덧붙였습니다.</b> «잘렸는가»만 보는 검사는 이걸 절대 못
              잡아요. 검사의 값은 있고 없고가 아니라 <b className="font-semibold">무엇을 보는가</b>에서 갈립니다.
            </p>
            <p>
              그래서 목록을 만들 때의 질문은 «이 답이 최악일 때 어떤 모양일까»입니다. 잘림·지어낸 규칙·형식 어긋남처럼,
              떠오른 최악들이 그대로 검사 항목이 됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
