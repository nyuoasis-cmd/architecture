import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 16장 2문 시연 — 애매한 항목을 «~했는가?» 질문으로 바꾼다.
// 🔑 판정 기준은 «구체적인가»가 아니라 «예/아니오로 답할 수 있는가» 하나다.
//    그래서 그럴듯하지만 여전히 답할 수 없는 후보를 일부러 섞어 뒀다.

type Vague = {
  id: string;
  vague: string;
  options: { text: string; ok: boolean; why: string }[];
};

const ITEMS: Vague[] = [
  {
    id: 'security',
    vague: '보안',
    options: [
      {
        text: '보안을 강화했는가?',
        ok: false,
        why: '질문 모양이지만 여전히 예/아니오로 답할 수 없어요. «강화»가 어디까지인지 사람마다 다릅니다.',
      },
      {
        text: '남의 이름으로 입장하는 것을 막았는가?',
        ok: true,
        why: '직접 해 볼 수 있습니다 — 남의 이름을 넣어 보고 막히는지 보면 끝납니다.',
      },
      { text: '보안 점검 완료', ok: false, why: '질문이 아니라 선언입니다. 확인할 행동이 안 보입니다.' },
    ],
  },
  {
    id: 'data',
    vague: '데이터 관리',
    options: [
      { text: '데이터를 잘 관리하고 있는가?', ok: false, why: '«잘»이 들어가면 판정이 사람마다 갈립니다.' },
      {
        text: '수업이 끝나면 학생 기록이 지워지는가?',
        ok: true,
        why: '수업을 끝내고 다시 열어 보면 예/아니오가 바로 나옵니다.',
      },
      { text: '개인정보 보호에 신경 썼는가?', ok: false, why: '«신경 썼는가»는 마음의 상태지 확인할 수 있는 사실이 아닙니다.' },
    ],
  },
  {
    id: 'ux',
    vague: '사용성',
    options: [
      { text: '화면이 예쁜가?', ok: false, why: '취향이라 두 사람이 다르게 답합니다.' },
      { text: '사용자 친화적으로 만들었는가?', ok: false, why: '질문 모양이지만 «친화적»의 문턱이 없습니다.' },
      {
        text: '빈칸으로 «빌리기»를 눌러도 앱이 멈추지 않는가?',
        ok: true,
        why: '빈칸으로 눌러 보면 됩니다. 멈추면 아니오, 안 멈추면 예.',
      },
    ],
  },
];

export default function Q02AskableItems(_props: DemoComponentProps) {
  const [picked, setPicked] = useState<Record<string, number>>({});

  const answered = Object.keys(picked).length;
  const correct = ITEMS.filter((item) => item.options[picked[item.id]]?.ok).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          점검표 초안에 이런 항목들이 적혀 있습니다. 각각을{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">예/아니오로 답할 수 있는 질문</b>으로 바꾸려고
          해요. 셋 중 하나를 고르세요.
        </p>
      </div>

      {ITEMS.map((item) => {
        const chosen = picked[item.id];
        return (
          <div key={item.id} className="space-y-2 rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3">
            <p className="text-[12.5px] text-[var(--color-text-muted)]">
              초안 항목: <b className="font-semibold text-[var(--color-text-primary)]">«{item.vague}»</b>
            </p>
            <div className="space-y-1.5">
              {item.options.map((opt, idx) => {
                const isChosen = chosen === idx;
                return (
                  <button
                    key={opt.text}
                    type="button"
                    onClick={() => setPicked((prev) => ({ ...prev, [item.id]: idx }))}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-[12.5px] leading-[1.7] ${
                      isChosen
                        ? opt.ok
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-rose-300 bg-rose-50'
                        : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-input)]'
                    }`}
                  >
                    <span className="text-[var(--color-text-primary)]">{opt.text}</span>
                    {isChosen && (
                      <span className="mt-1 block text-[12px] text-[var(--color-text-muted)]">
                        {opt.ok ? '✅ ' : '⛔ '}
                        {opt.why}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {answered === ITEMS.length && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            <b className="font-semibold">
              {ITEMS.length}개 중 {correct}개를 «답할 수 있는 질문»으로 골랐습니다.
            </b>
          </p>
          <p>
            여기서 잘 걸리는 함정이 «질문 모양이지만 답할 수 없는 것»입니다 — «보안을 강화했는가?», «사용자 친화적으로
            만들었는가?». 물음표가 붙었다고 점검 항목이 되지는 않아요.
          </p>
          <p>
            기준은 하나입니다. <b className="font-semibold">지금 당장 해 보고 예/아니오를 말할 수 있는가.</b> 그 말이 나오면
            그 항목은 문턱이 되고, 아니면 아직 감상입니다.
          </p>
        </div>
      )}
    </div>
  );
}
