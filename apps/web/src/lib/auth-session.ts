import type { AuthSessionResponse } from "@coco-kit/zod/schema";
import { authSessionResponseSchema } from "@coco-kit/zod/schema";
import { env } from "@/lib/env";

type GetAuthSessionOptions = {
  headers?: HeadersInit;
};

export async function getAuthSession(
  options: GetAuthSessionOptions = {},
): Promise<AuthSessionResponse> {
  const sessionURL = new URL(
    `${env.NEXT_PUBLIC_BASE_URL}/api/auth/get-session`,
  );
  sessionURL.searchParams.set("disableCookieCache", "true");

  const requestInit = {
    cache: "no-store" as const,
    ...(options.headers ? { headers: new Headers(options.headers) } : {}),
  };

  const response = await fetch(sessionURL, {
    ...requestInit,
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  const parsedSession = authSessionResponseSchema.safeParse(payload);

  return parsedSession.success ? parsedSession.data : null;
}
