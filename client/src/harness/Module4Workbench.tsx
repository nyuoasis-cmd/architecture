// 하네스 심화 트랙 — 모듈 4(TDD) 작업대 격리 프루프.
// architecture 라이브 콘텐츠(10챕터·qa-stubs·세션)를 건드리지 않고, 공유 데모 키트(_shared)만
// 재사용해 "시키기 → 각본 결과(친절 카드 + 원본 로그) → 이해 체크" 파이프라인을 검증한다.
// 콘텐츠 원본: docs/harness-course-curriculum/content/모듈4_TDD_콘텐츠.md (부록 A 로그 포함).
import { useState } from 'react';
import { Hero, StateChips, getTone } from '../demos/_shared';

const TONE = getTone(3); // TDD 계열 accent (ch03 톤 차용)

export type WorkbenchStep = {
  id: string;
  nav: string; // 스텝 스위처 라벨
  phase: string; // 차시 구분
  eyebrow: string;
  title: string;
  summary: string; // 화면 안내
  instruction?: string; // 시키기 지시문 (각본 고정)
  resultTitle: string; // 친절 카드 제목
  chips: string[]; // 친절 카드 요점
  chipDesc: string;
  rawLog: string; // 원본 로그(vitest 출력 모사)
};

// 5개 각본 재생 스텝 + 마지막 이해 체크(별도 렌더). 콘텐츠=모듈4 문서 STEP 1~6.
export const MODULE4_STEPS: WorkbenchStep[] = [
  {
    id: 'red-write',
    nav: 'STEP 1 · 시키기',
    phase: '1차시 — Red & Green',
    eyebrow: 'TDD 한 바퀴 · STEP 1/6',
    title: '실패할 테스트를 먼저 시키기',
    summary:
      "먼저 '이 앱이 이렇게 동작해야 한다'는 약속 목록을 만들어요. 아직 기능은 하나도 안 만들었어요. 그래서 이 약속들은 지금 전부 실패하는 게 정상 — 그게 출발점이에요.",
    instruction:
      '노트 앱의 세 기능(추가·수정·삭제)에 대한 테스트를 먼저 만들어줘. 아직 구현은 하지 마. 테스트만. 정상·경계·예외 경우를 나눠서.',
    resultTitle: '🟦 AI가 약속 12개를 만들었어요',
    chips: ['정상 4개', '경계 4개', '예외 4개', '아직 구현 0'],
    chipDesc:
      '기능마다 정상·경계·예외 세 종류로 나눴어요. 아직 기능은 안 만들었으니, 다음 단계에서 실행하면 12개가 전부 실패할 거예요. 그게 맞는 거예요.',
    rawLog: [
      '✔ AI가 테스트 파일을 만들었어요: src/notes.test.ts',
      '',
      "describe('노트 추가 (addNote)', () => {",
      "  it('[정상] 글자를 넣으면 노트가 추가된다')",
      "  it('[경계] 빈 문자열을 넣으면 추가되지 않는다')",
      "  it('[예외] 글자가 아닌 값(null)을 넣으면 오류가 난다')",
      '})',
      "// … 수정(editNote)·삭제(deleteNote)·목록(listNotes) 동일 구조",
      '',
      '→ 총 12개 테스트. 구현(src/notes.ts)은 껍데기만:',
      "  export function addNote() { throw new Error('not implemented') }",
    ].join('\n'),
  },
  {
    id: 'red-run',
    nav: 'STEP 2 · 올바른 Red',
    phase: '1차시 — Red & Green',
    eyebrow: 'TDD 한 바퀴 · STEP 2/6',
    title: '실행해서 "올바른 Red" 확인',
    summary:
      '약속들을 검사기에 돌려봅니다. 12개 중 12개가 실패하면 성공이에요. 실패가 성공이라니 이상하죠? "아직 안 만들었으니 당연히 실패" — 이게 깨끗한 출발선(Red)이에요.',
    resultTitle: '🟥 12개 중 12개 실패 — 올바른 출발선입니다 ✅',
    chips: ['12/12 실패', 'not implemented', '깨끗한 Red'],
    chipDesc:
      '실패 이유가 전부 "아직 안 만들었음(not implemented)". 이건 좋은 실패예요. ⚠️ 만약 이유가 "Cannot find module"이면 약속 자체가 고장 난 것 — 그럴 땐 못 나아가요.',
    rawLog: [
      '$ npm test',
      '',
      ' ❯ src/notes.test.ts (12)',
      '   ❯ 노트 추가 (addNote) (3)',
      '     × [정상] 글자를 넣으면 노트가 추가된다      Error: not implemented',
      '     × [경계] 빈 문자열을 넣으면 추가되지 않는다   Error: not implemented',
      '     × [예외] 글자가 아닌 값(null)을 넣으면 오류    Error: not implemented',
      '   ❯ 노트 수정 (editNote) (3)   × × ×   Error: not implemented',
      '   ❯ 노트 삭제 (deleteNote) (3)  × × ×   Error: not implemented',
      '   ❯ 목록 (listNotes) (3)       × × ×   Error: not implemented',
      '',
      ' Test Files  1 failed (1)',
      '      Tests  12 failed (12)',
      '',
      '→ 12개 전부 not implemented 로 실패. 올바른 Red ✅',
    ].join('\n'),
  },
  {
    id: 'green',
    nav: 'STEP 3 · Green',
    phase: '1차시 — Red & Green',
    eyebrow: 'TDD 한 바퀴 · STEP 3/6',
    title: '하나씩 통과시키기 (Green)',
    summary:
      '빨간불을 하나씩 초록불로 바꿔요. 규칙 하나: 통과하는 만큼만 만들기. 약속에 없는 건 미리 안 만들어요. (개발자들은 이걸 YAGNI라고 불러요.)',
    instruction:
      '실패하는 테스트를 하나씩 통과시켜줘. 통과하는 데 필요한 최소한만 구현하고, 테스트에 없는 기능은 미리 만들지 마. 하나 통과할 때마다 전체를 다시 돌려서 다른 게 깨지지 않았는지 확인해줘.',
    resultTitle: '🟩 하나씩 초록으로 바뀌는 중…',
    chips: ['추가 3/12', '수정 6/12', '삭제 9/12', '전체 12/12'],
    chipDesc:
      '매번 하나 고칠 때마다 전체를 다시 검사했어요. 앞에 통과한 게 뒤에서 깨지지 않았는지 보려고요 — 이걸 "회귀 감시"라고 해요.',
    rawLog: [
      '$ npm test   (하나씩 구현하며 반복 실행)',
      '',
      '[1회차] addNote 구현 후   →  Tests  3 passed | 9 failed (12)',
      '[2회차] editNote 구현 후  →  Tests  6 passed | 6 failed (12)',
      '[3회차] deleteNote 구현 후 →  Tests  9 passed | 3 failed (12)',
      '[4회차] listNotes 구현 후  →  Tests  12 passed (12)   ✓',
      '',
      '→ 매 회차 전체 재실행(회귀 감시). 앞서 통과한 게 뒤에서 깨지지 않음을 확인.',
    ].join('\n'),
  },
  {
    id: 'all-green',
    nav: 'STEP 4 · 전체 초록',
    phase: '2차시 — 전체 초록 & Refactor',
    eyebrow: 'TDD 한 바퀴 · STEP 4/6',
    title: '전체 다시 초록 확인',
    summary:
      '지난 시간에 12개를 다 통과시켰죠. 오늘은 먼저 정말 다 초록인지 한 번에 다시 확인하고 시작해요. 이 초록불이 곧 다듬기의 안전벨트예요.',
    resultTitle: '🟩 12개 중 12개 초록 유지 ✅',
    chips: ['12/12 초록', '412ms', '다듬기 준비'],
    chipDesc:
      '지난 시간 상태 그대로예요. 다듬다가 하나라도 빨개지면 "아, 방금 그건 동작을 바꾼 거네" 하고 바로 되돌리면 되니까 안심하고 다듬을 수 있어요.',
    rawLog: ['$ npm test', '', ' ✓ src/notes.test.ts (12)', '      Tests  12 passed (12)', '   Duration  412ms'].join(
      '\n',
    ),
  },
  {
    id: 'refactor',
    nav: 'STEP 5 · Refactor',
    phase: '2차시 — 전체 초록 & Refactor',
    eyebrow: 'TDD 한 바퀴 · STEP 5/6',
    title: '다듬기 (Refactor)',
    summary:
      '겉 동작은 그대로 두고 속만 깔끔하게. 새 기능도 버그 수정도 아니에요. 오직 "더 읽기 좋게". 규칙 하나: 한 번에 하나씩 바꾸고, 바꿀 때마다 검사. 빨개지면 즉시 되돌리기.',
    instruction:
      '동작은 그대로 두고 코드만 다듬어줘. 중복된 부분 합치고, 이름을 더 알기 쉽게. 한 번에 하나씩 바꾸고 매번 테스트를 돌려서 12개가 계속 초록인지 확인해줘.',
    resultTitle: '✨ 다듬기 완료 — 동작은 그대로, 코드는 더 깔끔',
    chips: ['중복 제거', '이름 개선', '한 번 롤백', '12/12 유지'],
    chipDesc:
      '다듬는 내내 12개 초록을 유지했어요. 중간에 한 번 빨개졌는데(11/12) 바로 되돌려서 다시 초록으로 맞췄어요. 그게 정상 과정이에요 — "빨개지면 롤백".',
    rawLog: [
      '$ npm test   (다듬으며 반복)',
      '',
      '[다듬기 1: 중복된 "노트 찾기" 코드를 함수 하나로 합침]',
      '      Tests  12 passed (12)   ✅ 초록 유지',
      '',
      '[다듬기 2: 변수 이름 n→note, x→noteId 로 개선]',
      '      Tests  11 passed | 1 failed (12)   ⚠️ 하나 빨개짐!',
      '      × [예외] 없는 노트를 수정하면 오류가 난다',
      '      → 이름 바꾸다 한 군데 놓침. 즉시 되돌림(롤백).',
      '',
      '[다듬기 2 재시도: 놓친 곳까지 이름 통일]',
      '      Tests  12 passed (12)   ✅ 다시 초록',
      '',
      '→ 겉 동작은 전·후 동일. 속만 깔끔해짐 = 올바른 Refactor ✅',
    ].join('\n'),
  },
];

