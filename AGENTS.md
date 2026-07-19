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
