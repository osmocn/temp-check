export function getEmailVerificationCallbackURL(nextPath = "/account") {
  const url = new URL("https://callback.local/email-verification");

  url.searchParams.set("status", "success");
  url.searchParams.set("next", nextPath);

  return `${url.pathname}${url.search}`;
}
