// 하네스 심화 트랙 — 모듈 3(기획 · 요구사항·이슈·AC) 작업대.
// 콘텐츠 원본: docs/harness-course-curriculum/content/모듈3_기획_콘텐츠.md
// 흐름: 도입 → STEP1 요구사항 인터뷰→spec 카드(각본) → STEP2 PRD 한 장·안 할 것(각본) →
//       STEP3 수직 슬라이스로 쪼개기(각본) → STEP4 조각 2·3에 AC 3줄 직접 작성(학생 입력,
//       조각1은 예시 제공) → 이해 체크 → 마무리.
// 공용 키트(_kit)의 검증된 부품 재사용. STEP4 AC 작성 칸만 모듈 3 고유(인터랙티브, 각본 재생 아님).
// 3-B: AC 입력은 디바운스 자동저장으로 서버(architecture_submissions, module_id='module3')에
// 보관된다. 명시적 제출 버튼은 없음(기존 UX에 그런 지점이 없어 자동저장으로 설계).
import { useEffect, useRef, useState } from 'react';
import { Hero, getTone } from '../demos/_shared';
import { fetchModuleSubmission, saveModuleSubmission } from './submission-client';
import { type CheckData, type PlaybackStep } from './_kit';

export const TONE = getTone(5); // 모듈 3 accent (ch05 톤 — 콘텐츠 원본 대응 4/6/7강)

// ── F1: 개념 앵커 (spec → PRD → 슬라이스 → AC) ───────────────────────────────
export const ANCHOR_PHASES = [
  { key: 'spec', dot: '💬', ko: '인터뷰 · spec', hint: '무슨 기능? 누구를 위해?' },
  { key: 'prd', dot: '📄', ko: 'PRD', hint: '안 할 것까지 정하기' },
  { key: 'slice', dot: '✂️', ko: '수직 슬라이스', hint: '사용자가 볼 조각으로 쪼개기' },
  { key: 'ac', dot: '📋', ko: 'AC 3줄', hint: 'Given · When · Then' },
];
export const ANCHOR_HEADLINE = (
  <>
    "뭘 만들지부터 제대로 정하는 게 절반"이에요. 인터뷰로 <strong style={{ color: TONE.accent }}>spec</strong>을 정하고 →
    안 할 것까지 담은 <strong style={{ color: TONE.accent }}>PRD</strong>를 쓰고 → 사용자가 볼 수 있는 조각으로{' '}
    <strong style={{ color: TONE.accent }}>슬라이스</strong>하고 → 조각마다 <strong style={{ color: TONE.accent }}>약속(AC)</strong>을
    붙여요.
  </>
);
export const ANCHOR_DONE = '✅ 한 바퀴 완주! 인터뷰 → PRD → 수직 슬라이스 → AC까지 기획 카드 세트를 다 만들었어요.';

// ── STEP 1 (각본): 요구사항 인터뷰 → spec 카드 ───────────────────────────────
export const STEP1: PlaybackStep = {
  id: 'spec',
  nav: 'STEP 1 · spec',
  phase: '1차시 — 인터뷰 → PRD',
  anchorKey: 'spec',
  eyebrow: '기획 · STEP 1/4',
  title: 'AI 요구사항 인터뷰 → spec 카드',
  summary:
    'AI가 질문을 던져요. "무슨 기능? 누구를 위해? 꼭 있어야 하는 건?" 답을 고르면 그게 spec 카드로 정리돼요.',
  instruction: "'노트 앱에 즐겨찾기 기능'을 만들고 싶어. 뭘 만들지 인터뷰해줘. 질문을 하나씩 해주면 내가 답할게.",
  runLabel: '▶ 실행 — 인터뷰 진행',
  resultTitle: '💬 AI의 인터뷰 결과 — spec 카드 완성',
  chips: [
    '누가 써요? → 노트를 많이 쓰는 사람',
    '어디서 봐요? → 맨 위에 따로 모아서',
    '개수 제한? → 없음',
    '지금: 별표 켜고 끄기 / 나중: 즐겨찾기 폴더',
  ],
  chipDesc: '✔ spec 카드 완성: "노트에 별표를 켜고 끄면, 별표한 노트가 맨 위에 모인다."',
  logLabel: '원본 로그 — 인터뷰 → spec',
  rawLog: [
    'AI: 이 기능, 누가 주로 써요?',
    '[선택] 노트를 많이 쓰는 사람',
    'AI: 즐겨찾기한 노트는 어디서 보고 싶어요?',
    '[선택] 맨 위에 따로 모아서',
    'AI: 개수 제한 둘까요?',
    '[선택] 제한 없음',
    'AI: 지금 꼭 필요한 것과 나중에 해도 되는 걸 나눠볼까요?',
    '[선택] 지금=별표 켜고 끄기 / 나중=폴더 나누기',
    '',
    '✔ spec-fixed: "노트 별표 켜고 끄기 → 별표한 노트를 맨 위에 모음"',
  ].join('\n'),
};

