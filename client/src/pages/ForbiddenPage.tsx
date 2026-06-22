import { Link } from 'react-router-dom';
import { getServiceLoginUrl } from '../lib/login-url';

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[920px] items-center justify-center px-6 py-10">
      <section className="w-full rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">403 Forbidden</p>
        <h1 className="mt-3 text-3xl font-medium text-stone-950">이 세션에 접근할 권한이 없습니다</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          로그인은 되어 있지만 현재 계정은 이 교사 세션의 소유자가 아닙니다. 다른 계정으로 다시 로그인하거나 홈으로
          돌아가세요.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-2xl bg-stone-950 px-5 text-sm font-medium text-white"
            onClick={() => { window.location.href = getServiceLoginUrl('/teacher'); }}
          >
            다른 계정으로 로그인
          </button>
          <Link
            className="inline-flex min-h-11 items-center rounded-2xl border border-[var(--color-border)] px-5 text-sm font-medium text-stone-700"
            to="/"
          >
            홈으로 이동
          </Link>
        </div>
      </section>
    </main>
  );
}
