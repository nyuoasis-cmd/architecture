import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 15장 6문 시연 — 막힌 상황에서 «추측 수리»와 «증거 수집»을 골라 가며 결과를 본다.
// 🔑 추측이 나쁜 게 아니라, 추측이 두 번 빗나간 뒤에도 세 번째 추측을 하는 것이 나쁘다.
//    실화 기반: 가설 두 번 실패 → 기록 남기기로 전환 → 원인(글자 수 한도)이 한눈에 보였다.

type Step = {
  kind: 'guess' | 'evidence';
  label: string;
  result: string;
  tone: 'bad' | 'good';
};

const GUESSES: Step[] = [
  {
    kind: 'guess',
    label: '"안 되는데? 고쳐 줘"',
    result: 'AI가 버튼 색깔 쪽을 손봤습니다. 여전히 안 됩니다. (추측 1회 실패)',
    tone: 'bad',
  },
  {
    kind: 'guess',
    label: '"아직도 안 돼. 다시 고쳐 줘"',
    result: '이번엔 저장 방식을 통째로 바꿨습니다. 여전히 안 되고, 잘 되던 반납까지 이상해졌습니다. (추측 2회 실패)',
    tone: 'bad',
  },
  {
    kind: 'guess',
    label: '"이번엔 진짜 될 것 같은데… 한 번만 더 고쳐 줘"',
    result:
      '세 번째 추측입니다. 고친 곳이 세 군데로 늘었고, 이제 무엇이 원래 코드고 무엇이 수리 흔적인지 알 수 없게 됐습니다.',
    tone: 'bad',
  },
];

const EVIDENCE: Step = {
  kind: 'evidence',
  label: '"고치지 말고, 어디서 잘못되는지 알아낼 방법을 알려 줘"',
  result:
    'AI가 실패하는 자리에 «그때 값이 얼마였는지» 적어 두는 장치를 제안했습니다. 다시 눌러 보니 기록이 남았고 — 빌린 사람 이름이 빈칸으로 넘어가고 있었습니다. 원인이 보이자 수리는 한 번에 끝났습니다.',
  tone: 'good',
};

const SYMPTOM_FIELDS = [
  { key: 'did', label: '무엇을 했나', good: '3번 책의 «빌리기» 버튼을 눌렀다' },
  { key: 'got', label: '무엇이 나왔나', good: '빨간 글씨로 "저장에 실패했습니다(코드 400)" — 문구 그대로' },
  { key: 'want', label: '무엇을 기대했나', good: '내 현황에 3번 책이 나타나는 것' },
];

export default function Q06DiagnoseFirst(_props: DemoComponentProps) {
  const [taken, setTaken] = useState<Step[]>([]);
  const [showCard, setShowCard] = useState(false);

  const guessCount = taken.filter((s) => s.kind === 'guess').length;
  const switched = taken.some((s) => s.kind === 'evidence');

  const takeGuess = () => {
    const next = GUESSES[Math.min(guessCount, GUESSES.length - 1)];
    setTaken((prev) => [...prev, next]);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          <b className="font-semibold text-[var(--color-text-primary)]">증상:</b> 책을 빌리면 "저장에 실패했습니다"가 뜨고,
          내 현황에 아무것도 안 나타납니다. 어제까지는 됐어요. 무엇을 하시겠어요?
        </p>
      </div>

      <div className="space-y-2">
        {taken.map((step, idx) => (
          <div
            key={`${step.kind}-${idx}`}
            className={`rounded-lg border px-3.5 py-2.5 ${
              step.tone === 'good' ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'
            }`}
          >
            <p className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              {step.kind === 'guess' ? '🔧' : '🔍'} {step.label}
            </p>
            <p className="mt-1 text-[12.5px] leading-[1.75] text-[var(--color-text-muted)]">{step.result}</p>
          </div>
        ))}
      </div>

      {!switched && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={takeGuess}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[12.5px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
          >
            🔧 추측해서 고쳐 달라고 한다
          </button>
          <button
            type="button"
            onClick={() => setTaken((prev) => [...prev, EVIDENCE])}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[12.5px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
          >
            🔍 고치지 말고 증거부터 모으게 한다
          </button>
        </div>
      )}

      {guessCount >= 2 && !switched && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-[12.5px] leading-[1.75] text-amber-900">
          추측이 두 번 빗나갔습니다. 여기가 규칙이 발동하는 자리예요 —{' '}
          <b className="font-semibold">세 번째는 고치기가 아니라 기록 남기기.</b>
        </p>
      )}

      {switched && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            {guessCount === 0 ? (
              <>
                <b className="font-semibold">추측 0회로 끝냈습니다.</b> 증거가 있으면 수리는 대개 한 번에 끝나요.
              </>
            ) : (
              <>
                <b className="font-semibold">추측 {guessCount}회 뒤 전환했습니다.</b> 그 {guessCount}회 동안 고쳐진 곳이{' '}
                {guessCount}군데 늘었고, 그건 나중에 되돌릴 짐이 됩니다.
              </>
            )}
          </p>
          <p>
            수리를 부탁할 때 담을 세 줄은 이것입니다. 눌러서 예시를 보세요.
          </p>
          <button
            type="button"
            onClick={() => setShowCard(true)}
            className="rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[12px] text-amber-900 hover:bg-amber-100"
          >
            증상 카드 세 줄 보기
          </button>
          {showCard && (
            <div className="space-y-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5">
              {SYMPTOM_FIELDS.map((f) => (
                <p key={f.key} className="text-[12.5px] leading-[1.7] text-[var(--color-text-primary)]">
                  <b className="font-semibold">{f.label}:</b> {f.good}
                </p>
              ))}
              <p className="pt-1 text-[11.5px] leading-[1.7] text-[var(--color-text-muted)]">
                🔑 오류 문구는 요약하지 말고 그대로 복사해 붙이세요. 요약하는 순간 진단에 필요한 단서(코드 400)가 사라집니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
