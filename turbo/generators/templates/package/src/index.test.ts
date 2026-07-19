import { describe, expect, it } from 'vitest';

import { placeholder } from './index.js';

describe('{{name}}', () => {
  it('exists', () => {
    expect(placeholder).toBe(true);
  });
});
