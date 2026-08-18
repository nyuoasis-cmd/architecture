// 등록 가드 — "작성됐지만 아무도 실행하지 않는 테스트" 를 막는다.
//
// 왜 필요한가(2026-08-04 loop QA 실측): 이 레포가 테스트를 집어 오는 경로는 둘뿐이다.
//  - CI(l1-fast.yml) → `npm --prefix server test` = `find src -name '*.test.ts'`
//  - `qa:layerb` → playwright(브라우저가 필요해 CI 에는 안 올린다)
// 🚨 **client 에는 test 스크립트 자체가 없다.** 지금은 client 테스트가 0 이라 티가 안 나지만,
//    누가 `client/src/…/foo.test.ts` 를 하나 쓰는 순간 그 테스트는 **영영 돌지 않는다** —
//    관문은 초록이고 아무도 눈치채지 못한다. 이 가드가 그 순간 빨개진다.
//
// 같은 형태의 실제 사고:
//  - data-class `ime.test.ts`(IME 글자유실 회귀)가 목록에 없어 한 번도 실행되지 않음
//  - teacher-toolkit 단위 67건이 관문 밖 → 날짜 하드코딩 시한폭탄이 2일간 빨간 채 방치
//  - ai-app-builder `scripts/quiz-contract.test.mjs` 가 아무 데도 안 걸려 썩음
//
// 🔑 등록 목록을 이 파일에 다시 적지 않는다 — package.json 에서 수집 규칙을 파싱해 만든다.
//    목록을 복사해 두면 그 복사본이 또 하나의 손나열이 되어 같은 사고를 반복한다.
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

// 🔑 server/tsconfig.json 은 `module: CommonJS` 라 `import.meta` 를 쓰면 tsc 가 TS1343 으로
//    죽는다(= 남의 빌드를 깨뜨린다). 런타임은 tsx 라 돌아가 보이지만 빌드에서 터진다.
const root = path.resolve(__dirname, '..', '..', '..')

// dist = 빌드 산출물(src 에서 지운 테스트의 잔해가 남는다), node_modules = 남의 코드.
// 🔑 `.orca` = orca 가 만드는 git 워크트리(`.orca/worktrees/<브랜치>/`) — 이 레포의 **사본**이다.
//    거르지 않으면 사본 안의 테스트 파일이 통째로 「미등록」으로 잡혀, 워크트리를 쓰는 사람의
//    로컬만 빨개진다(CI 에는 `.orca` 가 없어 초록 = 재현 안 되는 빨강). `.worktrees` 는 이미
//    거르고 있었는데 경로가 한 겹 달라 새던 자리다.
const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', '.git', '.worktrees', '.orca', '.ao',
  'playwright-report', 'test-results', 'coverage',
])
const TEST_FILE = /\.(test|spec)\.(mts|mjs|cjs|js|ts|tsx)$/

/**
 * 수집 경로의 진입점. `{ dir, script }` = 어느 package.json 의 어느 스크립트인가.
 * 🚨 «축소판» 스크립트를 적지 말 것 — 가드가 축소판을 정본으로 봉인해 버린다.
 */
const ENTRY_SCRIPTS = [
  { dir: 'server', script: 'test', ci: true },   // CI 가 부른다
  { dir: '.', script: 'qa:layerb', ci: false },  // playwright — 브라우저 탓에 CI 밖(문서화된 결정)
]
const CI_WORKFLOW = '.github/workflows/l1-fast.yml'

type Rule = { origin: string; matches: (rel: string) => boolean }

const globToRegExp = (glob: string): RegExp =>
  new RegExp(
    '^' +
      glob
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*\//g, ' ')
        .replace(/\*\*/g, ' ')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]')
        .replace(/ /g, '(?:.*/)?') +
      '$',
  )

const tokenize = (segment: string): string[] =>
  [...segment.matchAll(/'([^']*)'|"([^"]*)"|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3])

const readScripts = (dir: string): Record<string, string> =>
  JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8')).scripts ?? {}

const toRel = (abs: string): string => path.relative(root, abs).split(path.sep).join('/')

