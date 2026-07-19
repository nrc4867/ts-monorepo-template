# @project/server

Minimal Express + Zod + TypeScript backend. `src/app.ts` exports `createApp()` (an Express
app factory, not bound to a port) so it's testable directly with `supertest` — see
`app.test.ts`. `src/index.ts` is the actual entry point that binds to `PORT` (default 3000).

- `pnpm --filter @project/server dev` — run with `tsx watch` (no build step)
- `pnpm --filter @project/server build` — typecheck (`tsc -b`) and emit to `dist`
- `pnpm --filter @project/server start` — run the built output
