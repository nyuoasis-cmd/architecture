import type { MiniLab } from '../../lib/mini-lab';
import { CH01_MINI_LAB } from './ch01';
import { CH05_MINI_LAB } from './ch05';
import { CH08_MINI_LAB } from './ch08';
import { CH11_MINI_LAB } from './ch11';
import { CH19_MINI_LAB } from './ch19';
import { CH21_MINI_LAB } from './ch21';
import { CH23_MINI_LAB } from './ch23';

/**
 * 미니 실습실 등록부 — 키는 속 이름표(chapter.id).
 * 🚨 여기 등록되는 강은 experience.ts 의 terminal/composite 배정과 일치해야 한다(miniLabContract).
 *    12강(ch18)은 여기 없다 — 그 강은 큰 실습실(lab-shell/LabTab)을 그대로 쓴다.
 */
export const MINI_LABS: Record<number, MiniLab> = {
  1: CH01_MINI_LAB,
  5: CH05_MINI_LAB,
  8: CH08_MINI_LAB,
  11: CH11_MINI_LAB,
  19: CH19_MINI_LAB,
  21: CH21_MINI_LAB,
  23: CH23_MINI_LAB,
};

export function getMiniLab(chapterId: number): MiniLab | undefined {
  return MINI_LABS[chapterId];
}