// ── 원본 로그 터미널 블록 (LogBox는 key=time 제약이 있어 다줄 vitest 덤프엔 부적합 → 전용 pre)
function TerminalBlock({ text }: { text: string }) {
  return (
    <section
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: 'var(--color-border)', background: 'var(--demo-log-bg-navy)', color: 'var(--demo-log-fg)' }}
    >
      <p className="m-0 mb-1.5 text-[11px]" style={{ color: 'var(--demo-log-time-neutral)' }}>
        원본 로그 보기 — vitest
      </p>
      <pre className="m-0 overflow-x-auto whitespace-pre font-mono text-[11px] leading-[1.7]">{text}</pre>
    </section>
  );
}

// ── 시키기 카드 (각본 고정 지시문)
function InstructionCard({ text }: { text: string }) {
  return (
    <section
      className="rounded-2xl border p-4"
      style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft }}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: TONE.accent, color: '#fff' }}>
          시키기
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          AI에게 보내는 지시 (각본 고정)
        </span>
      </div>
      <p className="m-0 font-mono text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-primary)' }}>
        {text}
      </p>
    </section>
  );
}

// ── 각본 재생 스텝 뷰 (STEP 1~5)
export function StepView({ step }: { step: WorkbenchStep }) {
  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow={step.eyebrow} title={step.title} summary={step.summary} tone={TONE} summaryTone="stone" />
      {step.instruction ? <InstructionCard text={step.instruction} /> : null}
      <StateChips title={step.resultTitle} items={step.chips} tone={TONE} description={step.chipDesc} />
      <TerminalBlock text={step.rawLog} />
    </div>
  );
}

