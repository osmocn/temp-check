import { createEmailVerificationToken } from "better-auth/api";
import { auth } from "./auth";
import { type HeaderLookup, resolveTrustedCallbackURL } from "./callback-url";
import type { AuthSessionUser } from "./types";

type AuthContext = Awaited<typeof auth.$context>;

type AuthRequestHeaders = HeaderLookup;

type SendVerificationEmailResult =
  | {
      kind: "error";
      message: string;
      statusCode: 400 | 500;
    }
  | {
      kind: "success";
    }
  | {
      kind: "unauthorized";
    };

type ParsedSendVerificationEmailBody = {
  callbackURL?: string;
};

const EMAIL_VERIFICATION_EXPIRES_IN = 3600;

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function parseSendVerificationEmailBody(body: unknown) {
  if (body === null || body === undefined) {
    return {
      success: true as const,
      data: {} satisfies ParsedSendVerificationEmailBody,
    };
  }

  if (typeof body !== "object") {
    return {
      success: false as const,
      message: "Invalid request body.",
    };
  }

  const nextBody = body as Record<string, unknown>;
  const rawCallbackURL = nextBody.callbackURL;

  if (rawCallbackURL !== undefined && typeof rawCallbackURL !== "string") {
    return {
      success: false as const,
      message: "Enter a valid callback URL",
    };
  }

  return {
    success: true as const,
    data: {
      ...(rawCallbackURL !== undefined ? { callbackURL: rawCallbackURL } : {}),
    } satisfies ParsedSendVerificationEmailBody,
  };
}

async function getFreshSession(headers: AuthRequestHeaders) {
  return auth.api.getSession({
    headers: headers as never,
    query: {
      disableCookieCache: true,
    },
  });
}

function getVerifyEmailURL(
  authContext: AuthContext,
  token: string,
  callbackURL: string,
) {
  return `${authContext.baseURL}/verify-email?token=${token}&callbackURL=${encodeURIComponent(callbackURL)}`;
}

export async function sendVerificationEmailToUser(params: {
  authContext: AuthContext;
  callbackURL: string;
  user: AuthSessionUser;
}) {
  const { authContext, callbackURL, user } = params;
  const sendVerificationEmail =
    authContext.options.emailVerification?.sendVerificationEmail;

  if (!sendVerificationEmail) {
    return {
      kind: "error",
      message: "Email verification is disabled.",
      statusCode: 400,
    } satisfies SendVerificationEmailResult;
  }

  const token = await createEmailVerificationToken(
    authContext.secret,
    user.email,
    undefined,
    EMAIL_VERIFICATION_EXPIRES_IN,
  );
  const url = getVerifyEmailURL(authContext, token, callbackURL);

  try {
    await sendVerificationEmail({
      user,
      url,
      token,
    });

    return {
      kind: "success",
    } satisfies SendVerificationEmailResult;
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to send the verification email.",
    );

    authContext.logger.error(message);

    return {
      kind: "error",
      message,
      statusCode: 500,
    } satisfies SendVerificationEmailResult;
  }
}

export async function sendCurrentUserVerificationEmail(params: {
  body: unknown;
  headers: AuthRequestHeaders;
}): Promise<SendVerificationEmailResult> {
  const parsedBody = parseSendVerificationEmailBody(params.body);

  if (!parsedBody.success) {
    return {
      kind: "error",
      message: parsedBody.message,
      statusCode: 400,
    };
  }

  const freshSession = await getFreshSession(params.headers);

  if (!freshSession) {
    return {
      kind: "unauthorized",
    };
  }

  if (freshSession.user.emailVerified) {
    return {
      kind: "error",
      message: "Email is already verified.",
      statusCode: 400,
    };
  }

  let resolvedCallbackURL: string;

  try {
    resolvedCallbackURL = resolveTrustedCallbackURL(
      parsedBody.data.callbackURL,
      "/email-verification?status=success",
    );
  } catch (error) {
    return {
      kind: "error",
      message: getErrorMessage(error, "Callback URL must stay within the app."),
      statusCode: 400,
    };
  }

  const authContext = await auth.$context;

  return sendVerificationEmailToUser({
    authContext,
    callbackURL: resolvedCallbackURL,
    user: freshSession.user,
  });
}
