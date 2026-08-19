import type { ChapterStub, QaStub } from './qa-stubs';
import type { QuizSet } from './quizzes';
import { CH11_CHAPTER, CH11_EXTRAS, CH11_QAS, CH11_QUIZZES } from './vibe-ch11';
import { CH12_CHAPTER, CH12_EXTRAS, CH12_QAS, CH12_QUIZZES } from './vibe-ch12';
import { CH13_CHAPTER, CH13_EXTRAS, CH13_QAS, CH13_QUIZZES } from './vibe-ch13';
import { CH14_CHAPTER, CH14_EXTRAS, CH14_QAS, CH14_QUIZZES } from './vibe-ch14';
import { CH15_CHAPTER, CH15_EXTRAS, CH15_QAS, CH15_QUIZZES } from './vibe-ch15';
import { CH16_CHAPTER, CH16_EXTRAS, CH16_QAS, CH16_QUIZZES } from './vibe-ch16';
import { CH17_CHAPTER, CH17_EXTRAS, CH17_QAS, CH17_QUIZZES } from './vibe-ch17';
import { CH18_CHAPTER, CH18_EXTRAS, CH18_QAS, CH18_QUIZZES } from './vibe-ch18';
import { CH19_CHAPTER, CH19_EXTRAS, CH19_QAS, CH19_QUIZZES } from './vibe-ch19';
import { CH20_CHAPTER, CH20_EXTRAS, CH20_QAS, CH20_QUIZZES } from './vibe-ch20';
import { CH21_CHAPTER, CH21_EXTRAS, CH21_QAS, CH21_QUIZZES } from './vibe-ch21';
import { CH22_CHAPTER, CH22_EXTRAS, CH22_QAS, CH22_QUIZZES } from './vibe-ch22';
import { CH23_CHAPTER, CH23_EXTRAS, CH23_QAS, CH23_QUIZZES } from './vibe-ch23';

// 카테고리 «바이브코딩» (11~17장) — AI에게 일을 시켜 소프트웨어를 만드는 법.
// 콘텐츠 정책: 참고 도서의 목차·소제목·본문 차용 0%, 전부 자가 생성 (기존 10장과 동일).
// 형판: 5탭 학습(본문·시연·내 차례·견학·퀴즈·챗봇) — mockups/vibecoding-ch13q01-learn.html 정본.

export const VIBE_CATEGORY = '바이브코딩';
export const VIBE_FIRST_CHAPTER_ID = 11;

export function isVibeChapterId(chapterId: number): boolean {
  return chapterId >= VIBE_FIRST_CHAPTER_ID;
}

/**
 * 본문 아래 붙는 «⚡ 실제로 있었던 일» — teachermate 운영에서 나온 실화만 쓴다.
 *
 * 🚨 **날짜(`period`)는 2026-08-19 에 뺐다**(jery). 「2026년 7월」 같은 표기는 학생에게
 *    아무 손잡이가 아니었다 — 언제 일어났는지는 배울 것과 무관하고, 그러면서 사고가
 *    «오래된 옛날 일»처럼 읽히게 만들었다. 되살리지 말 것: `extrasContract` 가 잡는다.
 *
 * 🔑 대신 들어온 두 줄이 학생이 붙잡을 손잡이다:
 *    · `cause`   = **IT 개념어 한 개 + 쉬운 말 풀이**. 「무슨 개념이었나」에 답한다.
 *      예) 「경쟁 상태 — 두 일이 순서를 약속하지 않고 동시에 달린 것」
 *    · `symptom` = **화면에서 무엇이 잘못 보였는지** 한 줄.
 *      예) 「저장은 성공이라고 떴는데 열어 보면 백지」
 *
 * 🚨 둘은 **없을 수 있다**(optional). 105건을 강 묶음으로 채우는 중이고,
 *    «모든 건에 있다»를 계약으로 요구하지 않는다 — 없는 것은 없는 채로 두고
 *    **있는 것이 성한지만** 본다(CLAUDE.md 교안 철거 항목의 같은 원칙).
 */
export type VibeIncident = {
  title: string;
  body: string;
  cause?: string;
  symptom?: string;
};

