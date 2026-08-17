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
  /** 실습 문항의 진도 행에만 담긴다. 그 밖에서는 null. */
  lab_mission_index?: number | null;
  lab_earned_index?: number | null;
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

/** 참여자별 실습 미션 자리. 🔑 실습 문항의 진도 행이 없는 학생은 **키가 아예 없다**. */
export type LabMissionTally = Map<string, { lab_mission_index: number; lab_earned_index: number }>;

/**
 * 실습실 미션 자리를 참여자별로 접는다 (2026-08-16 신입샘 t1).
 *
 * 🚨 왜 있는가: 12강 실습 문항 **안**에서 90분이 흘러가는데 교사 화면의 단위는 «문항»뿐이었다.
 *    25명이 전부 미션 2 에 몰려도 교사 화면은 「1/7 문항」으로 똑같았다 —
 *    «몇 명이 어느 미션에 몰려 있는가»가 이 수업의 유일한 조종간인데 그게 안 보였다.
 *
 * 🚨 **없는 것을 0 으로 만들지 않는다.** 실습에 아직 안 들어온 학생을 「실습 0/7」로 적으면
 *    «시작했는데 못 하고 있다»로 읽힌다 — 교사가 없는 문제를 보고 그 학생에게 간다.
 * 🔑 「지금 자리」와 「스스로 도달한 자리」를 갈라 담는다. `jump` 로 건너뛴 학생을 한 칸으로만
 *    적으면 안 한 것을 한 것처럼 교사에게 보고하게 된다(학생 화면은 이미 둘을 갈라 놓았다).
 */
export function tallyLabMissions(rows: readonly ProgressRow[]): LabMissionTally {
  const out: LabMissionTally = new Map();

  for (const row of rows) {
    const participantId = row.participant_id;
    if (!participantId) continue;
    const at = row.lab_mission_index;
    // 🔑 «담긴 적이 없다»(null/undefined)와 «미션 0 에 서 있다»(0)는 다르다. 앞엣것만 걸러낸다.
    if (at === null || at === undefined) continue;

    const earned = row.lab_earned_index ?? at;
    const before = out.get(participantId);
    // 한 학생이 실습 문항을 둘 이상 갖는 날에도 «가장 멀리 간 자리»를 쓴다.
    if (before && before.lab_mission_index >= at) continue;
    out.set(participantId, { lab_mission_index: at, lab_earned_index: Math.min(earned, at) });
  }

  return out;
}
