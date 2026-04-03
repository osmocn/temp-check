import { hc } from "hono/client";
import type { RoutesType } from "@/app/api/_routes/index";
import { env } from "@/lib/env";

export const apiClient = hc<RoutesType>(env.NEXT_PUBLIC_BASE_URL, {
  init: {
    credentials: "include",
  },
});
