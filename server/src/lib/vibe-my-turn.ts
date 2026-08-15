import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { isParticipantKey } from './actor-id';
import { env } from '../env';
import { budgetVerdict, estimateCostUsd, registerUsageCost } from './ai-spend';

// «내 차례» — 학생이 쓴 부탁문을 Haiku 4.5로 실제 실행해, 다섯 칸 중
// «학생이 정한 칸 / AI가 대신 정하게 되는 칸»을 판정한다.
// 모델 = Haiku 4.5 재사용 (jery 승인 2026-08-10, 기존 챗봇과 동일 모델).
// 호출 통제: 학생 분당 10 · 학생 하루 300 · 전체 분당 60 · 전체 하루 500 (쿨타임 없음).

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

// 🚨 출력 상한. 이 값이 곧 «한 호출이 최대 얼마인가»의 절반이다 — 올릴 때는 돈이 같이 올라간다.
const MY_TURN_MAX_OUTPUT_TOKENS = envInt('MYTURN_MAX_OUTPUT_TOKENS', 800);
// 🚨 매달린 호출이 동시성 자리를 물고 있지 않게. 수업 중 30명이 동시에 누르는 자리다.
const MY_TURN_TIMEOUT_MS = envInt('MYTURN_TIMEOUT_MS', 20000) ;

// 호출 통제 값 — 전부 Render env 로 «무배포» 조정한다(대규모 수업 전 상향 → 수업 후 원복).
// 🚨 코드 상수로만 두면 상향에 배포가 필요해서, 수업 당일 막혔을 때 손쓸 수가 없다.
// 🚨 2026-08-11 상향(jery 확정) — 실습 강이 들어오면서 «쓰고 판정받고 고치고»가 수업의 본체가 됐다.
//    5분 쿨타임은 한 차시 안에 학생이 두세 번밖에 못 고치게 만드는 병목이었다(비용이 아니라 수업이 막힌다).
//    그래서 **쿨타임 0 · 학생 하루 300** 으로 올리고, 대신 **학생 분당 10** 을 새로 둔다.
//    분당 10 은 돈 때문이 아니라 **연타 오작동 방지**다 — 쿨타임을 없애면 버튼 연타가 그대로 호출이 된다.
// 🚨 이 값들이 바뀌면 /health 의 classCheck 선언도 같이 움직여야 한다(둘의 정합은 테스트가 지킨다).
/**
 * env 정수 읽기.
 * 🚨 `allowZero` 가 없으면 «0 을 넣어 끄는» 조정이 조용히 무시된다 — 0 은 «양수 아님»이라
 *    기본값으로 되돌아가기 때문이다. 쿨타임은 0(=없음)이 정상 설정값이라 이 갈래가 필요하다.
 *    (이걸 안 갈라 두면 Render 에 MYTURN_COOLDOWN_SEC=0 을 넣고도 5분이 그대로 걸린다.)
 */
export function envInt(key: string, fallback: number, allowZero = false): number {
  const raw = process.env[key];
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  const floor = allowZero ? 0 : 1;
  return Number.isFinite(n) && n >= floor ? Math.floor(n) : fallback;
}

export const MY_TURN_LIMITS = {
  // 🔑 기본 0 = 쿨타임 없음. 되돌리려면 Render 에 MYTURN_COOLDOWN_SEC=300 한 줄(무배포).
  cooldownSeconds: envInt('MYTURN_COOLDOWN_SEC', 0, true),
  actorDaily: envInt('MYTURN_ACTOR_DAILY_CAP', 300),
  // 🚨 쿨타임을 없앤 자리를 이게 받는다. 이 줄이 빠지면 학생 한 명이 버튼을 연타하는 만큼
  //    그대로 호출이 나가고, 전역 분당 60 이 한 명에게 다 먹힌다 — 같은 반의 다른 학생이 막힌다.
  actorPerMin: envInt('MYTURN_ACTOR_PER_MIN', 10),
  // 🚨 공유 통(참여자 토큰이 없는 «라이브러리 자습») 전용 한도.
  //    학교는 교실 전체가 공인 IP 하나로 나가서, 한 명 몫(쿨타임 5분)을 여기 적용하면
  //    첫 학생이 제출하는 순간 반 전체가 5분 잠긴다. 그래서 **쿨타임을 걸지 않고**
  //    분당·일일 한도로만 잰다(챗봇 chat-service 가 이미 쓰는 방식과 같다).
  sharedPerMin: envInt('MYTURN_SHARED_PER_MIN', 10),
  // 🚨 공유 통은 **학생 한 명보다 커야 한다** — 여럿이 뭉쳐 있는 통이기 때문이다.
  //    학생 300 인데 공유가 200 이면 «자습하는 반»이 «세션 반»보다 먼저 막힌다(2026-08-11 상향 때 실제로 뒤집혔다).
  sharedDaily: envInt('MYTURN_SHARED_DAILY_CAP', 1000),
  // 🔑 전역은 «하루 몇 차시를 받을 수 있는가»다. 실습 1차시 ≈ 24명 × 문항 4개 ≈ 96~192회 →
  //    4,000 이면 하루 20~40차시. 예전 500 은 하루 2~3반에서 닿았다(jery 확정 2026-08-11).
  //    분당 120 = 40명 학급이 동시에 눌러도 흡수. 포화 시 상한 ≈ $16/일.
  // 💸 2026-08-15 부터 이 라우트도 **돈 천장 아래**에 있다(LAB_MONTHLY_BUDGET_USD, 기본 $30).
  //    그 전에는 이 두 줄이 곧 지출 상한이었다 — 지출 장부가 chat-service 안에만 있어서
  //    여기서 쓴 돈이 어디에도 안 잡혔기 때문이다. 이제 호출 횟수(여기)와 금액(ai-spend)이 따로 막는다.
  //    🔑 그래도 이 값을 올릴 때는 여전히 «몇 차시를 받을 수 있는가»를 정하는 일이다.
  globalPerMin: envInt('MYTURN_PER_MIN', 120),
  globalDaily: envInt('MYTURN_DAILY_CAP', 4000),
};

