// -----------------------------------------------
//
//  Session Loader Middleware
//
//  This middleware checks for a user session on
//  incoming requests. If a session is found, it
//  populates the context object (ctx). If no
//  session is found, it allows the request to
//  continue without error.
//
// -----------------------------------------------

import { createMiddleware } from "hono/factory";
import type { Next, Context } from "hono";
import { Effect, Data, pipe } from "effect";
import { AuthService, AuthType } from "@/lib/services/auth-service";
import { serverRuntime } from "@/lib/server-runtime";

export class UserSessionNotFoundError extends Data.TaggedError(
  "UserSessionNotFoundError"
)<{
  message: string;
}> {}

type MiddlewareContext = Context<{
  Variables: AuthType;
}>;

export async function sessionHandler(ctx: MiddlewareContext, next: Next) {
  const program = Effect.gen(function* () {
    const auth = yield* AuthService;

    const session = yield* Effect.tryPromise({
      try: () => auth.api.getSession({ headers: ctx.req.raw.headers }),
      catch: () =>
        new UserSessionNotFoundError({
          message: "No active user session found.",
        }),
    });

    if (!session) {
      return yield* Effect.fail(
        new UserSessionNotFoundError({
          message: "No active user session found.",
        })
      );
    }

    return session;
  });

  const handledProgram = pipe(
    program,
    // SUCCESS PATH: A session was found.
    Effect.flatMap((session) =>
      Effect.promise(async () => {
        ctx.set("user", session.user);
        ctx.set("session", session.session);
        await next();
      })
    ),
    Effect.catchTag("UserSessionNotFoundError", () =>
      // ERROR PATH: Allow the request to proceed.
      Effect.promise(async () => await next())
    )
  );

  return await serverRuntime.runPromise(handledProgram);
}

export const sessionMiddleware = createMiddleware(sessionHandler);
