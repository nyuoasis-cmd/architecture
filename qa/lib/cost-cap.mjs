// real-flow-qa — cost-cap (architecture Layer B).
//
// architecture Layer B 는 LLM 호출이 없다(학생 흐름 = join + progress).
//   채팅(Anthropic NPC)은 세션무관 전역 Q&A + 단일 egress IP 동시 채팅 비현실적이라 Layer B 제외.
//   → 실제 비용 = $0. cost-cap 은 "EffectGate 가 새서 채팅이 호출되는" 폭주 감지 안전장치로만.
//
// 단가 참조 = architecture 챗봇 모델 Claude Haiku 4.5 (chat-service.ts).

// Haiku 4.5 텍스트 단가 (USD/token). chat-service.ts HAIKU_*_PER_MILLION_USD 와 정합.
export const TEXT_PRICING = Object.freeze({
  'claude-haiku-4-5': { in: 1 / 1e6, out: 5 / 1e6 },
});

export const DEFAULT_MODEL = 'claude-haiku-4-5';

/** 1턴 텍스트 비용(USD). inTok/outTok = 호출의 input/output 토큰. Layer B 에선 0/0. */
export function estimateTextTurnUsd({ inTok, outTok, model = DEFAULT_MODEL }) {
  const p = TEXT_PRICING[model];
  if (!p) throw new Error(`unknown model pricing: ${model}`);
  if (typeof inTok !== 'number' || typeof outTok !== 'number') {
    throw new Error(`inTok/outTok must be numbers (got ${typeof inTok}/${typeof outTok})`);
  }
  return inTok * p.in + outTok * p.out;
}
