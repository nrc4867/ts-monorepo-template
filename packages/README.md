# packages/

Shared libraries — anything importable by more than one app, or that stands alone as a
publishable unit. No UI framework assumptions live here (React/hooks lint rules are scoped
to `apps/web/**` only, not `packages/*`).

Each package needs:

- `package.json` with `build` / `typecheck` / `lint` / `clean` scripts (copy `example/`'s)
- `tsconfig.json` extending `../../tsconfig.base.json`
- an entry in the root `tsconfig.json`'s `references` array

`example/` is a minimal reference package (build/typecheck/lint/test all pass out of the
box) — copy it as a starting point, or delete it once real packages exist.
