// 하네스 심화 트랙 — 모듈 5(커밋 · PR · 머지 · 보안) 작업대.
// 콘텐츠 원본: docs/harness-course-curriculum/content/모듈5_커밋PR보안_콘텐츠.md
// 흐름: 도입 → STEP1 커밋 이름표 고르기(학생 선택, 각본 결과) → STEP2 규칙 어긴 커밋 차단(각본) →
//       STEP3 PR 카드 + CI(각본) → STEP4 보안 경고 3등급 분류(학생 선택, 각본 결과) → 이해 체크 → 마무리.
// 공용 키트(_kit)의 검증된 부품 재사용. 순수 각본형(각 STEP의 학생 선택도 정답 재생일 뿐, 서버 호출 없음).
import { Hero, getTone } from '../demos/_shared';
import { GatedReveal, TerminalBlock, type CheckData, type PlaybackStep } from './_kit';

export const TONE = getTone(4); // 모듈 5 accent (ch04 톤 — 콘텐츠 원본 대응 12/15강)

// ── F1: 개념 앵커 (커밋 → PR → 보안) ─────────────────────────────────────────
export const ANCHOR_PHASES = [
  { key: 'commit', dot: '🏷️', ko: '커밋', hint: '규칙대로 이름표 달기' },
  { key: 'pr', dot: '📬', ko: 'PR·머지', hint: '검토판에 올려 통과 후 합치기' },
  { key: 'security', dot: '🛡️', ko: '보안 3등급', hint: '즉시 / 권장 / 무시' },
];
export const ANCHOR_HEADLINE = (
  <>
    커밋 이름표 규칙 → PR로 검토·CI 통과 → 보안 경고 3등급 분류까지, <strong style={{ color: TONE.accent }}>안전하게 올리는 법</strong>을
    한 바퀴 봅니다. 지금 어디쯤인지 아래에서 확인하세요.
  </>
);
export const ANCHOR_DONE = '✅ 한 바퀴 완주! 커밋 이름표 → PR·CI 통과 → 보안 3등급 분류까지 다 봤어요.';

// ── STEP 1 (학생 선택 → 각본 결과): 커밋 이름표 고르기 ───────────────────────
type CommitTagOption = { id: 'feat' | 'fix' | 'docs'; label: string };
const COMMIT_TAGS: CommitTagOption[] = [
  { id: 'feat', label: 'feat: 새 기능' },
  { id: 'fix', label: 'fix: 버그 수정' },
  { id: 'docs', label: 'docs: 문서' },
];

