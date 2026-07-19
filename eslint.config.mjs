import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import checkFilePlugin from 'eslint-plugin-check-file';
import i18nextPlugin from 'eslint-plugin-i18next';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
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
      // Escape hatch: an explicit disable comment for the rare case (e.g. a
      // hardcoded log-only label).
      'i18next/no-literal-string': ['error', { mode: 'jsx-only' }],
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
      'i18next/no-literal-string': ['error', { mode: 'jsx-only' }],
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
  prettierConfig,
);
