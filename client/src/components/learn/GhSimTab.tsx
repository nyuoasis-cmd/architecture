import { useState } from 'react';
import {
  GH_PRACTICE_BADGE,
  GH_SCREEN_LABELS,
  foldGhState,
  outOfScriptReason,
  type GhScreen,
  type GhScript,
} from '../../lib/gh-sim';
import { useLearnStore } from '../../store/learn-store';

type GhSimTabProps = {
  script: GhScript;
  /** 산출물 입력이 끝났을 때 — 서버 계보 저장은 부르는 쪽(ContentPanel/강별 배선)이 한다. */
  onArtifact?: (artifactKind: string, content: string) => void;
};

/**
 * 「가짜 GitHub」 렌더러 — 대본형 + 산출물 슬롯 (SDD 결정 8, 목업 2 확정 화면).
 *
 * 🚨 «연습용» 표지가 항상 떠 있다 — 조건부로 만들지 말 것(진실성 장치이자 사칭 방지).
 * 🚨 대본 밖 탭은 흐림 + 누르면 «왜 안 눌리는지» 설명 — 몰래 막지 않는다.
 * 🚨 Merge 는 학생 손이 누른다 — 자동으로 진행되는 확정 버튼은 없다.
 * 🔑 진행은 스토어(ghSession)에 산다 — 탭을 옮겼다 와도 같은 칸으로 돌아온다(labSession 과 같은 이유).
 */
