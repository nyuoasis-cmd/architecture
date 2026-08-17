/**
 * 「미니 실습실」 — 12강 실습실(lab-shell) 밖의 터미널형 강(1·5·8·11·13·19·23강)이 나눠 쓰는
 * 공용 엔진. 순수 리듀서 — React·DOM 없음(lab-shell 과 같은 이유).
 *
 * 🚨 lab-shell 을 복제하지 않는다. 12강 실습실은 파일 나무·제출·검증까지 가진 «큰 실습실»이고,
 *    여기는 «명령 몇 개 + 미션 몇 개»짜리 작은 실습실이다 — 강마다 다른 것은 **정의(MiniLab)뿐**이다.
 * 🚨 AI 목소리 규칙은 lab-shell 과 같은 것을 쓴다(nearestCommand·isFreeText·AI_PREFIX) —
 *    오타는 로컬, 자유 문장은 voice 의도, 자동 실행 없음.
 * 🚨 사전 생성 출력에는 REPLAY 라벨을 박는다 — 떼면 학생이 실시간 결과로 오해한다.
 */

import { AI_PREFIX, aiSay, isFreeText, type LabEvent, type LabTone } from './lab-shell';

export type MiniState = {
  /** 명령 이름 → 실행 횟수. 미션 판정의 기본 재료. */
  ran: Record<string, number>;
  /** 명령이 남기는 표식. 문자열·숫자·불리언만 — 결정적 재생과 저장이 쉬워야 한다. */
  flags: Record<string, string | number | boolean>;
  lastKey: string | null;
};

export const INITIAL_MINI_STATE: MiniState = { ran: {}, flags: {}, lastKey: null };

/** 셸이 스스로 못 하는 일 — 화면(MiniLabTab)이 받아서 처리한다(lab-shell 의 ai 이벤트와 같은 결). */
export type MiniEffect =
  | { kind: 'ask'; text: string }
  | { kind: 'voice'; text: string }
  | { kind: 'editor'; flag: string; fileLabel: string; minChars: number; artifactKind?: string };

export type MiniRunResult = {
  lines: LabEvent[];
  flags?: Record<string, string | number | boolean>;
  effect?: MiniEffect;
};

export type MiniCommand = {
  /** 첫 낱말. 🔑 두 낱말 명령은 미니 실습실에 두지 않는다 — 어린 학습자용은 짧게. */
  name: string;
  usage: string;
  what: string;
  run: (args: string, state: MiniState) => MiniRunResult;
};

export type MiniMission = {
  label: string;
  goal: string;
  /** 지금 치면 되는 명령 — 입력칸 회색 예시와 안내가 같은 자리에서 나온다(lab-shell 교훈). */
  nextCommand: (state: MiniState) => string | null;
  done: (state: MiniState) => boolean;
};

export type MiniLab = {
  scopeId: string;
  chapterId: number;
  homeLabel: string;
  aboutTitle: string;
  aboutLines: string[];
  commands: MiniCommand[];
  missions: MiniMission[];
  /** 문항 → 미션 구간(1-based, 양끝 포함). 전 문항을 빈틈없이 덮는다(miniLabContract). */
  qaMissionSpans: Record<string, { from: number; to: number }>;
  /**
   * `ask` 장애 시 대체 응답 풀 — 🚨 라벨 «(대체 응답)»은 화면이 붙인다. 떼지 말 것.
   * AI «필수»인 강(11강)일수록 이 풀이 검수돼 있어야 한다(SDD 결정 14).
   */
  askFallbacks: string[];
};

export function line(text: string, tone: LabTone = 'plain'): LabEvent {
  return { kind: 'line', text, tone };
}

export function missionIndexOfMini(lab: MiniLab, state: MiniState): number {
  for (let i = 0; i < lab.missions.length; i += 1) {
    if (!lab.missions[i]!.done(state)) return i;
  }
  return lab.missions.length;
}

