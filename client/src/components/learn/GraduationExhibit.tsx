import { useEffect, useState } from 'react';
import { GH_PRACTICE_BADGE } from '../../lib/gh-sim';

/**
 * 23강 졸업 전시 — 가짜 GitHub «내 저장소»의 **읽기 전용** 뷰 (MAP 23강, 잠금 해제 연출).
 *
 * 🚨 읽기 전용이다 — 입력 칸이 없다. 전시는 보여 주는 자리지 고치는 자리가 아니다.
 * 🚨 «연습용» 표지는 여기에도 항상 붙는다(진실성 장치).
 * 🚨 내용은 서버 계보에서 실제로 불러온다 — 화면이 지어내지 않고, 못 읽으면 못 읽었다고 말한다.
 */
type Slot = { kind: string; content: string };

const SLOT_LABELS: Record<string, string> = {
  rules: '우리반-규칙.md — 12강에서 쓴 규칙 한 장',
  skill: '나의-스킬.md — 13강에서 만든 스킬',
  ac: '완료-조건.md — 16강에서 등록한 완료 조건',
  promise: '약속-문장.md — 19강에서 쓴 채점표',
  handoff: '넘김-쪽지.md — 22강에서 낸 쪽지',
  bundle: '졸업-묶음.md — 다섯 장을 하나로 조립한 것',
};

export default function GraduationExhibit() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [openKind, setOpenKind] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/lab/artifacts')
      .then(async (response) => {
        if (!response.ok) throw new Error('unavailable');
        const payload = (await response.json()) as { artifacts: Record<string, { content: string }> };
        if (cancelled) return;
        setSlots(
          Object.keys(SLOT_LABELS)
            .filter((kind) => payload.artifacts[kind])
            .map((kind) => ({ kind, content: payload.artifacts[kind]!.content })),
        );
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto mt-4 w-full max-w-[860px] px-4 pb-6 lg:px-6">
      <div className="relative overflow-hidden rounded-[10px] border border-[#d1d9e0] bg-white text-[13.5px] text-[#1f2328]">
        <span className="absolute right-3 top-2.5 z-10 rounded-full border border-orange-300 bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-900">
          {GH_PRACTICE_BADGE}
        </span>
        <header className="border-b border-[#d1d9e0] bg-[#f6f8fa] px-4 py-3 text-[14px]">
          🎓 <b className="text-[#0969da]">내 저장소 — 졸업 전시</b>
        </header>
        <div className="p-4">
          {status === 'loading' ? <p className="text-[13px] text-[#59636e]">전시를 준비하는 중…</p> : null}
          {status === 'error' ? (
            <p className="text-[13px] text-[#9a3412]">
              지금은 전시를 불러올 수 없어요 — 잠시 뒤 다시 열어 주세요. (만든 것이 사라진 게 아니에요.)
            </p>
          ) : null}
          {status === 'ready'
            ? slots.map((slot) => (
                <div key={slot.kind} className="mb-2 overflow-hidden rounded-lg border border-[#d1d9e0]">
                  <button
                    className="flex w-full items-center gap-2 bg-[#f6f8fa] px-3.5 py-2 text-left"
                    onClick={() => setOpenKind((current) => (current === slot.kind ? null : slot.kind))}
                    type="button"
                  >
                    <span className="font-mono text-[12.5px] text-[#0969da]">📄</span>
                    <span className="text-[13px]">{SLOT_LABELS[slot.kind]}</span>
                    <span className="ml-auto text-[12px] text-[#59636e]">{openKind === slot.kind ? '접기' : '열기'}</span>
                  </button>
                  {openKind === slot.kind ? (
                    <div className="whitespace-pre-wrap px-3.5 py-2.5 text-[13px] leading-[1.8]">{slot.content}</div>
                  ) : null}
                </div>
              ))
            : null}
          {status === 'ready' ? (
            <p className="mt-3 text-[12.5px] text-[#59636e]">
              한 학기 동안 직접 만든 것들이에요 — 화면을 옆 짝꿍에게 보여 주세요. 그게 마지막 미션입니다.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
