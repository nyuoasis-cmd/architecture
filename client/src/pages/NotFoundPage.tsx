import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[920px] items-center justify-center px-6 py-10">
      <section className="w-full rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
        <p className="mb-3 text-sm font-medium text-stone-500">404</p>
        <h1 className="mb-3 text-2xl font-medium">요청한 페이지를 찾지 못했습니다</h1>
        <p className="mb-6 text-sm text-stone-600">
          주소가 잘못되었거나 아직 연결되지 않은 경로입니다. 홈으로 돌아가거나 라이브러리에서 다시 시작해 주세요.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="primary-button" to="/">
            홈으로 이동
          </Link>
          <Link className="secondary-link" to="/library">
            라이브러리로 이동
          </Link>
        </div>
      </section>
    </main>
  );
}
