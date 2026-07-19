import { z } from 'zod';

// Vite only exposes import.meta.env keys prefixed with VITE_ to client code.
const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']),
  VITE_API_URL: z.url().default('http://localhost:3000'),
});

export const env = envSchema.parse(import.meta.env);
