import { LAB_AI_LIMITS, VOICE_ACTOR_PER_MIN } from "./lab-ai";
import { createHash } from "node:crypto";

/**
 * 수업점검(class-check)이 밖에서 알 수 없는 것을 런타임이 직접 말해주는 블록.
 *
 * 왜 필요한가 (2026-08-02 실측):
 *  1. **실효 캡** — Render 배포 payload 에 env 스냅샷이 없어서, API 로 조회한 env 가
 *     「라이브 배포에 적용된 값」이라는 보장이 없다. env 를 바꾼 뒤 배포가 실패·대기 중이면
 *     조회값과 실제값이 다르고, 그 상태에서 거짓 🟢가 난다.
 *  2. **provider 계정 지문** — AI 한도는 앱이 아니라 «키(계정)» 에 붙는다. 여러 앱이 같은 키를
 *     쓰면 한도를 나눠 쓰므로 합산해서 판정해야 하는데, 어느 앱이 같은 키를 쓰는지는
 *     로컬 .env 로 알 수 없다(운영 키는 Render 에만 있다).
 *
 * 🚨 `capPolicy` 가 있는 이유: 이 앱은 **앱 자체 일일 캡이 없다.** 그렇다고 `caps: {}` 만
 *   내보내면 호출부가 「빈 객체 = 캡 없음」으로 **추론**해야 하는데, 그건 버그로 빈 객체가
 *   나온 경우와 구분되지 않는다. 침묵을 의미로 읽지 않기 위해 정책을 명시한다.
 *   `none` = 앱 캡 없음, 제공자 한도가 유일한 방어선이다.
 *
 * 🚨 지문은 **키 자체가 아니라 SHA-256 앞 8자**다. 역산 불가하고, 드러나는 정보는
 *   「이 두 배포가 같은 키를 쓴다」는 사실뿐이다. 원문 키·env 전체 덤프는 절대 넣지 않는다.
 *   키가 없으면 그 항목을 **아예 넣지 않는다** — 빈 문자열의 해시를 흘리면 「키 없는 앱들」이
 *   전부 같은 지문으로 보여 공유로 오독된다.
 */
function fingerprint(value: string | undefined): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  return createHash("sha256").update(v).digest("hex").slice(0, 8);
}

export function providerFingerprints(): Record<string, string> {
  const out: Record<string, string> = {};
  const gemini = fingerprint(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY);
  const anthropic = fingerprint(process.env.ANTHROPIC_API_KEY);
  if (gemini) out.gemini = gemini;
  if (anthropic) out.anthropic = anthropic;
  return out;
}

export function classCheckBlock() {
  // 🚨 2026-08-18: «내 차례»(POST /api/vibe/my-turn)를 철거하면서 **앱 전역 캡이 실제로 사라졌다.**
  //    2026-08-10~08-18 사이에는 그 라우트가 앱 레벨 전역 캡(MYTURN_*)을 들여와서 여기가 갈래를
  //    갖고 있었다. 지금은 갈래가 없다 — 남은 통제는 전부 «신원별 창»(per-key)이라 학급 총량을
  //    묶지 않는다. 그래서 capPolicy 는 언제나 "none" 이고, 그건 **거짓이 아니라 사실**이다.
  // 🚨 되살리지 말 것: 여기에 app 스코프 캡을 다시 넣으면 «수업을 멈출 수 있는 자리»가 하나 늘고,
  //    캡을 보고 인원을 계산하는 쪽(축3 R6·R7)이 그 값에 걸린다. 지출 상한은 **API 키 쪽에** 있다.
  return {
    capPolicy: "none" as const,
    // 🔑 §1-E E-3/E-4: 캡은 숫자가 아니라 {value, scope, audience} 로 말한다 — 숫자만 주면
    //    축3 이 «학급 총량을 묶는 캡인지» 알 수 없어 검증 불가로 떨어진다.
    //    scope: app(앱 전역 통) | per-key(신원별 통) · audience: all | verified(참여자 토큰) | anon(자습 통).
    //    🚨 여기 남은 하나는 **연타 창**이지 소진 캡이 아니다 — 분당이 지나면 도로 열린다.
    caps: {
      LAB_VOICE_ACTOR_PER_MIN: { value: VOICE_ACTOR_PER_MIN, scope: "per-key", audience: "all" },
    },
    // 🔑 env 조정형 «출력 상한» 의 런타임 실효값 — 레포를 읽으면 기본값만 얻는다(수업 당일
    //    무배포 상향을 놓친다). 축2-b 가 이 값을 원장에 적재한다(§1-C 2차 개정 3, aab 선례).
    tokenCaps: {
      LAB_MAX_OUTPUT_TOKENS: LAB_AI_LIMITS.maxOutputTokens,
    },
    used: null,
    providerFingerprint: providerFingerprints(),
  };
}
