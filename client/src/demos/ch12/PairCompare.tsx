import { useState } from 'react';
import { VIBE_PREGEN_CH12 } from '../../data/vibe-pregen-ch12';
import type { VibePregenEntry } from '../../data/vibe-pregen-ch13';
import PregenBlock from '../ch13/PregenBlock';

// 12장 A형 «짝 비교» 공용 뷰 — 정보를 담기 «전/후»를 나란히 재생한다.
// 두 결과는 같은 AI·같은 형식으로 실제 실행한 저장본이고, 달라진 것은 부탁문에 담긴 정보 한 조각뿐이다.
// 판정을 먼저 보여 주지 않는다 — 학생이 두 화면을 비교한 뒤 «무엇이 달라졌나» 버튼을 눌러 확인한다.

export type PairCompareProps = {
  /** 두 실행에 공통으로 들어간 부탁문 */
  sharedAsk: string;
  /** 추가로 담은 정보 한 조각(오른쪽에만 들어간 문장) */
  addedInfo: string;
  left: { pregenKey: string; caption: string };
  right: { pregenKey: string; caption: string };
  /** 학생에게 시키는 비교 과제 */
  lookFor: React.ReactNode;
  /** 눌러서 여는 판정 */
  verdict: React.ReactNode;
  /** 재생할 사전 생성 재료 묶음 — 생략하면 12장 것. 14장 등 다른 장이 같은 뷰를 쓸 때만 넘긴다. */
  source?: Record<string, VibePregenEntry>;
};

export default function PairCompare({ sharedAsk, addedInfo, left, right, lookFor, verdict, source }: PairCompareProps) {
  const [revealed, setRevealed] = useState(false);
  const pregen = source ?? VIBE_PREGEN_CH12;
  const leftEntry = pregen[left.pregenKey];
  const rightEntry = pregen[right.pregenKey];
  const stamp = leftEntry ?? rightEntry;

  const panels = [
    { entry: leftEntry, caption: left.caption, tone: 'plain' as const },
    { entry: rightEntry, caption: right.caption, tone: 'marked' as const },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">
          두 번 다 똑같이 보낸 부탁문
        </p>
        <p className="mt-1 text-[13px] leading-[1.8] text-[var(--color-text-body)]">"{sharedAsk}"</p>
        <p className="mt-2 text-[12px] leading-[1.75] text-[var(--color-text-muted)]">
          오른쪽 실행에만 이 한 줄을 더 붙였습니다 →{' '}
          <b className="font-semibold text-emerald-700">"{addedInfo}"</b>
        </p>
      </div>

      <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">{lookFor}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        {panels.map((panel, idx) => (
          <div
            key={panel.caption}
            className={`rounded-xl border px-4 py-3.5 shadow-sm ${
              panel.tone === 'marked' ? 'border-emerald-200 bg-emerald-50/40' : 'border-[var(--color-border)] bg-white'
            }`}
          >
            <p
              className={`mb-2 text-[11px] font-bold ${
                panel.tone === 'marked' ? 'text-emerald-800' : 'text-[var(--color-text-faint)]'
              }`}
            >
              {idx === 0 ? '①' : '②'} {panel.caption}
            </p>
            {panel.entry ? <PregenBlock text={panel.entry.text} /> : <p className="text-[12.5px]">재료 없음</p>}
          </div>
        ))}
      </div>

      {revealed ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-[12.5px] leading-[1.8] text-amber-900">{verdict}</p>
        </div>
      ) : (
        <button
          className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
          onClick={() => setRevealed(true)}
          type="button"
        >
          🔍 무엇이 달라졌는지 확인하기
        </button>
      )}

      {stamp ? (
        <p className="text-[10.5px] text-[var(--color-text-faint)]">
          실제 실행 기록 2회 · {stamp.model} · {stamp.generatedAt.slice(0, 10)} — 수업 중에는 저장본을 재생만 합니다
        </p>
      ) : null}
    </div>
  );
}
