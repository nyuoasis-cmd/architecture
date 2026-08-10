import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useImeSafeInput } from '@teachermate/shared';
import { joinSession, SessionClientError } from '../lib/session-client';
import { enableProgressSync } from '../lib/progress';
import { setSessionTokenHint } from '../lib/session-token';

export default function JoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code')?.toUpperCase() ?? '');
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeInput = useImeSafeInput(setCode, (value) => value.toUpperCase());

  const banner = useMemo(() => {
    if (searchParams.get('expired') === '1') {
      return '참여 시간이 만료되었습니다. 닉네임을 다시 입력해 참여해주세요.';
    }
    if (searchParams.get('invalid') === '1') {
      return '세션 코드를 찾지 못했습니다. 6자리 코드를 다시 확인해주세요.';
    }
    if (searchParams.get('closed') === '1') {
      return '이 세션은 이미 종료되었습니다. 새 코드를 받아 다시 참여해주세요.';
    }
    return null;
  }, [searchParams]);

  async function handleSubmit() {
    if (code.trim().length !== 6 || nickname.trim().length === 0) {
      setError('6자리 코드와 닉네임을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const joined = await joinSession({ code, nickname });
      // 참여 전 라이브러리 열람에서 진도 동기화가 꺼졌을 수 있다 — 신원이 생겼으니 다시 켠다.
      enableProgressSync();
      setSessionTokenHint({
        sessionId: joined.session_id,
        participantId: joined.participant_id,
        nickname: joined.nickname,
      });
      navigate(joined.mode === 'harness' ? '/harness' : `/library?sessionId=${joined.session_id}`);
    } catch (caught) {
      if (caught instanceof SessionClientError) {
        if (caught.status === 404) {
          navigate(`/join?code=${code.toUpperCase()}&invalid=1`);
          return;
        }
        if (caught.status === 410) {
          navigate(`/join?code=${code.toUpperCase()}&closed=1`);
          return;
        }
      }

      setError(caught instanceof Error ? caught.message : '세션 참여에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-6 py-12">
      <section className="w-full rounded-[28px] border border-[var(--color-border)] bg-white p-7 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">Join Session</p>
        <h1 className="mt-3 text-3xl font-medium text-stone-950">학생 참여</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">교사가 알려준 6자리 코드와 닉네임을 입력하세요.</p>

        {banner ? <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{banner}</div> : null}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">6자리 코드</span>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-stone-50 px-4 py-3 font-mono text-2xl tracking-[0.45em] uppercase outline-none focus:border-stone-400"
              maxLength={6}
              {...codeInput}
              placeholder="ABC123"
              value={code}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">닉네임</span>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-stone-50 px-4 py-3 outline-none focus:border-stone-400"
              maxLength={20}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="예: 3조 민지"
              value={nickname}
            />
          </label>
        </div>

        {error ? <div className="mt-5 text-sm text-rose-600">{error}</div> : null}

        <button
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-stone-950 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={isSubmitting}
          onClick={handleSubmit}
          type="button"
        >
          {isSubmitting ? '참여 중...' : '참여하기'}
        </button>
      </section>
    </main>
  );
}
