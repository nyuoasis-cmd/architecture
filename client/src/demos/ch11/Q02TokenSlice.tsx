import { useMemo } from 'react';
import type { DemoComponentProps } from '../types';

// 11장 2문 시연 — 문장이 조각으로 잘려 들어간다는 «감각»을 만드는 시늉 도구.
// 🚨 진짜 토크나이저가 아니다. 실제 모델의 조각 나누기는 이보다 복잡하고 규칙도 다르다.
//    화면에도 «대략»이라고 밝혀 적는다 — 학생이 정확한 수치로 오해하면 안 된다.

type Sample = { label: string; text: string; lesson: string };

const SAMPLES: Record<string, Sample> = {
  short: {
    label: '짧은 부탁문',
    text: '급식 투표 앱 만들어줘',
    lesson: '짧으면 조각도 적습니다. 그런데 조각이 적다는 건 AI가 받은 정보도 적다는 뜻입니다.',
  },
  padded: {
    label: '길기만 한 부탁문',
    text: '안녕하세요 혹시 괜찮으시다면 저희 반에서 쓸 수 있는 급식 투표 앱을 한번 만들어 주실 수 있을까요 정말 감사합니다',
    lesson:
      '앞의 것과 부탁 내용은 똑같은데 조각만 늘었습니다. 인사와 공손한 표현은 조각을 쓰지만 앱을 바꾸지는 않습니다 — 늘어난 만큼 요금도 늘어납니다.',
  },
  specific: {
    label: '규칙을 적은 부탁문',
    text: '급식 투표 앱 만들어줘 한 명이 하루 한 번만 투표 투표는 금요일 정오에 마감 결과는 마감 뒤 공개',
    lesson:
      '이것도 길지만 늘어난 조각이 전부 «규칙»입니다. 같은 길이라도 이런 지출은 아깝지 않습니다 — AI가 대신 정할 칸이 그만큼 줄어드니까요.',
  },
};

/** 한글은 1~2글자, 그 외는 덩어리 단위로 «대략» 잘라 보이는 시늉 규칙. 실제 토크나이저와 다르다. */
function sliceApprox(text: string): string[] {
  const chunks: string[] = [];
  for (const word of text.trim().split(/\s+/)) {
    if (/^[가-힣]+$/.test(word)) {
      for (let i = 0; i < word.length; i += 2) chunks.push(word.slice(i, i + 2));
    } else {
      chunks.push(word);
    }
  }
  return chunks;
}

export default function Q02TokenSlice({ scenarioId }: DemoComponentProps) {
  const sample = SAMPLES[scenarioId] ?? SAMPLES.short!;
  const chunks = useMemo(() => sliceApprox(sample.text), [sample.text]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">{sample.label}</p>
        <p className="mt-1 text-[13px] leading-[1.8] text-[var(--color-text-body)]">{sample.text}</p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-4 shadow-sm">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">
            AI가 받아 읽는 모습 (대략)
          </p>
          <p className="text-[12px] font-bold tabular-nums text-[var(--color-text-primary)]">약 {chunks.length}조각</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chunks.map((chunk, idx) => (
            <span
              key={`${chunk}-${idx}`}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-1 font-mono text-[12px] text-[var(--color-text-body)]"
            >
              {chunk}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">{sample.lesson}</p>

      <p className="text-[10.5px] leading-[1.7] text-[var(--color-text-faint)]">
        ※ 이 화면의 조각 나누기는 «이런 식으로 잘린다»는 감각을 위한 시늉입니다. 실제 AI가 쓰는 조각 나누기 규칙은
        이보다 복잡해서 개수가 다릅니다 — 숫자 자체를 외우지 마세요.
      </p>
    </div>
  );
}
