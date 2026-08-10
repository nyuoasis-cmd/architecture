import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 14장 4문 시연 — 대화를 끊고 새로 시작할 때 넘길 «인수인계 쪽지»를 직접 조립한다.
// 🔑 세 칸(문서·진행 위치·다음 작업)이 채워져야 새 대화가 이어받는다. 대화 전체를 붙여넣는 건
//    이어받기가 아니라 책상을 다시 채우는 일(11장 책상 데모의 심화판).
// 🔑 그리고 한 가지 더 — 쪽지의 «지금 이렇다»는 적을 때의 사실이지 읽는 순간의 사실이 아니다.

type Slot = 'doc' | 'progress' | 'next' | 'noise' | 'stale';

type Item = {
  id: string;
  label: string;
  slot: Slot;
  note: string;
};

const ITEMS: Item[] = [
  { id: 'doc', label: '한 장 설계 문서 (12장에서 만든 것)', slot: 'doc', note: '무엇을 만드는 앱인지 — 이게 없으면 새 AI가 처음부터 되묻는다' },
  { id: 'tasks', label: '작업 목록 7개와 «4번까지 끝남» 표시', slot: 'progress', note: '지금 어디인지 — 없으면 이미 끝난 걸 또 만든다' },
  { id: 'next', label: '다음 할 일: «5번 반납 버튼부터»', slot: 'next', note: '어디로 갈지 — 없으면 새 AI가 스스로 고르고, 대개 엉뚱한 데서 시작한다' },
  { id: 'decided', label: '지난 대화에서 정한 규칙 2개 (색은 파랑 계열 / 로그인 없음)', slot: 'doc', note: '되돌아가지 않기 위한 결정 기록. 문서 칸에 얹으면 된다' },
  { id: 'wholechat', label: '어제 대화 전체를 그대로 복사해 붙이기', slot: 'noise', note: '이어받기가 아니라 책상을 다시 꽉 채우는 일 — 끊은 이유가 사라진다' },
  { id: 'fails', label: '어제 실패한 시도 12번의 전체 기록', slot: 'noise', note: '과정은 게임의 «몇 번 죽었는지»와 같다. 이어하기에 필요 없다' },
  { id: 'status', label: '«서버는 지금 켜져 있고 로그인도 된 상태»', slot: 'stale', note: '적을 때는 참이었다. 지금도 참인지는 아무도 확인하지 않았다' },
  { id: 'cannot', label: '«그 재료는 이 컴퓨터에 없어서 못 한다»', slot: 'stale', note: '🚨 «안 된다·없다»는 특히 위험하다 — 실화에서 재료는 일주일 전부터 있었다' },
];

const SLOT_LABEL: Record<Exclude<Slot, 'noise' | 'stale'>, string> = {
  doc: '① 문서(무엇을)',
  progress: '② 진행 위치(어디까지)',
  next: '③ 다음 작업(어디로)',
};

