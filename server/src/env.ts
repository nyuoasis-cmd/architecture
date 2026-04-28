import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

dotenv.config({ path: resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3003),
  CHAT_MONTHLY_BUDGET_USD: z.coerce.number().positive().default(173),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  HMAC_SECRET: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