export function nextStepOfMini(lab: MiniLab, state: MiniState): string | null {
  const at = missionIndexOfMini(lab, state);
  if (at >= lab.missions.length) return null;
  return lab.missions[at]!.nextCommand(state);
}

function goalLines(lab: MiniLab, state: MiniState): LabEvent[] {
  const at = missionIndexOfMini(lab, state);
  const mission = lab.missions[at];
  if (!mission) {
    return [line('  미션을 전부 끝냈습니다 — 남은 것은 📝 퀴즈에서 확인해요.', 'ok')];
  }
  const out = [line(`지금 할 일 — ${mission.goal}`)];
  const next = mission.nextCommand(state);
  if (next) out.push(line(`  다음 — ${next}`, 'ok'));
  return out;
}

function helpLines(lab: MiniLab, state: MiniState): LabEvent[] {
  const out: LabEvent[] = [line('아래는 이 실습실이 아는 명령입니다.', 'dim')];
  for (const command of lab.commands) {
    const call = command.usage ? `${command.name} ${command.usage}` : command.name;
    out.push(line(`  ${call.padEnd(18)} ${command.what}`, 'dim'));
  }
  out.push(line('  missions           미션 목록과 지금 할 일을 본다', 'dim'));
  out.push(line('  reset              실습실을 처음으로 되돌린다', 'dim'));
  out.push(line(''));
  return [...out, ...goalLines(lab, state)];
}

function missionLines(lab: MiniLab, state: MiniState): LabEvent[] {
  const now = missionIndexOfMini(lab, state);
  const out: LabEvent[] = [line('미션', 'warn')];
  lab.missions.forEach((mission, index) => {
    const mark = index < now ? '  [끝]' : index === now ? '  [지금]' : '      ';
    const tone: LabTone = index === now ? 'plain' : index < now ? 'ok' : 'dim';
    out.push(line(`${mark} ${index + 1}. ${mission.label}`, tone));
  });
  out.push(line(''));
  return [...out, ...goalLines(lab, state)];
}

export function openingEventsMini(lab: MiniLab): LabEvent[] {
  const out: LabEvent[] = [line(lab.aboutTitle, 'warn')];
  for (const text of lab.aboutLines) out.push(line(text, 'dim'));
  out.push(line(''));
  return [...out, ...goalLines(lab, INITIAL_MINI_STATE), line(''), line('전체 명령은 help · 미션 목록은 missions.', 'dim')];
}

/** 진행 알림 — 미션이 넘어갔을 때만 그 자리에서 말한다(lab-shell 의 f7 교훈). */
function progressLines(lab: MiniLab, before: MiniState, after: MiniState): LabEvent[] {
  const wasAt = missionIndexOfMini(lab, before);
  const nowAt = missionIndexOfMini(lab, after);
  if (nowAt <= wasAt) return [];
  const finished = lab.missions[wasAt];
  const out: LabEvent[] = [line('')];
  if (finished) out.push(line(`  [끝] 미션 ${wasAt + 1} — ${finished.label}`, 'ok'));
  return [...out, ...goalLines(lab, after)];
}

export type MiniExecuteResult = { events: LabEvent[]; nextState: MiniState; effect?: MiniEffect };

