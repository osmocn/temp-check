import type { auth } from "./auth";

export type AuthSession = typeof auth.$Infer.Session;

export type AuthSessionUser = AuthSession["user"];

export type AuthSessionRecord = AuthSession["session"];
