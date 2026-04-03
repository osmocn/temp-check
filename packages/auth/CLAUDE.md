# packages/auth

## Scope

- `src/auth.ts` owns Better Auth setup, trusted-origin parsing, plugin
  registration, and Drizzle adapter wiring.
- `src/index.ts` is the public entrypoint for consumers.

## Working Rules

- Keep this package server-only and framework-agnostic.
- Reuse `@coco-kit/db` and `@coco-kit/utils` instead of duplicating schema or
  env parsing.
- Fail fast when required auth env is missing.
- Put route mounting and request-framework glue in consuming apps, not here.
