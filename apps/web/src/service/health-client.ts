import { healthContract, type HealthResponse } from '@project/api-contract';

import { createApiClient } from './api-client.js';

const client = createApiClient(healthContract);

export function fetchHealth(): Promise<HealthResponse> {
  return client();
}