/**
 * 호출 통제 스위치 — 0 이면 통제를 끈다.
 *
 * 🚨 2026-08-11 jery 결정(2차): **기본값을 «켬» 으로 되돌린다.** 「내 차례」를 한 문항 시범에서
 *    여러 문항으로 넓히기로 하면서, 상한 없이 넓히면 지출이 열려 버리기 때문이다. 숫자는 그대로
 *    두고(전역 하루 500 = 30명×2문 기준 8차시) 스위치만 켠다.
 *    🔑 되돌리는 길은 그대로다 — Render env 에 `MYTURN_GUARD_ENABLED=0` 한 줄이면 **배포 없이**
 *    꺼지고, 한도 숫자도 MYTURN_* env 로 그 자리에서 올린다(대규모 수업 전 상향 → 수업 후 원복).
 *
 * 🚨 1차 결정(2026-08-11 오전)은 «기본 끔» 이었다. 그때는 「내 차례」가 한 문항뿐이라 상한이
 *    사실상 의미가 없었다. 문항이 늘면 같은 스위치의 뜻이 달라진다 — 결정이 바뀐 게 아니라
 *    전제가 바뀐 것이다.
 *
 * 🔑 끈 상태에서 /health 는 capPolicy 를 'none' 으로 정직하게 말한다(classCheck.ts).
 *    켜 놓고 «없다» 고 말하거나 꺼 놓고 «있다» 고 말하면, 캡을 보고 여유를 계산하는 쪽이 속는다.
 * 🚨 함수로 둔 이유: 통제하는 쪽(takeToken)과 그것을 밖에 말하는 쪽(/health classCheck)이
 *    **같은 값을 읽어야** 한다. 각자 env 를 읽으면 한쪽만 고쳐졌을 때 «켜 놓고 없다고 말하는»
 *    상태가 생기고, 그건 캡을 보고 판정하는 쪽을 조용히 속인다.
 */
export function myTurnGuardEnabled(): boolean {
  return (process.env.MYTURN_GUARD_ENABLED ?? '1') !== '0';
}

const COOLDOWN_MS = MY_TURN_LIMITS.cooldownSeconds * 1000;
const ACTOR_MINUTE_LIMIT = MY_TURN_LIMITS.actorPerMin;
const SHARED_MINUTE_LIMIT = MY_TURN_LIMITS.sharedPerMin;
const SHARED_DAILY_LIMIT = MY_TURN_LIMITS.sharedDaily;
const ACTOR_DAILY_LIMIT = MY_TURN_LIMITS.actorDaily;
const GLOBAL_MINUTE_LIMIT = MY_TURN_LIMITS.globalPerMin;
const GLOBAL_DAILY_LIMIT = MY_TURN_LIMITS.globalDaily;

export type MyTurnSlot = {
  key: string;
  label: string;
  /** 판정 프롬프트에 주는 힌트 — 이 칸이 다루는 내용 */
  hint: string;
  /** 학생이 안 정했을 때 AI가 대신 채우는 값의 대표 예시 */
  inventedExample: string;
};

export type MyTurnTask = {
  qaId: string;
  topic: string;
  slots: MyTurnSlot[];
};

