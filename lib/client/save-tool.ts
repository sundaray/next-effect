import "client-only";
import { Effect } from "effect";
import { saveToolPayload } from "@/lib/schema";
import { InternalServerError, NetworkError } from "@/lib/client/errors";

export function saveTool(params: saveToolPayload) {
  return Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () =>
        fetch("/api/tools/save", {
          method: "POST",
          body: JSON.stringify(params),
        }),
      catch: (error) =>
        new NetworkError({
          message: "Please check your internet connection and try again.",
        }),
    });

    const result = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) => {
        console.error("Save tool client error: ", error);
        return new InternalServerError({
          message:
            "Tool submission failed due to a server error. Please try again.",
        });
      },
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new InternalServerError({ message: result.message })
      );
    }

    return result;
  });
}
