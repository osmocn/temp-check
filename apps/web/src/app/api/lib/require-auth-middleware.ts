import { createMiddleware } from "hono/factory";
import type { ApiAuthEnv } from "./auth-env";

export const requireAuth = createMiddleware<ApiAuthEnv>(async (c, next) => {
  const session = c.get("session");
  const user = c.get("user");
  if (!user || !session) return c.body(null, 401);
  await next();
});
