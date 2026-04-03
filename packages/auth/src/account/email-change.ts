import { auth, getAuthBaseURL } from "../auth";
import {
  type HeaderLookup,
  resolveTrustedCallbackURL,
} from "../callback-url";
import { sendVerificationEmailToUser } from "../email-verification";
import type { AuthSessionUser } from "../types";

type AuthContext = Awaited<typeof auth.$context>;

type FreshSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

type AuthRequestHeaders = HeaderLookup;

type ChangeEmailSuccess = {
  currentEmail: string;
  emailVerified: boolean;
  pendingEmail: string | null;
  verificationEmailSent: boolean | null;
};

type ChangeEmailResult =
  | {
      kind: "error";
      message: string;
      statusCode: 400 | 500;
    }
  | {
      kind: "success";
      value: ChangeEmailSuccess;
    }
  | {
      kind: "unauthorized";
    };

type PendingEmailResult =
  | {
      kind: "success";
      value: {
        pendingEmail: string | null;
      };
    }
  | {
      kind: "unauthorized";
    };

type ParsedChangeEmailBody = {
  callbackURL?: string;
  newEmail: string;
  verificationCallbackURL?: string;
};

type ParsedConfirmEmailChangeQuery = {
  callbackURL?: string;
  token: string;
};

type ConfirmEmailChangePayload = {
  currentEmail: string;
  newEmail: string;
  userId: string;
  verificationCallbackURL?: string;
};

const EMAIL_VERIFICATION_EXPIRES_IN = 3600;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string) {
  return emailPattern.test(value);
}

function parseChangeEmailBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return {
      success: false as const,
      message: "Invalid request body.",
    };
  }

  const nextBody = body as Record<string, unknown>;
  const rawNewEmail = nextBody.newEmail;
  const rawCallbackURL = nextBody.callbackURL;
  const rawVerificationCallbackURL = nextBody.verificationCallbackURL;

  if (typeof rawNewEmail !== "string" || !isValidEmail(rawNewEmail.trim())) {
    return {
      success: false as const,
      message: "Enter a valid email address",
    };
  }

  if (rawCallbackURL !== undefined && typeof rawCallbackURL !== "string") {
    return {
      success: false as const,
      message: "Enter a valid callback URL",
    };
  }

  if (
    rawVerificationCallbackURL !== undefined &&
    typeof rawVerificationCallbackURL !== "string"
  ) {
    return {
      success: false as const,
      message: "Enter a valid verification callback URL",
    };
  }

  return {
    success: true as const,
    data: {
      newEmail: rawNewEmail.trim(),
      ...(rawCallbackURL !== undefined ? { callbackURL: rawCallbackURL } : {}),
      ...(rawVerificationCallbackURL !== undefined
        ? { verificationCallbackURL: rawVerificationCallbackURL }
        : {}),
    } satisfies ParsedChangeEmailBody,
  };
}

function parseConfirmEmailChangeQuery(query: unknown) {
  if (!query || typeof query !== "object") {
    return {
      success: false as const,
    };
  }

  const nextQuery = query as Record<string, unknown>;
  const rawToken = nextQuery.token;
  const rawCallbackURL = nextQuery.callbackURL;

  if (typeof rawToken !== "string" || rawToken.trim().length === 0) {
    return {
      success: false as const,
    };
  }

  if (rawCallbackURL !== undefined && typeof rawCallbackURL !== "string") {
    return {
      success: false as const,
    };
  }

  return {
    success: true as const,
    data: {
      token: rawToken.trim(),
      ...(rawCallbackURL !== undefined ? { callbackURL: rawCallbackURL } : {}),
    } satisfies ParsedConfirmEmailChangeQuery,
  };
}

function parseConfirmEmailChangePayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return {
      success: false as const,
    };
  }

  const nextPayload = payload as Record<string, unknown>;
  const currentEmail = nextPayload.currentEmail;
  const newEmail = nextPayload.newEmail;
  const userId = nextPayload.userId;
  const verificationCallbackURL = nextPayload.verificationCallbackURL;

  if (
    typeof userId !== "string" ||
    typeof currentEmail !== "string" ||
    typeof newEmail !== "string" ||
    !isValidEmail(currentEmail) ||
    !isValidEmail(newEmail) ||
    (verificationCallbackURL !== undefined &&
      typeof verificationCallbackURL !== "string")
  ) {
    return {
      success: false as const,
    };
  }

  return {
    success: true as const,
    data: {
      currentEmail,
      newEmail,
      userId,
      ...(verificationCallbackURL !== undefined
        ? { verificationCallbackURL }
        : {}),
    } satisfies ConfirmEmailChangePayload,
  };
}

function getPendingEmailChangeIdentifier(userId: string) {
  return `pending-email-change:${userId}`;
}

function getConfirmEmailChangeIdentifier(token: string) {
  return `confirm-email-change:${token}`;
}

