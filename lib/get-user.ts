import "server-only";

import { headers } from "next/headers";
import { Effect, Data, pipe } from "effect";
import { AuthService } from "@/lib/services/auth-service";
import { serverRuntime } from "@/lib/server-runtime";

class UserSessionNotFoundError extends Data.TaggedError(
  "UserSessionNotFoundError"
)<{
  operation: string;
  message: string;
}> {}

export async function getUser() {
  const requestHeaders = await headers();

  const program = Effect.gen(function* () {
    const auth = yield* AuthService;

    const session = yield* Effect.tryPromise({
      try: () => auth.api.getSession({ headers: requestHeaders }),
      catch: () =>
        new UserSessionNotFoundError({
          operation: "getSession",
          message: "No active usrer session found.",
        }),
    });

    return session?.user;
  });

  const handledProgram = pipe(
    program,
    Effect.catchTag("UserSessionNotFoundError", (error) =>
      Effect.logError("UserSessionNotFoundError: ", error)
    ),
    Effect.ensureErrorType<never>()
  );

  return await serverRuntime.runPromise(handledProgram);
}
