import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import checkFilePlugin from 'eslint-plugin-check-file';
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
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
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
  prettierConfig,
);