/** 문항별 «내 차례» 판정 과제 — 클라이언트 vibe-ch13.ts myTurn.slots와 key·label을 맞춘다. */
export const MY_TURN_TASKS: Record<string, MyTurnTask> = {
  // 13강(속 ch19) «나만의 스킬» — 학생이 반복해 온 일 하나를 스킬 세 칸으로 옮겼는지 판정한다.
  ch19_q04: {
    qaId: 'ch19_q04',
    topic: '내가 세 번 이상 반복한 일 하나를 옮긴 «스킬» 한 장 (이름·언제 쓰나·단계)',
    slots: [
      {
        key: 'name',
        label: '이름',
        hint: '결과가 아니라 «일»로 불렀는지 — «예쁜 발표»는 결과라 언제 꺼낼지 안 보인다',
        inventedExample: '발표 잘하기 (결과라서 언제 꺼낼지 안 보임)',
      },
      {
        key: 'when',
        label: '언제 쓰나',
        hint: '이 스킬을 꺼내는 상황이 좁혀져 있는지 — 없으면 스킬이 쌓였을 때 아무도 못 고른다',
        inventedExample: '필요할 때 (상황이 정해지지 않아 고를 수가 없음)',
      },
      {
        key: 'steps',
        label: '단계',
        hint: '무엇을 어떤 차례로 하는지가 번호로 적혀 있는지(서너 단계면 충분하다)',
        inventedExample: '준비하고 발표한다 (누가 읽어도 같은 일을 못 함)',
      },
      {
        key: 'grain',
        label: '단계 수위',
        hint: '한 단계마다 «결과물이 하나» 나오는 크기인지 — 너무 굵거나 너무 잘지 않은지',
        inventedExample: '잘 만든다 (결과물이 하나 나오는 크기가 아님)',
      },
      {
        key: 'repeat',
        label: '반복 근거',
        hint: '실제로 여러 번 해 본 일인지가 드러나는지 — 상상한 단계는 빈 곳이 안 드러난다',
        inventedExample: '한 번 해 봄 (상상한 단계는 빈 곳이 안 드러남)',
      },
    ],
  },
  // 16강(속 ch20) «기획 · 완료 조건» — «끝났다»를 누가 봐도 같게 판정할 수 있게 적었는지 본다.
  ch20_q04: {
    qaId: 'ch20_q04',
    topic: '아직 안 끝난 일 하나의 «완료 조건» (무엇이 · 어떻게 되면 · 어떻게 확인 · 막혀야 하는 것)',
    slots: [
      {
        key: 'what',
        label: '무엇이',
        hint: '«누가 무엇을 하면»이 장면으로 적혀 있는지 — 일의 이름을 다시 적은 것은 조건이 아니다',
        inventedExample: '앱이 완성되면 (누가 무엇을 하는 장면인지 없음)',
      },
      {
        key: 'then',
        label: '어떻게 되면',
        hint: '무슨 일이 일어나야 하는지가 눈으로 볼 수 있게 적혀 있는지',
        inventedExample: '잘 동작한다 (무엇을 봐야 하는지 없음)',
      },
      {
        key: 'how',
        label: '어떻게 확인',
        hint: '누가 어느 화면에서 무엇을 눌러 보는지가 적혀 있는지 — «보면 안다»는 확인 방법이 아니다',
        inventedExample: '보면 안다 (누가 무엇을 눌러 보는지 없음)',
      },
      {
        key: 'blocked',
        label: '막혀야 하는 것',
        hint: '«이러면 안 된다»가 짝으로 적혀 있는지 — 성공 장면만 있으면 반쪽 검사표다',
        inventedExample: '특별히 막을 것 없음 (성공 장면만 있는 반쪽 검사표)',
      },
      {
        key: 'number',
        label: '숫자',
        hint: '몇 명·몇 초·몇 건 같은 판정선이 들어갔는지 — «빠르게·많이»는 사람마다 다르게 읽힌다',
        inventedExample: '빠르게·많이 (판정이 사람마다 갈리는 낱말)',
      },
    ],
  },
  // 19강(속 ch21) «TDD 한 바퀴» — 완료 조건을 기계가 확인할 수 있는 «약속 문장»으로 옮겼는지 본다.
  ch21_q04: {
    qaId: 'ch21_q04',
    topic: '완료 조건 하나를 옮긴 «약속 문장» (넣는 것 · 나와야 하는 것 · 왜 그게 맞나 · 막혀야 하는 경우)',
    slots: [
      {
        key: 'input',
        label: '넣는 것',
        hint: '실제 값이 적혀 있는지 — «책을 빌리면»처럼 값이 없으면 기계가 무엇을 넣을지 모른다',
        inventedExample: '책을 빌리면 (실제 값이 없어 무엇을 넣을지 모름)',
      },
      {
        key: 'expected',
        label: '나와야 하는 것',
        hint: '어디에 무엇이 어떻게 되는지까지 적혀 있는지 — «무언가 표시된다»는 뭘 해도 통과한다',
        inventedExample: '무언가 표시된다 (뭘 해도 통과하는 흐린 결과)',
      },
      {
        key: 'why',
        label: '왜 그게 맞나',
        hint: '이 약속이 지키려는 것이 한 줄로 적혀 있는지 — 이유 없는 약속은 나중에 아무도 못 건드린다',
        inventedExample: '적지 않음 (나중에 고칠지 지울지 아무도 판단 못 함)',
      },
      {
        key: 'blocked',
        label: '막혀야 하는 경우',
        hint: '«이러면 거절된다»가 짝으로 적혀 있는지 — 성공하는 경우만 있으면 잘못된 길이 안 막힌다',
        inventedExample: '따로 없음 (잘못된 길이 아무 데서도 안 막힘)',
      },
      {
        key: 'falsifiable',
        label: '틀릴 수 있는가',
        hint: '어떤 결과가 나와도 통과한다고 말할 수 있는 약속은 아니어야 한다',
        inventedExample: '어떤 결과가 나와도 통과 (아무것도 재지 못하는 약속)',
      },
    ],
  },
  // 22강(속 ch22) «커밋·PR·보안» — 내가 한 일을 남이 알아볼 수 있게 넘겼는지 본다.
  ch22_q04: {
    qaId: 'ch22_q04',
    topic: '최근에 한 일 하나의 «넘김 쪽지» (무엇을 · 왜 · 안 한 것 · 확인한 것)',
    slots: [
      {
        key: 'what',
        label: '무엇을',
        hint: '읽는 사람이 결과물을 안 열어 봐도 그림이 그려지는지 — «수정함·업데이트»는 아무것도 안 알려 준다',
        inventedExample: '수정함 (읽는 사람이 그림을 못 그림)',
      },
      {
        key: 'why',
        label: '왜',
        hint: '무엇이 곤란해서 그렇게 했는지가 적혀 있는지 — «필요해서»는 이유의 자리를 채운 말일 뿐이다',
        inventedExample: '필요해서 (이유의 자리를 채운 말일 뿐 이유가 아님)',
      },
      {
        key: 'notdone',
        label: '안 한 것',
        hint: '이번에 일부러 미룬 것이 적혀 있는지 — 없으면 받는 사람이 «잊었나?»에서 멈춘다',
        inventedExample: '적지 않음 (받는 사람이 «잊었나?»에서 멈춤)',
      },
      {
        key: 'checked',
        label: '확인한 것',
        hint: '이름·긴 숫자·열쇠 낱말을 실제로 찾아봤는지, 무엇을 어떻게 봤는지가 구체적인지',
        inventedExample: '확인함 (무엇을 어떻게 봤는지 없음)',
      },
      {
        key: 'size',
        label: '덩어리 크기',
        hint: '한 번에 넘기는 양이 쪽지 한두 줄로 적힐 크기인지 — «이것저것 많이»면 쪼갤 때다',
        inventedExample: '이것저것 많이 고침 (쪽지가 안 써질 만큼 큰 덩어리)',
      },
    ],
  },
  // 23강(속 ch23) «종합 = 졸업» — 앞 다섯 강의 산출물을 하나로 묶었는지, 각 장의 핵심 칸이 살아 있는지 본다.
  ch23_q04: {
    qaId: 'ch23_q04',
    topic: '실습 다섯 강의 산출물을 하나로 묶은 «나만의 묶음» (규칙 · 스킬 · 완료 조건 · 약속 문장 · 넘김 쪽지)',
    slots: [
      {
        key: 'rules',
        label: '규칙 (12강)',
        hint: '규칙이 있는지, 그리고 그 안에 «이번엔 안 하는 것»이 적혀 있는지 — 침묵은 승낙으로 읽힌다',
        inventedExample: '적지 않음 — «안 하는 것» 칸이 비어 침묵이 승낙으로 읽힘',
      },
      {
        key: 'skill',
        label: '스킬 (13강)',
        hint: '반복하는 일이 이름·단계로 적혀 있는지, 그리고 «언제 쓰나»가 있는지',
        inventedExample: '적지 않음 — «언제 쓰나»가 없어 꺼낼 상황이 안 정해짐',
      },
      {
        key: 'done',
        label: '완료 조건 (16강)',
        hint: '«끝»이 판정 가능하게 적혀 있는지, 그리고 «막혀야 하는 것»이 짝으로 있는지',
        inventedExample: '적지 않음 — «막혀야 하는 것»이 없는 반쪽 검사표',
      },
      {
        key: 'promise',
        label: '약속 문장 (19강)',
        hint: '넣는 것과 나와야 하는 것이 분명한지, 그리고 «왜 그게 맞나»가 있는지 — 틀릴 수 있는 약속인지',
        inventedExample: '적지 않음 — 뭘 해도 통과해 아무것도 재지 못함',
      },
      {
        key: 'handoff',
        label: '넘김 쪽지 (22강)',
        hint: '무엇을 왜 했는지가 적혀 있는지 — «필요해서»는 이유가 아니다',
        inventedExample: '적지 않음 — «왜»가 없어 나중에 되돌릴지 판단 못 함',
      },
    ],
  },
  // 12강(속 ch18) «왜 하네스인가» — 학생이 쓴 «우리 반 규칙 문서»를 네 칸으로 판정한다.
  //    🔑 클라이언트 vibe-ch18.ts 의 myTurn.slots 와 key·label 이 1:1 이어야 한다(계약이 지킨다).
  ch18_q04: {
    qaId: 'ch18_q04',
    topic: '우리 반에서 «말 안 해도 다들 지키는 것» 하나를 문서로 옮긴 규칙 한 장',
    slots: [
      {
        key: 'scope',
        label: '대상',
        hint: '이 규칙이 어디에 적용되는지가 좁혀져 있는지(«교실 생활 전반» 같은 통짜는 대상이 아니다)',
        inventedExample: '교실 생활 전반 (어디까지인지 정해지지 않아 어디에도 안 걸림)',
      },
      {
        key: 'rules',
        label: '규칙 문장',
        hint: '늘 지켜야 하는 것이 몇 줄로 적혀 있는지(세 줄 안팎이면 충분하다)',
        inventedExample: '깨끗하게 생활한다 (지켰는지 판정할 수 없는 문장)',
      },
      {
        key: 'checkable',
        label: '판정 가능성',
        hint: '누가 읽어도 지켰는지 안 지켰는지 똑같이 판정할 수 있는 문장인지 — «친절하게·성실하게»는 판정할 수 없다',
        inventedExample: '친절하게·성실하게 (사람마다 다르게 읽히는 낱말)',
      },
      {
        key: 'exception',
        label: '예외',
        hint: '«이럴 때는 안 지켜도 된다»가 적혀 있는지 — 예외가 없으면 현실에 부딪히는 날 규칙 전체가 무시된다',
        inventedExample: '예외 없음 (현실에 부딪히는 날 규칙 전체가 무시된다)',
      },
      {
        key: 'notdoing',
        label: '안 하는 것',
        hint: '«이번엔 하지 않기로 정한 것»이 명시됐는지 — 침묵은 금지가 아니라 승낙으로 읽힌다',
        inventedExample: '따로 정하지 않음 (침묵은 금지가 아니라 승낙으로 읽힌다)',
      },
    ],
  },
  ch13_q01: {
    qaId: 'ch13_q01',
    topic: '우리 반 도서 대출 앱',
    slots: [
      { key: 'limit', label: '대출 권수', hint: '한 명이 몇 권까지 빌릴 수 있는지', inventedExample: '1인 최대 3권' },
      { key: 'due', label: '반납 기한', hint: '언제까지·어떤 주기로 반납하는지', inventedExample: '반납 기한 14일' },
      { key: 'overdue', label: '연체 벌칙', hint: '늦으면 어떻게 되는지(벌칙 없음도 정한 것)', inventedExample: '연체 시 30일 대출 정지' },
      { key: 'identity', label: '입장 방법', hint: '학생을 무엇으로 구분해 입장시키는지', inventedExample: '이름으로 입장 (동명이인 = 같은 사람)' },
      { key: 'retention', label: '기록 처리', hint: '대출 기록을 언제까지 보관하고 언제 지우는지', inventedExample: '대출 기록 무기한 보관' },
    ],
  },
  ch12_q06: {
    qaId: 'ch12_q06',
    topic: '만들고 싶은 앱의 «한 장 문서» (문제·사용자·기능·우선순위·성공 기준)',
    slots: [
      {
        key: 'problem',
        label: '문제 한 문장',
        hint: '앱 이름이 아니라 «누가 + 어떤 상황에서 + 무엇이 불편한지»가 적혀 있는지',
        inventedExample: '학급 관리가 불편하다 (누가·언제·무엇이 빠진 막연한 문장)',
      },
      {
        key: 'user',
        label: '주 사용자',
        hint: '누가 주로 쓰는지(학년·역할)가 정해져 있는지. 여럿이면 주인공이 정해졌는지',
        inventedExample: '일반 사용자 대상 (어른 사무용 앱의 평균)',
      },
      {
        key: 'features',
        label: '기능 목록',
        hint: '«사용자가 ~할 수 있다» 크기의 기능이 몇 개 적혀 있는지',
        inventedExample: '검색·등록·수정·삭제 (어느 앱에나 붙는 네 가지)',
      },
      {
        key: 'priority',
        label: '우선순위(안 함 포함)',
        hint: '무엇이 필수인지, 그리고 «이번엔 안 함»이 명시됐는지 — 침묵은 승낙으로 읽힌다',
        inventedExample: '적은 기능 전부 필수 — «이번엔 안 함» 칸 없음',
      },
      {
        key: 'success',
        label: '성공 기준',
        hint: '누가 읽어도 됐다/안 됐다를 똑같이 판정할 수 있는 문장인지(숫자가 들어갔는지)',
        inventedExample: '잘 동작하면 성공 (검사할 수 없는 문장)',
      },
    ],
  },
  ch14_q03: {
    qaId: 'ch14_q03',
    topic: '앱 전체가 아니라 «첫 작업 하나»만 시키는 부탁문',
    slots: [
      {
        key: 'first',
        label: '첫 작업',
        hint: '«앱 만들기» 같은 목표가 아니라, 한 번에 하나로 끝나는 작업 하나가 지목됐는지',
        inventedExample: '앱 전체를 한 번에 만들기 (작업이 아니라 목표)',
      },
      {
        key: 'scope',
        label: '이번 작업의 범위',
        hint: '이번에 어디까지 하고 어디서 끊는지가 적혀 있는지',
        inventedExample: '눈에 보이는 기능 전부 (어디서 끊을지 정해지지 않음)',
      },
      {
        key: 'done',
        label: '끝났다는 조건',
        hint: '누가 봐도 «끝났다»를 똑같이 판정할 수 있는 조건인지',
        inventedExample: '잘 만들어지면 끝 (판정할 수 없는 조건)',
      },
      {
        key: 'check',
        label: '확인 방법',
        hint: '학생이 직접 눌러 보고 눈으로 확인할 장면이 적혀 있는지',
        inventedExample: '코드를 읽어 보고 판단 (눈으로 확인할 장면 없음)',
      },
      {
        key: 'next',
        label: '다음 작업',
        hint: '중단했다가 이어갈 지점(다음 번호)이 남아 있는지',
        inventedExample: '나머지 전부 (이어서 시작할 지점이 안 남음)',
      },
    ],
  },
  ch15_q02: {
    qaId: 'ch15_q02',
    topic: '만들기 «전»에 쓰는 검사표 (성공 장면·막혀야 하는 장면·숫자·확인 방법·실패 조건)',
    slots: [
      {
        key: 'success',
        label: '성공한 장면',
        hint: '누가 읽어도 됐다/안 됐다를 똑같이 판정할 수 있는 장면인지',
        inventedExample: '앱이 잘 동작하면 성공 (누가 봐도 같은 판정이 안 되는 문장)',
      },
      {
        key: 'blocked',
        label: '막혀야 하는 장면',
        hint: '규칙을 어겼을 때 «막혀야 한다»가 짝으로 적혀 있는지 — 성공 장면만 있으면 반쪽이다',
        inventedExample: '특별히 막을 것 없음 (성공 장면만 있는 반쪽 검사표)',
      },
      {
        key: 'number',
        label: '기준이 되는 숫자',
        hint: '몇 명·몇 분·몇 건 같은 숫자가 들어갔는지(«편하게·빠르게»는 숫자가 아니다)',
        inventedExample: '많이·빠르게·편하게 (숫자가 없어 판정이 사람마다 다름)',
      },
      {
        key: 'how',
        label: '확인 방법',
        hint: '누가 무엇을 눌러 보는지가 적혀 있는지',
        inventedExample: '보면 안다 (누가·무엇을 눌러 보는지 없음)',
      },
      {
        key: 'fail',
        label: '실패로 인정하는 조건',
        hint: '이 기준이 «실패할 수도 있는» 기준인지 — 어떤 결과든 성공이라 말할 수 있으면 기준이 아니다',
        inventedExample: '어떤 결과가 나와도 «그래도 됐다»고 말할 수 있음',
      },
    ],
  },
  ch16_q06: {
    qaId: 'ch16_q06',
    topic: '규칙 하나를 «말로 막기»가 아니라 «구조로 막기»로 시키는 부탁문',
    slots: [
      {
        key: 'rule',
        label: '막을 규칙',
        hint: '무엇을 못 하게 할 것인지가 한 문장으로 지목됐는지',
        inventedExample: '적절히 검증한다 (무엇을 막는지 정해지지 않음)',
      },
      {
        key: 'harm',
        label: '어기면 생기는 일',
        hint: '어겼을 때의 피해가 «되돌릴 수 있는가·알아챌 수 있는가» 두 축으로 적혔는지',
        inventedExample: '문제가 될 수 있음 (되돌릴 수 있는지·알아챌 수 있는지 없음)',
      },
      {
        key: 'structure',
        label: '구조로 막는 방법',
        hint: '안내문·경고문이 아니라 «어길 방법이 없게» 만드는 방식(입력 형태·선택지 제한 등)이 적혔는지',
        inventedExample: '«하지 마세요» 안내문 추가 (지킬지 말지가 쓰는 쪽에 달림)',
      },
      {
        key: 'message',
        label: '막혔을 때 알려 줄 말',
        hint: '왜 막혔는지 사람이 읽고 알 수 있는 문구가 있는지(막는 일과 알려 주는 일은 다른 역할이다)',
        inventedExample: '오류가 발생했습니다 (왜 막혔는지 알 수 없음)',
      },
      {
        key: 'backdoor',
        label: '뒷길 차단',
        hint: '정문을 좁히면 몰릴 수 있는 다른 경로까지 함께 막았는지',
        inventedExample: '정문만 막음 — 다른 경로로 들어오면 검사 없이 통과',
      },
    ],
  },
  ch17_q05: {
    qaId: 'ch17_q05',
    topic: 'AI 답이 학생에게 닿기 전 «출구 검사»를 설계하는 부탁문',
    slots: [
      {
        key: 'what',
        label: '검사할 것',
        hint: '무엇을 거를 것인지가 구체적으로 지목됐는지(«부적절한 것»은 지목이 아니다)',
        inventedExample: '부적절한 내용 전반 (무엇이 부적절한지 정해지지 않음)',
      },
      {
        key: 'action',
        label: '걸렸을 때 할 일',
        hint: '막고 끝인지, 다시 시키는지, 사람이 보는지가 정해졌는지',
        inventedExample: '차단 후 기본 문구로 대체 (막힌 걸 아무도 모름)',
      },
      {
        key: 'count',
        label: '몇 건 걸렸는지 세는 법',
        hint: '걸린 건수를 세는 방법이 있는지 — 안 세면 거부율 0% 가 «안전»인지 «검사 없음»인지 구분되지 않는다',
        inventedExample: '따로 세지 않음 — 거부율 0%가 «안전»인지 «검사가 없음»인지 구분 불가',
      },
      {
        key: 'falsePositive',
        label: '막히면 안 되는 것',
        hint: '통과해야 할 답까지 막히는 경우를 어떻게 알아챌지 적혀 있는지',
        inventedExample: '고려하지 않음 — 통과해야 할 답부터 막혀도 알 수 없음',
      },
      {
        key: 'exit',
        label: '검사를 걷어낼 조건',
        hint: '원인을 고친 뒤 이 문을 언제 치울지 정해졌는지(마지막 문은 첫 대책이 아니다)',
        inventedExample: '계속 켜 둠 (원인을 고친 뒤에도 문만 남음)',
      },
    ],
  },
};

