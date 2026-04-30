import type { SessionParticipant } from '../../lib/session-client';

type ParticipantListProps = {
  participants: SessionParticipant[];
  totalQas: number;
};

export default function ParticipantList({ participants, totalQas }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
        아직 참여자가 없습니다. 교실 화면에 QR과 코드를 띄워 학생 참여를 유도하세요.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {participants.map((participant) => {
        const ratio = totalQas === 0 ? 0 : Math.min(100, Math.round((participant.progress_count / totalQas) * 100));

        return (
          <article
            key={participant.id}
            className="rounded-[22px] border border-[var(--color-border)] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[var(--color-text-quaternary)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate text-base font-medium text-[var(--color-text-primary)]">{participant.nickname}</div>
                <div className="mt-1 text-sm text-[var(--color-text-muted)]">
                  진도 {participant.progress_count}/{totalQas}
                </div>
              </div>
              <div className="text-sm font-medium text-[var(--color-text-body)]">{ratio}%</div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface-hover)]">
              <div className="h-full rounded-full bg-[var(--color-success-bg)]0" style={{ width: `${ratio}%` }} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
