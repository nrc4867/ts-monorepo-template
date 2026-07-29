import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import checkFilePlugin from 'eslint-plugin-check-file';
import i18nextPlugin from 'eslint-plugin-i18next';
import importXPlugin from 'eslint-plugin-import-x';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import vitestPlugin from '@vitest/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/dist-node/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/coverage/**',
      // Plop templates — contain raw Handlebars syntax, not valid TS/JSON.
      'turbo/generators/templates/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    // typescript-eslint's own eslint-recommended override turns `no-undef`
    // off, since type-aware linting already catches undefined identifiers —
    // but that override only targets .ts/.tsx/.mts/.cts (see
    // typescript-eslint/eslint-recommended's `files`), so plain Node scripts
    // (.mjs) still need it disabled explicitly, or referencing `process`/
    // `console` trips it despite full type info being available.
    files: ['**/*.mjs'],
    rules: {
      'no-undef': 'off',
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // Vite/build config files aren't part of any app's tsconfig `include` —
          // lint them in an isolated default project rather than adding a
          // tsconfig just for config files. Add new entries here as needed;
          // typescript-eslint caps this at a handful of files for perf reasons.
          allowDefaultProject: ['apps/web/vite.config.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // strictTypeChecked's default rejects ANY non-string type in a
      // template literal, including numbers/booleans, which always
      // stringify exactly as expected (`` `${count}` ``) and can never
      // produce the "[object Object]"-style bug this rule exists to catch.
      // Loosen it to allow those two primitive cases explicitly rather than
      // requiring a `.toString()` on every interpolated number/boolean; it
      // still flags objects, arrays, and anything with a custom/unsafe
      // `toString`.
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    ignores: [
      // Framework-mandated filenames that can't be renamed.
      '**/next-env.d.ts',
      '**/*.config.{js,mjs,cjs,ts}',
    ],
    plugins: {
      'check-file': checkFilePlugin,
    },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.{ts,tsx,js,jsx,mjs,cjs}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ui-components/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      // No inline styles by default — use colocated CSS Modules. Genuine
      // computed/dynamic styles are still possible via an explicit
      // `// eslint-disable-next-line react/forbid-dom-props` comment.
      'react/forbid-dom-props': ['error', { forbid: ['style'] }],
      // Exporting a non-component (a constant, a hook, a type) from the same
      // file as a component silently breaks Vite's Fast Refresh — no error,
      // the file just falls back to a full reload on every edit. 'warn', not
      // 'error': it's a dev-experience footgun, not a correctness bug, so it
      // shouldn't block a build. allowConstantExport covers the common
      // pattern of a context file exporting both a component and its
      // `const FooContext = createContext(...)`.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    // i18next only applies where apps/web actually initializes it — never in
    // the publishable component package (see packages/ui-components' import
    // restrictions below), and it's opt-in per-app rather than global.
    files: ['apps/web/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    plugins: {
      i18next: i18nextPlugin,
    },
    rules: {
      // No inline user-facing text — route it through react-i18next's t().
      // mode: 'jsx-text-only' (not 'jsx-only') means this only checks text
      // nodes between JSX tags, not every JSX attribute value — 'jsx-only'
      // also flagged prop values that are never shown to a user (style
      // shorthand like c="dimmed", route paths, enum-like values such as
      // value="document"), which in practice produced far more noise than
      // signal and had to be worked around with extracted constants or
      // disable comments on every such prop. Escape hatch for genuine
      // hardcoded text: an explicit disable comment (e.g. a log-only label).
      'i18next/no-literal-string': ['error', { mode: 'jsx-text-only' }],
    },
  },
  {
    // packages/ui-components must be usable by any consumer, so it can't
    // assume react-i18next is configured or that particular env vars exist —
    // see that package's README for the full rationale. Applies to tests too.
    files: ['packages/ui-components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [{ name: 'react-i18next' }, { name: 'i18next' }] },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'packages/ui-components must not read env vars — see its README.',
        },
      ],
    },
  },
  {
    // Same detector as apps/web's block above, repurposed: this package
    // can't depend on i18next, but a hardcoded JSX label is still a bug here
    // — it should have come in as a prop. Excludes tests, where literal
    // strings are normal (`render(<Button>Click me</Button>)` isn't
    // user-facing copy).
    files: ['packages/ui-components/**/*.tsx'],
    ignores: ['**/*.test.tsx'],
    plugins: {
      i18next: i18nextPlugin,
    },
    rules: {
      'i18next/no-literal-string': ['error', { mode: 'jsx-text-only' }],
    },
  },
  {
    files: ['apps/server/**/*.ts'],
    rules: {
      // No console.* at all here (not even warn/error) — apps/server has a
      // real logger (src/logger.ts, pino); use that instead.
      'no-console': 'error',
    },
  },
  {
    // Test-structure lint, not type-aware — catches mistakes the type
    // checker can't: a committed `.only`/`.skip` that silently disables the
    // rest of a suite in CI, a `describe`/`it` with no assertions, a
    // duplicated test title, etc.
    files: ['apps/*/src/**/*.test.{ts,tsx}', 'packages/*/src/**/*.test.{ts,tsx}'],
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      // recommended leaves this at 'warn'; a skipped test is exactly as
      // silent a CI gap as a focused one (already 'error' above), so treat
      // it the same.
      'vitest/no-disabled-tests': 'error',
    },
  },
  {
    // TS project references already make a *cross-package* import cycle a
    // hard `tsc -b` build failure, but that check doesn't look inside a
    // single package — two files importing each other within the same
    // src/ compiles fine and can still blow up at runtime ("cannot access X
    // before initialization") or silently import a partially-evaluated
    // module, depending on evaluation order. This is the intra-package
    // check import-x/no-cycle exists for. It's a whole-import-graph
    // traversal per file, so it's one of the slower rules here — worth
    // watching if a package's src/ grows a lot.
    files: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
    plugins: {
      'import-x': importXPlugin,
    },
    settings: {
      ...importXPlugin.flatConfigs.typescript.settings,
    },
    rules: {
      'import-x/no-cycle': 'error',
    },
  },
  prettierConfig,
);
