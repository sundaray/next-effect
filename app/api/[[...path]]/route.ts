import { Hono } from "hono";
import { handle } from "hono/vercel";
import tools from "@/lib/tools";
import auth from "@/lib/auth";
import { protectRouteMiddleware } from "@/middlewares/protect-route";
import { loadSessionMiddleware } from "@/middlewares/session";
import type { AuthType } from "@/lib/services/auth-service";

const app = new Hono<{
  Variables: AuthType;
}>().basePath("/api");

app.use("*", loadSessionMiddleware);
app.use("/tools/*", protectRouteMiddleware);

const routes = app.route("/tools", tools).route("/auth", auth);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type ApiRoutes = typeof routes;
