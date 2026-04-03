import { auth } from "./auth";
export * from "./account/email-change";
export * from "./callback-url";
export * from "./email-verification";
export * from "./types";
export { createEmailVerificationToken } from "better-auth/api";

export default auth;
