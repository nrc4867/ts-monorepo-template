# ts-monorepo-template

A pnpm + Turborepo TypeScript monorepo template with strict TS, ESLint (typescript-eslint, strict type-checked), Prettier, Husky + lint-staged, and Vitest pre-wired.

## Using this template

```sh
npx degit <your-org>/ts-monorepo-template new-project
cd new-project
pnpm install
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
- **Husky + lint-staged** — pre-commit hook runs `eslint --fix` + `prettier --write` on staged files
- **Vitest** (`vitest.config.ts`) — picks up `*.test.ts` under `apps/*/src` and `packages/*/src`
- **`.editorconfig`** / **`.gitattributes`** — consistent indentation and LF line endings
- **`.nvmrc`** — pins Node 20

## Adding a package or app

1. Create `packages/<name>` (or `apps/<name>`) with its own `package.json` and a
   `tsconfig.json` that extends `../../tsconfig.base.json`.
2. Add it to the root `tsconfig.json` `references` array so `tsc -b` picks it up.
3. Run `pnpm install` to link the workspace.

`packages/example` is a minimal reference package (build/typecheck/lint/test all pass out of
the box) — copy it as a starting point, or delete it once you've added real packages.
