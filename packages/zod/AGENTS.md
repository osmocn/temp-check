These instructions apply only inside `packages/zod` and supplement the
repo-root `AGENTS.md`.

## Zod Package Overview

- Shared Zod schemas and validators consumed across apps and packages.
- `src/helpers/*` — reusable schema primitives and field helpers.
- `src/schemas/*` — domain-level schemas built from helpers.
- `src/schemas/index.ts` — re-exports all domain schemas.
- `src/index.ts` — top-level public entrypoint (currently empty; wire new
  exports through the appropriate index file).

## Structure

```
src/
├── index.ts               # Top-level public entrypoint
├── schemas/
│   ├── index.ts           # Re-exports all domain schemas
│   ├── auth-schema.ts     # Email/password auth input schemas
│   └── better-auth.ts     # Better Auth entity schemas
└── helpers/
    ├── index.ts           # Re-exports all helpers
    ├── base-schema.ts     # idSchema, timestamps, timestamp type helpers
    ├── common.ts          # emailSchema, passwordSchema, slugSchema
    └── safe-nanoid.ts     # slugNanoid generator
```

## Conventions

- Build new schemas from the primitives in `src/helpers/base-schema.ts` and
  `src/helpers/common.ts` — do not duplicate field definitions.
- Timestamp fields must use the typed helpers (`autoTimestamp`,
  `manualTimestamp`, `eventTimestamp`) — never use `z.string()` for dates.
- Export an inferred TypeScript type alongside every public schema
  (`export type Foo = z.infer<typeof fooSchema>`).
- Keep schemas plain Zod — no side effects, no framework imports, no I/O.
- Add new domain schemas in `src/schemas/<domain>.ts` and re-export from
  `src/schemas/index.ts`.
