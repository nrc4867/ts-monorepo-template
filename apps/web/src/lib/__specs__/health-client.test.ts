import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchHealth } from '../health-client.js';

describe('fetchHealth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses the server response through the shared api-contract schema', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ status: 'ok' }) }),
    );

    await expect(fetchHealth()).resolves.toEqual({ status: 'ok' });
  });

  it('rejects a response that violates the shared schema', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ status: 'down' }) }),
    );

    await expect(fetchHealth()).rejects.toThrow();
  });
});
