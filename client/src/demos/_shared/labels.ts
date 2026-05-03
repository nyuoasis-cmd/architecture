export const LABEL_RULES = {
  maxLabelLength: 8,
  recommendedLabelLength: 6,
  maxSubLength: 16,
  recommendedSubLength: 12,
  forbiddenPatterns: [
    { pattern: /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u, message: 'emoji 금지' },
    { pattern: /^(OS|API|DB|UI|JS|CSS|HTML)$/, message: '영어 raw 약자 단독 금지 — 한+영 병기 (예: "운영체제 OS")' },
    { pattern: /합니다[.!?]?$/, message: '~합니다 종결 금지 — UI Glossary' },
  ],
} as const;

export type LabelKind = 'label' | 'sub';

export function validateLabel(text: string, kind: LabelKind): void {
  const max = kind === 'label' ? LABEL_RULES.maxLabelLength : LABEL_RULES.maxSubLength;
  if (text.length > max) {
    throw new Error(`[validateLabel] ${kind} 글자수 ${text.length} > ${max} (text: "${text}")`);
  }

  for (const rule of LABEL_RULES.forbiddenPatterns) {
    if (rule.pattern.test(text)) {
      throw new Error(`[validateLabel] ${rule.message} (text: "${text}")`);
    }
  }
}

export type PairItemForValidation = {
  label: string;
  sub?: string;
};

export type DemoLayoutValid = 'wide' | 'square' | 'tall';

export function validatePairSet(
  metaphor: PairItemForValidation[],
  it: PairItemForValidation[],
  opts: { layout: DemoLayoutValid; subPolicy: 'all' | 'none' }
): void {
  if (metaphor.length !== it.length) {
    throw new Error(`[validatePairSet] metaphor.length(${metaphor.length}) !== it.length(${it.length})`);
  }

  const max = opts.layout === 'tall' ? 6 : 5;
  if (metaphor.length > max) {
    throw new Error(`[validatePairSet] layout=${opts.layout} max=${max}, got ${metaphor.length}`);
  }

  const allHaveSub = (items: PairItemForValidation[]) => items.every((item) => item.sub !== undefined);
  const noneHaveSub = (items: PairItemForValidation[]) => items.every((item) => item.sub === undefined);

  if (opts.subPolicy === 'all' && !(allHaveSub(metaphor) && allHaveSub(it))) {
    throw new Error('[validatePairSet] subPolicy=all 위반 — 일부 셀에 sub 없음');
  }
  if (opts.subPolicy === 'none' && !(noneHaveSub(metaphor) && noneHaveSub(it))) {
    throw new Error('[validatePairSet] subPolicy=none 위반 — 일부 셀에 sub 있음');
  }

  for (const item of [...metaphor, ...it]) {
    validateLabel(item.label, 'label');
    if (item.sub !== undefined) {
      validateLabel(item.sub, 'sub');
    }
  }
}
