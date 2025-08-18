import { Hono } from "hono";
import { handle } from "hono/vercel";
import tools from "@/lib/tools";
import user from "@/lib/user";
import auth from "@/lib/auth";
import { protectRouteMiddleware } from "@/lib/middleware/protect-route";
import { sessionMiddleware } from "@/lib/middleware/session";
import type { AuthType } from "@/lib/services/auth-service";

const app = new Hono<{
  Variables: AuthType;
}>().basePath("/api");

app.use("*", sessionMiddleware);
app.use("/tools/*", protectRouteMiddleware);
app.route("/tools", tools);
app.route("/user", user);
app.route("/auth", auth);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
