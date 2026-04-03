import { trustedOrigins } from "./auth";

export type HeaderLookup = {
  get(name: string): string | null;
};

export function isSafeRelativeCallbackPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

export function isTrustedAbsoluteCallbackURL(value: string) {
  if (!URL.canParse(value)) {
    return false;
  }

  const url = new URL(value);

  return trustedOrigins.includes(url.origin);
}

export function normalizeTrustedCallbackURL(value: string) {
  const nextValue = value.trim();

  if (isSafeRelativeCallbackPath(nextValue)) {
    return nextValue;
  }

  if (isTrustedAbsoluteCallbackURL(nextValue)) {
    return new URL(nextValue).toString();
  }

  throw new Error("Callback URL must stay within the app.");
}

export function resolveTrustedCallbackURL(
  value: string | undefined,
  fallbackPath: string,
) {
  if (value === undefined) {
    return fallbackPath;
  }

  return normalizeTrustedCallbackURL(value);
}
