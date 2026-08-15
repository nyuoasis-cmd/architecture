/**
 * 12강 실습실의 **결정적 검사기** — `npm test` 가 부르는 것.
 *
 * 🚨 여기에 **LLM 판정기가 없다.** 있어서는 안 된다(§5 골격 3).
 *    1) 학생이 낸 글이 판정기의 프롬프트로 들어가면 그게 곧 프롬프트 인젝션 자리다.
 *    2) 채점이 매번 흔들리면 「형식을 지켰는가」를 가르치는 수업에서 채점이 형식을 안 지키는 꼴이 된다.
 *    3) 이 검사기가 도는 데 돈이 한 푼도 안 든다 — 그래서 실습의 핵심 체험(실패)을 AI 비용 0원으로 겪는다.
 *
 * 🚨 이 파일이 곧 **12강의 주장**이다. 세 답은 뜻이 같지만 **형식이 달라서** 프로그램이 터진다.
 *    「다시 돌리면 같아진다」가 아니라 **「약속을 지킨다」**를 가르친다(§3-가).
 *    진짜 AI 는 규칙을 줘도 글자가 똑같아지지 않기 때문이다 — 그 거짓 명제를 화면에 띄우려면
 *    그 장면을 녹화해야 하고, 그 순간 「AI 호출은 진짜」라는 약속이 안에서 깨진다.
 *
 * 🔑 PR5 에서 서버가 **같은 규칙으로** 저장된 답을 다시 검사한다. 그때 이 파일이 정본이 된다 —
 *    로컬 판정은 피드백일 뿐이고 점수가 아니다(클라이언트 판정은 위조되기 때문).
 */

/** 파서가 지키기로 한 약속. 🔑 이 두 줄이 「형식」의 전부다 — 학생이 규칙 문서에 적어야 할 것. */
const DISCOUNT_PATTERN = /^할인율: (\d+)%$/m;
const FINAL_PATTERN = /^최종가: (\d+)$/m;

export type CheckOutcome =
  | { ok: true; discountPercent: number; finalPrice: number }
  | { ok: false; reason: string };

/**
 * 결과 한 건을 파서에 넣어 본다.
 * 🚨 왜 «못 찾음»으로 끝내지 않고 **무엇이 애매했는지**까지 적는가: 학생이 고쳐야 할 것은
 *    「틀렸다」가 아니라 「어디가 애매한가」다. `0.1` 은 10%인지 0.1%인지 사람도 모른다.
 */
export function parseResult(text: string): CheckOutcome {
  const discount = DISCOUNT_PATTERN.exec(text);
  if (!discount) {
    // 숫자가 있긴 한데 약속한 자리에 없는 경우와, 아예 없는 경우를 갈라 말한다.
    // 🔑 뒤따르는 낱말까지 같이 집는다 — «"10%" 에서 못 찾음» 보다 «"10% off" 에서 못 찾음» 이
    //    학생에게 «어디가 문제인지»를 훨씬 정확히 말해 준다.
    const looseNumber = /\d+(?:\.\d+)?\s*%(?:\s*[A-Za-z가-힣]+)?/.exec(text);
    if (looseNumber) {
      return { ok: false, reason: `"${looseNumber[0]}" 에서 숫자를 못 찾음 — 약속한 자리(할인율: N%)가 아니다` };
    }
    const fraction = /"?discount"?\s*[:=]\s*(0?\.\d+)/.exec(text);
    if (fraction) {
      return { ok: false, reason: `"${fraction[1]}" 은 10%인가 0.1%인가 — 사람도 모른다` };
    }
    return { ok: false, reason: '할인율을 못 찾음' };
  }

  const final = FINAL_PATTERN.exec(text);
  if (!final) {
    return { ok: false, reason: '최종가를 못 찾음 — 약속한 자리(최종가: N)가 아니다' };
  }

  return { ok: true, discountPercent: Number(discount[1]), finalPrice: Number(final[1]) };
}

export type CheckRow = { name: string; outcome: CheckOutcome };

/** 여러 결과를 한 번에. 순서는 넣어 준 순서 그대로 — 학생이 `ls` 로 본 순서와 같아야 한다. */
export function checkAll(files: { name: string; text: string }[]): CheckRow[] {
  return files.map((file) => ({ name: file.name, outcome: parseResult(file.text) }));
}

export function passCount(rows: CheckRow[]): number {
  return rows.filter((row) => row.outcome.ok).length;
}

/**
 * 버전 고정 기록 — `lab version` 이 보여 준다.
 *
 * 🚨 왜 필요한가(Codex): 작년 재생본과 올해 실호출을 나란히 놓고 비교하면, 달라진 것이 **규칙 때문인지
 *    모델이 업데이트돼서인지 알 수 없다.** 그러면 이 수업이 증명하려던 인과가 통째로 오염된다.
 *    그래서 재생본을 만든 모델·설정·날짜를 붙박아 둔다.
 * 🔑 지금은 AI 를 안 부르므로 `model` 이 «해당 없음»이다. 있는 것처럼 적지 않는다.
 */
export const LAB_VERSION = {
  /** 재생본(`runs/`)을 만든 날. 이 날짜가 바뀌면 세 결과의 내용도 바뀐 것이다. */
  fixturesCreatedAt: '2026-08-15',
  /** 재생본을 만든 모델. 🚨 손으로 적는 값이라, 재생본을 다시 만들면 여기도 같이 고친다. */
  fixturesModel: 'claude-haiku-4-5-20251001',
  /** 검사기 규칙 판. 규칙을 고치면 올린다 — 안 올리면 작년 채점과 올해 채점을 구분 못 한다. */
  checkerRevision: 1,
} as const;