function getDefaultCallbackURL() {
  return "/account";
}

function appendQueryParams(
  url: string,
  params: Record<string, string | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();

  if (!queryString) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function getFreshSession(headers: AuthRequestHeaders) {
  return auth.api.getSession({
    headers: headers as never,
    query: {
      disableCookieCache: true,
    },
  });
}

function getConfirmEmailChangeURL(token: string, callbackURL: string) {
  return `${getAuthBaseURL()}/api/account/confirm-email-change?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackURL)}`;
}

async function readPendingEmailChange(
  authContext: AuthContext,
  session: FreshSession,
) {
  const pendingEmailIdentifier = getPendingEmailChangeIdentifier(
    session.user.id,
  );
  const pendingEmailChange =
    await authContext.internalAdapter.findVerificationValue(
      pendingEmailIdentifier,
    );

  if (!pendingEmailChange) {
    return null;
  }

  if (pendingEmailChange.expiresAt < new Date()) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      pendingEmailIdentifier,
    );
    return null;
  }

  if (pendingEmailChange.value === session.user.email) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      pendingEmailIdentifier,
    );
    return null;
  }

  return pendingEmailChange.value;
}

export async function resolveEmailChangeConfirmationRedirectURL(params: {
  headers: AuthRequestHeaders;
  query: unknown;
}) {
  const parsedQuery = parseConfirmEmailChangeQuery(params.query);
  let callbackURL = getDefaultCallbackURL();

  try {
    callbackURL = resolveTrustedCallbackURL(
      parsedQuery.success ? parsedQuery.data.callbackURL : undefined,
      "/account",
    );
  } catch {
    callbackURL = getDefaultCallbackURL();
  }

  if (!parsedQuery.success) {
    return appendQueryParams(callbackURL, {
      emailChangeError: "invalid-link",
    });
  }

  const authContext = await auth.$context;
  const confirmationIdentifier = getConfirmEmailChangeIdentifier(
    parsedQuery.data.token,
  );
  const confirmation =
    await authContext.internalAdapter.findVerificationValue(
      confirmationIdentifier,
    );

  if (!confirmation || confirmation.expiresAt < new Date()) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      confirmationIdentifier,
    );

    return appendQueryParams(callbackURL, {
      emailChangeError: "invalid-link",
    });
  }

  let confirmationPayload: unknown = null;

  try {
    confirmationPayload = JSON.parse(confirmation.value ?? "null");
  } catch {
    confirmationPayload = null;
  }

  const parsedPayload = parseConfirmEmailChangePayload(confirmationPayload);

  if (!parsedPayload.success) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      confirmationIdentifier,
    );

    return appendQueryParams(callbackURL, {
      emailChangeError: "invalid-link",
    });
  }

  const { currentEmail, newEmail, userId, verificationCallbackURL } =
    parsedPayload.data;
  const currentUser = await authContext.internalAdapter.findUserById(userId);

  if (!currentUser || currentUser.email !== currentEmail) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      confirmationIdentifier,
    );

    return appendQueryParams(callbackURL, {
      emailChangeError: "invalid-link",
    });
  }

  const pendingEmailIdentifier = getPendingEmailChangeIdentifier(userId);
  const pendingEmailChange =
    await authContext.internalAdapter.findVerificationValue(
      pendingEmailIdentifier,
    );

  if (!pendingEmailChange || pendingEmailChange.value !== newEmail) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      confirmationIdentifier,
    );

    return appendQueryParams(callbackURL, {
      emailChangeError: "stale-request",
    });
  }

  const currentSession = await getFreshSession(params.headers);

  if (currentSession && currentSession.user.id !== userId) {
    return appendQueryParams(callbackURL, {
      emailChangeError: "invalid-session",
    });
  }

  const existingUser = await authContext.internalAdapter.findUserByEmail(
    newEmail,
  );

  if (existingUser && existingUser.user.id !== userId) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      confirmationIdentifier,
    );
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      pendingEmailIdentifier,
    );

    return appendQueryParams(callbackURL, {
      emailChangeError: "email-in-use",
    });
  }

  const updatedUser = await authContext.internalAdapter.updateUserByEmail(
    currentEmail,
    {
      email: newEmail,
      emailVerified: false,
    },
  );

  await authContext.internalAdapter.deleteVerificationByIdentifier(
    confirmationIdentifier,
  );
  await authContext.internalAdapter.deleteVerificationByIdentifier(
    pendingEmailIdentifier,
  );

  const verificationEmailResult = await sendVerificationEmailToUser({
    authContext,
    callbackURL: resolveTrustedCallbackURL(
      verificationCallbackURL ?? callbackURL,
      "/email-verification?status=success",
    ),
    user: updatedUser as unknown as AuthSessionUser,
  });

  return appendQueryParams(callbackURL, {
    emailChanged: "1",
    verificationEmailSent:
      verificationEmailResult.kind === "success" ? "1" : "0",
  });
}

