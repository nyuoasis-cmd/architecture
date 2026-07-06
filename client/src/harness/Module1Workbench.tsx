// 하네스 심화 트랙 — 모듈 1(왜 하네스인가 · CLAUDE.md) 작업대.
// 콘텐츠 원본: docs/harness-course-curriculum/content/모듈1_CLAUDEmd_콘텐츠.md
// 흐름: 도입 → STEP1 규칙 없이 제각각(각본) → STEP2 팀 규칙 고르기(학생 입력) →
//       STEP3 규칙 넣고 다시 실행 before/after(각본) → 이해 체크 → 마무리.
// 공용 키트(_kit)의 검증된 부품 재사용. STEP2 규칙 선택기만 모듈 1 고유(인터랙티브).
import { Hero } from '../demos/_shared';
import { getTone } from '../demos/_shared';
import { GatedReveal, TerminalBlock, type CheckData, type PlaybackStep } from './_kit';

export const TONE = getTone(1); // 모듈 1 accent (ch01 톤)

// ── F1: 개념 앵커 (관찰 → 규칙 → 확인) ───────────────────────────────────────
export const ANCHOR_PHASES = [
  { key: 'observe', dot: '🌀', ko: '제각각 관찰', hint: '규칙 없으면 결과가 매번 다름' },
  { key: 'rule', dot: '📋', ko: '규칙 정하기', hint: '팀 규칙 = CLAUDE.md 한 장' },
  { key: 'confirm', dot: '✅', ko: '일관 확인', hint: '규칙 넣고 다시 → 일관됨' },
];
export const ANCHOR_HEADLINE = (
  <>
    CLAUDE.md = <strong style={{ color: TONE.accent }}>AI에게 주는 팀 규칙 문서</strong>. 규칙 없이 제각각인 걸 본 뒤 →
    규칙을 정하고 → 다시 시켜 일관됨을 확인해요. 지금 어디쯤인지 아래에서 확인하세요.
  </>
);
export const ANCHOR_DONE = '✅ 한 바퀴 완주! 규칙 없음(제각각) → 규칙 정하기 → 규칙 적용(일관)을 다 봤어요.';

// ── STEP 1 (각본): 규칙 없이 2회 → 제각각 ────────────────────────────────────
export const STEP1: PlaybackStep = {
  id: 'observe',
  nav: 'STEP 1 · 관찰',
  phase: '1차시 — 규칙 없음 → 규칙 → 확인',
  anchorKey: 'observe',
  eyebrow: '왜 하네스인가 · STEP 1/4',
  title: '규칙 없이 두 번 시켜 "제각각" 보기',
  summary: '먼저 규칙 없이 AI에게 같은 일을 두 번 시켜볼게요. 결과가 같을까요? 눌러서 직접 보세요.',
  instruction: '버튼을 눌렀을 때 실행되는 함수를 하나 만들어줘.',
  runLabel: '▶ 실행 — 같은 지시를 2번 시키기',
  resultTitle: '🟨 같은 지시인데 결과가 달라요',
  chips: ['1번째: handleClick', '2번째: onClickHandler', '둘 다 오류 0', '스타일 제각각'],
  chipDesc:
    '둘 다 오류는 없어요 — 그냥 스타일이 다를 뿐이죠. 그런데 한 프로젝트 안에서 이름 붙이는 방식이 제각각이면 나중에 찾기도 어렵고 헷갈려요. AI는 따라야 할 규칙이 없으면 그때그때 아무 방식이나 골라요.',
  logLabel: '원본 로그 — 규칙 없이 2회',
  rawLog: [
    '[1번째 실행]',
    'function handleClick() {',
    '  // 버튼 클릭 처리',
    '}',
    '',
    '[2번째 실행]  ← 같은 지시, 다른 결과',
    'const onClickHandler = () => {',
    '  // 버튼 클릭 이벤트',
    '}',
    '',
    '→ 이름: handleClick vs onClickHandler',
    '→ 방식: 일반 함수 vs 화살표 함수',
    '둘 다 정상 동작. 하지만 스타일 제각각.',
  ].join('\n'),
};

