// 하네스 심화 트랙 — 허브(모듈 목록). 라우트: /harness
// 네임스페이스 분리 결정 반영: 라이브 IT지식 과정(/learn·10챕터)과 분리된 '프로 트랙' 진입점.
// 세션·참여·진도·챗·퀴즈 인프라는 재사용하되, 콘텐츠셋/라우트는 /harness/* 아래로 독립.
// 각본형(정해진 결과 재생)이라 실제 AI 호출 없음. 세션 연동/졸업 제출은 다음 슬라이스.
import { Link } from 'react-router-dom';
import { getTone } from '../demos/_shared';

type ModuleCard = {
  n: number;
  title: string;
  blurb: string;
  chapter: 1 | 2 | 3 | 4 | 5 | 6;
  to?: string; // 있으면 열림, 없으면 준비 중
};

const MODULES: ModuleCard[] = [
  { n: 1, title: '왜 하네스인가 · CLAUDE.md', blurb: 'AI에게 주는 팀 규칙 문서 한 장. 규칙 없이 제각각 → 규칙 넣고 일관.', chapter: 1, to: '/harness/module1' },
  { n: 2, title: '나만의 스킬 · /init', blurb: '규칙 문서를 AI가 자동 생성(/init)하고, 반복 작업을 스킬로 박제.', chapter: 2 },
  { n: 3, title: '기획 · 요구사항·이슈·AC', blurb: '만들 것을 먼저 말로 정리 — 인터뷰 → 요구사항 → 완료 조건(AC).', chapter: 5 },
  { n: 4, title: 'TDD 한 바퀴', blurb: '테스트(약속) 먼저 → 통과 → 다듬기. Red → Green → Refactor.', chapter: 3, to: '/harness/module4' },
  { n: 5, title: '커밋·PR·보안', blurb: '변경을 안전하게 저장(커밋)·제안(PR)하고, 비밀키가 새지 않게 점검.', chapter: 4, to: '/harness/module5' },
  { n: 6, title: '종합 = 졸업', blurb: '배운 걸 모아 나만의 스킬 1개를 완성하고 제출 — 졸업 산출물.', chapter: 6 },
];

export default function HarnessHubPage() {
  return (
    <main className="mx-auto flex w-full max-w-[880px] flex-col gap-4 px-4 py-8">
      <header className="flex flex-col gap-2">
        <p className="m-0 text-[12px] font-semibold" style={{ color: getTone(1).accent }}>
          하네스 심화 트랙 · 프로 코스
        </p>
        <h1 className="m-0 text-[24px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
          AI를 제대로 부리는 법 — 6모듈
        </h1>
        <p className="m-0 text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-body)' }}>
          "AI로 앱 만들기(바이브코딩)" 다음 단계. 터미널로 안 나가고, 앱 안에서{' '}
          <strong>시키기 → 실행 → 결과 → 이해</strong> 작업대로 진짜 개발 워크플로우를 체험합니다. 졸업하면{' '}
          <strong>나만의 스킬 한 개</strong>가 손에 남아요.
        </p>
      </header>

      <div
        className="rounded-xl border px-3 py-2 text-[12px] leading-[1.6]"
        style={{ borderColor: getTone(1).accentBorder, background: getTone(1).accentSoft, color: 'var(--color-text-body)' }}
      >
        🧪 <strong>격리 프리뷰</strong> — 검증용 화면입니다. 각본형이라 실제 AI를 호출하지 않고, 라이브 학습 콘텐츠와 분리돼 있어요.
        (세션 연동·졸업 제출은 준비 중)
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MODULES.map((m) => {
          const tone = getTone(m.chapter);
          const open = Boolean(m.to);
          const inner = (
            <div
              className="flex h-full flex-col gap-2 rounded-2xl border p-4 transition"
              style={{
                borderColor: open ? tone.accentBorder : 'var(--color-border)',
                background: open ? 'var(--demo-card-bg)' : 'var(--demo-card-bg-alt)',
                opacity: open ? 1 : 0.72,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold"
                  style={{ background: tone.accentSoft, color: tone.accent }}
                >
                  {m.n}
                </span>
                <span className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {m.title}
                </span>
              </div>
              <p className="m-0 flex-1 text-[12px] leading-[1.6]" style={{ color: 'var(--color-text-body)' }}>
                {m.blurb}
              </p>
              <span className="text-[12px] font-semibold" style={{ color: open ? tone.accent : 'var(--color-text-muted)' }}>
                {open ? '작업대 열기 →' : '준비 중'}
              </span>
            </div>
          );
          return m.to ? (
            <Link key={m.n} to={m.to} className="no-underline">
              {inner}
            </Link>
          ) : (
            <div key={m.n}>{inner}</div>
          );
        })}
      </section>
    </main>
  );
}
