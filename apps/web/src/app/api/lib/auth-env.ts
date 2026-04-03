import type { AuthSessionRecord, AuthSessionUser } from "@coco-kit/auth";

export type ApiAuthVariables = {
  user: AuthSessionUser | null;
  session: AuthSessionRecord | null;
};

export type ApiAuthEnv = {
  Variables: ApiAuthVariables;
};
