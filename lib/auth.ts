import { serverRuntime } from "@/lib/server-runtime";
import type { AuthType } from "@/lib/services/auth-service";
import { AuthService } from "@/lib/services/auth-service";
import { Effect } from "effect";
import { Hono } from "hono";

const app = new Hono<{ Variables: AuthType }>();

app.on(["GET", "POST"], "/*", async (ctx) => {
  const program = Effect.gen(function* () {
    const auth = yield* AuthService;
    return auth.handler(ctx.req.raw);
  });

  return await serverRuntime.runPromise(program);
});

export default app;
