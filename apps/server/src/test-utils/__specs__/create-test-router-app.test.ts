import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { healthRouter } from '@/routes/health/health.js'
import { createTestRouterApp } from '@/test-utils/create-test-router-app.js'

describe('createTestRouterApp', () => {
  it('mounts the given router so its routes respond', async () => {
    const app = createTestRouterApp(healthRouter)

    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('falls through to a 404 for a path the router does not define', async () => {
    const app = createTestRouterApp(healthRouter)

    const response = await request(app).get('/not-a-real-route')

    expect(response.status).toBe(404)
  })
})
