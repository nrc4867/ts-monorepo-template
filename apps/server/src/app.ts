import express, { type Express } from 'express';
import { z } from 'zod';

const healthResponseSchema = z.object({
  status: z.literal('ok'),
});

export function createApp(): Express {
  const app = express();

  app.get('/health', (_req, res) => {
    res.json(healthResponseSchema.parse({ status: 'ok' }));
  });

  return app;
}
