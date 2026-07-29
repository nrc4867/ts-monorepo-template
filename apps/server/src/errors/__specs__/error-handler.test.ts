import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'

import { errorHandler } from '@/errors/error-handler.js'
import { logger } from '@/logger.js'

describe('errorHandler', () => {
  it('responds with a consistent JSON error shape and logs the error', async () => {
    const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
    const app = express()
    app.get('/boom', () => {
      throw new Error('kaboom')
    })
    app.use(errorHandler)

    const response = await request(app).get('/boom')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: 'Internal server error' })
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1)
    const [logPayload, logMessage] = loggerErrorSpy.mock.calls[0] ?? []
    expect(logMessage).toBe('Unhandled error in a non-oRPC route')
    expect((logPayload as { err?: unknown } | undefined)?.err).toBeInstanceOf(Error)

    loggerErrorSpy.mockRestore()
  })

  it('never leaks the original error message to the response', async () => {
    const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
    const app = express()
    app.get('/boom', () => {
      throw new Error('sensitive internal detail')
    })
    app.use(errorHandler)

    const response = await request(app).get('/boom')

    expect(JSON.stringify(response.body)).not.toContain('sensitive internal detail')

    loggerErrorSpy.mockRestore()
  })
})
