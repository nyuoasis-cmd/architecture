import { useEffect, useMemo, useRef, useState } from 'react';
import {
  INITIAL_LAB_STATE,
  execute,
  openingEvents,
  type LabEvent,
  type LabState,
  type LabTone,
} from '../../lib/lab-shell';

type LabTabProps = {
  qaId: string;
  /** 지금 미션이 바뀌면 좌측 목차가 따라 움직인다. */
  onStateChange?: (state: LabState) => void;
  /** `exit` — 실습실에서 나간다. */
  onExit?: () => void;
};

/**
 * 🧪 실습 — 「가짜 터미널 실습실」의 화면.
 *
 * 🚨 출력은 **`textContent` 로만 그린다.** 여기 오는 문자열에는 학생이 친 명령이 섞여 있고,
 *    이 앱은 그 명령을 저장했다가 나중에 교사 화면에도 보여 주게 된다(PR5). `dangerouslySetInnerHTML`
 *    을 쓰는 순간 저장형 XSS 가 된다 — React 의 기본 렌더가 곧 그 완화책이라, **일부러 아무것도 안 한다**.
 *    이 주석이 그 «아무것도 안 함»이 의도라는 표시다.
 *
 * 🚨 명령을 실행하는 곳은 `execute()` **한 자리뿐이다.** 화면이 스스로 답을 지어내면
 *    셸을 진짜 런타임으로 갈아끼우는 날 화면부터 다시 짜야 한다(§5 골격 1).
 *
 * 🔑 xterm.js 가 아니라 **평범한 `<input>`** 이다 — 그래서 한글 입력·IME 위험이 0 이고,
 *    태블릿에서 Ctrl·Esc 가 없어도 쓸 수 있다(2026-08-15 정정).
 */
export default function LabTab({ qaId, onStateChange, onExit }: LabTabProps) {
  const [state, setState] = useState<LabState>(INITIAL_LAB_STATE);
  const [lines, setLines] = useState<LabEvent[]>(() => openingEvents());
  const [draft, setDraft] = useState('');
  /** 위/아래로 되돌려 쓰는 지난 명령. 터미널에서 가장 먼저 기대하는 동작이다. */
  const [history, setHistory] = useState<string[]>([]);
  const [historyAt, setHistoryAt] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0);

  // 문항이 바뀌면 실습실을 처음 상태로. 🚨 남은 화면을 이어 붙이면 다른 문항의 출력이 섞인다.
  useEffect(() => {
    setState(INITIAL_LAB_STATE);
    setLines(openingEvents());
    setDraft('');
    setHistory([]);
    setHistoryAt(null);
    seq.current = 0;
  }, [qaId]);

  // 화면 폭·붙여넣기 가능 여부는 화면만 알 수 있다 — 재서 셸에 넣어 준다(`lab doctor` 가 이걸 읽는다).
  useEffect(() => {
    const measure = () => {
      const widthPx = scrollRef.current?.clientWidth ?? 0;
      const canPaste = typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.readText);
      setState((prev) =>
        prev.env.widthPx === widthPx && prev.env.canPaste === canPaste
          ? prev
          : { ...prev, env: { widthPx, canPaste } },
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  useEffect(() => {
    const box = scrollRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [lines]);

  const submit = () => {
    const command = draft;
    seq.current += 1;
    const { events, nextState } = execute(command, state, `${qaId}:${seq.current}`);
    setState(nextState);
    setDraft('');
    setHistoryAt(null);
    if (command.trim() !== '') setHistory((prev) => [...prev, command.trim()]);

    if (events.some((event) => event.kind === 'clear')) {
      setLines(events.filter((event) => event.kind !== 'clear'));
    } else {
      setLines((prev) => [...prev, ...events]);
    }
    if (events.some((event) => event.kind === 'exit')) onExit?.();
  };

  const recall = (direction: -1 | 1) => {
    if (history.length === 0) return;
    const next =
      historyAt === null
        ? direction === -1
          ? history.length - 1
          : null
        : Math.min(history.length - 1, Math.max(0, historyAt + direction));
    if (next === null || (historyAt !== null && direction === 1 && historyAt === history.length - 1)) {
      setHistoryAt(null);
      setDraft('');
      return;
    }
    setHistoryAt(next);
    setDraft(history[next] ?? '');
  };

  const rendered = useMemo(
    () => lines.filter((event): event is Extract<LabEvent, { kind: 'line' }> => event.kind === 'line'),
    [lines],
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[#272b22] bg-[#0e100d]">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3 font-mono text-[12.6px] leading-[1.7] text-[#dce0d3]"
        onClick={() => inputRef.current?.focus()}
      >
        {rendered.map((event, index) => (
          <div key={index} className={`whitespace-pre-wrap break-words ${TONE_CLASS[event.tone]}`}>
            {/* 🚨 여기는 `textContent` 다. 절대 innerHTML 로 바꾸지 말 것 — 학생이 친 문자열이 섞여 있다. */}
            {event.text === '' ? ' ' : event.text}
          </div>
        ))}
      </div>

      <form
        className="flex flex-none items-center gap-2 border-t border-[#272b22] bg-[#191c16] px-3 py-2.5"
        onSubmit={(formEvent) => {
          formEvent.preventDefault();
          submit();
        }}
      >
        <span aria-hidden className="font-mono text-[12.2px] font-semibold text-[#96c97e]">
          $
        </span>
        <input
          ref={inputRef}
          aria-label="명령을 입력하세요"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="min-w-0 flex-1 bg-transparent font-mono text-[12.2px] text-[#dce0d3] outline-none placeholder:text-[#5c6357]"
          onChange={(changeEvent) => setDraft(changeEvent.target.value)}
          onKeyDown={(keyEvent) => {
            if (keyEvent.key === 'ArrowUp') {
              keyEvent.preventDefault();
              recall(-1);
            } else if (keyEvent.key === 'ArrowDown') {
              keyEvent.preventDefault();
              recall(1);
            }
          }}
          placeholder="명령을 입력하세요 — help"
          spellCheck={false}
          value={draft}
        />
        <button
          className="flex-none rounded-md border border-[#384030] bg-[#20251c] px-3 py-1 font-mono text-[11.5px] text-[#dce0d3]"
          type="submit"
        >
          실행
        </button>
      </form>
    </div>
  );
}

const TONE_CLASS: Record<LabTone, string> = {
  input: 'text-white font-semibold',
  plain: 'text-[#dce0d3]',
  dim: 'text-[#7f867a]',
  ok: 'text-[#96c97e]',
  bad: 'text-[#ef7159]',
  warn: 'text-[#e4b264]',
};
