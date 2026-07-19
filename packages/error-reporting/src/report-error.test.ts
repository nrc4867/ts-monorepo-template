import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reportError } from './report-error.js';

describe('reportError', () => {
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('logs the error and context', () => {
    const error = new Error('boom');
    reportError(error, { userId: '123' });

    expect(consoleErrorSpy).toHaveBeenCalledWith(error, { userId: '123' });
  });
});
