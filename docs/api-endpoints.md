# API endpoints (`packages/api-contract` + oRPC)

Every endpoint between `apps/web` and `apps/server` is defined **once**, as an oRPC
contract in `packages/api-contract`, and both sides work directly off that same object —
never redefine a path, method, or response shape separately on either side. The contract
is the single source of truth, so a route that drifts from what the client expects is a
compile error, not a runtime surprise. See `packages/api-contract/src/health.ts`
(contract), `apps/server/src/routes/health/health.ts` (server implementation), and
`apps/web/src/service/health-client.ts` (client) for the reference trio — every new
endpoint follows this same three-file shape.

1. **Define the contract** in `packages/api-contract/src/<name>.ts`: a Zod schema for the
   response (and request body/params, if any) plus an `oc.route({ method, path })...`
   contract object built from it. This file must stay framework-free — no `express`,
   no `@orpc/server`/`@orpc/client` imports — so neither app depends on the other.
   Re-export it from that package's `index.ts`.
2. **Implement it** in its own directory, `apps/server/src/routes/<name>/<name>.ts` —
   one route per directory, the same shape as `apps/web/src/components/<name>/` (see
   `docs/react-conventions.md`), with the route's own test in that directory's
   `__specs__/` per the usual file-layout rule. Export the implemented router:
   `implement(contract).handler(({ input }) => ...)`. `apps/server/src/app.ts` stays a
   thin composer — it imports each route's exported router and merges them into one
   plain object (`{ health: healthRouter, ... }`), then mounts that object with a single
   `OpenAPIHandler` (not `RPCHandler` — `OpenAPIHandler` is what keeps every route a
   normal REST path, so `curl`, Postman, and any non-TS or API-key caller see exactly
   what they'd expect; `RPCHandler` is batched-RPC-shaped and not REST). The object keys
   used to merge routes are purely organizational — they shape the generated client's
   call sites, not the URL — so adding a route never changes another route's path.
3. **Consume it** from `apps/web/src/service/<name>-client.ts` via
   `createApiClient(contract)` (`apps/web/src/service/api-client.ts` — the one place that
   wires up `OpenAPILink`/`createORPCClient`/the base URL; don't hand-roll another
   `OpenAPILink` per client file). The generated client function is already fully typed
   against the contract.

`createApiClient` wires every client with `ResponseValidationPlugin` (`@orpc/contract/plugins`),
so every response is re-validated against the contract's output schema at runtime, not just
typed at compile time — a response that doesn't match throws instead of silently passing
through a misbehaving or out-of-sync server. `@orpc/contract/plugins` also has a
`RequestValidationPlugin` (validates what the client is about to send against the input
schema before it goes over the wire) — not wired in by default, add it to
`createApiClient`'s `plugins` array if that's useful.

**Free bonus, not extra work**: every app that mounts routes this way automatically gets a
live, always-accurate OpenAPI document — wire up a `GET /spec.json` route (see
`apps/server/src/app.ts`) using `@orpc/openapi`'s `OpenAPIGenerator` against the same
implemented router. It's generated from the real contract every time, so it can't drift
from the actual API the way a hand-maintained Swagger file can.

## Database access (once a project adds a database)

This template doesn't include a database or ORM — that's a per-project decision (see
sibling projects cloned from this template for examples of what they each picked). When
one is added:

- **Prefer parameterized-query tooling by default** — a query builder or ORM that makes
  raw string-concatenated SQL structurally awkward to reach for (e.g. Drizzle, Kysely,
  Prisma) rather than a bare driver where queries are hand-assembled strings. If a bare
  driver is genuinely the right call, use its parameterized placeholders
  (`$1`/`?`-style) for every value that comes from a request — never template/concatenate
  user input directly into a query string, including for things that feel like "just an
  identifier" (table/column names from user input still need an allowlist, not
  interpolation).
- **Add a CI static-analysis scan** — CodeQL (native to GitHub Actions, no external
  account or secrets needed for a public repo) or Semgrep (`p/security-audit`) both
  detect the "tainted string flows into a query-execution call" pattern generically,
  regardless of which driver/ORM ends up chosen, so this can be wired in independently
  of the database decision above. Neither is set up in this template today — do it as
  part of adding the database, not as an afterthought.
