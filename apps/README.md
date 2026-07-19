# apps/

Deployable applications (web frontend, API server, CLI, etc.). Apps may depend on
`packages/*` via `workspace:*` dependencies; packages should not depend on apps.

Each app needs:

- `package.json` with `build` / `dev` / `typecheck` / `lint` / `clean` scripts
- `tsconfig.json` extending `../../tsconfig.base.json`
- an entry in the root `tsconfig.json`'s `references` array

If an app is a React app under `apps/web`, ESLint's React/hooks rules
(`eslint.config.mjs`) apply automatically — no extra setup needed.
