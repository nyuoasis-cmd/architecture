import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 14장 2문 시연 — «진짜 설계 문서»를 열어 본다.
// 재료는 지어낸 예시가 아니라 이 학습 서비스의 실물 문서: docs/SDD-exit-guard-architecture-v1.md
// (뒤로가기 누르면 «수업에서 나가시겠어요?»를 묻는 그 기능의 설계 문서)
// 🔑 이 문서를 쓰는 도중, 만들기 전에 버그가 하나 잡혔다 — 본문의 «종이가 싸다»의 실물 증거.

type Section = {
  id: string;
  heading: string;
  lines: string[];
};

// 원문을 학생이 읽을 수 있는 만큼만 발췌·요약 인용한다(용어는 그대로 두되 설명은 오른쪽 칸에서 한다).
const SECTIONS: Section[] = [
  {
    id: 'meta',
    heading: '§0 메타 — 어디에 만드나',
    lines: [
      '가지(branch): feat/exit-guard-architecture-20260607',
      'AI/DB/API 영향: 없음 (순수 화면 쪽 기능)',
    ],
  },
  {
    id: 'now',
    heading: '§2 현재 상태 (실측)',
    lines: [
      '학생 세션 화면 = /learn/:sessionId 하나. 세션 안에서 문을 옮겨도 주소는 그대로.',
      '교사 미리보기(?role=teacher)는 학생이 아니므로 가드 대상에서 뺀다.',
      '⚠️ 경고창의 색·모양을 담은 파일 경로가 «없는 폴더»를 가리키고 있었다 — 빌드 결과에서 빨간 버튼 색 0건 실측.',
    ],
  },
  {
    id: 'change',
    heading: '§3 변경 명세 — 무엇을 건드리나',
    lines: [
      '1. 경로 한 줄 정정 (../../node_modules → ../node_modules)',
      '2. (신규) StudentExitGuard.tsx — 공통 래퍼',
      '3. LearnPage.tsx — 세션이 준비된 분기에만 가드 1회',
    ],
  },
  {
    id: 'out',
    heading: '§3 하지 않는 것 (Out of Scope)',
    lines: [
      '도서관(/library)·참여(/join)·교사 화면·교사 미리보기 ❌',
      '다른 앱 ❌ / 교사 네비·복귀 링크 ❌ (다음 조각)',
    ],
  },
  {
    id: 'done',
    heading: '§6.5 완료 기준',
    lines: [
      '세션 학습 중 뒤로가기 → 앱 밖으로 안 나가고 "수업에서 나가시겠어요?" 모달.',
      '로딩·에러·미참여·교사 미리보기·도서관 → 가드 꺼짐, 뒤로가기 정상.',
    ],
  },
];

const CHECKS: { key: string; label: string; target: string; answer: string }[] = [
  {
    key: 'c1',
    label: '① 화면 목록이 내가 시킨 것과 맞나',
    target: 'now',
    answer:
      '«학생 세션 화면 하나»라고 적혀 있습니다. 내가 원한 것도 학생이 수업 중일 때뿐이었으니 맞아요. 만약 여기에 «도서관 화면»까지 적혀 있었다면 지금 빼야 합니다.',
  },
  {
    key: 'c2',
    label: '② 안 하기로 한 것이 적혀 있나',
    target: 'out',
    answer:
      '«하지 않는 것» 칸이 따로 있습니다. 12장에서 만든 «안 함» 칸이 설계 문서에서는 이렇게 생겼어요. 이 칸이 없으면 AI는 침묵을 승낙으로 읽습니다.',
  },
  {
    key: 'c3',
    label: '③ 다 됐는지 무엇으로 판정하나',
    target: 'done',
    answer:
      '«뒤로가기를 누르면 모달이 뜬다»처럼 눌러서 확인 가능한 문장으로 적혀 있습니다. "잘 동작한다" 같은 문장이었다면 판정할 수 없었을 거예요.',
  },
];

