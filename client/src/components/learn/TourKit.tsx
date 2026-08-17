import { useEffect, useState } from 'react';
import { getRegisteredLink } from '../../data/link-registry';
import type { TourKitConfig } from '../../data/tour-kits';

/**
 * 견학 키트 — 링크 카드 + 고르기형 관찰 미션(체크포인트) + 스냅샷 폴백 (SDD 결정 17, 목업 3).
 *
 * 🚨 링크는 항상 **새 탭**(iframe 차단 전제) · 무로그인 공개 페이지만(레지스트리가 지킨다).
 * 🚨 URL 을 그대로 보여 준다 — 주소를 읽는 것도 교육이다.
 * 🚨 미션 답은 고르기뿐 — 자유 입력 칸을 만들지 않는다(쉬움 3원칙 3).
 * 🔑 오답은 벌이 아니다 — 「지도를 한 번 더 볼까요?」 + 힌트가 열린다(목업 3 상태 변형).
 */
export default function TourKit({ kit }: { kit: TourKitConfig }) {
  const link = getRegisteredLink(kit.linkId);
  const [pickedAt, setPickedAt] = useState<number | null>(null);

  useEffect(() => {
    setPickedAt(null);
  }, [kit.qaId]);

  if (!link) return null;
  const picked = pickedAt !== null ? kit.mission.choices[pickedAt] : null;
  const solved = Boolean(picked?.correct);

  return (
    <div className="mx-auto w-full max-w-[820px] px-5 pt-6">
      <p className="text-[14px] leading-[1.8] text-[var(--color-text-body)]">{kit.intro}</p>

      {/* 링크 카드 — URL 을 그대로 보여 준다 */}
      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-4">
        <span className="text-[30px]">🌏</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-bold text-[var(--color-text-primary)]">{kit.linkTitle}</p>
          <p className="text-[12.5px] text-[var(--color-text-muted)]">{kit.linkNote}</p>
          <p className="truncate font-mono text-[11.5px] text-[var(--color-text-faint)]">
            {link.url.replace(/^https?:\/\//, '')}
          </p>
        </div>
        <a
          className="rounded-[10px] bg-[var(--color-text-primary)] px-4 py-2.5 text-[13px] font-bold text-white"
          href={link.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {link.label} ↗
        </a>
      </div>
      {link.snapshotPath ? (
        <p className="mt-2 text-[12.5px] text-[var(--color-text-muted)]">
          교실에서 안 열리면 →{' '}
          <a className="font-bold text-[var(--color-accent)]" href={link.snapshotPath} rel="noopener noreferrer" target="_blank">
            이 화면의 스냅샷으로 보기
          </a>{' '}
          (지난 학기에 담아 둔 같은 화면이에요)
        </p>
      ) : null}

      {/* 관찰 미션 — 고르기 체크포인트 */}
      <div
        className={`mt-5 rounded-2xl border px-5 py-4 ${
          solved ? 'border-emerald-200 bg-emerald-50/50' : 'border-[var(--color-border)] bg-white'
        }`}
      >
        <p className="text-[12px] font-bold tracking-wide text-[var(--color-accent)]">
          🔎 관찰 미션 — 눈으로만 찾으면 돼요
        </p>
        <p className="mt-1.5 text-[15px] font-bold text-[var(--color-text-primary)]">{kit.mission.question}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {kit.mission.choices.map((choice, index) => {
            const isPicked = pickedAt === index;
            return (
              <button
                key={choice.label}
                className={`rounded-[10px] border px-4 py-2.5 text-[13.5px] font-semibold transition ${
                  isPicked && choice.correct
                    ? 'border-2 border-[var(--color-accent)] bg-white text-[var(--color-text-primary)]'
                    : isPicked
                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                      : 'border-[var(--color-border)] bg-white text-[var(--color-text-body)] hover:border-stone-400'
                }`}
                onClick={() => setPickedAt(index)}
                type="button"
              >
                {choice.label}
                {isPicked && choice.correct ? ' ✓' : ''}
              </button>
            );
          })}
        </div>

        {solved ? (
          <p className="mt-3 text-[13.5px] font-semibold leading-[1.8] text-[var(--color-accent)]">
            ✓ {kit.mission.caption}
          </p>
        ) : null}
        {picked && !picked.correct ? (
          <p className="mt-3 text-[13px] leading-[1.8] text-[var(--color-text-body)]">
            한 번 더 볼까요? 힌트 — {kit.mission.hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
