// 하네스 심화 트랙 — 모듈 2(나만의 스킬 · /init) 작업대.
// 콘텐츠 원본: docs/harness-course-curriculum/content/모듈2_init_스킬_콘텐츠.md
// 흐름: 도입 → STEP1 /init 실행 관찰(각본) → STEP2 스킬 템플릿 채우기(학생 입력, 5칸) →
//       STEP3 스킬 실행 2회 → "매번 같은 형식" 확인(각본, 입력값 반영) → 이해 체크 → 마무리.
// 공용 키트(_kit)의 검증된 부품 재사용. STEP2 스킬 템플릿만 모듈 2 고유(인터랙티브).
// ⭐ 여기서 채운 스킬 초안은 콘텐츠상 모듈 6 졸업 산출물의 씨앗이지만, 이 프리뷰는 격리 상태만
//    소유한다(크로스 모듈 상태 유지는 세션/제출 인프라 필요 — 3-B/3-C 이후).
import { Hero, getTone } from '../demos/_shared';
import { GatedReveal, TerminalBlock, type CheckData, type PlaybackStep } from './_kit';

export const TONE = getTone(2); // 모듈 2 accent (ch02 톤)

// ── F1: 개념 앵커 (/init 관찰 → 스킬 초안 → 확인) ───────────────────────────
export const ANCHOR_PHASES = [
  { key: 'init', dot: '🔍', ko: '/init 관찰', hint: 'AI가 프로젝트를 분석해 규칙 초안 생성' },
  { key: 'draft', dot: '📝', ko: '스킬 초안', hint: '반복 작업을 템플릿으로 박제' },
  { key: 'confirm', dot: '✅', ko: '스킬 확인', hint: '실행 2회 → 같은 형식' },
];
export const ANCHOR_HEADLINE = (
  <>
    <strong style={{ color: TONE.accent }}>스킬 = 반복 작업을 박제한 템플릿</strong>. `/init`으로 AI가 첫 규칙 문서를 자동
    생성하는 걸 본 뒤 → 나만의 스킬 초안을 직접 채우고 → 실행해 형식이 일정한지 확인해요.
  </>
);
export const ANCHOR_DONE = '✅ 한 바퀴 완주! /init 관찰 → 스킬 초안 채우기 → 실행 확인까지 다 봤어요.';

// ── STEP 1 (각본): /init 실행 관찰 ───────────────────────────────────────────
export const STEP1: PlaybackStep = {
  id: 'init',
  nav: 'STEP 1 · /init',
  phase: '2차시 — /init 관찰 → 스킬 초안 → 확인',
  anchorKey: 'init',
  eyebrow: '나만의 스킬 · STEP 1/3',
  title: '/init 실행 관찰',
  summary:
    '모듈 1에선 규칙을 손으로 골랐죠. /init은 AI가 기존 프로젝트를 스스로 분석해서 첫 CLAUDE.md 초안을 만들어줘요. 빈 프로젝트엔 소용없고, 이미 코드가 있을 때 써요.',
  instruction: '/init',
  runLabel: '▶ 실행 — /init',
  resultTitle: '🟦 AI가 프로젝트를 분석해 CLAUDE.md 초안을 만들었어요',
  chips: ['웹 앱, 화면은 src/ 폴더', '컴포넌트(부품) 구조 감지', '규칙 초안 2개 자동 삽입'],
  chipDesc:
    '⚠️ 하지만 자동 생성으로 끝이 아니에요. 열어보고 부족한 걸 채워야 해요. ("init만 해놓고 다 됐겠지 하면 안 돼요")',
  logLabel: '원본 로그 — /init',
  rawLog: [
    '$ /init',
    '',
    '분석 중… src/ 폴더 12개 파일 확인',
    '→ 감지: 웹 앱 (컴포넌트 구조), 부품은 src/components/',
    '',
    '✔ CLAUDE.md 초안을 생성했어요:',
    '',
    '# 프로젝트 안내 (AI용)',
    '## 구조',
    '- 화면 부품(컴포넌트)은 src/components/ 에 있음',
    '## 규칙 (초안 — 확인 필요)',
    '- 컴포넌트 이름은 대문자로 시작 (예: NoteList)',
    '- 한 파일은 한 부품만',
    '',
    '⚠️ 이건 초안이에요. 열어보고 부족한 규칙을 채우세요.',
  ].join('\n'),
};

// ── STEP 2 (학생 입력): 스킬 템플릿 채우기 ───────────────────────────────────
export type SkillDraft = { name: string; purpose: string; input: string; steps: string; output: string };
export const EMPTY_DRAFT: SkillDraft = { name: '', purpose: '', input: '', steps: '', output: '' };

