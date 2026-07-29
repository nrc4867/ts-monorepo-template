import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchHealth } from '../health-client.js';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
}

describe('fetchHealth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses the server response through the shared api-contract schema', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 'ok' })));

    await expect(fetchHealth()).resolves.toEqual({ status: 'ok' });
  });

  it('rejects a response that violates the shared schema', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 'down' })));

    await expect(fetchHealth()).rejects.toThrow();
  });
});
