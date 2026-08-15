import { useEffect, useMemo, useRef, useState } from 'react';
import {
  INITIAL_LAB_STATE,
  applyMyOutputs,
  execute,
  markReviewDone,
  markSubmitted,
  openingEvents,
  saveRules,
  type LabEvent,
  type LabState,
  type LabTone,
} from '../../lib/lab-shell';
import { checkAll, passCount } from '../../lib/lab-checker';
import { failureLines, labAsk, labLatestSubmission, labReview, labSubmit, labVerify } from '../../lib/lab-api';
import { useLearnStore } from '../../store/learn-store';

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
  /**
   * 🚨 실습 작업은 **컴포넌트 밖(스토어)에** 산다. 우측 탭이 조건부 렌더라, 여기 두면
   *    학생이 📖 읽기 탭에 한 번 들렀다 오는 것만으로 90분 작업이 통째로 사라진다
   *    (2026-08-15 Codex 리뷰). 되돌리지 말 것 — 계약 `labSurvivesTabSwitch` 가 잡는다.
   */
  const session = useLearnStore((store) => store.labSession);
  const setSession = useLearnStore((store) => store.setLabSession);
  const live = session && session.qaId === qaId ? session : null;
  const state = live?.state ?? INITIAL_LAB_STATE;
  const lines = live?.lines ?? EMPTY_LINES;
  const history = live?.history ?? EMPTY_HISTORY;

  /**
   * 🚨 **스토어에서 그 자리에서 다시 읽는다.** 렌더 시점에 잡아 둔 `state`/`lines`/`history` 로
   *    세션을 통째로 덮으면, 같은 마운트 안에서 먼저 쓴 값이 뒤 효과에 지워진다.
   *    실제로 그렇게 **축소판 고지가 통째로 사라졌다** — 처음 연 학생이 빈 프롬프트만 보고
   *    무엇을 칠지 몰랐다(2026-08-15 새내기 QA, s3·s4). 계약 `labOpeningContract` 가 잡는다.
   */
  const commitFrom = (next: Partial<{ state: LabState; lines: LabEvent[]; history: string[] }>) => {
    const stored = useLearnStore.getState().labSession;
    const base =
      stored && stored.qaId === qaId
        ? stored
        : { qaId, state: INITIAL_LAB_STATE, lines: openingEvents(), history: [] as string[] };
    setSession({ ...base, qaId, ...next });
  };
  const readSession = () => {
    const stored = useLearnStore.getState().labSession;
    return stored && stored.qaId === qaId
      ? stored
      : { qaId, state: INITIAL_LAB_STATE, lines: openingEvents(), history: [] as string[] };
  };
  const setState = (updater: LabState | ((prev: LabState) => LabState)) => {
    commitFrom({ state: typeof updater === 'function' ? updater(readSession().state) : updater });
  };
  const setLines = (updater: LabEvent[] | ((prev: LabEvent[]) => LabEvent[])) => {
    commitFrom({ lines: typeof updater === 'function' ? updater(readSession().lines) : updater });
  };
  const setHistory = (updater: string[] | ((prev: string[]) => string[])) => {
    commitFrom({ history: typeof updater === 'function' ? updater(readSession().history) : updater });
  };

  const [draft, setDraft] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorText, setEditorText] = useState('');
  const [busy, setBusy] = useState(false);
  /** 위/아래로 되돌려 쓰는 지난 명령. 터미널에서 가장 먼저 기대하는 동작이다. */
  const [historyAt, setHistoryAt] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0);

  // 🔑 이 문항의 세션이 아직 없을 때만 새로 만든다. **이미 있으면 그대로 이어 쓴다** —
  //    탭을 옮겼다 돌아온 것뿐이라면 아무것도 지우지 않는다.
  //    🚨 문항이 바뀌었으면 통째로 새로 만든다. 남은 화면을 이어 붙이면 다른 문항의 출력이 섞인다.
  useEffect(() => {
    if (session?.qaId === qaId) return;
    setSession({ qaId, state: INITIAL_LAB_STATE, lines: openingEvents(), history: [] });
    setDraft('');
    setHistoryAt(null);
    setEditorOpen(false);
    setEditorText('');
    seq.current = 0;
  }, [qaId, session?.qaId, setSession]);

  // 🔑 낸 것이 있으면 읽어 와서 이어 쓴다 — 탭을 닫았다 와도, 다른 기기에서 열어도 남아 있어야 한다.
  useEffect(() => {
    let cancelled = false;
    void labLatestSubmission(qaId).then((previous) => {
      if (cancelled || !previous) return;
      setState((prev) =>
        prev.submittedRevision >= previous.revision
          ? prev
          : { ...markSubmitted(prev, previous.revision), rules: prev.rules.trim() === '' ? previous.rules : prev.rules },
      );
    });
    return () => {
      cancelled = true;
    };
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
    if (events.some((event) => event.kind === 'editor')) {
      setEditorText(nextState.rules);
      setEditorOpen(true);
    }

    const intent = events.find((event): event is Extract<LabEvent, { kind: 'ai' }> => event.kind === 'ai');
    if (intent) void runAi(intent, nextState);

    const submitIntent = events.find(
      (event): event is Extract<LabEvent, { kind: 'submit' }> => event.kind === 'submit',
    );
    if (submitIntent) void runSubmit(submitIntent.rules);
  };

  const say = (rows: { text: string; tone: LabTone }[]) => {
    setLines((prev) => [...prev, ...rows.map((row) => ({ kind: 'line' as const, text: row.text, tone: row.tone }))]);
  };

  /**
   * 🚨 AI 를 부르는 **유일한 자리**. 셸은 순수 함수라 의도만 내보내고, 실제 호출은 여기서만 일어난다.
   * 🚨 막힌 이유를 뭉치지 않는다 — 돈 천장 · 내 횟수 소진 · 너무 자주 · 고장은 학생이 할 일이 다르다.
   */
  const runAi = async (intent: Extract<LabEvent, { kind: 'ai' }>, from: LabState) => {
    if (busy) {
      say([{ text: '  앞의 요청이 아직 돌고 있습니다. 잠깐만요.', tone: 'dim' }]);
      return;
    }
    setBusy(true);
    say([{ text: '  … 부르는 중', tone: 'dim' }]);
    try {
      if (intent.mode === 'ask') {
        const result = await labAsk(intent.text);
        if (!result.ok) {
          say(failureLines(result.failure));
          return;
        }
        say([{ text: result.data.answer, tone: 'plain' }]);
        return;
      }

      if (intent.mode === 'review') {
        const result = await labReview(intent.text);
        if (!result.ok) {
          say(failureLines(result.failure));
          return;
        }
        const { good, issues } = result.data.review;
        const rows: { text: string; tone: LabTone }[] = [];
        if (good) rows.push({ text: `  좋은 점 — ${good}`, tone: 'ok' });
        if (issues.length === 0) {
          rows.push({ text: '  애매한 곳을 못 찾았습니다. npm test 로 실제로 시켜 보세요.', tone: 'warn' });
        } else {
          issues.forEach((issue, index) => {
            rows.push({ text: `  ${index + 1}. ${issue.where}`, tone: 'warn' });
            rows.push({ text: `     ${issue.why}`, tone: 'dim' });
          });
          rows.push({ text: '  고치는 것은 여러분 몫입니다 — edit 로 다시 여세요.', tone: 'dim' });
        }
        // 🚨 «비평을 받았다»는 여기서만 기록한다 — 명령을 친 시점이 아니다.
        setState((prev) => markReviewDone(prev));
        say(rows);
        return;
      }

      // verify — 내 규칙대로 두 번 시켜 보고, **결정적 검사기**로 판정한다.
      const result = await labVerify(intent.text);
      if (!result.ok) {
        say(failureLines(result.failure));
        return;
      }
      const outputs = result.data.outputs;
      setState((prev) => applyMyOutputs(prev, outputs));
      const rows = checkAll(outputs.map((text, index) => ({ name: `my-${index + 1}`, text })));
      const said: { text: string; tone: LabTone }[] = [];
      rows.forEach((row, index) => {
        said.push({
          text: row.outcome.ok
            ? `  PASS  my-${index + 1}       할인율 ${row.outcome.discountPercent}%`
            : `  FAIL  my-${index + 1}       터짐: ${row.outcome.reason}`,
          tone: row.outcome.ok ? 'ok' : 'bad',
        });
      });
      const passed = passCount(rows);
      said.push({ text: '', tone: 'plain' });
      if (passed === rows.length) {
        // 🚨 «서로 달랐는데 둘 다 읽혔다»를 **실제로 다를 때만** 말한다. 규칙을 아주 빡빡하게 쓰면
        //    두 답이 같아지기도 하는데(2026-08-15 실측), 그때 «달랐다»고 적으면 화면이 거짓말을 한다.
        //    수업이 「정직함」을 가르치는 자리라 더더욱 안 된다.
        const differ = outputs.length > 1 && new Set(outputs.map((text) => text.trim())).size > 1;
        said.push({ text: `  ${passed} 통과 · 0 실패`, tone: 'ok' });
        said.push({
          text: differ
            ? '  두 답은 서로 달랐는데 둘 다 읽혔습니다 — 글자가 같아서가 아니라 형식을 지켜서입니다.'
            // 🚨 «규칙이 좁아서 같아졌다»고 단정하지 않는다 — 같은 답이 나온 이유는 알 수 없다.
            //    확실한 것은 «둘 다 형식을 지켰다»는 것뿐이다(2026-08-15 Codex 리뷰).
            : '  이번엔 두 답이 똑같이 나왔습니다. 왜 같았는지는 알 수 없지만, 둘 다 형식을 지켰습니다.',
          tone: 'plain',
        });
      } else {
        said.push({ text: `  ${passed} 통과 · ${rows.length - passed} 실패`, tone: 'warn' });
        said.push({ text: '  규칙이 아직 애매합니다. cat 으로 내 답을 열어 보고 edit 로 고쳐 보세요.', tone: 'dim' });
      }
      say(said);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 낸다. 🚨 판정은 **서버가 저장된 본문으로** 낸다 — 화면은 결과를 받아 적기만 한다.
   * 🔑 «냈다»는 서버가 판 번호를 돌려준 뒤에만 기록한다. 보낸 시점이 아니다.
   */
  const runSubmit = async (rules: string) => {
    if (busy) {
      say([{ text: '  앞의 요청이 아직 돌고 있습니다. 잠깐만요.', tone: 'dim' }]);
      return;
    }
    setBusy(true);
    say([{ text: '  … 서버가 여러분의 규칙으로 시켜 보는 중', tone: 'dim' }]);
    try {
      const result = await labSubmit(qaId, rules);
      if (!result.ok) {
        say(failureLines(result.failure));
        return;
      }
      const { revision, verdict } = result.data;
      setState((prev) => markSubmitted(prev, revision));
      const rows: { text: string; tone: LabTone }[] = verdict.rows.map((row) => ({
        text: row.ok ? `  PASS  ${row.name}       읽혔습니다` : `  FAIL  ${row.name}       터짐: ${row.reason ?? ''}`,
        tone: row.ok ? ('ok' as const) : ('bad' as const),
      }));
      rows.push({ text: '', tone: 'plain' });
      if (verdict.passed === verdict.total) {
        rows.push({ text: `  ${verdict.passed} 통과 · 0 실패 — 제출했습니다 (${revision}번째 판)`, tone: 'ok' });
        rows.push({ text: '  선생님이 여러분이 낸 규칙과 이 결과를 그대로 봅니다.', tone: 'dim' });
      } else {
        rows.push({
          text: `  ${verdict.passed} 통과 · ${verdict.total - verdict.passed} 실패 — 제출했습니다 (${revision}번째 판)`,
          tone: 'warn',
        });
        // 🚨 «실패했으니 다시»가 아니라 «고쳐서 또 내도 된다»로 적는다. 낸 것이 지워지지 않는다.
        rows.push({ text: '  고쳐서 또 내도 됩니다. 낸 것은 지워지지 않고 새 판으로 쌓입니다.', tone: 'dim' });
      }
      say(rows);
    } finally {
      setBusy(false);
    }
  };

  const saveEditor = () => {
    const { events, nextState } = saveRules(state, editorText);
    setState(nextState);
    setLines((prev) => [...prev, ...events]);
    setEditorOpen(false);
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
    <div className="flex h-full min-h-0 gap-3">
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#272b22] bg-[#0e100d]">
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
          className="flex-none rounded-md border border-[#384030] bg-[#20251c] px-3 py-1 font-mono text-[11.5px] text-[#dce0d3] disabled:opacity-50"
          disabled={busy}
          type="submit"
        >
          {busy ? '…' : '실행'}
        </button>
      </form>
    </div>

    {/*
      🚨 편집기는 **옆 패널**이다. 터미널 안에서 nano·heredoc 을 흉내 내지 않는다 —
         태블릿엔 Ctrl·Esc 가 없어서 «저장하고 나오는 법»을 아무도 모른다.
         5단계(규칙 쓰기)는 90분 중 가장 오래 걸리는 단계라, 여기서 막히면 수업이 통째로 막힌다.
      🔑 평범한 `<textarea>` 다 — 한글 입력도, 붙여넣기도, 확대도 브라우저가 알아서 한다.
    */}
    {editorOpen ? (
      <aside className="flex h-full min-h-0 w-[38%] min-w-[280px] flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
        <div className="flex flex-none items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
          <span className="font-mono text-[11.5px] font-semibold text-[var(--color-text-primary)]">CLAUDE.md</span>
          <span className="font-mono text-[10.5px] text-[var(--color-text-faint)]">{editorText.trim().length}자</span>
          <button
            className="ml-auto rounded-md px-2 py-1 text-[11.5px] text-[var(--color-text-muted)]"
            onClick={() => setEditorOpen(false)}
            type="button"
          >
            닫기
          </button>
          <button
            className="rounded-md bg-[var(--color-accent)] px-3 py-1 text-[11.5px] font-semibold text-white"
            onClick={saveEditor}
            type="button"
          >
            저장
          </button>
        </div>
        <textarea
          aria-label="규칙 문서"
          className="min-h-0 flex-1 resize-none px-3 py-2.5 font-mono text-[12.4px] leading-[1.7] text-[var(--color-text-primary)] outline-none"
          onChange={(changeEvent) => setEditorText(changeEvent.target.value)}
          placeholder={EDITOR_PLACEHOLDER}
          value={editorText}
        />
        <p className="flex-none border-t border-[var(--color-border)] px-3 py-2 text-[11px] leading-[1.5] text-[var(--color-text-faint)]">
          AI 는 여러분이 쓴 것을 <b>비평</b>합니다 — 대신 써 주지 않습니다.
        </p>
      </aside>
    ) : null}
    </div>
  );
}

/** 🚨 빈 화면을 주지 않는다. 다만 **답을 주지도 않는다** — 무엇을 적어야 하는지의 «모양»만 보여 준다. */
const EDITOR_PLACEHOLDER = `여기에 규칙을 적어 보세요.

예를 들면 이런 것들을 정해야 합니다:
- 무엇을 적을 것인가
- 어느 자리에 적을 것인가
- 숫자는 어떤 모양으로 적을 것인가

(이 안내는 저장되지 않습니다.)`;

/** 🔑 매 렌더마다 새 배열을 만들면 useEffect 가 헛돈다. */
const EMPTY_LINES: LabEvent[] = [];
const EMPTY_HISTORY: string[] = [];

const TONE_CLASS: Record<LabTone, string> = {
  input: 'text-white font-semibold',
  plain: 'text-[#dce0d3]',
  dim: 'text-[#7f867a]',
  ok: 'text-[#96c97e]',
  bad: 'text-[#ef7159]',
  warn: 'text-[#e4b264]',
};
