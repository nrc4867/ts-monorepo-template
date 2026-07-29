import { createORPCClient } from '@orpc/client';
import type { AnyContractRouter, ContractRouterClient } from '@orpc/contract';
import { ResponseValidationPlugin } from '@orpc/contract/plugins';
import { OpenAPILink } from '@orpc/openapi-client/fetch';

import { env } from '../env.js';

// Every service/*-client.ts builds its typed client from this — the URL and
// the per-call fetch lookup (see its comment below) only need to be right
// in one place.
export function createApiClient<T extends AnyContractRouter>(contract: T): ContractRouterClient<T> {
  const link = new OpenAPILink(contract, {
    url: env.VITE_API_URL,
    // Looked up per-call (not captured once at link-construction time) so
    // tests can stub the global `fetch` the same way every other
    // service/*-client.ts test in this repo does.
    fetch: (request, init) => fetch(request, init),
    plugins: [new ResponseValidationPlugin(contract)],
  });

  return createORPCClient(link);
}
