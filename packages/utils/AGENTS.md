These instructions apply only inside `packages/utils` and supplement the
repo-root `AGENTS.md`.

## Utils Package Overview

- Minimal shared utilities consumed by all other packages and apps.
- `src/get-env.ts` — `getEnvVariable` helper; throws if the requested env key
  is absent or empty.
- `src/index.ts` — public entrypoint; re-exports everything from sub-modules.

## Conventions

- Keep utilities generic and dependency-free — no framework imports, no logic
  that belongs in a domain package.
- `getEnvVariable` is the canonical way to read required env vars across the
  monorepo; prefer it over direct `process.env[key]` reads.
- Add new helpers as separate files under `src/` and re-export from
  `src/index.ts`.
- This package has no build step — consumers import source files directly via
  the workspace.
