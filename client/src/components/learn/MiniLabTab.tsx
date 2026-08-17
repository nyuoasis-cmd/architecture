import { useEffect, useRef, useState } from 'react';
import { AI_PREFIX, type LabEvent, type LabTone } from '../../lib/lab-shell';
import {
  INITIAL_MINI_STATE,
  askFallbackLines,
  executeMini,
  missionIndexOfMini,
  nextStepOfMini,
  openingEventsMini,
  type MiniEffect,
  type MiniLab,
} from '../../lib/mini-lab';
import { labAsk, labBundle, labSaveArtifact, labVoice } from '../../lib/lab-api';
import { useLearnStore } from '../../store/learn-store';

type MiniLabTabProps = {
  lab: MiniLab;
  /** 이 문항의 미션 구간 안내(머리말) — 없는 문항은 전체를 안내. */
  qaId: string;
};

/**
 * 미니 실습실 화면 — LabTab(12강)의 동생. 터미널형 강(1·5·8·11·13·19강)이 나눠 쓴다.
 *
 * 🚨 출력은 `textContent` 로만 그린다 — 학생이 친 문자열이 섞여 있다(LabTab 과 같은 이유).
 * 🚨 작업은 스토어(miniSession)에 산다 — 읽기 탭 한 번에 안 날아간다.
 * 🚨 AI 실패는 조용히 사라지지 않는다 — ask 는 «(대체 응답)» 풀, voice 는 검수된 안내로 잇는다.
 */
