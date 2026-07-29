import { OpenAPIGenerator } from '@orpc/openapi'
import { OpenAPIHandler } from '@orpc/openapi/node'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import express, { type Express } from 'express'

import { healthRouter } from './routes/health/health.js'

// Object keys here are purely organizational (they shape the generated
// client's call sites, e.g. `client.health()`) — they are NOT URL prefixes.
// Each route's actual path comes from its own contract's `.route({ path })`,
// so adding a new route here never changes any existing route's URL.
const router = {
  health: healthRouter,
}

const openApiGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
})

export function createApp(): Express {
  const app = express()
  const handler = new OpenAPIHandler(router)

  // Mounted at the root, not under a prefix like '/api' — every route's
  // path comes straight from its contract (see health.ts's `.route({ path
  // })`), so curl, API keys, and non-TS callers can hit plain REST paths.
  app.use(async (req, res, next) => {
    const { matched } = await handler.handle(req, res, { context: {} })
    if (!matched) next()
  })

  // Generated straight from the same contracts every route implements
  // against — never hand-maintained, so it can't drift from the real API.
  app.get('/spec.json', (_req, res, next) => {
    openApiGenerator
      .generate(router, { info: { title: '@project/server', version: '0.0.0' } })
      .then((spec) => {
        res.json(spec)
      })
      .catch(next)
  })

  return app
}
