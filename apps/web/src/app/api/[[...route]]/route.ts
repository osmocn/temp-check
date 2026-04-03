import { handle } from "hono/vercel";
import { routes } from "./../_routes/index";

export const GET = handle(routes);
export const POST = handle(routes);
export const PUT = handle(routes);
export const PATCH = handle(routes);
export const DELETE = handle(routes);