export default function Q02DesignDoc(_props: DemoComponentProps) {
  const [openCheck, setOpenCheck] = useState<string | null>(null);
  const [foundBug, setFoundBug] = useState(false);
  const active = CHECKS.find((check) => check.key === openCheck);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          지금 보고 있는 이 학습 서비스에는 «뒤로가기를 누르면 수업에서 나가시겠냐고 묻는» 기능이 있습니다. 아래는 그
          기능을 <b className="font-semibold text-[var(--color-text-primary)]">만들기 전에</b> 쓴 진짜 설계 문서입니다.
          전부 이해하지 않아도 됩니다 — 오른쪽 세 가지만 확인하면 돼요.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-2">
          {SECTIONS.map((section) => {
            const highlighted = active?.target === section.id;
            return (
              <div
                key={section.id}
                className={`rounded-xl border px-4 py-3 ${
                  highlighted ? 'border-emerald-300 bg-emerald-50/60' : 'border-[var(--color-border)] bg-white'
                }`}
              >
                <p
                  className={`text-[11px] font-bold ${
                    highlighted ? 'text-emerald-800' : 'text-[var(--color-text-faint)]'
                  }`}
                >
                  {section.heading}
                </p>
                <div className="mt-1.5 space-y-1">
                  {section.lines.map((line) => (
                    <p key={line} className="text-[12.5px] leading-[1.75] text-[var(--color-text-body)]">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-faint)]">
            설계 문서를 읽을 때 확인할 것 (세 가지뿐)
          </p>
          {CHECKS.map((check) => (
            <button
              key={check.key}
              className={`w-full rounded-lg border px-3.5 py-2 text-left text-[13px] font-medium ${
                openCheck === check.key
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]'
              }`}
              onClick={() => setOpenCheck(check.key)}
              type="button"
            >
              {check.label}
            </button>
          ))}
          {active ? (
            <p className="rounded-lg bg-[#C9E0D4] px-3.5 py-2.5 text-[12.5px] leading-[1.8] text-[#2d4a3e]">
              {active.answer}
            </p>
          ) : (
            <p className="text-[12px] leading-[1.75] text-[var(--color-text-muted)]">
              하나씩 눌러 보세요. 문서에서 어느 칸을 보면 되는지 초록으로 켜집니다.
            </p>
          )}

          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
            {foundBug ? (
              <div className="space-y-2 text-[12.5px] leading-[1.8] text-amber-900">
                <p>
                  §2의 마지막 줄입니다. 경고창의 색·모양을 담은 파일이{' '}
                  <b className="font-semibold">없는 폴더를 가리키고</b> 있었어요. 그대로 만들었으면 경고창이 글자만
                  덩그러니 떴을 겁니다.
                </p>
                <p>
                  어떻게 알았을까요. «지금 상태» 칸을 채우려고 실제로 세어 봤습니다 — 완성된 파일에 빨간 버튼 색이 몇 번
                  들어갔나 → <b className="font-semibold">0번</b>. 고치는 데 든 것은 문서의 경로 한 줄이었습니다.
                </p>
                <p>
                  설계 문서의 값은 «미리 그려 본다»에만 있지 않습니다. 칸을 채우려면 지금 상태를 실제로 확인해야 하고,
                  그 확인이 만들기 전에 문제를 끌어올립니다.
                </p>
              </div>
            ) : (
              <button
                className="w-full text-left text-[13px] font-medium text-amber-900"
                onClick={() => setFoundBug(true)}
                type="button"
              >
                🐞 이 문서를 쓰는 도중에 버그가 하나 잡혔습니다 — 어디였을까요?
              </button>
            )}
          </div>

          <p className="text-[10.5px] text-[var(--color-text-faint)]">
            원문: 이 서비스의 저장소 docs/SDD-exit-guard-architecture-v1.md — 지어낸 예시가 아닙니다
          </p>
        </div>
      </div>
    </div>
  );
}
