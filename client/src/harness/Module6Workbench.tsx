// 하네스 심화 트랙 — 모듈 6(종합 · 졸업) 작업대.
// 콘텐츠 원본: docs/harness-course-curriculum/content/모듈6_종합_졸업_콘텐츠.md
// 흐름: 도입 → STEP1 한 바퀴 요약(각본: 규칙→기획→테스트→커밋) → STEP2 /tdd-loop 맛보기(각본) →
//       STEP3 졸업 스킬 완성(학생 입력, PART4 규격 5칸+선택 1칸)+제출 → 이해 체크 → 마무리.
// 공용 키트(_kit)의 검증된 부품 재사용. STEP3 졸업 스킬 폼+제출만 모듈 6 고유(인터랙티브).
// 3-B: 제출은 서버(architecture_submissions, module_id='module6')에 저장된다. 식별은 익명
// 브라우저 토큰(submission-client)이며, 3-C에서 실제 세션/참가자 모델로 교체될 예정.
import { useState } from 'react';
import { Hero, getTone } from '../demos/_shared';
import { fetchModuleSubmission, saveModuleSubmission } from './submission-client';
import { type CheckData, type PlaybackStep } from './_kit';

export const TONE = getTone(6); // 모듈 6 accent (ch06 톤)

// ── F1: 개념 앵커 (종합 → 자동화 → 졸업) ─────────────────────────────────────
export const ANCHOR_PHASES = [
  { key: 'cycle', dot: '🔄', ko: '한 바퀴 종합', hint: '규칙→기획→테스트→커밋' },
  { key: 'automate', dot: '⚡', ko: '/tdd-loop', hint: '순서는 자동, 승인은 사람' },
  { key: 'graduate', dot: '🎓', ko: '졸업', hint: '나만의 스킬 완성·제출' },
];
export const ANCHOR_HEADLINE = (
  <>
    지금까지 배운 규칙·기획·테스트·커밋을 <strong style={{ color: TONE.accent }}>하나의 흐름</strong>으로 이어 본 뒤, 그 흐름을
    자동화가 어떻게 묶어주는지 보고 → <strong style={{ color: TONE.accent }}>나만의 스킬</strong>을 완성해 졸업합니다.
  </>
);
export const ANCHOR_DONE = '✅ 한 바퀴 완주! 종합 → /tdd-loop → 졸업까지 다 봤어요.';

// ── STEP 1 (각본): 한 바퀴 요약 실행 ─────────────────────────────────────────
export const STEP1: PlaybackStep = {
  id: 'cycle',
  nav: 'STEP 1 · 한 바퀴',
  phase: '졸업 — 종합 → 자동화 → 졸업',
  anchorKey: 'cycle',
  eyebrow: '종합 · STEP 1/3',
  title: '한 바퀴 요약 실행',
  summary: '모듈 1~5를 작은 예제 하나로 한 바퀴 돌려봐요. 규칙→기획→테스트→커밋이 어떻게 이어지는지 눈으로 확인해요.',
  instruction: "'노트 검색' 기능을 규칙→기획→테스트→구현→커밋 한 바퀴로 돌려줘. 각 단계가 끝날 때마다 뭐가 됐는지 알려줘.",
  runLabel: '▶ 실행 — 한 바퀴 돌리기',
  resultTitle: '🔄 한 바퀴 완주',
  chips: [
    '규칙(모듈1): CLAUDE.md 확인 — 이름은 handle로 ✅',
    '기획(모듈3): spec + AC 3줄 ✅',
    '테스트(모듈4): 검색 테스트 3개 Red→Green ✅',
    '커밋(모듈5): PR → CI 통과 → 머지 ✅',
  ],
  chipDesc: '따로따로 배운 게 하나의 흐름으로 이어졌죠? 이게 "AI를 제대로 부리는" 전체 모습이에요.',
  logLabel: '원본 로그 — 한 바퀴',
  rawLog: [
    '[1/4 규칙] CLAUDE.md 로드 — 네이밍 handle, 파일 짧게',
    "[2/4 기획] spec: \"검색창 입력 → 해당 글자 포함 노트만 표시\"",
    "           AC: Given 노트 3개 / When '회의' 입력 / Then '회의' 포함 노트만",
    '[3/4 테스트] 검색 테스트 3개 작성 → 3 failed (Red) → 구현 → 3 passed (Green)',
    '[4/4 커밋] feat: 노트 검색 추가 → PR #13 → CI 통과 → 머지 ✅',
    '',
    '→ 규칙·기획·테스트·커밋이 하나의 흐름으로 연결됨',
  ].join('\n'),
};

