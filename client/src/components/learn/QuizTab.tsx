export default function QuizTab() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[12px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
          Q1 · 3문항 중 1번째
        </p>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--color-text-primary)' }} />
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--color-border-hover)' }} />
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--color-border-hover)' }} />
        </div>
      </div>

      <p className="mb-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-faint)' }}>
        퀴즈는 PR #4B에서 연결됩니다
      </p>
      <h3 className="mb-6 text-[18px] leading-snug font-medium sm:text-[20px]">
        카톡을 켰더니 메모리에 올라가서 실행 중입니다. 이 상태를 가리키는 단어는 무엇일까요?
      </h3>

      <div className="space-y-2">
        {[
          ['A', '프로그램'],
          ['B', '프로세스'],
          ['C', '프로세서'],
          ['D', '디스크'],
        ].map(([label, text], index) => (
          <button key={label} className={`quiz-option ${index === 1 ? 'selected' : ''}`} type="button">
            <span className="mr-3 font-mono text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              {label}
            </span>
            {text}
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          더미 문항만 렌더링합니다. 채점과 해설은 PR #4B에서 연결됩니다.
        </p>
        <button className="btn-primary-sm" disabled type="button">
          제출
        </button>
      </div>
    </div>
  );
}
