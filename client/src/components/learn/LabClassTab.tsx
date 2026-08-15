import { useEffect, useState } from 'react';

/**
 * 🧪 실습 현황 — **교사 전용**. 반 전체가 지금 어디까지 왔는가.
 *
 * 🚨 **모르는 것을 아는 척하지 않는다.** 여기서 셀 수 있는 것은 «낸 것»뿐이다.
 *    아직 안 낸 학생이 «막힌» 것인지 «열심히 쓰는 중»인지는 이 데이터로 알 수 없다 —
 *    그래서 「N분째 진전 없음」 같은 알림을 만들지 않았다. 멀쩡히 쓰고 있는 학생을 쫓아가게
 *    만드는 오탐이고, 수업 중의 오탐은 없느니만 못하다. 화면에도 그 사실을 적는다.
 *
 * 🚨 **안 낸 학생도 줄에 세운다.** 낸 학생만 보이면 교사는 «다 냈다»고 오해한다.
 *
 * 🔑 교사가 실제로 쓰는 것은 「같은 데서 여러 명이 터졌는가」다 — 그건 칠판에서 한 번에 푼다.
 */

type ClassRow = {
  participantId: string;
  nickname: string;
  revision: number;
  passed: number;
  total: number;
  lastSubmittedAt: string | null;
};

type ClassStatus = {
  rows: ClassRow[];
  topReasons: { reason: string; count: number }[];
  submittedCount: number;
  passedCount: number;
};

type LabClassTabProps = { sessionId?: string; qaId: string };

/** 🔑 상대 시간은 «마지막으로 낸 뒤 얼마»다. 수업이 몇 분째인지가 아니다 — 그건 셀 수 없다. */
function sinceLabel(iso: string | null): string {
  if (!iso) return '아직 안 냄';
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  return `${Math.floor(minutes / 60)}시간 전`;
}

export default function LabClassTab({ sessionId, qaId }: LabClassTabProps) {
  const [status, setStatus] = useState<ClassStatus | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'no-session'>('loading');

  useEffect(() => {
    if (!sessionId) {
      setState('no-session');
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(
          `/api/lab/class?sessionId=${encodeURIComponent(sessionId)}&qaId=${encodeURIComponent(qaId)}`,
        );
        if (!response.ok) {
          if (!cancelled) setState('error');
          return;
        }
        const payload = (await response.json()) as ClassStatus;
        if (cancelled) return;
        setStatus(payload);
        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    };
    void load();
    // 🔑 30초마다 다시 읽는다. 더 자주 읽어도 교사가 볼 것이 늘지 않는다.
    const timer = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sessionId, qaId]);

  if (state === 'no-session') {
    return (
      <div className="mx-auto w-full max-w-[720px] p-6">
        <p className="text-[13px] text-[var(--color-text-muted)]">
          수업으로 들어와야 반 전체 현황이 보입니다. (지금은 자습 화면입니다.)
        </p>
      </div>
    );
  }

  if (state === 'loading') {
    return <div className="mx-auto w-full max-w-[720px] p-6 text-[13px] text-[var(--color-text-faint)]">불러오는 중…</div>;
  }

  if (state === 'error' || !status) {
    return (
      <div className="mx-auto w-full max-w-[720px] p-6">
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          실습 현황을 불러오지 못했습니다. 잠시 뒤 다시 열어 주세요.
        </p>
      </div>
    );
  }

  const total = status.rows.length;

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-5 p-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          ['참여', `${total}명`],
          ['낸 학생', `${status.submittedCount}명`],
          ['전부 읽힌 학생', `${status.passedCount}명`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3">
            <p className="text-[11px] text-[var(--color-text-faint)]">{label}</p>
            <p className="mt-0.5 text-[18px] font-semibold text-[var(--color-text-primary)]">{value}</p>
          </div>
        ))}
      </div>

      {/* 🔑 교사가 실제로 쓰는 자리 — 여럿이 같은 데서 터졌으면 칠판에서 한 번에 푼다. */}
      {status.topReasons.length > 0 ? (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
          <h4 className="text-[12px] font-bold text-[var(--color-text-primary)]">여럿이 같은 데서 터졌습니다</h4>
          <ol className="mt-2 space-y-1.5">
            {status.topReasons.map((item) => (
              <li key={item.reason} className="flex gap-2 text-[12.5px] leading-[1.5]">
                <span className="shrink-0 font-mono text-[11px] font-semibold text-[var(--color-accent)]">
                  {item.count}명
                </span>
                <span className="text-[var(--color-text-body)]">{item.reason}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section>
        <h4 className="mb-2 text-[12px] font-bold text-[var(--color-text-primary)]">학생별</h4>
        {total === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)]">아직 참여한 학생이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-white">
            {status.rows.map((row) => {
              const done = row.total > 0 && row.passed === row.total;
              return (
                <li key={row.participantId} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--color-text-primary)]">
                    {row.nickname || '이름 없음'}
                  </span>
                  {/* 🚨 색만으로 상태를 말하지 않는다 — 문자를 같이 적는다(접근성). */}
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 font-mono text-[11px] ${
                      row.revision === 0
                        ? 'bg-[var(--color-bg-input)] text-[var(--color-text-faint)]'
                        : done
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {row.revision === 0 ? '안 냄' : done ? `통과 ${row.passed}/${row.total}` : `${row.passed}/${row.total}`}
                  </span>
                  <span className="w-[64px] shrink-0 text-right font-mono text-[10.5px] text-[var(--color-text-faint)]">
                    {row.revision > 0 ? `${row.revision}판` : ''}
                  </span>
                  <span className="w-[72px] shrink-0 text-right font-mono text-[10.5px] text-[var(--color-text-faint)]">
                    {sinceLabel(row.lastSubmittedAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/*
        🚨 이 문단을 지우지 말 것. 이 화면이 **무엇을 모르는지**를 교사에게 말하는 자리다.
           없으면 「안 냄」이 「막혔다」로 읽히고, 교사는 멀쩡히 쓰고 있는 학생을 쫓아간다.
      */}
      <p className="border-t border-[var(--color-border)] pt-3 text-[11.5px] leading-[1.6] text-[var(--color-text-faint)]">
        이 화면이 아는 것은 <b>낸 것</b>뿐입니다. 「안 냄」은 막혔다는 뜻이 아니라 아직 안 냈다는 뜻입니다 —
        규칙을 쓰는 데는 원래 시간이 걸립니다. 누가 막혔는지는 화면이 아니라 교실에서 보입니다.
      </p>
    </div>
  );
}