export type VibeTourMissionKind = 'daily' | 'self' | 'live' | 'archive';

/** 견학(🧭 체험 탭의 기본 부품)의 눌러서 여는 보조 장치 — 칩(가로 나열) 또는 스텝(세로 카드). */
export type VibeTourReveal = {
  label: string;
  answer: string;
};

/**
 * 견학 미션 — 입문자 사다리 순서(매일 쓰는 앱 → 방금 이 앱 → 진짜 서비스)를 지킨다.
 * 규칙: ① 학생이 이미 아는 경험에서 출발 ② «찾아봐» 금지, 무엇을 보게 될지 미리 말한 뒤 확인
 * ③ 전달하려는 문장은 숨기지 말고 feedback에 대놓고 쓴다.
 */
export type VibeTourMission = {
  id: string;
  kind: VibeTourMissionKind;
  badge: string;
  title: string;
  description: string;
  link?: { label: string; url: string };
  steps?: string[];
  reveals?: VibeTourReveal[];
  observationPlaceholder: string;
  feedback: string;
};

/** «내 차례» — 2026-08-17 탭 철거. 데이터는 12강 터미널 미션 이식(에픽 3)까지 남는 원료다(myTurnContract 가 서버 과제와의 정합을 계속 지킨다). */
export type VibeMyTurnSlot = {
  key: string;
  label: string;
  /** 학생이 이 칸을 정하지 않았을 때 AI가 대신 채우는 값의 예시(판정 결과 표시용) */
  inventedExample: string;
};

export type VibeMyTurnConfig = {
  intro: string;
  placeholder: string;
  slots: VibeMyTurnSlot[];
};

/** 기존 QaStub(qa-stubs.ts)에 바이브코딩 전용 덩어리를 더한 부가 데이터. qaId로 결합한다. */
export type VibeExtras = {
  qaId: string;
  incident?: VibeIncident;
  tour?: VibeTourMission[];
  myTurn?: VibeMyTurnConfig;
};

// ─── 데이터 홀더 — 장별 콘텐츠 PR에서 채운다 ───

export const VIBE_CHAPTERS: ChapterStub[] = [CH11_CHAPTER, CH12_CHAPTER, CH13_CHAPTER, CH14_CHAPTER, CH15_CHAPTER, CH16_CHAPTER, CH17_CHAPTER, CH18_CHAPTER, CH19_CHAPTER, CH20_CHAPTER, CH21_CHAPTER, CH22_CHAPTER, CH23_CHAPTER];

export const VIBE_QAS: QaStub[] = [...CH11_QAS, ...CH12_QAS, ...CH13_QAS, ...CH14_QAS, ...CH15_QAS, ...CH16_QAS, ...CH17_QAS, ...CH18_QAS, ...CH19_QAS, ...CH20_QAS, ...CH21_QAS, ...CH22_QAS, ...CH23_QAS];

export const VIBE_EXTRAS: Record<string, VibeExtras> = { ...CH11_EXTRAS, ...CH12_EXTRAS, ...CH13_EXTRAS, ...CH14_EXTRAS, ...CH15_EXTRAS, ...CH16_EXTRAS, ...CH17_EXTRAS, ...CH18_EXTRAS, ...CH19_EXTRAS, ...CH20_EXTRAS, ...CH21_EXTRAS, ...CH22_EXTRAS, ...CH23_EXTRAS };

/** 클라이언트 퀴즈 선지 — quizzes.ts의 QUIZZES에 합류한다(정답·해설은 서버). */
export const VIBE_QUIZZES: Record<string, QuizSet> = { ...CH11_QUIZZES, ...CH12_QUIZZES, ...CH13_QUIZZES, ...CH14_QUIZZES, ...CH15_QUIZZES, ...CH16_QUIZZES, ...CH17_QUIZZES, ...CH18_QUIZZES, ...CH19_QUIZZES, ...CH20_QUIZZES, ...CH21_QUIZZES, ...CH22_QUIZZES, ...CH23_QUIZZES };

export function getVibeExtras(qaId: string): VibeExtras | undefined {
  return VIBE_EXTRAS[qaId];
}
