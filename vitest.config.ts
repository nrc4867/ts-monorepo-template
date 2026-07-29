import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, type Plugin } from 'vitest/config'

// Each app's own vite.config.ts (or tsconfig + tsc-alias, for the server)
// maps '@/*' to that app's own './src/*' — but this root Vitest run doesn't
// go through either app's per-app config, and a plain `resolve.alias` can't
// point '@' at two different directories depending on which app the
// importing file belongs to. This plugin does that per-importer resolution:
// it rewrites '@/...' to the right app's absolute src path based on where
// the importing file lives, then hands off to Vite's normal resolver
// (`skipSelf: true`) so '@/foo.js' still correctly resolves to 'foo.ts' the
// same way a bare relative import would.
function perAppAtAlias(): Plugin {
  const roots = [
    {
      match: 'apps/web/',
      srcDir: fileURLToPath(new URL('./apps/web/src/', import.meta.url)),
    },
    {
      match: 'apps/server/',
      srcDir: fileURLToPath(new URL('./apps/server/src/', import.meta.url)),
    },
  ]

  return {
    name: 'per-app-at-alias',
    resolveId(source, importer, options) {
      if (!source.startsWith('@/') || !importer) return null
      const normalizedImporter = importer.replaceAll('\\', '/')
      const root = roots.find((r) => normalizedImporter.includes(r.match))
      if (!root) return null
      const resolved = path.join(root.srcDir, source.slice(2))
      return this.resolve(resolved, importer, { ...options, skipSelf: true })
    },
  }
}

export default defineConfig({
  plugins: [perAppAtAlias()],
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
})
