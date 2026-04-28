import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const hasSupabaseEnv = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const steps = [
  {
    label: '1',
    title: '교사 세션 만들기',
    description: '교사가 챕터를 고르고 세션을 열면 수업 코드와 QR이 바로 생성됩니다.',
  },
  {
    label: '2',
    title: '학생 코드 참여',
    description: '학생은 로그인 없이 닉네임과 수업 코드만으로 같은 학습 화면에 들어옵니다.',
  },
  {
    label: '3',
    title: 'AI 챗봇 학습',
    description: '본문과 시연을 본 뒤 AI 챗봇으로 비유 설명을 이어가며 이해를 고정합니다.',
  },
];

export default function LandingPage() {
  const auth = useAuth();
  const teacherEntryPath = auth.isAuthenticated ? '/teacher' : '/login';

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <section className="overflow-hidden rounded-[36px] border border-[var(--color-border)] bg-white shadow-[0_24px_80px_rgba(28,25,23,0.08)]">
        <div className="grid gap-8 px-6 py-8 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1.25fr)_320px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Architecture</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-[-0.04em] text-stone-950 sm:text-5xl lg:text-6xl">
              책 한 권의 구조를 수업 현장에서 바로 쓰는 IT 입문 플로우로 바꿨습니다.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
              알렉의 『기술노트(With 알렉)』에서 영감을 받아 10개 챕터, 71개 Q&amp;A를 교사 세션과 학생
              참여 흐름에 맞게 다시 구성했습니다. 비전공자도 전체 그림을 빠르게 연결하도록 본문, 시연,
              AI 챗봇을 한 화면에 묶었습니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="primary-button sm:min-w-[180px]" to={teacherEntryPath}>
                교사로 시작
              </Link>
              <Link className="secondary-link sm:min-w-[180px]" to="/join">
                수업 코드로 참여
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-xs text-stone-500 sm:text-sm">
              <span className="rounded-full bg-stone-100 px-3 py-1.5">10개 챕터</span>
              <span className="rounded-full bg-stone-100 px-3 py-1.5">71개 Q&amp;A</span>
              <span className="rounded-full bg-stone-100 px-3 py-1.5">교사 세션 + 학생 참여</span>
            </div>
            {!hasSupabaseEnv ? (
              <p className="mt-5 text-sm font-medium text-amber-700">
                VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 비어 있어 교사 로그인은 아직 동작하지 않습니다.
              </p>
            ) : null}
          </div>

          <aside className="rounded-[28px] border border-stone-200 bg-[linear-gradient(180deg,#fafaf9_0%,#f5f5f4_100%)] p-6">
            <p className="text-sm font-medium text-stone-950">한눈에 보는 수업 흐름</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-stone-600">
              <p>교사는 대시보드에서 세션을 열고, 학생은 코드로 바로 입장합니다.</p>
              <p>학생 화면은 본문, 시연, 챗봇을 분리하지 않고 같은 학습 맥락으로 연결합니다.</p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Link className="secondary-link" to="/about">
                서비스와 정책 보기
              </Link>
              <Link className="secondary-link" to="/library">
                라이브러리 둘러보기
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <article
            key={step.label}
            className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
              {step.label}
            </div>
            <h2 className="mt-5 text-lg font-medium text-stone-950">{step.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">{step.description}</p>
          </article>
        ))}
      </section>

      <footer className="flex flex-col gap-2 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-4 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
        <span>architecture.teachermate.co.kr</span>
        <Link className="underline-offset-2 hover:underline" to="/about">
          참고 도서: 알렉 『기술노트(With 알렉)』(2026) — 출처 보기
        </Link>
      </footer>
    </main>
  );
}
