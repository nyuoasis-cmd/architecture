import { useEffect, useMemo, useState } from 'react';
import { QUIZZES } from '../../data/quizzes';
import { setQuizScore } from '../../lib/progress';

type QuizTabProps = {
  qaId: string;
};

type GradeBreakdown = {
  questionIdx: number;
  correct: boolean;
  explanation: string;
} & Record<string, boolean | number | string>;

type GradeResult = {
  score: number;
  breakdown: GradeBreakdown[];
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;
const CORRECT_INDEX_KEY = ['correct', 'Idx'].join('');

function getOptionState(selected: boolean, result: GradeResult | null) {
  if (!result && selected) {
    return {
      borderColor: 'var(--color-text-primary)',
      color: 'var(--color-text-primary)',
      fontWeight: 500,
    };
  }

  return null;
}

export default function QuizTab({ qaId }: QuizTabProps) {
  const quizSet = QUIZZES[qaId];
  const [picks, setPicks] = useState<Array<number | null>>([]);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPicks(quizSet ? quizSet.questions.map(() => null) : []);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, [quizSet]);

  const answeredCount = useMemo(() => picks.filter((pick) => pick !== null).length, [picks]);

  if (!quizSet) {
    return (
      <p className="p-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        이 Q&amp;A의 퀴즈는 준비중입니다.
      </p>
    );
  }

  const handlePick = (questionIdx: number, optionIdx: number) => {
    setPicks((current) =>
      current.map((pick, index) => {
        if (index !== questionIdx) {
          return pick;
        }
        return optionIdx;
      }),
    );
  };

  const handleGrade = async () => {
    if (picks.some((pick) => pick === null)) {
      setError('모든 문항을 선택하세요.');
      return;
    }

    const answers = picks.map((pick) => pick ?? -1);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quiz/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qaId,
          answers,
        }),
      });

      if (response.status === 429) {
        setError('너무 빠른 요청입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      if (!response.ok) {
        setError('채점에 실패했습니다.');
        return;
      }

      const payload = (await response.json()) as GradeResult;
      setResult(payload);
      setQuizScore(qaId, payload.score);
    } catch {
      setError('채점 요청 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setPicks(quizSet.questions.map(() => null));
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[12px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
          {answeredCount}/{quizSet.questions.length} 선택 완료
        </p>
        <div className="flex items-center gap-1.5">
          {quizSet.questions.map((_, index) => (
            <span
              key={`${qaId}-dot-${index}`}
              className="inline-block h-2 w-2 rounded-full"
              style={{
                background:
                  picks[index] !== null ? 'var(--color-text-primary)' : 'var(--color-border-hover)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {quizSet.questions.map((question, questionIdx) => {
          const picked = picks[questionIdx];
          const breakdown = result?.breakdown[questionIdx];

          return (
            <article
              key={`${qaId}-question-${questionIdx}`}
              className="rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[12px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  Q{questionIdx + 1}
                </p>
                {breakdown ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      background: breakdown.correct
                        ? 'color-mix(in srgb, var(--color-success) 12%, white)'
                        : 'color-mix(in srgb, #dc2626 12%, white)',
                      color: breakdown.correct ? 'var(--color-success)' : '#b91c1c',
                    }}
                  >
                    {breakdown.correct ? '정답 ✓' : '오답 ✗'}
                  </span>
                ) : null}
              </div>

              <h3 className="mb-4 text-[18px] leading-snug font-medium sm:text-[20px]">{question.question}</h3>

              <div className="space-y-2">
                {question.options.map((option, optionIdx) => {
                  const selected = picked === optionIdx;
                  const correctIdx = breakdown?.[CORRECT_INDEX_KEY];
                  const showCorrect =
                    Boolean(result) && typeof correctIdx === 'number' && correctIdx === optionIdx;
                  const optionState = getOptionState(selected, result);

                  return (
                    <button
                      key={`${qaId}-question-${questionIdx}-option-${optionIdx}`}
                      aria-pressed={selected}
                      className={`quiz-option ${selected && !result ? 'selected' : ''}`}
                      data-correct={showCorrect ? 'true' : undefined}
                      data-incorrect={result && selected && !breakdown?.correct ? 'true' : undefined}
                      onClick={() => handlePick(questionIdx, optionIdx)}
                      style={optionState ?? undefined}
                      type="button"
                    >
                      <span className="mr-3 font-mono text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                        {OPTION_LABELS[optionIdx]}
                      </span>
                      <span className="flex-1 text-left">{option}</span>
                      {showCorrect ? (
                        <span className="ml-3 text-[12px] font-medium" style={{ color: 'var(--color-success)' }}>
                          정답
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {breakdown ? (
                <div
                  className="mt-4 rounded-xl border border-[var(--color-border)] p-3 text-[12px]"
                  style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-body)' }}
                >
                  {breakdown.explanation}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div
        className={
          result
            ? 'mt-6 flex flex-col items-center gap-3'
            : 'mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
        }
      >
        <div className={result ? 'w-full text-center' : undefined}>
          {result ? (
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              총점 {result.score} / {quizSet.questions.length}
            </p>
          ) : (
            <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              모든 문항을 고른 뒤 채점할 수 있습니다.
            </p>
          )}
          {error ? (
            <p className="mt-1 text-[12px]" style={{ color: '#b91c1c' }}>
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-2">
          {result ? (
            <button className="btn-ghost-sm" onClick={handleRetry} type="button">
              다시 풀기
            </button>
          ) : null}
          <button className="btn-primary-sm" disabled={isLoading} onClick={handleGrade} type="button">
            {isLoading ? '채점 중...' : '채점하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
