import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { GLOSSARY, type GlossaryEntry } from '../../data/teacher-glossary';

type GlossaryProps = {
  text: string;
  seenTerms?: ReadonlySet<string>;
};

type MatchCandidate = {
  entry: GlossaryEntry;
  start: number;
  end: number;
  matchedText: string;
};

const TERM_BOUNDARY = /[0-9A-Za-z가-힣]/;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isBoundary(text: string, index: number) {
  if (index < 0 || index >= text.length) {
    return true;
  }

  return !TERM_BOUNDARY.test(text[index] ?? '');
}

function findEarliestMatch(text: string, seenTerms: Set<string>) {
  let bestMatch: MatchCandidate | null = null;

  for (const entry of GLOSSARY) {
    if (seenTerms.has(entry.term)) {
      continue;
    }

    const candidates = [entry.term, ...(entry.aliases ?? [])]
      .map((item) => item.trim())
      .filter(Boolean)
      .sort((left, right) => right.length - left.length);

    for (const candidate of candidates) {
      const regex = new RegExp(escapeRegExp(candidate), 'giu');
      let result: RegExpExecArray | null = null;

      while ((result = regex.exec(text)) !== null) {
        const start = result.index;
        const end = start + result[0].length;

        if (!isBoundary(text, start - 1) || !isBoundary(text, end)) {
          continue;
        }

        if (
          !bestMatch ||
          start < bestMatch.start ||
          (start === bestMatch.start && result[0].length > bestMatch.matchedText.length)
        ) {
          bestMatch = {
            entry,
            start,
            end,
            matchedText: result[0],
          };
        }

        break;
      }
    }
  }

  return bestMatch;
}

type RenderMatch = MatchCandidate & {
  absoluteStart: number;
  absoluteEnd: number;
};

function collectRenderMatches(text: string, initialSeenTerms?: ReadonlySet<string>) {
  const seenTerms = new Set(initialSeenTerms);
  const matches: RenderMatch[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const match = findEarliestMatch(text.slice(cursor), seenTerms);
    if (!match) {
      break;
    }

    const absoluteStart = cursor + match.start;
    const absoluteEnd = cursor + match.end;

    matches.push({
      ...match,
      absoluteStart,
      absoluteEnd,
    });

    seenTerms.add(match.entry.term);
    cursor = absoluteEnd;
  }

  return matches;
}

export function collectMatchedTerms(text: string, initialSeenTerms?: ReadonlySet<string>) {
  return collectRenderMatches(text, initialSeenTerms).map((match) => match.entry.term);
}

function isMobileViewport() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }

  return window.matchMedia('(max-width: 767px)').matches;
}

function useGlossaryMarkup(text: string, sharedSeenTerms?: ReadonlySet<string>) {
  const [activeEntry, setActiveEntry] = useState<GlossaryEntry | null>(null);
  const [activeTrigger, setActiveTrigger] = useState<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dragStartYRef = useRef<number | null>(null);
  const dialogTitleId = useId();
  const tooltipIdBase = useId();

  useEffect(() => {
    if (!activeEntry) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusDialog = () => {
      closeButtonRef.current?.focus();
    };

    focusDialog();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setActiveEntry(null);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const sheet = sheetRef.current;
      if (!sheet) {
        return;
      }

      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeEntry]);

  useEffect(() => {
    if (activeEntry) {
      return;
    }

    activeTrigger?.focus();
  }, [activeEntry, activeTrigger]);

  const closeSheet = () => {
    setActiveEntry(null);
  };

  const renderContent = () => {
    if (!GLOSSARY.length) {
      return text;
    }

    const parts: ReactNode[] = [];
    const matches = collectRenderMatches(text, sharedSeenTerms);
    let cursor = 0;

    for (const match of matches) {
      if (match.absoluteStart > cursor) {
        parts.push(text.slice(cursor, match.absoluteStart));
      }

      const tooltipId = `${tooltipIdBase}-${match.entry.term}-${match.absoluteStart}`;

      parts.push(
        <span
          key={`${match.entry.term}-${match.absoluteStart}`}
          className="glossary-term-wrapper"
        >
          <button
            aria-describedby={tooltipId}
            className="glossary-term"
            onClick={(event) => {
              if (!isMobileViewport()) {
                return;
              }

              event.preventDefault();
              setActiveTrigger(event.currentTarget);
              setActiveEntry(match.entry);
            }}
            type="button"
          >
            {match.matchedText}
            <span className="glossary-tooltip" id={tooltipId} role="tooltip">
              <span className="glossary-tooltip__term">{match.entry.term}</span>
              {match.entry.oneline}
            </span>
          </button>
        </span>,
      );

      cursor = match.absoluteEnd;
    }

    if (cursor < text.length) {
      parts.push(text.slice(cursor));
    }

    return parts;
  };

  return {
    activeEntry,
    closeSheet,
    closeButtonRef,
    dialogTitleId,
    dragStartYRef,
    renderContent,
    setActiveEntry,
    setActiveTrigger,
    sheetRef,
  };
}

export default function Glossary({ text, seenTerms }: GlossaryProps) {
  const {
    activeEntry,
    closeSheet,
    closeButtonRef,
    dialogTitleId,
    dragStartYRef,
    renderContent,
    sheetRef,
  } = useGlossaryMarkup(text, seenTerms);

  // 🚨 시트는 반드시 document.body 로 포털한다 — 이 컴포넌트를 쓰는 쪽(TeacherExplainPanel)이
  // <p> 안에서 부르기 때문에, 인라인으로 두면 <h3>/<p>/<div> 가 <p> 자손이 되어 브라우저가
  // 마크업을 재부모화한다(React 19 hydration 경고 3종). 감싸는 쪽이 아니라 시트 쪽을 고쳐야
  // 앞으로 <Glossary> 를 쓰는 모든 자리에서 같은 함정이 안 생긴다. (2026-08-18 QA soft 1 수리)
  return (
    <>
      {renderContent()}
      {activeEntry ? createPortal((
        <div
          className="glossary-sheet-backdrop"
          onClick={closeSheet}
        >
          <div
            aria-labelledby={dialogTitleId}
            aria-modal="true"
            className="glossary-sheet"
            onClick={(event) => event.stopPropagation()}
            ref={sheetRef}
            role="dialog"
          >
            <button
              aria-label="용어 사전 닫기"
              className="glossary-sheet__handle"
              onPointerDown={(event) => {
                dragStartYRef.current = event.clientY;
              }}
              onPointerUp={(event) => {
                const startY = dragStartYRef.current;
                dragStartYRef.current = null;
                if (startY !== null && event.clientY - startY >= 50) {
                  closeSheet();
                }
              }}
              type="button"
            >
              <span className="glossary-sheet__handle-bar" />
            </button>
            <button
              aria-label="닫기"
              className="glossary-sheet__close"
              onClick={closeSheet}
              ref={closeButtonRef}
              type="button"
            >
              ×
            </button>
            <h3 className="glossary-sheet__title" id={dialogTitleId}>
              {activeEntry.term}
            </h3>
            {activeEntry.category ? (
              <p className="glossary-sheet__category">{activeEntry.category}</p>
            ) : null}
            <p className="glossary-sheet__body">{activeEntry.oneline}</p>
          </div>
        </div>
      ), document.body) : null}
    </>
  );
}
