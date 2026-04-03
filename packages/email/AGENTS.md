These instructions apply only inside `packages/email` and supplement the
repo-root `AGENTS.md`.

## Email Package Overview

- Sends transactional emails via **Resend**.
- `src/client.ts` — single Resend client instance (reads `RESEND_API_KEY`
  via `@coco-kit/utils`).
- `src/errors.ts` — `EmailSendError` domain error used by all senders.
- `src/senders/*` — one file per domain (e.g., `auth.ts`); each exports
  named async sender functions.
- `src/templates/*` — React Email components; one file per email type, grouped
  by domain subfolder.
- `src/components/*` — shared layout and presentation primitives.
- `src/index.ts` — public entrypoint; re-exports errors and senders, and
  assembles the `email` namespace object.

## Structure

```
src/
├── index.ts               # Public entrypoint — re-exports + `email` object
├── client.ts              # Resend singleton
├── errors.ts              # EmailSendError domain error
├── senders/
│   └── auth.ts            # Auth senders (verify, reset, magic-link, …)
├── templates/
│   └── auth/              # Auth React Email templates
└── components/
    └── email-layout.tsx   # Shared EmailLayout wrapper
```

## Conventions

- Each sender function throws `EmailSendError` on failure — never swallow
  Resend errors or return them as values.
- Templates live in `src/templates/<domain>/` and are **not** exported from
  the public entrypoint — only sender functions are public.
- `EmailLayout` is the only shared layout; style inline using the existing
  `satisfies Record<string, React.CSSProperties>` pattern.
- When adding a new email type: create the template, add a sender in the
  matching `src/senders/` file, and re-export from `src/index.ts`.
- Preview with `pnpm email:dev` (React Email dev server on port 4050).
- Keep this package server-only — no browser code, no routing, no auth logic.
