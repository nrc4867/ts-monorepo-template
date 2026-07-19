import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.test.{ts,tsx}', 'apps/*/src/**/*.test.{ts,tsx}'],
    environment: 'node',
    // Without this, Vitest stubs every *.module.scss import as a Proxy that
    // resolves ANY property access to a fake hashed string — including keys
    // that aren't real classes in the file. That breaks classNames' raw
    // pass-through behavior in tests (see class-names.ts) and doesn't match
    // real bundler output, so process CSS for real instead of stubbing it.
    css: true,
    coverage: {
      provider: 'v8',
      // No thresholds here on purpose — coverage is reported (see
      // .github/workflows/ci.yml's PR comment step), not enforced as a gate.
      include: ['apps/*/src/**', 'packages/*/src/**'],
      exclude: ['**/__specs__/**', '**/*.d.ts'],
      reporter: ['text', 'json-summary', 'json'],
    },
  },
});