// ── STEP 2 (각본): /tdd-loop 맛보기 ──────────────────────────────────────────
export const STEP2: PlaybackStep = {
  id: 'automate',
  nav: 'STEP 2 · 자동화',
  phase: '졸업 — 종합 → 자동화 → 졸업',
  anchorKey: 'automate',
  eyebrow: '종합 · STEP 2/3',
  title: '/tdd-loop 맛보기 (한 번에 여러 단계)',
  summary:
    '방금 한 바퀴, 단계가 많았죠? 이슈가 10개면 엄청 반복돼요. 그래서 반복을 하나로 묶는 자동화가 있어요 — /tdd-loop. 단, 중요한 승인은 여전히 사람이 해요.',
  instruction: '/tdd-loop  (테스트 → 구현 → 검증 → 다듬기 → 커밋을 한 번에)',
  runLabel: '▶ 실행 — /tdd-loop',
  resultTitle: '⚡ 한 번 눌렀더니 순서대로 자동 진행',
  chips: ['순서를 건너뛸 수 없어요(안전)', '중간에 막히면 어디서 멈췄는지 알려줘요', '머지 같은 중요한 승인은 여전히 사람이 눌러요'],
  chipDesc: '"한 번 잘 만들면, 다음 이슈부턴 버튼 하나." 이게 AI 워크플로우의 힘이에요.',
  logLabel: '원본 로그 — /tdd-loop',
  rawLog: [
    '$ /tdd-loop',
    '',
    '[1] 테스트 시나리오 ..... ✔ (5개)',
    '[2] Red ................. ✔ (5/5 실패, not implemented)',
    '[3] Green .............. ✔ (5/5 통과)',
    '[4] 검증(AC) ........... ✔',
    '[5] Refactor .......... ✔ (테스트 초록 유지)',
    '[6] 커밋 준비 .......... ✔',
    '→ 머지: ⏸ 사람 승인 대기  (자동화가 여기선 멈추고 물어봄)',
    '',
    '원칙: 순서 강제 · 실패 위치 보고 · 중요한 승인은 사람',
  ].join('\n'),
};

// ── STEP 3 (학생 직접 작성 + 제출): 졸업 스킬 완성 ───────────────────────────
export type GraduationSkill = {
  name: string;
  purpose: string;
  input: string;
  steps: string;
  output: string;
  reuseNote: string; // 선택
};
export const EMPTY_GRADUATION: GraduationSkill = { name: '', purpose: '', input: '', steps: '', output: '', reuseNote: '' };

const REQUIRED_FIELDS: { key: keyof GraduationSkill; label: string; placeholder: string }[] = [
  { key: 'name', label: '이름', placeholder: '예: 아키텍처 그림 스킬' },
  { key: 'purpose', label: '목적 한 줄', placeholder: '예: 소스 폴더를 주면 구조를 그림으로 그려준다' },
  { key: 'input', label: '입력', placeholder: '예: 분석할 소스 폴더' },
  { key: 'steps', label: '절차(2~4단계)', placeholder: '예: 분석 → 관계 파악 → 그림 생성 → 브라우저 열기' },
  { key: 'output', label: '결과', placeholder: '예: 다이어그램(브라우저에서 열림)' },
];

