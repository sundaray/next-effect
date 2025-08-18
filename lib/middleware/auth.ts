import { createMiddleware } from "hono/factory";
import type { Next, Context } from "hono";
import { Effect, Data, pipe, Predicate } from "effect";
import { AuthType } from "@/lib/services/auth-service";
import { serverRuntime } from "@/lib/server-runtime";

export class UserSessionError extends Data.TaggedError("UserSessionError")<{
  message: string;
}> {}

type MiddlewareContext = Context<{
  Variables: AuthType;
}>;

export async function authHandler(ctx: MiddlewareContext, next: Next) {
  const program = Effect.succeed(ctx.get("user"));

  const handledProgram = pipe(
    program,
    Effect.filterOrFail(
      Predicate.isNotNull,
      () => new UserSessionError({ message: "Authentication required." })
    ),
    Effect.flatMap(() =>
      Effect.promise(async () => {
        await next();
      })
    ),
    Effect.tapErrorTag("UserSessionError", (error) =>
      Effect.logError("UserSessionError: ", error)
    ),
    Effect.catchTag("UserSessionError", (error) =>
      Effect.succeed(
        ctx.json(
          {
            _tag: "UserSessionError",
            message: error.message,
          },
          { status: 401 }
        )
      )
    ),
    Effect.ensureErrorType<never>()
  );

  return await serverRuntime.runPromise(handledProgram);
}

export const authMiddleware = createMiddleware(authHandler);
