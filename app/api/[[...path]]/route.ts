import { Hono } from "hono";
import { handle } from "hono/vercel";
import tools from "@/lib/tools";
import auth from "@/lib/auth";
import { authMiddleware } from "@/lib/middleware/auth";
import type { AuthType } from "@/lib/services/auth-service";

const app = new Hono<{
  Variables: AuthType;
}>().basePath("/api");

app.use("/tools/*", authMiddleware);
app.route("/tools", tools);
app.route("/auth", auth);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
