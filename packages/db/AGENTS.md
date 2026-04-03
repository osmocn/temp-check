# DB Package Instructions

These instructions apply to `packages/db` and override broader repo guidance
when they are more specific.

## Architecture

- Keep `src/db.ts` focused on database bootstrap, connection reuse, and exported
  database types.
- Keep `src/dal/*` as a dumb data-access layer:
  - Read and write rows.
  - Express query helpers such as `getById`, `getByTitle`, `create`, `update`,
    and `delete`.
  - Do not add business rules, permission checks, duplicate checks, or
    framework-specific errors.
- Keep `src/controller/*` as the business-logic layer:
  - Validate and normalize input.
  - Enforce invariants such as uniqueness, required fields, and allowed
    transitions.
  - Compose one or more DAL calls.
  - Throw domain errors from `src/helpers/errors.ts`.

## Helpers

- Keep reusable schema helpers in `src/helpers/base-column.ts`.
- Keep shared table naming in `src/helpers/create-table.ts`.
- Keep framework-agnostic domain errors in `src/helpers/errors.ts`.
- Do not move controller logic into helpers just to avoid duplication. Prefer a
  small private function inside a controller unless the logic is reused by
  multiple controllers.

## Schema And Drizzle

- Put tables in `src/schema/*` and re-export them from `src/schema/index.ts`.
- Use `drizzle.config.ts` at the package root for kit commands.
- Keep Drizzle commands runnable from `packages/db` with:
  - `pnpm db:generate`
  - `pnpm db:migrate`
  - `pnpm db:studio`

## Imports

- Prefer relative imports inside this package. This package exports source
  files, so package-local TS path aliases can leak to consumers.
