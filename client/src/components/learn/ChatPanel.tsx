export default function ChatPanel() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex-shrink-0 border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-[13px] font-medium">AI 챗봇</h2>
        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          PR #5에서 연결됩니다
        </p>
      </header>

      <div className="scrollbar-hide flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="bubble-bot max-w-[90%]">
          옆 패널의 시연을 먼저 보고, 부족한 부분은 PR #5에서 챗봇으로 질문할 수 있게 됩니다.
        </div>
        <div className="flex flex-1 items-center justify-center text-sm" style={{ color: 'var(--color-text-faint)' }}>
          AI 답변 준비중
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-[var(--color-border)] p-3">
        <textarea
          className="w-full resize-none rounded-[10px] bg-stone-100 px-3 py-2 text-[13px] cursor-not-allowed"
          disabled
          placeholder="AI 챗봇 준비중..."
          rows={2}
        />
      </div>
    </div>
  );
}
