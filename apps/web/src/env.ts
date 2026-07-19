import { z } from 'zod';

// Vite only exposes import.meta.env keys prefixed with VITE_ to client code;
// add those here as needed (e.g. VITE_API_URL: z.string().url()).
const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(import.meta.env);
