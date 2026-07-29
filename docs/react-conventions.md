# React app conventions (`apps/web` and component packages)

## Components and styling

- **One directory per component.** `src/components/<name>/` holds everything for that
  component — the component itself and its `__specs__/`/`styles/` subdirectories per the
  file-layout rule (`docs/file-conventions.md`). No barrel `index.ts` here: nothing imports
  a component from outside its own directory, so there's no package-boundary reason to add
  one — import `./components/<name>/<name>.js` directly (see `docs/file-conventions.md`'s
  "Barrel files" section for where a barrel _is_ load-bearing). A component with distinct
  sub-parts can have its own further subdirectories under that same directory — keep the
  whole thing self-contained rather than spreading pieces across `src/`.
- No inline styles (`style={{...}}`) and no CSS-in-JS. Use **SCSS Modules** (`.module.scss`,
  not plain `.module.css` — `sass` is a devDependency of `apps/web` and any component
  package specifically so nesting/variables work).
- **Class naming**: every class is either a component class, prefixed `c-` (e.g. `c-button`,
  or `c-button-icon` for a sub-part), or a modifier, prefixed `m-` (e.g. `m-primary`),
  applied alongside a `c-` class rather than replacing it. Enforced by `stylelint`
  (`stylelint.config.mjs`'s `selector-class-pattern`) — a hard error, same severity as the
  ESLint rules below.
- **Modifiers nest under the component rule they modify** — `.c-button { &.m-primary { ... } }`,
  not `.c-button { ... }` and `.m-primary { ... }` as separate top-level rules. A modifier
  never applies on its own (the component always renders both classes together — see
  `packages/ui-components/src/components/button/button.tsx`), so the SCSS nesting should
  say that directly instead of leaving the pairing implicit.
- **A component's styles are its own.** Don't reach into another component's
  `.module.scss` or write a selector targeting another component's `c-`/`m-` class from
  outside that component's own file — CSS Modules' hashing already prevents accidental
  collisions, but the `c-`/`m-` naming makes a deliberate cross-component override
  obviously wrong in review, since a `.c-other-thing` rule has no reason to exist outside
  `other-thing`'s own module.
- Import the compiled module as `styles`, then resolve classes through `classNames` from
  `@project/ui-components` (see its doc comment for the full API) rather than bracket
  notation — `apps/web` depends on that package for exactly this reason, not just for its
  components.
- Shared/global styles (resets, tokens, layout shells) can live outside any single
  component's module, but anything component-specific stays in that component's own
  `.module.scss`.
- Enforced by `react/forbid-dom-props` (`eslint.config.mjs`, `apps/web/**` and
  `packages/ui-components/**`) — it's an `error`, not a warning, so it blocks commits/CI.
  Genuinely computed/dynamic styles are still possible via an explicit
  `// eslint-disable-next-line react/forbid-dom-props` comment on that line — the point is
  to make each exception visible in review, not to forbid inline styles outright.
- `pnpm lint:styles` runs `stylelint` across every `.css`/`.scss` file in the repo (also
  part of `pnpm lint` and `pnpm check`); `stylelint --fix` is wired into the Husky
  pre-commit hook via `lint-staged` the same way ESLint/Prettier are.

## Error reporting

Errors that reach an `ErrorBoundary` or a top-level catch should go through `reportError`
from `apps/web/src/service/report-error.ts` — never a raw `console.error` at the call site,
and never a global `console.error` override. The function currently just logs; swap its
internals for a real backend (Sentry, Bugsnag, your own endpoint) without touching any
caller. `error-boundary.tsx` is the reference usage — it calls
`reportError(error, { componentStack })` from `componentDidCatch`.

This lives in `apps/web` itself rather than a workspace package: it has exactly one
consumer (`apps/web`'s `ErrorBoundary`) and nothing crosses an app boundary, so a package
would just be `package.json`/`tsconfig.json`/build-step ceremony around one function. If
`apps/server` ever needs the same "single seam to swap the backend" property for its own
errors, that's a separate concern — it already has `logger` (`src/logger.ts`, `pino`) for
structured server-side logging, which isn't the same thing as reporting client-visible
errors to an external service.

## Localization

- No hardcoded user-facing text in JSX. Use `react-i18next`'s `useTranslation()` and
  `t('key')` — translation strings live in `src/locales/<lang>.json`, nested by feature
  (e.g. `{"app": {"title": "..."}}`).
- `src/i18n.ts` initializes `i18next` with the bundled locale JSON and must be imported
  once, before anything renders — it's the first import in `main.tsx` for that reason.
- Enforced by `i18next/no-literal-string` (`eslint.config.mjs`, `apps/web/**`,
  `jsx-text-only` mode — only text nodes between JSX tags are checked, not every JSX
  attribute value) — an `error`, not a warning. The same `// eslint-disable-next-line
i18next/no-literal-string` escape hatch applies for genuine exceptions (see
  `error-boundary.tsx`'s crash fallback, which deliberately avoids depending on i18next).
- Adding a language: add `src/locales/<lang>.json` with the same keys as `en.json`, then
  register it in `src/i18n.ts`'s `resources` object.

## Accessibility

`eslint-plugin-jsx-a11y`'s recommended rules are on for `apps/web/**` (missing `alt` text,
invalid ARIA attributes, non-interactive elements with click handlers, etc.). These are
real accessibility bugs, not style preferences — fix the markup rather than disabling the
rule.

## Testing

Component tests use `@testing-library/react` + `@testing-library/jest-dom` (see
`app.test.tsx`) — query by role/text the way a user would, not by implementation detail.
Vitest runs `apps/web/**` tests under the `jsdom` environment and everything else under
plain `node` (`vitest.config.ts`'s `environmentMatchGlobs`) — package-level tests don't
pay the jsdom startup cost.
