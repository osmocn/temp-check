import auth from "@coco-kit/auth";
import { Hono } from "hono";
import type { ApiAuthVariables } from "../lib/auth-env";
import { normalizeAuthHandlerRequest } from "../lib/normalize-auth-handler-request";
import { accountRouter } from "./account";

const app = new Hono<{ Variables: ApiAuthVariables }>().basePath("/api");

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  return next();
});

export const routes = app
  .route("/account", accountRouter)
  .on(["POST", "GET"], "/auth/*", async (c) => {
    try {
      const request = await normalizeAuthHandlerRequest(c.req.raw);
      return auth.handler(request);
    } catch (error) {
      return c.json(
        {
          error: "Invalid Callback URL",
          message:
            error instanceof Error
              ? error.message
              : "Callback URL must stay within the app.",
        },
        400,
      );
    }
  });

export type RoutesType = typeof routes;
