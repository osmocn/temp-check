import db, { authSchema } from "@coco-kit/db";
import { email } from "@coco-kit/email";
import { getEnvVariable } from "@coco-kit/utils";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, admin, magicLink } from "better-auth/plugins";

function parseTrustedOrigins(value: string) {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getTrustedOrigins() {
  const trustedOrigins = parseTrustedOrigins(
    getEnvVariable("BETTER_AUTH_TRUSTED_ORIGINS"),
  );

  if (trustedOrigins.length === 0) {
    throw new Error("Missing environment variable: BETTER_AUTH_TRUSTED_ORIGINS");
  }

  return trustedOrigins;
}

export function getAuthBaseURL() {
  return getEnvVariable("BETTER_AUTH_BASE_URL");
}

function getAuthSecret() {
  return getEnvVariable("BETTER_AUTH_SECRET");
}

function createAuth() {
  return betterAuth({
    advanced: {
      database: {
        generateId: () => {
          return crypto.randomUUID();
        },
      },
    },
    plugins: [
      openAPI(),
      admin(),
      magicLink({
        // emails
        sendMagicLink: async ({ email: to, url }) => {
          await email.sendMagicLink(to, { url });
        },
      }),
    ],
    basePath: "/api/auth",
    baseURL: getAuthBaseURL(),
    secret: getAuthSecret(),
    trustedOrigins: getTrustedOrigins(),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: authSchema.user,
        account: authSchema.account,
        session: authSchema.session,
        verification: authSchema.verification,
      },
    }),
    user: {
      changeEmail: {
        enabled: true,

        // emails
        sendChangeEmailConfirmation: async ({ user, url, newEmail }) => {
          await email.sendEmailChange(user.email, {
            name: user.name,
            newEmail,
            url,
          });
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,

      // emails
      sendResetPassword: async ({ url, user }) => {
        await email.sendPasswordReset(user.email, { name: user.name, url });
      },
      onPasswordReset: async ({ user }) => {
        await email.sendPasswordResetSuccess(user.email, { name: user.name });
      },
    },
    emailVerification: {
      autoSignInAfterVerification: true,
      sendOnSignUp: false,

      // emails
      sendVerificationEmail: async ({ url, user }) => {
        await email.sendVerifyEmail(user.email, { name: user.name, url });
      },
      afterEmailVerification: async ({ name, email: userEmail }) => {
        await email.sendEmailVerified(userEmail, { name, email: userEmail });
      },
    },
  });
}

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | undefined;

export function getAuth(): AuthInstance {
  if (!authInstance) {
    authInstance = createAuth();
  }

  return authInstance;
}

export const auth = new Proxy({} as AuthInstance, {
  get(_target, prop) {
    const authInstance = getAuth();
    const value = Reflect.get(authInstance, prop);

    return typeof value === "function" ? value.bind(authInstance) : value;
  },
});
