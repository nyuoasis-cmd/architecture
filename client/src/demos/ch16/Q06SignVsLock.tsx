import { useState } from 'react';
import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH16 } from '../../data/vibe-pregen-ch16';
import PregenBlock from '../ch13/PregenBlock';

// 16장 6문 시연 — 같은 질문에 가드를 세 단계로 걸어 본 실제 실행.
//  없음(3회 전부 지어냄) → 말로 막기(이번엔 막혔다) → 구조로 막기(지어낼 칸이 없다)
// 🔑 «말로 막기는 항상 실패한다»고 말하지 않는다 — 실측에서 통했다. 정확한 교훈은
//    «통했다 = 이번에 통했다»이고, 구조는 결과가 아니라 «가능한 답의 모양»을 바꾼다는 것.

const none = VIBE_PREGEN_CH16['ch16_q04_school2'];
const prompt = VIBE_PREGEN_CH16['ch16_q06_prompt'];
const structured = VIBE_PREGEN_CH16['ch16_q06_structured'];

const GUARDS = [
  {
    key: 'none',
    label: '① 아무 장치 없음',
    sub: '그냥 시킴',
    entry: none,
    verdict: 'bad' as const,
    note: '없는 학교의 규칙이 안내문 모양으로 나왔습니다. 같은 질문 3회의 답이 서로 달랐고요(앞 문에서 본 그 세 개입니다).',
  },
  {
    key: 'prompt',
    label: '② 말로 막기',
    sub: '"모르는 것은 절대 지어내지 마라"',
    entry: prompt,
    verdict: 'ok' as const,
    note: '이번에는 막혔습니다. 그런데 이건 «이번 실행»의 결과예요 — 11장에서 배웠듯 AI의 답은 매번 조금씩 다릅니다. 백 번에 한 번 벗어나면, 30명이 열 번씩 쓰는 수업에서는 몇 번의 사고가 됩니다.',
  },
  {
    key: 'structured',
    label: '③ 구조로 막기',
    sub: '답을 «확인됨 | 출처 | 내용» 또는 «확인불가 | 자료 없음» 두 형식으로만',
    entry: structured,
    verdict: 'best' as const,
    note: '답이 한 줄입니다. 지어내지 말라고 부탁한 게 아니라, 지어낸 내용을 담을 칸을 주지 않았습니다. 형식을 벗어난 답은 애초에 «답의 모양»이 아닙니다.',
  },
];

export default function Q06SignVsLock(_props: DemoComponentProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const allOpen = opened.length === GUARDS.length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          같은 질문 — <b className="font-semibold text-[var(--color-text-primary)]">"서울 한빛초등학교 도서관 대출 규칙을
          알려 줘"</b>(실제로 없는 학교입니다) — 에 가드를 세 단계로 걸어 실행했습니다. 위에서부터 하나씩 열어 보세요.
        </p>
      </div>

      {GUARDS.map((g) => {
        const isOpen = opened.includes(g.key);
        return (
          <div
            key={g.key}
            className={`rounded-xl border px-3.5 py-3 ${
              isOpen
                ? g.verdict === 'bad'
                  ? 'border-rose-300 bg-rose-50'
                  : g.verdict === 'ok'
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-emerald-300 bg-emerald-50'
                : 'border-[var(--color-border)] bg-white'
            }`}
          >
            <p className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">{g.label}</p>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-text-muted)]">{g.sub}</p>
            {isOpen ? (
              <div className="mt-2 space-y-2">
                <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5">
                  <PregenBlock text={g.entry.text} />
                </div>
                <p className="text-[12.5px] leading-[1.75] text-[var(--color-text-muted)]">{g.note}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setOpened((prev) => [...prev, g.key])}
                className="mt-2 rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]"
              >
                실제 답 보기
              </button>
            )}
          </div>
        );
      })}

      {allOpen && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            여기서 성급하게 «말로 막기는 소용없다»고 정리하면 틀립니다. ②는{' '}
            <b className="font-semibold">실제로 막았습니다.</b> 정확한 차이는 다른 데 있어요.
          </p>
          <p>
            ②는 <b className="font-semibold">결과가 매번 다를 수 있는 부탁</b>이고, ③은{' '}
            <b className="font-semibold">답의 모양 자체를 정한 것</b>입니다. ②의 성공은 «이번엔 지켰다»이고, ③의 성공은
            «지어낸 내용을 넣을 칸이 없다»입니다. 팻말과 자물쇠의 차이가 이것입니다.
          </p>
          <p>
            그래서 앞 문의 지도가 필요합니다. 되돌리기 쉽고 사용자가 알아챌 수 있는 자리는 팻말로 충분하고, 되돌리기
            어렵거나 알아채기 어려운 자리는 자물쇠로 갑니다. <b className="font-semibold">전부 자물쇠는 답이 아닙니다</b> —
            만들고 관리하는 비용이 크니까요.
          </p>
        </div>
      )}
    </div>
  );
}