// ── STEP 2 (각본): PRD 한 장 (안 할 것 표시) ─────────────────────────────────
export const STEP2: PlaybackStep = {
  id: 'prd',
  nav: 'STEP 2 · PRD',
  phase: '1차시 — 인터뷰 → PRD',
  anchorKey: 'prd',
  eyebrow: '기획 · STEP 2/4',
  title: 'PRD 한 장 (안 할 것 표시)',
  summary:
    'spec을 한 장짜리 기획서(PRD)로 정리해요. 여기서 제일 중요한 건 "안 할 것(Out of Scope)"을 적는 거예요. 안 적으면 AI가 시키지도 않은 걸 임의로 만들어버리거든요.',
  runLabel: '▶ 실행 — PRD 작성',
  resultTitle: '📄 PRD 한 장',
  chips: [
    '만드는 것: 별표 켜기/끄기 · 맨 위 정렬',
    '누구를 위해: 노트가 많은 사용자',
    '🚫 안 할 것: 폴더 분류 · 색깔 지정 · 공유',
  ],
  chipDesc: '"안 할 것"을 적었으니, AI가 폴더나 색깔을 멋대로 안 만들어요. 이게 통제예요.',
  logLabel: '원본 로그 — PRD',
  rawLog: [
    '# PRD — 노트 즐겨찾기',
    '## 만드는 것',
    '- 노트 별표 켜기/끄기',
    '- 별표한 노트를 목록 맨 위에 모으기',
    '## 누구를 위해',
    '- 노트가 많은 사용자',
    '## 🚫 Out of Scope (이번에 안 함)',
    '- 즐겨찾기 폴더 분류',
    '- 별표 색상 지정',
    '- 노트 공유',
  ].join('\n'),
};

// ── STEP 3 (각본): 수직 슬라이스로 쪼개기 ────────────────────────────────────
export const STEP3: PlaybackStep = {
  id: 'slice',
  nav: 'STEP 3 · 슬라이스',
  phase: '2차시 — 슬라이스 → AC',
  anchorKey: 'slice',
  eyebrow: '기획 · STEP 3/4',
  title: '수직 슬라이스로 쪼개기',
  summary:
    '큰 기능을 조각내는 방법이 두 가지예요. 가로로 쪼개면(화면 먼저 다 → 기능 나중) 중간에 아무것도 못 봐요. 세로(수직)로 쪼개면 조각 하나마다 사용자가 실제로 쓸 수 있어요.',
  runLabel: '▶ 실행 — 슬라이스 나누기',
  resultTitle: '✂️ 수직 슬라이스 (조각마다 사용자가 볼 게 있음)',
  chips: [
    '조각1: 별표 버튼 표시+토글 → 바로 씀 ✅',
    '조각2: 별표 노트 맨 위로 → 바로 봄 ✅',
    '조각3: 새로고침해도 유지 → 체감 ✅',
  ],
  chipDesc: '❌ 나쁜 예(가로): "별표 관련 코드 전부 → 그 다음 화면 전부" = 중간에 아무것도 못 봄.',
  logLabel: '원본 로그 — 수직 슬라이스',
  rawLog: [
    '[수직 슬라이스 — 각 조각이 완결된 사용자 가치]',
    '조각1: 별표 버튼 표시 + 토글        → 사용자가 즉시 사용 가능',
    '조각2: 별표 노트 상단 정렬          → 사용자가 즉시 확인 가능',
    '조각3: 새로고침 후에도 별표 유지    → 사용자가 체감',
    '',
    '[대조 — 수평 슬라이스(나쁨)]',
    '1단계: 별표 관련 로직 전부',
    '2단계: 별표 관련 화면 전부',
    '→ 1단계 끝나도 사용자는 아무것도 못 봄',
  ].join('\n'),
};

