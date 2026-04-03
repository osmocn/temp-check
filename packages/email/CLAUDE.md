# packages/email

## Scope

- `src/senders/*` owns sender functions and is the public API surface.
- `src/templates/*` owns React Email components; not exported directly.
- `src/client.ts` holds the Resend singleton.
- `src/components/email-layout.tsx` is the shared email wrapper.

## Working Rules

- Always throw `EmailSendError` on Resend send failures — never silently fail.
- Keep templates presentational only; no business logic in template files.
- Sender functions are the only public API — consumers call `email.sendXxx()`.
- Reuse `@coco-kit/utils` `getEnvVariable` for all env access; never read
  `process.env` directly inside this package.
