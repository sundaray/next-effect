import "server-only";

import { serverRuntime } from "@/lib/server-runtime";
import { AuthService, type SessionPayload } from "@/lib/services/auth-service";
import { Effect, Option } from "effect";

export async function getSession(headers: Headers): Promise<SessionPayload> {
  const program = Effect.gen(function* () {
    const auth = yield* AuthService;

    const sessionPayload = yield* Effect.option(
      Effect.tryPromise(() => auth.api.getSession({ headers })),
    );

    return Option.getOrNull(sessionPayload);
  });

  return await serverRuntime.runPromise(program);
}