// ── STEP 2 (학생 입력): 팀 규칙 고르기 → CLAUDE.md 카드 완성 ──────────────────
export type Module1Rules = { ids: string[]; custom: string };
export const EMPTY_RULES: Module1Rules = { ids: [], custom: '' };

const RULE_CARDS: { id: string; label: string; rule: string }[] = [
  { id: 'naming', label: '네이밍', rule: '버튼 이벤트 함수 이름은 앞에 handle 을 붙인다 (예: handleSubmit)' },
  { id: 'filelen', label: '파일 길이', rule: '한 파일이 200줄을 넘으면 나눈다' },
  { id: 'comment', label: '주석', rule: '왜 그렇게 했는지 한 줄 주석을 남긴다' },
  { id: 'color', label: '색상', rule: '색은 코드(#FF0000) 대신 정해둔 이름으로 쓴다' },
];

export function selectedRuleTexts(value: Module1Rules): string[] {
  return [
    ...RULE_CARDS.filter((c) => value.ids.includes(c.id)).map((c) => c.rule),
    ...(value.custom.trim() ? [value.custom.trim()] : []),
  ];
}
export function ruleCount(value: Module1Rules): number {
  return value.ids.length + (value.custom.trim() ? 1 : 0);
}

export function RulePicker({ value, onChange }: { value: Module1Rules; onChange: (v: Module1Rules) => void }) {
  const count = ruleCount(value);
  const done = count >= 3;
  const rules = selectedRuleTexts(value);
  const toggle = (id: string) =>
    onChange({ ...value, ids: value.ids.includes(id) ? value.ids.filter((x) => x !== id) : [...value.ids, id] });

  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="왜 하네스인가 · STEP 2/4"
        title="팀 규칙 고르기 → 우리 팀 CLAUDE.md 완성"
        summary="이제 우리 팀 규칙을 정해요. 아래에서 3개 이상을 고르거나 직접 써넣으세요. 이게 AI가 매번 읽을 규칙이에요."
        tone={TONE}
        summaryTone="stone"
      />

      {/* 규칙 카드 (토글) */}
      <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
        <div className="flex flex-col gap-2">
          {RULE_CARDS.map((c) => {
            const on = value.ids.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className="flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition"
                style={{
                  borderColor: on ? TONE.accent : 'var(--color-border)',
                  background: on ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
                }}
              >
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[11px] font-bold"
                  style={{
                    borderColor: on ? TONE.accent : 'var(--color-border)',
                    background: on ? TONE.accent : 'transparent',
                    color: on ? '#fff' : 'transparent',
                  }}
                >
                  ✓
                </span>
                <span>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {c.label}
                  </span>
                  <span className="ml-2 text-[12px]" style={{ color: 'var(--color-text-body)' }}>
                    {c.rule}
                  </span>
                </span>
              </button>
            );
          })}

          {/* 직접 입력 */}
          <div
            className="rounded-xl border px-3 py-2.5"
            style={{
              borderColor: value.custom.trim() ? TONE.accent : 'var(--color-border)',
              background: value.custom.trim() ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
            }}
          >
            <label className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              직접 입력
            </label>
            <input
              type="text"
              value={value.custom}
              onChange={(e) => onChange({ ...value, custom: e.target.value })}
              placeholder="예: 커밋 메시지는 한글로 쓴다"
              className="mt-1.5 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-[13px] outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>
        <p className="m-0 mt-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          💡 CLAUDE.md는 <strong>짧게!</strong> AI가 매번 읽으니까 길면 느려져요.
        </p>
      </section>

      {/* 완성되는 CLAUDE.md 카드 */}
      {done ? (
        <section
          className="rounded-2xl border px-4 py-3"
          style={{ borderColor: TONE.accentBorder, background: 'var(--demo-log-bg-navy)', color: 'var(--demo-log-fg)' }}
        >
          <p className="m-0 mb-1.5 text-[11px]" style={{ color: 'var(--demo-log-time-neutral)' }}>
            우리 팀 CLAUDE.md (완성)
          </p>
          <pre className="m-0 overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-[1.8]">
            {['# CLAUDE.md', '', '## 코딩 규칙', ...rules.map((r) => `- ${r}`)].join('\n')}
          </pre>
          <p className="m-0 mt-2 text-[12px]" style={{ color: TONE.accent }}>
            ✅ 우리 팀 CLAUDE.md 완성 — 규칙 {count}개. 다음 STEP에서 이 규칙을 넣고 다시 시켜봐요.
          </p>
        </section>
      ) : (
        <section
          className="rounded-2xl border border-dashed p-4 text-center text-[12px] leading-[1.6]"
          style={{ borderColor: TONE.accentBorder, background: 'var(--demo-card-bg-alt)', color: 'var(--color-text-body)' }}
        >
          규칙을 <strong>최소 3개</strong> 골라 우리 팀 CLAUDE.md를 완성하세요. (현재 {count}개)
        </section>
      )}
    </div>
  );
}

