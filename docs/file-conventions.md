# File conventions

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

## File layout: tests and styles

Every `src/` in this repo (every app, every package — no exceptions) puts tests in a
`__specs__/` subdirectory and stylesheets in a `styles/` subdirectory, next to the file they
belong to, rather than colocating either one directly beside its source file:

```
src/service/health-client.ts
src/service/__specs__/health-client.test.ts

src/components/app/app.tsx
src/components/app/__specs__/app.test.tsx
src/components/app/styles/app.module.scss
```

Import with a relative path (`../health-client.js` from the test, `./styles/app.module.scss`
from the component). This is a repo-wide, uniform rule, not a components-only special case
— one convention, applied identically everywhere, is what keeps any two packages navigable
the same way and makes a misplaced file an obvious mistake rather than a judgment call.
**Enforced** by `scripts/check-file-layout.mjs` (`pnpm lint:structure`, part of `pnpm
lint`/`pnpm check`), which walks every `apps/*/src` and `packages/*/src` and fails the build
on any `*.test.ts(x)` or `*.module.scss` that isn't inside its required subdirectory —
ESLint can't express "this file must live in that folder" for non-JS files (`.scss` isn't
even linted), hence a small standalone script instead of a lint rule.

## Barrel files

`packages/*/src/index.ts` is a required barrel, not a style choice — each package's
`package.json` points `main`/`types` at `dist/index.js`/`dist/index.d.ts`, so it's the
actual module resolution entry point for anything importing `@project/<name>`. Keep it
thin: re-exports only, no logic, so it stays cheap to resolve and doesn't hide circular
dependencies.

Don't add a barrel anywhere else "for consistency." A directory only needs one if
something outside it needs a single import path into it — e.g. a package's public API.
`src/components/<name>/` doesn't qualify (nothing imports a component from outside its
own directory), which is why those don't have one — see `docs/react-conventions.md`.

## Code organization

- One component, class, or logical module per file.
- Extract into its own file when: a function is (or could be) used in more than one
  place; a file exceeds ~250-300 lines; a section has a distinct responsibility from the
  rest of the file; a value is hardcoded in more than one place (→ a constants file); a
  type/interface is used in more than one file (→ a types file).
- Within a package or app's `src/`, group by responsibility as the need arises rather than
  one flat directory of files. Don't pre-create empty folders for these; add them when the
  first file that belongs there shows up. This is guidance for picking a consistent name,
  not an enforced rule (nothing lints directory names) — a couple of loosely-related files
  aren't worth relocating over:
  - `hooks/` — custom React hooks (`apps/web` and any component package).
  - `service/` — modules that talk to an external API/webservice (see
    `apps/web/src/service/health-client.ts` for the reference example).
  - `utils/` — generic, pure helper functions with no external side effects (parsing,
    formatting, that kind of thing).
  - `constants/` / `types/` — shared constants and shared types, respectively.
  - `lib/` — anything domain-specific that doesn't fit one of the more specific names above.
- Search the existing `hooks/`/`service/`/`utils`/`lib/` in that package before writing a
  new helper — add to what's there instead of inlining a one-off in a feature file.
- No magic numbers or repeated string literals in logic — pull them into a constants file
  with named exports.
- Don't extract an abstraction for a single use site "for later." Three similar lines is
  better than a premature shared helper with one caller.
