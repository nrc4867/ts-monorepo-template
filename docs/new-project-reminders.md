# New project reminders

This template deliberately leaves several things undecided (see each package's README
and `docs/ui-components-package.md`/`docs/api-endpoints.md` for why) — a new project
cloned from it should make each of these an explicit decision early on, not something
that gets silently defaulted or discovered halfway through. None of these need to be
implemented on day one; they need to be _decided_ and written down (a comment, a
CLAUDE.md/AGENTS.md note, or a plan doc) so later work builds on a real answer instead of
an accidental one.

## Authentication & authorization

- **Is auth required at all?** A purely local single-user tool may not need it; anything
  reachable over a network by more than one person does.
- If yes: session-based (cookie), API keys (machine-to-machine), or both?
- Self-service signup, or admin-provisioned accounts only?
- Is the corpus/data shared across all users, or does each user need isolated data (row-
  level scoping, not just login)?
- `SameSite=Lax` cookies assume a same-origin SPA+API deployment — if web and server end
  up on different domains, revisit CSRF posture (see `docs/api-endpoints.md`'s wider
  security notes and add either `SameSite=Strict` + explicit CORS allowlist, or a CSRF
  token).

## Database

- Does this project need one at all? If not, skip this section — nothing in the template
  assumes a database exists.
- If yes: pick parameterized-query tooling by default (Drizzle, Kysely, Prisma, or a bare
  driver used only with parameterized placeholders) — see `docs/api-endpoints.md`'s
  "Database access" section for the full reasoning, including why table/column names from
  user input need an allowlist, not interpolation, even with a query builder.
- Add a CI static-analysis scan (CodeQL or Semgrep `p/security-audit`) for tainted-string-
  into-query patterns as part of adding the database, not as an afterthought.

## Rate limiting & abuse protection

- No rate limiting exists anywhere in the template. Fine behind a private network or for
  local-only use; add `express-rate-limit` (or equivalent) on `/auth/login` and any other
  public-facing endpoint before exposing this on the open internet.

## File uploads

- If the project accepts file uploads: decide max size and accepted MIME types up front
  (reject at the boundary, not deep in processing), and decide where files live (local
  disk under a gitignored data directory, object storage, etc.) before the first upload
  route is written.

## Background work

- Does anything here take long enough to need to run outside the request/response cycle
  (embedding a large document, sending email, processing a queue)? If so, decide the
  mechanism (in-process async + a status-polling endpoint, or a real job queue) before
  building the first long-running feature, since retrofitting it later usually means
  reshaping the API contract too.

## Deployment topology

- `docker-compose.yml` is for stateful local infra only (a database, if one is added) —
  apps run natively via `pnpm dev`, not in a container, per `AGENTS.md`. Decide the real
  deployment target (a PaaS, a VM, containers in production even though dev isn't
  containerized, etc.) before it's needed, since it affects env var handling, secrets
  management, and whether `SESSION_COOKIE_SECURE`-style flags default correctly.
- Are web and server actually going to be deployed same-origin (one domain, reverse-
  proxied) or split across two domains? This decides the CORS/CSRF question above.

## Environment variables & secrets

- Every new required var goes in that app's `env.ts` Zod schema (fail fast on missing/
  invalid, per `docs/tooling.md`) and its `.env.example` — keep both in sync as the
  project grows, not just at initial setup.
- Confirm no secret ever needs to reach `apps/web` — anything Vite exposes via `VITE_`-
  prefixed vars ships to the browser in plain text.

## Testing & coverage

- `test:coverage` is wired into CI as an informational PR comment with no threshold (see
  `docs/tooling.md`). Decide explicitly if this project wants a real coverage gate later,
  rather than assuming the informational default is a deliberate choice for every
  project.

## Dependency ceilings

- `docs/tooling.md` documents hard version ceilings on `typescript`/`eslint` as of when
  this template was last updated. Before bumping either, confirm `typescript-eslint`/
  `eslint-plugin-react`/`eslint-plugin-jsx-a11y` have actually caught up — check their
  current releases, don't assume the ceiling is stale just because it's old.
