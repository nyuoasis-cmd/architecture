import type { SessionParticipant } from '../../lib/session-client';

type ParticipantListProps = {
  participants: SessionParticipant[];
  totalQas: number;
};

/**
 * 학생 현황. BUILDER-UX-POLICY §4-A 「학생 목록」 표준 — 컨테이너 하나 + 행.
 *
 * 🔑 카드 나열 + 진도바에서 행으로 바꾼 이유: 교사가 여기서 하는 일은 «누가 뒤처졌나»를
 *    훑는 것이다. 카드마다 바가 있으면 30명이 세 화면을 넘어가고, 훑기가 스크롤이 된다.
 *    상태 뱃지 세 종(완성·진행 중·대기)이 그 훑기를 한 줄로 줄여 준다.
 *
 * 🚨 「완성」은 «이 수업에 담긴 문항을 전부 열었다»는 뜻이지 «이해했다»가 아니다
 *    (session-progress.ts). 그래서 오른쪽에 진도 숫자를 그대로 붙여 둔다 — 뱃지만 믿지 않게.
 */
export default function ParticipantList({ participants, totalQas }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white px-6 py-10 text-center">
        <p className="text-sm font-medium text-stone-700">아직 들어온 학생이 없어요</p>
        <p className="mt-1 text-sm text-stone-500">「📱 QR 전체화면」을 교실 화면에 띄우면 학생이 코드로 들어옵니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
      {participants.map((participant, index) => {
        const done = totalQas > 0 && participant.progress_count >= totalQas;
        const started = participant.progress_count > 0;
        const badge = done
          ? { label: '완성', className: 'bg-emerald-50 text-[#059669]' }
          : started
            ? { label: '진행 중', className: 'bg-blue-50 text-[#2563eb]' }
            : { label: '대기', className: 'bg-stone-100 text-stone-400' };

        return (
          <div
            className={`flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50 ${
              index < participants.length - 1 ? 'border-b border-stone-100' : ''
            }`}
            key={participant.id}
          >
            <span className="min-w-[80px] truncate text-sm font-medium text-stone-900">{participant.nickname}</span>
            <span className={`rounded-full px-2.5 py-[3px] text-xs font-medium ${badge.className}`}>{badge.label}</span>
            <span className="flex-1 truncate text-right text-[13px] text-stone-500">
              {participant.progress_count}/{totalQas} 문항
            </span>
          </div>
        );
      })}
    </div>
  );
}
