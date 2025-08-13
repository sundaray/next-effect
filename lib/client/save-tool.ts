import { ok, err, Result, ResultAsync, safeTry } from "neverthrow";
import { saveToolPayload } from "@/lib/schema";

class NetworkError extends Error {
  readonly _tag = "NetworkError" as const;
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

class ResponseBodyParseError extends Error {
  readonly _tag = "ResponseBodyParseError" as const;
  constructor(message: string) {
    super(message);
    this.name = "ResponseBodyParseError";
  }
}

type SaveToolErrorUnion = SaveToolError | NetworkError | ResponseBodyParseError;

export async function saveTool(
  params: saveToolPayload
): Promise<Result<void, SaveToolErrorUnion>> {
  const result = await safeTry(async function* () {
    const response = yield* ResultAsync.fromPromise(
      fetch("/api/tools/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }),
      () =>
        new NetworkError("Please check your internet connection and try again.")
    );

    const data = yield* ResultAsync.fromPromise(
      response.json(),
      () =>
        new ResponseBodyParseError(
          "Failed to parse response body. Please try again."
        )
    );

    if (!response.ok) {
      return err(data as SaveToolErrorUnion);
    }

    return ok(data as undefined);
  });

  return result;
}