export default function GhSimTab({ script, onArtifact }: GhSimTabProps) {
  const session = useLearnStore((store) => store.ghSession);
  const setSession = useLearnStore((store) => store.setGhSession);
  const live = session && session.scopeId === script.scopeId ? session : null;
  const stepIndex = live?.stepIndex ?? 0;
  const inputs = live?.inputs ?? {};

  const done = stepIndex >= script.steps.length;
  const step = done ? script.steps[script.steps.length - 1]! : script.steps[stepIndex]!;
  const state = foldGhState(script, done ? script.steps.length : stepIndex, inputs);
  const [draft, setDraft] = useState('');
  const [reason, setReason] = useState<string | null>(null);

  // 비유 다리에서 지금 켜진 단계 — 지나온 단계 중 마지막 bridgeStage.
  let bridgeAt = 0;
  for (let i = 0; i <= Math.min(stepIndex, script.steps.length - 1); i += 1) {
    const at = script.steps[i]?.bridgeStage;
    if (at) bridgeAt = at;
  }

  const advance = (input?: string) => {
    setSession((current) => {
      const base =
        current && current.scopeId === script.scopeId
          ? current
          : { scopeId: script.scopeId, stepIndex: 0, inputs: {} };
      if (base.stepIndex >= script.steps.length) return base;
      const at = script.steps[base.stepIndex]!;
      return {
        ...base,
        stepIndex: base.stepIndex + 1,
        inputs: input !== undefined ? { ...base.inputs, [at.id]: input } : base.inputs,
      };
    });
    setDraft('');
    setReason(null);
  };

  const submitInput = () => {
    if (step.action.kind !== 'input') return;
    const text = draft.trim();
    if (text.length < step.action.minChars) return;
    if (step.action.artifactKind) {
      onArtifact?.(step.action.artifactKind, step.artifactOf ? step.artifactOf(state, text) : text);
    }
    advance(text);
  };

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-3 px-4 py-5 lg:px-6">
      {/* 비유 다리 — 읽기 탭에서 심은 생활 비유가 화면 단계와 1:1 (쉬움 3원칙 1) */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[#f0faf7] px-4 py-3 text-[13px]">
        <b className="text-[var(--color-accent)]">📖 아까 읽은 비유</b>
        <span className="text-[var(--color-text-muted)]">{script.bridge.name} —</span>
        {script.bridge.stages.map((stage, index) => (
          <span
            key={stage}
            className={`rounded-full border px-2.5 py-0.5 ${
              bridgeAt === index + 1
                ? 'border-[var(--color-accent)] bg-white font-semibold text-[var(--color-text-primary)]'
                : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)]'
            }`}
          >
            {index + 1} {stage}
          </span>
        ))}
      </div>

      {/* 도슨트 자막 — 매 단계 생활어 한 문장이 항상 떠 있다 (쉬움 3원칙 2) */}
      <div className="flex items-start gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-[13.5px] text-indigo-900">
        <span className="text-[17px]">🧭</span>
        <div>
          <b>지금 하는 일</b> — {done ? script.outro : step.docent}
          {script.newTerms.length > 0 ? (
            <span className="text-indigo-500"> (이번 체험의 새 용어는 {script.newTerms.join('·')} 뿐)</span>
          ) : null}
        </div>
      </div>

      {/* 가짜 GitHub 프레임 */}
      <div className="relative overflow-hidden rounded-[10px] border border-[#d1d9e0] bg-white text-[13.5px] text-[#1f2328]">
        <span className="absolute right-3 top-2.5 z-10 rounded-full border border-orange-300 bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-900">
          {GH_PRACTICE_BADGE}
        </span>
        <header className="border-b border-[#d1d9e0] bg-[#f6f8fa] px-4 py-3 text-[14px]">
          📦 <b className="text-[#0969da]">{state.repo}</b>
        </header>
        <nav className="flex gap-4 border-b border-[#d1d9e0] bg-[#f6f8fa] px-4 pt-2 text-[13px]">
          {(Object.keys(GH_SCREEN_LABELS) as GhScreen[]).map((screen) => {
            const active = screen === step.screen;
            return (
              <button
                key={screen}
                className={`pb-2 pt-1 ${
                  active
                    ? 'font-bold text-[#1f2328] shadow-[inset_0_-2px_0_#fd8c73]'
                    : 'text-[#59636e] opacity-45'
                }`}
                onClick={() => {
                  if (!active) setReason(outOfScriptReason(screen, script, stepIndex));
                }}
                type="button"
              >
                {GH_SCREEN_LABELS[screen]}
              </button>
            );
          })}
        </nav>
        {reason ? (
          <p className="border-b border-[#d1d9e0] bg-[#fff8f2] px-4 py-2 text-[12.5px] text-[#9a3412]">{reason}</p>
        ) : null}

        <div className="p-4">
          {step.screen === 'code' ? <CodeScreen state={state} /> : null}
          {step.screen === 'issues' ? <IssuesScreen state={state} /> : null}
          {step.screen === 'pr' ? <PrScreen state={state} /> : null}
          {step.screen === 'pages' ? <PagesScreen state={state} /> : null}

          {/* 대본 행동 자리 */}
          {!done && step.action.kind === 'next' ? (
            <button
              className="mt-4 rounded-lg bg-[#1f883d] px-4 py-2 text-[13.5px] font-bold text-white"
              onClick={() => advance()}
              type="button"
            >
              {step.action.label}
            </button>
          ) : null}

          {!done && step.action.kind === 'input' ? (
            <div className="mt-4">
              <textarea
                aria-label={step.action.label}
                className="w-full resize-y rounded-lg border border-[#d1d9e0] px-3 py-2.5 text-[13.5px] leading-[1.8] focus:outline-none focus:ring-2 focus:ring-[#0969da]"
                onChange={(event) => setDraft(event.target.value)}
                placeholder={step.action.placeholder}
                rows={5}
                value={draft}
              />
              <div className="mt-2 flex items-center gap-3">
                <button
                  className="rounded-lg bg-[#1f883d] px-4 py-2 text-[13.5px] font-bold text-white disabled:opacity-40"
                  disabled={draft.trim().length < step.action.minChars}
                  onClick={submitInput}
                  type="button"
                >
                  {step.action.label}
                </button>
                {draft.trim().length > 0 && draft.trim().length < step.action.minChars ? (
                  <span className="text-[12px] text-[#59636e]">
                    조금만 더 — {step.action.minChars}자는 넘어야 다음 사람이 읽을 수 있어요.
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {!done && step.action.kind === 'merge' ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-[#d1d9e0] bg-white px-3.5 py-3">
              <span className="text-[13px] font-bold text-[#1a7f37]">✓ 검사 통과 · 리뷰 승인됨</span>
              <button
                className="ml-auto rounded-lg bg-[#2da44e] px-4 py-2 text-[13.5px] font-bold text-white"
                onClick={() => advance()}
                type="button"
              >
                {step.action.label}
              </button>
            </div>
          ) : null}

          {done ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] text-emerald-900">
              ✓ {script.outro}
            </p>
          ) : null}
        </div>
      </div>

      <p className="text-[12px] text-[var(--color-text-muted)]">
        흐린 탭·버튼은 이 연습 흐름에서는 눌리지 않아요 — 이유가 궁금하면 눌러 보세요(설명이 떠요).
      </p>
    </div>
  );
}

function CodeScreen({ state }: { state: import('../../lib/gh-sim').GhSimState }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d1d9e0]">
      {state.files.length === 0 ? (
        <p className="px-3.5 py-3 text-[13px] text-[#59636e]">아직 파일이 없어요.</p>
      ) : (
        state.files.map((file) => (
          <div key={file.name} className="flex gap-3 border-b border-[#d1d9e0] px-3.5 py-2 last:border-b-0">
            <span className="font-mono text-[12.5px] text-[#0969da]">{file.name}</span>
            <span className="text-[12.5px] text-[#59636e]">{file.summary}</span>
          </div>
        ))
      )}
    </div>
  );
}

function IssuesScreen({ state }: { state: import('../../lib/gh-sim').GhSimState }) {
  return (
    <div className="flex flex-col gap-3">
      {state.issues.length === 0 ? (
        <p className="text-[13px] text-[#59636e]">아직 이슈가 없어요.</p>
      ) : (
        state.issues.map((issue) => (
          <div key={issue.id} className="overflow-hidden rounded-lg border border-[#d1d9e0]">
            <div className="border-b border-[#d1d9e0] bg-[#f6f8fa] px-3.5 py-2 text-[13px]">
              <span
                className={`mr-2 rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${
                  issue.state === 'open' ? 'bg-[#1a7f37]' : 'bg-[#8250df]'
                }`}
              >
                {issue.state === 'open' ? 'Open' : 'Closed'}
              </span>
              <b>{issue.title}</b> <span className="text-[#59636e]">#{issue.id}</span>
            </div>
            <div className="whitespace-pre-wrap px-3.5 py-2.5 text-[13px] leading-[1.75]">{issue.body}</div>
            {issue.comments.map((comment, index) => (
              <div key={index} className="border-t border-[#d1d9e0] px-3.5 py-2.5 text-[13px]">
                <b className="text-[#8250df]">{comment.who}</b>
                <p className="mt-1 whitespace-pre-wrap leading-[1.75]">{comment.body}</p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function PrScreen({ state }: { state: import('../../lib/gh-sim').GhSimState }) {
  const pr = state.pr;
  if (!pr) return <p className="text-[13px] text-[#59636e]">아직 Pull request 가 없어요.</p>;
  return (
    <div>
      <h3 className="text-[16px] font-semibold">
        {pr.title} <span className="font-normal text-[#59636e]">#{pr.number}</span>
      </h3>
      <span
        className={`mt-1 inline-block rounded-full px-3 py-0.5 text-[12px] font-bold text-white ${
          pr.state === 'merged' ? 'bg-[#8250df]' : 'bg-[#1f883d]'
        }`}
      >
        {pr.state === 'merged' ? 'Merged' : 'Open'}
      </span>

      {/* 산출물 슬롯 — 학생이 쓴 것이 그대로 들어온다 (보라 점선, 목업 2) */}
      <div className="mt-3 overflow-hidden rounded-lg border border-[#d1d9e0] outline-dashed outline-2 -outline-offset-2 outline-[#8250df]">
        <p className="bg-[#faf8ff] px-3.5 pt-2 text-[11px] font-bold text-[#8250df]">
          내 산출물 — 내가 쓴 것이 여기 들어와요
        </p>
        <div className="bg-[#faf8ff] px-3.5 py-2 text-[12.5px] text-[#59636e]">
          <b className="text-[#1f2328]">나</b> 님이 열었습니다
        </div>
        <div className="whitespace-pre-wrap px-3.5 py-2.5 text-[13px] leading-[1.8]">{pr.body}</div>
      </div>

      {pr.review ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-[#d1d9e0]">
          <div className="border-b border-[#d1d9e0] bg-[#f6f8fa] px-3.5 py-2 text-[12.5px]">
            <b className="text-[#8250df]">{pr.review.who}</b> 님이 리뷰를 남겼습니다
          </div>
          <div className="whitespace-pre-wrap px-3.5 py-2.5 text-[13px] leading-[1.8]">{pr.review.body}</div>
        </div>
      ) : null}
    </div>
  );
}

function PagesScreen({ state }: { state: import('../../lib/gh-sim').GhSimState }) {
  return (
    <div className="rounded-lg border border-[#d1d9e0] px-3.5 py-3 text-[13px] leading-[1.8]">
      {state.pages === 'off' ? <p>Pages 가 꺼져 있어요 — 아직 아무도 이 저장소를 웹에서 못 봐요.</p> : null}
      {state.pages === 'building' ? <p>🟡 배포하는 중… 저장소의 파일을 웹 페이지로 바꾸고 있어요.</p> : null}
      {state.pages === 'live' ? (
        <p>
          🟢 배포 완료 — 내 페이지 주소가 생겼어요:{' '}
          <span className="font-mono text-[12.5px] text-[#0969da]">{state.pagesUrl}</span>
        </p>
      ) : null}
    </div>
  );
}
