/**
 * 다음 문항 문 회귀 계약.
 *
 * 왜 있는가(2026-08-12, 에픽 3/3): 학생은 마지막 탭까지 본 뒤 다음 문항으로 갈 수 없었고,
 * 모바일에서는 문항 목록이 다른 탭에 접혀 있어 막힘이 더 컸습니다. 이 계약은 다음을 지킵니다.
 *
 * 1) 목적지는 속 이름표 순서가 아니라 chapter-order.ts의 강 진열 순서를 따릅니다.
 * 2) 마지막 문항에는 빈 자리나 죽은 버튼을 만들지 않습니다.
 * 3) 이동은 학생이 버튼을 눌렀을 때만 일어나며 자동 진행 로직은 없습니다.
 * 4) 문은 마지막 학생 탭인 퀴즈 안에 있고 모바일에서도 숨지 않습니다.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const ROOT = path.resolve(__dirname, '..', '..', '..');
const CONTENT_PANEL = 'client/src/components/learn/ContentPanel.tsx';
const NEXT_DOOR = 'client/src/components/learn/NextQuestionDoor.tsx';
const NEXT_DOOR_ORDER = 'client/src/components/learn/next-question-door.ts';
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const loadData = (rel: string) => require(path.resolve(ROOT, 'client', 'src', 'data', rel));
const loadComponent = (rel: string) => require(path.resolve(ROOT, 'client', 'src', 'components', 'learn', rel));

const { CHAPTERS, QA_STUBS, getQasByChapterId } = loadData('qa-stubs') as {
  CHAPTERS: Array<{ id: number; lessonNo: number }>;
  QA_STUBS: Array<{ id: string; chapterId: number; order: number }>;
  getQasByChapterId: (chapterId: number) => Array<{ id: string; chapterId: number; order: number }>;
};
const { getNextQuestionDoorTarget } = loadComponent('next-question-door') as {
  getNextQuestionDoorTarget: (
    currentQaId: string,
    availableQaIds?: readonly string[],
  ) => { chapter: { id: number; lessonNo: number }; qa: { id: string; chapterId: number; order: number } } | undefined;
};

test('1) 모든 실제 인접 문항의 다음 목적지가 강 진열 순서와 같다', () => {
  const orderedQas = CHAPTERS.flatMap((chapter) => getQasByChapterId(chapter.id));
  const transitions = orderedQas.slice(0, -1).map((qa, index) => [qa, orderedQas[index + 1]] as const);

  assert.ok(QA_STUBS.length > 1, '문항이 0~1개면 다음 목적지 계약이 아무것도 검사하지 않는다');
  assert.ok(CHAPTERS.length > 1, '강이 0~1개면 강 경계 이동을 검사할 수 없다');
  assert.equal(orderedQas.length, QA_STUBS.length, '진열 순서에서 빠진 문항이 있어 전체 전이를 검사하지 못한다');
  assert.ok(transitions.length > 0, '인접 전이가 0건이면 계약이 공짜로 통과한다');

  for (const [current, expected] of transitions) {
    assert.equal(
      getNextQuestionDoorTarget(current.id)?.qa.id,
      expected.id,
      `${current.id} 다음 목적지가 진열 순서의 ${expected.id}가 아니다`,
    );
  }
});

test('2) 세션 범위는 받은 목록의 순서가 아니라 강 진열 순서로 좁힌다', () => {
  const orderedQas = CHAPTERS.flatMap((chapter) => getQasByChapterId(chapter.id));
  const sample = [orderedQas[1], orderedQas.at(-2), orderedQas.at(-1)].filter(
    (qa): qa is (typeof orderedQas)[number] => Boolean(qa),
  );
  const reversedIds = sample.map((qa) => qa.id).reverse();

  assert.equal(sample.length, 3, '세션 범위 대조군이 3개 미만이면 필터와 정렬을 함께 검사할 수 없다');
  assert.equal(
    getNextQuestionDoorTarget(sample[0].id, reversedIds)?.qa.id,
    sample[1].id,
    '세션이 전달한 문항 배열 순서를 진열 순서로 오인했다',
  );
});

test('3) 마지막 문항과 범위 밖 문항에는 다음 목적지가 없다', () => {
  const orderedQas = CHAPTERS.flatMap((chapter) => getQasByChapterId(chapter.id));
  const lastQa = orderedQas.at(-1);

  assert.ok(lastQa, '마지막 문항 대조군이 없으면 끝 처리 계약이 공짜로 통과한다');
  assert.equal(getNextQuestionDoorTarget(lastQa.id), undefined, '마지막 문항 뒤에 죽은 목적지를 만들었다');
  assert.equal(getNextQuestionDoorTarget('missing_qa'), undefined, '범위 밖 문항을 첫 문항으로 조용히 연결했다');
});

test('4) 문은 퀴즈 안에서 다음 문항이 있을 때만 렌더링된다', () => {
  const content = read(CONTENT_PANEL);
  const quizStart = content.indexOf("{activeTab === 'quiz' ?");
  const explainStart = content.indexOf("{activeTab === 'explain' ?");

  assert.ok(content.length > 500, 'ContentPanel이 비어 있으면 렌더링 계약이 공짜로 통과한다');
  assert.ok(quizStart >= 0 && explainStart > quizStart, '퀴즈와 교사 전용 설명 탭의 경계를 찾지 못했다');

  const quizBlock = content.slice(quizStart, explainStart);
  assert.equal([...content.matchAll(/<NextQuestionDoor\b/g)].length, 1, '다음 문항 문은 한 자리에서만 렌더링해야 한다');
  assert.match(quizBlock, /\{nextQuestion \? \([\s\S]*?<NextQuestionDoor/, '다음 문항이 없을 때도 문을 렌더링하고 있다');
  assert.equal(/NextQuestionDoor/.test(content.slice(explainStart)), false, '교사 전용 설명 탭에 다음 문항 문을 달았다');
});

test('5) 이동은 클릭으로만 열리고 모바일에서도 문이 숨지 않는다', () => {
  const door = read(NEXT_DOOR);
  const order = read(NEXT_DOOR_ORDER);
  const forbiddenAutoProgress = /useEffect|setTimeout|setInterval|requestAnimationFrame|navigate\s*\(/;
  const hiddenClass = /className="[^"]*\bhidden\b[^"]*"/;

  assert.ok(door.length > 300 && order.length > 300, '대조 대상 파일이 비어 있으면 상호작용 계약이 공짜로 통과한다');
  assert.match(door, /onClick=\{onOpen\}/, '버튼 클릭이 다음 문항 문을 열지 않는다');
  assert.equal(forbiddenAutoProgress.test(door), false, '다음 문항 문에 자동 진행 로직이 들어왔다');
  assert.equal(hiddenClass.test(door), false, '다음 문항 문이 모바일 또는 특정 폭에서 숨는다');
  assert.match(door, /min-h-12/, '모바일에서 누를 수 있는 48px 높이를 지키지 않는다');
  assert.match(door, /chapter\.lessonNo/, '화면 번호 대신 속 이름표를 노출할 위험이 있다');
  assert.equal(/chapter\.id/.test(door), false, '속 이름표를 화면의 강 번호로 쓰고 있다');
  assert.match(order, /CHAPTERS\.flatMap/, '다음 문항 계산이 강 진열 순서를 정본으로 쓰지 않는다');

  const hiddenProbe = '<button className="hidden" onClick={onOpen}>다음 문항</button>';
  assert.equal(hiddenClass.test(hiddenProbe), true, '숨김 탐지식이 대조군을 못 잡으면 모바일 검사는 실패할 수 없다');
});
