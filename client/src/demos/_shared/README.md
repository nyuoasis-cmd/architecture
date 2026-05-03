# _shared/ — 데모 공용 인프라

## Public API
규칙: 데모 컴포넌트는 `_shared/index.ts` 에서만 import 한다.

| Export | 용도 |
|---|---|
| `PairFlow` | 4~5칸 시퀀스 메타포↔IT 병치 |
| `PairBinary` | 2개 비교 메타포↔IT 병치 |
| `PairMatch` | 역할 매핑 메타포↔IT 병치 |
| `PairVertical` | 수직 계층 메타포≈IT 병치 |
| `IconCard`, `ZonePanel` | 카드 primitive |
| `Hero`, `PairConnector`, `GroupBadge`, `LogBox`, `StateChips` | 공용 chrome primitive |
| `getTone(chapter)` | 챕터 accent 토큰 |
| `LABEL_RULES`, `validateLabel`, `validatePairSet` | 라벨 및 세트 검증 |
| `Icons.*` | 공용 SVG 아이콘 |

## Props

### `PairFlow`

| Prop | Type |
|---|---|
| `metaphorTitle` | `string` |
| `itTitle` | `string` |
| `metaphor` | `PairItem[]` |
| `it` | `PairItem[]` |
| `activeIndex` | `number` |
| `tone` | `Tone` |

### `PairBinary`

| Prop | Type |
|---|---|
| `metaphorTitle` | `string` |
| `itTitle` | `string` |
| `metaphorLeft` | `PairItem & { cards?: string[] }` |
| `metaphorRight` | `PairItem & { cards?: string[] }` |
| `itLeft` | `PairItem` |
| `itRight` | `PairItem` |
| `leftActive` | `boolean` |
| `rightActive` | `boolean` |
| `tone` | `Tone` |

### `PairMatch`

`PairFlow` 와 동일한 props 를 사용한다.

### `PairVertical`

| Prop | Type |
|---|---|
| `metaphorTitle` | `string` |
| `itTitle` | `string` |
| `pairs` | `Array<{ metaphor: PairItem; it: PairItem }>` |
| `activeIndex` | `number` |
| `tone` | `Tone` |

## 사용 예

```tsx
import { PairFlow, getTone, Icons, validatePairSet } from '../_shared';

const tone = getTone(1);
const metaphor = [
  { icon: <Icons.IngredientsIcon />, label: '재료', sub: '면·물·스프' },
  { icon: <Icons.PotIcon />, label: '냄비', sub: '잠깐 올려두기' },
];
const it = [
  { icon: <Icons.KeyboardIcon />, label: '입력', sub: '바깥에서 들어옴' },
  { icon: <Icons.RamIcon />, label: '메모리', sub: '작업 중 보관' },
];

validatePairSet(metaphor, it, { layout: 'wide', subPolicy: 'all' });
```

## DO/DON'T

### DO
- `import { ... } from '../_shared'` 만 사용한다.
- 색상은 `var(--demo-...)` 토큰으로만 참조한다.
- 모듈 선언 시 `validatePairSet(...)` 으로 라벨 규약을 검증한다.
- 챕터 파일은 `const TONE = getTone(N)` 패턴으로 톤을 일원화한다.

### DON'T
- `_shared/pair-block` 같은 내부 경로를 직접 import 하지 않는다.
- `'#ea580c'` 같은 raw hex 를 TS/TSX 안에 두지 않는다.
- 챕터 파일에서 local `TONE` 객체를 직접 만들어 사용하지 않는다 (`getTone(N)` 사용).
