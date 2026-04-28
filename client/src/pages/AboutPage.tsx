import { Link } from 'react-router-dom';

const policyItems = [
  {
    title: 'AI 운영 정책',
    description:
      '학생 챗봇은 Claude Haiku 4.5를 기본으로 사용하고, Anthropic prompt caching과 답변 캐시를 함께 적용해 지연과 비용을 관리합니다.',
  },
  {
    title: '콘텐츠 정책',
    description:
      '책 본문은 직접 인용하지 않고, 71개 Q&A 본문은 Claude가 재구성한 학습 콘텐츠만 제공합니다.',
  },
  {
    title: '개인정보 처리',
    description:
      '학생은 세션 참여용 닉네임만 저장하고, 교사 인증은 카카오 OAuth로 분리해 운영합니다.',
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <section className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#f7f5f1_0%,#ffffff_60%,#ecf7f3_100%)] px-6 py-8 sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">About Architecture</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-medium tracking-[-0.03em] text-stone-950 sm:text-5xl">
            책 기반 흐름을 교실에서 바로 쓰는 학습 서비스로 옮겼습니다.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
            Architecture는 알렉의 『기술노트(With 알렉)』에서 받은 학습 구조의 영감을 바탕으로,
            교사가 세션을 열고 학생이 코드로 참여해 개념을 빠르게 따라올 수 있게 설계한 서비스입니다.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <article className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-medium text-stone-950">서비스 정체성</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-stone-600">
            <p>
              학생 화면은 본문, 시연, AI 챗봇을 같은 흐름으로 묶어 비전공자도 개념을 단번에 연결하도록
              구성했습니다. 교사는 세션을 만들고, 학생은 수업 코드로 들어와 같은 챕터를 함께 따라갑니다.
            </p>
            <p>
              출처 표기는 공개적으로 유지합니다. 참고 도서는 알렉 『기술노트(With 알렉)』이며, 서비스 안의
              설명 문장과 Q&A 본문은 그대로 옮기지 않고 새로 작성된 학습용 텍스트만 사용합니다.
            </p>
          </div>
        </article>

        <aside className="rounded-[28px] border border-[var(--color-border)] bg-stone-950 p-6 text-stone-50 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-300">운영 메모</p>
          <dl className="mt-5 space-y-4 text-sm leading-7">
            <div>
              <dt className="font-medium text-white">책 출처</dt>
              <dd className="text-stone-300">알렉 『기술노트(With 알렉)』(2026)</dd>
            </div>
            <div>
              <dt className="font-medium text-white">도메인</dt>
              <dd className="text-stone-300">architecture.teachermate.co.kr</dd>
            </div>
            <div>
              <dt className="font-medium text-white">문의</dt>
              <dd className="text-stone-300">hitouchsoft@gmail.com</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {policyItems.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-medium text-stone-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 sm:p-8">
        <h2 className="text-xl font-medium text-stone-950">운영 원칙</h2>
        <div className="mt-5 grid gap-4 text-sm leading-7 text-stone-600 md:grid-cols-2">
          <p>
            챗봇은 rate limit과 캐시 정책을 함께 사용합니다. 같은 질문은 서버 캐시를 먼저 조회하고,
            챕터 단위 프롬프트는 prompt caching으로 반복 비용을 낮춥니다.
          </p>
          <p>
            학생 데이터는 최소화합니다. 학생 닉네임과 진도만 저장하고, 교사 전용 OAuth 정보는 학생
            참여 데이터와 분리해 관리합니다.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className="primary-button" to="/">
            홈으로 돌아가기
          </Link>
          <Link className="secondary-link" to="/library">
            라이브러리 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
