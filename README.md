# ts-monorepo-template

A pnpm + Turborepo TypeScript monorepo template with strict TS, ESLint (typescript-eslint, strict type-checked), Prettier, Husky + lint-staged, and Vitest pre-wired.

## Using this template

```sh
npx degit <your-org>/ts-monorepo-template new-project
cd new-project
pnpm install
pnpm build
pnpm dev
```

## What's included

- **pnpm workspaces** (`pnpm-workspace.yaml`) — apps in `apps/*`, libraries in `packages/*`
- **Turborepo** (`turbo.json`) — `build`/`dev`/`lint`/`typecheck`/`test`/`clean` pipelines
- **TypeScript** — `tsconfig.base.json` with strict mode, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`, project references, `composite`
- **ESLint** (`eslint.config.mjs`) — flat config, `typescript-eslint` strictTypeChecked,
  React/hooks rules scoped to `apps/web/**`, `eslint-config-prettier` to defer formatting to Prettier
- **Prettier** (`.prettierrc.json`, `.prettierignore`)
- **Stylelint** (`stylelint.config.mjs`, `.stylelintignore`) — `stylelint-config-standard-scss`
  plus a `c-`/`m-` class-naming rule; see "Components and styling" below
- **Husky + lint-staged** — pre-commit hook runs `eslint --fix` + `prettier --write` on staged files
- **Vitest** (`vitest.config.ts`) — picks up `*.test.{ts,tsx}` under `apps/*/src` and
  `packages/*/src`; `pnpm test:coverage` reports coverage (no threshold enforced) and CI
  posts it as a PR comment (`.github/workflows/ci.yml`)
- **`.editorconfig`** / **`.gitattributes`** — consistent indentation and LF line endings
- **`.nvmrc`** — pins Node 22 (pnpm 11 requires Node ≥ 22.13)

## Running the apps

```sh
pnpm dev
```

Runs every app's `dev` script concurrently via Turborepo: `apps/web` on
[http://localhost:5173](http://localhost:5173) (Vite) and `apps/server` on
[http://localhost:3000](http://localhost:3000) (`tsx watch`, no build step). Check
`apps/server`'s `GET /health` at <http://localhost:3000/health> to confirm it's up.

To run just one:

```sh
pnpm --filter @project/web dev
pnpm --filter @project/server dev
```

`apps/server` reads config from environment variables (see `src/env.ts`) — copy
`apps/server/.env.example` to `apps/server/.env` to override defaults like `PORT` locally.
`.env` is gitignored; `.env.example` is the checked-in reference for what's expected.

**If `pnpm dev` fails with `Failed to resolve import "@project/error-reporting"`** (or any
other workspace package): that package hasn't been built yet. `apps/web`/`apps/server`
import workspace libraries via their `package.json` `main`/`types` fields, which point at
`dist/` — Vite/Node can't resolve the import until that exists. Run `pnpm build` once
(already in the quickstart above) to fix it; you'll hit this again any time you `rm -rf`
a package's `dist/` without rebuilding, or run `pnpm dev` before ever running `pnpm build`.

## Local infrastructure (`docker-compose.yml`)

`docker-compose.yml` is for stateful dependencies only (Postgres, Redis, etc.) — the apps
themselves always run natively via `pnpm dev`, not in a container, since hot-reload and
debugging both work better outside Docker. The file ships commented out since there's no
real dependency yet; uncomment/adjust the example when you add one.

`docker compose up` also auto-merges a gitignored `docker-compose.override.yml` if you
create one (per-developer local tweaks). For a prod deployment, layer an explicit file
instead: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up`.

## Scaffolding a new package

```sh
pnpm gen package
```

Runs `turbo gen`'s `package` generator: prompts for a kebab-case name, scaffolds a new
library in `packages/<name>` (mirrors `packages/api-contract`), adds it to the root
`tsconfig.json` `references` array automatically, and reminds you to run `pnpm install`
afterward to link the new workspace member. The generator definition lives in
`turbo/generators/config.ts`; the files it copies are in `turbo/generators/templates/`.

There's no `app-web` or `app-server` generator — most projects only ever need the one
`apps/web` and one `apps/server` that already exist, unlike packages (utils, schemas, a
client SDK, etc.), which you genuinely create more of over a project's life. Copy
`apps/web` or `apps/server` by hand (see below) in the rare case you need a second app.

### Adding one by hand instead

1. Create `packages/<name>` (or `apps/<name>`) with its own `package.json` and a
   `tsconfig.json` that extends `../../tsconfig.base.json`.
2. Add it to the root `tsconfig.json` `references` array so `tsc -b` picks it up.
3. Run `pnpm install` to link the workspace.

`packages/api-contract`, `packages/ui-components`, `apps/web`, and `apps/server` are
working reference projects (build/typecheck/lint/test all pass out of the box) — copy one
as a starting point, or delete it once you've added real projects.

## File layout, components, and styling

Every `src/` in this repo — every app, every package, not just `apps/web` — puts tests in a
`__specs__/` subdirectory and stylesheets in a `styles/` subdirectory next to the file they
belong to, rather than colocating either one directly beside its source (`pnpm
lint:structure` enforces this). On top of that, `apps/web` and `packages/ui-components`
also share a components convention: every component gets its own directory under
`src/components/<name>/` — the component itself, a barrel `index.ts`, and those same
`__specs__/`/`styles/` subdirectories. Classes are prefixed `c-` (component) or `m-`
(modifier), enforced by `stylelint` (`pnpm lint:styles`) so a cross-component style override
is an obvious, lintable violation rather than something you'd only catch in review. See
"Components and styling (React apps)" in `AGENTS.md` for the full rules, and
`packages/ui-components`'s README for the extra constraints a _publishable_ component
package carries (no i18n, no env vars, `react`/`react-dom` as peer deps).
