import "server-only";

import { Effect, Option } from "effect";
import { AuthService } from "@/lib/services/auth-service";
import { serverRuntime } from "@/lib/server-runtime";

export async function getUser(headers: Headers) {
  const program = Effect.gen(function* () {
    const auth = yield* AuthService;

    const sessionOption = yield* Effect.option(
      Effect.tryPromise(() => auth.api.getSession({ headers }))
    );

    const userOption = sessionOption.pipe(
      Option.flatMap((sessionOption) =>
        Option.fromNullable(sessionOption?.user)
      )
    );

    const user = Option.getOrNull(userOption);

    return user;
  });

  return await serverRuntime.runPromise(program);
}
