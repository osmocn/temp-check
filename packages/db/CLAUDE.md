# packages/db

## Layering

- `src/db.ts` owns connection setup only.
- `src/dal/*` should stay dumb and query-focused.
- `src/controller/*` owns business logic and validation.
- `src/helpers/*` should contain reusable DB/domain helpers, not request flow.

## Working Rules

- If a change decides whether an operation is allowed, it belongs in a
  controller.
- If a change only fetches, inserts, updates, or deletes data, it belongs in
  the DAL.
- Prefer controller-thrown domain errors from `src/helpers/errors.ts` over
  framework-specific errors.
- Re-export schema from `src/schema/index.ts` and keep Drizzle config in
  `drizzle.config.ts`.
- Prefer relative imports inside this package because workspace consumers read
  the source files directly.
