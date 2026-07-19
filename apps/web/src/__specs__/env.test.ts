import { describe, expect, it } from 'vitest';

import { env } from '../env.js';

describe('env', () => {
  it('parses MODE from import.meta.env', () => {
    expect(env.MODE).toBe('test');
  });
});
