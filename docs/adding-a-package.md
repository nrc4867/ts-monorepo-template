# Adding a package or app

1. Create `packages/<name>` (or `apps/<name>`) with a `package.json` (`build`/`typecheck`/
   `lint`/`clean` scripts matching `packages/api-contract`) and a `tsconfig.json` extending
   `../../tsconfig.base.json`.
2. Add `{ "path": "packages/<name>" }` to the root `tsconfig.json` `references` array.
3. Run `pnpm install` to link the new workspace member.
