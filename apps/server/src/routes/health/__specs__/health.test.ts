import { OpenAPIHandler } from '@orpc/openapi/node';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { healthRouter } from '../health.js';

describe('GET /health', () => {
  it('returns ok status', async () => {
    const handler = new OpenAPIHandler(healthRouter);
    const app = express();
    app.use(async (req, res, next) => {
      const { matched } = await handler.handle(req, res, { context: {} });
      if (!matched) next();
    });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
