import { type HealthResponse, healthResponseSchema } from '@project/api-contract';

import { env } from '../env.js';

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${env.VITE_API_URL}/health`);
  return healthResponseSchema.parse(await response.json());
}