const verdictSchema = z.object({
  slots: z.array(
    z.object({
      key: z.string(),
      covered: z.boolean(),
      studentRule: z.string().nullable().optional(),
      inventedValue: z.string().nullable().optional(),
    }),
  ),
  coach: z.string(),
});

export type MyTurnVerdict = {
  covered: Array<{ key: string; label: string }>;
  invented: Array<{ key: string; label: string; example: string }>;
  coach: string;
};

export class MyTurnRateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super('rate_limited');
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class MyTurnUnavailableError extends Error {}

const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

const actorLastCall = new Map<string, number>();
const minuteBuckets = new Map<string, { count: number; resetAt: number }>();
const actorDayBuckets = new Map<string, { count: number; resetAt: number }>();
let globalMinute = { count: 0, resetAt: 0 };
let globalDay = { count: 0, resetAt: 0 };

/**
 * 🚨 테스트에서 이 함수를 직접 부를 수 있게 export 한다. 통제 로직은 judgeMyTurn 안쪽에 있어서
 *    밖에서 부르려면 Anthropic 키가 필요한데, 그러면 «교실 전체가 한 명으로 묶이는» 회귀를
 *    CI 에서 아무도 못 잡는다(키가 없다). 계약을 검사할 수 없게 만드는 캡슐화는 캡슐화가 아니다.
 */
