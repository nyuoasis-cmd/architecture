/**
 * 12강 실습실의 **판정** — 서버 쪽 사본.
 *
 * 🚨 왜 사본이 있는가: 점수는 **서버가 저장된 본문으로 다시 낸다.** 화면이 보낸 «통과했어요»는
 *    근거가 아니다 — 채점 로그와 같은 이유로 위조된다. 그래서 판정 규칙이 서버에도 있어야 한다.
 * 🚨 왜 import 하지 않는가: server/tsconfig 의 rootDir 이 server/src 라
 *    `client/…` 를 정적 import 하면 tsx 는 멀쩡한데 `tsc` 가 TS6059 로 죽는다.
 *    (vibeQuizContract·labShellContract 가 같은 이유로 실행 시점 require 를 쓴다.)
 *
 * 🔑 그래서 **두 벌이 어긋나는 것**이 이 파일의 유일한 위험이다. 어긋나면 학생 화면은 초록인데
 *    교사 화면은 빨강이 된다 — 그건 수업 중에 아무도 못 고친다.
 *    `labCheckerParityContract` 가 두 벌을 같은 입력에 넣어 판정이 같은지 매번 대조한다.
 *    **규칙을 고칠 때는 반드시 두 파일을 같이 고친다.**
 */

const DISCOUNT_PATTERN = /^할인율: (\d+)%$/m;
const FINAL_PATTERN = /^최종가: (\d+)$/m;

export type CheckOutcome =
  | { ok: true; discountPercent: number; finalPrice: number }
  | { ok: false; reason: string };

export function parseResult(text: string): CheckOutcome {
  const discount = DISCOUNT_PATTERN.exec(text);
  if (!discount) {
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

export function checkAll(files: { name: string; text: string }[]): CheckRow[] {
  return files.map((file) => ({ name: file.name, outcome: parseResult(file.text) }));
}

export function passCount(rows: CheckRow[]): number {
  return rows.filter((row) => row.outcome.ok).length;
}

/**
 * 저장할 판정 덩어리.
 * 🔑 **결과 원문(`outputs`)을 같이 남긴다.** 판정만 남기면 나중에 「왜 이렇게 나왔나」를
 *    아무도 재현 못 한다 — 특히 AI 가 매번 다른 답을 내는 자리라 더 그렇다.
 */
export type LabVerdict = {
  outputs: string[];
  rows: { name: string; ok: boolean; reason?: string }[];
  passed: number;
  total: number;
};

export function buildVerdict(outputs: string[]): LabVerdict {
  const rows = checkAll(outputs.map((text, index) => ({ name: `my-${index + 1}`, text })));
  return {
    outputs,
    rows: rows.map((row) => ({
      name: row.name,
      ok: row.outcome.ok,
      ...(row.outcome.ok ? {} : { reason: row.outcome.reason }),
    })),
    passed: passCount(rows),
    total: rows.length,
  };
}
