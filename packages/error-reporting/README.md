# @project/error-reporting

Vendor-agnostic error reporting. `reportError(error, context)` is the single call site
every app should use — it currently just logs to `console.error`, but the whole point is
that callers don't need to change when you wire up a real backend (Sentry, Bugsnag, your
own endpoint) later. Edit `src/report-error.ts` in place when you pick one.

`apps/web`'s `ErrorBoundary` (`src/error-boundary.tsx`) calls this from
`componentDidCatch` with the component stack as context.
