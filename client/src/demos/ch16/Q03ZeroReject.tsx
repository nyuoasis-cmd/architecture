import { useState } from 'react';
import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH16 } from '../../data/vibe-pregen-ch16';
import PregenBlock from '../ch13/PregenBlock';

// 16장 3문 시연 — 실제로 «끊긴 답»을 검사 없는 앱 / 검사 있는 앱에 각각 통과시켜 본다.
// 🔑 재생하는 원문은 글자 수 한도에 걸려 문장 중간에서 실제로 끊긴 응답이다(편집하지 않았다).
//    검사가 없으면 이 답은 오류가 아니라 «정상»으로 분류돼 그대로 학생 화면에 뜬다 — 거부율은 0%인 채로.

const entry = VIBE_PREGEN_CH16['ch16_q03_truncated'];

export default function Q03ZeroReject(_props: DemoComponentProps) {
  const [gate, setGate] = useState<'off' | 'on'>('off');
  const [sent, setSent] = useState(false);

  const rejected = gate === 'on';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          AI에게 앱 사용법 안내문을 쓰게 했습니다. 아래가 <b className="font-semibold text-[var(--color-text-primary)]">실제로
          돌아온 답</b>입니다. 이 답을 학생 화면으로 내보내기 전에 검사를 켤지 끌지 골라 보세요.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3">
        <p className="mb-2 text-[11.5px] font-semibold text-[var(--color-text-muted)]">AI가 돌려준 답 (원문 그대로)</p>
        <PregenBlock text={entry.text} />
        <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
          {entry.model} · {entry.generatedAt.slice(0, 10)} 생성 · 저장본 재생
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {(
          [
            { key: 'off', label: '🚫 내보내기 전 검사 없음' },
            { key: 'on', label: '🛡️ «끝맺음이 있는가» 검사 켜기' },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              setGate(opt.key);
              setSent(true);
            }}
            className={`flex-1 rounded-lg border px-3.5 py-2.5 text-[12.5px] ${
              gate === opt.key && sent
                ? 'border-[var(--color-accent)] bg-white font-medium'
                : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-input)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {sent && (
        <div
          className={`space-y-2 rounded-xl border px-4 py-3 text-[12.5px] leading-[1.8] ${
            rejected ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900'
          }`}
        >
          {rejected ? (
            <>
              <p>
                <b className="font-semibold">거부됨 — 오늘의 거부율 0% → 1건.</b> 답이 «- 앱이 처음 설치된 거면»에서 끊겨
                있습니다. 학생에게 나가지 않고 다시 만들게 됩니다.
              </p>
              <p>
                숫자가 0에서 1로 움직였다는 것 자체가 중요한 정보입니다. 이 검사는{' '}
                <b className="font-semibold">실패할 줄 아는 검사</b>라는 뜻이니까요(15장 시험 버튼).
              </p>
            </>
          ) : (
            <>
              <p>
                <b className="font-semibold">통과 — 학생 화면에 그대로 떴습니다. 거부율은 여전히 0%입니다.</b>
              </p>
              <p>
                앱 입장에서 이 답은 «정상»입니다. 오류가 난 것도, 비어 있는 것도 아니고 글자가 잘 들어왔으니까요. 그런데
                안내문은 <b className="font-semibold">«- 앱이 처음 설치된 거면»에서 끊겨</b> 있습니다. 학생은 다음 문장을
                기다리다 그냥 넘어갑니다.
              </p>
              <p>
                이런 게 «조용한 실패»입니다. 아무도 신고하지 않고, 경보도 울리지 않고, 숫자로는 0건. 그래서 거부율 0%는
                안전의 증거가 아니라 <b className="font-semibold">검사가 있는지부터 확인할 신호</b>입니다.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