// ── STEP 4 (학생 직접 작성): 조각 2·3에 AC 3줄 ───────────────────────────────
export type ACEntry = { given: string; when: string; then: string };
export const EMPTY_AC: ACEntry = { given: '', when: '', then: '' };
export type Module3AC = { slice2: ACEntry; slice3: ACEntry };
export const EMPTY_MODULE3_AC: Module3AC = { slice2: { ...EMPTY_AC }, slice3: { ...EMPTY_AC } };

export function acFilledCount(ac: Module3AC): number {
  const fields: ACEntry[] = [ac.slice2, ac.slice3];
  return fields.reduce((n, e) => n + (e.given.trim() ? 1 : 0) + (e.when.trim() ? 1 : 0) + (e.then.trim() ? 1 : 0), 0);
}

const AC_ENTRY_KEYS: (keyof ACEntry)[] = ['given', 'when', 'then'];

function isACEntry(v: unknown): v is ACEntry {
  if (!v || typeof v !== 'object') return false;
  const candidate = v as Record<string, unknown>;
  return AC_ENTRY_KEYS.every((k) => typeof candidate[k] === 'string');
}

function isModule3AC(v: unknown): v is Module3AC {
  if (!v || typeof v !== 'object') return false;
  const candidate = v as Record<string, unknown>;
  return isACEntry(candidate.slice2) && isACEntry(candidate.slice3);
}

/** 서버에 자동저장된 AC 입력을 조회. 없거나(신규) 형식이 깨졌으면 null(신규 취급). */
export async function fetchModule3Ac(): Promise<Module3AC | null> {
  const submission = await fetchModuleSubmission('module3');
  if (!submission || !isModule3AC(submission.content)) return null;
  return submission.content;
}

export function ACLoading() {
  return (
    <section
      className="rounded-2xl border border-dashed p-4 text-center text-[12px]"
      style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg-alt)', color: 'var(--color-text-body)' }}
    >
      이전 입력 확인 중…
    </section>
  );
}

