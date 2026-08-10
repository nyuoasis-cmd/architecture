import type { ChapterStub, QaStub } from './qa-stubs';
import type { QuizSet } from './quizzes';
import { CH11_CHAPTER, CH11_EXTRAS, CH11_QAS, CH11_QUIZZES } from './vibe-ch11';
import { CH12_CHAPTER, CH12_EXTRAS, CH12_QAS, CH12_QUIZZES } from './vibe-ch12';
import { CH13_CHAPTER, CH13_EXTRAS, CH13_QAS, CH13_QUIZZES } from './vibe-ch13';

// 카테고리 «바이브코딩» (11~17장) — AI에게 일을 시켜 소프트웨어를 만드는 법.
// 콘텐츠 정책: 참고 도서의 목차·소제목·본문 차용 0%, 전부 자가 생성 (기존 10장과 동일).
// 형판: 5탭 학습(본문·시연·내 차례·견학·퀴즈·챗봇) — mockups/vibecoding-ch13q01-learn.html 정본.

export const VIBE_CATEGORY = '바이브코딩';
export const VIBE_FIRST_CHAPTER_ID = 11;

export function isVibeChapterId(chapterId: number): boolean {
  return chapterId >= VIBE_FIRST_CHAPTER_ID;
}

/** 본문 아래 붙는 «⚡ 실제로 있었던 일» — teachermate 운영에서 나온 실화만 쓴다. */
export type VibeIncident = {
  period: string;
  title: string;
  body: string;
};

export type VibeTourMissionKind = 'daily' | 'self' | 'live' | 'archive';

/** 견학 탭의 눌러서 여는 보조 장치 — 칩(가로 나열) 또는 스텝(세로 카드). */
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

/** «내 차례» — 학생이 직접 쓴 부탁문을 실제 AI가 실행·판정한다(서버 연동은 후속 PR). */
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

export const VIBE_CHAPTERS: ChapterStub[] = [CH11_CHAPTER, CH12_CHAPTER, CH13_CHAPTER];

export const VIBE_QAS: QaStub[] = [...CH11_QAS, ...CH12_QAS, ...CH13_QAS];

export const VIBE_EXTRAS: Record<string, VibeExtras> = { ...CH11_EXTRAS, ...CH12_EXTRAS, ...CH13_EXTRAS };

/** 클라이언트 퀴즈 선지 — quizzes.ts의 QUIZZES에 합류한다(정답·해설은 서버). */
export const VIBE_QUIZZES: Record<string, QuizSet> = { ...CH11_QUIZZES, ...CH12_QUIZZES, ...CH13_QUIZZES };

export function getVibeExtras(qaId: string): VibeExtras | undefined {
  return VIBE_EXTRAS[qaId];
}