// ── STEP 3 (각본): 규칙 넣고 다시 실행 → before / after ───────────────────────
export function ConfirmStep({ rules }: { rules: Module1Rules }) {
  const count = ruleCount(rules);
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="왜 하네스인가 · STEP 3/4"
        title="규칙 넣고 다시 실행 → before / after"
        summary="이제 규칙을 넣은 상태로 아까 그 지시를 다시 줍니다. 이번엔 어떻게 나올까요? 눌러서 확인해요."
        tone={TONE}
        summaryTone="stone"
      />
      <section
        className="rounded-2xl border p-3 text-[12px] leading-[1.6]"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)', color: 'var(--color-text-body)' }}
      >
        {count >= 3 ? (
          <>
            방금 <strong style={{ color: TONE.accent }}>규칙 {count}개</strong>를 CLAUDE.md에 담았죠. 그중 <strong>네이밍</strong> 규칙을 예로,
            규칙을 넣기 전/후가 어떻게 달라지는지 볼게요.
          </>
        ) : (
          <>여기선 <strong>네이밍</strong> 규칙을 예로 규칙 넣기 전/후를 비교해요. (STEP 2에서 규칙을 3개 이상 고르면 더 실감나요.)</>
        )}
      </section>
      <GatedReveal runLabel="▶ 실행 — 규칙 넣고 다시 시키기" tone={TONE}>
        <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
          <h3 className="m-0 text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            ✅ 이번엔 규칙을 따라요
          </h3>
          <div className="mt-3 flex flex-col gap-2">
            <div className="rounded-xl border p-3" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg-alt)' }}>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                규칙 없을 때 (STEP 1)
              </div>
              <div className="mt-0.5 font-mono text-[13px]" style={{ color: 'var(--color-text-body)' }}>
                handleClick / onClickHandler <span style={{ color: 'var(--color-text-muted)' }}>— 제각각</span>
              </div>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                규칙 있을 때 (지금)
              </div>
              <div className="mt-0.5 font-mono text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                handleClick / handleSubmit <span style={{ color: TONE.accent }}>— 둘 다 handle 로 시작</span>
              </div>
            </div>
          </div>
          <p className="m-0 mt-3 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
            규칙 하나 넣었을 뿐인데 AI가 <strong>일관되게</strong> 만들어요. 이게 CLAUDE.md의 힘이에요.
          </p>
        </section>
        <TerminalBlock
          label="원본 로그 — 규칙 적용 후"
          text={[
            '[CLAUDE.md에 규칙 반영됨]',
            '## 코딩 규칙',
            '- 버튼 이벤트 함수는 이름 앞에 handle 을 붙인다.',
            '',
            '[다시 실행]',
            'function handleClick() { ... }',
            'function handleSubmit() { ... }',
            '',
            '→ 둘 다 handle 로 시작. 규칙을 따름 ✅',
          ].join('\n')}
        />
      </GatedReveal>
    </div>
  );
}

