# @project/api-contract

Zod schemas (and their inferred types) shared between `apps/web` and `apps/server` — the
single source of truth for any request/response shape that crosses the network boundary.

`apps/server` parses outgoing responses through these schemas (fail fast if a handler ever
drifts from its own contract); `apps/web` imports the same schema's inferred type to type a
fetch response, so both sides can never silently disagree about a DTO's shape.

Add a new endpoint's contract as `src/<name>.ts` (schema + `z.infer` type), re-export it from
`src/index.ts`, and import `{ theSchema, TheType }` from `@project/api-contract` on both
sides instead of redefining the shape twice.
