import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 17장 6문 시연 — 학생 수·누르는 횟수를 움직여 한도에 부딪히는 지점을 직접 찾는다.
// 🔑 «분당 한도»와 «하루 한도»는 다른 벽이다. 실화(하루 70장)는 분당은 멀쩡한데 하루가 먼저 막힌 경우였다.

const RPM = 60; // 분당 한도
const RPD = 70; // 하루 한도 (실화 기반)
const LESSON_MIN = 40;

export default function Q06RateLimit(_props: DemoComponentProps) {
  const [students, setStudents] = useState(5);
  const [perMin, setPerMin] = useState(1);

  const usedPerMin = students * perMin;
  const overRpm = usedPerMin > RPM;
  const perStudentDaily = Math.floor(RPD / students);
  const wholeLesson = students * perMin * LESSON_MIN;
  const overRpd = wholeLesson > RPD;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          앱에 붙인 이미지 만들기 모델의 한도입니다 —{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">1분에 {RPM}번, 하루에 {RPD}장.</b> 혼자 시험할
          때는 절대 안 닿는 숫자죠. 학생 수를 올려 보세요.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3">
        <label className="block">
          <span className="text-[12.5px] text-[var(--color-text-primary)]">
            학생 수: <b className="font-semibold tabular-nums">{students}명</b>
          </span>
          <input
            type="range"
            min={1}
            max={40}
            value={students}
            onChange={(e) => setStudents(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-[12.5px] text-[var(--color-text-primary)]">
            한 명이 1분에 누르는 횟수: <b className="font-semibold tabular-nums">{perMin}번</b>
          </span>
          <input
            type="range"
            min={1}
            max={4}
            value={perMin}
            onChange={(e) => setPerMin(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div
          className={`rounded-xl border px-3.5 py-3 ${
            overRpm ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'
          }`}
        >
          <p className="text-[11.5px] text-[var(--color-text-muted)]">분당 벽 (한도 {RPM})</p>
          <p className="text-[15px] font-semibold tabular-nums text-[var(--color-text-primary)]">분당 {usedPerMin}번</p>
          <p className="mt-1 text-[12px] leading-[1.7] text-[var(--color-text-muted)]">
            {overRpm
              ? `한도 초과 — ${usedPerMin - RPM}번이 «잠시 후 다시 시도해 주세요»가 됩니다.`
              : `아직 여유 ${RPM - usedPerMin}번.`}
          </p>
        </div>
        <div
          className={`rounded-xl border px-3.5 py-3 ${
            overRpd ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'
          }`}
        >
          <p className="text-[11.5px] text-[var(--color-text-muted)]">하루 벽 (한도 {RPD})</p>
          <p className="text-[15px] font-semibold tabular-nums text-[var(--color-text-primary)]">
            {LESSON_MIN}분 수업에 {wholeLesson}장
          </p>
          <p className="mt-1 text-[12px] leading-[1.7] text-[var(--color-text-muted)]">
            {overRpd
              ? `한도 초과 — 1인당 ${perStudentDaily}장 만들면 그날 끝입니다.`
              : `수업 하나는 버팁니다 (1인당 ${perStudentDaily}장까지).`}
          </p>
        </div>
      </div>

      {students >= 20 && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            <b className="font-semibold">두 벽이 서로 다른 시점에 옵니다.</b> 분당 벽은 «동시에 몰릴 때» 오고, 하루 벽은
            «수업이 진행되면서» 옵니다. 지금 {students}명 기준으로 1인당 만들 수 있는 건{' '}
            <b className="font-semibold tabular-nums">{perStudentDaily}장</b>이에요.
          </p>
          <p>
            실제로 있었던 일입니다. 하루 {RPD}장짜리 모델을 20명 수업에 쓰려던 계획이 있었고, 환산하면 1인당 세 장
            반이었습니다. 혼자 시험할 때는 아무 문제가 없었어요 — 능력은 봤는데 한도는 안 본 것입니다.
          </p>
          <p>
            그래서 AI 기능을 붙일 때 한 줄을 꼭 씁니다.{' '}
            <b className="font-semibold">«이 한도를 우리 반 인원으로 나누면 1인당 몇 번인가.»</b> 이 한 줄이 수업 중 사고와
            수업 전 발견을 가릅니다.
          </p>
        </div>
      )}
    </div>
  );
}
