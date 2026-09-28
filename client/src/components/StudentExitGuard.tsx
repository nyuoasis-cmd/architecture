import { useLocation, useNavigate } from 'react-router-dom';
import { useExitGuard, ExitGuardModal, isFirstInAppEntry } from '@teachermate/shared';

// 학생 세션 뒤로가기 가드. 학생 세션 화면(수업 목차 LibraryPage · 학습 LearnPage mode='session')당 정확히 1회 렌더.
// when=세션 서버검증 성공(ready) 시 무장. 외부 API 호출 없음(순수 클라 가드).
// 🔙 §9.H-18 v2.4 「한 칸 뒤로」(2026-09-28) — 나가기 확인은 **첫 화면에서만**: 이 앱 안에서 쌓인 이전 화면이 없는 곳
//    (입장 직후 수업 목차 · QR·새로고침으로 곧바로 들어온 Q&A). 목차 → Q&A → 다음 Q&A 에서 뒤로가기는 바로 전 화면이다.
//    🗑️ 옛 판은 학습 화면에서 늘 걸어 Q&A 를 넘길 때마다 뒤로가기 = 나가기 확인이었고, 목차에는 가드가 없었다.
// 🔑 나가기 목적지 = 수업 입장 화면(`/join`) — 옛 판은 랜딩(`/`)이었다. 새로고침 경고는 걸지 않는다.
export function StudentExitGuard({ when }: { when: boolean }) {
  const navigate = useNavigate();
  useLocation(); // 주소가 바뀔 때마다 «첫 화면인가» 를 다시 잰다
  const guard = useExitGuard({
    when: when && isFirstInAppEntry(),
    onConfirmExit: () => navigate('/join', { replace: true }),
    unloadWhen: false,
  });
  return <ExitGuardModal {...guard} audience="student" />;
}
