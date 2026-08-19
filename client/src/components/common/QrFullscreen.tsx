import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * 학생 참여 QR 전체화면 — DESIGN-POLICY §10 「전체화면 오버레이 v3」(2026-08-07).
 *
 * 🔑 **입구는 이 컴포넌트 하나다**(2026-08-19 통합). 전에는 `QrFullscreenModal`(교사 화면)과
 *    `QrFullscreen`(학습 화면)이 따로 살았고, 둘이 조금씩 달랐다 — 한쪽은 배경 `bg-black/40`,
 *    다른 쪽은 `bg-black/70`, 라벨도 한쪽은 "Join Code" 다른 쪽은 "Join URL" 이었다.
 *    정책 한 줄을 고칠 때마다 두 곳을 고쳐야 했고, 실제로 한쪽만 고쳐진 채로 남아 있었다.
 * 🚨 새 입구를 또 만들지 말 것 — `qrFullscreenSize.test.ts` 가 `components/common` 의
 *    `Qr*.tsx` 중 `fixed inset-0` 을 가진 파일을 **전수로 세어** 목록과 대조한다.
 *
 * 🔑 배경은 **흰색**이다(§10 금지 「어두운 배경」). 교실 프로젝터로 쏘는 화면이라
 *    어두우면 교실 뒤에서 QR 이 안 찍힌다. 어두운 배경은 「모달처럼 보이게」 하려던 것이었고,
 *    이 화면은 모달이 아니라 **프로젝터 화면**이다.
 * 🔑 크기는 **CSS 한 곳에서만** 정한다 — `size` prop 을 쓰면 TSX 와 CSS 두 곳이 되어
 *    한쪽만 풀었을 때 아무 변화가 없다(brand 실측 사고, §10 v3). Tailwind `md:` 갈래가
 *    §10 의 `min(vw,vh) × (vw<768 ? 0.7 : 0.45)` 를 그대로 표현하므로 `resize` 없이도 따라 커진다.
 * 🚨 닫기는 셋 전부 있어야 한다: X 버튼 · ESC · 배경 클릭.
 */
type QrFullscreenProps = {
  code: string;
  /**
   * 🔑 없을 수 있다 — 학습 화면(시연작)은 수업 이름을 들고 있지 않다.
   *    §10 은 세션 이름의 «표시 여부를 앱 재량»으로 둔다.
   */
  sessionName?: string;
  /**
   * 🚨 **모를 때는 넘기지 않는다.** 0 을 넘겨 「참여 0명」을 프로젝터에 띄우면
   *    모르는 것을 아는 것처럼 말하게 된다. 「내 수업」 목록 카드는 목록을 폴링하지 않아
   *    열 때의 숫자로 굳으므로 **일부러 넘기지 않는다** — 상세 화면(6초 폴링)만 넘긴다.
   */
  participantCount?: number;
  onClose: () => void;
};

export default function QrFullscreen({ code, sessionName, participantCount, onClose }: QrFullscreenProps) {
  const joinUrl =
    typeof window === 'undefined'
      ? `https://architecture.teachermate.co.kr/join?code=${code}`
      : `${window.location.origin}/join?code=${code}`;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      aria-label="학생 참여 QR"
      aria-modal="true"
      /*
        🚨 `z-[100]`·`overflow-auto`·`m-auto`(아래 패널) 셋은 한 묶음이다. §10 v3 는
           «세로 중앙정렬 + 넘치면 스크롤»을 요구하는데, `items-center` 로 중앙을 잡으면
           넘칠 때 **위가 잘려** 수업 이름과 코드가 화면 밖으로 나간다.
      */
      className="fixed inset-0 z-[100] flex overflow-auto bg-white px-4 py-6"
      onClick={onClose}
      role="dialog"
    >
      {/*
        🔑 닫기 X 는 **패널 밖 화면 우상단**에 둔다. 패널 안 `absolute right-0 top-0` 에 두면
           패널 폭이 내용에 맞춰 줄어드는 순간 X 가 수업 이름 위로 겹친다.
      */}
      <button
        aria-label="닫기"
        className="fixed right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"
        onClick={onClose}
        type="button"
      >
        ✕
      </button>

      <div
        className="m-auto flex max-w-[92vw] flex-col items-center gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        {sessionName ? <p className="mb-1 text-base text-stone-500">{sessionName}</p> : null}

        <div className="select-all font-mono text-[clamp(96px,18vw,200px)] font-bold leading-none tracking-[0.12em] text-stone-950">
          {code}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-lg">
          <QRCodeSVG
            bgColor="#ffffff"
            className="block h-auto w-[min(70vw,70vh)] md:w-[min(45vw,45vh)]"
            fgColor="#111827"
            includeMargin
            value={joinUrl}
          />
        </div>

        {participantCount === undefined ? null : (
          <p className="flex items-center gap-2 text-[clamp(24px,3vw,32px)] text-stone-600">
            <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            참여 {participantCount}명
          </p>
        )}

        <p className="text-center text-base text-stone-400 sm:text-xl" style={{ wordBreak: 'keep-all' }}>
          QR 코드를 스캔하거나 코드를 입력하세요
        </p>
      </div>
    </div>
  );
}
