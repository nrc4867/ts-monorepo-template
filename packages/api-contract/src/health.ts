import { oc } from '@orpc/contract';
import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

// oRPC contract: the single source of truth for this endpoint's method, path,
// and request/response shape. Framework-free — this file never imports
// express or any server/client runtime, so apps/server implements it and
// apps/web consumes it without either depending on the other. See
// AGENTS.md's "API endpoints" section for the full pattern.
export const healthContract = oc
  .route({ method: 'GET', path: '/health' })
  .output(healthResponseSchema);
