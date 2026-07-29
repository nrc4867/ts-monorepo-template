import { OpenAPIHandler } from '@orpc/openapi/node'
import express, { type Express } from 'express'

// Derived from OpenAPIHandler's own constructor param rather than naming an
// '@orpc/server' router type directly, so this stays correct against
// whatever oRPC actually expects even if that type gets renamed upstream.
type Router = ConstructorParameters<typeof OpenAPIHandler>[0]

/**
 * Mounts a single implemented oRPC router behind a bare Express app, the
 * same wiring every route's own test file (and app.ts itself) would
 * otherwise repeat by hand. Use in a route-level test to exercise just that
 * route in isolation; use `createApp()` (`@/app.js`) instead for a test that
 * needs the full app (all routes, `/spec.json`, error handling).
 */
export function createTestRouterApp(router: Router): Express {
  const handler = new OpenAPIHandler(router)
  const app = express()

  app.use(async (req, res, next) => {
    const { matched } = await handler.handle(req, res, { context: {} })
    if (!matched) next()
  })

  return app
}
