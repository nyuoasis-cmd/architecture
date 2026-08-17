// 견학 키트 + 링크 레지스트리의 계약 — SDD 결정 2·17 · 쉬움 3원칙 3 · 목업 3.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const read = (...rel: string[]) => readFileSync(path.join(ROOT, ...rel), 'utf8')
const loadClient = (rel: string) => require(path.resolve(ROOT, 'client', 'src', rel))

const { LINK_REGISTRY } = loadClient('data/link-registry') as {
  LINK_REGISTRY: Record<string, { id: string; url: string; noLogin: true; status: string; snapshotPath?: string }>
}
const { TOUR_KITS } = loadClient('data/tour-kits') as {
  TOUR_KITS: Record<
    string,
    {
      qaId: string
      linkId: string
      mission: { question: string; choices: Array<{ label: string; correct: boolean }>; hint: string; caption: string }
    }
  >
}
const { EXPERIENCE_KIND_BY_CHAPTER } = loadClient('data/experience') as {
  EXPERIENCE_KIND_BY_CHAPTER: Record<number, string>
}

test('1) 레지스트리 — https·무로그인만, id 가 키와 같다', () => {
  assert.ok(Object.keys(LINK_REGISTRY).length >= 1, '레지스트리가 비었다 — 이 계약이 헛돈다')
  for (const [key, link] of Object.entries(LINK_REGISTRY)) {
    assert.equal(link.id, key, `${key}: id 와 키가 다르다`)
    assert.ok(link.url.startsWith('https://'), `${key}: https 가 아니다 — 학생을 비보안 페이지로 보낸다`)
    assert.equal(link.noLogin, true, `${key}: 무로그인 선언이 없다 (SDD 결정 2)`)
    assert.ok(['candidate', 'confirmed'].includes(link.status), `${key}: status 가 후보/확정 밖이다`)
  }
})

test('2) 키트 미션 — 고르기뿐, 정답은 하나, 오답 힌트와 정답 캡션이 있다', () => {
  assert.ok(Object.keys(TOUR_KITS).length >= 1, '키트가 하나도 없다 — 10강 시범이 사라졌다')
  for (const [qaId, kit] of Object.entries(TOUR_KITS)) {
    assert.equal(kit.qaId, qaId, `${qaId}: qaId 와 키가 다르다`)
    assert.ok(LINK_REGISTRY[kit.linkId], `${qaId}: 레지스트리에 없는 링크(${kit.linkId})를 가리킨다`)
    assert.ok(kit.mission.choices.length >= 2, `${qaId}: 고를 것이 하나뿐이다`)
    assert.equal(
      kit.mission.choices.filter((choice) => choice.correct).length,
      1,
      `${qaId}: 정답이 하나가 아니다`,
    )
    assert.ok(kit.mission.hint.trim().length > 0, `${qaId}: 오답 힌트가 없다 — 틀린 학생이 갈 곳을 잃는다`)
    assert.ok(kit.mission.caption.trim().length > 0, `${qaId}: 정답 캡션이 없다 — 가르치려던 문장이 사라진다`)
    // 🚨 영어 표기 답 금지(쉬움 3원칙 3) — 선택지가 영어로만 된 답을 요구하지 않는다.
    for (const choice of kit.mission.choices) {
      assert.ok(/[가-힣]/.test(choice.label), `${qaId}: 선택지 «${choice.label}» 가 우리말이 아니다`)
    }
    // 키트는 견학형 강(본체)과 유사 페이지형 강(짝 링크의 «진짜 먼저 보기», SDD 결정 3)에 얹는다.
    //    터미널형 강에는 안 얹는다 — 그 강의 체험은 터미널이 본체다.
    const chapterId = Number(qaId.slice(2, 4))
    assert.ok(
      ['tour', 'github', 'composite'].includes(EXPERIENCE_KIND_BY_CHAPTER[chapterId] ?? ''),
      `${qaId}: 터미널형 강(ch${chapterId})에 키트가 얹혔다`,
    )
  }
})

test('3) 화면 — 새 탭·URL 노출·자유 입력 없음·스냅샷 폴백은 준비된 것만', () => {
  const component = read('client', 'src', 'components', 'learn', 'TourKit.tsx')
  assert.ok(/target="_blank"/.test(component), '링크가 새 탭으로 안 열린다 (iframe 차단 전제)')
  assert.ok(/rel="noopener noreferrer"/.test(component), 'noopener 가 없다')
  assert.equal(/<input|<textarea/.test(component), false, '키트 미션에 자유 입력 칸이 생겼다 (쉬움 3원칙 3 위반)')
  assert.ok(/link\.url/.test(component), 'URL 을 학생에게 안 보여 준다 — 주소를 읽는 것도 교육이다')
  assert.ok(/snapshotPath \?/.test(component), '스냅샷 폴백이 준비 여부와 무관하게 그려진다 — 없는 스냅샷 링크는 깨진 문이다')
  const panel = read('client', 'src', 'components', 'learn', 'ContentPanel.tsx')
  assert.ok(/getTourKit\(qaId\)/.test(panel), 'ContentPanel 이 키트를 안 얹는다')
})
