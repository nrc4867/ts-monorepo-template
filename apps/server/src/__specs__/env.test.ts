import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('defaults PORT to 3000 when unset', async () => {
    delete process.env.PORT;
    const { env } = await import('../env.js');

    expect(env.PORT).toBe(3000);
  });
});
