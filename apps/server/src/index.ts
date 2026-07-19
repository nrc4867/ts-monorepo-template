import { createApp } from './app.js';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

createApp().listen(port, () => {
  // no-console only allows warn/error; this is the deliberate startup banner.
  console.warn(`Server listening on port ${port.toString()}`);
});