const FIELDS: { key: keyof SkillDraft; label: string; placeholder: string }[] = [
  { key: 'name', label: '이름', placeholder: '예: 아키텍처 그림 스킬' },
  { key: 'purpose', label: '목적 한 줄', placeholder: '예: 프로젝트 구조를 그림으로 그려준다' },
  { key: 'input', label: '입력', placeholder: '예: 분석할 소스 폴더' },
  { key: 'steps', label: '절차', placeholder: '예: ①폴더 분석 → ②부품 관계 파악 → ③다이어그램 생성 → ④브라우저로 열기' },
  { key: 'output', label: '결과', placeholder: '예: 구조 다이어그램(브라우저에서 열림)' },
];

export function draftFilledCount(v: SkillDraft): number {
  return FIELDS.filter((f) => v[f.key].trim()).length;
}

export function SkillDraftForm({ value, onChange }: { value: SkillDraft; onChange: (v: SkillDraft) => void }) {
  const count = draftFilledCount(value);
  const done = count === FIELDS.length;
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="나만의 스킬 · STEP 2/3"
        title="스킬 템플릿 채우기"
        summary="이제 나만의 스킬을 만들어요. 반복 작업 하나를 골라 아래 5칸을 채우면, 앞으로 버튼 하나로 같은 결과가 나와요."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
        <div className="flex flex-col gap-3">
          {FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {f.label}
              </span>
              <input
                type="text"
                value={value[f.key]}
                onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-[13px] outline-none"
                style={{ borderColor: value[f.key].trim() ? TONE.accent : 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </label>
          ))}
        </div>
        <p className="m-0 mt-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          💡 이 템플릿을 잘 채우는 게 졸업 작품의 절반이에요. 모듈 6에서 이걸 완성해요.
        </p>
      </section>
      {done ? (
        <p className="m-0 text-[12px]" style={{ color: TONE.accent }}>
          ✅ 스킬 초안 완성 — 다음 STEP에서 실행해봐요.
        </p>
      ) : (
        <section
          className="rounded-2xl border border-dashed p-4 text-center text-[12px] leading-[1.6]"
          style={{ borderColor: TONE.accentBorder, background: 'var(--demo-card-bg-alt)', color: 'var(--color-text-body)' }}
        >
          5칸을 모두 채워 스킬 초안을 완성하세요. (현재 {count}/{FIELDS.length}칸)
        </section>
      )}
    </div>
  );
}

// ── STEP 3 (각본, 입력값 반영): 스킬 실행 2회 → "매번 같은 형식" 확인 ────────
export function SkillRunStep({ draft }: { draft: SkillDraft }) {
  const name = draft.name.trim() || '아키텍처 그림 스킬';
  const input = draft.input.trim() || '분석할 소스 폴더';
  const steps = draft.steps.trim() || '①폴더 분석 → ②부품 관계 파악 → ③다이어그램 생성 → ④브라우저로 열기';
  const output = draft.output.trim() || '구조 다이어그램(브라우저에서 열림)';
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="나만의 스킬 · STEP 3/3"
        title="스킬 실행 → 매번 같은 형식 확인"
        summary="채운 스킬을 실행해봐요. 그리고 한 번 더 실행해요. 두 번 다 같은 형식으로 나오는지 보세요 — 그게 스킬의 핵심이에요."
        tone={TONE}
        summaryTone="stone"
      />
      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}
      >
        <div className="mb-1.5 flex items-center gap-2">
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: TONE.accent, color: '#fff' }}>
            시키기
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            아래 ▶실행을 2회 눌러 결과를 재생해요
          </span>
        </div>
        <p className="m-0 font-mono text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-primary)' }}>
          {name} 실행
        </p>
      </section>
      <GatedReveal
        runLabel="▶ 실행 — 스킬 2회 실행"
        tone={TONE}
        note="각본형 — 정해진 결과가 재생돼요(실제 AI 호출 없음)."
      >
        <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
          <h3 className="m-0 text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            ✨ {output}이(가) 생성됐어요 (2회 다 같은 형식)
          </h3>
          <div className="mt-3 flex flex-col gap-2">
            <div className="rounded-xl border p-3" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg-alt)' }}>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                1번째 실행
              </div>
              <div className="mt-0.5 text-[13px]" style={{ color: 'var(--color-text-body)' }}>
                결과 A <span style={{ color: 'var(--color-text-muted)' }}>— 같은 색·같은 레이아웃</span>
              </div>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                2번째 실행
              </div>
              <div className="mt-0.5 text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                결과 A <span style={{ color: TONE.accent }}>— 형식 동일, 내용만 최신 반영</span>
              </div>
            </div>
          </div>
          <p className="m-0 mt-3 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
            손으로 매번 그렸다면 제각각이었을 거예요. 스킬로 박제했으니 <strong>누가 언제 눌러도 같은 형식</strong>이에요.
          </p>
        </section>
        <TerminalBlock
          label="원본 로그 — 스킬 2회 실행"
          text={[
            `$ ${name} 실행  [1회차]`,
            `→ 입력: ${input}`,
            `→ ${steps}`,
            `→ 결과: ${output} ✅`,
            '',
            `$ ${name} 실행  [2회차]`,
            '→ 같은 절차, 같은 형식(레이아웃 동일)',
            '→ 달라진 건 최신 내용이 반영된 것뿐 ✅',
            '',
            '→ 두 번 다 동일한 형식 = 스킬이 박제되었다는 증거',
          ].join('\n')}
        />
      </GatedReveal>
    </div>
  );
}

