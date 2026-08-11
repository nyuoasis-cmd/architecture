import { useEffect, useState } from 'react';
import type { VibeMyTurnConfig } from '../../data/vibe-stubs';

type MyTurnTabProps = {
  qaId: string;
  config: VibeMyTurnConfig;
};

type MyTurnVerdict = {
  covered: Array<{ key: string; label: string }>;
  invented: Array<{ key: string; label: string; example: string }>;
  coach: string;
};

/**
 * «내 차례» — 학생이 직접 쓴 부탁문을 실제 AI가 실행해 «네가 정한 칸 / AI가 대신 정한 칸»을 판정한다.
 *
 * 🚨 대기 시간을 **클라이언트가 스스로 정하지 않는다.** 예전에는 여기에 «5분»이 손으로 박혀 있어서
 *    localStorage 로 버튼을 잠갔다. 그러면 서버가 쿨타임을 0 으로 내려도(2026-08-11 확정) 화면은
 *    그대로 5분을 잠근다 — 무배포로 조정한다는 약속이 화면에서 깨진다.
 *    지금은 **서버가 429 와 함께 알려 준 초만큼만** 기다린다. 안 막히면 안 기다린다.
 * 🔑 실습 강은 «쓰고 → 판정받고 → 고쳐서 다시»가 수업의 본체다. 바로 다시 낼 수 있어야 한다.
 */
export default function MyTurnTab({ qaId, config }: MyTurnTabProps) {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'unavailable' | 'error'>('idle');
  const [verdict, setVerdict] = useState<MyTurnVerdict | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setPrompt('');
    setStatus('idle');
    setVerdict(null);
    setCooldown(0);
  }, [qaId]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown > 0]);

  const submit = async () => {
    if (prompt.trim().length < 5 || cooldown > 0 || status === 'loading') {
      return;
    }
    setStatus('loading');
    try {
      const response = await fetch('/api/vibe/my-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qaId, prompt: prompt.trim() }),
      });
      if (response.status === 404) {
        setStatus('unavailable');
        return;
      }
      if (response.status === 429) {
        // 🔑 기다릴 초는 서버만 안다(학생별·공유 통·전역 층이 다 다르다). 화면은 받아 적기만 한다.
        const payload = (await response.json().catch(() => null)) as { retryAfterSeconds?: number } | null;
        setCooldown(Math.max(1, payload?.retryAfterSeconds ?? 60));
        setStatus('idle');
        return;
      }
      if (!response.ok) {
        setStatus('error');
        return;
      }
      const payload = (await response.json()) as MyTurnVerdict;
      setVerdict(payload);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const cooldownLabel =
    cooldown > 0
      ? `다시 보내기 ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')}`
      : '보낼 수 있어요';

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-5 py-7">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-4">
        <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">✍️ 내 차례</p>
        <p className="mt-1 text-[13.5px] leading-[1.8] text-[var(--color-text-body)]">{config.intro}</p>
      </div>

      <textarea
        className="w-full resize-y rounded-xl border border-[var(--color-border)] px-4 py-3 text-[14px] leading-[1.8] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        onChange={(event) => setPrompt(event.target.value)}
        placeholder={config.placeholder}
        rows={6}
        value={prompt}
      />

      <div className="flex items-center gap-3">
        <button
          className="rounded-[10px] bg-[var(--color-btn-primary)] px-4.5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[var(--color-btn-primary-hover)] disabled:opacity-40"
          disabled={prompt.trim().length < 5 || cooldown > 0 || status === 'loading'}
          onClick={() => void submit()}
          type="button"
        >
          {status === 'loading' ? '만드는 중…' : 'AI에게 보내기'}
        </button>
        <span className="rounded-full bg-[var(--color-bg-input)] px-3 py-1 font-mono text-[11.5px] text-[var(--color-text-muted)]">
          {cooldownLabel}
        </span>
      </div>

      {/*
        🚨 기다리는 이유를 **숫자 옆에 반드시 같이 적는다.**
           2026-08-11 prod QA(새내기 f2): 판정이 «네가 정한 규칙 0개»를 보여 준 바로 그 순간 버튼이
           잠기고 '다시 쓰기 4:55'만 떴다. 학생은 무엇이 빠졌는지 방금 깨달았는데 고쳐 볼 수 없었고,
           왜 기다려야 하는지가 화면에 없어 **고장으로 읽었다.**
        🔑 이제 이 안내는 **정말 막혔을 때만** 뜬다(서버가 429 로 알려 준 경우). 평소에는 판정을 받고
           바로 고쳐서 다시 낼 수 있다. 입력칸은 대기 중에도 잠그지 않는다.
      */}
      {cooldown > 0 ? (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-[13px] leading-[1.8] text-[var(--color-text-body)]">
          ⏳ 지금은 잠깐 기다려야 해요 — 여럿이 한꺼번에 보내면 차례를 두는 거예요. 고장이 아니에요.
          <br />
          기다리는 동안 <b className="font-semibold text-[var(--color-text-primary)]">위 칸의 글을 고쳐 두면</b>, 시간이
          되자마자 그대로 보낼 수 있어요.
        </p>
      ) : null}

      {status === 'unavailable' ? (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
          이 기능은 선생님이 열어주면 사용할 수 있어요. 지금은 🎮 시연 탭에서 미리 실행해 둔 결과를 볼 수 있습니다.
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          지금은 보낼 수 없어요. 잠시 뒤 다시 시도해 주세요.
        </p>
      ) : null}

      {status === 'done' && verdict ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4">
          <h4 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            네가 정한 규칙 {verdict.covered.length}개 · AI가 대신 정한 규칙 {verdict.invented.length}개
          </h4>
          <div className="mt-2.5 space-y-1.5 text-[13px]">
            {verdict.covered.map((slot) => (
              <p key={slot.key}>
                <span className="font-bold text-emerald-600">✓</span> {slot.label} — 네가 정함
              </p>
            ))}
            {verdict.invented.map((slot) => (
              <p key={slot.key}>
                <span className="font-bold text-rose-600">⚠</span> {slot.label} — AI가 정함:{' '}
                <b className="font-semibold text-[var(--color-text-primary)]">{slot.example}</b>
              </p>
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-[1.8] text-[var(--color-text-body)]">{verdict.coach}</p>
        </section>
      ) : null}
    </div>
  );
}
