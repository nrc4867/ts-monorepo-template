import { createApp } from './app.js';
import { env } from './env.js';

createApp().listen(env.PORT, () => {
  // no-console only allows warn/error; this is the deliberate startup banner.
  console.warn(`Server listening on port ${env.PORT.toString()}`);
});
