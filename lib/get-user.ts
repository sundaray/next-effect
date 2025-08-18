import "server-only";

import { headers } from "next/headers";
import { Effect, Option } from "effect";
import { AuthService } from "@/lib/services/auth-service";
import { serverRuntime } from "@/lib/server-runtime";

export async function getUser() {
  const requestHeaders = await headers();

  const program = Effect.gen(function* () {
    const auth = yield* AuthService;

    const sessionOption = yield* Effect.option(
      Effect.tryPromise(() => auth.api.getSession({ headers: requestHeaders }))
    );

    const userOption = sessionOption.pipe(
      Option.flatMap((session) => Option.fromNullable(session?.user))
    );

    const user = Option.getOrNull(userOption);

    return user;
  });

  return await serverRuntime.runPromise(program);
}
