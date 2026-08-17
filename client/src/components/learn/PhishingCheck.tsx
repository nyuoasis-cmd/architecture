import { useState } from 'react';
import { PHISHING_CARDS, PHISHING_SITE_NAME, type PhishingCard } from '../../data/phishing-check';

/**
 * «진짜/가짜 로그인 화면 판별» — 22강 q3 미니 체험 (SDD 결정 20, 유사 페이지 대본형).
 *
 * 🚨 오답은 반드시 «해부»를 보여 준다 — 왜 가짜인지 못 보면 찍기 게임이 된다.
 * 🚨 로그인 칸은 그림일 뿐이다 — 입력을 받지 않는다(진짜 자격증명을 받는 화면을 만들지 않는다).
 * 🔑 판별 재료는 주소창 하나다. «주소를 읽는 눈»이 이 체험의 산출물이다.
 */
export default function PhishingCheck() {
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [foundReal, setFoundReal] = useState(false);

  const pick = (card: PhishingCard) => {
    setPicked((prev) => ({ ...prev, [card.id]: true }));
    if (card.real) setFoundReal(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-4 px-4 py-5 lg:px-6">
      <div className="flex items-start gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-[13.5px] text-indigo-900">
        <span className="text-[17px]">🧭</span>
        <div>
          <b>지금 하는 일</b> — 여섯 개의 로그인 화면 중 <b>진짜는 하나</b>뿐이에요. 화면이 아니라{' '}
          <b>주소창</b>을 읽고 골라 보세요. 틀려도 괜찮아요 — 어디가 이상했는지 바로 보여 드려요.
        </div>
      </div>

      {foundReal ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-900">
          ✓ 찾았어요! 진짜와 가짜를 가른 건 화면이 아니라 <b>주소</b>였어요 — 화면은 누구나 똑같이 베낄 수
          있거든요. 아직 안 누른 카드도 눌러서 «어디가 이상한지» 해부를 구경해 보세요.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {PHISHING_CARDS.map((card) => {
          const isPicked = Boolean(picked[card.id]);
          return (
            <button
              key={card.id}
              className={`rounded-xl border p-0 text-left transition ${
                isPicked
                  ? card.real
                    ? 'border-emerald-300 bg-emerald-50/60'
                    : 'border-rose-300 bg-rose-50/50'
                  : 'border-[var(--color-border)] bg-white hover:border-stone-400'
              }`}
              onClick={() => pick(card)}
              type="button"
            >
              {/* 주소창 — 판별 재료의 전부 */}
              <div className="flex items-center gap-1.5 rounded-t-xl border-b border-[var(--color-border)] bg-stone-100 px-3 py-2">
                <span aria-hidden className="text-[12px]">
                  {card.https ? '🔒' : '⚠️'}
                </span>
                <span className="truncate font-mono text-[11.5px] text-stone-700">{card.url}</span>
              </div>
              {/* 로그인 화면 그림 — 🚨 입력받지 않는다 */}
              <div className="px-4 py-3">
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{PHISHING_SITE_NAME}</p>
                <div className="mt-2 space-y-1.5" aria-hidden>
                  <div className="h-7 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 text-[11px] leading-7 text-[var(--color-text-faint)]">
                    아이디
                  </div>
                  <div className="h-7 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 text-[11px] leading-7 text-[var(--color-text-faint)]">
                    비밀번호
                  </div>
                  <div className="h-7 rounded-md bg-stone-800 text-center text-[11.5px] font-semibold leading-7 text-white">
                    로그인
                  </div>
                </div>

                {/* 해부 씬 — 오답이면 반드시, 정답이면 확인 문구 */}
                {isPicked ? (
                  card.real ? (
                    <p className="mt-2.5 text-[12.5px] font-semibold text-emerald-700">
                      ✓ 진짜예요 — 자물쇠(https)가 있고, 주소의 성이 school.kr 그대로예요.
                    </p>
                  ) : (
                    <div className="mt-2.5 rounded-lg border border-rose-200 bg-white px-3 py-2">
                      <p className="text-[12px] font-bold text-rose-700">🔍 해부 — 어디가 이상했나</p>
                      {card.tells.map((tell, index) => (
                        <p key={index} className="mt-1 text-[12.5px] leading-[1.7] text-[var(--color-text-body)]">
                          {tell}
                        </p>
                      ))}
                    </div>
                  )
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[12px] text-[var(--color-text-muted)]">
        이 화면들은 전부 연습용 그림이에요 — 아이디·비밀번호를 실제로 입력받지 않아요. 소재도 가상의
        서비스(알림장)라 실존 사이트가 아니에요.
      </p>
    </div>
  );
}
