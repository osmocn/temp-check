# UI Package Instructions

These instructions apply to `packages/ui` and override broader repo guidance
when they are more specific.

## Architecture

- Keep `src/components/ui/*` for shared, app-agnostic UI primitives.
- Keep `src/lib/*` for small reusable presentation helpers such as class name
  composition.
- Keep `globals.css` as the package-owned source of namespaced design tokens
  and shared theme wiring.
- Keep `components.json` aligned with the package structure so `shadcn:add`
  continues to generate files into the right locations.

## Components

- Prefer composable, accessible primitives over app-specific feature
  components.
- Do not add data fetching, routing, mutations, or product-specific copy to
  this package.
- Preserve keyboard, focus, disabled, and ARIA behavior when changing shared
  controls.
- Prefer named exports and the existing `cva` and Radix `Slot` patterns when
  extending primitives.

## Styling And Exports

- Keep CSS custom properties namespaced with the `--ui-*` prefix.
- Import shared UI modules through the package's public subpaths such as
  `@coco-kit/ui/lib/utils` when composing exported primitives.
- Keep `package.json` exports and `components.json` aliases in sync with new
  public modules.
- Keep styles and components friendly to apps that consume this package through
  `transpilePackages`.