export async function getPendingEmailChangeState(params: {
  headers: AuthRequestHeaders;
}): Promise<PendingEmailResult> {
  const freshSession = await getFreshSession(params.headers);

  if (!freshSession) {
    return {
      kind: "unauthorized",
    };
  }

  const authContext = await auth.$context;
  const pendingEmail = await readPendingEmailChange(authContext, freshSession);

  return {
    kind: "success",
    value: { pendingEmail },
  };
}

export async function changeAccountEmail(params: {
  body: unknown;
  headers: AuthRequestHeaders;
}): Promise<ChangeEmailResult> {
  const parsedBody = parseChangeEmailBody(params.body);

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

  const authContext = await auth.$context;
  const changeEmailOptions = authContext.options.user?.changeEmail;
  const newEmail = parsedBody.data.newEmail.toLowerCase();
  const pendingEmailIdentifier = getPendingEmailChangeIdentifier(
    freshSession.user.id,
  );

  if (!changeEmailOptions?.enabled) {
    return {
      kind: "error",
      message: "Change email is disabled.",
      statusCode: 400,
    };
  }

  let resolvedCallbackURL: string;
  let resolvedVerificationCallbackURL: string;

  try {
    resolvedCallbackURL = resolveTrustedCallbackURL(
      parsedBody.data.callbackURL,
      "/account",
    );
    resolvedVerificationCallbackURL = resolveTrustedCallbackURL(
      parsedBody.data.verificationCallbackURL ?? parsedBody.data.callbackURL,
      "/email-verification?status=success",
    );
  } catch (error) {
    return {
      kind: "error",
      message: getErrorMessage(error, "Callback URL must stay within the app."),
      statusCode: 400,
    };
  }

  if (newEmail === freshSession.user.email.toLowerCase()) {
    return {
      kind: "error",
      message: "Email is the same.",
      statusCode: 400,
    };
  }

  const existingUser = await authContext.internalAdapter.findUserByEmail(
    newEmail,
  );

  if (existingUser) {
    return {
      kind: "error",
      message: "Email already in use.",
      statusCode: 400,
    };
  }

  if (freshSession.user.emailVerified) {
    if (!changeEmailOptions.sendChangeEmailConfirmation) {
      return {
        kind: "error",
        message: "Email change confirmation is not configured.",
        statusCode: 400,
      };
    }

    const confirmationToken = crypto.randomUUID();
    const confirmationIdentifier = getConfirmEmailChangeIdentifier(
      confirmationToken,
    );
    const confirmationURL = getConfirmEmailChangeURL(
      confirmationToken,
      resolvedCallbackURL,
    );

    try {
      await authContext.internalAdapter.createVerificationValue({
        identifier: confirmationIdentifier,
        value: JSON.stringify({
          userId: freshSession.user.id,
          currentEmail: freshSession.user.email,
          newEmail,
          verificationCallbackURL: resolvedVerificationCallbackURL,
        }),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_IN * 1000),
      });
      await authContext.internalAdapter.deleteVerificationByIdentifier(
        pendingEmailIdentifier,
      );
      await authContext.internalAdapter.createVerificationValue({
        identifier: pendingEmailIdentifier,
        value: newEmail,
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_IN * 1000),
      });
      await changeEmailOptions.sendChangeEmailConfirmation({
        user: freshSession.user,
        newEmail,
        url: confirmationURL,
        token: confirmationToken,
      });
    } catch (error) {
      await authContext.internalAdapter.deleteVerificationByIdentifier(
        confirmationIdentifier,
      );
      await authContext.internalAdapter.deleteVerificationByIdentifier(
        pendingEmailIdentifier,
      );

      const message = getErrorMessage(
        error,
        "Failed to send the email change confirmation.",
      );

      authContext.logger.error(message);

      return {
        kind: "error",
        message,
        statusCode: 500,
      };
    }

    return {
      kind: "success",
      value: {
        currentEmail: freshSession.user.email,
        emailVerified: true,
        pendingEmail: newEmail,
        verificationEmailSent: null,
      },
    };
  }

  const updatedUser = await authContext.internalAdapter.updateUserByEmail(
    freshSession.user.email,
    {
      email: newEmail,
      emailVerified: false,
    },
  );
  const verificationEmailResult = await sendVerificationEmailToUser({
    authContext,
    callbackURL: resolvedVerificationCallbackURL,
    user: updatedUser as unknown as AuthSessionUser,
  });

  await authContext.internalAdapter.deleteVerificationByIdentifier(
    pendingEmailIdentifier,
  );

  return {
    kind: "success",
    value: {
      currentEmail: newEmail,
      emailVerified: false,
      pendingEmail: null,
      verificationEmailSent: verificationEmailResult.kind === "success",
    },
  };
}
