/**
 * 진도 행(architecture_progress)을 «참여자별 개수»와 «문항별 도달 학생 수» 두 갈래로 센다.
 *
 * 🔑 같은 행을 두 축으로 센다 — 쿼리는 늘지 않는다. 예전에는 참여자별로만 접고 qa_id 를
 *    버려서, 어느 문항에 학생이 몇 명 도달했는지 알 길이 없었다(2026-08-11 prod QA, 신입샘 t3:
 *    «학생 진도 0/7 인데 내가 뭘 하면 바뀌나»).
 *
 * 🚨 문항 축(qaCompletion)은 **지금 그리는 화면이 없다**(2026-08-12 교안 철거로 소비자가 사라졌다).
 *    라우트는 계속 내보낸다 — 집계는 공짜고, 두 축이 같은 행에서 나온다는 계약이 이 사고의
 *    재발을 막는 유일한 장치라서 같이 지우지 않았다. 「안 쓰니 지우자」로 오는 사람은 위 사고를
 *    먼저 읽을 것.
 *
 * 🚨 이 값이 뜻하는 것은 «그 문항 화면을 **열었다**»이지 «이해했다»가 아니다. 진도 행은
 *    학생이 문항에 들어가는 순간 생긴다(퀴즈 점수는 별개 필드다). 화면 문구도 «연 학생»으로
 *    적는다 — «끝낸»이라고 쓰면 교사가 이해도까지 봤다고 오해한다.
 */
export type ProgressRow = {
  participant_id?: string | null;
  qa_id?: string | null;
};

export type ProgressTally = {
  /** 참여자 id → 그 학생이 연 문항 수 */
  countsByParticipant: Map<string, number>;
  /** 문항 id → 그 문항을 연 학생 수 */
  qaCompletion: Record<string, number>;
};

export function tallyProgressRows(rows: readonly ProgressRow[]): ProgressTally {
  const countsByParticipant = new Map<string, number>();
  const qaCompletion: Record<string, number> = {};

  for (const row of rows) {
    const participantId = row.participant_id;
    if (!participantId) {
      // 주인 없는 행은 어느 축에서도 세지 않는다 — 한쪽에만 반영되면 두 숫자가 어긋난다.
      continue;
    }

    countsByParticipant.set(participantId, (countsByParticipant.get(participantId) ?? 0) + 1);

    const qaId = row.qa_id;
    if (qaId) {
      qaCompletion[qaId] = (qaCompletion[qaId] ?? 0) + 1;
    }
  }

  return { countsByParticipant, qaCompletion };
}
