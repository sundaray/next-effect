import { Effect } from "effect";
import { Hono } from "hono";
import { serverRuntime } from "@/lib/server-runtime";
import { AuthService } from "@/lib/services/auth-service";
import type { AuthType } from "@/lib/services/auth-service";

const app = new Hono<{ Variables: AuthType }>();

app.on(["GET", "POST"], "/*", async (ctx) => {
  const program = Effect.gen(function* () {
    const auth = yield* AuthService;
    return auth.handler(ctx.req.raw);
  });

  return await serverRuntime.runPromise(program);
});




export default app;
