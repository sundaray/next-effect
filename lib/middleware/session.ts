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
import { Effect, Data, pipe, Option } from "effect";
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

export async function loadSessionHandler(ctx: MiddlewareContext, next: Next) {
  const program = Effect.gen(function* () {
    const auth = yield* AuthService;

    const sessionOption = yield* Effect.option(
      Effect.tryPromise(() =>
        auth.api.getSession({ headers: ctx.req.raw.headers })
      )
    );

    const session = sessionOption.pipe(Option.flatMap(Option.fromNullable));

    return session;
  });

  const handledProgram = pipe(
    program,
    Effect.flatMap((session) =>
      pipe(
        session,
        Option.match({
          onSome: (session) =>
            Effect.sync(() => {
              ctx.set("user", session.user);
              ctx.set("session", session.session);
            }),
          onNone: () =>
            Effect.sync(() => {
              ctx.set("user", null);
              ctx.set("session", null);
            }),
        })
      )
    ),
    Effect.flatMap(() => Effect.promise(() => next()))
  );

  return await serverRuntime.runPromise(handledProgram);
}

export const loadSessionMiddleware = createMiddleware(loadSessionHandler);
