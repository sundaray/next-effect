import { Hono } from "hono";
import type { AuthType } from "@/lib/services/auth-service";

const app = new Hono<{
  Variables: AuthType;
}>().get("/", (ctx) => {
  const currentUser = ctx.get("user");

  if (!currentUser) {
    return ctx.json({ user: null }, { status: 401 });
  }

  return ctx.json({ user: currentUser }, { status: 200 });
});

export default app;
