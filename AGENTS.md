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
   `lint`/`clean` scripts matching `packages/api-contract`) and a `tsconfig.json` extending
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

## File layout: tests and styles

Every `src/` in this repo (every app, every package — no exceptions) puts tests in a
`__specs__/` subdirectory and stylesheets in a `styles/` subdirectory, next to the file they
belong to, rather than colocating either one directly beside its source file:

```
src/service/health-client.ts
src/service/__specs__/health-client.test.ts

src/components/app/app.tsx
src/components/app/__specs__/app.test.tsx
src/components/app/styles/app.module.scss
```

Import with a relative path (`../health-client.js` from the test, `./styles/app.module.scss`
from the component). This is a repo-wide, uniform rule, not a components-only special case
— one convention, applied identically everywhere, is what keeps any two packages navigable
the same way and makes a misplaced file an obvious mistake rather than a judgment call.
**Enforced** by `scripts/check-file-layout.mjs` (`pnpm lint:structure`, part of `pnpm
lint`/`pnpm check`), which walks every `apps/*/src` and `packages/*/src` and fails the build
on any `*.test.ts(x)` or `*.module.scss` that isn't inside its required subdirectory —
ESLint can't express "this file must live in that folder" for non-JS files (`.scss` isn't
even linted), hence a small standalone script instead of a lint rule.

## Components and styling (React apps)

- **One directory per component.** `src/components/<name>/` holds everything for that
  component — the component itself and its `__specs__/`/`styles/` subdirectories per the
  layout rule above. No barrel `index.ts` here: nothing imports a component from outside
  its own directory, so there's no package-boundary reason to add one — import
  `./components/<name>/<name>.js` directly (see `packages/*/src/index.ts` below for where
  a barrel _is_ load-bearing). A component with distinct sub-parts can have its own further
  subdirectories under that same directory — keep the whole thing self-contained rather
  than spreading pieces across `src/`.
- No inline styles (`style={{...}}`) and no CSS-in-JS. Use **SCSS Modules** (`.module.scss`,
  not plain `.module.css` — `sass` is a devDependency of `apps/web` and any component
  package specifically so nesting/variables work).
- **Class naming**: every class is either a component class, prefixed `c-` (e.g. `c-button`,
  or `c-button-icon` for a sub-part), or a modifier, prefixed `m-` (e.g. `m-primary`),
  applied alongside a `c-` class rather than replacing it. Enforced by `stylelint`
  (`stylelint.config.mjs`'s `selector-class-pattern`) — a hard error, same severity as the
  ESLint rules below.
- **Modifiers nest under the component rule they modify** — `.c-button { &.m-primary { ... } }`,
  not `.c-button { ... }` and `.m-primary { ... }` as separate top-level rules. A modifier
  never applies on its own (the component always renders both classes together — see
  `packages/ui-components/src/components/button/button.tsx`), so the SCSS nesting should
  say that directly instead of leaving the pairing implicit.
- **A component's styles are its own.** Don't reach into another component's
  `.module.scss` or write a selector targeting another component's `c-`/`m-` class from
  outside that component's own file — CSS Modules' hashing already prevents accidental
  collisions, but the `c-`/`m-` naming makes a deliberate cross-component override
  obviously wrong in review, since a `.c-other-thing` rule has no reason to exist outside
  `other-thing`'s own module.
- Import the compiled module as `styles`, then resolve classes through `classNames` from
  `@project/ui-components` (see its doc comment for the full API) rather than bracket
  notation — `apps/web` depends on that package for exactly this reason, not just for its
  components.
- Shared/global styles (resets, tokens, layout shells) can live outside any single
  component's module, but anything component-specific stays in that component's own
  `.module.scss`.
- Enforced by `react/forbid-dom-props` (`eslint.config.mjs`, `apps/web/**` and
  `packages/ui-components/**`) — it's an `error`, not a warning, so it blocks commits/CI.
  Genuinely computed/dynamic styles are still possible via an explicit
  `// eslint-disable-next-line react/forbid-dom-props` comment on that line — the point is
  to make each exception visible in review, not to forbid inline styles outright.
- `pnpm lint:styles` runs `stylelint` across every `.css`/`.scss` file in the repo (also
  part of `pnpm lint` and `pnpm check`); `stylelint --fix` is wired into the Husky
  pre-commit hook via `lint-staged` the same way ESLint/Prettier are.

## Barrel files

`packages/*/src/index.ts` is a required barrel, not a style choice — each package's
`package.json` points `main`/`types` at `dist/index.js`/`dist/index.d.ts`, so it's the
actual module resolution entry point for anything importing `@project/<name>`. Keep it
thin: re-exports only, no logic, so it stays cheap to resolve and doesn't hide circular
dependencies.

Don't add a barrel anywhere else "for consistency." A directory only needs one if
something outside it needs a single import path into it — e.g. a package's public API.
`src/components/<name>/` doesn't qualify (nothing imports a component from outside its
own directory), which is why those don't have one — see "Components and styling" above.

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