export function takeMyTurnToken(actorId: string): void {
  takeToken(actorId);
}

/**
 * 테스트 전용 — 공유 통의 «분» 버킷만 만료시킨다(시계를 돌리는 대신).
 * 🚨 이게 없으면 공유 통의 **일일** 한도를 검사할 수 없다. 분당 한도가 먼저 막아서
 *    하루치까지 못 가고, 그러면 «일일 한도를 학생 몫으로 되돌리는» 회귀가 초록으로 지나간다
 *    (실제로 변이 시험에서 그랬다).
 */
export function __expireMyTurnMinuteBucketsForTest(): void {
  for (const bucket of minuteBuckets.values()) bucket.resetAt = 0;
  globalMinute = { count: 0, resetAt: 0 };
}

/** 테스트 전용 — 버킷을 비운다. 안 비우면 앞 테스트의 호출이 뒤 테스트를 막는다. */
export function __resetMyTurnBucketsForTest(): void {
  actorLastCall.clear();
  actorDayBuckets.clear();
  minuteBuckets.clear();
  globalMinute = { count: 0, resetAt: 0 };
  globalDay = { count: 0, resetAt: 0 };
}

function takeToken(actorId: string): void {
  if (!myTurnGuardEnabled()) return;
  const now = Date.now();

  // 🔑 «학생 한 명»인가 «여럿이 뭉쳐 있을 수 있는 통»인가에 따라 다른 한도를 쓴다.
  //    공유 통에 한 명 몫(쿨타임 5분)을 적용하면, 자습하던 다른 학생이 남의 제출 때문에 막힌다.
  //    (2026-08-11: 통제를 켜면서 이 갈래가 없다는 것이 드러났다 — 챗봇은 이미 갈라 쓰고 있었다.)
  const isOne = isParticipantKey(actorId);

  // 🔑 분당 한도는 **양쪽 다** 건다. 예전에는 학생 쪽이 쿨타임만 보고 분당을 안 봤는데,
  //    쿨타임이 0 이 되면 학생 쪽에 연타를 막을 것이 아무것도 안 남는다.
  const minuteLimit = isOne ? ACTOR_MINUTE_LIMIT : SHARED_MINUTE_LIMIT;
  const minuteBucket = minuteBuckets.get(actorId);
  if (minuteBucket && minuteBucket.resetAt > now && minuteBucket.count >= minuteLimit) {
    throw new MyTurnRateLimitError(Math.ceil((minuteBucket.resetAt - now) / 1000));
  }

  // 쿨타임은 «학생 한 명»에게만, 그리고 켜져 있을 때만(기본 0 = 안 건다).
  if (isOne && COOLDOWN_MS > 0) {
    const last = actorLastCall.get(actorId);
    if (last && now - last < COOLDOWN_MS) {
      throw new MyTurnRateLimitError(Math.ceil((COOLDOWN_MS - (now - last)) / 1000));
    }
  }

  const day = actorDayBuckets.get(actorId);
  const dailyLimit = isOne ? ACTOR_DAILY_LIMIT : SHARED_DAILY_LIMIT;
  if (day && day.resetAt > now && day.count >= dailyLimit) {
    throw new MyTurnRateLimitError(Math.ceil((day.resetAt - now) / 1000));
  }

  if (globalMinute.resetAt > now && globalMinute.count >= GLOBAL_MINUTE_LIMIT) {
    throw new MyTurnRateLimitError(Math.ceil((globalMinute.resetAt - now) / 1000));
  }
  if (globalDay.resetAt > now && globalDay.count >= GLOBAL_DAILY_LIMIT) {
    throw new MyTurnRateLimitError(Math.ceil((globalDay.resetAt - now) / 1000));
  }

  if (isOne) {
    actorLastCall.set(actorId, now);
  }
  if (!minuteBucket || minuteBucket.resetAt <= now) {
    minuteBuckets.set(actorId, { count: 1, resetAt: now + 60_000 });
  } else {
    minuteBucket.count += 1;
  }
  if (!day || day.resetAt <= now) {
    actorDayBuckets.set(actorId, { count: 1, resetAt: now + 86_400_000 });
  } else {
    day.count += 1;
  }
  if (globalMinute.resetAt <= now) {
    globalMinute = { count: 1, resetAt: now + 60_000 };
  } else {
    globalMinute.count += 1;
  }
  if (globalDay.resetAt <= now) {
    globalDay = { count: 1, resetAt: now + 86_400_000 };
  } else {
    globalDay.count += 1;
  }
}

