import { Hero, Icons, LogBox, PairMatch, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  lanes: string[][];
  note: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  csv: {
    title: '행과 열로 나누기 — CSV',
    summary: '값을 줄 단위로 나란히 펼치면 사람도 바로 읽고 엑셀로도 열기 쉽습니다. 반복 구조를 빠르게 주고받을 때 CSV가 단순하고 강합니다.',
    active: 0,
    lanes: [
      ['고객,상품,수량', '행마다 같은 순서'],
      ['CSV export', '쉼표 기준 분리'],
      ['대량 업로드', '분석 도구 연결'],
    ],
    note: '반복 구조가 또렷하고 중첩이 거의 없을 때는 CSV가 가장 가볍습니다. 대신 열 의미를 문서로 같이 관리해야 합니다.',
    logs: [
      ['12:10:01', '판매 집계 CSV 생성'],
      ['12:10:02', '열 순서 검증 완료'],
      ['12:10:03', '분석 툴로 전송'],
    ],
  },
  json: {
    title: '상자 안에 묶기 — JSON',
    summary: '관련 값을 한 상자에 묶고 필요한 항목만 더 붙일 수 있어 서비스 간 API 교환에 많이 쓰입니다. 키 이름 덕분에 의미도 함께 전달됩니다.',
    active: 1,
    lanes: [
      ['주문 상자', '배송 상자'],
      ['{ key: value }', '배열 중첩 허용'],
      ['웹 API 응답', '설정 파일'],
    ],
    note: 'JSON은 유연성과 가독성의 균형이 좋아서 애플리케이션 경계에서 자주 선택됩니다. 다만 형식 검증 규칙은 별도로 둬야 안전합니다.',
    logs: [
      ['12:11:01', 'order payload 직렬화'],
      ['12:11:02', 'optional field 포함'],
      ['12:11:03', '클라이언트 응답 완료'],
    ],
  },
  xml: {
    title: '태그로 감싸기 — XML',
    summary: '항목 경계와 계층을 태그로 명확히 감싸야 할 때 XML이 유용합니다. 문서 교환 규격처럼 구조의 엄격함이 중요한 곳에서 오래 쓰였습니다.',
    active: 2,
    lanes: [
      ['<item>', '<price>'],
      ['계층 태그', '스키마 검증'],
      ['문서 교환', '레거시 연동'],
    ],
    note: '표현은 장황하지만 계층과 규칙을 엄격히 통제하기 쉽습니다. 그래서 시스템 간 계약을 강하게 유지해야 할 때 아직도 남아 있습니다.',
    logs: [
      ['12:12:01', 'XML schema 로드'],
      ['12:12:02', '태그 계층 검증'],
      ['12:12:03', '외부 기관 전송 준비'],
    ],
  },
  choice: {
    title: '무엇을 담을지 먼저 보기 — 포맷 선택',
    summary: '포맷은 취향보다 용도가 먼저입니다. 단순 표인지, 중첩 구조인지, 엄격한 계약이 필요한지에 따라 맞는 그릇이 달라집니다.',
    active: 3,
    lanes: [
      ['단순 반복', '중첩 객체'],
      ['CSV/JSON/XML 비교', '도구 호환성 점검'],
      ['가독성', '검증 강도'],
    ],
    note: '같은 데이터라도 목적이 달라지면 포맷 선택도 달라집니다. 저장과 전송을 분리해서 생각하면 판단이 더 쉬워집니다.',
    logs: [
      ['12:13:01', '교환 대상 시스템 확인'],
      ['12:13:02', '중첩 구조 필요 여부 체크'],
      ['12:13:03', '최종 포맷 결정'],
    ],
  },
};

const TONE = getTone(4);

const METAPHOR = [
  { icon: <Icons.TableMetaIcon />, label: '표', sub: '행과 열' },
  { icon: <Icons.BoxMetaIcon />, label: '상자', sub: '키-값 구조' },
  { icon: <Icons.TagIcon />, label: '태그', sub: '꼬리표 구조' },
  { icon: <Icons.PickFormatIcon />, label: '선택', sub: '용도별' },
];

const IT = [
  { icon: <Icons.CsvIcon />, label: 'CSV', sub: '행렬 표' },
  { icon: <Icons.JsonIcon />, label: 'JSON', sub: '키-값' },
  { icon: <Icons.XmlIcon />, label: 'XML', sub: '계층 태그' },
  { icon: <Icons.FormatChoiceIcon />, label: '무엇을', sub: '맞는 포맷' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q02DataFormat({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.csv;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="데이터 포맷" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="데이터 담는 방식"
        itTitle="데이터 포맷"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">포맷 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['비유 장면', '포맷 구조', '주요 쓰임'];
            return (
              <div
                key={titles[index]}
                className="rounded-2xl border p-3 transition"
                style={{
                  minHeight: 120,
                  borderColor: active ? TONE.accent : 'var(--color-border)',
                  background: active ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
                }}
              >
                <p
                  className="m-0 text-[11px] font-bold"
                  style={{ color: active ? TONE.accent : 'var(--color-text-muted)' }}
                >
                  {titles[index]}
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {items.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border px-2.5 py-2 text-[11px] leading-[1.5]"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="mt-3 rounded-2xl border px-3 py-2.5 text-[12px] leading-[1.7]"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--demo-card-bg-alt)',
            color: 'var(--demo-summary-text-stone)',
          }}
        >
          {scene.note}
        </div>
      </section>

      <LogBox logs={scene.logs} variant="blue" title="포맷 처리 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
