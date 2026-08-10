import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 12장 7문 시연 — 성공 기준으로 쓸 수 있는 문장 골라내기.
// 🔑 판정 기준은 «좋은 말인가»가 아니라 «실패할 수도 있는가»다.
//    고칠 수 있는 문장은 고친 예시(fix)를 함께 보여 준다 — 버리는 게 아니라 숫자로 바꾸는 것이 목표.

type Sentence = {
  id: string;
  text: string;
  ok: boolean;
  why: string;
  fix?: string;
};

const SENTENCES: Sentence[] = [
  {
    id: 's1',
    text: '우리 반 20명이 각자 책을 한 권씩 빌리는 데 성공한다',
    ok: true,
    why: '20명을 실제로 시켜 보면 된다. 19명만 되면 실패라고 말할 수 있다',
  },
  {
    id: 's2',
    text: '앱이 편하고 쉽다',
    ok: false,
    why: '«편하다»를 누가 어떻게 판정하지? 어떤 결과가 나와도 성공이라 우길 수 있다',
    fix: '→ "처음 쓰는 학생이 설명 없이 3분 안에 책을 빌린다"',
  },
  {
    id: 's3',
    text: '일주일 동안 사라진 책이 0권이다',
    ok: true,
    why: '일주일 뒤에 세어 보면 된다. 문제(책이 사라진다)를 정면으로 겨눈 기준',
  },
  {
    id: 's4',
    text: '기능을 다 만든다',
    ok: false,
    why: '이건 «완료» 기준이지 «성공» 기준이 아니다. 기능이 다 있어도 책이 계속 사라질 수 있다',
    fix: '→ "만든 뒤 일주일간 분실 0권" 처럼 «그래서 문제가 풀렸는가»로 바꾼다',
  },
  {
    id: 's5',
    text: '친구들이 재밌어한다',
    ok: false,
    why: '몇 명이 얼마나 재밌어해야 성공인지 없다. 물어본 사람에 따라 답이 달라진다',
    fix: '→ "수업 뒤 설문에서 20명 중 15명 이상이 «또 쓰고 싶다»를 고른다"',
  },
  {
    id: 's6',
    text: '수업 한 차시(45분) 안에 모두가 앱을 다 쓴다',
    ok: true,
    why: '시계를 보면 된다. 46분이 걸리면 실패라고 말할 수 있다',
  },
];

export default function Q07Measurable(_props: DemoComponentProps) {
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [graded, setGraded] = useState(false);

  const allMarked = Object.keys(marked).length === SENTENCES.length;
  const hits = SENTENCES.filter((s) => marked[s.id] === s.ok).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          여섯 문장 중 성공 기준으로 쓸 수 있는 것을 골라 보세요. 기준은 하나입니다 —{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">
            누가 읽어도 됐다/안 됐다를 똑같이 판정할 수 있는가.
          </b>
        </p>
      </div>

      <div className="space-y-2">
        {SENTENCES.map((sentence) => {
          const choice = marked[sentence.id];
          const isRight = graded && choice === sentence.ok;
          const isWrong = graded && choice !== undefined && choice !== sentence.ok;
          return (
            <div
              key={sentence.id}
              className={`rounded-lg border px-3.5 py-2.5 ${
                isRight
                  ? 'border-emerald-200 bg-emerald-50'
                  : isWrong
                    ? 'border-rose-200 bg-rose-50'
                    : 'border-[var(--color-border)] bg-white'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] text-[var(--color-text-primary)]">"{sentence.text}"</p>
                <div className="flex gap-1.5">
                  <button
                    className={`rounded-md border px-2.5 py-1 text-[12px] font-medium ${
                      choice === true
                        ? 'border-[#2d4a3e] bg-[#C9E0D4] text-[#2d4a3e]'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]'
                    }`}
                    onClick={() => setMarked((prev) => ({ ...prev, [sentence.id]: true }))}
                    type="button"
                  >
                    검사 가능
                  </button>
                  <button
                    className={`rounded-md border px-2.5 py-1 text-[12px] font-medium ${
                      choice === false
                        ? 'border-rose-300 bg-rose-100 text-rose-800'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]'
                    }`}
                    onClick={() => setMarked((prev) => ({ ...prev, [sentence.id]: false }))}
                    type="button"
                  >
                    애매함
                  </button>
                </div>
              </div>
              {graded ? (
                <p className="mt-1.5 text-[12px] leading-[1.7] text-[var(--color-text-muted)]">
                  {sentence.ok ? '✓ 검사 가능' : '✗ 애매함'} · {sentence.why}
                  {sentence.fix ? (
                    <>
                      <br />
                      <span className="text-emerald-700">{sentence.fix}</span>
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {graded ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-[12.5px] leading-[1.8] text-amber-900">
            {hits}/{SENTENCES.length} 일치. ✓가 붙은 세 문장의 공통점은{' '}
            <b className="font-semibold">실패할 수도 있다</b>는 것입니다. 애매한 문장들도 버릴 필요는 없어요 — "그걸
            어떻게 알아보지?"라고 되물어 숫자를 넣으면 검사 가능한 문장이 됩니다. 이 두 줄을 한 장 문서의 마지막 칸에
            적어 두세요. 앱의 진짜 시험지는 그 두 줄입니다.
          </p>
        </div>
      ) : (
        <button
          className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)] disabled:opacity-45"
          disabled={!allMarked}
          onClick={() => setGraded(true)}
          type="button"
        >
          {allMarked ? '🔍 판정 보기' : `아직 ${SENTENCES.length - Object.keys(marked).length}개 남았어요`}
        </button>
      )}
    </div>
  );
}
