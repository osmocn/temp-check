# packages/utils

## Scope

- `src/get-env.ts` — `getEnvVariable` helper (throws on missing/empty keys).
- `src/index.ts` — re-exports all public helpers.

## Working Rules

- Keep helpers generic, side-effect-free, and dependency-free where possible.
- Do not add domain-specific logic here — that belongs in the owning package.
- All new helpers must be re-exported from `src/index.ts`.
