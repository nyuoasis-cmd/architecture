import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 16장 5문 시연 — «되돌리기»와 «알아채기» 두 축으로 자리를 놓아 본다.
// 🔑 어떤 분야를 특별히 부각하지 않는다. 축을 대면 각 분야가 각자의 이유로 어디에 놓이는지 학생이 직접 본다.
//    결론은 «분야 순위»가 아니라 «내 앱의 그 자리가 어디인가»다.

type Case = {
  id: string;
  label: string;
  /** 되돌리기 쉬움 0~2 (클수록 쉽다) */
  undo: number;
  /** 받는 사람이 틀림을 알아채기 쉬움 0~2 */
  notice: number;
  note: string;
};

const CASES: Case[] = [
  { id: 'idea', label: '이야기 아이디어 뽑기', undo: 2, notice: 2, note: '마음에 안 들면 다시 뽑으면 됩니다. 지어낸 것을 쓰는 게 목적이라 지어냄이 문제가 아닙니다.' },
  { id: 'draft', label: '글 초안 잡기', undo: 2, notice: 2, note: '고쳐 쓸 것을 전제로 받는 글입니다. 쓰는 사람이 읽으면서 판단합니다.' },
  { id: 'notice', label: '학교 안내문에 넣을 사실', undo: 1, notice: 1, note: '이미 나눠 준 뒤에 정정문을 또 돌려야 합니다. 받는 사람은 학교가 준 것이라 사실로 읽습니다.' },
  { id: 'medical', label: '약을 얼마나 먹는지 안내', undo: 0, notice: 0, note: '몸에 들어간 뒤에는 되돌릴 방법이 없고, 받는 사람이 옳고 그름을 판단하기도 어렵습니다.' },
  { id: 'money', label: '금액·계좌 같은 숫자', undo: 0, notice: 1, note: '돈이 움직인 뒤에는 절차와 비용을 들여야 되돌아옵니다. 숫자가 틀린 것은 나중에 드러나기도 합니다.' },
  { id: 'law', label: '계약·규정 조항 정리', undo: 0, notice: 0, note: '문서로 남아 다른 판단의 근거가 됩니다. 그 분야를 모르는 사람은 틀렸는지 알기 어렵습니다.' },
  { id: 'explain', label: '배우는 사람에게 하는 설명', undo: 1, notice: 0, note: '배우는 쪽은 그 분야를 아직 모르기 때문에 틀렸다는 것을 알아채기 어렵습니다. 잘못 배운 것은 나중에 고칠 수 있지만 시간이 듭니다.' },
];

const ZONES = [
  { key: 'light', label: '가볍게 — 팻말로 충분', test: (c: Case) => c.undo + c.notice >= 3 },
  { key: 'mid', label: '중간 — 확인 절차를 붙인다', test: (c: Case) => c.undo + c.notice === 2 },
  { key: 'heavy', label: '세게 — 구조로 막는다', test: (c: Case) => c.undo + c.notice <= 1 },
];

export default function Q05RiskMap(_props: DemoComponentProps) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const remaining = CASES.filter((c) => !placed.includes(c.id));
  const done = remaining.length === 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          AI가 답하는 자리들입니다. 각 자리를 두 가지만 물어서 놓아 봅시다 —{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">틀리면 되돌릴 수 있나</b>, 그리고{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">받는 사람이 틀렸다는 걸 알아챌 수 있나</b>. 카드를
          눌러 놓아 보세요.
        </p>
      </div>

      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {remaining.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setPlaced((prev) => [...prev, c.id])}
              className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[12.5px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {ZONES.map((zone) => {
          const mine = CASES.filter((c) => placed.includes(c.id) && zone.test(c));
          return (
            <div key={zone.key} className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-3">
              <p className="mb-2 text-[12px] font-semibold text-[var(--color-text-primary)]">{zone.label}</p>
              <div className="space-y-1.5">
                {mine.length === 0 && <p className="text-[11.5px] text-[var(--color-text-muted)]">아직 비어 있어요</p>}
                {mine.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setOpen(open === c.id ? null : c.id)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-2 text-left"
                  >
                    <span className="text-[12px] text-[var(--color-text-primary)]">{c.label}</span>
                    <span className="mt-0.5 block text-[11px] text-[var(--color-text-muted)]">
                      되돌리기 {['어려움', '보통', '쉬움'][c.undo]} · 알아채기 {['어려움', '보통', '쉬움'][c.notice]}
                    </span>
                    {open === c.id && (
                      <span className="mt-1 block text-[11.5px] leading-[1.7] text-[var(--color-text-muted)]">
                        {c.note}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {done && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            <b className="font-semibold">오른쪽 칸에 모인 자리들은 서로 다른 이유로 거기 있습니다.</b> 몸에 들어가면 못
            되돌리는 것, 돈이 움직인 뒤라 절차가 필요한 것, 문서로 남아 근거가 되는 것, 받는 쪽이 아직 그 분야를 몰라 틀림을
            알아채기 어려운 것. 무엇이 «더 위험한 분야»인지 줄 세우는 게 목적이 아닙니다.
          </p>
          <p>
            쓸모는 여기입니다. <b className="font-semibold">내 앱에서 AI가 답하는 자리를 이 두 질문에 넣어 보는 것.</b> 왼쪽
            칸이면 «지어내지 마» 한 줄로 충분하고, 오른쪽 칸이면 지어낼 칸 자체를 없애야 합니다.
          </p>
          <p>그 «없앤다»가 실제로 무엇인지는 다음 문에서 직접 봅니다.</p>
        </div>
      )}
    </div>
  );
}
