# @project/ui-components

Presentational React components meant to be reusable outside this specific project —
eventually published to a registry, not just consumed via the workspace.

Hard constraints, enforced because a published package can't assume anything about the
app that installs it:

- **No `react-i18next` / `i18next`.** All user-facing text comes in via props/children;
  the consuming app supplies its own copy (translated or not). Import restrictions in
  `eslint.config.mjs` block importing `react-i18next`/`i18next` from this package.
- **No env vars.** Never read `process.env` or `import.meta.env` here — same
  `eslint.config.mjs` restriction applies. Configuration comes in via props.
- **`react`/`react-dom` are peer dependencies**, not regular dependencies — the consuming
  app supplies its own React, so this package never bundles a second copy.

Each component gets its own directory under `src/components/<name>/` — component, barrel
`index.ts`, a `__specs__/` subdirectory for its test, and a `styles/` subdirectory for its
`.module.scss` — same convention as `apps/web` (see AGENTS.md's "Components and styling").
Class names follow the repo-wide `c-`/`m-` convention (`stylelint.config.mjs`).

`tsc -b` doesn't know what to do with `.module.scss` files, so `scripts/copy-styles.mjs`
copies them into `dist/` after compilation as an extra `build` step — consumers resolve CSS
Modules by filename convention (`*.module.scss`) the same way whether the file lives in
`node_modules` or their own `src/`, so no compile step is needed here, only a copy.

`src/components/button/` is a working reference component — copy its shape for the next
one. `src/lib/class-names.ts` exports `classNames`, used by every component here (and by
`apps/web`, which depends on this package for it) to resolve a `styles` object's classes —
see its doc comment for the full API.
