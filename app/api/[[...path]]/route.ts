import admin from "@/lib/admin";
import auth from "@/lib/auth";
import type { AuthType } from "@/lib/services/auth-service";
import tools from "@/lib/tools";
import { protectAdminRouteMiddleware } from "@/middlewares/protect-admin-route";
import { protectRouteMiddleware } from "@/middlewares/protect-route";
import { loadSessionMiddleware } from "@/middlewares/session";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono<{
  Variables: AuthType;
}>().basePath("/api");

app.use("*", loadSessionMiddleware);
app.use("/tools/*", protectRouteMiddleware);
app.use("/admin/*", protectAdminRouteMiddleware);

const routes = app
  .route("/tools", tools)
  .route("/auth", auth)
  .route("/admin", admin);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type ApiRoutes = typeof routes;
