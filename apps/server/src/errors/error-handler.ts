import type { ErrorRequestHandler } from 'express'

import { logger } from '@/logger.js'

/**
 * Final Express error-handling middleware — mount it last in app.ts. Only
 * ever reached by hand-rolled routes/middleware outside the oRPC router
 * (e.g. `/spec.json`, or a future webhook/health-check route): oRPC's
 * `OpenAPIHandler` catches errors thrown inside `implement().handler()`
 * itself and formats its own consistent JSON error response, so it never
 * calls `next(err)` and this middleware never runs for it (confirmed by
 * reading its behavior directly — see docs/api-endpoints.md's "Error
 * handling" section). Throw `ORPCError` (from `@orpc/server`) inside a
 * route handler instead of relying on this for anything oRPC-implemented.
 *
 * Without this, an uncaught error in a hand-rolled route falls through to
 * Express's default error handler, which responds with an HTML page —
 * inconsistent with the rest of this JSON API.
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error({ err: error }, 'Unhandled error in a non-oRPC route')
  res.status(500).json({ error: 'Internal server error' })
}
