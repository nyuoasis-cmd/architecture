import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[920px] items-center justify-center px-6 py-10">
      <section className="w-full rounded-xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
        <p className="mb-3 text-sm font-medium text-stone-500">404</p>
        <h1 className="mb-3 text-2xl font-medium">요청한 학습 화면을 찾지 못했습니다</h1>
        <p className="mb-6 text-sm text-stone-600">
          주소가 잘못되었거나 아직 연결되지 않은 학습 단계입니다.
        </p>
        <Link className="secondary-link" to="/library">
          라이브러리로 돌아가기
        </Link>
      </section>
    </main>
  );
}