function buildJudgePrompt(task: MyTurnTask, prompt: string): { system: string; user: string } {
  const slotLines = task.slots
    .map((slot) => `- ${slot.key}: ${slot.label} — ${slot.hint}`)
    .join('\n');

  const system = [
    `너는 «${task.topic}» 부탁문을 심사하는 판정기다.`,
    '학생의 부탁문이 아래 다섯 칸을 각각 «직접 정했는지» 판정한다.',
    slotLines,
    '',
    '판정 기준:',
    '- 그 칸의 내용을 부탁문이 명시적으로 정했으면 covered=true, studentRule에 학생이 정한 규칙을 짧게 요약.',
    '- 정하지 않았으면 covered=false, inventedValue에 네가 앱을 만든다면 대신 채웠을 그럴듯한 값을 짧게 한 줄로.',
    '- "벌칙 없음", "기록 안 남김"처럼 없음을 명시한 것도 정한 것(covered=true)이다.',
    '- coach는 판정 결과에 대한 한두 문장의 코치 멘트: 다 채웠으면 칭찬, 빈칸이 있으면 어디부터 채울지 반말로 다정하게.',
    '',
    '반드시 아래 JSON만 출력한다(설명·코드블록 금지):',
    '{"slots":[{"key":"limit","covered":true,"studentRule":"...","inventedValue":null},...5개 전부],"coach":"..."}',
  ].join('\n');

  return { system, user: `학생의 부탁문:\n${prompt}` };
}

