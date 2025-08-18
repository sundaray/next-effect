import { createMiddleware } from "hono/factory";
import type { Next, Context } from "hono";
import { Effect, Data, pipe, Predicate } from "effect";
import { AuthType } from "@/lib/services/auth-service";
import { serverRuntime } from "@/lib/server-runtime";

export class UserSessionNotFoundError extends Data.TaggedError(
  "UserSessionNotFoundError"
)<{
  message: string;
}> {}

type MiddlewareContext = Context<{
  Variables: AuthType;
}>;

// -----------------------------------------------
//
//  Authentication Guard Middleware
//
//  This middleware acts as a gatekeeper for routes that require
//  a user to be authenticated. Use this middleware to protect
//  any route or group of routes selectively.
//
//  It works by checking the Hono context for a user object.
//  It assumes an upstream middleware (like `sessionMiddleware`)
//  has already attempted to populate the context.
//
//  - If a user is found, the request is allowed to proceed.
//  - If no user is found, the request is blocked, and a
//    `401 Unauthorized` JSON error is returned to the client.
//
// -----------------------------------------------

export async function authHandler(ctx: MiddlewareContext, next: Next) {
  const program = Effect.succeed(ctx.get("user"));

  const handledProgram = pipe(
    program,
    Effect.filterOrFail(
      Predicate.isNotNull,
      () =>
        new UserSessionNotFoundError({ message: "Authentication required." })
    ),
    Effect.flatMap(() =>
      Effect.promise(async () => {
        await next();
      })
    ),
    Effect.tapErrorTag("UserSessionNotFoundError", (error) =>
      Effect.logError("UserSessionNotFoundError: ", error)
    ),
    Effect.catchTag("UserSessionNotFoundError", (error) =>
      Effect.succeed(
        ctx.json(
          {
            _tag: "UserSessionNotFoundError",
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
