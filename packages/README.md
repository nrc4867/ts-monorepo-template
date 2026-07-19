# packages/

Shared libraries — anything importable by more than one app, or that stands alone as a
publishable unit. No UI framework assumptions live here (React/hooks lint rules are scoped
to `apps/web/**` only, not `packages/*`).

Each package needs:

- `package.json` with `build` / `typecheck` / `lint` / `clean` scripts (copy
  `api-contract/`'s)
- `tsconfig.json` extending `../../tsconfig.base.json`
- an entry in the root `tsconfig.json`'s `references` array

`api-contract/` and `ui-components/` are working reference packages (build/typecheck/lint/test
all pass out of the box) — copy the one that's the closer shape for what you're adding:

- `api-contract/` — Zod schemas + inferred types shared between `apps/web` and
  `apps/server` for anything that crosses the network boundary between them.
- `ui-components/` — presentational React components meant to be reusable outside this
  project (no i18n/env dependencies, `react`/`react-dom` as peer deps) — see its README for
  the full constraints.
