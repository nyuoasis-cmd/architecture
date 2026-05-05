import ch01_q01 from './ch01_q01';
import ch01_q02 from './ch01_q02';
import ch01_q03 from './ch01_q03';
import ch01_q04 from './ch01_q04';
import ch02_q01 from './ch02_q01';
import ch02_q02 from './ch02_q02';
import ch02_q03 from './ch02_q03';
import ch02_q04 from './ch02_q04';
import ch03_q01 from './ch03_q01';
import ch03_q02 from './ch03_q02';
import ch03_q03 from './ch03_q03';
import ch03_q04 from './ch03_q04';
import ch03_q05 from './ch03_q05';
import ch03_q06 from './ch03_q06';
import ch03_q07 from './ch03_q07';
import ch04_q01 from './ch04_q01';
import ch04_q02 from './ch04_q02';
import ch04_q03 from './ch04_q03';
import ch04_q04 from './ch04_q04';
import ch04_q05 from './ch04_q05';
import ch04_q06 from './ch04_q06';
import ch04_q07 from './ch04_q07';
import ch05_q01 from './ch05_q01';
import ch05_q02 from './ch05_q02';
import ch05_q03 from './ch05_q03';
import ch05_q04 from './ch05_q04';
import ch05_q05 from './ch05_q05';
import ch05_q06 from './ch05_q06';
import ch05_q07 from './ch05_q07';
import ch06_q01 from './ch06_q01';
import ch06_q02 from './ch06_q02';
import ch06_q04 from './ch06_q04';
import ch06_q05 from './ch06_q05';
import ch06_q06 from './ch06_q06';
import ch06_q07 from './ch06_q07';
import ch06_q08 from './ch06_q08';
import ch06_q09 from './ch06_q09';
import ch06_q10 from './ch06_q10';
import ch07_q01 from './ch07_q01';
import ch07_q02 from './ch07_q02';
import ch07_q03 from './ch07_q03';
import ch07_q04 from './ch07_q04';
import ch07_q05 from './ch07_q05';
import ch07_q06 from './ch07_q06';
import ch08_q01 from './ch08_q01';
import ch08_q02 from './ch08_q02';
import ch08_q03 from './ch08_q03';
import ch08_q04 from './ch08_q04';
import ch08_q05 from './ch08_q05';
import ch08_q06 from './ch08_q06';
import ch08_q07 from './ch08_q07';
import ch09_q01 from './ch09_q01';
import ch09_q02 from './ch09_q02';
import ch09_q03 from './ch09_q03';
import ch09_q04 from './ch09_q04';
import ch09_q05 from './ch09_q05';
import ch09_q06 from './ch09_q06';
import ch10_q01 from './ch10_q01';
import ch10_q02 from './ch10_q02';
import ch10_q03 from './ch10_q03';
import ch10_q04 from './ch10_q04';
import ch10_q05 from './ch10_q05';
import ch10_q06 from './ch10_q06';
import ch10_q07 from './ch10_q07';
import { teacherExplainBlockSchema, type TeacherExplainBlock } from './types';

const RAW_BLOCKS = {
  ch01_q01,
  ch01_q02,
  ch01_q03,
  ch01_q04,
  ch02_q01,
  ch02_q02,
  ch02_q03,
  ch02_q04,
  ch03_q01,
  ch03_q02,
  ch03_q03,
  ch03_q04,
  ch03_q05,
  ch03_q06,
  ch03_q07,
  ch04_q01,
  ch04_q02,
  ch04_q03,
  ch04_q04,
  ch04_q05,
  ch04_q06,
  ch04_q07,
  ch05_q01,
  ch05_q02,
  ch05_q03,
  ch05_q04,
  ch05_q05,
  ch05_q06,
  ch05_q07,
  ch06_q01,
  ch06_q02,
  ch06_q04,
  ch06_q05,
  ch06_q06,
  ch06_q07,
  ch06_q08,
  ch06_q09,
  ch06_q10,
  ch07_q01,
  ch07_q02,
  ch07_q03,
  ch07_q04,
  ch07_q05,
  ch07_q06,
  ch08_q01,
  ch08_q02,
  ch08_q03,
  ch08_q04,
  ch08_q05,
  ch08_q06,
  ch08_q07,
  ch09_q01,
  ch09_q02,
  ch09_q03,
  ch09_q04,
  ch09_q05,
  ch09_q06,
  ch10_q01,
  ch10_q02,
  ch10_q03,
  ch10_q04,
  ch10_q05,
  ch10_q06,
  ch10_q07,
};

export const TEACHER_EXPLAIN: Record<string, TeacherExplainBlock> = {};

for (const [qaId, raw] of Object.entries(RAW_BLOCKS)) {
  const result = teacherExplainBlockSchema.safeParse(raw);
  if (result.success) {
    TEACHER_EXPLAIN[qaId] = result.data;
  } else {
    console.error(`[teacher-explain] schema fail for ${qaId}:`, result.error.format());
  }
}

export function getTeacherExplainBlock(qaId: string): TeacherExplainBlock | null {
  return TEACHER_EXPLAIN[qaId] ?? null;
}