export function requiredFilledCount(v: GraduationSkill): number {
  return REQUIRED_FIELDS.filter((f) => v[f.key].trim()).length;
}

export type SubmittedGraduation = { skill: GraduationSkill; updatedAt: string };

const GRADUATION_SKILL_KEYS: (keyof GraduationSkill)[] = ['name', 'purpose', 'input', 'steps', 'output', 'reuseNote'];

function isGraduationSkill(v: unknown): v is GraduationSkill {
  if (!v || typeof v !== 'object') return false;
  const candidate = v as Record<string, unknown>;
  return GRADUATION_SKILL_KEYS.every((k) => typeof candidate[k] === 'string');
}

/** 서버에 저장된 졸업 제출을 조회. 없거나(신규) 형식이 깨졌으면 null(신규 취급). */
export async function fetchGraduationSubmission(): Promise<SubmittedGraduation | null> {
  const submission = await fetchModuleSubmission('module6');
  if (!submission || !isGraduationSkill(submission.content)) return null;
  return { skill: submission.content, updatedAt: submission.updatedAt };
}

async function submitGraduationSkill(skill: GraduationSkill): Promise<boolean> {
  return saveModuleSubmission('module6', skill);
}

export function GraduationStep({
  skill,
  onChange,
  initialSubmission,
}: {
  skill: GraduationSkill;
  onChange: (v: GraduationSkill) => void;
  initialSubmission: SubmittedGraduation | null;
}) {
  const [submitted, setSubmitted] = useState<{ state: SubmittedGraduation; persisted: boolean } | null>(
    initialSubmission ? { state: initialSubmission, persisted: true } : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const requiredCount = requiredFilledCount(skill);
  const ready = requiredCount === REQUIRED_FIELDS.length;

  const handleSubmit = async () => {
    setSubmitting(true);
    const persisted = await submitGraduationSkill(skill);
    setSubmitted({ state: { skill, updatedAt: new Date().toISOString() }, persisted });
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="종합 · STEP 3/3"
        title="나만의 스킬 완성 = 졸업 산출물 제출 🎓"
        summary="이제 졸업 작품을 마무리해요. 모듈 2에서 만든 스킬 초안을 열어, 아래 칸이 다 채워졌는지 확인하고 제출하세요."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
        <div className="flex flex-col gap-3">
          {REQUIRED_FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {f.label}
              </span>
              <input
                type="text"
                value={skill[f.key]}
                onChange={(e) => onChange({ ...skill, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-[13px] outline-none"
                style={{ borderColor: skill[f.key].trim() ? TONE.accent : 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </label>
          ))}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              (선택) 재사용 메모
            </span>
            <input
              type="text"
              value={skill.reuseNote}
              onChange={(e) => onChange({ ...skill, reuseNote: e.target.value })}
              placeholder="예: 다른 프로젝트에서도 쓸 수 있음"
              className="w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-[13px] outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </label>
        </div>
      </section>

      {!ready ? (
        <section
          className="rounded-2xl border border-dashed p-4 text-center text-[12px] leading-[1.6]"
          style={{ borderColor: TONE.accentBorder, background: 'var(--demo-card-bg-alt)', color: 'var(--color-text-body)' }}
        >
          필수 5칸을 모두 채워야 제출할 수 있어요. (현재 {requiredCount}/{REQUIRED_FIELDS.length}칸)
        </section>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-xl border px-5 py-3 text-[14px] font-bold transition disabled:opacity-60"
          style={{ borderColor: TONE.accent, background: TONE.accentSoft, color: TONE.accent }}
        >
          {submitting ? '제출 중…' : '🎓 졸업 산출물 제출'}
        </button>
      )}

      {submitted ? (
        <section
          className="rounded-2xl border p-4"
          style={
            submitted.persisted
              ? { borderColor: TONE.accentBorder, background: TONE.accentSoft }
              : { borderColor: 'var(--color-danger, #dc2626)', background: 'var(--demo-card-bg-alt)' }
          }
        >
          <p
            className="m-0 text-[13px] font-semibold"
            style={{ color: submitted.persisted ? TONE.accent : 'var(--color-danger, #dc2626)' }}
          >
            {submitted.persisted
              ? `✅ 제출 완료 — ${submitted.state.skill.name || '나만의 스킬'}`
              : `⚠️ 저장 실패 — ${submitted.state.skill.name || '나만의 스킬'} (서버에 저장되지 않음)`}
          </p>
          {submitted.persisted ? (
            <p className="m-0 mt-1.5 text-[11px] leading-[1.6]" style={{ color: 'var(--color-text-body)' }}>
              🧪 이 프리뷰는 제출을 서버에 저장해요. 같은 브라우저로 재방문해도 유지됩니다. 실제 강사 확인은 세션 연동(3-C) 이후
              연결됩니다.
            </p>
          ) : (
            <p className="m-0 mt-1.5 text-[11px] leading-[1.6]" style={{ color: 'var(--color-text-body)' }}>
              네트워크 또는 서버 문제로 저장하지 못했어요. 다시 시도해 주세요 — 새로고침하면 이 화면의 입력값이 사라져요.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}

export function GraduationLoading() {
  return (
    <section
      className="rounded-2xl border border-dashed p-4 text-center text-[12px]"
      style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg-alt)', color: 'var(--color-text-body)' }}
    >
      이전 제출 확인 중…
    </section>
  );
}

// ── 이해 체크 ─────────────────────────────────────────────────────────────────
export const CHECK: CheckData = {
  eyebrow: '종합 · 이해 체크',
  question: '여러 단계를 하나로 묶는 자동화(/tdd-loop)가 하지 않는 것은?',
  options: [
    '테스트→구현→커밋 순서를 자동으로 실행',
    '순서를 건너뛰지 못하게 강제',
    '어디서 멈췄는지 알려줌',
    '머지 같은 중요한 승인까지 사람 대신 마음대로 결정',
  ],
  correctIdx: 3,
  explanationShort: '자동화는 순서만 자동으로 해줘요. 머지처럼 되돌리기 어려운 중요한 결정은 여전히 사람이 해요.',
  explanationMore: '"자동화 = 판단을 넘기는 게 아니라 반복을 더는 것." ①②③은 /tdd-loop이 실제로 하는 일이에요.',
};

// ── 도입 / 마무리 화면 ───────────────────────────────────────────────────────
export function IntroScreen() {
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="종합 · 도입"
        title="오늘은 지금까지 배운 걸 다 이어서 한 바퀴"
        summary="규칙 만들고(모듈1) → 스킬 박제(모듈2) → 뭘 만들지 기획(모듈3) → 테스트로 품질 통제(모듈4) → 안전하게 올리기(모듈5). 이게 하나의 흐름이에요."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
        <p className="m-0 text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          오늘 할 일
        </p>
        <p className="m-0 mt-1.5 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          마지막으로, <strong>여러분의 졸업 작품</strong> — 모듈 2에서 시작한 '나만의 스킬'을 완성해서 제출해요. (이 프리뷰에서는
          서버에 저장되고, 실제 졸업 인정은 강사 확인을 거칩니다.)
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
        eyebrow="종합 · 마무리"
        title="축하해요! 🎉 AI를 제대로 부리기"
        summary="이제 여러분은 AI에게 그냥 시키는 게 아니라, 규칙·기획·테스트·게이트로 품질을 통제할 수 있어요."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
        <p className="m-0 text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-primary)' }}>
          바이브코딩이 'AI로 앱 만들기'였다면, 이건 <strong>'AI를 제대로 부리기'</strong>예요. 여러분이 만든 스킬은 실제 개발에서도
          쓰는 패턴의 축소판이에요.
        </p>
      </section>
    </div>
  );
}