export function executeMini(lab: MiniLab, command: string, state: MiniState, idempotencyKey: string): MiniExecuteResult {
  if (idempotencyKey !== '' && idempotencyKey === state.lastKey) {
    return { events: [], nextState: state };
  }
  const base: MiniState = { ...state, ran: { ...state.ran }, flags: { ...state.flags }, lastKey: idempotencyKey };
  const raw = command.trim();
  const echo = line(`${lab.homeLabel}$ ${raw}`, 'input');
  if (raw === '') return { events: [echo], nextState: base };

  const parts = raw.split(/\s+/);
  const head = parts[0]!;
  const args = parts.slice(1).join(' ');

  if (head === 'help') return { events: [echo, ...helpLines(lab, base)], nextState: base };
  if (head === 'missions' || raw === 'lab missions') {
    return { events: [echo, ...missionLines(lab, base)], nextState: base };
  }
  if (head === 'clear') return { events: [{ kind: 'clear' }], nextState: base };
  if (head === 'reset') {
    return {
      events: [
        { kind: 'clear' },
        ...openingEventsMini(lab),
        line(''),
        line('실습실을 처음으로 되돌렸습니다. 지금까지의 진행이 사라졌습니다.', 'warn'),
      ],
      nextState: { ...INITIAL_MINI_STATE, lastKey: idempotencyKey },
    };
  }

  const found = lab.commands.find((item) => item.name === head);
  if (found) {
    const result = found.run(args, base);
    const nextState: MiniState = {
      ...base,
      ran: { ...base.ran, [head]: (base.ran[head] ?? 0) + 1 },
      flags: { ...base.flags, ...(result.flags ?? {}) },
    };
    return {
      events: [echo, ...result.lines, ...progressLines(lab, base, nextState)],
      nextState,
      effect: result.effect,
    };
  }

  // ── AI 목소리 — lab-shell 과 같은 2단 규칙 ──
  const names = ['help', 'missions', 'reset', 'clear', ...lab.commands.map((item) => item.name)];
  const guess = nearestMiniCommand(head, names);
  if (guess) {
    return {
      events: [
        echo,
        aiSay(`혹시 ${guess} 를 치려던 건가요?`),
        aiSay('철자가 조금 달랐어요. 다시 쳐 보세요 — 자동으로 실행하지는 않아요.'),
      ],
      nextState: base,
    };
  }
  if (isFreeText(raw)) {
    return { events: [echo], nextState: base, effect: { kind: 'voice', text: raw } };
  }
  return {
    events: [
      echo,
      line(`'${head}' — 이 실습실이 모르는 명령입니다.`, 'bad'),
      line('지금 할 일은 위에 적혀 있어요. 전체 목록은 help.', 'dim'),
    ],
    nextState: base,
  };
}

/** lab-shell 의 nearestCommand 는 자기 명령표에 묶여 있어, 이름 목록을 받는 판을 따로 둔다. */
export function nearestMiniCommand(word: string, names: string[]): string | null {
  if (word.length < 2 || /[가-힣]/.test(word)) return null;
  let best: { name: string; distance: number } | null = null;
  for (const name of [...new Set(names)]) {
    if (name === word) return null;
    const distance = editDistance(word, name);
    if (distance > 0 && distance <= 2 && distance < name.length && (!best || distance < best.distance)) {
      best = { name, distance };
    }
  }
  return best ? best.name : null;
}

function editDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => {
    const row = new Array<number>(b.length + 1).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= b.length; j += 1) rows[0]![j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      rows[i]![j] = Math.min(
        rows[i - 1]![j]! + 1,
        rows[i]![j - 1]! + 1,
        rows[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return rows[a.length]![b.length]!;
}

/** ask 장애 시 대체 응답 — 풀에서 차례대로. 🚨 «(대체 응답)» 라벨을 절대 떼지 않는다. */
export function askFallbackLines(lab: MiniLab, usedCount: number): LabEvent[] {
  const pool = lab.askFallbacks;
  if (pool.length === 0) {
    return [aiSay('(대체 응답) 지금 AI 연결이 어려워요. 잠시 뒤 다시 해 보세요.')];
  }
  const pick = pool[usedCount % pool.length]!;
  return [
    { kind: 'line', text: `${AI_PREFIX} (대체 응답) 지금 AI 연결이 어려워, 검수된 답으로 대신해요.`, tone: 'ai' },
    ...pick.split('\n').map((row) => line(`  ${row}`)),
  ];
}

/** REPLAY 라벨 — 사전 생성 출력의 머리에 반드시 붙인다. */
export const MINI_REPLAY_LABEL = '--- REPLAY - 사전 생성 예시 (실시간 AI 호출이 아닙니다) ---';
