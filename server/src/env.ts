import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

dotenv.config({ path: resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3003),
  CHAT_MONTHLY_BUDGET_USD: z.coerce.number().positive().default(173),
  // 💸 실습실·「내 차례」가 쓰는 AI 의 월 지출 상한(USD). 🚨 Render env 로 **무배포** 조정한다.
  //    기본 30 = 6강 전체 × 3개 반(최대 사용량 ≈ $7.6)의 약 4배 여유(2026-08-15 jery 확정).
  //    상한은 정상 사용을 막으려는 게 아니라 **사고 시 손실을 끊으려는 것**이다 —
  //    이 화면은 로그인이 없어서, 참여 코드로 토큰을 다시 받으면 1인 한도가 우회된다.
  LAB_MONTHLY_BUDGET_USD: z.coerce.number().positive().default(30),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  HMAC_SECRET: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
