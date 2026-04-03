# packages/zod

## Scope

- `src/helpers/base-schema.ts` — foundational primitives (id, timestamps).
- `src/helpers/common.ts` — shared field validators (email, password, slug).
- `src/helpers/safe-nanoid.ts` — `slugNanoid` generator.
- `src/schemas/*` — domain schemas built from helpers.

## Working Rules

- Build on `base-schema.ts` helpers; never duplicate timestamp or ID field
  definitions.
- Export TypeScript types for every public schema (`z.infer<typeof fooSchema>`).
- Keep schemas free of side effects, framework code, and I/O.
- Re-export new schemas from `src/schemas/index.ts`.
