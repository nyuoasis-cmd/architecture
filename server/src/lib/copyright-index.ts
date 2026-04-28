import { createHash } from 'node:crypto';
import { CORPUS_RAW } from '../data/corpus';

type CopyrightCheckResult = {
  blocked: boolean;
  reason?: 'ngram' | 'substring' | 'sentence';
};

type CopyrightIndex = {
  corpusNormalized: string;
  ngramHashes: Set<string>;
  sentences: Set<string>;
};

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter(Boolean);
}

function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function buildIndex(corpus: string): CopyrightIndex {
  const corpusNormalized = normalizeText(corpus);
  const tokens = tokenize(corpus);
  const ngramHashes = new Set<string>();

  for (let index = 0; index <= tokens.length - 8; index += 1) {
    ngramHashes.add(hashText(tokens.slice(index, index + 8).join(' ')));
  }

  const sentences = new Set(
    corpus
      .split(/[.!?。\n]+/)
      .map((sentence) => normalizeText(sentence))
      .filter((sentence) => sentence.length >= 24),
  );

  return { corpusNormalized, ngramHashes, sentences };
}

let index: CopyrightIndex = {
  corpusNormalized: '',
  ngramHashes: new Set<string>(),
  sentences: new Set<string>(),
};

export function buildCopyrightIndex(): {
  corpusEmpty: boolean;
  durationMs: number;
  sentenceCount: number;
  ngramCount: number;
} {
  const startedAt = Date.now();
  index = buildIndex(CORPUS_RAW);
  return {
    corpusEmpty: index.corpusNormalized.length === 0,
    durationMs: Date.now() - startedAt,
    sentenceCount: index.sentences.size,
    ngramCount: index.ngramHashes.size,
  };
}

export function checkCopyright(answer: string): CopyrightCheckResult {
  if (!index.corpusNormalized) {
    return { blocked: false };
  }

  const normalizedAnswer = normalizeText(answer);
  if (!normalizedAnswer) {
    return { blocked: false };
  }

  const answerTokens = tokenize(answer);
  let overlapCount = 0;

  for (let cursor = 0; cursor <= answerTokens.length - 8; cursor += 1) {
    const hash = hashText(answerTokens.slice(cursor, cursor + 8).join(' '));
    if (index.ngramHashes.has(hash)) {
      overlapCount += 1;
      if (overlapCount > 1) {
        return { blocked: true, reason: 'ngram' };
      }
    }
  }

  if (normalizedAnswer.length >= 80 && index.corpusNormalized.includes(normalizedAnswer.slice(0, 80))) {
    return { blocked: true, reason: 'substring' };
  }

  const matchedSentence = answer
    .split(/[.!?。\n]+/)
    .map((sentence) => normalizeText(sentence))
    .find((sentence) => sentence.length >= 24 && index.sentences.has(sentence));

  if (matchedSentence) {
    return { blocked: true, reason: 'sentence' };
  }

  return { blocked: false };
}
