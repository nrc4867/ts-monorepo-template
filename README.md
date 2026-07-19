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

## Scaffolding a new package or app

```sh
pnpm gen
```

Runs `turbo gen`, which prompts for a generator and a name:

- **`package`** — a new library in `packages/<name>` (mirrors `packages/example`)
- **`app-server`** — a new Express + Zod backend in `apps/<name>` (mirrors `apps/server`)

You can also skip the generator picker: `pnpm gen package` or `pnpm gen app-server`.

Either one scaffolds the files, adds the new project to the root `tsconfig.json`
`references` array automatically, and reminds you to run `pnpm install` afterward to link
the new workspace member. The generator definitions live in `turbo/generators/config.ts`;
the files they copy are in `turbo/generators/templates/`.

There's no `app-web` generator yet, since most projects only need the one `apps/web` — add
one following the same pattern in `turbo/generators/config.ts` if you find yourself
needing a second frontend repeatedly.

### Adding one by hand instead

1. Create `packages/<name>` (or `apps/<name>`) with its own `package.json` and a
   `tsconfig.json` that extends `../../tsconfig.base.json`.
2. Add it to the root `tsconfig.json` `references` array so `tsc -b` picks it up.
3. Run `pnpm install` to link the workspace.

`packages/example`, `apps/web`, and `apps/server` are working reference projects
(build/typecheck/lint/test all pass out of the box) — copy one as a starting point, or
delete it once you've added real projects.
