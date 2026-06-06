import { useNavigate } from 'react-router-dom';
import { useExitGuard, ExitGuardModal } from '@teachermate/shared';

// 학생 세션 뒤로가기 가드. 세션 학습 화면(LearnPage mode='session')당 정확히 1회 렌더.
// when=세션 서버검증 성공(ready) 시 무장. 외부 API 호출 없음(순수 클라 가드).
export function StudentExitGuard({ when }: { when: boolean }) {
  const navigate = useNavigate();
  const guard = useExitGuard({ when, onConfirmExit: () => navigate('/', { replace: true }) });
  return <ExitGuardModal {...guard} audience="student" />;
}
