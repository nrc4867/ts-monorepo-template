import { config } from 'dotenv';
import { z } from 'zod';

config({ quiet: true }); // loads .env into process.env if present; no-op otherwise

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
