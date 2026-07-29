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
- `pnpm check` — the full CI gate (format:check, lint, typecheck, build, test), runnable
  locally before pushing
- `pnpm check:fast` — the same gate minus `build`, for quicker local/agent iteration (see
  `docs/tooling.md`'s "CI" section) — not a substitute for `pnpm check` before pushing
- `pnpm dev` — long-running dev tasks across packages

## Further reading

Detailed conventions live under `docs/`, one topic per file — read the ones relevant to
the task at hand rather than all of them:

- [`docs/adding-a-package.md`](docs/adding-a-package.md) — steps to scaffold a new
  `apps/*` or `packages/*` workspace member.
- [`docs/file-conventions.md`](docs/file-conventions.md) — filenames, where tests/styles
  live (`__specs__/`, `styles/`), barrel files, and when/how to split a file into more
  than one.
- [`docs/react-conventions.md`](docs/react-conventions.md) — component directory
  structure, SCSS Modules + `c-`/`m-` class naming, error reporting, localization,
  accessibility, and component testing. Relevant to `apps/web` and any component package.
- [`docs/api-endpoints.md`](docs/api-endpoints.md) — the oRPC contract-first pattern
  shared between `apps/web` and `apps/server` (`packages/api-contract`), plus a reminder
  about database access security once a project adds one. Relevant to any task touching
  a request/response shape between the two apps.
- [`docs/ui-components-package.md`](docs/ui-components-package.md) — the extra
  constraints on `packages/ui-components` specifically (no i18n, no env vars, peer-dep
  React) so it stays publishable.
- [`docs/tooling.md`](docs/tooling.md) — logging conventions, CI, environment variables,
  path aliases, dependency version ceilings, and other things worth knowing before
  editing.
- [`docs/new-project-reminders.md`](docs/new-project-reminders.md) — decisions a new
  project cloned from this template should make explicitly early on (auth, database,
  rate limiting, deployment topology, and more) rather than leaving implicit.
