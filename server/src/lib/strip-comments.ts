/**
 * 소스에서 주석만 걷어낸다 — 화면 문구 계약이 «주석에 적힌 낱말»에 걸려 넘어지지 않도록.
 *
 * 🚨 문자열 안의 `//`(예: `https://`)를 주석으로 오인하면 그 줄의 실제 문구가 통째로 사라져
 *    계약이 조용히 눈을 감는다 — 그래서 따옴표를 센다. 이 함수의 이빨은
 *    sessionWordingContract.test.ts 2) 가 음성 대조군으로 지킨다.
 *
 * 🔑 테스트 파일이 아니라 여기 사는 이유: 테스트에서 테스트를 import 하면 그 파일의 케이스가
 *    한 번 더 돌아 개수가 조용히 부풀었다(2026-08-14, 130 → 138).
 */
export function stripComments(source: string): string {
  let out = ''
  let i = 0
  let quote: string | null = null

  while (i < source.length) {
    const ch = source[i]
    const next = source[i + 1]

    if (quote) {
      if (ch === '\\') {
        out += ch + (next ?? '')
        i += 2
        continue
      }
      if (ch === quote) {
        quote = null
      }
      out += ch
      i += 1
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      out += ch
      i += 1
      continue
    }

    if (ch === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i += 1
      continue
    }

    if (ch === '/' && next === '*') {
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1
      i += 2
      continue
    }

    out += ch
    i += 1
  }

  return out
}