function ACFieldGroup({
  title,
  value,
  onChange,
}: {
  title: string;
  value: ACEntry;
  onChange: (v: ACEntry) => void;
}) {
  return (
    <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
      <p className="m-0 mb-2 text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {(
          [
            ['given', 'Given (상황)', '예: 노트가 여러 개 있고 별표가 켜진 게 없을 때'],
            ['when', 'When (행동)', '예: 별표한 노트가 3개 생기면'],
            ['then', 'Then (결과)', '예: 그 3개가 목록 맨 위로 자동 이동한다'],
          ] as const
        ).map(([key, label, placeholder]) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {label}
            </span>
            <input
              type="text"
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-[13px] outline-none"
              style={{ borderColor: value[key].trim() ? TONE.accent : 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

export function ACWriteStep({ ac, onChange }: { ac: Module3AC; onChange: (v: Module3AC) => void }) {
  const count = acFilledCount(ac);
  const done = count === 6;
  const [syncFailed, setSyncFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFirstRef = useRef(true);

  useEffect(() => {
    // 마운트 시(서버에서 막 복원한 초기값)엔 저장하지 않음 — 사용자가 실제로 바꾼 뒤부터 자동저장.
    if (skipFirstRef.current) {
      skipFirstRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveModuleSubmission('module3', ac).then((ok) => setSyncFailed(!ok));
    }, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ac]);

  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="기획 · STEP 4/4"
        title="각 조각에 AC 3줄 (직접 작성)"
        summary="이제 조각마다 약속(AC)을 붙여요. 딱 3줄, 평범한 말로. 비개발자도 검사할 수 있게. 조각 1을 예시로 보여드릴 테니, 조각 2·3은 여러분이 직접 채워보세요."
        tone={TONE}
        summaryTone="stone"
      />
      <section
        className="rounded-2xl border px-4 py-3"
        style={{ borderColor: TONE.accentBorder, background: 'var(--demo-log-bg-navy)', color: 'var(--demo-log-fg)' }}
      >
        <p className="m-0 mb-1.5 text-[11px]" style={{ color: 'var(--demo-log-time-neutral)' }}>
          조각 1 — 예시 (각본 제공)
        </p>
        <pre className="m-0 overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-[1.8]">
          {[
            'Given: 노트가 하나 있고 별표가 꺼져 있을 때',
            'When: 그 노트의 별표 버튼을 누르면',
            'Then: 별표가 켜지고, 다시 누르면 꺼진다',
          ].join('\n')}
        </pre>
      </section>
      <ACFieldGroup title="조각 2 — 별표한 노트가 맨 위로 정렬" value={ac.slice2} onChange={(v) => onChange({ ...ac, slice2: v })} />
      <ACFieldGroup title="조각 3 — 새로고침해도 별표 유지" value={ac.slice3} onChange={(v) => onChange({ ...ac, slice3: v })} />
      {syncFailed ? (
        <p className="m-0 text-[11px]" style={{ color: 'var(--color-danger, #dc2626)' }}>
          ⚠️ 저장 동기화 실패 — 네트워크를 확인해주세요. 다음 입력에서 다시 시도합니다.
        </p>
      ) : null}
      {done ? (
        <p className="m-0 text-[12px]" style={{ color: TONE.accent }}>
          ✅ AC 3줄 x 2조각 완성 — 기획 카드 세트가 완성됐어요.
        </p>
      ) : (
        <section
          className="rounded-2xl border border-dashed p-4 text-center text-[12px] leading-[1.6]"
          style={{ borderColor: TONE.accentBorder, background: 'var(--demo-card-bg-alt)', color: 'var(--color-text-body)' }}
        >
          Given·When·Then 6칸을 모두 채우세요. (현재 {count}/6칸)
        </section>
      )}
    </div>
  );
}

// ── 이해 체크 ─────────────────────────────────────────────────────────────────
export const CHECK: CheckData = {
  eyebrow: '기획 · 이해 체크',
  question: 'PRD(기획서)에 "안 할 것(Out of Scope)"을 꼭 적는 이유는?',
  options: ['문서를 길게 만들려고', '적어두지 않으면 AI가 시키지 않은 기능까지 임의로 만들어버리기 때문', '법적으로 필요해서', '안 할 것이 진짜 만들 것이라서'],
  correctIdx: 1,
  explanationShort: '"안 할 것"을 정해두면 AI가 폴더·색깔·공유 같은 걸 멋대로 안 만들어요.',
  explanationMore: '범위를 딱 정하는 게 AI를 통제하는 방법이에요. 이 약속(AC)이 다음 모듈 TDD의 "테스트"로 바로 이어져요.',
};

// ── 도입 / 마무리 화면 ───────────────────────────────────────────────────────
export function IntroScreen() {
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="기획 · 도입"
        title="뭘 만들지부터 제대로 정하는 게 절반"
        summary="바이브코딩에선 '만들어줘' 하면 바로 만들었죠. 그런데 큰 걸 만들 땐, 뭘 만들지부터 제대로 정하는 게 절반이에요. 요구사항 단계에서 실수 하나 고치는 비용이 1이면, 다 만든 뒤 고치는 비용은 100이에요."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
        <p className="m-0 text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          오늘 할 일
        </p>
        <p className="m-0 mt-1.5 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          AI와 <strong>인터뷰</strong>하며 기획을 정리하고, 큰 기능을 <strong>작은 조각</strong>으로 쪼개고, 각 조각에{' '}
          <strong>약속(AC)</strong>을 붙입니다.
        </p>
        <p className="m-0 mt-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          아래 <strong>다음 →</strong>을 눌러 시작하세요.
        </p>
      </section>
    </div>
  );
}

export function WrapScreen({ ac }: { ac: Module3AC }) {
  const done = acFilledCount(ac) === 6;
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="기획 · 마무리"
        title="한 바퀴 끝! 기획 카드 세트 완성"
        summary="무엇을 만들지(spec) → 안 할 것까지 정하기(PRD) → 사용자가 볼 수 있게 쪼개기(수직 슬라이스) → 약속 붙이기(AC)."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
        <p className="m-0 text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
          {done ? (
            <>오늘 만든 것: <strong>기획 카드 세트</strong> — spec · PRD · 슬라이스 · 직접 쓴 AC.</>
          ) : (
            <>오늘 배운 것: 큰 기능도 사용자가 볼 수 있는 조각으로 쪼개고, 조각마다 약속(AC)을 붙인다.</>
          )}
        </p>
        <p className="m-0 mt-2 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          이 약속(AC)이 다음 시간 <strong>TDD의 "테스트"</strong>로 바로 이어져요. (모듈 4)
        </p>
      </section>
    </div>
  );
}
