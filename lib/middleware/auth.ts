import { createMiddleware } from "hono/factory";
import type { Next, Context } from "hono";
import { Effect, Data, pipe, Predicate } from "effect";
import { AuthService, AuthType } from "@/lib/services/auth-service";
import { serverRuntime } from "@/lib/server-runtime";

class UserSessionError extends Data.TaggedError("UserSessionError")<{
  message: string;
}> {}

type MiddlewareContext = Context<{
  Variables: AuthType;
}>;

export async function authHandler(ctx: MiddlewareContext, next: Next) {
  const program = Effect.gen(function* () {
    const auth = yield* AuthService;

    const session = Effect.tryPromise({
      try: () => auth.api.getSession({ headers: ctx.req.raw.headers }),
      catch: () =>
        new UserSessionError({ message: "No active users session found." }),
    }).pipe(
      Effect.tapErrorTag("UserSessionError", (error) =>
        Effect.logError("UserSessionError: ", error)
      ),
      Effect.filterOrFail(
        Predicate.isNotNull,
        () =>
          new UserSessionError({ message: "No active users session found." })
      )
    );

    return yield* session;
  });

  const handledProgram = pipe(
    program,
    Effect.flatMap((session) =>
      Effect.promise(async () => {
        ctx.set("user", session.user);
        ctx.set("session", session.session);
        await next();
      })
    ),
    Effect.catchTag("UserSessionError", () =>
      Effect.succeed(
        ctx.json(
          {
            error: "Unathorized",
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