export default function Q04HandoffNote(_props: DemoComponentProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);

  const toggle = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const chosen = ITEMS.filter((it) => picked.includes(it.id));
  const has = (slot: Slot) => chosen.some((it) => it.slot === slot);
  const noise = chosen.filter((it) => it.slot === 'noise');
  const stale = chosen.filter((it) => it.slot === 'stale');
  const uncheckedStale = stale.filter((it) => !checked.includes(it.id));

  const coreSlots: Array<Exclude<Slot, 'noise' | 'stale'>> = ['doc', 'progress', 'next'];
  const missing = coreSlots.filter((s) => !has(s));

  let verdict: { tone: 'idle' | 'bad' | 'warn' | 'good'; text: React.ReactNode };
  if (picked.length === 0) {
    verdict = { tone: 'idle', text: <>왼쪽에서 새 대화의 첫 부탁문에 붙일 것을 골라 보세요. 고른 것만 새 AI가 알게 됩니다.</> };
  } else if (missing.length > 0) {
    verdict = {
      tone: 'bad',
      text: (
        <>
          <b className="font-semibold">새 AI가 되묻습니다.</b> 빠진 칸: {missing.map((s) => SLOT_LABEL[s]).join(' · ')}.
          {missing.includes('progress') && ' 진행 위치가 없으면 이미 끝낸 작업을 다시 만듭니다.'}
          {missing.includes('doc') && ' 문서가 없으면 무엇을 만드는 앱인지부터 다시 정합니다.'}
        </>
      ),
    };
  } else if (uncheckedStale.length > 0) {
    verdict = {
      tone: 'warn',
      text: (
        <>
          세 칸은 찼습니다. 그런데 <b className="font-semibold">«지금 이렇다»고 적힌 항목 {uncheckedStale.length}개</b>를 아직
          확인하지 않았습니다. 쪽지에 적힌 상태는 <b className="font-semibold">적을 때의 사실</b>입니다. 아래 «직접 확인함»을
          눌러 눈으로 보고 넘어가세요.
        </>
      ),
    };
  } else if (noise.length > 0) {
    verdict = {
      tone: 'warn',
      text: (
        <>
          이어받기는 됩니다. 다만 <b className="font-semibold">과정 기록 {noise.length}건</b>이 함께 실려 새 대화의 책상이 시작부터
          붐빕니다. 끊은 이유가 «책상이 꽉 차서»였다면, 다시 채우고 시작하는 셈입니다.
        </>
      ),
    };
  } else {
    verdict = {
      tone: 'good',
      text: (
        <>
          <b className="font-semibold">몇 초 만에 어제의 동료가 됩니다.</b> 세 칸이 다 찼고, 과정 기록은 버렸고, «지금 이렇다»는
          항목은 눈으로 확인했습니다. 교대 근무의 차트가 이렇게 생겼습니다.
        </>
      ),
    };
  }

  const toneClass = {
    idle: 'border-[var(--color-border)] text-[var(--color-text-muted)]',
    bad: 'border-rose-300 bg-rose-50 text-rose-900',
    warn: 'border-amber-300 bg-amber-50 text-amber-900',
    good: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  }[verdict.tone];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setPicked([]);
            setChecked([]);
          }}
          className="rounded-lg border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-bold text-[var(--color-text-body)]"
        >
          처음부터
        </button>
        <span className="text-[12px] tabular-nums text-[var(--color-text-faint)]">
          고른 항목 {picked.length} / {ITEMS.length}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-4 shadow-sm">
          <p className="mb-3 text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">
            넘길 수 있는 것들 (눌러서 담기)
          </p>
          <div className="space-y-1.5">
            {ITEMS.map((it) => {
              const on = picked.includes(it.id);
              return (
                <div key={it.id}>
                  <button
                    type="button"
                    onClick={() => toggle(it.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-[12.5px] transition ${
                      on
                        ? 'border-[var(--color-text-primary)] bg-[var(--color-bg-subtle)] font-semibold text-[var(--color-text-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-body)]'
                    }`}
                  >
                    <span className="mr-1.5 text-[var(--color-text-faint)]">{on ? '☑' : '☐'}</span>
                    {it.label}
                  </button>
                  {on && (
                    <p className="mt-1 pl-6 text-[11.5px] leading-[1.7] text-[var(--color-text-muted)]">{it.note}</p>
                  )}
                  {on && it.slot === 'stale' && (
                    <button
                      type="button"
                      onClick={() =>
                        setChecked((prev) => (prev.includes(it.id) ? prev.filter((x) => x !== it.id) : [...prev, it.id]))
                      }
                      className={`ml-6 mt-1 rounded-md border px-2 py-1 text-[11px] font-bold ${
                        checked.includes(it.id)
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-amber-300 bg-amber-50 text-amber-900'
                      }`}
                    >
                      {checked.includes(it.id) ? '✓ 직접 확인함' : '아직 확인 안 함 — 눌러서 확인'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-4">
          <p className="mb-3 text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">
            새 대화가 받는 쪽지
          </p>
          <div className="space-y-2">
            {coreSlots.map((slot) => {
              const filled = chosen.filter((it) => it.slot === slot);
              return (
                <div
                  key={slot}
                  className={`rounded-lg border px-3 py-2 text-[12px] ${
                    filled.length > 0
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : 'border-dashed border-[var(--color-border)] text-[var(--color-text-faint)]'
                  }`}
                >
                  <span className="mr-1.5 font-bold">{SLOT_LABEL[slot]}</span>
                  {filled.length > 0 ? filled.map((f) => f.label).join(' / ') : '비어 있음'}
                </div>
              );
            })}
            {[...noise, ...stale].map((it) => (
              <div
                key={it.id}
                className={`rounded-lg border px-3 py-2 text-[12px] ${
                  it.slot === 'noise'
                    ? 'border-[var(--color-border)] text-[var(--color-text-faint)]'
                    : checked.includes(it.id)
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : 'border-amber-300 bg-amber-50 text-amber-900'
                }`}
              >
                <span className="mr-1.5 font-bold">{it.slot === 'noise' ? '군더더기' : '확인 필요'}</span>
                {it.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`rounded-xl border px-4 py-3 text-[12.5px] leading-[1.8] ${toneClass}`}>{verdict.text}</div>
    </div>
  );
}
