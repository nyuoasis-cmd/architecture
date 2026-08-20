import { getExperienceHat } from '../../data/experience-hat';

type ExperienceHatProps = {
  chapterId: number;
  qaId: string;
  /**
   * 부품이 아는 «살아 있는 다음 걸음». 있으면 데이터의 `now` 대신 이것이 칸을 채운다 —
   * 학생이 미션 2를 하고 있는데 미션 1을 안내하면 머리표가 거짓말을 한다.
   */
  liveNow?: string | null;
  /** 진행 N/M. 「얼마나 남았나」에 답한다. 부품이 세지 못하면 안 그린다. */
  progress?: { done: number; total: number } | null;
};

/**
 * 🧭 체험 머리표 — 부품 3종(터미널·유사 GitHub·견학)이 **공용으로 하나만** 쓴다(결정 D-5).
 *
 * 🚨 부품마다 각자 만들지 말 것 — 「QR 입구 둘」 사고와 같은 모양이 된다.
 *    같은 것을 두 벌 만들면 한쪽만 고쳐지고, 학생은 강마다 다른 화면을 만난다.
 * 🚨 스크롤로 사라지지 않는다(`sticky`) — 지금 화면은 맥락이 전부 스크롤백 안에 있어
 *    몇 줄만 치면 위로 밀려 사라진다. 그게 요청 4 의 진원이다.
 * 🚨 여기에 «왜 그런가»의 설명을 늘려 붙이지 말 것 — 그건 교사 노트 층 2 가 가져갔다.
 */
export default function ExperienceHat({ chapterId, qaId, liveNow, progress }: ExperienceHatProps) {
  const hat = getExperienceHat(chapterId, qaId);
  if (!hat) return null;

  const nowText = liveNow?.trim() ? liveNow.trim() : hat.now;

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pt-3 lg:px-5">
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
        <div className="flex flex-col border-b border-[var(--color-border)] sm:flex-row">
          <div className="flex-1 border-b border-[var(--color-border)] bg-violet-50/60 px-3.5 py-2.5 sm:border-b-0 sm:border-r">
            <span className="mb-0.5 block text-[11px] font-extrabold tracking-wide text-violet-700">왜 하나</span>
            <p className="text-[12.5px] leading-[1.65] text-[var(--color-text-body)]">{hat.why}</p>
          </div>
          <div className="flex-1 bg-amber-50/60 px-3.5 py-2.5">
            <span className="mb-0.5 block text-[11px] font-extrabold tracking-wide text-amber-700">언제 쓰나</span>
            <p className="text-[12.5px] leading-[1.65] text-[var(--color-text-body)]">{hat.whenUsed}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-blue-50/70 px-3.5 py-2.5">
          <span className="shrink-0 text-[11px] font-extrabold tracking-wide text-blue-700">지금 할 일</span>
          <p className="min-w-0 flex-1 text-[13px] leading-[1.6] text-[#1e3a5f]">{nowText}</p>
          {progress && progress.total > 0 ? (
            <span className="shrink-0 rounded-full border border-blue-200 bg-white px-2.5 py-0.5 font-mono text-[11.5px] text-blue-700">
              {progress.done}/{progress.total}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