// ── 이해 체크 ─────────────────────────────────────────────────────────────────
export const CHECK: CheckData = {
  eyebrow: '나만의 스킬 · 이해 체크',
  question: '"스킬"을 가장 잘 설명한 것은?',
  options: [
    'AI가 스스로 판단해서 매번 다르게 일하는 것',
    '반복하는 작업을 템플릿으로 박제해, 누가 눌러도 같은 결과가 나오게 하는 것',
    '프로젝트를 삭제하는 명령',
    '인터넷에서 코드를 받아오는 기능',
  ],
  correctIdx: 1,
  explanationShort: '스킬 = "회의록 템플릿"과 같아요. 한 번 잘 만들어두면 매번 같은 형식으로 나와요.',
  explanationMore:
    '①처럼 매번 다르게 일하는 건 오히려 스킬이 없는 상태예요. 반대로 /init은 한 번만 쓰는 것(첫 규칙 문서 자동 생성)이라 스킬과 역할이 달라요.',
};

// ── 도입 / 마무리 화면 ───────────────────────────────────────────────────────
export function IntroScreen() {
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="나만의 스킬 · 도입"
        title="반복 작업을 템플릿으로 박제한다"
        summary="회의록을 매번 다른 양식으로 쓰면 헷갈리죠. 그래서 템플릿을 만들어 두잖아요. AI한테도 똑같이 해줄 수 있어요. 반복하는 작업을 템플릿으로 박제해두면, 그 다음부턴 버튼 하나로 매번 같은 결과가 나와요 — 그게 스킬이에요."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
        <p className="m-0 text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          오늘 할 일
        </p>
        <p className="m-0 mt-1.5 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          ① <strong>/init</strong> — AI가 첫 규칙 문서를 자동으로 만들어주는 것. ② <strong>나만의 스킬</strong> — 여러분이 직접
          템플릿을 채우는 것. 이 스킬이 이 과정 <strong>졸업 작품의 시작</strong>입니다.
        </p>
        <p className="m-0 mt-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          아래 <strong>다음 →</strong>을 눌러 시작하세요.
        </p>
      </section>
    </div>
  );
}

export function WrapScreen({ draft }: { draft: SkillDraft }) {
  const count = draftFilledCount(draft);
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="나만의 스킬 · 마무리"
        title="한 바퀴 끝! /init과 스킬은 역할이 다르다"
        summary="/init = AI가 첫 규칙 문서 자동 생성(기존 프로젝트용). 스킬 = 반복 작업을 박제한 템플릿."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
        <p className="m-0 text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
          {count === FIELDS.length ? (
            <>
              오늘 만든 것: <strong>{draft.name.trim() || '나만의 스킬'} 초안</strong> 5칸 완성.
            </>
          ) : (
            <>오늘 배운 것: 반복 작업을 템플릿으로 박제하면 누가 눌러도 같은 결과가 나온다.</>
          )}
        </p>
        <p className="m-0 mt-2 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          {count === FIELDS.length ? (
            <>
              오늘 만든 스킬 초안, 잘 저장해뒀어요 — <strong>모듈 6 졸업 작품</strong>이 됩니다.
            </>
          ) : (
            <>
              STEP 2로 돌아가 5칸을 마저 채우면, 그 초안이 <strong>모듈 6 졸업 작품</strong>의 시작이 됩니다.
            </>
          )}
        </p>
      </section>
    </div>
  );
}
