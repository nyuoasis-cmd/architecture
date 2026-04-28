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

      entries.push([qaId, createPlaceholderAnswers(qaId)]);
    });
  });

  return Object.fromEntries(entries);
}

export const QUIZ_ANSWERS: Record<string, QuizAnswerSet> = createAnswerRecord();