export default function MiniLabTab({ lab, qaId }: MiniLabTabProps) {
  const session = useLearnStore((store) => store.miniSession);
  const setSession = useLearnStore((store) => store.setMiniSession);
  const live = session && session.scopeId === lab.scopeId ? session : null;
  const state = live?.state ?? INITIAL_MINI_STATE;
  const lines = live?.lines ?? EMPTY_LINES;
  const history = live?.history ?? EMPTY_HISTORY;

  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [historyAt, setHistoryAt] = useState<number | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0);

  // 🔑 이 강의 세션이 없을 때만 새로 만든다 — 문항을 옮겨도(같은 강) 이어 쓴다(SDD 결정 21).
  useEffect(() => {
    if (session?.scopeId === lab.scopeId) return;
    setSession({ scopeId: lab.scopeId, state: INITIAL_MINI_STATE, lines: openingEventsMini(lab), history: [] });
    setDraft('');
    setHistoryAt(null);
    seq.current = 0;
  }, [lab, session?.scopeId, setSession]);

  useEffect(() => {
    const box = scrollRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [lines]);

  const say = (rows: LabEvent[]) => {
    setSession((current) => {
      if (!current || current.scopeId !== lab.scopeId) return current;
      return { ...current, lines: [...current.lines, ...rows] };
    });
  };

  const runEffect = async (effect: MiniEffect) => {
    if (effect.kind === 'editor') {
      setEditor({ open: true, effect, text: String(state.flags[effect.flag] ?? '') });
      return;
    }
    if (effect.kind === 'bundle') {
      if (busy) return;
      setBusy(true);
      try {
        const result = await labBundle();
        if (!result.ok) {
          // 🚨 «못 읽음»을 «빈 것»으로 말하지 않는다 — 빠진 칸 목록도 진행 표식도 남기지 않는다.
          say([
            { kind: 'line', text: '지금 서버에서 산출물을 불러올 수 없어요 — 잠시 뒤 다시 해 주세요.', tone: 'bad' },
            { kind: 'line', text: '  (여러분 것이 «없는» 게 아니라, 지금 «못 읽는» 거예요.)', tone: 'dim' },
          ]);
          return;
        }
        const doors: Record<string, string> = {
          rules: '우리 반 규칙 한 장  ← 12강',
          skill: '스킬 한 개         ← 13강',
          ac: '완료 조건 한 벌     ← 16강',
          promise: '약속 문장 한 개     ← 19강',
          handoff: '넘김 쪽지 한 장     ← 22강',
        };
        const missing = result.data.missing;
        const rows: LabEvent[] = Object.entries(doors).map(([kind, label]) => ({
          kind: 'line' as const,
          text: missing.includes(kind) ? `  빠짐  ${label} — 그 강의 체험에서 만들면 채워져요` : `  있음  ${label}`,
          tone: missing.includes(kind) ? ('warn' as LabTone) : ('ok' as LabTone),
        }));
        if (missing.length === 0) {
          rows.push({ kind: 'line', text: '', tone: 'plain' });
          rows.push({
            kind: 'line',
            text: `🎓 다섯 장이 다 모였습니다 — 묶음 ${result.data.revision ?? 1}판으로 저장했어요. exhibit 로 전시를 여세요.`,
            tone: 'ok',
          });
        } else {
          rows.push({ kind: 'line', text: '', tone: 'plain' });
          rows.push({
            kind: 'line',
            text: `  ${missing.length}칸이 비어 있어요 — 빠진 강을 다녀와서 다시 bundle. 지금까지 만든 것은 그대로 있어요.`,
            tone: 'dim',
          });
        }
        say(rows);
        setSession((current) => {
          if (!current || current.scopeId !== lab.scopeId) return current;
          return {
            ...current,
            state: {
              ...current.state,
              flags: {
                ...current.state.flags,
                bundleTried: true,
                // 🚨 잠금 해제는 서버 판정(missing 0)일 때만 — 화면이 지어내지 않는다.
                ...(missing.length === 0 ? { exhibitOpen: true } : {}),
              },
            },
          };
        });
      } finally {
        setBusy(false);
      }
      return;
    }
    if (busy) {
      say([{ kind: 'line', text: '  앞의 요청이 아직 돌고 있습니다. 잠깐만요.', tone: 'dim' }]);
      return;
    }
    setBusy(true);
    say([{ kind: 'line', text: '  … 부르는 중', tone: 'dim' }]);
    try {
      if (effect.kind === 'ask') {
        const result = await labAsk(effect.text);
        if (!result.ok) {
          // 🚨 AI «필수»인 강이 여기 기댄다 — 대체 응답 풀(검수분)로 수업이 이어진다(SDD 결정 14).
          say(askFallbackLines(lab, fallbackUsed));
          setFallbackUsed((count) => count + 1);
          markAskDone();
          return;
        }
        say(
          result.data.answer
            .split('\n')
            .map((row) => ({ kind: 'line' as const, text: row, tone: 'plain' as LabTone })),
        );
        markAskDone();
        return;
      }
      // voice — 자유 문장 해석. 실패하면 지금 미션을 읽어 주는 검수 안내.
      const mission = lab.missions[missionIndexOfMini(lab, state)];
      const result = await labVoice({
        text: effect.text,
        missionGoal: mission?.goal ?? '',
        nextCommand: nextStepOfMini(lab, state) ?? '',
      });
      if (!result.ok) {
        const rows: LabEvent[] = [
          { kind: 'line', text: `${AI_PREFIX} (대체 응답) 지금 AI 연결이 어려워, 검수된 안내로 대신해요.`, tone: 'ai' },
        ];
        if (mission) rows.push({ kind: 'line', text: `${AI_PREFIX} 지금 할 일 — ${mission.goal}`, tone: 'ai' });
        say(rows);
        return;
      }
      const rows: LabEvent[] = result.data.reply.map((row) => ({
        kind: 'line' as const,
        text: `${AI_PREFIX} ${row}`,
        tone: 'ai' as LabTone,
      }));
      if (result.data.suggestedCommand) {
        rows.push({
          kind: 'line',
          text: `${AI_PREFIX} 이럴 땐 ${result.data.suggestedCommand} — 실행은 여러분 손으로.`,
          tone: 'ai',
        });
      }
      say(rows);
    } finally {
      setBusy(false);
    }
  };

  /** ask 가 «실제로 답을 받았을 때»(대체 응답 포함)만 진행으로 센다 — 명령을 친 시점이 아니다. */
  const markAskDone = () => {
    setSession((current) => {
      if (!current || current.scopeId !== lab.scopeId) return current;
      const asked = Number(current.state.flags.askAnswered ?? 0) + 1;
      const nextState = { ...current.state, flags: { ...current.state.flags, askAnswered: asked } };
      return { ...current, state: nextState };
    });
  };

  const [editor, setEditor] = useState<{ open: boolean; effect?: Extract<MiniEffect, { kind: 'editor' }>; text: string }>(
    { open: false, text: '' },
  );

  const saveEditor = () => {
    const effect = editor.effect;
    if (!effect) return;
    const text = editor.text.trim();
    if (text.length < effect.minChars) return;
    setSession((current) => {
      if (!current || current.scopeId !== lab.scopeId) return current;
      const nextState = { ...current.state, flags: { ...current.state.flags, [effect.flag]: text } };
      return {
        ...current,
        state: nextState,
        lines: [
          ...current.lines,
          { kind: 'line', text: `${effect.fileLabel} 을 저장했습니다. (${text.length}자)`, tone: 'ok' },
        ],
      };
    });
    // 산출물 계보 — 실패해도 실습은 계속(23강이 빈 칸을 알려 준다).
    if (effect.artifactKind) {
      void labSaveArtifact(effect.artifactKind, text).then((result) => {
        if (!result.ok) console.warn('[mini-lab] artifact_save_failed', effect.artifactKind, result.failure);
      });
    }
    setEditor({ open: false, text: '' });
  };

  const submit = () => {
    const command = draft;
    seq.current += 1;
    const { events, nextState, effect } = executeMini(lab, command, state, `${lab.scopeId}:${seq.current}`);
    setSession((current) => {
      if (!current || current.scopeId !== lab.scopeId) return current;
      const cleared = events.some((event) => event.kind === 'clear');
      return {
        ...current,
        state: nextState,
        lines: cleared ? events.filter((event) => event.kind !== 'clear') : [...current.lines, ...events],
        history: command.trim() === '' ? current.history : [...current.history, command.trim()],
      };
    });
    setDraft('');
    setHistoryAt(null);
    if (effect) void runEffect(effect);
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

  const span = lab.qaMissionSpans[qaId];
  const nextCommand = nextStepOfMini(lab, state) ?? 'missions';
  const rendered = lines.filter((event): event is Extract<LabEvent, { kind: 'line' }> => event.kind === 'line');

  return (
    <div className="flex h-full min-h-0 flex-col p-3 lg:p-4">
      <p className="mb-2 flex-shrink-0 text-[12px] text-[var(--color-text-muted)]">
        💻 이 강의 문항들은 실습실 하나를 이어 써요.
        {span ? ` 이 문항의 미션: ${span.from}~${span.to}` : ''}
      </p>
      <div className="flex h-full min-h-0 flex-1 gap-3">
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#272b22] bg-[#0e100d]">
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3 font-mono text-[12.6px] leading-[1.7] text-[#dce0d3]"
            onClick={() => inputRef.current?.focus()}
          >
            {rendered.map((event, index) => (
              <div key={index} className={`whitespace-pre-wrap break-words ${TONE_CLASS[event.tone]}`}>
                {/* 🚨 여기는 `textContent` 다. innerHTML 금지 — 학생이 친 문자열이 섞여 있다. */}
                {event.text === '' ? ' ' : event.text}
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
              placeholder={nextCommand}
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

        {editor.open && editor.effect ? (
          <aside className="flex h-full min-h-0 w-[38%] min-w-[280px] flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
            <div className="flex flex-none items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
              <span className="font-mono text-[11.5px] font-semibold text-[var(--color-text-primary)]">
                {editor.effect.fileLabel}
              </span>
              <span className="font-mono text-[10.5px] text-[var(--color-text-faint)]">{editor.text.trim().length}자</span>
              <button
                className="ml-auto rounded-md px-2 py-1 text-[11.5px] text-[var(--color-text-muted)]"
                onClick={() => setEditor({ open: false, text: '' })}
                type="button"
              >
                닫기
              </button>
              <button
                className="rounded-md bg-[var(--color-accent)] px-3 py-1 text-[11.5px] font-semibold text-white disabled:opacity-40"
                disabled={editor.text.trim().length < editor.effect.minChars}
                onClick={saveEditor}
                type="button"
              >
                저장
              </button>
            </div>
            <textarea
              aria-label={editor.effect.fileLabel}
              className="min-h-0 flex-1 resize-none px-3 py-2.5 font-mono text-[12.4px] leading-[1.7] text-[var(--color-text-primary)] outline-none"
              onChange={(changeEvent) => setEditor((prev) => ({ ...prev, text: changeEvent.target.value }))}
              value={editor.text}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}

const EMPTY_LINES: LabEvent[] = [];
const EMPTY_HISTORY: string[] = [];

const TONE_CLASS: Record<LabTone, string> = {
  input: 'text-white font-semibold',
  plain: 'text-[#dce0d3]',
  dim: 'text-[#7f867a]',
  ok: 'text-[#96c97e]',
  bad: 'text-[#ef7159]',
  warn: 'text-[#e4b264]',
  ai: 'text-[#c4b5fd]',
};
