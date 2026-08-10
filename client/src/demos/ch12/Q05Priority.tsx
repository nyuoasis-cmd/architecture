import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 12장 5문 시연 — 같은 목록을 «필수 / 나중 / 안 함» 세 칸으로 나눈다.
// 🔑 이 데모의 목적은 정답 맞히기가 아니라 «안 함» 칸을 실제로 채워 보는 경험이다.
//    안 함이 0개면 통과시키지 않는다 — 안 하기로 정하지 않은 목록은 계속 판단을 흔들기 때문.

type Bucket = 'must' | 'later' | 'never';

const BUCKETS: { key: Bucket; label: string; hint: string; cls: string }[] = [
  { key: 'must', label: '필수', hint: '없으면 앱이 아님', cls: 'border-[#2d4a3e] bg-[#C9E0D4] text-[#2d4a3e]' },
  { key: 'later', label: '나중', hint: '있으면 좋음', cls: 'border-amber-400 bg-amber-100 text-amber-900' },
  { key: 'never', label: '안 함', hint: '이번엔 하지 않기로 «정함»', cls: 'border-rose-300 bg-rose-100 text-rose-800' },
];

const ITEMS = [
  { id: 'borrow', text: '책을 빌린다' },
  { id: 'return', text: '책을 반납한다' },
  { id: 'who', text: '누가 빌렸는지 본다' },
  { id: 'search', text: '책을 검색한다' },
  { id: 'star', text: '책에 별점을 준다' },
  { id: 'chat', text: '독서 감상 채팅방' },
];

export default function Q05Priority(_props: DemoComponentProps) {
  const [placed, setPlaced] = useState<Record<string, Bucket>>({});
  const [done, setDone] = useState(false);

  const counts = BUCKETS.map((bucket) => ({
    ...bucket,
    n: ITEMS.filter((item) => placed[item.id] === bucket.key).length,
  }));
  const allPlaced = Object.keys(placed).length === ITEMS.length;
  const neverCount = counts.find((c) => c.key === 'never')?.n ?? 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          가방 크기(수업 시간)는 정해져 있습니다. 여섯 가지를 세 칸으로 나눠 보세요. 심판은 여전히 문제 문장 —{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">
            "책이 누구한테 갔는지 몰라서 자꾸 사라진다."
          </b>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {counts.map((bucket) => (
          <div key={bucket.key} className={`rounded-lg border px-3 py-2 text-center ${bucket.cls}`}>
            <p className="text-[13px] font-bold">
              {bucket.label} {bucket.n}
            </p>
            <p className="text-[11px] opacity-80">{bucket.hint}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {ITEMS.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5"
          >
            <p className="text-[13px] text-[var(--color-text-primary)]">{item.text}</p>
            <div className="flex gap-1.5">
              {BUCKETS.map((bucket) => (
                <button
                  key={bucket.key}
                  className={`rounded-md border px-2.5 py-1 text-[12px] font-medium ${
                    placed[item.id] === bucket.key
                      ? bucket.cls
                      : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]'
                  }`}
                  onClick={() => setPlaced((prev) => ({ ...prev, [item.id]: bucket.key }))}
                  type="button"
                >
                  {bucket.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {done ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 space-y-2">
          <p className="text-[12.5px] leading-[1.8] text-amber-900">
            이제 이 세 칸을 부탁문에 그대로 옮겨 적습니다 —{' '}
            <b className="font-semibold">
              "필수: {ITEMS.filter((i) => placed[i.id] === 'must').map((i) => i.text).join(' · ') || '(없음)'}. 이번엔
              안 함: {ITEMS.filter((i) => placed[i.id] === 'never').map((i) => i.text).join(' · ')}."
            </b>
          </p>
          <p className="text-[12.5px] leading-[1.8] text-amber-900">
            «안 함»을 적는 것이 이 데모의 진짜 목적입니다. 적지 않은 기능은 AI에게 «해도 된다»로 읽히고, 내 머릿속에서도
            "이것도 넣을까"로 계속 되돌아옵니다. 침묵은 승낙, 안 함은 금지예요.
          </p>
        </div>
      ) : (
        <>
          <button
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)] disabled:opacity-45"
            disabled={!allPlaced || neverCount === 0}
            onClick={() => setDone(true)}
            type="button"
          >
            {!allPlaced ? '여섯 가지를 모두 나눠 주세요' : neverCount === 0 ? '«안 함» 칸이 비어 있어요' : '✅ 정리 끝 — 부탁문으로 옮기기'}
          </button>
          {allPlaced && neverCount === 0 ? (
            <p className="text-[12px] leading-[1.75] text-rose-700">
              전부 «필수»나 «나중»이면 아무것도 결정하지 않은 것과 같습니다. 이번에 <b>하지 않을 것</b>을 최소 하나는
              정해야 가방이 닫혀요.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
