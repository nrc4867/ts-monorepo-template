import { describe, expect, it } from 'vitest';

import { logger } from '../logger.js';

describe('logger', () => {
  it('exposes standard pino levels', () => {
    expect(logger.info).toBeTypeOf('function');
    expect(logger.warn).toBeTypeOf('function');
    expect(logger.error).toBeTypeOf('function');
  });
});
