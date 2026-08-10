import { useState } from 'react';
import type { DemoComponentProps } from '../types';
import { VIBE_PREGEN_CH16 } from '../../data/vibe-pregen-ch16';
import PregenBlock from '../ch13/PregenBlock';

// 16장 4문 시연 — 실제 실행 3단.
//  ① 없는 책을 «물어보면» 모른다고 한다 → ② 같은 책을 «만들라고 시키면» 지어낸다
//  → ③ 같은 질문 3회의 답이 서로 다르다(= 지어냄의 결정적 증거, 판별법 = 두 번 물어보기)
// 🔑 학생이 ③에서 직접 «다른 곳»을 찾아내게 한다. 우리가 먼저 정답을 말하지 않는다.

const asked = VIBE_PREGEN_CH16['ch16_q04_asked'];
const told = VIBE_PREGEN_CH16['ch16_q04_told'];
const schools = ['ch16_q04_school1', 'ch16_q04_school2', 'ch16_q04_school3'].map((k) => VIBE_PREGEN_CH16[k]);

export default function Q04WhenItInvents(_props: DemoComponentProps) {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          세상에 없는 책 <b className="font-semibold text-[var(--color-text-primary)]">『초록 고래의 마지막 여름』</b>으로
          실제로 세 번 실험했습니다. 하나씩 열어 보세요.
        </p>
      </div>

      {/* ① 물어보기 */}
      <div className="rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3">
        <p className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">
          ① 물어봤을 때 — "이 책 소개해 줘"
        </p>
        {step >= 1 ? (
          <div className="mt-2">
            <PregenBlock text={asked.text} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-2 rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]"
          >
            AI 답 보기
          </button>
        )}
      </div>

      {/* ② 만들라고 시키기 */}
      {step >= 1 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3">
          <p className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">
            ② 만들라고 시켰을 때 — "이 책 독후감 예시를 써 줘"
          </p>
          {step >= 2 ? (
            <div className="mt-2">
              <PregenBlock text={told.text} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-2 rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]"
            >
              AI 답 보기
            </button>
          )}
        </div>
      )}

      {step >= 2 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          같은 AI, 같은 없는 책입니다. <b className="font-semibold">물었을 때는 모른다고 했고, 만들라고 시키자
          만들었습니다.</b> "~를 아느냐"에는 모른다고 답할 자리가 있지만, "~를 써 달라"에는 그 자리가 없습니다.
        </div>
      )}

      {/* ③ 같은 질문 3회 */}
      {step >= 2 && (
        <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3">
          <p className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">
            ③ 없는 학교의 도서관 규칙을 세 번 물었을 때
          </p>
          {step >= 3 ? (
            <>
              <p className="text-[12px] text-[var(--color-text-muted)]">
                세 답을 훑으면서 <b className="font-semibold">서로 다른 숫자</b>를 찾아보세요.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {schools.map((s, i) => (
                  <div key={i} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2.5">
                    <p className="mb-1.5 text-[11.5px] font-semibold text-[var(--color-text-muted)]">{i + 1}번째 실행</p>
                    <PregenBlock text={s.text} />
                  </div>
                ))}
              </div>
              {revealed ? (
                <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-3 text-[12.5px] leading-[1.8] text-amber-900">
                  <p>
                    <b className="font-semibold">빌릴 수 있는 권수</b> — 3권 / 3권 / 저학년 2권·고학년 3권.
                    <br />
                    <b className="font-semibold">연체 처리</b> — 연체일수만큼 대출 금지 / 1일 100원 / 1일 100원.
                  </p>
                  <p>
                    진짜 규칙이었다면 세 번 다 같았을 것입니다.{' '}
                    <b className="font-semibold">답이 흔들린다는 것은 기억을 꺼낸 게 아니라 그 자리에서 만들었다는
                    뜻</b>입니다. 세 답 모두 말투는 자신 있고 형식도 깔끔합니다 — 말투로는 절대 구분할 수 없어요.
                  </p>
                  <p>
                    그래서 확인법은 도구도 지식도 필요 없습니다. <b className="font-semibold">같은 것을 두 번 물어본다.</b>{' '}
                    흔들리면 그대로 쓰지 않습니다.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[12.5px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
                >
                  🔍 어디가 달랐는지 확인하기
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]"
            >
              세 번의 답 나란히 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