// ── 이해 체크 (STEP 6, 인터랙티브·재시도 허용)
const CHECK = {
  eyebrow: 'TDD 한 바퀴 · STEP 6/6',
  question:
    '노트 앱 테스트를 처음 실행했더니 12개 중 12개가 실패했습니다. 실패 이유는 전부 "아직 안 만들었음(not implemented)". 이 상황은 어떤 상태일까요?',
  options: [
    '테스트가 고장 났으니 처음부터 다시 만들어야 한다',
    '올바른 출발선이다. 기능을 아직 안 만들었으니 실패가 정상이고, 이제 하나씩 통과시키면 된다',
    '12개가 실패했으니 이 앱은 못 쓴다',
    'AI가 일을 잘못했으니 다른 지시를 줘야 한다',
  ],
  correctIdx: 1,
  explanation:
    '"실패 = 나쁨"이 아니에요. 아직 기능을 안 만들었으니 실패가 당연하고, 이게 깨끗한 출발선(Red)이에요. 반대로 이유가 "Cannot find module"이었다면 약속 자체가 고장 난 것이라 못 나아갔을 거예요. "아직 안 만들었음"으로 실패 = 좋은 Red.',
};

export function UnderstandingCheck() {
  const [picked, setPicked] = useState<number | null>(null);
  const isCorrect = picked === CHECK.correctIdx;

  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow={CHECK.eyebrow}
        title="이해 체크"
        summary="한 바퀴 다 돌았어요! 마지막으로 한 문제만 확인하고 마칠게요. (틀려도 감점 없어요. 다시 풀면 돼요.)"
        tone={TONE}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
        <p className="m-0 text-[14px] font-semibold leading-[1.6]" style={{ color: 'var(--color-text-primary)' }}>
          {CHECK.question}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {CHECK.options.map((opt, idx) => {
            const chosen = picked === idx;
            const revealCorrect = picked !== null && idx === CHECK.correctIdx;
            const revealWrong = chosen && idx !== CHECK.correctIdx;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setPicked(idx)}
                className="rounded-xl border px-3 py-2 text-left text-[13px] leading-[1.5] transition"
                style={{
                  borderColor: revealCorrect ? TONE.accent : revealWrong ? 'var(--color-danger, #dc2626)' : 'var(--color-border)',
                  background: revealCorrect ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <span className="mr-1.5 font-semibold" style={{ color: TONE.accent }}>
                  {['①', '②', '③', '④'][idx]}
                </span>
                {opt}
                {revealCorrect ? <span className="ml-2">✅</span> : null}
                {revealWrong ? <span className="ml-2">❌</span> : null}
              </button>
            );
          })}
        </div>
        {picked !== null ? (
          <div
            className="mt-3 rounded-xl border p-3 text-[12px] leading-[1.7]"
            style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg-alt)', color: 'var(--color-text-body)' }}
          >
            <strong style={{ color: isCorrect ? TONE.accent : 'var(--color-text-primary)' }}>
              {isCorrect ? '정답이에요! ' : '다시 볼까요. '}
            </strong>
            {CHECK.explanation}
            {!isCorrect ? <div className="mt-1.5 opacity-80">↩ 다른 보기를 눌러 다시 풀 수 있어요.</div> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
