import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 15장 1문 시연 — «됐다»의 증거를 직접 모아 본다.
// 🔑 이 데모의 교보재는 «성공 장면만 모으면 목록이 다 차 보인다»는 착시다.
//    규칙마다 짝(되는 장면 / 막히는 장면)이 있고, 막히는 쪽을 안 보면 그 규칙은 확인된 적이 없다.

type Evidence = {
  id: string;
  label: string;
  /** 어느 규칙에 대한 증거인가 */
  rule: string;
  /** 되는 장면인가(true) 막히는 장면인가(false) */
  positive: boolean;
  /** 증거로 쳐줄 수 없는 것이면 사유 */
  reject?: string;
};

const RULES = [
  { id: 'borrow', label: '학생이 책을 빌릴 수 있다' },
  { id: 'onebook', label: '한 사람이 동시에 가질 수 있는 책은 1권까지' },
  { id: 'taken', label: '남이 빌려간 책은 빌릴 수 없다' },
];

const EVIDENCE: Evidence[] = [
  { id: 'e1', label: 'AI가 "세 규칙 모두 반영했습니다"라고 답했다', rule: 'borrow', positive: true, reject: 'AI의 자기 보고 — 가장 약한 증거야. 만든 쪽의 말은 증거가 아니라 주장이야.' },
  { id: 'e2', label: '앱이 오류 없이 잘 열렸다', rule: 'borrow', positive: true, reject: '열린다는 건 규칙과 아무 상관이 없어. 규칙이 전부 빠져 있어도 앱은 열려.' },
  { id: 'e3', label: '3번 책을 빌렸더니 내 현황에 나타났다', rule: 'borrow', positive: true },
  { id: 'e4', label: '한 권 빌린 상태에서 두 권째를 눌렀더니 거절됐다', rule: 'onebook', positive: false },
  { id: 'e5', label: '한 권 빌리는 건 잘 됐다', rule: 'onebook', positive: true },
  { id: 'e6', label: '친구가 빌려간 책의 빌리기 버튼이 눌리지 않았다', rule: 'taken', positive: false },
  { id: 'e7', label: '아무도 안 빌린 책은 잘 빌려졌다', rule: 'taken', positive: true },
];

export default function Q01ProveIt(_props: DemoComponentProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [judged, setJudged] = useState(false);

  const toggle = (id: string) => {
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setJudged(false);
  };

  const chosen = EVIDENCE.filter((e) => picked.includes(e.id));
  const accepted = chosen.filter((e) => !e.reject);
  const rejected = chosen.filter((e) => e.reject);

  const perRule = RULES.map((rule) => {
    const mine = accepted.filter((e) => e.rule === rule.id);
    return {
      ...rule,
      hasPositive: mine.some((e) => e.positive),
      hasNegative: mine.some((e) => !e.positive),
      // 「빌릴 수 있다」는 막히는 장면이 따로 없는 규칙 — 되는 장면 하나로 충분하다.
      needsNegative: rule.id !== 'borrow',
    };
  });
  const done = perRule.filter((r) => r.hasPositive && (!r.needsNegative || r.hasNegative)).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          AI가 "학급문고 앱 완성했습니다!"라고 했습니다. 정말 됐는지 확인하려고 합니다. 아래에서{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">«됐다»의 증거로 인정할 것</b>을 골라 보세요. 많이
          고르는 게 목표가 아닙니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[11.5px] font-semibold tracking-wide text-[var(--color-text-muted)]">내가 본 것들</p>
          {EVIDENCE.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => toggle(e.id)}
              className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-[12.5px] leading-[1.7] ${
                picked.includes(e.id)
                  ? 'border-[var(--color-accent)] bg-white'
                  : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-input)]'
              }`}
            >
              <span className="mt-[1px]">{picked.includes(e.id) ? '☑' : '☐'}</span>
              <span className="text-[var(--color-text-primary)]">{e.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[11.5px] font-semibold tracking-wide text-[var(--color-text-muted)]">규칙별 확인 상태</p>
          {perRule.map((rule) => (
            <div key={rule.id} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5">
              <p className="text-[12.5px] font-medium text-[var(--color-text-primary)]">{rule.label}</p>
              <div className="mt-1.5 flex gap-3 text-[11.5px] text-[var(--color-text-muted)]">
                <span>{rule.hasPositive ? '✅' : '⬜'} 되는 장면</span>
                {rule.needsNegative && <span>{rule.hasNegative ? '✅' : '⬜'} 막히는 장면</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {judged ? (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            <b className="font-semibold">증거로 인정된 것 {accepted.length}개 · 규칙 3개 중 {done}개 확인 완료.</b>
          </p>
          {rejected.length > 0 && (
            <div className="space-y-1">
              {rejected.map((e) => (
                <p key={e.id}>
                  · «{e.label}» → <b className="font-semibold">증거 아님.</b> {e.reject}
                </p>
              ))}
            </div>
          )}
          {perRule
            .filter((r) => r.needsNegative && r.hasPositive && !r.hasNegative)
            .map((r) => (
              <p key={r.id}>
                · «{r.label}» — 되는 장면만 봤어요. 이 규칙이 <b className="font-semibold">살아 있다는 증거는 «막히는
                장면»</b>입니다. 되는 장면은 규칙을 다 지워도 똑같이 나와요.
              </p>
            ))}
          {done === 3 && (
            <p>
              세 규칙 모두 «되는 장면»과 «막히는 장면»을 짝으로 확인했습니다. 이게 AI의 자기 보고보다, 한 번 눌러 본
              것보다 강한 증거입니다.
            </p>
          )}
        </div>
      ) : (
        <button
          className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
          onClick={() => setJudged(true)}
          type="button"
        >
          🔍 이걸로 «됐다»고 할 수 있는지 판정받기
        </button>
      )}
    </div>
  );
}
