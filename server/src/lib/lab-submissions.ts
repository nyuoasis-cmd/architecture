import type { SupabaseClient } from '@supabase/supabase-js';

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

/**
 * DB 손잡이를 여기 한 줄로 모은다.
 *
 * 🚨 사고(2026-08-15): 「DB 가 없으면 실패로 말한다」는 계약이 **주변 환경에 기대고** 있었다.
 *    시험이 «이 환경에는 DB 가 없다»를 전제했는데, 개발 기계의 레포 루트 `.env` 에는
 *    운영 자격증명이 들어 있다. 그래서 CI 는 초록인데 로컬은 빨갛고, 더 나쁘게는
 *    로컬에서 `npm test` 를 돌릴 때마다 **운영 테이블에 제출물이 한 판씩 쌓였다.**
 * 🔑 그래서 «DB 가 없다»를 시험이 **직접** 만들 수 있게 한다 — `runRules` 를 주입받는 이유와 같다.
 *    운영 경로는 아무것도 달라지지 않는다.
 */
const defaultDb = (): SupabaseClient | null => getSupabaseAdminClient();
let resolveDb: () => SupabaseClient | null = defaultDb;

/** 🔑 시험 전용. `null` 을 주면 기본(운영 경로)으로 되돌린다. */
export function setLabDbResolverForTest(next: (() => SupabaseClient | null) | null): void {
  resolveDb = next ?? defaultDb;
}

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
  const supabase = resolveDb();
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
  const supabase = resolveDb();
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

/**
 * 이 수업의 실습 현황 — 교사 화면이 읽는다.
 *
 * 🚨 **모르는 것을 아는 척하지 않는다.** 여기서 셀 수 있는 것은 «낸 것»뿐이다.
 *    아직 안 낸 학생이 «막힌» 것인지 «열심히 쓰는 중»인지 이 데이터로는 알 수 없다 —
 *    그래서 「N분째 진전 없음」 같은 알림을 만들지 않는다. 그건 멀쩡히 쓰고 있는 학생을
 *    교사가 쫓아가게 만드는 오탐이고, 수업 중의 오탐은 없느니만 못하다.
 */
export type LabClassRow = {
  participantId: string;
  nickname: string;
  /** 낸 적이 없으면 0. */
  revision: number;
  passed: number;
  total: number;
  /** 마지막으로 낸 시각. 낸 적이 없으면 null. */
  lastSubmittedAt: string | null;
};

export type LabClassStatus = {
  rows: LabClassRow[];
  /** 🔑 여러 학생이 **같은 데서** 터졌는가. 교사가 칠판에서 한 번에 풀 수 있는 것이 여기 보인다. */
  topReasons: { reason: string; count: number }[];
  submittedCount: number;
  passedCount: number;
};

export async function classStatus(sessionId: string, qaId: string): Promise<LabClassStatus> {
  const supabase = resolveDb();
  if (!supabase) throw new LabSubmitUnavailableError('no_database');

  const { data: participants, error: pErr } = await supabase
    .from('architecture_participants')
    .select('id, nickname, joined_at')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true });
  if (pErr) throw new LabSubmitUnavailableError(pErr.message);
  const roster = participants ?? [];
  if (roster.length === 0) return { rows: [], topReasons: [], submittedCount: 0, passedCount: 0 };

  const { data, error } = await supabase
    .from('architecture_lab_submissions')
    .select('participant_id, revision, verdict, created_at')
    .in(
      'participant_id',
      roster.map((row) => row.id as string),
    )
    .eq('qa_id', qaId)
    .order('revision', { ascending: false });
  if (error) throw new LabSubmitUnavailableError(error.message);

  // 학생마다 «마지막 판»만 남긴다(내림차순이라 처음 만나는 것이 마지막 판).
  const latest = new Map<string, { revision: number; verdict: LabVerdict | null; createdAt: string }>();
  for (const row of data ?? []) {
    const id = row.participant_id as string;
    if (latest.has(id)) continue;
    latest.set(id, {
      revision: row.revision as number,
      verdict: (row.verdict as LabVerdict | null) ?? null,
      createdAt: row.created_at as string,
    });
  }

  // 🚨 **안 낸 학생도 줄에 세운다.** 낸 학생만 보이면 교사는 «다 냈다»고 오해한다.
  const rows: LabClassRow[] = roster.map((participant) => {
    const id = participant.id as string;
    const mine = latest.get(id);
    return {
      participantId: id,
      nickname: (participant.nickname as string) ?? '',
      revision: mine?.revision ?? 0,
      passed: mine?.verdict?.passed ?? 0,
      total: mine?.verdict?.total ?? 0,
      lastSubmittedAt: mine?.createdAt ?? null,
    };
  });

  const tally = new Map<string, number>();
  for (const mine of latest.values()) {
    for (const row of mine.verdict?.rows ?? []) {
      if (row.ok || !row.reason) continue;
      tally.set(row.reason, (tally.get(row.reason) ?? 0) + 1);
    }
  }
  const topReasons = [...tally.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    rows,
    topReasons,
    submittedCount: rows.filter((row) => row.revision > 0).length,
    passedCount: rows.filter((row) => row.total > 0 && row.passed === row.total).length,
  };
}
