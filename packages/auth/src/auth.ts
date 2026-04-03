import db, { authSchema } from "@coco-kit/db";
import { email } from "@coco-kit/email";
import { getEnvVariable } from "@coco-kit/utils";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, admin, magicLink } from "better-auth/plugins";

export const trustedOrigins = getEnvVariable("BETTER_AUTH_TRUSTED_ORIGINS")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (trustedOrigins.length === 0) {
  throw new Error("Missing environment variable: BETTER_AUTH_TRUSTED_ORIGINS");
}

export const authBaseURL = getEnvVariable("BETTER_AUTH_BASE_URL");
const authSecret = getEnvVariable("BETTER_AUTH_SECRET");

export const auth = betterAuth({
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
  baseURL: authBaseURL,
  secret: authSecret,
  trustedOrigins,
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
