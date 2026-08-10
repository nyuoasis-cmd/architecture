import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 16장 1문 시연 — 같은 앱을 «점수»와 «합/불» 두 방식으로 판정해 본다.
// 🔑 점수를 매기면 평균이 착시를 만든다. 항목마다 문턱을 세우면 «못 넘은 하나»가 숨을 자리가 없다.

type Item = { id: string; label: string; score: number; pass: boolean; why: string };

const ITEMS: Item[] = [
  { id: 'list', label: '책 목록이 보인다', score: 10, pass: true, why: '' },
  { id: 'borrow', label: '책을 빌릴 수 있다', score: 10, pass: true, why: '' },
  { id: 'return', label: '반납이 된다', score: 9, pass: true, why: '' },
  { id: 'ui', label: '화면이 보기 좋다', score: 8, pass: true, why: '' },
  {
    id: 'name',
    label: '남의 이름으로 빌릴 수 없다',
    score: 5,
    pass: false,
    why: '열 번에 한 번, 다른 사람 이름으로 기록됩니다. 교실에서는 «누가 가져갔는지 모른다»가 됩니다.',
  },
  { id: 'empty', label: '빈칸으로 눌러도 앱이 안 멈춘다', score: 8, pass: true, why: '' },
];

export default function Q01PassFail(_props: DemoComponentProps) {
  const [mode, setMode] = useState<'score' | 'gate' | null>(null);

  const total = ITEMS.reduce((sum, i) => sum + i.score, 0);
  const avg = Math.round((total / (ITEMS.length * 10)) * 100);
  const failed = ITEMS.filter((i) => !i.pass);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          학급문고 앱이 다 만들어졌습니다. 교실에 내놓기 전에 판정을 해야 합니다.{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">어느 방식으로 판정하시겠어요?</b>
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setMode('score')}
          className={`flex-1 rounded-lg border px-3.5 py-2.5 text-[12.5px] ${
            mode === 'score'
              ? 'border-[var(--color-accent)] bg-white font-medium'
              : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-input)]'
          }`}
        >
          📊 항목마다 점수를 매긴다
        </button>
        <button
          type="button"
          onClick={() => setMode('gate')}
          className={`flex-1 rounded-lg border px-3.5 py-2.5 text-[12.5px] ${
            mode === 'gate'
              ? 'border-[var(--color-accent)] bg-white font-medium'
              : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-input)]'
          }`}
        >
          ✅ 항목마다 합격/불합격을 매긴다
        </button>
      </div>

      {mode && (
        <div className="space-y-2">
          {ITEMS.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 ${
                mode === 'gate' && !item.pass ? 'border-rose-300 bg-rose-50' : 'border-[var(--color-border)] bg-white'
              }`}
            >
              <p className="text-[12.5px] text-[var(--color-text-primary)]">{item.label}</p>
              {mode === 'score' ? (
                <span className="shrink-0 text-[12.5px] tabular-nums text-[var(--color-text-muted)]">
                  {item.score} / 10
                </span>
              ) : (
                <span
                  className={`shrink-0 text-[12.5px] font-semibold ${item.pass ? 'text-emerald-700' : 'text-rose-700'}`}
                >
                  {item.pass ? '합격' : '불합격'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {mode === 'score' && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            <b className="font-semibold">총점 {total}/60 — {avg}점.</b> 꽤 잘 나왔네요. 이 숫자만 보고 교실에 내놓으면
            어떻게 될까요?
          </p>
          <p>
            평균은 <b className="font-semibold">잘한 항목이 못한 항목을 가려 줍니다.</b> «남의 이름으로 빌릴 수 없다»가
            5점이어도, 나머지가 높으니 {avg}점입니다. 그런데 교실에서 실제로 일어나는 일은 «열 번에 한 번 남의 이름으로
            기록됨»이고, 그건 «{avg}점만큼 괜찮음»이 아닙니다.
          </p>
          <p>이제 오른쪽 방식으로 다시 판정해 보세요.</p>
        </div>
      )}

      {mode === 'gate' && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            <b className="font-semibold">
              6개 항목 중 {ITEMS.length - failed.length}개 합격, {failed.length}개 불합격 → 전체 판정: 불합격.
            </b>
          </p>
          {failed.map((f) => (
            <p key={f.id}>
              · «{f.label}» — {f.why}
            </p>
          ))}
          <p>
            점수 방식과 정보량은 같은데 결론이 반대입니다. 문턱 방식에서는{' '}
            <b className="font-semibold">못 넘은 항목이 숨을 자리가 없습니다.</b> 그리고 다음 할 일도 분명해집니다 —
            불합격 {failed.length}개를 고치고 다시 판정.
          </p>
        </div>
      )}
    </div>
  );
}
