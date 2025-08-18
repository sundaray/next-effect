import { Hono } from "hono";
import { handle } from "hono/vercel";
import tools from "@/lib/tools";
import auth from "@/lib/auth";
import { authMiddleware } from "@/lib/middleware/auth";
import { sessionMiddleware } from "@/lib/middleware/session";
import type { AuthType } from "@/lib/services/auth-service";

const app = new Hono<{
  Variables: AuthType;
}>().basePath("/api");

app.use("*", sessionMiddleware);
app.use("/tools/*", authMiddleware);
app.route("/tools", tools);

app.get("/session", async (ctx) => {
  const session = ctx.get("session");
  const user = ctx.get("user");

  if (!session && !user) {
    return ctx.json({ user: null, session: null }, 401);
  }

  return ctx.json({ user, session });
});

app.route("/auth", auth);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
