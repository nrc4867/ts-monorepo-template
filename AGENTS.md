# Repo conventions

pnpm workspace + Turborepo monorepo. Libraries live in `packages/*`, deployable apps in
`apps/*`. Each has its own `package.json` and a `tsconfig.json` that extends the root
`tsconfig.base.json`.

`docker-compose.yml` is for stateful local infra only (a database, if/when one is added)
— the apps themselves always run natively via `pnpm dev`, not in a container.

## Commands

Run from the repo root (Turbo fans these out to every workspace package):

- `pnpm build` — `tsc -b` per package
- `pnpm typecheck` — typecheck without emitting
- `pnpm lint` / `pnpm lint:fix` — ESLint (flat config, `typescript-eslint` strictTypeChecked)
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm test` — Vitest, run once from the root (not per-package)
- `pnpm dev` — long-running dev tasks across packages

## Adding a package or app

1. Create `packages/<name>` (or `apps/<name>`) with a `package.json` (`build`/`typecheck`/
   `lint`/`clean` scripts matching `packages/example`) and a `tsconfig.json` extending
   `../../tsconfig.base.json`.
2. Add `{ "path": "packages/<name>" }` to the root `tsconfig.json` `references` array.
3. Run `pnpm install` to link the new workspace member.

## Filenames

All `.ts`/`.tsx`/`.js`/`.jsx` filenames must be `kebab-case`, starting with a lowercase
letter — including React component files (`base-converter.tsx`, not `BaseConverter.tsx`).
Enforced by `eslint-plugin-check-file`'s `check-file/filename-naming-convention` rule in
`eslint.config.mjs`.

Exceptions (excluded from the rule in `eslint.config.mjs`): `*.config.{js,mjs,cjs,ts}`
files (e.g. `vite.config.ts`, `postcss.config.mjs`) and framework-mandated files like
`next-env.d.ts`. Non-code files (`README.md`, `LICENSE`, `CLAUDE.md`, `AGENTS.md`) aren't
covered by the rule at all since it only targets code extensions. If a new framework
forces another exception, add it to that `ignores` list rather than disabling the rule.

## Styling (React apps)

- No inline styles (`style={{...}}`) and no CSS-in-JS. Use **CSS Modules**, colocated with
  the component: `component-name.tsx` + `component-name.module.css` in the same directory.
- Import as `styles` and reference classes via `styles.foo` — e.g.
  `import styles from './component-name.module.css'` then `<div className={styles.wrapper}>`.
- Shared/global styles (resets, tokens, layout shells) can live outside a component's
  module, but anything component-specific stays in that component's own `.module.css`.
- Enforced by `react/forbid-dom-props` (`eslint.config.mjs`, `apps/web/**` only) — it's an
  `error`, not a warning, so it blocks commits/CI. Genuinely computed/dynamic styles are
  still possible via an explicit `// eslint-disable-next-line react/forbid-dom-props`
  comment on that line — the point is to make each exception visible in review, not to
  forbid inline styles outright.

## Barrel files

Barrel files (`index.ts` re-exporting from a directory) are allowed and encouraged for
clean import paths. Keep barrels thin: re-exports only, no logic, so they stay cheap for
the bundler/type-checker to resolve and don't hide circular dependencies.

## Logging and imports

- Everywhere except `apps/server`: `console.log`/`console.info`/`console.debug` are lint
  errors (`no-console`); `console.warn`/`console.error` are allowed (e.g.
  `packages/error-reporting`'s intentional `console.error` stub).
- **`apps/server` specifically**: no `console.*` at all, not even `warn`/`error` — use
  `logger` from `src/logger.ts` (`pino`) instead. `logger.info`/`warn`/`error`/`debug` are
  all real, structured log levels; `pino-pretty` colorizes output outside
  `NODE_ENV=production`. Import order/grouping is auto-fixed by
  `eslint-plugin-simple-import-sort` — don't hand-arrange imports; run `pnpm lint:fix` and
  let it sort them.

## Error reporting

Errors that reach an `ErrorBoundary` or a top-level catch should go through
`reportError` from `@project/error-reporting` (`packages/error-reporting`) — never a raw
`console.error` at the call site, and never a global `console.error` override. The function
currently just logs; swap its internals for a real backend per project without touching
any caller. `apps/web`'s `error-boundary.tsx` is the reference usage — it calls
`reportError(error, { componentStack })` from `componentDidCatch`.

## Localization (React apps)

- No hardcoded user-facing text in JSX. Use `react-i18next`'s `useTranslation()` and
  `t('key')` — translation strings live in `src/locales/<lang>.json`, nested by feature
  (e.g. `{"app": {"title": "..."}}`).
- `src/i18n.ts` initializes `i18next` with the bundled locale JSON and must be imported
  once, before anything renders — it's the first import in `main.tsx` for that reason.
- Enforced by `i18next/no-literal-string` (`eslint.config.mjs`, `apps/web/**`, JSX-only
  mode) — an `error`, not a warning. The same `// eslint-disable-next-line
i18next/no-literal-string` escape hatch applies for genuine exceptions (see
  `error-boundary.tsx`'s crash fallback, which deliberately avoids depending on i18next).
- Adding a language: add `src/locales/<lang>.json` with the same keys as `en.json`, then
  register it in `src/i18n.ts`'s `resources` object.

## Accessibility (React apps)

`eslint-plugin-jsx-a11y`'s recommended rules are on for `apps/web/**` (missing `alt` text,
invalid ARIA attributes, non-interactive elements with click handlers, etc.). These are
real accessibility bugs, not style preferences — fix the markup rather than disabling the
rule.

## Testing (React apps)

Component tests use `@testing-library/react` + `@testing-library/jest-dom` (see
`app.test.tsx`) — query by role/text the way a user would, not by implementation detail.
Vitest runs `apps/web/**` tests under the `jsdom` environment and everything else under
plain `node` (`vitest.config.ts`'s `environmentMatchGlobs`) — package-level tests don't
pay the jsdom startup cost.

## CI

`.github/workflows/ci.yml` runs `format:check`, `lint`, `typecheck`, `build`, and `test` on
every push to `main` and every PR. This is the actual gate — the local Husky pre-commit
hook only catches issues before they're committed on a machine that has hooks installed;
CI is what actually blocks a bad merge.

## Environment variables

Never read `process.env`/`import.meta.env` directly outside `src/env.ts` — every app has
one, and it's the single source of truth for that app's config:

- **`apps/server/src/env.ts`**: loads `.env` via `dotenv` (`config({ quiet: true })`, a
  no-op if the file doesn't exist), then parses `process.env` through a Zod schema and
  exports the validated result as `env`. Add a new var by adding it to the schema, then
  import `{ env }` wherever it's needed instead of touching `process.env`.
- **`apps/web/src/env.ts`**: parses `import.meta.env` through a Zod schema. Vite only
  exposes `VITE_`-prefixed keys to client code, and only loads `.env` files itself (no
  `dotenv` needed) — Vite-specific built-ins like `MODE` are always present with zero
  setup.
- Both fail fast: an invalid or missing required var throws at import time (Zod's
  `.parse`, not `.safeParse`) rather than surfacing as an obscure runtime bug later.
- `apps/server/.env.example` documents every var the schema expects — keep it in sync
  when the schema changes. `.env` itself is gitignored.

## Path aliases

`@/*` maps to that app's own `src/*` in both `apps/web` and `apps/server` — configured in
each app's `tsconfig.json`/`tsconfig.app.json`, plus `resolve.alias` in `apps/web`'s
`vite.config.ts` and `tsc-alias` (a build-step rewrite) in `apps/server`, since a plain
`tsc -b` build doesn't rewrite path aliases in its output and `apps/server` isn't bundled.
Not mandatory for adjacent files in the same directory (`./env.js` is fine) — reach for
`@/` when importing across subdirectories once an app grows past a flat `src/`.

## Code organization

- One component, class, or logical module per file.
- Extract into its own file when: a function is (or could be) used in more than one
  place; a file exceeds ~250-300 lines; a section has a distinct responsibility from the
  rest of the file; a value is hardcoded in more than one place (→ a constants file); a
  type/interface is used in more than one file (→ a types file).
- Within a package or app's `src/`, group by responsibility as the need arises —
  `components/`, `hooks/`, `lib/`, `constants/`, `types/` — rather than one flat directory
  of files. Don't pre-create empty folders for these; add them when the first file that
  belongs there shows up.
- Search the existing `lib/`/`hooks/`/`utils` in that package before writing a new helper
  — add to what's there instead of inlining a one-off in a feature file.
- No magic numbers or repeated string literals in logic — pull them into a constants file
  with named exports.
- Don't extract an abstraction for a single use site "for later." Three similar lines is
  better than a premature shared helper with one caller.

## Things to know before editing

- TypeScript is strict, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitOverride` — don't silence these with `any`/`!` casts; fix the underlying type.
- ESLint's React/hooks rules only apply under `apps/web/**` — don't assume they're active
  in `packages/*`.
- `eslint-config-prettier` is loaded last, so formatting is Prettier's job, not ESLint's.
  Don't add stylistic ESLint rules — put them in `.prettierrc.json` instead.
- Husky's pre-commit hook runs `lint-staged` (ESLint --fix + Prettier --write on staged
  files only). A commit failing on lint/format issues means those issues are real, not a
  hook bug.
- Test files live next to source as `*.test.ts` under each package's `src/`; the root
  `vitest.config.ts` globs `packages/*/src/**/*.test.ts` and `apps/*/src/**/*.test.ts`.
