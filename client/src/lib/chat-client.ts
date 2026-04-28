export type ChatMessagePayload = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatResponse = {
  answer: string;
  cached: boolean;
  model: string;
  blockedCount: number;
  upgradedToSonnet: boolean;
  fallback?: 'cache_only';
};

export type ChatClientError =
  | { kind: 'rate_limited'; message: string; retryAfter?: number }
  | { kind: 'network'; message: string }
  | { kind: 'server'; message: string }
  | { kind: 'budget'; message: string };

export async function sendChat(input: {
  qaId: string;
  question: string;
  history: ChatMessagePayload[];
}): Promise<ChatResponse> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    const body = (await response.json()) as Partial<ChatResponse> & {
      error?: string;
      message?: string;
      retryAfter?: number;
    };

    if (!response.ok) {
      if (response.status === 429) {
        throw {
          kind: 'rate_limited',
          message: body.message ?? '잠시 후 다시 시도해주세요.',
          retryAfter: body.retryAfter,
        } satisfies ChatClientError;
      }

      if (body.error === 'budget_cache_only' || body.error === 'budget_exceeded') {
        throw {
          kind: 'budget',
          message: body.message ?? '챗봇이 일시 비활성화되었습니다.',
        } satisfies ChatClientError;
      }

      throw {
        kind: 'server',
        message: body.message ?? '답변을 불러오지 못했습니다.',
      } satisfies ChatClientError;
    }

    return {
      answer: body.answer ?? '',
      cached: body.cached ?? false,
      model: body.model ?? 'unknown',
      blockedCount: body.blockedCount ?? 0,
      upgradedToSonnet: body.upgradedToSonnet ?? false,
      fallback: body.fallback,
    };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'kind' in error) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw { kind: 'network', message: '응답이 12초 안에 오지 않아 요청을 종료했습니다.' } satisfies ChatClientError;
    }

    throw { kind: 'network', message: '네트워크 연결을 확인한 뒤 다시 시도해주세요.' } satisfies ChatClientError;
  } finally {
    window.clearTimeout(timer);
  }
}
