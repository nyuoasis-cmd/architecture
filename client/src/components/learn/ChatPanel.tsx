import { useEffect, useMemo, useRef, useState } from 'react';
import { sendChat, type ChatClientError, type ChatResponse } from '../../lib/chat-client';

type ChatPanelProps = {
  qaId: string;
  qaTitle: string;
};

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  cached?: boolean;
  blockedCount?: number;
  model?: string;
  upgradedToSonnet: boolean;
};

function createIntroMessage(qaTitle: string): ChatMessage {
  return {
    id: `intro-${qaTitle}`,
    role: 'assistant',
    text: `${qaTitle}에 대해 최대 4문장으로 풀어 설명해드릴게요. 시연을 먼저 보고 헷갈린 부분을 짧게 질문해보세요.`,
    upgradedToSonnet: false,
  };
}

export default function ChatPanel({ qaId, qaTitle }: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createIntroMessage(qaTitle)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [lastQuestion, setLastQuestion] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([createIntroMessage(qaTitle)]);
    setDraft('');
    setError(null);
    setRetryAfter(null);
    setLastQuestion('');
    setLoading(false);
  }, [qaId, qaTitle]);

  useEffect(() => {
    const host = scrollRef.current;
    if (!host) {
      return;
    }
    host.scrollTop = host.scrollHeight;
  }, [messages, loading]);

  const history = useMemo(
    () =>
      messages
        .filter((message) => !message.id.startsWith('intro-'))
        .slice(-6)
        .map((message) => ({
          role: message.role,
          content: message.text,
        })),
    [messages],
  );

  async function sendQuestion(question: string) {
    const nextQuestion = question.trim();
    if (!nextQuestion || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: nextQuestion,
      upgradedToSonnet: false,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft('');
    setError(null);
    setRetryAfter(null);
    setLastQuestion(nextQuestion);
    setLoading(true);

    try {
      const data: ChatResponse = await sendChat({
        qaId,
        question: nextQuestion,
        history,
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.answer ?? '답변을 받지 못했습니다.',
          cached: data.cached,
          blockedCount: data.blockedCount,
          model: data.model,
          upgradedToSonnet: data.upgradedToSonnet,
        },
      ]);
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
      const chatError = error as ChatClientError;
      setError(chatError.message);
      setRetryAfter(chatError.kind === 'rate_limited' ? (chatError.retryAfter ?? null) : null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex-shrink-0 border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-[13px] font-medium">AI 챗봇</h2>
        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          현재 문항 기준으로만 답합니다. 짧고 구체적으로 물어보면 더 정확합니다.
        </p>
      </header>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`${message.role === 'user' ? 'bubble-user' : 'bubble-bot'} max-w-[92%]`}
              style={
                message.role === 'user'
                  ? {
                      background: '#eef2ff',
                      color: 'var(--color-text-primary)',
                      border: '1px solid #c7d2fe',
                    }
                  : undefined
              }
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              {message.role === 'assistant' ? (
                <div
                  className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]"
                  style={{ color: 'var(--color-text-faint)' }}
                >
                  {message.cached ? <span>DB 캐시</span> : null}
                  {message.model ? <span>{message.model}</span> : null}
                  {message.blockedCount && message.blockedCount > 0 ? <span>표현 재생성 {message.blockedCount}회</span> : null}
                  {message.upgradedToSonnet ? <span>Sonnet 승급</span> : null}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {loading ? (
          <div className="flex justify-start">
            <div className="bubble-bot max-w-[92%]">
              <div
                aria-label="응답을 생성 중입니다"
                aria-live="polite"
                className="inline-flex items-center gap-1 text-[13px]"
                role="status"
              >
                <span>개념을 정리하고 있어요</span>
                <span className="inline-flex gap-1 text-[var(--color-accent)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && messages.length === 1 ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm" style={{ color: 'var(--color-text-faint)' }}>
            시연을 보고 막히는 부분을 질문해보세요.
          </div>
        ) : null}
      </div>

      <div className="flex-shrink-0 border-t border-[var(--color-border)] p-3">
        {error ? (
          <div
            aria-live="assertive"
            className="mb-2 rounded-[10px] px-3 py-2 text-[12px]"
            role="alert"
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: 'var(--color-danger)',
            }}
          >
            <p>{error}</p>
            {retryAfter ? <p className="mt-1">약 {retryAfter}초 뒤 다시 시도해주세요.</p> : null}
            {!loading && lastQuestion ? (
              <button
                className="mt-2 rounded-md px-2.5 py-1 text-[11px]"
                onClick={() => void sendQuestion(lastQuestion)}
                style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
                type="button"
              >
                다시 시도
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <textarea
            className="min-h-[56px] flex-1 resize-none rounded-[10px] border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] focus-visible:border-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2"
            disabled={loading}
            maxLength={280}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendQuestion(draft);
              }
            }}
            placeholder="예: 프로그램과 프로세스를 라면 끓이기에 비유해서 설명해줘"
            rows={2}
            value={draft}
          />
          <button
            className="w-full rounded-[10px] px-3 py-2 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 sm:w-auto"
            disabled={loading || draft.trim().length < 2}
            onClick={() => void sendQuestion(draft)}
            style={{
              background:
                loading || draft.trim().length < 2
                  ? 'var(--color-bg-input)'
                  : 'var(--color-accent)',
              color: loading || draft.trim().length < 2 ? 'var(--color-text-muted)' : '#fff',
              border: 'none',
              minHeight: '44px',
            }}
            type="button"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
