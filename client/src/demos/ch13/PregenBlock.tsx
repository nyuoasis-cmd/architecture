import type { ReactNode } from 'react';

// 사전 생성 재료(vibe-pregen-ch13.ts)의 원문을 그대로 보여 주는 뷰어.
// AI 출력 마크다운의 최소 표기(#, ##, -, **굵게**, ---)만 다듬고,
// [내가 정함]/[부탁문] 태그는 색 칩으로 강조한다 — 원문 텍스트는 편집하지 않는다.

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tagSplit = text.split(/(\[내가 정함\]|\[부탁문\])/);
  tagSplit.forEach((part, tagIdx) => {
    if (part === '[내가 정함]') {
      nodes.push(
        <span
          key={`${keyPrefix}-tag-${tagIdx}`}
          className="mx-0.5 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10.5px] font-bold text-rose-700"
        >
          내가 정함
        </span>,
      );
      return;
    }
    if (part === '[부탁문]') {
      nodes.push(
        <span
          key={`${keyPrefix}-tag-${tagIdx}`}
          className="mx-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700"
        >
          부탁문
        </span>,
      );
      return;
    }
    part.split(/(\*\*[^*]+\*\*)/).forEach((chunk, boldIdx) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        nodes.push(
          <b key={`${keyPrefix}-b-${tagIdx}-${boldIdx}`} className="font-semibold text-[var(--color-text-primary)]">
            {chunk.slice(2, -2)}
          </b>,
        );
      } else if (chunk) {
        nodes.push(chunk);
      }
    });
  });
  return nodes;
}

export default function PregenBlock({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1 text-[12.5px] leading-[1.75] text-[var(--color-text-body)]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }
        if (trimmed === '---') {
          return <hr key={idx} className="border-[var(--color-border)]" />;
        }
        if (trimmed.startsWith('## ')) {
          return (
            <p key={idx} className="pt-1.5 text-[13px] font-semibold text-[var(--color-text-primary)]">
              {renderInline(trimmed.slice(3), `l${idx}`)}
            </p>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <p key={idx} className="text-[14px] font-bold text-[var(--color-text-primary)]">
              {renderInline(trimmed.slice(2), `l${idx}`)}
            </p>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <p key={idx} className="pl-3">
              {renderInline(trimmed, `l${idx}`)}
            </p>
          );
        }
        if (trimmed.startsWith('- ')) {
          return (
            <p key={idx} className="pl-3">
              · {renderInline(trimmed.slice(2), `l${idx}`)}
            </p>
          );
        }
        return <p key={idx}>{renderInline(trimmed, `l${idx}`)}</p>;
      })}
    </div>
  );
}
