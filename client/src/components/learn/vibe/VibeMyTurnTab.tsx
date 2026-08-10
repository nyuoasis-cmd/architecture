import { useEffect, useState } from 'react';
import type { VibeMyTurnConfig } from '../../../data/vibe-stubs';

type VibeMyTurnTabProps = {
  qaId: string;
  config: VibeMyTurnConfig;
};

type MyTurnVerdict = {
  covered: Array<{ key: string; label: string }>;
  invented: Array<{ key: string; label: string; example: string }>;
  coach: string;
};

const COOLDOWN_SECONDS = 300;

function cooldownStorageKey(qaId: string): string {
  return `vibe:myturn:last:${qaId}`;
}

function readCooldownRemaining(qaId: string): number {
  try {
    const raw = window.localStorage.getItem(cooldownStorageKey(qaId));
    if (!raw) {
      return 0;
    }
    const elapsed = Math.floor((Date.now() - Number(raw)) / 1000);
    return Math.max(0, COOLDOWN_SECONDS - elapsed);
  } catch {
    return 0;
  }
}

/**
 * «내 차례» — 학생이 직접 쓴 부탁문을 실제 AI가 실행해 «네가 정한 칸 / AI가 대신 정한 칸»을
 * 판정한다. 호출 통제: 쿨타임 5분(클라 localStorage + 서버 이중), 재생성 버튼 없음.
 * 서버(`POST /api/vibe/my-turn`)가 아직 없으면 준비 중 안내로 강등된다.
 */
export default function VibeMyTurnTab({ qaId, config }: VibeMyTurnTabProps) {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'unavailable' | 'error'>('idle');
  const [verdict, setVerdict] = useState<MyTurnVerdict | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setPrompt('');
    setStatus('idle');
    setVerdict(null);
    setCooldown(readCooldownRemaining(qaId));
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
        const payload = (await response.json().catch(() => null)) as { retryAfterSeconds?: number } | null;
        setCooldown(payload?.retryAfterSeconds ?? COOLDOWN_SECONDS);
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
      try {
        window.localStorage.setItem(cooldownStorageKey(qaId), String(Date.now()));
      } catch {
        // localStorage 실패는 무시 — 서버 쿨타임이 이중 방어
      }
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      setStatus('error');
    }
  };

  const cooldownLabel =
    cooldown > 0
      ? `다시 쓰기 ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')}`
      : '오늘의 시도 준비됨';

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