// ── 이해 체크 (STEP 4) ───────────────────────────────────────────────────────
// F3: 오답 ④를 '그럴듯한 오개념'(AI가 더 나은 이름을 일부러 찾는다)으로 교체해 변별력↑.
//     ⚠️ 난이도 조정 = 교육 판단. jery 확인 후 문구 조정 가능. (콘텐츠 문서와 동기화)
export const CHECK: CheckData = {
  eyebrow: '왜 하네스인가 · STEP 4/4',
  intro: '규칙 한 바퀴를 다 봤어요! 마지막으로 한 문제만 확인하고 마칠게요. (틀려도 감점 없어요. 다시 풀면 돼요.)',
  question:
    '규칙(CLAUDE.md) 없이 AI에게 같은 일을 두 번 시켰더니, 함수 이름이 handleClick과 onClickHandler로 다르게 나왔습니다. 왜 이런 일이 생길까요?',
  options: [
    'AI가 고장 났기 때문',
    '따라야 할 팀 규칙이 없어서 AI가 그때그때 다른 스타일을 골랐기 때문',
    '둘 중 하나는 오류 코드라서',
    'AI가 매번 더 나은 이름을 찾으려고 일부러 다르게 짓기 때문',
  ],
  correctIdx: 1,
  explanationShort: '두 결과 다 오류는 없어요. 규칙이 없으니 AI가 매번 아무 스타일이나 고른 거예요.',
  explanationMore:
    '④처럼 "더 나은 이름을 찾으려 일부러" 다르게 하는 게 아니에요 — AI는 따를 규칙이 없어서 그때그때 아무거나 고른 거예요. CLAUDE.md에 "이름은 handle 로 시작" 같은 규칙을 박아두면 AI가 그걸 매번 읽고 따라요. 그래서 CLAUDE.md는 짧게 쓰는 게 중요해요(매번 읽히니까).',
};

// ── 도입 / 마무리 화면 ───────────────────────────────────────────────────────
export function IntroScreen() {
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="왜 하네스인가 · 도입"
        title="AI에게도 '팀 규칙 문서'를 준다"
        summary="새 팀에 들어가면 뭐부터 하죠? 코드부터 안 읽어요. '이 팀은 어떻게 일하지?' 규칙부터 파악하죠. AI도 똑같아요. 아무 규칙 없이 시키면 매번 다른 스타일로 만들어버려요. 그래서 AI에게도 팀 규칙 문서를 하나 줍니다 — 그게 CLAUDE.md예요."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
        <p className="m-0 text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          오늘 할 일
        </p>
        <p className="m-0 mt-1.5 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          규칙이 없을 때 얼마나 제각각인지 <strong>눈으로 본 다음</strong>, 우리 팀 규칙을 <strong>직접 만들어</strong> 봅니다. 그리고
          그 규칙을 넣고 다시 시켜 <strong>일관돼지는 걸 확인</strong>해요. 위 세 칸(관찰 → 규칙 → 확인)이 오늘의 지도예요.
        </p>
        <p className="m-0 mt-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          아래 <strong>다음 →</strong>을 눌러 시작하세요.
        </p>
      </section>
    </div>
  );
}

export function WrapScreen({ rules }: { rules: Module1Rules }) {
  const count = ruleCount(rules);
  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow="왜 하네스인가 · 마무리"
        title="한 바퀴 끝! CLAUDE.md = AI 팀 규칙 문서"
        summary="CLAUDE.md는 AI에게 주는 팀 규칙 문서예요. 짧게 쓰고, AI가 매번 읽어요. 규칙 하나로 결과가 제각각에서 일관됨으로 바뀌는 걸 봤죠."
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}>
        <p className="m-0 text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
          {count >= 3 ? (
            <>
              오늘 만든 것: <strong>규칙 {count}개가 담긴 우리 팀 CLAUDE.md</strong> 한 장.
            </>
          ) : (
            <>오늘 배운 것: 규칙 한 장이 AI 결과를 제각각 → 일관됨으로 바꾼다.</>
          )}
        </p>
        <p className="m-0 mt-2 text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          다음 시간엔 이 규칙 문서를 AI가 <strong>자동으로 만들어주는 /init</strong>과, 반복 작업을 박제하는 <strong>스킬</strong>을 배웁니다.
          (모듈 2)
        </p>
      </section>
    </div>
  );
}
