# coco-kit

A full-stack starter monorepo for building modern web products with a clear
foundation, shared boundaries, and room to grow.

## What This Starter Is For

`coco-kit` is meant to give you a serious starting point for a new product
without forcing you to spend the first few days wiring everything together.

It is designed for teams and solo builders who want a project that already has
separation between product surfaces, shared code, and backend concerns, so the
early work can stay focused on the actual product.

## What You Get

- A main web app you can shape into the customer-facing product
- A separate API app for backend and server-side concerns
- A docs app for product docs, guides, or internal reference material
- A shared UI package for reusable components and design primitives
- A shared database package with a layered DAL and controller structure
- A workspace layout that is ready to grow with the project instead of fighting
  it later

## Starter Philosophy

- Keep app code inside apps and reusable logic inside packages
- Keep business logic separate from low-level data access
- Share what helps the product move faster, not everything by default
- Start with structure, but leave enough freedom for the product to evolve

## Project Shape

```text
apps/
  web   -> main product surface
  api   -> backend surface
  docs  -> documentation surface

packages/
  ui    -> shared UI building blocks
  db    -> shared database and data-layer package
```

## Getting Started

From the repository root:

```bash
pnpm install
pnpm dev
```

Useful workspace commands:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

You can also run individual apps:

```bash
pnpm dev:web
pnpm dev:api
pnpm dev:docs
```

## How To Use This Starter

1. Rename the product and package surfaces to match your project.
2. Decide what belongs in the product apps versus shared packages.
3. Keep shared layers clean as the product grows.
4. Remove anything you do not need instead of carrying starter code forever.

## Notes

- Workspace-wide tooling is configured at the repository root.
- App-specific details live in each app's own `README.md`.
- Repository contribution guidance lives in `AGENTS.md` and `CLAUDE.md`.
