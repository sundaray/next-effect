import { Hono } from "hono";
import { handle } from "hono/vercel";
import tools from "@/lib/tools";
import user from "@/lib/user";
import auth from "@/lib/auth";
import { protectRouteMiddleware } from "@/lib/middleware/protect-route";
import { loadSessionMiddleware } from "@/lib/middleware/session";
import type { AuthType } from "@/lib/services/auth-service";

const app = new Hono<{
  Variables: AuthType;
}>().basePath("/api");

app.use("*", loadSessionMiddleware);
app.use("/tools/*", protectRouteMiddleware);

const routes = app
  .route("/tools", tools)
  .route("/user", user)
  .route("/auth", auth);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type ApiRoutes = typeof routes;