/** 스크립트에서 "이 명령이 어떤 테스트 파일을 집어 오는가" 규칙을 뽑는다. */
function collectRules(pkgDir: string, scriptName: string): Rule[] {
  const script = readScripts(pkgDir)[scriptName]
  assert.ok(script, `${toRel(pkgDir) || '.'}/package.json 에 ${scriptName} 스크립트가 없다 — 가드의 기준이 사라졌다.`)

  const rules: Rule[] = []

  for (const rawSegment of script.split('&&')) {
    const segment = rawSegment.trim()
    if (!segment) continue
    const origin = `${toRel(pkgDir) || '.'}/package.json → ${scriptName}: ${segment}`

    // ① `$(find <dir> -name '<패턴>' -print)` — 재귀 수집
    const find = segment.match(/\$\(\s*find\s+(\S+)\s+-name\s+(['"]?)(.+?)\2\s/)
    if (find && /\bnode\b/.test(segment)) {
      const findRoot = toRel(path.resolve(pkgDir, find[1]))
      const namePattern = globToRegExp(find[3])
      rules.push({
        origin,
        matches: (rel) => rel.startsWith(`${findRoot}/`) && namePattern.test(path.basename(rel)),
      })
      continue
    }

    // ② `node --test <글로브…>`
    if (/--test\b/.test(segment)) {
      const tokens = tokenize(segment)
      for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i]
        if (['node', 'tsx', 'npx', '--test'].includes(token)) continue
        if (['--import', '--loader', '-r'].includes(token)) {
          i += 1 // 플래그의 값은 경로가 아니다
          continue
        }
        if (token.startsWith('-')) continue
        const pattern = globToRegExp(toRel(path.resolve(pkgDir, token)))
        rules.push({ origin, matches: (rel) => pattern.test(rel) })
      }
      continue
    }

    // ③ `playwright test -c <설정>` — 설정의 testDir/testMatch 가 수집 범위
    if (/playwright\s+test\b/.test(segment)) {
      const configArg = segment.match(/(?:-c|--config)\s+(\S+)/)?.[1]
      const configPath = configArg
        ? path.resolve(pkgDir, configArg)
        : ['playwright.config.ts', 'playwright.config.js']
            .map((name) => path.join(pkgDir, name))
            .find(existsSync)
      if (!configPath || !existsSync(configPath)) continue

      const config = readFileSync(configPath, 'utf8')
      const testDir = config.match(/testDir\s*:\s*['"](.+?)['"]/)?.[1] ?? '.'
      const dirRoot = toRel(path.resolve(path.dirname(configPath), testDir))
      // testMatch 는 문자열 하나이거나 배열이다 — 둘 다 받는다.
      const matchBlock = config.match(/testMatch\s*:\s*(\[[\s\S]*?\]|['"].+?['"])/)?.[1] ?? "'**/*.spec.*'"
      const patterns = [...matchBlock.matchAll(/['"](.+?)['"]/g)].map(([, glob]) => globToRegExp(glob))

      rules.push({
        origin,
        matches: (rel) =>
          rel.startsWith(`${dirRoot}/`) &&
          patterns.some((pattern) => pattern.test(rel.slice(dirRoot.length + 1))),
      })
      continue
    }
  }

  return rules
}

function collectTestFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectTestFiles(path.join(dir, entry.name), acc)
    } else if (TEST_FILE.test(entry.name)) {
      acc.push(toRel(path.join(dir, entry.name)))
    }
  }
  return acc
}

const allRules = (): Rule[] =>
  ENTRY_SCRIPTS.flatMap((entry) => collectRules(path.resolve(root, entry.dir), entry.script))

test('① CI 가 부른다고 표시한 진입점을 워크플로가 실제로 부른다', () => {
  const workflow = readFileSync(path.join(root, CI_WORKFLOW), 'utf8')

  const missing = ENTRY_SCRIPTS.filter((entry) => entry.ci).filter(
    (entry) =>
      !new RegExp(`npm\\s+--prefix\\s+${entry.dir}\\s+(?:run\\s+)?${entry.script}\\b`).test(workflow) &&
      !new RegExp(`npm\\s+(?:run\\s+)?${entry.script}\\b`).test(workflow),
  )

  assert.deepEqual(
    missing.map((entry) => `${entry.dir}:${entry.script}`),
    [],
    'CI 가 부르지 않는 스크립트를 «CI 가 부른다» 고 표시해 뒀다.\n' +
      '관문이 부르는 스크립트가 바뀌었다면 ENTRY_SCRIPTS 도 같이 바꿀 것 — ' +
      '안 그러면 가드가 «아무도 안 도는 스크립트» 를 지키게 된다.',
  )
})

test('② 수집 규칙을 package.json 에서 실제로 파싱해 낸다', () => {
  const rules = allRules()
  assert.ok(
    rules.length >= ENTRY_SCRIPTS.length,
    `수집 규칙이 ${rules.length}개뿐(진입점 ${ENTRY_SCRIPTS.length}개) — 파서가 스크립트 형태를 못 읽고 있다.\n` +
      '이 상태면 ③ 이 "전부 미등록" 으로 오탐한다. 파서를 먼저 고칠 것.',
  )
})

test('③ 모든 테스트 파일이 어느 수집 경로 안에 있다', () => {
  const rules = allRules()
  const orphans = collectTestFiles(root)
    .filter((rel) => !rules.some((rule) => rule.matches(rel)))
    .sort()

  assert.deepEqual(
    orphans,
    [],
    '어느 스크립트도 집어 가지 않는 테스트 파일 — 작성됐지만 실행되지 않는다:\n  ' +
      `${orphans.join('\n  ')}\n\n` +
      '🚨 client 밑이라면 원인은 «client 에 test 스크립트가 없다» 다 — 파일을 지우지 말고 ' +
      'client/package.json 에 test 스크립트를 만들고 CI 에 단계를 추가할 것.',
  )
})
