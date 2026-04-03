# packages/ui

## Scope

- `src/components/ui/*` contains shared UI primitives.
- `src/lib/*` contains small reusable helpers such as `cn`.
- `globals.css` owns shared tokens and theme variable wiring.

## Working Rules

- Keep components generic, accessible, and free of app-specific behavior.
- Prefer named exports and the existing Radix/CVA composition patterns.
- Use the public `@coco-kit/ui/*` subpaths and keep `package.json` exports in
  sync with new public modules.
- Keep theme tokens namespaced with `--ui-*` and preserve `components.json`
  compatibility for shadcn generation.