## Sharing types between apps (`packages/api-contract`)

Any request/response shape that crosses the network boundary between `apps/web` and
`apps/server` gets defined once, in `packages/api-contract`, as a Zod schema plus its
`z.infer`'d type — never redefined separately on each side. `apps/server` parses its own
outgoing responses through the schema (so a handler that drifts from its contract fails
loudly instead of silently), and `apps/web` imports the same inferred type for whatever
consumes that response (see `apps/web/src/service/health-client.ts` and
`apps/server/src/app.ts`'s `/health` route for the reference pair). Add a new contract as
`packages/api-contract/src/<name>.ts`, re-export it from that package's `index.ts`.

## Publishable common components (`packages/ui-components`)

Components meant to be reusable outside this specific project (eventually published to a
registry, not just consumed via the workspace) live in `packages/ui-components`, not
`apps/web`. Because a published package can't assume anything about the app that installs
it:

- No `react-i18next`/`i18next` — text comes in via props/children only. No env vars either.
  Both are hard `eslint.config.mjs` restrictions scoped to `packages/ui-components/**`
  (`no-restricted-imports`, `no-restricted-properties`), not just convention.
- `react`/`react-dom` are `peerDependencies`, not `dependencies` — the consuming app
  supplies React.
- Same one-directory-per-component + SCSS Modules + `c-`/`m-` convention as `apps/web`
  (see above) — `src/components/button/` is the reference component.
- `tsc -b` doesn't copy `.module.scss` into `dist/`; `scripts/copy-styles.mjs` (a
  `fs.cpSync` copy, no bundler needed) runs as an extra `build` step for that reason.

## Error reporting

Errors that reach an `ErrorBoundary` or a top-level catch should go through `reportError`
from `apps/web/src/service/report-error.ts` — never a raw `console.error` at the call site,
and never a global `console.error` override. The function currently just logs; swap its
internals for a real backend (Sentry, Bugsnag, your own endpoint) without touching any
caller. `error-boundary.tsx` is the reference usage — it calls
`reportError(error, { componentStack })` from `componentDidCatch`.

This lives in `apps/web` itself rather than a workspace package: it has exactly one
consumer (`apps/web`'s `ErrorBoundary`) and nothing crosses an app boundary, so a package
would just be `package.json`/`tsconfig.json`/build-step ceremony around one function. If
`apps/server` ever needs the same "single seam to swap the backend" property for its own
errors, that's a separate concern — it already has `logger` (`src/logger.ts`, `pino`) for
structured server-side logging, which isn't the same thing as reporting client-visible
errors to an external service.

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

## Dependency version ceilings

`typescript` is pinned to the 6.x line and `eslint` to the 9.x line — not an oversight,
a hard peer-dependency wall. `typescript-eslint@8.x` (the latest release) only supports
`typescript <6.1.0`, and `eslint-plugin-react`/`eslint-plugin-jsx-a11y` (also latest)
only support `eslint ^9.x`. Bumping either past those ceilings breaks linting outright
(confirmed: TS 7 crashes typescript-eslint's internals; ESLint 10 crashes
`eslint-plugin-react`'s `react/display-name` rule). Check whether those plugins have
caught up before trying again — don't just bump the version because Dependabot suggests
it.

## Code organization

- One component, class, or logical module per file.
- Extract into its own file when: a function is (or could be) used in more than one
  place; a file exceeds ~250-300 lines; a section has a distinct responsibility from the
  rest of the file; a value is hardcoded in more than one place (→ a constants file); a
  type/interface is used in more than one file (→ a types file).
- Within a package or app's `src/`, group by responsibility as the need arises rather than
  one flat directory of files. Don't pre-create empty folders for these; add them when the
  first file that belongs there shows up. This is guidance for picking a consistent name,
  not an enforced rule (nothing lints directory names) — a couple of loosely-related files
  aren't worth relocating over:
  - `hooks/` — custom React hooks (`apps/web` and any component package).
  - `service/` — modules that talk to an external API/webservice (see
    `apps/web/src/service/health-client.ts` for the reference example).
  - `utils/` — generic, pure helper functions with no external side effects (parsing,
    formatting, that kind of thing).
  - `constants/` / `types/` — shared constants and shared types, respectively.
  - `lib/` — anything domain-specific that doesn't fit one of the more specific names above.
- Search the existing `hooks/`/`service/`/`utils`/`lib/` in that package before writing a
  new helper — add to what's there instead of inlining a one-off in a feature file.
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
