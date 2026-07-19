import { healthResponseSchema } from '@project/api-contract';
import express, { type Express } from 'express';

export function createApp(): Express {
  const app = express();

  app.get('/health', (_req, res) => {
    res.json(healthResponseSchema.parse({ status: 'ok' }));
  });

  return app;
}
