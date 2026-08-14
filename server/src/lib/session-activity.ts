/**
 * 수업 카드가 「현황판」이 되기 위해 필요한 숫자들을 진도 행에서 뽑는다.
 * BUILDER-UX-POLICY §4 Phase 2 API 스펙(student_count·activity_count·recent_students·last_activity).
 *
 * 🔑 왜 순수 함수인가: DB 없이 돌려 볼 수 있어야 계약이 «집계 규칙»을 실제로 평가한다.
 *    쿼리 안에 섞어 놓으면 배포된 뒤 교사 화면에서만 틀린 게 드러난다.
 *
 * 🚨 activity_count 는 «들어오기만 한 학생»을 세지 않는다 — 진도 행이 하나라도 있는 학생만이다.
 *    참여만 한 사람을 세면 피드가 「다들 하고 있다」고 거짓말한다(§4 studio 항목의 같은 사고).
 *
 * 🚨 이 숫자들이 뜻하는 것은 «문항을 **열었다**»이지 «이해했다»가 아니다(session-progress.ts).
 *    화면 문구를 「읽은」·「끝낸」으로 적지 말 것.
 */
export type ActivityParticipant = {
  id: string;
  nickname: string;
};

export type ActivityProgressRow = {
  participant_id?: string | null;
  qa_id?: string | null;
  read_at?: string | null;
  quiz_score?: number | null;
};

export type SessionActivity = {
  /** 수업에 들어온 학생 수(DISTINCT) */
  student_count: number;
  /** 진도 행이 하나라도 있는 학생 수(DISTINCT) — +N 뱃지의 분모 */
  activity_count: number;
  /** 최근 활동 순 상위 4명. 서버에서 자른다 */
  recent_students: string[];
  last_activity: {
    student_name: string;
    target_title: string;
    action: string;
    timestamp: string;
  } | null;
  /** 학생들이 연 문항 행의 총합 */
  opened_qa_count: number;
  /** 하나라도 열었지만 아직 전부는 아닌 학생 수 */
  in_progress_count: number;
};

export type ActivityInput = {
  participants: readonly ActivityParticipant[];
  progressRows: readonly ActivityProgressRow[];
  /** 이 수업에 담긴 문항 총수. 0이면 «전부 열었다»를 판정할 수 없어 진행 중으로 세지 않는다. */
  totalQas: number;
  /** qa_id → 학생에게 보이는 문항 제목. 없으면 qa_id 를 그대로 쓴다. */
  titleOf?: (qaId: string) => string | undefined;
};

export function summarizeSessionActivity({
  participants,
  progressRows,
  totalQas,
  titleOf,
}: ActivityInput): SessionActivity {
  const nicknameById = new Map(participants.map((participant) => [participant.id, participant.nickname]));
  const openedByParticipant = new Map<string, number>();
  const lastSeenByParticipant = new Map<string, string>();

  let opened = 0;
  let latest: { row: ActivityProgressRow; timestamp: string } | null = null;

  for (const row of progressRows) {
    const participantId = row.participant_id;
    // 주인 없는 행·이 수업 학생이 아닌 행은 어느 숫자에도 넣지 않는다.
    if (!participantId || !nicknameById.has(participantId)) {
      continue;
    }

    opened += 1;
    openedByParticipant.set(participantId, (openedByParticipant.get(participantId) ?? 0) + 1);

    const timestamp = row.read_at ?? null;
    if (!timestamp) {
      // 시각이 없는 행도 «활동»으로는 센다 — 다만 최근 순 정렬에는 못 낀다.
      continue;
    }

    const previous = lastSeenByParticipant.get(participantId);
    if (!previous || previous < timestamp) {
      lastSeenByParticipant.set(participantId, timestamp);
    }

    if (!latest || latest.timestamp < timestamp) {
      latest = { row, timestamp };
    }
  }

  const recent_students = [...lastSeenByParticipant.entries()]
    .sort((left, right) => right[1].localeCompare(left[1]))
    .slice(0, 4)
    .map(([participantId]) => nicknameById.get(participantId) ?? '')
    .filter((nickname) => nickname.length > 0);

  const in_progress_count =
    totalQas > 0
      ? [...openedByParticipant.values()].filter((count) => count > 0 && count < totalQas).length
      : 0;

  const last_activity = latest
    ? {
        student_name: nicknameById.get(latest.row.participant_id as string) ?? '',
        target_title: (latest.row.qa_id ? titleOf?.(latest.row.qa_id) : undefined) ?? latest.row.qa_id ?? '',
        action: typeof latest.row.quiz_score === 'number' ? '퀴즈 완료' : '읽음',
        timestamp: latest.timestamp,
      }
    : null;

  return {
    student_count: participants.length,
    activity_count: openedByParticipant.size,
    recent_students,
    last_activity,
    opened_qa_count: opened,
    in_progress_count,
  };
}