export async function judgeMyTurn(input: {
  qaId: string;
  prompt: string;
  actorId: string;
}): Promise<MyTurnVerdict> {
  const task = MY_TURN_TASKS[input.qaId];
  if (!task) {
    throw new MyTurnUnavailableError('unknown_qa');
  }
  if (!anthropic) {
    throw new MyTurnUnavailableError('no_api_key');
  }

  // 💸 돈 천장. 🚨 2026-08-15 이전에는 이 라우트에 **호출 횟수 한도만 있고 돈 천장이 없었다** —
  //    지출 장부가 chat-service 안에만 있어서 여기서 쓴 돈이 어디에도 안 잡혔기 때문이다.
  //    즉 MYTURN_* 한도를 올리는 것이 곧 상한을 올리는 일이었다. 이제는 갈라진 주머니(`lab`)로 센다.
  // 🔑 호출 «전에» 본다 — 쓰고 나서 세면 천장을 넘긴 뒤에야 알게 된다.
  if (budgetVerdict('lab') !== 'ok') {
    throw new MyTurnUnavailableError('budget_exceeded');
  }

  takeToken(input.actorId);

  const { system, user } = buildJudgePrompt(task, input.prompt.slice(0, 1200));
  const response = await anthropic.messages.create(
    {
      model: HAIKU_MODEL,
      max_tokens: MY_TURN_MAX_OUTPUT_TOKENS,
      system,
      messages: [{ role: 'user', content: user }],
    },
    // 🚨 시간 제한이 없으면 한 호출이 매달린 채로 동시성 자리를 물고 있는다 —
    //    30명이 동시에 누르는 수업에서 그건 «반 전체가 멈춘다»는 뜻이다.
    { timeout: MY_TURN_TIMEOUT_MS },
  );

  // 🚨 **성공한 뒤에** 적는다. 실패한 호출까지 세면 천장이 헛돈다.
  // 🔑 이 라우트는 prompt caching 을 안 쓴다(단발 판정) — 그래서 cachePrefixUsable=false 다.
  registerUsageCost('lab', estimateCostUsd(HAIKU_MODEL, response.usage, false));

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('judge_no_json');
  }
  const parsed = verdictSchema.parse(JSON.parse(jsonMatch[0]));
  return buildVerdict(task, parsed);
}

/** 모델 출력 → 클라이언트 계약으로 매핑. 모델이 칸을 빠뜨리면 «안 정함»으로 안전하게 처리한다. */
export function buildVerdict(task: MyTurnTask, parsed: z.infer<typeof verdictSchema>): MyTurnVerdict {
  const bySlot = new Map(parsed.slots.map((slot) => [slot.key, slot]));
  const covered: MyTurnVerdict['covered'] = [];
  const invented: MyTurnVerdict['invented'] = [];
  for (const slot of task.slots) {
    const verdict = bySlot.get(slot.key);
    if (verdict?.covered) {
      covered.push({ key: slot.key, label: slot.label });
    } else {
      invented.push({
        key: slot.key,
        label: slot.label,
        example: verdict?.inventedValue?.trim() || slot.inventedExample,
      });
    }
  }

  return { covered, invented, coach: parsed.coach };
}
