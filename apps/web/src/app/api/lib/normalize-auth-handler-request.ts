import { normalizeTrustedCallbackURL } from "@coco-kit/auth";

const redirectFieldNames = [
  "callbackURL",
  "errorCallbackURL",
  "newUserCallbackURL",
  "redirectTo",
] as const;

function normalizeRedirectFields(payload: Record<string, unknown>) {
  let changed = false;

  for (const fieldName of redirectFieldNames) {
    const value = payload[fieldName];

    if (value === undefined) {
      continue;
    }

    if (typeof value !== "string") {
      throw new Error(`${fieldName} must be a string.`);
    }

    payload[fieldName] = normalizeTrustedCallbackURL(value);
    changed = true;
  }

  return changed;
}

function createNormalizedRequest(
  request: Request,
  url: URL,
  init: {
    body?: BodyInit | null;
    headers: HeadersInit;
  },
) {
  const headers = new Headers(init.headers);
  headers.delete("content-length");

  const nextInit: RequestInit = {
    method: request.method,
    headers,
  };

  if (init.body !== undefined) {
    nextInit.body = init.body;
  }

  return new Request(url, nextInit);
}

async function cloneRequestBody(request: Request) {
  if (request.body === null) {
    return null;
  }

  const body = await request.clone().arrayBuffer();
  return new Uint8Array(body);
}

export async function normalizeAuthHandlerRequest(request: Request) {
  const headers = request.headers;
  const url = new URL(request.url);
  let queryChanged = false;

  for (const fieldName of redirectFieldNames) {
    const value = url.searchParams.get(fieldName);

    if (value === null) {
      continue;
    }

    url.searchParams.set(fieldName, normalizeTrustedCallbackURL(value));
    queryChanged = true;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    return queryChanged
      ? createNormalizedRequest(request, url, { headers })
      : request;
  }

  const contentType = headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = await request.clone().json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      return queryChanged
        ? createNormalizedRequest(request, url, {
            body: await cloneRequestBody(request),
            headers,
          })
        : request;
    }

    const nextPayload = { ...(payload as Record<string, unknown>) };
    const bodyChanged = normalizeRedirectFields(nextPayload);

    if (!queryChanged && !bodyChanged) {
      return request;
    }

    return createNormalizedRequest(request, url, {
      body: JSON.stringify(nextPayload),
      headers,
    });
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const payload = new URLSearchParams(await request.clone().text());
    let bodyChanged = false;

    for (const fieldName of redirectFieldNames) {
      const value = payload.get(fieldName);

      if (value === null) {
        continue;
      }

      payload.set(fieldName, normalizeTrustedCallbackURL(value));
      bodyChanged = true;
    }

    if (!queryChanged && !bodyChanged) {
      return request;
    }

    return createNormalizedRequest(request, url, {
      body: payload.toString(),
      headers,
    });
  }

  return queryChanged
    ? createNormalizedRequest(request, url, {
        body: await cloneRequestBody(request),
        headers,
      })
    : request;
}
