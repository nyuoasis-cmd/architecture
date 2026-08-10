import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 15장 4문 시연 — 규칙을 하나씩 일부러 부수고, 검사가 우는지 본다(경보기의 시험 버튼).
// 🔑 세 규칙 중 하나는 부숴도 검사가 계속 초록이다. 그 검사는 그 규칙을 «보고 있지 않았다».
//    학생이 스스로 부숴 보기 전까지는 셋 다 똑같이 «통과»로 보인다는 것이 이 데모의 요점이다.

type Rule = {
  id: string;
  label: string;
  broken: string;
  /** 이 규칙을 부쉈을 때 검사가 빨간불을 내는가 */
  caught: boolean;
  note: string;
};

const RULES: Rule[] = [
  {
    id: 'onebook',
    label: '한 사람이 동시에 1권까지',
    broken: '2권까지 되게 바꿈',
    caught: true,
    note: '검사가 두 권째를 실제로 눌러 보고 있었어요. 좋은 검사입니다.',
  },
  {
    id: 'taken',
    label: '남이 빌려간 책은 못 빌린다',
    broken: '누구나 빌릴 수 있게 바꿈',
    caught: false,
    note: '검사는 여전히 초록입니다. 이 검사는 «빌리기 버튼이 화면에 있는지»만 보고 있었어요 — 규칙은 한 번도 확인한 적이 없습니다.',
  },
  {
    id: 'name',
    label: '빌린 사람 이름이 남는다',
    broken: '이름을 저장하지 않게 바꿈',
    caught: true,
    note: '검사가 빌린 뒤 현황에 이름이 있는지 확인하고 있었습니다.',
  },
];

export default function Q04BreakIt(_props: DemoComponentProps) {
  const [brokenId, setBrokenId] = useState<string | null>(null);
  const [tried, setTried] = useState<string[]>([]);

  const broken = RULES.find((r) => r.id === brokenId) ?? null;
  const allTried = tried.length === RULES.length;

  const breakRule = (id: string) => {
    setBrokenId(id);
    setTried((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          앱에 규칙 3개가 들어 있고, 검사는 지금 <b className="font-semibold text-emerald-700">전부 초록불</b>입니다. 이제
          규칙을 <b className="font-semibold text-[var(--color-text-primary)]">하나씩 일부러 부숴</b> 보세요. 좋은 검사라면
          울어야 합니다. (셋 다 눌러 보세요 — 한 번에 하나씩.)
        </p>
      </div>

      <div className="space-y-2">
        {RULES.map((rule) => (
          <div
            key={rule.id}
            className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 ${
              brokenId === rule.id ? 'border-amber-300 bg-amber-50' : 'border-[var(--color-border)] bg-white'
            }`}
          >
            <p className="text-[12.5px] text-[var(--color-text-primary)]">
              {rule.label}
              {brokenId === rule.id && (
                <span className="ml-2 text-[11.5px] text-amber-800">← 지금 «{rule.broken}» 상태</span>
              )}
              {brokenId !== rule.id && tried.includes(rule.id) && (
                <span className="ml-2 text-[11.5px] text-[var(--color-text-muted)]">(부숴 봄)</span>
              )}
            </p>
            <button
              type="button"
              onClick={() => breakRule(rule.id)}
              className="shrink-0 rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]"
            >
              🔨 부수기
            </button>
          </div>
        ))}
      </div>

      <div
        className={`rounded-xl border px-4 py-3 ${
          broken === null
            ? 'border-emerald-300 bg-emerald-50'
            : broken.caught
              ? 'border-rose-300 bg-rose-50'
              : 'border-emerald-300 bg-emerald-50'
        }`}
      >
        <p className="text-[13px] font-semibold">
          {broken === null ? (
            <span className="text-emerald-800">검사 결과: ✅ 전부 통과</span>
          ) : broken.caught ? (
            <span className="text-rose-800">검사 결과: 🔴 빨간불 — «{broken.label}» 위반</span>
          ) : (
            <span className="text-emerald-800">검사 결과: ✅ 전부 통과 (규칙을 부쉈는데도?)</span>
          )}
        </p>
        {broken && <p className="mt-1.5 text-[12.5px] leading-[1.75] text-[var(--color-text-muted)]">{broken.note}</p>}
      </div>

      {allTried && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            <b className="font-semibold">규칙 3개 중 2개만 실제로 감시받고 있었습니다.</b> 부수기 전에는 초록불 하나였고,
            셋 다 지켜지는 것처럼 보였어요.
          </p>
          <p>
            «남이 빌려간 책» 검사는 <b className="font-semibold">한 번도 빨간불을 낼 수 없는 검사</b>였습니다. 실패할 수
            없는 검사의 초록불은 정보가 0입니다 — 조용한 화재경보기와 같아요.
          </p>
          <p>
            그래서 순서가 이렇게 됩니다. ① 검사를 만든다 → ② <b className="font-semibold">일부러 부숴서 우는지 본다</b> →
            ③ 원래대로 되돌린다. ②를 건너뛴 검사는 아직 검사가 아니라 장식입니다.
          </p>
        </div>
      )}
    </div>
  );
}
