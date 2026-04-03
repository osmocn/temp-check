# Repo Instructions

These instructions apply to the whole repository unless a deeper `AGENTS.md`
overrides them.

## Workspace Rules

- This repository is a `pnpm` workspace powered by Turborepo.
- Run workspace-wide commands from the repo root.
- Prefer `pnpm dev`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` from the
  root when changes affect shared tooling or more than one package.
- Shared tooling lives at the root:
  - `biome.json`
  - `tsconfig.base.json`
  - `turbo.json`

## Monorepo Conventions

- Keep reusable code in `packages/*`.
- Keep app-specific code inside its owning app under `apps/*`.
- Do not add nested lockfiles or nested workspace manifests inside apps or
  packages.
- Do not add app-local Biome configs unless there is a strong, explicit reason.
- When adding or updating TypeScript configs, extend `tsconfig.base.json`
  instead of copying shared compiler options.

## App-Specific Overlays

- When working inside `apps/web`, also follow `apps/web/AGENTS.md`.
