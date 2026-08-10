import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 12장 6문 시연 — «전화 게임». 말로 전달된 규칙이 사람을 거칠 때마다 조금씩 바뀐다.
// 🔑 각 단계의 왜곡은 «누가 거짓말을 해서»가 아니라 빠진 조건을 각자 상식으로 메워서 생긴다.
//    마지막에 «한 장 문서» 버전과 나란히 두면, 문서가 막아 주는 것이 무엇인지 한눈에 보인다.

const ORIGIN = '1인 1권, 2주, 늦으면 다음 주는 못 빌림';

const HOPS = [
  {
    who: '월요일 · 회의에서 정함',
    text: '1인 1권, 2주, 늦으면 다음 주는 못 빌림',
    note: '여기까지는 모두가 같은 걸 들었다',
  },
  {
    who: '화요일 · 결석한 친구에게 전달',
    text: '한 사람이 한 권씩, 2주 안에 반납',
    note: '늦었을 때의 «벌칙»이 통째로 빠졌다 — 말하는 사람이 덜 중요하다고 느낀 부분',
  },
  {
    who: '수요일 · 옆 모둠에 전달',
    text: '한 권씩 빌리고 2주 정도면 돌려주면 돼',
    note: '"2주 안에"가 "2주 정도"가 됐다. 규칙이 권고로 바뀌는 순간',
  },
  {
    who: '금요일 · 앱을 만들 때',
    text: '한 권씩 빌리고, 알아서 돌려주기',
    note: '기한이 사라졌다. 이 상태로 AI에게 부탁하면 AI가 기한을 «대신 정한다»(11장)',
  },
] as const;

export default function Q06Telephone(_props: DemoComponentProps) {
  const [step, setStep] = useState(0);
  const finished = step === HOPS.length - 1;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">월요일에 «말로» 정한 규칙</p>
          <p className="mt-1 text-[13px] font-medium leading-[1.8] text-[var(--color-text-body)]">{ORIGIN}</p>
        </div>

        <div className="space-y-2">
          {HOPS.slice(0, step + 1).map((hop, idx) => (
            <div
              key={hop.who}
              className={`rounded-lg border px-3.5 py-2.5 ${
                idx === HOPS.length - 1
                  ? 'border-rose-200 bg-rose-50'
                  : 'border-[var(--color-border)] bg-white'
              }`}
            >
              <p className="text-[10.5px] font-bold tracking-wide text-[var(--color-text-faint)]">{hop.who}</p>
              <p className="mt-0.5 text-[13px] leading-[1.75] text-[var(--color-text-primary)]">"{hop.text}"</p>
              {idx > 0 ? (
                <p className="mt-1 text-[12px] leading-[1.7] text-[var(--color-text-muted)]">↳ {hop.note}</p>
              ) : null}
            </div>
          ))}
        </div>

        {finished ? (
          <p className="rounded-lg bg-[#C9E0D4] px-3.5 py-2.5 text-[12.5px] font-medium leading-[1.8] text-[#2d4a3e]">
            아무도 거짓말하지 않았습니다. 각자 <b>덜 중요해 보이는 조건을 하나씩 흘렸을</b> 뿐이에요. 나흘 만에 «못
            빌림»이 사라지고 «2주»가 «2주 정도»가 됐습니다.
          </p>
        ) : (
          <button
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
            onClick={() => setStep((prev) => Math.min(prev + 1, HOPS.length - 1))}
            type="button"
          >
            📞 다음 사람에게 전달하기 ({step + 1}/{HOPS.length})
          </button>
        )}
      </div>

      <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-3.5">
        <p className="text-[11px] font-bold text-emerald-800">같은 규칙을 «한 장 문서»에 적었다면</p>
        <div className="space-y-1.5 rounded-lg bg-white px-3.5 py-3 text-[12.5px] leading-[1.8] text-[var(--color-text-body)]">
          <p>
            <b className="font-semibold">정책</b> · 한 사람이 한 번에 1권까지 빌린다
          </p>
          <p>
            <b className="font-semibold">정책</b> · 대출 기간은 빌린 날부터 14일
          </p>
          <p>
            <b className="font-semibold">예외</b> · 14일을 넘기면 다음 1주 동안 대출 금지
          </p>
        </div>
        <p className="text-[12px] leading-[1.75] text-emerald-900">
          문서는 나흘이 지나도 «2주 정도»로 바뀌지 않습니다. 게다가 새 대화를 시작할 때 이 세 줄을 그대로 붙여 넣으면,
          어제의 결정을 모르는 AI에게도 우리 규칙이 한 번에 전달돼요.
        </p>
      </div>
    </div>
  );
}