export function CommitTagStep({ picked, onPick }: { picked: string | null; onPick: (id: string) => void }) {
  const correct = picked === 'feat';
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="커밋·PR·보안 · STEP 1/4"
        title="커밋 메시지 규칙대로 고르기"
        summary="커밋 = 변경 묶음에 이름표 달기. 방금 만든 '노트 별표 켜고 끄기' 기능은 어떤 이름표일까요?"
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: TONE.accent, color: '#fff' }}>
            시키기
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            변경: 노트에 별표 켜고 끄는 기능을 추가함
          </span>
        </div>
        <p className="m-0 font-mono text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-primary)' }}>
          커밋 이름표를 골라줘 →
        </p>
      </section>
      <div className="flex flex-wrap gap-2">
        {COMMIT_TAGS.map((t) => {
          const chosen = picked === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              className="rounded-xl border px-4 py-2 text-[13px] font-semibold transition"
              style={{
                borderColor: chosen ? TONE.accent : 'var(--color-border)',
                background: chosen ? TONE.accentSoft : 'var(--demo-card-bg)',
                color: chosen ? TONE.accent : 'var(--color-text-primary)',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {picked ? (
        <section
          className="rounded-2xl border p-4"
          style={{ borderColor: correct ? TONE.accentBorder : 'var(--color-border)', background: 'var(--demo-card-bg)' }}
        >
          {correct ? (
            <>
              <h3 className="m-0 text-[14px] font-semibold" style={{ color: TONE.accent }}>
                ✅ feat: 노트 별표 켜기/끄기 추가
              </h3>
              <p className="m-0 mt-1.5 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
                새 기능이니까 <strong>feat:</strong>가 맞아요. 나중에 이 이름표만 봐도 "아, 여기서 기능이 추가됐구나" 바로 알아요.
              </p>
            </>
          ) : (
            <p className="m-0 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
              🤔 이건 <strong>새 기능 추가</strong>예요. <strong>feat:</strong>를 골라보세요.
            </p>
          )}
        </section>
      ) : null}
      {correct ? (
        <TerminalBlock
          label="원본 로그 — 커밋 이름표"
          text={[
            '$ git commit',
            '변경 요약: 노트 별표 켜고 끄는 기능 추가',
            '→ 제안된 이름표: feat  (새 기능)',
            '✔ feat: 노트 별표 켜기/끄기 추가',
          ].join('\n')}
        />
      ) : null}
    </div>
  );
}

// ── STEP 2 (각본): 규칙 어긴 커밋이 차단 ──────────────────────────────────────
export const STEP2: PlaybackStep = {
  id: 'blocked',
  nav: 'STEP 2 · 차단',
  phase: '1차시 — 커밋 → PR·머지 → 보안',
  anchorKey: 'commit',
  eyebrow: '커밋·PR·보안 · STEP 2/4',
  title: '규칙 어긴 커밋이 차단되는 것 보기',
  summary: '이름표를 안 붙이고 커밋하면 어떻게 될까요? 규칙을 지키는 검사기가 막아줘요.',
  runLabel: '▶ 실행 — 이름표 없이 커밋 시도',
  runHint: '아래 버튼을 눌러 "별표 추가함"이라고만 커밋해보세요.',
  resultTitle: '🚫 커밋이 차단됐어요',
  chips: ['거부: 이름표 없음', '재시도: feat: 붙여서 통과'],
  chipDesc:
    '사람이 깜빡해도 검사기가 막아줘요. "사람의 의지력에 기대지 말고 시스템이 강제한다." 이름표를 붙여 다시 커밋하면 통과돼요.',
  logLabel: '원본 로그 — 커밋 차단',
  rawLog: [
    '$ git commit -m "별표 추가함"',
    '✖ commitlint: subject may not be empty / type must be one of [feat, fix, docs, refactor, test ...]',
    '→ 커밋 거부됨. 이름표를 붙여 다시 시도하세요.',
    '',
    '$ git commit -m "feat: 노트 별표 켜기/끄기 추가"',
    '✔ 통과',
  ].join('\n'),
};

// ── STEP 3 (각본): PR 카드 + CI ───────────────────────────────────────────────
export const STEP3: PlaybackStep = {
  id: 'pr',
  nav: 'STEP 3 · PR',
  phase: '1차시 — 커밋 → PR·머지 → 보안',
  anchorKey: 'pr',
  eyebrow: '커밋·PR·보안 · STEP 3/4',
  title: 'PR 카드 만들고 머지 흐름 따라가기',
  summary: 'PR = "이거 올려도 될까요?" 검토 요청. 바로 본진(main)에 넣지 않고, PR에 올려 검토·통과 후 머지해요.',
  runLabel: '▶ 실행 — PR 올리고 CI 돌리기',
  resultTitle: '📬 PR 카드',
  chips: ['제목: feat: 노트 별표 켜기/끄기 추가', '테스트 12개 초록', 'CI 전체 통과 ✅', '머지 버튼 켜짐'],
  chipDesc: '검사(CI)를 통과 못 하면 머지 버튼이 안 켜져요. 깨진 코드가 본진에 못 들어와요.',
  logLabel: '원본 로그 — PR + CI',
  rawLog: [
    '$ gh pr create',
    'PR #12 열림: feat: 노트 별표 켜기/끄기 추가',
    '',
    '[CI — 클린 서버 자동 검사]',
    '  lint ........... ✔',
    '  tsc --noEmit ... ✔ (타입 검사)',
    '  npm test ....... ✔ (12/12 초록)',
    '  npm audit ...... ✔ (즉시 등급 없음)',
    '→ 전부 통과 → Merge 버튼 활성화 ✅',
    '',
    '(검사 실패 시 → Merge 버튼 비활성 → 본진 보호)',
  ].join('\n'),
};

// ── STEP 4 (학생 선택 → 각본 결과): 보안 경고 3등급 분류 ─────────────────────
type SecurityGrade = 'now' | 'soon' | 'skip';
export type SecurityWarning = { id: string; text: string; correct: SecurityGrade };

export const SECURITY_WARNINGS: SecurityWarning[] = [
  { id: 'secret', text: 'API 비밀 열쇠가 코드에 그대로 적혀 있음', correct: 'now' },
  { id: 'moderate', text: '어떤 라이브러리에 중간 위험(moderate) 취약점', correct: 'soon' },
  { id: 'devonly', text: '개발용 도구에만 있는 낮은 위험 경고', correct: 'skip' },
];

const GRADE_LABEL: Record<SecurityGrade, string> = { now: '🔴 즉시', soon: '🟡 권장', skip: '⚪ 무시' };
const GRADE_OPTIONS: SecurityGrade[] = ['now', 'soon', 'skip'];

export function SecurityGradeStep({
  answers,
  onAnswer,
}: {
  answers: Record<string, SecurityGrade>;
  onAnswer: (id: string, grade: SecurityGrade) => void;
}) {
  const allDone = SECURITY_WARNINGS.every((w) => answers[w.id]);
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="커밋·PR·보안 · STEP 4/4"
        title="보안 경고 3등급 분류"
        summary="보안 검사를 돌리면 경고가 여러 개 떠요. 전부 급한 건 아니에요. 🔴즉시 / 🟡권장 / ⚪무시 3등급으로 나눠보세요."
        tone={TONE}
        summaryTone="stone"
      />
      <div className="flex flex-col gap-2">
        {SECURITY_WARNINGS.map((w) => {
          const picked = answers[w.id];
          return (
            <section
              key={w.id}
              className="rounded-2xl border p-3"
              style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
            >
              <p className="m-0 text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {w.text}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {GRADE_OPTIONS.map((g) => {
                  const chosen = picked === g;
                  const revealCorrect = picked !== undefined && g === w.correct;
                  const revealWrong = chosen && g !== w.correct;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => onAnswer(w.id, g)}
                      className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition"
                      style={{
                        borderColor: revealCorrect ? TONE.accent : revealWrong ? 'var(--color-danger, #dc2626)' : 'var(--color-border)',
                        background: revealCorrect ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {GRADE_LABEL[g]}
                      {revealCorrect ? ' ✅' : revealWrong ? ' ❌' : ''}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <section
        className="rounded-2xl border p-3 text-[12px] leading-[1.6]"
        style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft, color: 'var(--color-text-body)' }}
      >
        🚨 고치겠다고 <strong>--force(강제)</strong>를 쓰면 절대 안 돼요. 더 큰 문제를 부릅니다.
      </section>
      {allDone ? (
        <p className="m-0 text-[12px]" style={{ color: TONE.accent }}>
          ✅ 3개 경고 모두 분류 완료 — PR 카드에 담깁니다.
        </p>
      ) : null}
    </div>
  );
}

// ── 이해 체크 ─────────────────────────────────────────────────────────────────
// F3: 오답 하나는 '그럴듯한 오개념'(④ --force로 밀어붙이면 해결됨 — 학생이 "밀어붙이면 되지 않나" 오인하기 쉬움).
export const CHECK: CheckData = {
  eyebrow: '커밋·PR·보안 · 이해 체크',
  question: '보안 검사에서 "API 비밀 열쇠가 코드에 그대로 노출됨" 경고가 떴습니다. 어떤 등급일까요?',
  options: [
    '무시해도 됨 (개발용이라서)',
    '나중에 시간 날 때 고치면 됨',
    '즉시 고쳐야 함 (비밀 열쇠 노출은 심각)',
    '--force로 밀어붙이면 해결됨',
  ],
  correctIdx: 2,
  explanationShort: '비밀 열쇠 노출은 즉시 등급이에요. 남이 그 열쇠로 우리 서비스를 쓸 수 있으니까요.',
  explanationMore:
    '④처럼 --force로 밀어붙이는 건 어떤 경우에도 답이 아니에요 — 더 큰 문제를 부릅니다. 열쇠가 노출됐다면 즉시 교체하고, 코드에서 완전히 지워야 해요.',
};

// ── 도입 / 마무리 화면 ───────────────────────────────────────────────────────
export function IntroScreen() {
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="커밋·PR·보안 · 도입"
        title="다 만들었어요. 안전하게 올리는 것도 실력이에요"
        summary="오늘 배울 것 세 가지: ① 커밋 — 변경에 이름표를 다는 것(규칙이 있어요) ② PR — 올리기 전 검토판에 올리는 것 ③ 보안 — 경고가 떴을 때 얼마나 급한지 판단하는 것."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
        <p className="m-0 text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          절대 규칙 하나
        </p>
        <p className="m-0 mt-1.5 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          <strong>--force(강제 밀어붙이기)는 금지.</strong> 더 큰 문제를 부릅니다.
        </p>
      </section>
      <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
        <p className="m-0 text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          오늘 할 일
        </p>
        <p className="m-0 mt-1.5 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          앞서 모듈에서 만든 '노트 별표' 기능을 <strong>커밋 → PR → 보안 점검</strong> 순서로 안전하게 올려봅니다. 위 세 칸(커밋 → PR·머지 →
          보안)이 오늘의 지도예요.
        </p>
        <p className="m-0 mt-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          아래 <strong>다음 →</strong>을 눌러 시작하세요.
        </p>
      </section>
    </div>
  );
}

export function WrapScreen() {
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="커밋·PR·보안 · 마무리"
        title="한 바퀴 끝! 안전하게 올리는 법"
        summary="커밋 이름표 규칙, PR로 검토 후 머지, 보안 경고 3등급 분류까지 다 봤어요. 사람의 의지력 대신 시스템(검사기·CI)이 강제해서 안전을 지켜요."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
        <p className="m-0 text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
          오늘 만든 것: <strong>PR 카드</strong> — 커밋 규칙 적용 + 보안 3등급 분류 결과.
        </p>
        <p className="m-0 mt-2 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          다음 시간엔 지금까지 배운 걸 모아 <strong>나만의 스킬 1개를 완성하고 제출</strong>합니다. (모듈 6 · 종합=졸업)
        </p>
      </section>
    </div>
  );
}
