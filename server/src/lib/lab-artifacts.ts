import type { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseAdminClient } from './supabase';
import type { LabActor } from './lab-submissions';

/**
 * 체험 산출물 계보 — 12강 규칙 → 13강 스킬 → 16강 완료 조건 → 19강 약속 문장 → 22강 넘김 쪽지 → 23강 묶음.
 * (SDD 체험 재구조화 결정 15. 테이블 = sql/010_lab_artifacts.sql)
 *
 * 🚨 **덧붙이기만 한다.** 고쳐 낼 때마다 새 판(revision)을 쌓는다 — update·delete 가 없다.
 * 🚨 **테이블이 아직 없어도 수업이 죽지 않는다**(커밋 5f6ed39 선례 — 배포 순서가 수업을 멈추지 않게).
 *    저장 실패는 던지고, 부르는 쪽(제출 라우트)이 «비치명»으로 다룬다. 조회 실패는 «없음»과
 *    갈라 말한다 — 빈 결과로 답하면 23강이 «아직 안 만들었네요»라고 거짓말을 하게 된다.
 */

export const ARTIFACT_KINDS = ['rules', 'skill', 'ac', 'promise', 'handoff', 'bundle'] as const;
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

export class LabArtifactsUnavailableError extends Error {}

const defaultDb = (): SupabaseClient | null => getSupabaseAdminClient();
let resolveDb: () => SupabaseClient | null = defaultDb;

/** 🔑 시험 전용 — lab-submissions 와 같은 패턴. `null` 이면 운영 경로로 되돌린다. */
export function setLabArtifactsDbResolverForTest(next: (() => SupabaseClient | null) | null): void {
  resolveDb = next ?? defaultDb;
}

function whereOf(actor: LabActor) {
  return 'participantId' in actor
    ? { column: 'participant_id' as const, value: actor.participantId }
    : { column: 'owner_token' as const, value: actor.ownerToken };
}

export type LabArtifact = { kind: ArtifactKind; content: string; revision: number; createdAt: string };

/** 이 학생의 계보 지금 — kind 마다 마지막 판 하나. 없는 kind 는 빠진다. */
export async function latestArtifacts(actor: LabActor): Promise<Record<string, LabArtifact>> {
  const supabase = resolveDb();
  if (!supabase) throw new LabArtifactsUnavailableError('no_database');
  const where = whereOf(actor);

  const { data, error } = await supabase
    .from('architecture_lab_artifacts')
    .select('kind, content, revision, created_at')
    .eq(where.column, where.value)
    .order('revision', { ascending: false });
  if (error) throw new LabArtifactsUnavailableError(error.message);

  const out: Record<string, LabArtifact> = {};
  for (const row of data ?? []) {
    const kind = row.kind as ArtifactKind;
    if (out[kind]) continue; // revision 내림차순이라 첫 행이 마지막 판이다.
    out[kind] = {
      kind,
      content: row.content as string,
      revision: row.revision as number,
      createdAt: row.created_at as string,
    };
  }
  return out;
}

/**
 * 새 판을 쌓는다. 🔑 판 번호는 «마지막+1» — 두 탭이 동시에 내면 유일 인덱스가 뒤엣것을 튕기고,
 * 한 번만 다시 읽어 이어 낸다(낙관적 잠금, lab-submissions 와 같은 결).
 */
export async function saveArtifact(actor: LabActor, kind: ArtifactKind, content: string): Promise<number> {
  const supabase = resolveDb();
  if (!supabase) throw new LabArtifactsUnavailableError('no_database');
  const where = whereOf(actor);
  const trimmed = content.slice(0, 8000);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data: last, error: readError } = await supabase
      .from('architecture_lab_artifacts')
      .select('revision')
      .eq(where.column, where.value)
      .eq('kind', kind)
      .order('revision', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (readError) throw new LabArtifactsUnavailableError(readError.message);

    const revision = ((last?.revision as number | undefined) ?? 0) + 1;
    const { error } = await supabase.from('architecture_lab_artifacts').insert({
      [where.column]: where.value,
      kind,
      content: trimmed,
      revision,
    });
    if (!error) return revision;
    // 유일 인덱스 충돌(동시 제출)만 한 번 더 — 나머지는 그대로 «못 썼다»로 말한다.
    if (error.code !== '23505' || attempt === 1) throw new LabArtifactsUnavailableError(error.message);
  }
  throw new LabArtifactsUnavailableError('retry_exhausted');
}
