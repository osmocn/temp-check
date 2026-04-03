These instructions apply only inside `apps/web` and supplement the repo-root
`AGENTS.md`.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.
<!-- END:nextjs-agent-rules -->

## Web App Conventions

- Keep this app on the shared workspace tooling:
  - `tsconfig.json` should extend `../../tsconfig.base.json`
  - linting and formatting should come from the repo-root `biome.json`
- Do not reintroduce `pnpm-lock.yaml`, `pnpm-workspace.yaml`, or `biome.json`
  inside `apps/web`.
- Prefer the App Router structure already used under `src/app`.
