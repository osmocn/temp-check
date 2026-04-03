import auth, {
  changeAccountEmail,
  getPendingEmailChangeState,
  resolveEmailChangeConfirmationRedirectURL,
  sendCurrentUserVerificationEmail,
} from "@coco-kit/auth";
import { Hono } from "hono";
import type { ApiAuthEnv } from "../lib/auth-env";
import { requireAuth } from "../lib/require-auth-middleware";

export const accountRouter = new Hono<ApiAuthEnv>()
  .get("/confirm-email-change", async (c) => {
    const redirectURL = await resolveEmailChangeConfirmationRedirectURL({
      headers: c.req.raw.headers,
      query: c.req.query(),
    });

    return c.redirect(redirectURL);
  })
  .get("/pending-email", requireAuth, async (c) => {
    const result = await getPendingEmailChangeState({
      headers: c.req.raw.headers,
    });

    if (result.kind === "unauthorized") {
      return c.body(null, 401);
    }

    return c.json(result.value, 200);
  })
  .post("/change-email", requireAuth, async (c) => {
    const result = await changeAccountEmail({
      body: await c.req.json().catch(() => null),
      headers: c.req.raw.headers,
    });

    if (result.kind === "unauthorized") {
      return c.body(null, 401);
    }

    if (result.kind === "error") {
      return c.json({ message: result.message }, result.statusCode);
    }

    return c.json(
      {
        status: true,
        ...result.value,
      },
      200,
    );
  })
  .post("/send-verification-email", requireAuth, async (c) => {
    const result = await sendCurrentUserVerificationEmail({
      body: await c.req.json().catch(() => null),
      headers: c.req.raw.headers,
    });

    if (result.kind === "unauthorized") {
      return c.body(null, 401);
    }

    if (result.kind === "error") {
      return c.json({ message: result.message }, result.statusCode);
    }

    return c.json({ status: true }, 200);
  })
  .post("/set-password", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => null);
    const newPassword =
      body && typeof body === "object" && typeof body.newPassword === "string"
        ? body.newPassword
        : null;

    if (!newPassword || newPassword.length < 8) {
      return c.json({ message: "Password must be at least 8 characters." }, 400);
    }

    try {
      await auth.api.setPassword({
        body: { newPassword },
        headers: c.req.raw.headers,
      });
    } catch (error) {
      return c.json(
        { message: error instanceof Error ? error.message : "Failed to set password." },
        500,
      );
    }

    return c.json({ status: true }, 200);
  });
