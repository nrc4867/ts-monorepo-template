import { createApp } from './app.js';
import { env } from './env.js';
import { logger } from './logger.js';

createApp().listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT.toString()}`);
});
