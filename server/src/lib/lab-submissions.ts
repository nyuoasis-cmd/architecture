import { getSupabaseAdminClient } from './supabase';
import { buildVerdict, type LabVerdict } from './lab-checker';

/**
 * 실습실 제출물 — 저장과 서버 재검증.
 *
 * 🚨 **덧붙이기만 한다.** 학생이 고쳐 낼 때마다 새 판(revision)을 쌓고, 이전 판은 그대로 둔다.
 *    교사가 볼 가치가 있는 것은 마지막 결과가 아니라 **고쳐 온 과정**이다.
 * 🚨 **판정은 저장된 본문으로 서버가 낸다.** 화면이 보낸 판정은 받지도 저장하지도 않는다.
 * 🔑 DB 가 없으면 제출은 실패한다 — 조용히 성공한 척하면 학생은 냈다고 믿고 교사는 아무것도 못 본다.
 */

export type LabActor = { participantId: string } | { ownerToken: string };

export class LabSubmitUnavailableError extends Error {}

/** `pt:<uuid>` / `ip:<...>` 형태의 신원을 저장용으로 바꾼다. */
export function toLabActor(actorId: string): LabActor {
  if (actorId.startsWith('pt:')) return { participantId: actorId.slice(3) };
  // 🔑 자습은 «누구»를 증명하지 않는다. 그래도 같은 브라우저가 이어서 고쳐 낼 수 있게 키는 준다.
  return { ownerToken: actorId };
}

function whereOf(actor: LabActor) {
  return 'participantId' in actor
    ? { column: 'participant_id' as const, value: actor.participantId }
    : { column: 'owner_token' as const, value: actor.ownerToken };
}

export type LabSubmission = {
  revision: number;
  rules: string;
  verdict: LabVerdict | null;
  createdAt: string;
};

/** 이 학생이 이 문항에 낸 마지막 판. 없으면 null. */
export async function latestSubmission(actor: LabActor, qaId: string): Promise<LabSubmission | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new LabSubmitUnavailableError('no_database');
  const where = whereOf(actor);

  const { data, error } = await supabase
    .from('architecture_lab_submissions')
    .select('revision, rules, verdict, created_at')
    .eq(where.column, where.value)
    .eq('qa_id', qaId)
    .order('revision', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new LabSubmitUnavailableError(error.message);
  if (!data) return null;
  return {
    revision: data.revision as number,
    rules: data.rules as string,
    verdict: (data.verdict as LabVerdict | null) ?? null,
    createdAt: data.created_at as string,
  };
}

/**
 * 한 판 낸다.
 *
 * @param runRules 서버가 저장된 본문으로 AI 를 돌리는 함수. 🔑 주입받는 이유 = 이 파일을
 *        AI 없이 시험할 수 있게. 판정 규칙과 저장 규칙을 AI 호출과 섞으면 둘 다 못 본다.
 *
 * 🚨 판 번호 충돌(두 탭에서 동시에 제출)은 **다시 읽어 이어서 낸다.** 학생에게 «다시 눌러 주세요»를
 *    시키지 않는다 — 수업 중에 그 안내는 «고장»으로 읽힌다.
 */
export async function submit(
  actor: LabActor,
  qaId: string,
  rules: string,
  runRules: (rules: string) => Promise<string[]>,
): Promise<{ revision: number; verdict: LabVerdict }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new LabSubmitUnavailableError('no_database');
  const where = whereOf(actor);
  const trimmed = rules.trim();

  // 🔑 AI 를 먼저 돌린다. 저장은 그 뒤 — 판정 없는 빈 판을 남기지 않는다.
  const outputs = await runRules(trimmed);
  const verdict = buildVerdict(outputs);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const previous = await latestSubmission(actor, qaId);
    const revision = (previous?.revision ?? 0) + 1;
    const { error } = await supabase.from('architecture_lab_submissions').insert({
      [where.column]: where.value,
      qa_id: qaId,
      revision,
      rules: trimmed,
      verdict,
    });
    if (!error) return { revision, verdict };
    // 23505 = unique 위반 = 그 사이 다른 탭이 같은 번호를 먼저 썼다. 다시 읽고 이어 붙인다.
    if ((error as { code?: string }).code !== '23505') throw new LabSubmitUnavailableError(error.message);
  }
  throw new LabSubmitUnavailableError('revision_conflict');
}

/** 이 수업의 실습 현황 — 교사 화면(PR5b)이 읽는다. */
export type LabClassRow = {
  participantId: string;
  revision: number;
  passed: number;
  total: number;
  createdAt: string;
};

export async function classStatus(sessionId: string, qaId: string): Promise<LabClassRow[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new LabSubmitUnavailableError('no_database');

  const { data: participants, error: pErr } = await supabase
    .from('architecture_participants')
    .select('id')
    .eq('session_id', sessionId);
  if (pErr) throw new LabSubmitUnavailableError(pErr.message);
  const ids = (participants ?? []).map((row) => row.id as string);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('architecture_lab_submissions')
    .select('participant_id, revision, verdict, created_at')
    .in('participant_id', ids)
    .eq('qa_id', qaId)
    .order('revision', { ascending: false });
  if (error) throw new LabSubmitUnavailableError(error.message);

  // 🔑 학생마다 «마지막 판»만 남긴다(정렬이 내림차순이라 처음 만나는 것이 마지막 판).
  const seen = new Set<string>();
  const rows: LabClassRow[] = [];
  for (const row of data ?? []) {
    const participantId = row.participant_id as string;
    if (seen.has(participantId)) continue;
    seen.add(participantId);
    const verdict = row.verdict as LabVerdict | null;
    rows.push({
      participantId,
      revision: row.revision as number,
      passed: verdict?.passed ?? 0,
      total: verdict?.total ?? 0,
      createdAt: row.created_at as string,
    });
  }
  return rows;
}
