# Auth Package Instructions

These instructions apply to `packages/auth` and override broader repo guidance
when they are more specific.

## Architecture

- Keep `src/auth.ts` as the single server-side Better Auth bootstrap and
  configuration entrypoint.
- Keep `src/index.ts` as the public package entry and re-export only the auth
  surface that consumers should depend on.
- Keep this package focused on wiring Better Auth plugins, trusted origins,
  environment-backed settings, and the Drizzle adapter.
- Keep app-specific route registration, request handling, and framework glue in
  the consuming app, not in this package.

## Configuration

- Read required secrets and URLs through shared env helpers from
  `@coco-kit/utils` when possible.
- Parse `BETTER_AUTH_TRUSTED_ORIGINS` in one place and treat it as the single
  source of truth for trusted-origin configuration.
- Fail fast for missing required auth configuration instead of silently falling
  back to insecure defaults.

## Boundaries

- Reuse auth tables and database setup from `@coco-kit/db`; do not duplicate
  schema or connection logic here.
- Keep plugin registration close to the `betterAuth(...)` configuration so the
  exported auth instance stays easy to audit.
- Do not add browser-only code, UI concerns, or app-specific business logic to
  this package.

## Imports

- Prefer relative imports for local files and workspace package imports for
  shared packages.
- Keep new public exports routed through `src/index.ts` so consumers have a
  stable entrypoint.
