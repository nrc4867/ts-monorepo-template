# Publishable common components (`packages/ui-components`)

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
  (see `docs/react-conventions.md`) — `src/components/button/` is the reference component.
- `tsc -b` doesn't copy `.module.scss` into `dist/`; `scripts/copy-styles.mjs` (a
  `fs.cpSync` copy, no bundler needed) runs as an extra `build` step for that reason.
