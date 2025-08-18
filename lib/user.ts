import { Hono } from "hono";
import type { AuthType } from "@/lib/services/auth-service";

const app = new Hono<{
  Variables: AuthType;
}>();

app.get("/user", (ctx) => {
  const currentUser = ctx.get("user");

  if (!currentUser) {
    return ctx.json({ user: null }, 401);
  }

  return ctx.json({ user: currentUser });
});

export default app;
