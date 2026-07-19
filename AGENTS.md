# Repo conventions

pnpm workspace + Turborepo monorepo. Libraries live in `packages/*`, deployable apps in
`apps/*`. Each has its own `package.json` and a `tsconfig.json` that extends the root
`tsconfig.base.json`.

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

- `console.log`/`console.info`/`console.debug` are lint errors (`no-console`).
  `console.warn`/`console.error` are allowed.
- Import order/grouping is auto-fixed by `eslint-plugin-simple-import-sort` — don't
  hand-arrange imports; run `pnpm lint:fix` and let it sort them.

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
