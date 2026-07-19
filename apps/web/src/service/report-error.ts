export interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Single entry point for reporting errors that reach an ErrorBoundary or a
 * top-level catch. Swap the body below for a real backend (Sentry, Bugsnag,
 * your own endpoint) per project — everything that calls this stays the same.
 */
export function reportError(error: unknown, context?: ErrorContext): void {
  console.error(error, context);
}
