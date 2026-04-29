const QA_COUNTS = [4, 4, 7, 7, 7, 10, 6, 7, 6, 7] as const;

export type QuizAnswer = {
  correctIdx: number;
  explanation: string;
};

export type QuizAnswerSet = {
  qaId: string;
  answers: QuizAnswer[];
};

function createPlaceholderAnswers(qaId: string): QuizAnswerSet {
  return {
    qaId,
    answers: [{ correctIdx: 0, explanation: '이 문항의 해설은 준비중입니다.' }],
  };
}

function createAnswerRecord(): Record<string, QuizAnswerSet> {
  const entries: Array<[string, QuizAnswerSet]> = [];

  QA_COUNTS.forEach((count, chapterIndex) => {
    const chapterId = chapterIndex + 1;
    Array.from({ length: count }, (_, index) => {
      const order = index + 1;
      const qaId = `ch${String(chapterId).padStart(2, '0')}_q${String(order).padStart(2, '0')}`;

      if (qaId === 'ch06_q03') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '프로그램은 저장된 파일이고, 프로세스는 메모리에서 실행 중인 상태이며, 프로세서는 CPU 같은 처리 부품입니다.',
              },
              {
                correctIdx: 1,
                explanation: '같은 앱을 두 번 실행하면 메모리에는 서로 독립된 프로세스 두 개가 만들어집니다.',
              },
              {
                correctIdx: 2,
                explanation: 'CPU는 명령을 실제로 처리하는 프로세서입니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch01_q01') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 0,
                explanation: '컴퓨터의 큰 흐름은 입력을 받아 처리한 뒤 결과를 출력하는 것입니다. 나머지 선택지는 특정 사용 장면일 뿐 기본 구조를 설명하지 못합니다.',
              },
              {
                correctIdx: 1,
                explanation: '냄비는 재료를 올려 두고 조리 중인 상태를 유지하므로 메모리 비유에 가깝습니다. 재료 창고나 영수증은 입력 또는 보관 쪽에 더 가깝습니다.',
              },
              {
                correctIdx: 0,
                explanation: '사진, 문자, 소리처럼 겉모습이 달라도 컴퓨터 안에서는 모두 0과 1의 조합으로 바뀌어 처리됩니다. 그래서 같은 CPU와 메모리 체계로 다룰 수 있습니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch01_q02') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 2,
                explanation: '하드웨어는 CPU, RAM, SSD처럼 실제로 존재하는 물리 부품입니다. 문서나 설정 자체는 소프트웨어 또는 데이터에 가깝습니다.',
              },
              {
                correctIdx: 1,
                explanation: '같은 장비라도 어떤 소프트웨어가 올라가느냐에 따라 문서 작업, 게임, 편집처럼 전혀 다른 행동을 하게 됩니다. 하드웨어만으로 목적이 저절로 바뀌지는 않습니다.',
              },
              {
                correctIdx: 3,
                explanation: '무대와 조명은 하드웨어 쪽이고, 장면 순서와 대사를 정하는 대본이 소프트웨어 역할입니다. 소프트웨어는 부품에 무엇을 하라고 지시하는 쪽입니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch01_q03') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '운영체제는 앱과 하드웨어 사이에서 자원과 공통 규칙을 조정하는 중심 소프트웨어입니다. 배경화면 저장이나 선 길이 측정은 운영체제의 본질적 역할이 아닙니다.',
              },
              {
                correctIdx: 0,
                explanation: '여러 앱이 동시에 열리면 CPU 시간과 메모리를 어떻게 나눌지가 핵심입니다. 운영체제는 이 자원 분배를 계속 조정해 충돌을 줄입니다.',
              },
              {
                correctIdx: 2,
                explanation: '파일 관리는 영수증과 예약 정보를 정리해 필요할 때 다시 찾을 수 있게 만드는 일과 비슷합니다. 단순히 불을 끄거나 식탁 수를 줄이는 일과는 다릅니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch01_q04') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 0,
                explanation: '일반적으로 데이터는 저장소에서 RAM으로 올라오고, CPU가 그 RAM의 데이터를 읽어 처리합니다. 모니터나 키보드는 이 핵심 이동 경로의 중심이 아닙니다.',
              },
              {
                correctIdx: 1,
                explanation: 'RAM은 빠르게 읽고 쓰는 작업 공간이지만 전원을 끄면 내용이 사라지는 휘발성 메모리입니다. 오래 남는 저장은 SSD 같은 저장소가 맡습니다.',
              },
              {
                correctIdx: 0,
                explanation: '캐시는 자주 쓰는 정보를 CPU 가까이에 둬서 다시 찾는 시간을 줄이려는 장치입니다. 영구 저장이 목적이 아니라 속도를 높이는 것이 핵심입니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch02_q01') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '시스템 소프트웨어는 운영체제나 드라이버처럼 컴퓨터 바닥에서 자원과 장치를 정리하는 역할을 맡습니다. 사용자가 직접 목표를 수행하는 앱과는 위치가 다릅니다.',
              },
              {
                correctIdx: 0,
                explanation: '문서 작성 앱과 게임은 사용자가 직접 목적을 이루기 위해 쓰는 도구이므로 응용 소프트웨어에 가깝습니다. 드라이버나 파일 시스템은 바닥 운영 쪽입니다.',
              },
              {
                correctIdx: 1,
                explanation: '미들웨어는 응용 프로그램들이 공통 기능과 연결을 더 쉽게 쓰게 돕는 중간층입니다. 하드웨어 부품이나 전원 장치가 아닙니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch02_q02') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 2,
                explanation: '오픈소스 소프트웨어는 소스 코드가 공개되고, 라이선스가 허용하는 범위 안에서 수정과 배포가 가능합니다. 다만 조건이 전혀 없는 것은 아니므로 라이선스를 읽어야 합니다.',
              },
              {
                correctIdx: 0,
                explanation: '상용 소프트웨어는 기능뿐 아니라 사용 목적과 라이선스 범위를 함께 확인해야 합니다. 학생용과 상업용처럼 허용 범위가 달라질 수 있기 때문입니다.',
              },
              {
                correctIdx: 0,
                explanation: 'GPL은 오픈소스 라이선스의 한 종류로, 수정본을 배포할 때 공개 의무가 붙을 수 있습니다. 단순 할인 제도나 하드웨어 계약과는 성격이 다릅니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch02_q03') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '모듈은 한 가지 기능을 맡는 비교적 작은 코드 묶음입니다. 여러 모듈이 모여 더 큰 패키지를 이루는 경우가 많습니다.',
              },
              {
                correctIdx: 0,
                explanation: '패키지는 모듈 여러 개를 묶어 배포하는 단위입니다. 항상 하나의 파일만 의미하지는 않으며, 내부에 다양한 기능이 함께 들어갈 수 있습니다.',
              },
              {
                correctIdx: 1,
                explanation: 'npm과 pip는 패키지를 설치하고 버전과 의존성을 관리하는 도구입니다. CPU 속도를 직접 올리거나 운영체제를 새로 만드는 도구가 아닙니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch05_q01') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '프론트엔드는 버튼, 입력창, 화면 전환처럼 사용자가 직접 보는 경험을 맡습니다. 백업이나 권한 저장 같은 뒤쪽 운영은 주로 백엔드 성격이 더 강합니다.',
              },
              {
                correctIdx: 2,
                explanation: '백엔드는 주문 계산, 권한 확인, 데이터 저장처럼 서비스 규칙과 안정성을 처리합니다. 버튼 색이나 여백처럼 보이는 문제는 프론트엔드 영역에 가깝습니다.',
              },
              {
                correctIdx: 0,
                explanation: '프론트엔드와 백엔드를 나누면 화면 경험과 비즈니스 규칙을 각자 더 분명하게 다듬을 수 있고, 팀도 동시에 협업하기 쉬워집니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch05_q02') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 0,
                explanation: 'HTML은 제목, 본문, 버튼 같은 요소가 어떤 구조로 놓일지 적는 뼈대입니다. 시각 효과나 서버 동작을 직접 맡지는 않습니다.',
              },
              {
                correctIdx: 2,
                explanation: 'CSS는 색상, 글자 크기, 여백, 정렬처럼 화면이 어떻게 보일지를 담당합니다. 로그인 검증이나 데이터 저장은 다른 층의 일입니다.',
              },
              {
                correctIdx: 2,
                explanation: '클릭 후 목록을 다시 보여 주는 반응은 JavaScript가 맡는 대표 사례입니다. 제목을 적거나 색만 칠하는 일과는 역할이 다릅니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch05_q03') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: 'API는 프론트엔드와 백엔드가 어떤 요청을 보내고 어떤 응답을 받을지 정해 둔 대화 창구입니다. 단순한 색 규칙이나 하드웨어가 아닙니다.',
              },
              {
                correctIdx: 1,
                explanation: 'REST에서는 사용자, 주문, 게시글 같은 자원을 기준으로 주소를 나누고, 메서드로 행동을 표현하는 흐름을 자주 씁니다.',
              },
              {
                correctIdx: 0,
                explanation: 'REST에서는 한 번의 요청에 필요한 정보가 충분히 담겨 있어야 처리와 확장이 단순해집니다. 서버가 숨은 상태를 과하게 기억하는 흐름과는 거리가 있습니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch05_q04') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: 'SPA는 브라우저가 코드를 받아 필요한 부분만 바꿔 가며 화면을 움직이는 방식입니다. 그래서 앱처럼 매끄러운 전환이 가능한 경우가 많습니다.',
              },
              {
                correctIdx: 0,
                explanation: 'SSR은 서버가 먼저 HTML을 만들어 보내므로 첫 화면 내용을 더 빨리 보여 주기 쉬운 편입니다. 다만 이후 흐름은 서비스 설계에 따라 달라집니다.',
              },
              {
                correctIdx: 1,
                explanation: 'SPA와 SSR 비교의 핵심은 화면을 언제 어디서 만들어 주느냐입니다. 첫 진입 속도와 이후 상호작용 감각도 이 차이에서 나옵니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch05_q05') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '상태 관리는 여러 화면과 컴포넌트가 같은 현재 정보를 일관되게 보도록 돕습니다. 디자인 꾸밈 자체가 목적은 아닙니다.',
              },
              {
                correctIdx: 1,
                explanation: '헤더와 결제 화면의 장바구니 수가 다르면 같은 상태를 여러 곳에서 따로 들고 있어 어긋난 상황으로 볼 수 있습니다.',
              },
              {
                correctIdx: 1,
                explanation: 'Context, Redux, Zustand는 모두 공통 상태를 어떻게 보관하고 갱신할지 도와주는 방식이나 도구입니다. 브라우저 종류나 데이터베이스 종류가 아닙니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch05_q06') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 0,
                explanation: '프레임워크와 라이브러리는 반복되는 UI 문제를 매번 맨손으로 풀지 않도록 공통 규칙과 도구를 제공합니다. 서버를 없애는 기술은 아닙니다.',
              },
              {
                correctIdx: 0,
                explanation: '컴포넌트 방식의 큰 장점은 한 번 만든 UI 조각을 여러 곳에서 다시 쓸 수 있다는 점입니다. 이렇게 해야 큰 화면도 구조적으로 관리하기 쉽습니다.',
              },
              {
                correctIdx: 1,
                explanation: '도구 선택은 유행보다 팀의 익숙함, 유지보수 기간, 필요한 기능, 생태계 지원을 함께 보는 편이 현실적입니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch05_q07') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 0,
                explanation: '빌드 도구는 여러 소스 파일과 자산을 브라우저가 읽기 쉬운 형태로 정리해 줍니다. 단순한 주변기기 설정 도구가 아닙니다.',
              },
              {
                correctIdx: 0,
                explanation: '개발 중에는 저장 직후 빠르게 반영되고 화면이 곧바로 갱신되는 경험이 매우 중요합니다. 빌드 도구는 이 흐름을 크게 개선해 줍니다.',
              },
              {
                correctIdx: 1,
                explanation: '번들링은 여러 파일을 전달하기 좋은 묶음으로 정리하는 과정입니다. 최적화나 압축과 함께 배포 준비의 핵심 단계로 자주 다뤄집니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch02_q04') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 0,
                explanation: '클라우드는 인터넷 너머의 서버와 저장소 같은 자원을 빌려 쓰는 방식입니다. 단순한 입력 장치나 오프라인 디스크를 뜻하지 않습니다.',
              },
              {
                correctIdx: 1,
                explanation: 'SaaS는 브라우저나 앱으로 접속해 바로 쓰는 완성형 소프트웨어 서비스입니다. 사용자가 서버 장비를 직접 조립하는 단계는 아닙니다.',
              },
              {
                correctIdx: 1,
                explanation: '일반적으로 아래층에서 위층으로 갈수록 IaaS, PaaS, SaaS 순으로 올라갑니다. 인프라를 빌리는 단계에서 완성 서비스를 쓰는 단계로 추상화가 높아지는 구조입니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch03_q01') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '단위 테스트는 함수나 클래스처럼 작은 부품 하나를 따로 확인하는 검사입니다. 전체 여정을 보는 E2E와 범위가 다릅니다.',
              },
              {
                correctIdx: 1,
                explanation: '통합 테스트는 연결된 여러 부품이 실제로 맞물릴 때 생기는 규칙 불일치를 잘 잡아냅니다. 부품 하나만 떼어 보면 보이지 않던 문제가 여기서 드러납니다.',
              },
              {
                correctIdx: 2,
                explanation: 'E2E 테스트는 범위가 넓고 느리며 유지 비용도 커서, 모든 경우를 덮기보다 핵심 사용자 흐름에 집중하는 편이 현실적입니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch03_q02') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: 'Red는 아직 구현되지 않은 기능을 향해 테스트를 먼저 써서 실패를 확인하는 단계입니다. 이 실패가 목표를 분명하게 보여 줍니다.',
              },
              {
                correctIdx: 2,
                explanation: 'Green에서는 테스트를 통과할 최소 구현부터 만듭니다. 처음부터 완벽한 구조를 목표로 하면 오히려 방향이 흐려질 수 있습니다.',
              },
              {
                correctIdx: 0,
                explanation: 'Refactor는 테스트가 동작 유지 여부를 확인해 주기 때문에 가능한 단계입니다. 안전망이 있으니 구조를 다듬어도 불안이 줄어듭니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch03_q03') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: 'CI의 핵심은 코드를 자주 합치고 자동 검증으로 문제를 빨리 드러내는 것입니다. 큰 덩어리로 늦게 합치면 원인 추적이 훨씬 어려워집니다.',
              },
              {
                correctIdx: 0,
                explanation: 'CI에서는 보통 빌드, 테스트, 정적 검사 같은 공통 검증이 자동 실행됩니다. 모두 팀의 기본 기준을 기계적으로 확인하는 작업입니다.',
              },
              {
                correctIdx: 1,
                explanation: '작은 변경 단위에서 바로 실패를 보면 원인 범위를 쉽게 좁힐 수 있습니다. 그래서 문제를 더 빠르고 싸게 찾을 수 있습니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch03_q04') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 0,
                explanation: 'Continuous Delivery와 Deployment의 표현 차이는 있어도, 둘 다 검증된 변경을 안정적으로 배포 흐름에 올리는 자동화가 핵심입니다.',
              },
              {
                correctIdx: 2,
                explanation: 'staging은 운영과 비슷한 조건에서 최종 점검을 해 보는 리허설 환경입니다. 실제 사용자용인 prod와 역할이 다릅니다.',
              },
              {
                correctIdx: 1,
                explanation: '환경을 나누는 이유는 위험을 한 번에 운영에 노출하지 않고 단계별로 확인하기 위해서입니다. 계단을 한 칸씩 올라가며 검증하는 구조에 가깝습니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch03_q05') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '즉시 롤백은 방금 올린 버전을 내리고 직전 안정 버전으로 빠르게 되돌리는 방식입니다. 가장 단순하지만 상황에 따라 데이터 정합성은 별도 검토가 필요합니다.',
              },
              {
                correctIdx: 1,
                explanation: '블루그린은 두 환경을 준비해 두므로 문제가 생기면 트래픽을 원래 환경으로 쉽게 돌릴 수 있습니다. 이 복귀 속도가 큰 장점입니다.',
              },
              {
                correctIdx: 1,
                explanation: '카나리 배포는 일부 사용자에게만 새 버전을 먼저 열어 작은 범위에서 반응과 오류를 확인하는 전략입니다. 영향을 통제하기 좋습니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch03_q06') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 0,
                explanation: '요청 수, 응답 시간, 에러율은 서비스 상태를 직접 보여 주는 대표적인 운영 신호입니다. 이런 지표를 꾸준히 봐야 이상 징후를 빨리 찾을 수 있습니다.',
              },
              {
                correctIdx: 2,
                explanation: '좋은 알림은 지금 사람이 행동해야 할 순간에만 울리도록 맞춰야 합니다. 너무 자주 울리면 경고에 무뎌져 중요한 장애도 놓치기 쉽습니다.',
              },
              {
                correctIdx: 1,
                explanation: 'SLI는 실제로 재는 값이고, SLO는 그 값이 어느 수준은 되어야 한다는 목표입니다. 둘을 구분해야 운영 품질을 숫자로 관리할 수 있습니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch03_q07') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '코드 리뷰의 핵심은 변경의 위험을 줄이고 팀 안에 지식을 공유하는 것입니다. 속도 경쟁이나 PR 개수 늘리기가 목적은 아닙니다.',
              },
              {
                correctIdx: 1,
                explanation: '작은 PR과 명확한 변경 의도, 테스트 결과는 리뷰어가 핵심 판단에 집중하게 도와 줍니다. 큰 덩어리 PR보다 훨씬 효율적입니다.',
              },
              {
                correctIdx: 2,
                explanation: '행동 가능한 리뷰는 무엇이 위험한지와 왜 그런지를 함께 적습니다. 그래서 수정 방향이 분명해지고 대화 비용이 줄어듭니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch04_q01') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '정형 데이터는 열과 행이 분명하고 어떤 값이 들어올지 예측하기 쉬운 데이터입니다. 그래서 표 기반 검색과 집계에 잘 맞습니다.',
              },
              {
                correctIdx: 2,
                explanation: '주문마다 선택 항목이 달라질 수 있는 JSON 문서는 공통 뼈대는 있지만 속성이 유동적인 반정형 데이터의 좋은 예입니다.',
              },
              {
                correctIdx: 1,
                explanation: '비정형 데이터는 고정된 칸으로 바로 나누기 어려워 추가 분류나 해석 과정이 필요한 경우가 많습니다. 그래서 집계와 검색도 더 복잡해집니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch04_q02') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 2,
                explanation: 'CSV는 값을 칸으로 구분해 표처럼 적는 단순한 텍스트 포맷입니다. 중첩 구조보다는 행과 열 중심 데이터에 잘 맞습니다.',
              },
              {
                correctIdx: 0,
                explanation: 'JSON은 사람이 읽기에도 비교적 간단하고, 프로그램이 객체처럼 바로 다루기 쉬우며 중첩 구조도 표현할 수 있어 웹 API에서 널리 쓰입니다.',
              },
              {
                correctIdx: 1,
                explanation: 'XML은 태그를 사용해 데이터의 의미와 계층 구조를 명시적으로 표현하기 좋습니다. 그만큼 장황해질 수 있지만 규칙이 분명합니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch04_q03') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 0,
                explanation: '정규화의 핵심은 중복을 줄여 같은 사실을 한곳에서 관리하게 만드는 것입니다. 그래야 수정과 검증이 쉬워집니다.',
              },
              {
                correctIdx: 1,
                explanation: '주소가 여러 행에 반복되면 변경 시 일부만 수정될 수 있어 같은 고객 정보가 서로 다르게 보이는 불일치가 생길 수 있습니다.',
              },
              {
                correctIdx: 2,
                explanation: '분리된 테이블은 고객 번호 같은 연결 키로 이어집니다. 이 키 덕분에 정보는 나뉘어 있어도 의미상 연결됩니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch04_q04') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '색인은 원하는 단어가 나온 위치를 먼저 좁혀 주듯, 인덱스도 전체를 다 읽지 않고 필요한 데이터 위치를 빠르게 찾도록 돕습니다.',
              },
              {
                correctIdx: 1,
                explanation: '인덱스는 자주 조회하는 열에서 특히 효과가 큽니다. 반복 검색이 많은 화면일수록 체감 차이가 커집니다.',
              },
              {
                correctIdx: 0,
                explanation: '인덱스는 조회를 빠르게 하는 대신 쓰기 때도 함께 갱신해야 하므로 저장 공간과 수정 비용이 늘 수 있습니다. 그래서 필요한 곳에만 둬야 합니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch04_q05') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '원자성은 작업이 전부 성공하거나, 실패하면 처음처럼 되돌아가야 한다는 뜻입니다. 절반만 남는 상태를 허용하지 않습니다.',
              },
              {
                correctIdx: 0,
                explanation: '고립성은 동시에 여러 작업이 진행돼도 서로의 미완성 상태를 함부로 읽거나 덮어쓰지 않게 해 줍니다. 동시성 충돌을 줄이는 핵심입니다.',
              },
              {
                correctIdx: 0,
                explanation: '지속성은 성공이 확정된 결과가 장애 뒤에도 사라지지 않아야 한다는 뜻입니다. 완료 메시지를 보여 줬다면 기록도 남아 있어야 합니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch04_q06') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 1,
                explanation: '백업은 사본을 남기는 행위이고, 복구는 그 사본으로 실제 서비스를 다시 동작시키는 절차입니다. 둘은 연결되지만 같은 뜻은 아닙니다.',
              },
              {
                correctIdx: 1,
                explanation: 'RPO는 장애 시 어느 시점까지의 데이터 손실을 받아들일지 정하는 기준입니다. 백업 간격과 복제 전략에 직접 영향을 줍니다.',
              },
              {
                correctIdx: 0,
                explanation: '실제 장애 때 절차를 처음 수행하면 예상보다 오래 걸리기 쉽습니다. 그래서 복구 훈련은 문서가 아닌 실행 가능한 준비 상태를 확인하는 과정입니다.',
              },
            ],
          },
        ]);
        return;
      }

      if (qaId === 'ch04_q07') {
        entries.push([
          qaId,
          {
            qaId,
            answers: [
              {
                correctIdx: 2,
                explanation: '시각화는 먼저 어떤 질문에 답하려는지 정해야 합니다. 그래야 적절한 차트와 강조 방식을 고를 수 있습니다.',
              },
              {
                correctIdx: 1,
                explanation: '축을 잘라 작은 차이를 크게 보이게 하면 실제보다 변화가 과장되어 해석이 왜곡될 수 있습니다. 축과 단위는 솔직해야 합니다.',
              },
              {
                correctIdx: 1,
                explanation: '장식이 많으면 시선이 핵심 패턴보다 꾸밈 요소로 분산됩니다. 좋은 시각화는 한두 포인트만 강조하고 나머지는 조용히 두는 편이 읽기 쉽습니다.',
              },
            ],
          },
        ]);
        return;
      }

      entries.push([qaId, createPlaceholderAnswers(qaId)]);
    });
  });

  return Object.fromEntries(entries);
}

export const QUIZ_ANSWERS: Record<string, QuizAnswerSet> = createAnswerRecord();
