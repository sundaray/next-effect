import type { Next, Context } from "hono";
import { Effect, Data, Config, pipe } from "effect";
import { AuthService } from "@/lib/services/auth-service";
import { serverRuntime } from "@/lib/server-runtime";

class UserSessionError extends Data.TaggedError("UserSessionError")<{
  message: string;
}> {}

export async function authHandler(ctx: Context, next: Next) {
  const program = Effect.gen(function* () {
    const auth = yield* AuthService;

    const session = Effect.tryPromise({
      try: () => auth.api.getSession({ headers: ctx.req.raw.headers }),
      catch: () =>
        new UserSessionError({ message: "Failed to get user session." }),
    }).pipe(
      Effect.tapErrorTag("UserSessionError", (error) => Effect.logError(error))
    );

    return yield* session;
  });

  const handledProgram = pipe(
    program,
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
