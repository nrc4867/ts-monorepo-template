# Tooling, environment, and misc gotchas

## Logging and imports

- Everywhere except `apps/server`: `console.log`/`console.info`/`console.debug` are lint
  errors (`no-console`); `console.warn`/`console.error` are allowed (e.g.
  `apps/web/src/service/report-error.ts`'s intentional `console.error` stub).
- **`apps/server` specifically**: no `console.*` at all, not even `warn`/`error` — use
  `logger` from `src/logger.ts` (`pino`) instead. `logger.info`/`warn`/`error`/`debug` are
  all real, structured log levels; `pino-pretty` colorizes output outside
  `NODE_ENV=production`. Import order/grouping is auto-fixed by
  `eslint-plugin-simple-import-sort` — don't hand-arrange imports; run `pnpm lint:fix` and
  let it sort them.

## CI

`.github/workflows/ci.yml` runs `format:check`, `lint`, `typecheck`, `build`, and
`test:coverage` on every push to `main` and every PR. This is the actual gate — the local
Husky pre-commit hook only catches issues before they're committed on a machine that has
hooks installed; CI is what actually blocks a bad merge.

On PRs, `davelosert/vitest-coverage-report-action` posts/updates a sticky comment with a
per-file coverage table from that same `test:coverage` run (frontend, backend, and every
package — one root Vitest config covers all of them). There's no coverage threshold
anywhere in `vitest.config.ts` — this is deliberately informational, not a merge gate.

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

The root `vitest.config.ts` repeats `apps/web`'s `@` alias in its own `resolve.alias`,
since a root-level Vitest run doesn't go through any single app's `vite.config.ts` — if a
test can't resolve a `@/...` import, check that alias is still there before assuming
anything else is wrong.

## Dependency version ceilings

`typescript` is pinned to the 6.x line and `eslint` to the 9.x line — not an oversight,
a hard peer-dependency wall. `typescript-eslint@8.x` (the latest release) only supports
`typescript <6.1.0`, and `eslint-plugin-react`/`eslint-plugin-jsx-a11y` (also latest)
only support `eslint ^9.x`. Bumping either past those ceilings breaks linting outright
(confirmed: TS 7 crashes typescript-eslint's internals; ESLint 10 crashes
`eslint-plugin-react`'s `react/display-name` rule). Check whether those plugins have
caught up before trying again — don't just bump the version because Dependabot suggests
it.

## Things to know before editing

- TypeScript is strict, plus `noUncheckedIndexedAccess`, `noImplicitOverride` — don't
  silence these with `any`/`!` casts; fix the underlying type.
- `eslint-plugin-import-x`'s `no-cycle` runs across every `apps/*/src` and `packages/*/src`
  TS/TSX file, backed by `eslint-import-resolver-typescript` — a genuine import cycle
  between two files fails lint, it isn't just a style nit.
- ESLint's React/hooks rules only apply under `apps/web/**` — don't assume they're active
  in `packages/*`.
- `eslint-config-prettier` is loaded last, so formatting is Prettier's job, not ESLint's.
  Don't add stylistic ESLint rules — put them in `.prettierrc.json` instead.
- Husky's pre-commit hook runs `lint-staged` (ESLint --fix + Prettier --write on staged
  files only). A commit failing on lint/format issues means those issues are real, not a
  hook bug.
- Test files live next to source as `*.test.ts` under each package's `src/`; the root
  `vitest.config.ts` globs `packages/*/src/**/*.test.ts` and `apps/*/src/**/*.test.ts`.
